package com.lighterp.backend.controller.request;

import lombok.Data;

import javax.validation.constraints.Pattern;

/**
 * 更新用户请求
 */
@Data
public class UserUpdateRequest {

    @Pattern(regexp = "^[a-zA-Z0-9\\u4e00-\\u9fa5]+$", message = "用户名只允许数字、字母、汉字的组合")
    private String userName;

    @Pattern(regexp = "^[a-zA-Z0-9]{6,18}$", message = "用户密码必须为6-18位数字、字母的组合")
    private String password;

    private Integer userStatus;
}