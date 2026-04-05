package com.lighterp.backend.controller.request;

import lombok.Data;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Pattern;

/**
 * 登录请求
 */
@Data
public class LoginRequest {

    @NotBlank(message = "用户账号不能为空")
    @Pattern(regexp = "^\\d{6,18}$", message = "用户账号只允许6-18位数字")
    private String userAccount;

    @NotBlank(message = "用户密码不能为空")
    @Pattern(regexp = "^[a-zA-Z0-9]{6,18}$", message = "用户密码必须为6-18位数字、字母的组合")
    private String password;
}