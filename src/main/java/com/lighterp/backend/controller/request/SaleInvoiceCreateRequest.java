package com.lighterp.backend.controller.request;

import com.lighterp.backend.entity.SaleProduct;
import lombok.Data;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.Date;
import java.util.List;

/**
 * 创建出库发票请求
 */
@Data
public class SaleInvoiceCreateRequest {

    private String invoiceId;

    @NotNull(message = "客户ID不能为空")
    private Long customerId;

    private Date invoiceTime;

    @NotBlank(message = "开票人不能为空")
    private String operater;

    private Boolean isFreeShipping;

    private BigDecimal shippingFee;

    private String comment;

    private List<SaleProduct> products;
}