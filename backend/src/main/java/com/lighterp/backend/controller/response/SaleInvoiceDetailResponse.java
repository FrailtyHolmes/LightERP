package com.lighterp.backend.controller.response;

import lombok.Data;

import java.math.BigDecimal;
import java.util.Date;
import java.util.List;

/**
 * 出库发票详情响应
 */
@Data
public class SaleInvoiceDetailResponse {
    private String invoiceId;
    private Long customerId;
    private String customerName;
    private String customerAddress;
    private BigDecimal shippingFee;
    private Boolean isFreeShipping;
    private BigDecimal totalMoney;
    private Date invoiceTime;
    private String comment;
    private String operater;
    private Date createdTime;
    private List<SaleProductResponse> products;
}