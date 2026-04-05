package com.lighterp.backend.common;

/**
 * 全局常量
 */
public class Constants {

    /**
     * 用户权限
     */
    public static final class UserStatus {
        /** 浏览者 */
        public static final int VIEWER = 0;
        /** 管理员 */
        public static final int ADMIN = 1;
        /** 超级管理员 */
        public static final int SUPER = 2;
    }

    /**
     * 校验正则
     */
    public static final class Regex {
        /** 用户名: 数字、字母、汉字 */
        public static final String USER_NAME = "^[a-zA-Z0-9\\u4e00-\\u9fa5]+$";
        /** 用户账号: 6-18位数字 */
        public static final String USER_ACCOUNT = "^\\d{6,18}$";
        /** 用户密码: 6-18位数字、字母 */
        public static final String USER_PASSWORD = "^[a-zA-Z0-9]{6,18}$";
        /** 客户名字: 数字、字母、汉字以及.和@ */
        public static final String CUSTOMER_NAME = "^[a-zA-Z0-9\\u4e00-\\u9fa5.@]+$";
        /** 客户地址: 数字、字母、汉字以及.和-和/ */
        public static final String CUSTOMER_ADDRESS = "^[a-zA-Z0-9\\u4e00-\\u9fa5.\\-/]+$";
        /** 产品名: 数字、字母、汉字以及.和@和- */
        public static final String PRODUCT_NAME = "^[a-zA-Z0-9\\u4e00-\\u9fa5.@\\-]+$";
        /** 净含量: 数字、字母、.，数字先行 */
        public static final String PRODUCT_VOLUME = "^[0-9][a-zA-Z0-9.]*$";
        /** 规格: 数字、字母，数字先行 */
        public static final String PRODUCT_SIZE = "^[0-9][a-zA-Z0-9]*$";
    }

    /**
     * 分页默认值
     */
    public static final class Page {
        public static final int DEFAULT_PAGE = 1;
        public static final int DEFAULT_PAGE_SIZE = 10;
        public static final int MAX_PAGE_SIZE = 100;
    }

    /**
     * 业务常量
     */
    public static final class Business {
        /** 备注默认文案-发票 */
        public static final String INVOICE_DEFAULT_COMMENT = "补废xx、赠送xx";
        /** 备注默认文案-罚款 */
        public static final String PENALTY_DEFAULT_COMMENT = "罚款原因";
    }

    /**
     * 发票ID前缀
     */
    public static final String INVOICE_ID_PREFIX = "SALE";
}