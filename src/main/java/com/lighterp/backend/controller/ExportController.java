package com.lighterp.backend.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.lighterp.backend.common.BusinessException;
import com.lighterp.backend.util.ExcelUtils;
import com.lighterp.backend.entity.*;
import com.lighterp.backend.mapper.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.util.CollectionUtils;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletResponse;
import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Excel 导出控制器
 */
@Slf4j
@RestController
@RequestMapping("/export")
@RequiredArgsConstructor
public class ExportController {

    private final SaleInvoiceMapper saleInvoiceMapper;
    private final SaleProductMapper saleProductMapper;
    private final CustomerPaymentMapper customerPaymentMapper;
    private final CustomerPenaltyMapper customerPenaltyMapper;
    private final CustomerInfoMapper customerInfoMapper;
    private final ProductInfoMapper productInfoMapper;

    /**
     * 导出发票Excel
     */
    @GetMapping("/invoice/{id}")
    public void exportInvoice(@PathVariable String id, HttpServletResponse response) throws Exception {
        SaleInvoice invoice = saleInvoiceMapper.selectById(id);
        if (invoice == null) {
            throw new BusinessException("发票不存在");
        }

        CustomerInfo customer = customerInfoMapper.selectById(invoice.getCustomerId());
        List<SaleProduct> products = saleProductMapper.selectList(
                new QueryWrapper<SaleProduct>().eq("invoice_id", id)
        );

        // 获取所有产品信息
        Set<Long> productIds = products.stream().map(SaleProduct::getProductId).collect(Collectors.toSet());
        Map<Long, ProductInfo> productMap = new HashMap<>();
        if (!productIds.isEmpty()) {
            List<ProductInfo> productList = productInfoMapper.selectBatchIds(productIds);
            productMap = productList.stream().collect(Collectors.toMap(ProductInfo::getProductId, p -> p));
        }

        String[] headers = {"发票ID", "客户名", "客户地址", "产品名", "净含量", "规格", "单价", "数量", "出库金额", "开票人", "开票时间"};
        List<Object[]> dataList = new ArrayList<>();

        for (SaleProduct p : products) {
            ProductInfo pi = productMap.get(p.getProductId());
            Object[] row = {
                invoice.getInvoiceId(),
                customer != null ? customer.getCustomerName() : "",
                customer != null ? customer.getCustomerAddress() : "",
                pi != null ? pi.getProductName() : "",
                pi != null ? pi.getProductVolume() : "",
                pi != null ? pi.getProductSize() : "",
                p.getProductPrice(),
                p.getProductNum(),
                p.getProductMoney(),
                invoice.getOperater(),
                invoice.getInvoiceTime()
            };
            dataList.add(row);
        }

        // 如果没有产品，只显示发票基本信息
        if (products.isEmpty()) {
            Object[] row = {
                invoice.getInvoiceId(),
                customer != null ? customer.getCustomerName() : "",
                customer != null ? customer.getCustomerAddress() : "",
                "", "", "", "", "", "",
                invoice.getOperater(),
                invoice.getInvoiceTime()
            };
            dataList.add(row);
        }

        ExcelUtils.exportExcel(response, "发票_" + id, headers, dataList);
    }

    /**
     * 导出货款Excel
     */
    @GetMapping("/payment")
    public void exportPayment(
            @RequestParam(required = false) Long customerId,
            @RequestParam(required = false) String customerName,
            @RequestParam(required = false) Date paymentTimeStart,
            @RequestParam(required = false) Date paymentTimeEnd,
            HttpServletResponse response) throws Exception {

        QueryWrapper<CustomerPayment> wrapper = new QueryWrapper<>();
        if (customerId != null) wrapper.eq("customer_id", customerId);
        if (paymentTimeStart != null) wrapper.ge("payment_time", paymentTimeStart);
        if (paymentTimeEnd != null) wrapper.le("payment_time", paymentTimeEnd);

        if (customerName != null) {
            List<CustomerInfo> customers = customerInfoMapper.selectList(
                    new QueryWrapper<CustomerInfo>().like("customer_name", customerName)
            );
            if (!customers.isEmpty()) {
                List<Long> cIds = customers.stream().map(CustomerInfo::getCustomerId).collect(Collectors.toList());
                wrapper.in("customer_id", cIds);
            } else {
                wrapper.eq("customer_id", -1);
            }
        }

        List<CustomerPayment> payments = customerPaymentMapper.selectList(wrapper);

        // 获取客户信息
        Set<Long> customerIds = payments.stream().map(CustomerPayment::getCustomerId).collect(Collectors.toSet());
        Map<Long, CustomerInfo> customerMap = new HashMap<>();
        if (!customerIds.isEmpty()) {
            List<CustomerInfo> customerList = customerInfoMapper.selectBatchIds(customerIds);
            customerMap = customerList.stream().collect(Collectors.toMap(CustomerInfo::getCustomerId, c -> c));
        }

        String[] headers = {"客户名", "客户地址", "付款金额", "付款时间", "备注"};
        List<Object[]> dataList = new ArrayList<>();

        for (CustomerPayment p : payments) {
            CustomerInfo c = customerMap.get(p.getCustomerId());
            Object[] row = {
                c != null ? c.getCustomerName() : "",
                c != null ? c.getCustomerAddress() : "",
                p.getPayment(),
                p.getPaymentTime(),
                p.getComment()
            };
            dataList.add(row);
        }

        ExcelUtils.exportExcel(response, "货款记录", headers, dataList);
    }

