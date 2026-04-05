package com.lighterp.backend.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.lighterp.backend.common.BusinessException;
import com.lighterp.backend.common.CommonResult;
import com.lighterp.backend.common.Constants;
import com.lighterp.backend.common.PageResult;
import com.lighterp.backend.config.SessionUtils;
import com.lighterp.backend.controller.request.PenaltyCreateRequest;
import com.lighterp.backend.controller.response.CustomerPenaltyResponse;
import com.lighterp.backend.entity.CustomerInfo;
import com.lighterp.backend.entity.CustomerPenalty;
import com.lighterp.backend.mapper.CustomerInfoMapper;
import com.lighterp.backend.mapper.CustomerPenaltyMapper;
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
 * 罚款模块
 */
@Slf4j
@RestController
@RequestMapping("/penalty")
@RequiredArgsConstructor
public class PenaltyController {

    private final CustomerPenaltyMapper penaltyMapper;
    private final CustomerInfoMapper customerInfoMapper;

    /**
     * 录入罚款
     */
    @PostMapping
    public CommonResult<CustomerPenaltyResponse> create(@Validated @RequestBody PenaltyCreateRequest request) {
        SessionUtils.checkAdmin();

        // 检查客户是否存在
        CustomerInfo customer = customerInfoMapper.selectById(request.getCustomerId());
        if (customer == null) {
            throw new BusinessException("该客户未注册，请先注册");
        }

        CustomerPenalty penalty = new CustomerPenalty();
        BeanUtils.copyProperties(request, penalty);
        // 设置默认备注
        if (!StringUtils.hasText(penalty.getComment())) {
            penalty.setComment(Constants.Business.PENALTY_DEFAULT_COMMENT);
        }
        penaltyMapper.insert(penalty);

        log.info("录入罚款: customerId={}, penalty={}", request.getCustomerId(), request.getPenalty());

        CustomerPenaltyResponse response = new CustomerPenaltyResponse();
        BeanUtils.copyProperties(penalty, response);
        response.setCustomerName(customer.getCustomerName());
        response.setCustomerAddress(customer.getCustomerAddress());
        return CommonResult.success(response);
    }

    /**
     * 罚款列表查询
     */
    @GetMapping("/list")
    public CommonResult<PageResult<CustomerPenaltyResponse>> list(
            @RequestParam(required = false) Long customerId,
            @RequestParam(required = false) String customerName,
            @RequestParam(required = false) Date penaltyTimeStart,
            @RequestParam(required = false) Date penaltyTimeEnd,
            @RequestParam(required = false) BigDecimal penaltyMin,
            @RequestParam(required = false) BigDecimal penaltyMax,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer pageSize) {

        Page<CustomerPenalty> pageParam = new Page<>(page, pageSize);
        QueryWrapper<CustomerPenalty> wrapper = new QueryWrapper<>();

        if (customerId != null) {
            wrapper.eq("customer_id", customerId);
        }
        if (penaltyTimeStart != null) {
            wrapper.ge("penalty_time", penaltyTimeStart);
        }
        if (penaltyTimeEnd != null) {
            wrapper.le("penalty_time", penaltyTimeEnd);
        }
        if (penaltyMin != null) {
            wrapper.ge("penalty", penaltyMin);
        }
        if (penaltyMax != null) {
            wrapper.le("penalty", penaltyMax);
        }

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
        Page<CustomerPenalty> result = penaltyMapper.selectPage(pageParam, wrapper);

        Map<Long, CustomerInfo> customerMap = new HashMap<>();
        if (!result.getRecords().isEmpty()) {
            List<Long> cIds = result.getRecords().stream().map(CustomerPenalty::getCustomerId).distinct().collect(Collectors.toList());
            List<CustomerInfo> cList = customerInfoMapper.selectBatchIds(cIds);
            customerMap = cList.stream().collect(Collectors.toMap(CustomerInfo::getCustomerId, c -> c));
        }

        PageResult<CustomerPenaltyResponse> pageResult = PageResult.of(
                result.getRecords().stream().map(p -> {
                    CustomerPenaltyResponse response = new CustomerPenaltyResponse();
                    BeanUtils.copyProperties(p, response);
                    CustomerInfo c = customerMap.get(p.getCustomerId());
                    if (c != null) {
                        response.setCustomerName(c.getCustomerName());
                        response.setCustomerAddress(c.getCustomerAddress());
                    }
                    return response;
                }).toList(),
                result.getTotal(),
                (int) result.getCurrent(),
                (int) result.getSize()
        );

        return CommonResult.success(pageResult);
    }

    /**
     * 编辑罚款
     */
    @PutMapping("/{id}")
    public CommonResult<CustomerPenaltyResponse> update(
            @PathVariable Long id,
            @Validated @RequestBody PenaltyCreateRequest request) {
        SessionUtils.checkAdmin();

        CustomerPenalty penalty = penaltyMapper.selectById(id);
        if (penalty == null) {
            throw new BusinessException("罚款记录不存在");
        }

        BeanUtils.copyProperties(request, penalty);
        penaltyMapper.updateById(penalty);

        CustomerInfo customer = customerInfoMapper.selectById(penalty.getCustomerId());
        CustomerPenaltyResponse response = new CustomerPenaltyResponse();
        BeanUtils.copyProperties(penalty, response);
        if (customer != null) {
            response.setCustomerName(customer.getCustomerName());
            response.setCustomerAddress(customer.getCustomerAddress());
        }

        return CommonResult.success(response);
    }

    /**
     * 删除罚款
     */
    @DeleteMapping("/{id}")
    public CommonResult<Void> delete(@PathVariable Long id) {
        SessionUtils.checkAdmin();

        CustomerPenalty penalty = penaltyMapper.selectById(id);
        if (penalty == null) {
            throw new BusinessException("罚款记录不存在");
        }

        penaltyMapper.deleteById(id);

        log.info("删除罚款: {}", id);
        return CommonResult.success();
    }
}