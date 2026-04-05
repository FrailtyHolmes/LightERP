package com.lighterp.backend.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.lighterp.backend.common.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

/**
 * 出库产品表
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sale_product")
public class SaleProduct extends BaseEntity {

    /**
     * 主键ID
     */
    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 发票ID
     */
    private String invoiceId;

    /**
     * 客户ID
     */
    private Long customerId;

    /**
     * 产品ID
     */
    private Long productId;

    /**
     * 产品单价
     */
    private BigDecimal productPrice;

    /**
     * 产品数量
     */
    private Integer productNum;

    /**
     * 产品出库金额
     */
    private BigDecimal productMoney;

    /**
     * 开票人
     */
    private String operater;
}