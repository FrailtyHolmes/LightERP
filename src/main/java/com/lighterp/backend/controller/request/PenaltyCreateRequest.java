package com.lighterp.backend.controller.request;

import lombok.Data;

import javax.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.Date;

/**
 * 录入罚款请求
 */
@Data
public class PenaltyCreateRequest {

    @NotNull(message = "客户ID不能为空")
    private Long customerId;

    @NotNull(message = "罚款金额不能为空")
    private BigDecimal penalty;

    private Date penaltyTime;

    private String comment;
}