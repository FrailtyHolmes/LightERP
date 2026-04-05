package com.lighterp.backend.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.lighterp.backend.common.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 客户信息表实体类
 *
 * 负责存储客户的基本信息，包括客户名称、地址和联系方式
 *
 * @author LightERP
 * @version 1.0.0
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("customer_info")
public class CustomerInfo extends BaseEntity {

    /**
     * 客户ID
     * 采用雪花算法自动生成
     */
    @TableId(type = IdType.AUTO)
    private Long customerId;

    /**
     * 客户名称
     * 支持数字、字母、汉字以及"."和"@"的组合
     * 该字段与customer_address共同构成唯一约束
     */
    private String customerName;

    /**
     * 客户地址
     * 支持数字、字母、汉字以及"."、"-"、"/"的组合
     * 该字段与customer_name共同构成唯一约束
     */
    private String customerAddress;

    /**
     * 客户联系方式
     * 可选的联系方式信息
     */
    private String customerPhone;
}