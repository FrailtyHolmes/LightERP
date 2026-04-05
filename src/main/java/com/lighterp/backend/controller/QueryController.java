package com.lighterp.backend.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.lighterp.backend.common.BusinessException;
import com.lighterp.backend.common.CommonResult;
import com.lighterp.backend.common.PageResult;
import com.lighterp.backend.controller.response.CustomerReconciliationResponse;
import com.lighterp.backend.controller.response.SaleProductResponse;
import com.lighterp.backend.entity.*;
import com.lighterp.backend.mapper.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 查询模块
 */
@Slf4j
@RestController
@RequestMapping("/query")
@RequiredArgsConstructor
public class QueryController {

    private final SaleProductMapper saleProductMapper;
    private final SaleInvoiceMapper saleInvoiceMapper;
    private final CustomerPaymentMapper customerPaymentMapper;
    private final CustomerPenaltyMapper customerPenaltyMapper;
    private final CustomerInfoMapper customerInfoMapper;
    private final ProductInfoMapper productInfoMapper;

    /**
     * 出库产品记录查询
     */
    @GetMapping("/sale-product/list")
    public CommonResult<PageResult<SaleProductResponse>> listSaleProduct(
            @RequestParam(required = false) Long customerId,
            @RequestParam(required = false) Long productId,
            @RequestParam(required = false) Date invoiceTimeStart,
            @RequestParam(required = false) Date invoiceTimeEnd,
            @RequestParam(required = false) String operater,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer pageSize) {

        Page<SaleProduct> pageParam = new Page<>(page, pageSize);
        QueryWrapper<SaleProduct> wrapper = new QueryWrapper<>();

        if (customerId != null) {
            wrapper.eq("customer_id", customerId);
        }
        if (productId != null) {
            wrapper.eq("product_id", productId);
        }
        if (StringUtils.hasText(operater)) {
            wrapper.like("operater", operater);
        }

        // 需要联表查询出库发票的开票时间
        wrapper.orderByDesc("created_time");
        Page<SaleProduct> result = saleProductMapper.selectPage(pageParam, wrapper);

        // 填充产品信息
        Set<Long> productIds = result.getRecords().stream()
                .map(SaleProduct::getProductId).collect(Collectors.toSet());
        Map<Long, ProductInfo> productMap = new HashMap<>();
        if (!productIds.isEmpty()) {
            List<ProductInfo> products = productInfoMapper.selectBatchIds(productIds);
            productMap = products.stream().collect(Collectors.toMap(ProductInfo::getProductId, p -> p));
        }

        // 查询所有记录用于计算总金额（不分页）
        List<SaleProduct> allProducts = saleProductMapper.selectList(wrapper);
        BigDecimal totalMoney = allProducts.stream()
                .filter(p -> p.getProductMoney() != null)
                .map(SaleProduct::getProductMoney)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<SaleProductResponse> list = result.getRecords().stream().map(p -> {
            SaleProductResponse response = new SaleProductResponse();
            BeanUtils.copyProperties(p, response);
            ProductInfo product = productMap.get(p.getProductId());
            if (product != null) {
                response.setProductName(product.getProductName());
                response.setProductVolume(product.getProductVolume());
                response.setProductSize(product.getProductSize());
            }
            return response;
        }).collect(Collectors.toList());

        PageResult<SaleProductResponse> pageResult = PageResult.of(list, result.getTotal(), (int) result.getCurrent(), (int) result.getSize());
        // 设置总金额
        pageResult.setTotalMoney(totalMoney);

        return CommonResult.success(pageResult);
    }