    /**
     * 导出罚款Excel
     */
    @GetMapping("/penalty")
    public void exportPenalty(
            @RequestParam(required = false) Long customerId,
            @RequestParam(required = false) String customerName,
            @RequestParam(required = false) Date penaltyTimeStart,
            @RequestParam(required = false) Date penaltyTimeEnd,
            HttpServletResponse response) throws Exception {

        QueryWrapper<CustomerPenalty> wrapper = new QueryWrapper<>();
        if (customerId != null) wrapper.eq("customer_id", customerId);
        if (penaltyTimeStart != null) wrapper.ge("penalty_time", penaltyTimeStart);
        if (penaltyTimeEnd != null) wrapper.le("penalty_time", penaltyTimeEnd);

        if (customerName != null) {
            List<CustomerInfo> customers = customerInfoMapper.selectList(
                    new QueryWrapper<CustomerInfo>().like("customer_name", customerName)
            );
            if (!customers.isEmpty()) {
                List<Long> cIds = customers.stream().map(CustomerInfo::getCustomerId).collect(Collectors.toList());
                wrapper.in("customer_id", cIds);
            } else {
                wrapper.eq("customer_id", -1);
            }
        }

        List<CustomerPenalty> penalties = customerPenaltyMapper.selectList(wrapper);

        Set<Long> customerIds = penalties.stream().map(CustomerPenalty::getCustomerId).collect(Collectors.toSet());
        Map<Long, CustomerInfo> customerMap = new HashMap<>();
        if (!customerIds.isEmpty()) {
            List<CustomerInfo> customerList = customerInfoMapper.selectBatchIds(customerIds);
            customerMap = customerList.stream().collect(Collectors.toMap(CustomerInfo::getCustomerId, c -> c));
        }

        String[] headers = {"客户名", "客户地址", "罚款金额", "罚款时间", "备注"};
        List<Object[]> dataList = new ArrayList<>();

        for (CustomerPenalty p : penalties) {
            CustomerInfo c = customerMap.get(p.getCustomerId());
            Object[] row = {
                c != null ? c.getCustomerName() : "",
                c != null ? c.getCustomerAddress() : "",
                p.getPenalty(),
                p.getPenaltyTime(),
                p.getComment()
            };
            dataList.add(row);
        }

        ExcelUtils.exportExcel(response, "罚款记录", headers, dataList);
    }

    /**
     * 导出出库产品Excel
     */
    @GetMapping("/sale-product")
    public void exportSaleProduct(
            @RequestParam(required = false) Long customerId,
            @RequestParam(required = false) Long productId,
            @RequestParam(required = false) Date invoiceTimeStart,
            @RequestParam(required = false) Date invoiceTimeEnd,
            @RequestParam(required = false) String operater,
            HttpServletResponse response) throws Exception {

        QueryWrapper<SaleProduct> wrapper = new QueryWrapper<>();
        if (customerId != null) wrapper.eq("customer_id", customerId);
        if (productId != null) wrapper.eq("product_id", productId);
        if (operater != null) wrapper.like("operater", operater);

        List<SaleProduct> products = saleProductMapper.selectList(wrapper);

        Set<Long> productIds = products.stream().map(SaleProduct::getProductId).collect(Collectors.toSet());
        Map<Long, ProductInfo> productMap = new HashMap<>();
        if (!productIds.isEmpty()) {
            List<ProductInfo> productList = productInfoMapper.selectBatchIds(productIds);
            productMap = productList.stream().collect(Collectors.toMap(ProductInfo::getProductId, p -> p));
        }

        Set<Long> customerIds = products.stream().map(SaleProduct::getCustomerId).collect(Collectors.toSet());
        Map<Long, CustomerInfo> customerMap = new HashMap<>();
        if (!customerIds.isEmpty()) {
            List<CustomerInfo> customerList = customerInfoMapper.selectBatchIds(customerIds);
            customerMap = customerList.stream().collect(Collectors.toMap(CustomerInfo::getCustomerId, c -> c));
        }

        String[] headers = {"发票ID", "客户名", "产品名", "净含量", "规格", "单价", "数量", "出库金额", "开票人"};
        List<Object[]> dataList = new ArrayList<>();

        for (SaleProduct p : products) {
            ProductInfo pi = productMap.get(p.getProductId());
            CustomerInfo c = customerMap.get(p.getCustomerId());
            Object[] row = {
                p.getInvoiceId(),
                c != null ? c.getCustomerName() : "",
                pi != null ? pi.getProductName() : "",
                pi != null ? pi.getProductVolume() : "",
                pi != null ? pi.getProductSize() : "",
                p.getProductPrice(),
                p.getProductNum(),
                p.getProductMoney(),
                p.getOperater()
            };
            dataList.add(row);
        }

        ExcelUtils.exportExcel(response, "出库产品记录", headers, dataList);
    }

