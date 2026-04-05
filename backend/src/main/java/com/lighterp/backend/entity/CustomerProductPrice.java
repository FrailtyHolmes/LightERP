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
 * 客户-产品单价表
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("customer_product_price")
public class CustomerProductPrice extends BaseEntity {

    /**
     * 主键ID
     */
    @TableId(type = IdType.ASSIGN_ID)
    private Long id;

    /**
     * 客户ID
     */
    private Long customerId;

    /**
     * 产品ID
     */
    private Long productId;

    /**
     * 单价
     */
    private BigDecimal price;

    /**
     * 生效开始日期
     */
    private Date effectiveDateStart;

    /**
     * 生效结束日期
     */
    private Date effectiveDateEnd;
}