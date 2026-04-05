package com.lighterp.backend.controller.response;

import lombok.Data;

import java.math.BigDecimal;
import java.util.Date;

/**
 * 客户产品单价响应
 */
@Data
public class CustomerProductPriceResponse {
    private Long id;
    private Long customerId;
    private Long productId;
    private BigDecimal price;
    private Date effectiveDateStart;
    private Date effectiveDateEnd;

    // 扩展信息
    private String customerName;
    private String customerAddress;
    private String productName;
    private String productVolume;
    private String productSize;
    private String priceDisplay;
}