package com.lighterp.backend.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.lighterp.backend.common.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 客户信息表
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("customer_info")
public class CustomerInfo extends BaseEntity {

    /**
     * 客户ID
     */
    @TableId(type = IdType.AUTO)
    private Long customerId;

    /**
     * 客户名
     */
    private String customerName;

    /**
     * 客户地址
     */
    private String customerAddress;

    /**
     * 联系方式
     */
    private String customerPhone;
}