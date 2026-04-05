package com.lighterp.backend.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.lighterp.backend.common.BusinessException;
import com.lighterp.backend.common.CommonResult;
import com.lighterp.backend.common.PageResult;
import com.lighterp.backend.config.SessionUtils;
import com.lighterp.backend.controller.request.ProductCreateRequest;
import com.lighterp.backend.controller.response.ProductInfoResponse;
import com.lighterp.backend.entity.ProductInfo;
import com.lighterp.backend.mapper.ProductInfoMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.util.StringUtils;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 后台管理 - 产品管理
 */
@Slf4j
@RestController
@RequestMapping("/admin/product")
@RequiredArgsConstructor
public class AdminProductController {

    private final ProductInfoMapper productInfoMapper;

    /**
     * 产品列表查询
     */
    @GetMapping("/list")
    public CommonResult<PageResult<ProductInfoResponse>> list(
            @RequestParam(required = false) String productName,
            @RequestParam(required = false) String productVolume,
            @RequestParam(required = false) String productSize,
            @RequestParam(required = false) String productTag,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer pageSize) {

        Integer userStatus = SessionUtils.getCurrentUserStatus();
        if (userStatus == null || userStatus < 2) {
            if (productName != null || productVolume != null || productSize != null || productTag != null) {
                SessionUtils.checkSuper();
            }
        }

        Page<ProductInfo> pageParam = new Page<>(page, pageSize);
        QueryWrapper<ProductInfo> wrapper = new QueryWrapper<>();

        if (StringUtils.hasText(productName)) {
            wrapper.like("product_name", productName);
        }
        if (StringUtils.hasText(productVolume)) {
            wrapper.eq("product_volume", productVolume);
        }
        if (StringUtils.hasText(productSize)) {
            wrapper.eq("product_size", productSize);
        }
        if (StringUtils.hasText(productTag)) {
            wrapper.like("product_tag", productTag);
        }

        wrapper.orderByDesc("created_time");
        Page<ProductInfo> result = productInfoMapper.selectPage(pageParam, wrapper);

        PageResult<ProductInfoResponse> pageResult = PageResult.of(
                result.getRecords().stream().map(info -> {
                    ProductInfoResponse response = new ProductInfoResponse();
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
     * 添加产品
     */
    @PostMapping
    public CommonResult<ProductInfoResponse> create(@Validated @RequestBody ProductCreateRequest request) {
        SessionUtils.checkSuper();

        // 检查产品名+净含量+规格是否已存在
        Long count = productInfoMapper.selectCount(
                new QueryWrapper<ProductInfo>()
                        .eq("product_name", request.getProductName())
                        .eq("product_volume", request.getProductVolume())
                        .eq("product_size", request.getProductSize())
        );
        if (count > 0) {
            throw new BusinessException("已存在该产品记录");
        }

        ProductInfo productInfo = new ProductInfo();
        BeanUtils.copyProperties(request, productInfo);
        productInfoMapper.insert(productInfo);

        log.info("添加产品: {}", productInfo.getProductName());

        ProductInfoResponse response = new ProductInfoResponse();
        BeanUtils.copyProperties(productInfo, response);
        return CommonResult.success(response);
    }

    /**
     * 编辑产品
     */
    @PutMapping("/{id}")
    public CommonResult<ProductInfoResponse> update(
            @PathVariable Long id,
            @Validated @RequestBody ProductCreateRequest request) {
        SessionUtils.checkSuper();

        ProductInfo productInfo = productInfoMapper.selectById(id);
        if (productInfo == null) {
            throw new BusinessException("产品不存在");
        }

        BeanUtils.copyProperties(request, productInfo);
        productInfoMapper.updateById(productInfo);

        log.info("编辑产品: {}", id);

        ProductInfoResponse response = new ProductInfoResponse();
        BeanUtils.copyProperties(productInfo, response);
        return CommonResult.success(response);
    }

    /**
     * 删除产品
     */
    @DeleteMapping("/{id}")
    public CommonResult<Void> delete(@PathVariable Long id) {
        SessionUtils.checkSuper();

        ProductInfo productInfo = productInfoMapper.selectById(id);
        if (productInfo == null) {
            throw new BusinessException("产品不存在");
        }

        productInfoMapper.deleteById(id);

        log.info("删除产品: {}", id);
        return CommonResult.success();
    }

    /**
     * 产品模糊搜索（下拉框用）
     */
    @GetMapping("/search")
    public CommonResult<List<ProductInfoResponse>> search(@RequestParam String keyword) {
        QueryWrapper<ProductInfo> wrapper = new QueryWrapper<>();
        wrapper.like("product_name", keyword)
               .or()
               .like("product_tag", keyword)
               .last("limit 20");

        List<ProductInfo> list = productInfoMapper.selectList(wrapper);

        List<ProductInfoResponse> result = list.stream().map(info -> {
            ProductInfoResponse response = new ProductInfoResponse();
            BeanUtils.copyProperties(info, response);
            return response;
        }).collect(Collectors.toList());

        return CommonResult.success(result);
    }
}