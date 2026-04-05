package com.lighterp.backend.controller.response;

import lombok.Data;

import java.math.BigDecimal;
import java.util.Date;

/**
 * 客户货款响应
 */
@Data
public class CustomerPaymentResponse {
    private Long paymentId;
    private Long customerId;
    private String customerName;
    private String customerAddress;
    private BigDecimal payment;
    private Date paymentTime;
    private String comment;
    private Date createdTime;
}