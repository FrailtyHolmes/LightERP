package com.lighterp.backend.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.lighterp.backend.common.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.util.Date;

/**
 * 客户货款表
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("customer_payment")
public class CustomerPayment extends BaseEntity {

    /**
     * 付款ID
     */
    @TableId(type = IdType.ASSIGN_ID)
    private Long paymentId;

    /**
     * 客户ID
     */
    private Long customerId;

    /**
     * 付款金额
     */
    private BigDecimal payment;

    /**
     * 付款时间
     */
    private Date paymentTime;

    /**
     * 备注
     */
    private String comment;
}