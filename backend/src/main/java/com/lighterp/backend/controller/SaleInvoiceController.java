package com.lighterp.backend.controller;

import com.alibaba.fastjson2.JSON;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.lighterp.backend.common.BusinessException;
import com.lighterp.backend.common.CommonResult;
import com.lighterp.backend.common.Constants;
import com.lighterp.backend.common.PageResult;
import com.lighterp.backend.config.SessionUtils;
import com.lighterp.backend.controller.request.SaleInvoiceCreateRequest;
import com.lighterp.backend.controller.request.SaleInvoiceEditRequest;
import com.lighterp.backend.controller.response.SaleInvoiceDetailResponse;
import com.lighterp.backend.controller.response.SaleInvoiceResponse;
import com.lighterp.backend.controller.response.SaleProductResponse;
import com.lighterp.backend.entity.CustomerInfo;
import com.lighterp.backend.entity.CustomerProductPrice;
import com.lighterp.backend.entity.ProductInfo;
import com.lighterp.backend.entity.SaleInvoice;
import com.lighterp.backend.entity.SaleProduct;
import com.lighterp.backend.mapper.CustomerInfoMapper;
import com.lighterp.backend.mapper.CustomerProductPriceMapper;
import com.lighterp.backend.mapper.ProductInfoMapper;
import com.lighterp.backend.mapper.SaleInvoiceMapper;
import com.lighterp.backend.mapper.SaleProductMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.sourceforge.pinyin4j.PinyinHelper;
import net.sourceforge.pinyin4j.format.HanyuPinyinCaseType;
import net.sourceforge.pinyin4j.format.HanyuPinyinOutputFormat;
import org.springframework.beans.BeanUtils;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 销售模块 - 出库发票
 */
@Slf4j
@RestController
@RequestMapping("/sale/invoice")
@RequiredArgsConstructor
public class SaleInvoiceController {

    private final SaleInvoiceMapper saleInvoiceMapper;
    private final SaleProductMapper saleProductMapper;
    private final CustomerInfoMapper customerInfoMapper;
    private final ProductInfoMapper productInfoMapper;
    private final CustomerProductPriceMapper customerProductPriceMapper;

    /**
     * 创建出库发票
     */
    @PostMapping
    @Transactional(rollbackFor = Exception.class)
    public CommonResult<SaleInvoiceResponse> create(@RequestBody SaleInvoiceCreateRequest request) {
        SessionUtils.checkAdmin();

        // 检查客户是否存在
        CustomerInfo customer = customerInfoMapper.selectById(request.getCustomerId());
        if (customer == null) {
            throw new BusinessException("该客户未注册，请先注册");
        }

        // 生成发票ID: SALE + 时间 + 开票人拼音
        String invoiceId = generateInvoiceId(request.getOperater());
        request.setInvoiceId(invoiceId);

        // 计算出库总金额
        BigDecimal totalProductMoney = BigDecimal.ZERO;
        if (!CollectionUtils.isEmpty(request.getProducts())) {
            for (SaleProduct product : request.getProducts()) {
                // 检查产品是否存在
                ProductInfo productInfo = productInfoMapper.selectById(product.getProductId());
                if (productInfo == null) {
                    throw new BusinessException("该产品未注册，请先注册");
                }

                // 如果没有手动设置单价，自动查询客户-产品单价
                if (product.getProductPrice() == null) {
                    CustomerProductPrice price = customerProductPriceMapper.selectOne(
                            new QueryWrapper<CustomerProductPrice>()
                                    .eq("customer_id", request.getCustomerId())
                                    .eq("product_id", product.getProductId())
                                    .isNull("effective_date_end")
                                    .or()
                                    .ge("effective_date_end", new Date())
                    );
                    if (price != null) {
                        product.setProductPrice(price.getPrice());
                    }
                }

                // 计算出库金额
                if (product.getProductPrice() != null && product.getProductNum() != null) {
                    product.setProductMoney(product.getProductPrice().multiply(new BigDecimal(product.getProductNum())));
                }

                if (product.getProductMoney() != null) {
                    totalProductMoney = totalProductMoney.add(product.getProductMoney());
                }
            }
        }

        // 计算总金额
        BigDecimal totalMoney = totalProductMoney;
        if (request.getIsFreeShipping() != null && !request.getIsFreeShipping()) {
            // 客户付运费，计入总金额
            if (request.getShippingFee() != null) {
                totalMoney = totalMoney.add(request.getShippingFee());
            }
        }

        // 创建发票
        SaleInvoice invoice = new SaleInvoice();
        BeanUtils.copyProperties(request, invoice);
        invoice.setTotalMoney(totalMoney);
        saleInvoiceMapper.insert(invoice);

        // 创建出库产品
        if (!CollectionUtils.isEmpty(request.getProducts())) {
            for (SaleProduct product : request.getProducts()) {
                product.setInvoiceId(invoiceId);
                product.setCustomerId(request.getCustomerId());
                product.setOperater(request.getOperater());
                saleProductMapper.insert(product);
            }
        }

        log.info("创建出库发票: {}", invoiceId);

        SaleInvoiceResponse response = new SaleInvoiceResponse();
        BeanUtils.copyProperties(invoice, response);
        return CommonResult.success(response);
    }

