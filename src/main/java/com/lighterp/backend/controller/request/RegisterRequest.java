package com.lighterp.backend.controller.request;

import lombok.Data;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Pattern;

/**
 * 注册请求
 */
@Data
public class RegisterRequest {

    @NotBlank(message = "用户名不能为空")
    @Pattern(regexp = "^[a-zA-Z0-9\\u4e00-\\u9fa5]+$", message = "用户名只允许数字、字母、汉字的组合")
    private String userName;

    @NotBlank(message = "用户账号不能为空")
    @Pattern(regexp = "^\\d{6,18}$", message = "用户账号只允许6-18位数字")
    private String userAccount;

    @NotBlank(message = "用户密码不能为空")
    @Pattern(regexp = "^[a-zA-Z0-9]{6,18}$", message = "用户密码必须为6-18位数字、字母的组合")
    private String password;

    @NotBlank(message = "确认密码不能为空")
    private String confirmPassword;
}