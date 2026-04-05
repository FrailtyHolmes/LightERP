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
 * 出库发票表
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sale_invoice")
public class SaleInvoice extends BaseEntity {

    /**
     * 发票ID
     */
    @TableId(type = IdType.INPUT)
    private String invoiceId;

    /**
     * 客户ID
     */
    private Long customerId;

    /**
     * 运费金额
     */
    private BigDecimal shippingFee;

    /**
     * 是否付运费: 0-客户付, 1-生产商付
     */
    private Boolean isFreeShipping;

    /**
     * 本次出库总金额
     */
    private BigDecimal totalMoney;

    /**
     * 开票日期
     */
    private Date invoiceTime;

    /**
     * 发票备注
     */
    private String comment;

    /**
     * 开票人
     */
    private String operater;
}