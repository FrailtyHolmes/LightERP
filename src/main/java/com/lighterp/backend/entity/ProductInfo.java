package com.lighterp.backend.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.lighterp.backend.common.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 产品信息表
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("product_info")
public class ProductInfo extends BaseEntity {

    /**
     * 产品ID
     */
    @TableId(type = IdType.AUTO)
    private Long productId;

    /**
     * 产品名
     */
    private String productName;

    /**
     * 净含量
     */
    private String productVolume;

    /**
     * 规格
     */
    private String productSize;

    /**
     * 产品特点
     */
    private String productTag;
}