package com.lighterp.backend.controller.response;

import lombok.Data;

import java.math.BigDecimal;
import java.util.Date;

/**
 * 客户罚款响应
 */
@Data
public class CustomerPenaltyResponse {
    private Long penaltyId;
    private Long customerId;
    private String customerName;
    private String customerAddress;
    private BigDecimal penalty;
    private Date penaltyTime;
    private String comment;
    private Date createdTime;
}