    /**
     * 客户对账查询
     */
    @GetMapping("/reconciliation")
    public CommonResult<CustomerReconciliationResponse> reconciliation(
            @RequestParam Long customerId,
            @RequestParam(required = false) Date startDate,
            @RequestParam(required = false) Date endDate) {

        // 检查客户是否存在
        CustomerInfo customer = customerInfoMapper.selectById(customerId);
        if (customer == null) {
            throw new BusinessException("该客户未注册，请先注册");
        }

        CustomerReconciliationResponse response = new CustomerReconciliationResponse();
        response.setCustomerName(customer.getCustomerName());
        response.setCustomerAddress(customer.getCustomerAddress());

        // 查询发票记录
        QueryWrapper<SaleInvoice> invoiceWrapper = new QueryWrapper<>();
        invoiceWrapper.eq("customer_id", customerId);
        if (startDate != null) {
            invoiceWrapper.ge("invoice_time", startDate);
        }
        if (endDate != null) {
            invoiceWrapper.le("invoice_time", endDate);
        }
        List<SaleInvoice> invoices = saleInvoiceMapper.selectList(invoiceWrapper);

        BigDecimal invoiceTotalMoney = BigDecimal.ZERO;
        BigDecimal shippingFeeTotal = BigDecimal.ZERO;
        BigDecimal totalMoneyForCustomer = BigDecimal.ZERO;
        List<CustomerReconciliationResponse.InvoiceItem> invoiceItems = new ArrayList<>();

        for (SaleInvoice invoice : invoices) {
            BigDecimal shippingFee = invoice.getShippingFee() != null ? invoice.getShippingFee() : BigDecimal.ZERO;
            BigDecimal total = invoice.getTotalMoney() != null ? invoice.getTotalMoney() : BigDecimal.ZERO;

            invoiceTotalMoney = invoiceTotalMoney.add(total);
            if (invoice.getIsFreeShipping() != null && !invoice.getIsFreeShipping()) {
                shippingFeeTotal = shippingFeeTotal.add(shippingFee);
                totalMoneyForCustomer = totalMoneyForCustomer.add(total);
            } else {
                // 生产商付运费，不计入客户应付
                totalMoneyForCustomer = totalMoneyForCustomer.add(total.subtract(shippingFee));
            }

            CustomerReconciliationResponse.InvoiceItem item = new CustomerReconciliationResponse.InvoiceItem();
            item.setInvoiceId(invoice.getInvoiceId());
            item.setInvoiceMoney(total.subtract(shippingFee));
            item.setShippingFee(shippingFee);
            item.setIsFreeShipping(invoice.getIsFreeShipping());
            item.setTotalMoney(total);
            item.setInvoiceTime(invoice.getInvoiceTime());
            invoiceItems.add(item);
        }
        response.setInvoices(invoiceItems);
        response.setInvoiceTotalMoney(invoiceTotalMoney);

        // 查询汇款记录
        QueryWrapper<CustomerPayment> paymentWrapper = new QueryWrapper<>();
        paymentWrapper.eq("customer_id", customerId);
        if (startDate != null) {
            paymentWrapper.ge("payment_time", startDate);
        }
        if (endDate != null) {
            paymentWrapper.le("payment_time", endDate);
        }
        List<CustomerPayment> payments = customerPaymentMapper.selectList(paymentWrapper);
        BigDecimal paymentTotalMoney = payments.stream()
                .filter(p -> p.getPayment() != null)
                .map(CustomerPayment::getPayment)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<CustomerReconciliationResponse.PaymentItem> paymentItems = new ArrayList<>();
        for (CustomerPayment p : payments) {
            CustomerReconciliationResponse.PaymentItem item = new CustomerReconciliationResponse.PaymentItem();
            BeanUtils.copyProperties(p, item);
            paymentItems.add(item);
        }
        response.setPayments(paymentItems);
        response.setPaymentTotalMoney(paymentTotalMoney);

        // 查询罚款记录
        QueryWrapper<CustomerPenalty> penaltyWrapper = new QueryWrapper<>();
        penaltyWrapper.eq("customer_id", customerId);
        if (startDate != null) {
            penaltyWrapper.ge("penalty_time", startDate);
        }
        if (endDate != null) {
            penaltyWrapper.le("penalty_time", endDate);
        }
        List<CustomerPenalty> penalties = customerPenaltyMapper.selectList(penaltyWrapper);
        BigDecimal penaltyTotalMoney = penalties.stream()
                .filter(p -> p.getPenalty() != null)
                .map(CustomerPenalty::getPenalty)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<CustomerReconciliationResponse.PenaltyItem> penaltyItems = new ArrayList<>();
        for (CustomerPenalty p : penalties) {
            CustomerReconciliationResponse.PenaltyItem item = new CustomerReconciliationResponse.PenaltyItem();
            BeanUtils.copyProperties(p, item);
            penaltyItems.add(item);
        }
        response.setPenalties(penaltyItems);
        response.setPenaltyTotalMoney(penaltyTotalMoney);

        // 计算未付款 = 发票总金额（含客户付的运费）+ 罚款总金额 - 汇款总金额
        BigDecimal unpaidMoney = totalMoneyForCustomer.add(penaltyTotalMoney).subtract(paymentTotalMoney);
        response.setUnpaidMoney(unpaidMoney);

        return CommonResult.success(response);
    }
}