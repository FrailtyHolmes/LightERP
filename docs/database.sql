-- ============================================
-- LightERP 数据库创建脚本
-- 数据库版本: MySQL 8.0+
-- 创建时间: 2026-04-05
-- ============================================

CREATE DATABASE IF NOT EXISTS lighterp
    DEFAULT CHARACTER SET utf8mb4
    DEFAULT COLLATE utf8mb4_unicode_ci;

USE lighterp;

-- ============================================
-- 1. 用户信息表
-- ============================================
DROP TABLE IF EXISTS user_info;
CREATE TABLE user_info (
    user_id         BIGINT         AUTO_INCREMENT PRIMARY KEY COMMENT '用户ID(自增)',
    user_name       VARCHAR(50)    NOT NULL COMMENT '用户名',
    user_account    VARCHAR(18)    NOT NULL UNIQUE COMMENT '用户账号(6-18位数字)',
    user_password   VARCHAR(100)   NOT NULL COMMENT '用户密码(Bcrypt加密)',
    user_status     INT            DEFAULT 0 COMMENT '用户权限:0-viewer,1-admin,2-super',
    created_time    DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    modified_time   DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    modified_user   BIGINT         COMMENT '更新者用户ID',
    deleted         INT            DEFAULT 0 COMMENT '逻辑删除:0-未删除,1-已删除',
    INDEX idx_user_account (user_account),
    INDEX idx_user_status (user_status),
    INDEX idx_deleted (deleted)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户信息表';

-- ============================================
-- 2. 客户信息表
-- ============================================
DROP TABLE IF EXISTS customer_info;
CREATE TABLE customer_info (
    customer_id     BIGINT         AUTO_INCREMENT PRIMARY KEY COMMENT '客户ID(自增)',
    customer_name   VARCHAR(100)   NOT NULL COMMENT '客户名',
    customer_address VARCHAR(200)  NOT NULL COMMENT '客户地址',
    customer_phone  VARCHAR(20)    COMMENT '联系方式',
    created_time    DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    modified_time   DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    modified_user   BIGINT         COMMENT '更新者用户ID',
    deleted         INT            DEFAULT 0 COMMENT '逻辑删除:0-未删除,1-已删除',
    UNIQUE KEY uk_name_address (customer_name, customer_address),
    INDEX idx_customer_name (customer_name),
    INDEX idx_deleted (deleted)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='客户信息表';

-- ============================================
-- 3. 产品信息表
-- ============================================
DROP TABLE IF EXISTS product_info;
CREATE TABLE product_info (
    product_id      BIGINT         AUTO_INCREMENT PRIMARY KEY COMMENT '产品ID(自增)',
    product_name    VARCHAR(100)   NOT NULL COMMENT '产品名',
    product_volume  VARCHAR(50)    NOT NULL COMMENT '净含量',
    product_size    VARCHAR(50)    NOT NULL COMMENT '规格',
    product_tag     VARCHAR(500)   COMMENT '产品特点(多个用分号分隔)',
    created_time    DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    modified_time   DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    modified_user   BIGINT         COMMENT '更新者用户ID',
    deleted         INT            DEFAULT 0 COMMENT '逻辑删除:0-未删除,1-已删除',
    UNIQUE KEY uk_name_volume_size (product_name, product_volume, product_size),
    INDEX idx_product_name (product_name),
    INDEX idx_deleted (deleted)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='产品信息表';

-- ============================================
-- 4. 客户-产品单价表
-- ============================================
DROP TABLE IF EXISTS customer_product_price;
CREATE TABLE customer_product_price (
    id                  BIGINT         AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID(自增)',
    customer_id         BIGINT         NOT NULL COMMENT 'customer_info的主键',
    product_id          BIGINT         NOT NULL COMMENT 'product_info的主键',
    price               DECIMAL(12,2)  COMMENT '单价',
    effective_date_start DATE          COMMENT '生效开始日期',
    effective_date_end   DATE          COMMENT '生效结束日期',
    created_time        DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    modified_time       DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    modified_user       BIGINT         COMMENT '更新者用户ID',
    deleted             INT            DEFAULT 0 COMMENT '逻辑删除:0-未删除,1-已删除',
    UNIQUE KEY uk_customer_product (customer_id, product_id, effective_date_start),
    INDEX idx_customer_id (customer_id),
    INDEX idx_product_id (product_id),
    INDEX idx_deleted (deleted)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='客户-产品单价表';

-- ============================================
-- 5. 出库发票表
-- ============================================
DROP TABLE IF EXISTS sale_invoice;
CREATE TABLE sale_invoice (
    invoice_id         VARCHAR(50)    PRIMARY KEY COMMENT '发票ID(SALE+时间+开票人拼音)',
    customer_id        BIGINT         NOT NULL COMMENT 'customer_info的主键',
    shipping_fee       DECIMAL(12,2)  DEFAULT 0 COMMENT '运费金额',
    is_free_shipping   TINYINT(1)     DEFAULT 0 COMMENT '是否付运费:0-客户付,1-生产商付',
    total_money        DECIMAL(12,2)  NOT NULL DEFAULT 0 COMMENT '本次出库总金额',
    invoice_time       DATE           NOT NULL COMMENT '开票日期',
    comment            VARCHAR(500)   COMMENT '发票备注(200字以内)',
    operater           VARCHAR(50)    NOT NULL COMMENT '开票人',
    created_time       DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    modified_time      DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    modified_user      BIGINT         COMMENT '更新者用户ID',
    deleted            INT            DEFAULT 0 COMMENT '逻辑删除:0-未删除,1-已删除',
    INDEX idx_customer_id (customer_id),
    INDEX idx_invoice_time (invoice_time),
    INDEX idx_operater (operater),
    INDEX idx_deleted (deleted)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='出库发票表';

-- ============================================
-- 6. 出库产品表
-- ============================================
DROP TABLE IF EXISTS sale_product;
CREATE TABLE sale_product (
    id                  BIGINT         AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID(自增)',
    invoice_id          VARCHAR(50)    NOT NULL COMMENT 'sale_invoice的主键',
    customer_id         BIGINT         NOT NULL COMMENT 'customer_info的主键',
    product_id          BIGINT         NOT NULL COMMENT 'product_info的主键',
    product_price       DECIMAL(12,2)  NOT NULL COMMENT '产品单价',
    product_num         INT            NOT NULL COMMENT '产品数量(自然数)',
    product_money       DECIMAL(12,2)  NOT NULL COMMENT '产品出库金额',
    operater            VARCHAR(50)    NOT NULL COMMENT '开票人',
    created_time        DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    modified_time       DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    modified_user       BIGINT         COMMENT '更新者用户ID',
    deleted             INT            DEFAULT 0 COMMENT '逻辑删除:0-未删除,1-已删除',
    INDEX idx_invoice_id (invoice_id),
    INDEX idx_customer_id (customer_id),
    INDEX idx_product_id (product_id),
    INDEX idx_deleted (deleted)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='出库产品表';

-- ============================================
-- 7. 客户货款表
-- ============================================
DROP TABLE IF EXISTS customer_payment;
CREATE TABLE customer_payment (
    payment_id         BIGINT         AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID(自增)',
    customer_id        BIGINT         NOT NULL COMMENT 'customer_info的主键',
    payment            DECIMAL(12,2)  NOT NULL COMMENT '付款金额',
    payment_time       DATE           NOT NULL COMMENT '付款时间',
    comment            VARCHAR(500)   COMMENT '备注',
    created_time       DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    modified_time      DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    modified_user      BIGINT         COMMENT '更新者用户ID',
    deleted            INT            DEFAULT 0 COMMENT '逻辑删除:0-未删除,1-已删除',
    INDEX idx_customer_id (customer_id),
    INDEX idx_payment_time (payment_time),
    INDEX idx_deleted (deleted)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='客户货款表';

-- ============================================
-- 8. 客户罚款表
-- ============================================
DROP TABLE IF EXISTS customer_penalty;
CREATE TABLE customer_penalty (
    penalty_id         BIGINT         AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID(自增)',
    customer_id        BIGINT         NOT NULL COMMENT 'customer_info的主键',
    penalty            DECIMAL(12,2)  NOT NULL COMMENT '罚款金额',
    penalty_time       DATE           COMMENT '罚款日期',
    comment            VARCHAR(500)   COMMENT '备注(默认"罚款原因")',
    created_time       DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    modified_time      DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    modified_user      BIGINT         COMMENT '更新者用户ID',
    deleted            INT            DEFAULT 0 COMMENT '逻辑删除:0-未删除,1-已删除',
    INDEX idx_customer_id (customer_id),
    INDEX idx_penalty_time (penalty_time),
    INDEX idx_deleted (deleted)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='客户罚款表';

-- ============================================
-- 外键约束
-- ============================================

-- 客户-产品单价表 → 客户信息表、产品信息表
ALTER TABLE customer_product_price
    ADD CONSTRAINT fk_cpp_customer_id
        FOREIGN KEY (customer_id) REFERENCES customer_info (customer_id),
    ADD CONSTRAINT fk_cpp_product_id
        FOREIGN KEY (product_id) REFERENCES product_info (product_id);

-- 出库发票表 → 客户信息表
ALTER TABLE sale_invoice
    ADD CONSTRAINT fk_si_customer_id
        FOREIGN KEY (customer_id) REFERENCES customer_info (customer_id);

-- 出库产品表 → 出库发票表、客户信息表、产品信息表
ALTER TABLE sale_product
    ADD CONSTRAINT fk_sp_invoice_id
        FOREIGN KEY (invoice_id) REFERENCES sale_invoice (invoice_id),
    ADD CONSTRAINT fk_sp_customer_id
        FOREIGN KEY (customer_id) REFERENCES customer_info (customer_id),
    ADD CONSTRAINT fk_sp_product_id
        FOREIGN KEY (product_id) REFERENCES product_info (product_id);

-- 客户货款表 → 客户信息表
ALTER TABLE customer_payment
    ADD CONSTRAINT fk_cpay_customer_id
        FOREIGN KEY (customer_id) REFERENCES customer_info (customer_id);

-- 客户罚款表 → 客户信息表
ALTER TABLE customer_penalty
    ADD CONSTRAINT fk_cpen_customer_id
        FOREIGN KEY (customer_id) REFERENCES customer_info (customer_id);

-- ============================================
-- 导出示例数据(可选)
-- ============================================
-- INSERT INTO user_info (user_id, user_name, user_account, user_password, user_status, created_time, modified_time, modified_user, deleted)
-- VALUES (1, '管理员', '123456', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 2, NOW(), NOW(), 1, 0);