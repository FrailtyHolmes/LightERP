package com.lighterp.backend.controller.response;

import lombok.Data;

import java.math.BigDecimal;
import java.util.Date;
import java.util.List;

/**
 * 客户对账响应
 */
@Data
public class CustomerReconciliationResponse {

    private String customerName;
    private String customerAddress;

    private List<InvoiceItem> invoices;
    private BigDecimal invoiceTotalMoney;

    private List<PaymentItem> payments;
    private BigDecimal paymentTotalMoney;

    private List<PenaltyItem> penalties;
    private BigDecimal penaltyTotalMoney;

    private BigDecimal unpaidMoney;

    @Data
    public static class InvoiceItem {
        private String invoiceId;
        private BigDecimal invoiceMoney;
        private BigDecimal shippingFee;
        private Boolean isFreeShipping;
        private BigDecimal totalMoney;
        private Date invoiceTime;
    }

    @Data
    public static class PaymentItem {
        private Long paymentId;
        private BigDecimal payment;
        private Date paymentTime;
        private String comment;
    }

    @Data
    public static class PenaltyItem {
        private Long penaltyId;
        private BigDecimal penalty;
        private Date penaltyTime;
        private String comment;
    }
}