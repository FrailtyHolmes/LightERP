package com.lighterp.backend.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.lighterp.backend.common.BusinessException;
import com.lighterp.backend.common.CommonResult;
import com.lighterp.backend.common.PageResult;
import com.lighterp.backend.config.SessionUtils;
import com.lighterp.backend.controller.request.CustomerCreateRequest;
import com.lighterp.backend.controller.response.CustomerInfoResponse;
import com.lighterp.backend.entity.CustomerInfo;
import com.lighterp.backend.mapper.CustomerInfoMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.util.StringUtils;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 后台管理 - 客户管理
 */
@Slf4j
@RestController
@RequestMapping("/admin/customer")
@RequiredArgsConstructor
public class AdminCustomerController {

    private final CustomerInfoMapper customerInfoMapper;

    /**
     * 客户列表查询
     */
    @GetMapping("/list")
    public CommonResult<PageResult<CustomerInfoResponse>> list(
            @RequestParam(required = false) String customerName,
            @RequestParam(required = false) String customerAddress,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer pageSize) {

        // 检查权限 - 需要 super 权限才能编辑/删除
        Integer userStatus = SessionUtils.getCurrentUserStatus();
        if (userStatus == null || userStatus < 2) {
            if (customerName != null || customerAddress != null) {
                SessionUtils.checkSuper();
            }
        }

        Page<CustomerInfo> pageParam = new Page<>(page, pageSize);
        QueryWrapper<CustomerInfo> wrapper = new QueryWrapper<>();

        if (StringUtils.hasText(customerName)) {
            wrapper.like("customer_name", customerName);
        }
        if (StringUtils.hasText(customerAddress)) {
            wrapper.like("customer_address", customerAddress);
        }

        wrapper.orderByDesc("created_time");
        Page<CustomerInfo> result = customerInfoMapper.selectPage(pageParam, wrapper);

        PageResult<CustomerInfoResponse> pageResult = PageResult.of(
                result.getRecords().stream().map(info -> {
                    CustomerInfoResponse response = new CustomerInfoResponse();
                    BeanUtils.copyProperties(info, response);
                    return response;
                }).collect(Collectors.toList()),
                result.getTotal(),
                (int) result.getCurrent(),
                (int) result.getSize()
        );

        return CommonResult.success(pageResult);
    }

    /**
     * 添加客户
     */
    @PostMapping
    public CommonResult<CustomerInfoResponse> create(@Validated @RequestBody CustomerCreateRequest request) {
        SessionUtils.checkSuper();

        // 检查客户名字+地址是否已存在
        Long count = customerInfoMapper.selectCount(
                new QueryWrapper<CustomerInfo>()
                        .eq("customer_name", request.getCustomerName())
                        .eq("customer_address", request.getCustomerAddress())
        );
        if (count > 0) {
            throw new BusinessException("已存在该客户记录");
        }

        CustomerInfo customerInfo = new CustomerInfo();
        BeanUtils.copyProperties(request, customerInfo);
        customerInfoMapper.insert(customerInfo);

        log.info("添加客户: {}", customerInfo.getCustomerName());

        CustomerInfoResponse response = new CustomerInfoResponse();
        BeanUtils.copyProperties(customerInfo, response);
        return CommonResult.success(response);
    }

    /**
     * 编辑客户
     */
    @PutMapping("/{id}")
    public CommonResult<CustomerInfoResponse> update(
            @PathVariable Long id,
            @Validated @RequestBody CustomerCreateRequest request) {
        SessionUtils.checkSuper();

        CustomerInfo customerInfo = customerInfoMapper.selectById(id);
        if (customerInfo == null) {
            throw new BusinessException("客户不存在");
        }

        BeanUtils.copyProperties(request, customerInfo);
        customerInfoMapper.updateById(customerInfo);

        log.info("编辑客户: {}", id);

        CustomerInfoResponse response = new CustomerInfoResponse();
        BeanUtils.copyProperties(customerInfo, response);
        return CommonResult.success(response);
    }

    /**
     * 删除客户
     */
    @DeleteMapping("/{id}")
    public CommonResult<Void> delete(@PathVariable Long id) {
        SessionUtils.checkSuper();

        CustomerInfo customerInfo = customerInfoMapper.selectById(id);
        if (customerInfo == null) {
            throw new BusinessException("客户不存在");
        }

        customerInfoMapper.deleteById(id);

        log.info("删除客户: {}", id);
        return CommonResult.success();
    }

    /**
     * 客户模糊搜索（下拉框用）
     */
    @GetMapping("/search")
    public CommonResult<List<CustomerInfoResponse>> search(@RequestParam String keyword) {
        QueryWrapper<CustomerInfo> wrapper = new QueryWrapper<>();
        wrapper.like("customer_name", keyword)
               .or()
               .like("customer_address", keyword)
               .last("limit 20");

        List<CustomerInfo> list = customerInfoMapper.selectList(wrapper);

        List<CustomerInfoResponse> result = list.stream().map(info -> {
            CustomerInfoResponse response = new CustomerInfoResponse();
            BeanUtils.copyProperties(info, response);
            return response;
        }).collect(Collectors.toList());

        return CommonResult.success(result);
    }
}