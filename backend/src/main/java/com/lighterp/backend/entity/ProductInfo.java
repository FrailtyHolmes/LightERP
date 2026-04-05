package com.lighterp.backend.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.lighterp.backend.common.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 产品信息表实体类
 *
 * 负责存储产品的基础信息，包括产品名、净含量、规格和特点标签
 *
 * @author LightERP
 * @version 1.0.0
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("product_info")
public class ProductInfo extends BaseEntity {

    /**
     * 产品ID
     * 数据库自增生成
     */
    @TableId(type = IdType.AUTO)
    private Long productId;

    /**
     * 产品名称
     * 支持数字、字母、汉字以及".","@","-"的组合
     */
    private String productName;

    /**
     * 产品净含量
     * 格式要求：数字先行，允许字母和"."的组合
     * 例如：500ml, 1L等
     */
    private String productVolume;

    /**
     * 产品规格
     * 格式要求：数字先行，允许字母组合
     * 例如：10*10, 50g等
     */
    private String productSize;

    /**
     * 产品特点/标签
     * 用于描述产品的特殊属性，多个特点用分号分隔
     * 为可选字段，前端需提示输入规则
     */
    private String productTag;
}