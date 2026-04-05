package com.lighterp.backend.controller.response;

import lombok.Data;

/**
 * 用户信息响应
 */
@Data
public class UserInfoResponse {
    private Long userId;
    private String userName;
    private String userAccount;
    private Integer userStatus;
}