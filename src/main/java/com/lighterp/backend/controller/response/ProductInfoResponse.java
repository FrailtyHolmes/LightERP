package com.lighterp.backend.controller.response;

import lombok.Data;

/**
 * 产品信息响应
 */
@Data
public class ProductInfoResponse {
    private Long productId;
    private String productName;
    private String productVolume;
    private String productSize;
    private String productTag;
}