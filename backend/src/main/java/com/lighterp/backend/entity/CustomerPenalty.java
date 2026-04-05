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
 * 客户罚款表
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("customer_penalty")
public class CustomerPenalty extends BaseEntity {

    /**
     * 罚款ID
     */
    @TableId(type = IdType.AUTO)
    private Long penaltyId;

    /**
     * 客户ID
     */
    private Long customerId;

    /**
     * 罚款金额
     */
    private BigDecimal penalty;

    /**
     * 罚款日期
     */
    private Date penaltyTime;

    /**
     * 备注
     */
    private String comment;
}