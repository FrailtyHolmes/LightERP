package com.lighterp.backend.controller.response;

import lombok.Data;

import java.math.BigDecimal;

/**
 * 出库产品响应
 */
@Data
public class SaleProductResponse {
    private Long id;
    private String invoiceId;
    private Long customerId;
    private Long productId;
    private String productName;
    private String productVolume;
    private String productSize;
    private BigDecimal productPrice;
    private Integer productNum;
    private BigDecimal productMoney;
    private String operater;
}