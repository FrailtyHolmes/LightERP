package com.lighterp.backend.controller.request;

import lombok.Data;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Pattern;

/**
 * 创建产品请求
 */
@Data
public class ProductCreateRequest {

    @NotBlank(message = "产品名不能为空")
    @Pattern(regexp = "^[a-zA-Z0-9\\u4e00-\\u9fa5.@\\-]+$", message = "产品名只允许数字、字母、汉字以及\".\"和\"@\"和\"-\"的组合")
    private String productName;

    @NotBlank(message = "净含量不能为空")
    @Pattern(regexp = "^[0-9][a-zA-Z0-9.]*$", message = "净含量允许数字、字母以及\".\",且数字先行")
    private String productVolume;

    @NotBlank(message = "规格不能为空")
    @Pattern(regexp = "^[0-9][a-zA-Z0-9]*$", message = "规格允许数字、字母,且数字先行")
    private String productSize;

    private String productTag;
}