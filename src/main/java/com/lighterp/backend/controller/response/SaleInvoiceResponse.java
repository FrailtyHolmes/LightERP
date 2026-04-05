package com.lighterp.backend.controller.response;

import lombok.Data;

import java.math.BigDecimal;
import java.util.Date;

/**
 * 出库发票响应
 */
@Data
public class SaleInvoiceResponse {
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
}