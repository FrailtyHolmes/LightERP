package com.lighterp.backend.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.lighterp.backend.common.BusinessException;
import com.lighterp.backend.common.CommonResult;
import com.lighterp.backend.controller.response.CustomerInfoResponse;
import com.lighterp.backend.entity.CustomerInfo;
import com.lighterp.backend.entity.CustomerPenalty;
import com.lighterp.backend.entity.CustomerPayment;
import com.lighterp.backend.entity.SaleInvoice;
import com.lighterp.backend.mapper.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.util.CollectionUtils;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 可视化模块
 */
@Slf4j
@RestController
@RequestMapping("/stats")
@RequiredArgsConstructor
public class StatsController {

    private final SaleInvoiceMapper saleInvoiceMapper;
    private final CustomerPaymentMapper customerPaymentMapper;
    private final CustomerPenaltyMapper customerPenaltyMapper;
    private final CustomerInfoMapper customerInfoMapper;

    /**
     * Top10未付款客户
     */
    @GetMapping("/top-unpaid-customers")
    public CommonResult<List<CustomerInfoResponse>> topUnpaidCustomers() {

        // 查询所有客户
        List<CustomerInfo> customers = customerInfoMapper.selectList(
                new QueryWrapper<CustomerInfo>()
        );

        List<CustomerInfoResponse> result = new ArrayList<>();

        for (CustomerInfo customer : customers) {
            Long customerId = customer.getCustomerId();

            // 计算该客户的未付款金额
            BigDecimal invoiceTotal = BigDecimal.ZERO;
            BigDecimal shippingFeeTotal = BigDecimal.ZERO;

            // 查询发票总金额（含运费）
            List<SaleInvoice> invoices = saleInvoiceMapper.selectList(
                    new QueryWrapper<SaleInvoice>().eq("customer_id", customerId)
            );
            for (SaleInvoice invoice : invoices) {
                BigDecimal total = invoice.getTotalMoney() != null ? invoice.getTotalMoney() : BigDecimal.ZERO;
                BigDecimal shippingFee = invoice.getShippingFee() != null ? invoice.getShippingFee() : BigDecimal.ZERO;
                invoiceTotal = invoiceTotal.add(total);
                // 如果是客户付运费，需要加上运费
                if (invoice.getIsFreeShipping() != null && !invoice.getIsFreeShipping()) {
                    shippingFeeTotal = shippingFeeTotal.add(shippingFee);
                }
            }

            // 计算客户实际应付（发票总金额 - 生产商付的运费）
            BigDecimal customerShouldPay = invoiceTotal.subtract(shippingFeeTotal);

            // 查询罚款总金额
            BigDecimal penaltyTotal = BigDecimal.ZERO;
            List<CustomerPenalty> penalties = customerPenaltyMapper.selectList(
                    new QueryWrapper<CustomerPenalty>().eq("customer_id", customerId)
            );
            for (CustomerPenalty p : penalties) {
                if (p.getPenalty() != null) {
                    penaltyTotal = penaltyTotal.add(p.getPenalty());
                }
            }

            // 查询已付款金额
            BigDecimal paymentTotal = BigDecimal.ZERO;
            List<CustomerPayment> payments = customerPaymentMapper.selectList(
                    new QueryWrapper<CustomerPayment>().eq("customer_id", customerId)
            );
            for (CustomerPayment p : payments) {
                if (p.getPayment() != null) {
                    paymentTotal = paymentTotal.add(p.getPayment());
                }
            }

            // 未付款 = 应付 + 罚款 - 已付款
            BigDecimal unpaid = customerShouldPay.add(penaltyTotal).subtract(paymentTotal);

            if (unpaid.compareTo(BigDecimal.ZERO) > 0) {
                CustomerInfoResponse response = new CustomerInfoResponse();
                response.setCustomerId(customerId);
                response.setCustomerName(customer.getCustomerName());
                response.setCustomerAddress(customer.getCustomerAddress());
                response.setUnpaidAmount(unpaid);
                result.add(response);
            }
        }

        // 按未付款金额降序排序，取前10
        result.sort((a, b) -> b.getUnpaidAmount().compareTo(a.getUnpaidAmount()));
        result = result.subList(0, Math.min(10, result.size()));

        return CommonResult.success(result);
    }

    /**
     * 发票数量折线图
     */
    @GetMapping("/invoice-chart")
    public CommonResult<List<Map<String, Object>>> invoiceChart(
            @RequestParam String type,
            @RequestParam(required = false) Date startDate,
            @RequestParam(required = false) Date endDate) {

        if (startDate == null || endDate == null) {
            // 设置默认日期范围
            Calendar cal = Calendar.getInstance();
            endDate = cal.getTime();
            cal.add(type.equals("day") ? Calendar.HOUR : type.equals("week") ? Calendar.DAY_OF_MONTH : Calendar.MONTH, -1);
            startDate = cal.getTime();
        }

        QueryWrapper<SaleInvoice> wrapper = new QueryWrapper<>();
        // 查询所有未删除的记录
        if (startDate != null) {
            wrapper.ge("created_time", startDate);
        }
        if (endDate != null) {
            wrapper.le("created_time", endDate);
        }

        List<SaleInvoice> invoices = saleInvoiceMapper.selectList(wrapper);

        SimpleDateFormat sdf = new SimpleDateFormat();
        switch (type) {
            case "day":
                sdf = new SimpleDateFormat("yyyy-MM-dd HH:00");
                break;
            case "week":
            case "month":
                sdf = new SimpleDateFormat("yyyy-MM-dd");
                break;
            case "year":
                sdf = new SimpleDateFormat("yyyy-MM");
                break;
            default:
                throw new BusinessException("无效的时间类型");
        }

        Map<String, Long> countMap = new HashMap<>();
        for (SaleInvoice invoice : invoices) {
            if (invoice.getCreatedTime() != null) {
                String dateKey = sdf.format(invoice.getCreatedTime());
                countMap.put(dateKey, countMap.getOrDefault(dateKey, 0L) + 1);
            }
        }

        // 按日期排序
        List<Map<String, Object>> result = new ArrayList<>();
        countMap.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .forEach(entry -> {
                    Map<String, Object> item = new HashMap<>();
                    item.put("date", entry.getKey());
                    item.put("count", entry.getValue());
                    result.add(item);
                });

        return CommonResult.success(result);
    }
}