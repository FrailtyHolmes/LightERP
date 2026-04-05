package com.lighterp.backend.config;

import com.baomidou.mybatisplus.core.handlers.MetaObjectHandler;
import lombok.extern.slf4j.Slf4j;
import org.apache.ibatis.reflection.MetaObject;
import org.springframework.stereotype.Component;

import java.util.Date;

/**
 * MyBatis Plus 自动填充处理器
 */
@Slf4j
@Component
public class MyBatisPlusMetaObjectHandler implements MetaObjectHandler {

    @Override
    public void insertFill(MetaObject metaObject) {
        log.debug("开始插入填充...");
        Date now = new Date();
        // 创建时间和更新时间
        this.strictInsertFill(metaObject, "createdTime", Date.class, now);
        this.strictInsertFill(metaObject, "modifiedTime", Date.class, now);
        // 更新者
        Long currentUserId = SessionUtils.getCurrentUserId();
        if (currentUserId != null) {
            this.strictInsertFill(metaObject, "modifiedUser", Long.class, currentUserId);
        }
    }

    @Override
    public void updateFill(MetaObject metaObject) {
        log.debug("开始更新填充...");
        // 更新时间
        this.strictUpdateFill(metaObject, "modifiedTime", Date.class, new Date());
        // 更新者
        Long currentUserId = SessionUtils.getCurrentUserId();
        if (currentUserId != null) {
            this.strictUpdateFill(metaObject, "modifiedUser", Long.class, currentUserId);
        }
    }
}