    /**
     * 发票列表查询
     */
    @GetMapping("/list")
    public CommonResult<PageResult<SaleInvoiceResponse>> list(
            @RequestParam(required = false) Long customerId,
            @RequestParam(required = false) String customerName,
            @RequestParam(required = false) String invoiceTimeStart,
            @RequestParam(required = false) String invoiceTimeEnd,
            @RequestParam(required = false) String operater,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer pageSize) {

        Page<SaleInvoice> pageParam = new Page<>(page, pageSize);
        QueryWrapper<SaleInvoice> wrapper = new QueryWrapper<>();

        if (customerId != null) {
            wrapper.eq("customer_id", customerId);
        }
        if (StringUtils.hasText(invoiceTimeStart)) {
            wrapper.ge("invoice_time", invoiceTimeStart);
        }
        if (StringUtils.hasText(invoiceTimeEnd)) {
            wrapper.le("invoice_time", invoiceTimeEnd);
        }
        if (StringUtils.hasText(operater)) {
            wrapper.like("operater", operater);
        }

        // 如果传了客户名，需要先查询客户ID
        if (StringUtils.hasText(customerName)) {
            List<CustomerInfo> customers = customerInfoMapper.selectList(
                    new QueryWrapper<CustomerInfo>().like("customer_name", customerName)
            );
            if (!customers.isEmpty()) {
                List<Long> customerIds = customers.stream().map(CustomerInfo::getCustomerId).collect(Collectors.toList());
                wrapper.in("customer_id", customerIds);
            } else {
                wrapper.eq("customer_id", -1); // 没有匹配的客户
            }
        }

        wrapper.orderByDesc("created_time");
        Page<SaleInvoice> result = saleInvoiceMapper.selectPage(pageParam, wrapper);

        // 填充客户信息 - 使用final避免lambda变量问题
        final Map<Long, CustomerInfo> customerMap = new HashMap<>();
        if (!result.getRecords().isEmpty()) {
            List<Long> cIds = result.getRecords().stream().map(SaleInvoice::getCustomerId).distinct().collect(Collectors.toList());
            List<CustomerInfo> cList = customerInfoMapper.selectBatchIds(cIds);
            customerMap.putAll(cList.stream().collect(Collectors.toMap(CustomerInfo::getCustomerId, c -> c)));
        }

        // 使用临时变量避免lambda引用问题
        final Map<Long, CustomerInfo> customerMapFinal = customerMap;

        PageResult<SaleInvoiceResponse> pageResult = PageResult.of(
                result.getRecords().stream().map(invoice -> {
                    SaleInvoiceResponse response = new SaleInvoiceResponse();
                    BeanUtils.copyProperties(invoice, response);
                    CustomerInfo c = customerMapFinal.get(invoice.getCustomerId());
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
     * 发票详情
     */
    @GetMapping("/{id}/detail")
    public CommonResult<SaleInvoiceDetailResponse> detail(@PathVariable String id) {
        SaleInvoice invoice = saleInvoiceMapper.selectById(id);
        if (invoice == null) {
            throw new BusinessException("发票不存在");
        }

        SaleInvoiceDetailResponse response = new SaleInvoiceDetailResponse();
        BeanUtils.copyProperties(invoice, response);

        // 填充客户信息
        CustomerInfo customer = customerInfoMapper.selectById(invoice.getCustomerId());
        if (customer != null) {
            response.setCustomerName(customer.getCustomerName());
            response.setCustomerAddress(customer.getCustomerAddress());
        }

        // 填充出库产品
        List<SaleProduct> products = saleProductMapper.selectList(
                new QueryWrapper<SaleProduct>().eq("invoice_id", id)
        );

        // 填充产品信息
        Map<Long, ProductInfo> productMapTemp = new HashMap<>();
        if (!products.isEmpty()) {
            List<Long> pIds = products.stream().map(SaleProduct::getProductId).distinct().collect(Collectors.toList());
            List<ProductInfo> pList = productInfoMapper.selectBatchIds(pIds);
            productMapTemp = pList.stream().collect(Collectors.toMap(ProductInfo::getProductId, p -> p));
        }
        final Map<Long, ProductInfo> productMap = productMapTemp;

        List<SaleProductResponse> productResponses = products.stream().map(p -> {
            SaleProductResponse pr = new SaleProductResponse();
            BeanUtils.copyProperties(p, pr);
            ProductInfo pi = productMap.get(p.getProductId());
            if (pi != null) {
                pr.setProductName(pi.getProductName());
                pr.setProductVolume(pi.getProductVolume());
                pr.setProductSize(pi.getProductSize());
            }
            return pr;
        }).collect(Collectors.toList());

        response.setProducts(productResponses);

        return CommonResult.success(response);
    }

    /**
     * 删除发票
     */
    @DeleteMapping("/{id}")
    public CommonResult<Void> delete(@PathVariable String id) {
        SessionUtils.checkAdmin();

        SaleInvoice invoice = saleInvoiceMapper.selectById(id);
        if (invoice == null) {
            throw new BusinessException("发票不存在");
        }

        // 逻辑删除发票
        saleInvoiceMapper.deleteById(id);

        // 逻辑删除出库产品
        saleProductMapper.delete(new QueryWrapper<SaleProduct>().eq("invoice_id", id));

        log.info("删除发票: {}", id);
        return CommonResult.success();
    }

    /**
     * 编辑发票
     */
    @PutMapping("/{id}")
    @Transactional(rollbackFor = Exception.class)
    public CommonResult<SaleInvoiceResponse> update(
            @PathVariable String id,
            @Validated @RequestBody SaleInvoiceEditRequest request) {
        SessionUtils.checkAdmin();

        SaleInvoice existingInvoice = saleInvoiceMapper.selectById(id);
        if (existingInvoice == null) {
            throw new BusinessException("发票不存在");
        }

        // 检查客户是否存在
        CustomerInfo customer = customerInfoMapper.selectById(request.getCustomerId());
        if (customer == null) {
            throw new BusinessException("该客户未注册，请先注册");
        }

        // 计算出库总金额
        BigDecimal totalProductMoney = BigDecimal.ZERO;
        if (!CollectionUtils.isEmpty(request.getProducts())) {
            for (SaleProduct product : request.getProducts()) {
                ProductInfo productInfo = productInfoMapper.selectById(product.getProductId());
                if (productInfo == null) {
                    throw new BusinessException("该产品未注册，请先注册");
                }

                if (product.getProductPrice() != null && product.getProductNum() != null) {
                    product.setProductMoney(product.getProductPrice().multiply(new BigDecimal(product.getProductNum())));
                }

                if (product.getProductMoney() != null) {
                    totalProductMoney = totalProductMoney.add(product.getProductMoney());
                }
            }
        }

        // 计算总金额
        BigDecimal totalMoney = totalProductMoney;
        if (request.getIsFreeShipping() != null && !request.getIsFreeShipping()) {
            if (request.getShippingFee() != null) {
                totalMoney = totalMoney.add(request.getShippingFee());
            }
        }

        // 更新发票
        SaleInvoice invoice = new SaleInvoice();
        invoice.setInvoiceId(id);
        invoice.setCustomerId(request.getCustomerId());
        invoice.setInvoiceTime(request.getInvoiceTime());
        invoice.setOperater(request.getOperater());
        invoice.setIsFreeShipping(request.getIsFreeShipping());
        invoice.setShippingFee(request.getShippingFee());
        invoice.setComment(request.getComment());
        invoice.setTotalMoney(totalMoney);
        saleInvoiceMapper.updateById(invoice);

        // 删除旧出库产品，创建新的
        saleProductMapper.delete(new QueryWrapper<SaleProduct>().eq("invoice_id", id));
        if (!CollectionUtils.isEmpty(request.getProducts())) {
            for (SaleProduct product : request.getProducts()) {
                product.setInvoiceId(id);
                product.setCustomerId(request.getCustomerId());
                product.setOperater(request.getOperater());
                saleProductMapper.insert(product);
            }
        }

        log.info("编辑发票: {}", id);

        SaleInvoiceResponse response = new SaleInvoiceResponse();
        BeanUtils.copyProperties(invoice, response);
        return CommonResult.success(response);
    }

    /**
     * 生成发票ID
     */
    private String generateInvoiceId(String operater) {
        SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMddHHmmss");
        String timeStr = sdf.format(new Date());
        String pinyin = cnToPinyin(operater);
        return Constants.INVOICE_ID_PREFIX + timeStr + pinyin;
    }

    /**
     * 中文转拼音
     */
    private String cnToPinyin(String cn) {
        if (cn == null || cn.isEmpty()) {
            return "";
        }
        HanyuPinyinOutputFormat format = new HanyuPinyinOutputFormat();
        format.setCaseType(HanyuPinyinCaseType.LOWERCASE);
        StringBuilder result = new StringBuilder();
        char[] chars = cn.toCharArray();
        for (char c : chars) {
            try {
                String[] pinyins = PinyinHelper.toHanyuPinyinStringArray(c, format);
                if (pinyins != null && pinyins.length > 0) {
                    result.append(pinyins[0]);
                } else {
                    // 非中文字符（英文、数字等）直接保留
                    result.append(Character.toLowerCase(c));
                }
            } catch (net.sourceforge.pinyin4j.format.exception.BadHanyuPinyinOutputFormatCombination e) {
                log.warn("拼音转换失败: {}", c, e);
                result.append(c);
            }
        }
        return result.toString();
    }
}