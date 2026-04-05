package com.lighterp.backend.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.lighterp.backend.common.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 用户信息表实体类
 *
 * 负责存储系统用户的基本信息，包括用户名、账号、密码和权限
 *
 * @author LightERP
 * @version 1.0.0
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("user_info")
public class UserInfo extends BaseEntity {

    /**
     * 用户ID
     * 采用雪花算法自动生成
     */
    @TableId(type = IdType.ASSIGN_ID)
    private Long userId;

    /**
     * 用户名
     * 支持数字、字母、汉字组合
     */
    private String userName;

    /**
     * 用户账号
     * 6-18位数字，用于登录系统
     */
    private String userAccount;

    /**
     * 用户密码
     * 使用BCrypt加密存储
     */
    private String userPassword;

    /**
     * 用户权限
     * 0-浏览者(viewer)
     * 1-管理员(admin)
     * 2-超级管理员(super)
     * @see com.lighterp.backend.common.Constants.UserStatus
     */
    private Integer userStatus;
}