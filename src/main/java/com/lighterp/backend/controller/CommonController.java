package com.lighterp.backend.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.lighterp.backend.common.CommonResult;
import com.lighterp.backend.controller.response.CustomerInfoResponse;
import com.lighterp.backend.controller.response.ProductInfoResponse;
import com.lighterp.backend.entity.CustomerInfo;
import com.lighterp.backend.entity.CustomerProductPrice;
import com.lighterp.backend.entity.ProductInfo;
import com.lighterp.backend.mapper.CustomerInfoMapper;
import com.lighterp.backend.mapper.CustomerProductPriceMapper;
import com.lighterp.backend.mapper.ProductInfoMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 通用接口
 */
@RestController
@RequestMapping("/common")
@RequiredArgsConstructor
public class CommonController {

    private final CustomerInfoMapper customerInfoMapper;
    private final ProductInfoMapper productInfoMapper;
    private final CustomerProductPriceMapper customerProductPriceMapper;

    /**
     * 获取客户下拉列表
     */
    @GetMapping("/customers")
    public CommonResult<List<CustomerInfoResponse>> getCustomers() {
        List<CustomerInfo> list = customerInfoMapper.selectList(
                new QueryWrapper<CustomerInfo>()
        );

        List<CustomerInfoResponse> result = list.stream().map(info -> {
            CustomerInfoResponse response = new CustomerInfoResponse();
            BeanUtils.copyProperties(info, response);
            return response;
        }).collect(Collectors.toList());

        return CommonResult.success(result);
    }

    /**
     * 获取产品下拉列表
     */
    @GetMapping("/products")
    public CommonResult<List<ProductInfoResponse>> getProducts() {
        List<ProductInfo> list = productInfoMapper.selectList(
                new QueryWrapper<ProductInfo>()
        );

        List<ProductInfoResponse> result = list.stream().map(info -> {
            ProductInfoResponse response = new ProductInfoResponse();
            BeanUtils.copyProperties(info, response);
            return response;
        }).collect(Collectors.toList());

        return CommonResult.success(result);
    }

    /**
     * 获取当前客户产品单价
     */
    @GetMapping("/price")
    public CommonResult<BigDecimal> getPrice(
            @RequestParam Long customerId,
            @RequestParam Long productId) {

        CustomerProductPrice price = customerProductPriceMapper.selectOne(
                new QueryWrapper<CustomerProductPrice>()
                        .eq("customer_id", customerId)
                        .eq("product_id", productId)
                        .and(w -> w.isNull("effective_date_end")
                                .or()
                                .ge("effective_date_end", new Date()))
        );

        if (price == null || price.getPrice() == null) {
            return CommonResult.success(null);
        }

        return CommonResult.success(price.getPrice());
    }
}