package com.lighterp.backend.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.lighterp.backend.common.BusinessException;
import com.lighterp.backend.common.CommonResult;
import com.lighterp.backend.common.Constants;
import com.lighterp.backend.common.PageResult;
import com.lighterp.backend.config.SessionUtils;
import com.lighterp.backend.controller.request.PaymentCreateRequest;
import com.lighterp.backend.controller.response.CustomerPaymentResponse;
import com.lighterp.backend.entity.CustomerInfo;
import com.lighterp.backend.entity.CustomerPayment;
import com.lighterp.backend.mapper.CustomerInfoMapper;
import com.lighterp.backend.mapper.CustomerPaymentMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.util.StringUtils;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 货款模块
 */
@Slf4j
@RestController
@RequestMapping("/payment")
@RequiredArgsConstructor
public class PaymentController {

    private final CustomerPaymentMapper paymentMapper;
    private final CustomerInfoMapper customerInfoMapper;

    /**
     * 录入货款
     */
    @PostMapping
    public CommonResult<CustomerPaymentResponse> create(@Validated @RequestBody PaymentCreateRequest request) {
        SessionUtils.checkAdmin();

        // 检查客户是否存在
        CustomerInfo customer = customerInfoMapper.selectById(request.getCustomerId());
        if (customer == null) {
            throw new BusinessException("该客户未注册，请先注册");
        }

        CustomerPayment payment = new CustomerPayment();
        BeanUtils.copyProperties(request, payment);
        paymentMapper.insert(payment);

        log.info("录入货款: customerId={}, payment={}", request.getCustomerId(), request.getPayment());

        CustomerPaymentResponse response = new CustomerPaymentResponse();
        BeanUtils.copyProperties(payment, response);
        response.setCustomerName(customer.getCustomerName());
        response.setCustomerAddress(customer.getCustomerAddress());
        return CommonResult.success(response);
    }

    /**
     * 货款列表查询
     */
    @GetMapping("/list")
    public CommonResult<PageResult<CustomerPaymentResponse>> list(
            @RequestParam(required = false) Long customerId,
            @RequestParam(required = false) String customerName,
            @RequestParam(required = false) String paymentTimeStart,
            @RequestParam(required = false) String paymentTimeEnd,
            @RequestParam(required = false) BigDecimal paymentMin,
            @RequestParam(required = false) BigDecimal paymentMax,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer pageSize) {

        Page<CustomerPayment> pageParam = new Page<>(page, pageSize);
        QueryWrapper<CustomerPayment> wrapper = new QueryWrapper<>();

        if (customerId != null) {
            wrapper.eq("customer_id", customerId);
        }
        if (StringUtils.hasText(paymentTimeStart) && StringUtils.hasText(paymentTimeEnd)
                && paymentTimeStart.compareTo(paymentTimeEnd) > 0) {
            throw new BusinessException("开始日期不能晚于结束日期");
        }
        if (StringUtils.hasText(paymentTimeStart)) {
            wrapper.ge("payment_time", paymentTimeStart);
        }
        if (StringUtils.hasText(paymentTimeEnd)) {
            wrapper.le("payment_time", paymentTimeEnd);
        }
        if (paymentMin != null) {
            wrapper.ge("payment", paymentMin);
        }
        if (paymentMax != null) {
            wrapper.le("payment", paymentMax);
        }

        // 如果传了客户名
        if (StringUtils.hasText(customerName)) {
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

        wrapper.orderByDesc("created_time");
        Page<CustomerPayment> result = paymentMapper.selectPage(pageParam, wrapper);

        // 填充客户信息
        final Map<Long, CustomerInfo> customerMap = new HashMap<>();
        if (!result.getRecords().isEmpty()) {
            List<Long> cIds = result.getRecords().stream().map(CustomerPayment::getCustomerId).distinct().collect(Collectors.toList());
            List<CustomerInfo> cList = customerInfoMapper.selectBatchIds(cIds);
            customerMap.putAll(cList.stream().collect(Collectors.toMap(CustomerInfo::getCustomerId, c -> c)));
        }

        PageResult<CustomerPaymentResponse> pageResult = PageResult.of(
                result.getRecords().stream().map(p -> {
                    CustomerPaymentResponse response = new CustomerPaymentResponse();
                    BeanUtils.copyProperties(p, response);
                    CustomerInfo c = customerMap.get(p.getCustomerId());
                    if (c != null) {
                        response.setCustomerName(c.getCustomerName());
                        response.setCustomerAddress(c.getCustomerAddress());
                    }
                    return response;
                }).collect(Collectors.toList()),
                result.getTotal(),
                (int) result.getCurrent(),
                (int) result.getSize()
        );

        return CommonResult.success(pageResult);
    }

    /**
     * 编辑货款
     */
    @PutMapping("/{id}")
    public CommonResult<CustomerPaymentResponse> update(
            @PathVariable Long id,
            @Validated @RequestBody PaymentCreateRequest request) {
        SessionUtils.checkAdmin();

        CustomerPayment payment = paymentMapper.selectById(id);
        if (payment == null) {
            throw new BusinessException("货款记录不存在");
        }

        BeanUtils.copyProperties(request, payment);
        paymentMapper.updateById(payment);

        CustomerInfo customer = customerInfoMapper.selectById(payment.getCustomerId());
        CustomerPaymentResponse response = new CustomerPaymentResponse();
        BeanUtils.copyProperties(payment, response);
        if (customer != null) {
            response.setCustomerName(customer.getCustomerName());
            response.setCustomerAddress(customer.getCustomerAddress());
        }

        return CommonResult.success(response);
    }

    /**
     * 删除货款
     */
    @DeleteMapping("/{id}")
    public CommonResult<Void> delete(@PathVariable Long id) {
        SessionUtils.checkAdmin();

        CustomerPayment payment = paymentMapper.selectById(id);
        if (payment == null) {
            throw new BusinessException("货款记录不存在");
        }

        paymentMapper.deleteById(id);

        log.info("删除货款: {}", id);
        return CommonResult.success();
    }
}