    /**
     * 导出对账Excel
     */
    @GetMapping("/reconciliation")
    public void exportReconciliation(
            @RequestParam Long customerId,
            @RequestParam(required = false) Date startDate,
            @RequestParam(required = false) Date endDate,
            HttpServletResponse response) throws Exception {

        CustomerInfo customer = customerInfoMapper.selectById(customerId);
        if (customer == null) {
            throw new BusinessException("客户不存在");
        }

        // 查询发票
        QueryWrapper<SaleInvoice> invoiceWrapper = new QueryWrapper<>();
        invoiceWrapper.eq("customer_id", customerId);
        if (startDate != null) invoiceWrapper.ge("invoice_time", startDate);
        if (endDate != null) invoiceWrapper.le("invoice_time", endDate);
        List<SaleInvoice> invoices = saleInvoiceMapper.selectList(invoiceWrapper);

        // 查询汇款
        QueryWrapper<CustomerPayment> paymentWrapper = new QueryWrapper<>();
        paymentWrapper.eq("customer_id", customerId);
        if (startDate != null) paymentWrapper.ge("payment_time", startDate);
        if (endDate != null) paymentWrapper.le("payment_time", endDate);
        List<CustomerPayment> payments = customerPaymentMapper.selectList(paymentWrapper);

        // 查询罚款
        QueryWrapper<CustomerPenalty> penaltyWrapper = new QueryWrapper<>();
        penaltyWrapper.eq("customer_id", customerId);
        if (startDate != null) penaltyWrapper.ge("penalty_time", startDate);
        if (endDate != null) penaltyWrapper.le("penalty_time", endDate);
        List<CustomerPenalty> penalties = customerPenaltyMapper.selectList(penaltyWrapper);

        // 汇总
        BigDecimal invoiceTotal = invoices.stream()
                .filter(i -> i.getTotalMoney() != null)
                .map(SaleInvoice::getTotalMoney)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal paymentTotal = payments.stream()
                .filter(p -> p.getPayment() != null)
                .map(CustomerPayment::getPayment)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal penaltyTotal = penalties.stream()
                .filter(p -> p.getPenalty() != null)
                .map(CustomerPenalty::getPenalty)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        String[] headers = {"类型", "金额", "时间", "备注"};
        List<Object[]> dataList = new ArrayList<>();

        // 添加发票记录
        for (SaleInvoice i : invoices) {
            dataList.add(new Object[]{"发票", i.getTotalMoney(), i.getInvoiceTime(), i.getComment()});
        }
        dataList.add(new Object[]{"发票合计", invoiceTotal, "", ""});

        // 添加汇款记录
        for (CustomerPayment p : payments) {
            dataList.add(new Object[]{"汇款", p.getPayment(), p.getPaymentTime(), p.getComment()});
        }
        dataList.add(new Object[]{"汇款合计", paymentTotal, "", ""});

        // 添加罚款记录
        for (CustomerPenalty p : penalties) {
            dataList.add(new Object[]{"罚款", p.getPenalty(), p.getPenaltyTime(), p.getComment()});
        }
        dataList.add(new Object[]{"罚款合计", penaltyTotal, "", ""});

        // 添加未付款
        BigDecimal unpaid = invoiceTotal.add(penaltyTotal).subtract(paymentTotal);
        dataList.add(new Object[]{"客户未付款", unpaid, "", ""});

        ExcelUtils.exportExcel(response, "对账_" + customer.getCustomerName(), headers, dataList);
    }
}