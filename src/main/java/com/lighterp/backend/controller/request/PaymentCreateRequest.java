package com.lighterp.backend.controller.request;

import lombok.Data;

import javax.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.Date;

/**
 * 录入货款请求
 */
@Data
public class PaymentCreateRequest {

    @NotNull(message = "客户ID不能为空")
    private Long customerId;

    @NotNull(message = "付款金额不能为空")
    private BigDecimal payment;

    @NotNull(message = "付款时间不能为空")
    private Date paymentTime;

    private String comment;
}