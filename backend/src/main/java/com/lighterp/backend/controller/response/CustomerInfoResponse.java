package com.lighterp.backend.controller.response;

import lombok.Data;

import java.math.BigDecimal;

/**
 * 客户信息响应
 */
@Data
public class CustomerInfoResponse {
    private Long customerId;
    private String customerName;
    private String customerAddress;
    private String customerPhone;
    private BigDecimal unpaidAmount;
}