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
 * 出库发票表实体类
 *
 * 记录每一次出库开票的信息，包括客户信息、开票日期、运费、总金额等
 *
 * @author LightERP
 * @version 1.0.0
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sale_invoice")
public class SaleInvoice extends BaseEntity {

    /**
     * 发票ID
     * 格式：SALE + 时间戳(yyyyMMddHHmmss) + 开票人姓名拼音
     * 例如：SALE20260405143030zhangsan
     */
    @TableId(type = IdType.INPUT)
    private String invoiceId;

    /**
     * 客户ID
     * 关联customer_info表的主键
     */
    private Long customerId;

    /**
     * 运费金额
     * 记录本次出库的运费，默认值为0
     */
    private BigDecimal shippingFee;

    /**
     * 是否免费运费
     * true - 生产商承担运费，不计入客户应付金额
     * false - 客户承担运费，计入客户应付金额
     */
    private Boolean isFreeShipping;

    /**
     * 本次出库总金额
     * 计算公式：产品出库金额总和 + (如果客户付运费则+运费)
     */
    private BigDecimal totalMoney;

    /**
     * 开票日期
     * 精确到日期，不含时间
     */
    private Date invoiceTime;

    /**
     * 发票备注
     * 可选字段，最多200字
     * 默认文案："补废xx、赠送xx"
     */
    private String comment;

    /**
     * 开票人
     * 记录本次开票的操作人员姓名
     */
    private String operater;
}