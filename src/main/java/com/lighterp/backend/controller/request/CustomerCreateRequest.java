package com.lighterp.backend.controller.request;

import lombok.Data;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Pattern;

/**
 * 创建客户请求
 */
@Data
public class CustomerCreateRequest {

    @NotBlank(message = "客户名字不能为空")
    @Pattern(regexp = "^[a-zA-Z0-9\\u4e00-\\u9fa5.@]+$", message = "客户名字只允许数字、字母、汉字以及\".\"和\"@\"的组合")
    private String customerName;

    @NotBlank(message = "客户地址不能为空")
    @Pattern(regexp = "^[a-zA-Z0-9\\u4e00-\\u9fa5.\\-/]+$", message = "客户地址只允许数字、字母、汉字以及\".\"和\"-\"和\"/\"的组合")
    private String customerAddress;

    private String customerPhone;
}