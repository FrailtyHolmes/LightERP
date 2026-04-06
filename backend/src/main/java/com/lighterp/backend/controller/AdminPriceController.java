package com.lighterp.backend.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.lighterp.backend.common.BusinessException;
import com.lighterp.backend.common.CommonResult;
import com.lighterp.backend.common.PageResult;
import com.lighterp.backend.config.SessionUtils;
import com.lighterp.backend.controller.response.CustomerProductPriceResponse;
import com.lighterp.backend.entity.CustomerInfo;
import com.lighterp.backend.entity.CustomerProductPrice;
import com.lighterp.backend.entity.ProductInfo;
import com.lighterp.backend.mapper.CustomerInfoMapper;
import com.lighterp.backend.mapper.CustomerProductPriceMapper;
import com.lighterp.backend.mapper.ProductInfoMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 后台管理 - 客户产品单价管理
 */
@Slf4j
@RestController
@RequestMapping("/admin/price")
@RequiredArgsConstructor
public class AdminPriceController {

    private final CustomerProductPriceMapper priceMapper;
    private final CustomerInfoMapper customerInfoMapper;
    private final ProductInfoMapper productInfoMapper;

    /**
     * 单价列表查询
     */
    @GetMapping("/list")
    public CommonResult<PageResult<CustomerProductPriceResponse>> list(
            @RequestParam(required = false) Long customerId,
            @RequestParam(required = false) Long productId,
            @RequestParam(required = false) String effectiveDateStart,
            @RequestParam(required = false) String effectiveDateEnd,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer pageSize) {

        Page<CustomerProductPrice> pageParam = new Page<>(page, pageSize);
        QueryWrapper<CustomerProductPrice> wrapper = new QueryWrapper<>();

        if (customerId != null) {
            wrapper.eq("customer_id", customerId);
        }
        if (productId != null) {
            wrapper.eq("product_id", productId);
        }
        if (StringUtils.hasText(effectiveDateStart)) {
            wrapper.ge("effective_date_start", effectiveDateStart);
        }
        if (StringUtils.hasText(effectiveDateEnd)) {
            wrapper.le("effective_date_end", effectiveDateEnd);
        }

        wrapper.orderByDesc("created_time");
        Page<CustomerProductPrice> result = priceMapper.selectPage(pageParam, wrapper);

        PageResult<CustomerProductPriceResponse> pageResult = PageResult.of(
                result.getRecords().stream().map(price -> {
                    CustomerProductPriceResponse response = new CustomerProductPriceResponse();
                    BeanUtils.copyProperties(price, response);

                    // 填充客户和产品信息
                    CustomerInfo customer = customerInfoMapper.selectById(price.getCustomerId());
                    if (customer != null) {
                        response.setCustomerName(customer.getCustomerName());
                        response.setCustomerAddress(customer.getCustomerAddress());
                    }
                    ProductInfo product = productInfoMapper.selectById(price.getProductId());
                    if (product != null) {
                        response.setProductName(product.getProductName());
                        response.setProductVolume(product.getProductVolume());
                        response.setProductSize(product.getProductSize());
                    }
                    if (price.getPrice() == null) {
                        response.setPriceDisplay("未添加单价");
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
     * 添加单价
     */
    @PostMapping
    public CommonResult<Void> create(@RequestBody CustomerProductPrice request) {
        SessionUtils.checkSuper();

        // 检查客户和产品是否存在
        CustomerInfo customer = customerInfoMapper.selectById(request.getCustomerId());
        if (customer == null) {
            throw new BusinessException("该客户未注册，请先注册");
        }
        ProductInfo product = productInfoMapper.selectById(request.getProductId());
        if (product == null) {
            throw new BusinessException("该产品未注册，请先注册");
        }

        // 校验生效日期：开始日期必须早于结束日期
        if (request.getEffectiveDateStart() != null && request.getEffectiveDateEnd() != null
                && request.getEffectiveDateStart().after(request.getEffectiveDateEnd())) {
            throw new BusinessException("生效开始日期不能晚于生效结束日期");
        }

        // 先检查是否存在已逻辑删除的同维度记录，如果有则恢复
        Long deletedId = priceMapper.findDeletedRecordId(
                request.getCustomerId(), request.getProductId(), request.getEffectiveDateStart());
        if (deletedId != null) {
            priceMapper.restoreDeletedRecord(deletedId, request.getPrice(), request.getEffectiveDateEnd());
        } else {
            // 检查是否已存在未删除的同维度记录
            QueryWrapper<CustomerProductPrice> wrapper = new QueryWrapper<>();
            wrapper.eq("customer_id", request.getCustomerId())
                   .eq("product_id", request.getProductId());
            if (request.getEffectiveDateStart() != null) {
                wrapper.eq("effective_date_start", request.getEffectiveDateStart());
            } else {
                wrapper.isNull("effective_date_start");
            }

            Long count = priceMapper.selectCount(wrapper);
            if (count > 0) {
                throw new BusinessException("已存在该客户-产品单价记录");
            }

            priceMapper.insert(request);
        }

        log.info("添加客户产品单价: customerId={}, productId={}", request.getCustomerId(), request.getProductId());
        return CommonResult.success();
    }

    /**
     * 编辑单价
     */
    @PutMapping("/{id}")
    public CommonResult<Void> update(@PathVariable Long id, @RequestBody CustomerProductPrice request) {
        SessionUtils.checkSuper();

        CustomerProductPrice price = priceMapper.selectById(id);
        if (price == null) {
            throw new BusinessException("单价记录不存在");
        }

        // 校验生效日期：开始日期必须早于结束日期
        Date effectiveStart = request.getEffectiveDateStart() != null ? request.getEffectiveDateStart() : price.getEffectiveDateStart();
        Date effectiveEnd = request.getEffectiveDateEnd() != null ? request.getEffectiveDateEnd() : price.getEffectiveDateEnd();
        if (effectiveStart != null && effectiveEnd != null && effectiveStart.after(effectiveEnd)) {
            throw new BusinessException("生效开始日期不能晚于生效结束日期");
        }

        // 仅更新允许修改的字段，避免 BeanUtils.copyProperties 覆盖 id 等关键字段
        if (request.getPrice() != null) {
            price.setPrice(request.getPrice());
        }
        if (request.getEffectiveDateStart() != null) {
            price.setEffectiveDateStart(request.getEffectiveDateStart());
        }
        if (request.getEffectiveDateEnd() != null) {
            price.setEffectiveDateEnd(request.getEffectiveDateEnd());
        }

        priceMapper.updateById(price);

        log.info("编辑单价: id={}, customerId={}, productId={}", id, price.getCustomerId(), price.getProductId());
        return CommonResult.success();
    }

    /**
     * 删除单价
     */
    @DeleteMapping("/{id}")
    public CommonResult<Void> delete(@PathVariable Long id) {
        SessionUtils.checkSuper();

        CustomerProductPrice price = priceMapper.selectById(id);
        if (price == null) {
            throw new BusinessException("单价记录不存在");
        }

        priceMapper.deleteById(id);

        log.info("删除单价: {}", id);
        return CommonResult.success();
    }
}