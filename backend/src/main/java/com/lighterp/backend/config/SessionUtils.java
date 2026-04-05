package com.lighterp.backend.config;

import com.lighterp.backend.common.BusinessException;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

/**
 * Session 工具类
 */
public class SessionUtils {

    private static final String SESSION_KEY_USER_ID = "userId";
    private static final String SESSION_KEY_USER_NAME = "userName";
    private static final String SESSION_KEY_USER_ACCOUNT = "userAccount";
    private static final String SESSION_KEY_USER_STATUS = "userStatus";

    /**
     * 获取当前请求
     */
    public static HttpServletRequest getRequest() {
        return RequestHolder.get();
    }

    /**
     * 获取当前 Session（不创建新的）
     */
    public static HttpSession getSession() {
        return getSession(false);
    }

    /**
     * 获取当前 Session
     *
     * @param create 如果为 true，当 Session 不存在时创建新的；如果为 false，不存在时返回 null
     */
    public static HttpSession getSession(boolean create) {
        HttpServletRequest request = getRequest();
        if (request == null) {
            return null;
        }
        return request.getSession(create);
    }

    /**
     * 获取当前用户ID
     */
    public static Long getCurrentUserId() {
        HttpSession session = getSession();
        if (session == null) {
            return null;
        }
        Object userId = session.getAttribute(SESSION_KEY_USER_ID);
        return userId != null ? (Long) userId : null;
    }

    /**
     * 获取当前用户名
     */
    public static String getCurrentUserName() {
        HttpSession session = getSession();
        if (session == null) {
            return null;
        }
        return (String) session.getAttribute(SESSION_KEY_USER_NAME);
    }

    /**
     * 获取当前用户账号
     */
    public static String getCurrentUserAccount() {
        HttpSession session = getSession();
        if (session == null) {
            return null;
        }
        return (String) session.getAttribute(SESSION_KEY_USER_ACCOUNT);
    }

    /**
     * 获取当前用户权限
     */
    public static Integer getCurrentUserStatus() {
        HttpSession session = getSession();
        if (session == null) {
            return null;
        }
        Object userStatus = session.getAttribute(SESSION_KEY_USER_STATUS);
        return userStatus != null ? (Integer) userStatus : null;
    }

    /**
     * 设置当前用户信息（会自动创建 Session）
     */
    public static void setCurrentUser(Long userId, String userName, String userAccount, Integer userStatus) {
        HttpSession session = getSession(true);
        if (session != null) {
            session.setAttribute(SESSION_KEY_USER_ID, userId);
            session.setAttribute(SESSION_KEY_USER_NAME, userName);
            session.setAttribute(SESSION_KEY_USER_ACCOUNT, userAccount);
            session.setAttribute(SESSION_KEY_USER_STATUS, userStatus);
        }
    }

    /**
     * 清除当前用户信息
     */
    public static void clearCurrentUser() {
        HttpSession session = getSession();
        if (session != null) {
            session.removeAttribute(SESSION_KEY_USER_ID);
            session.removeAttribute(SESSION_KEY_USER_NAME);
            session.removeAttribute(SESSION_KEY_USER_ACCOUNT);
            session.removeAttribute(SESSION_KEY_USER_STATUS);
        }
    }

    /**
     * 检查是否已登录
     */
    public static void checkLogin() {
        if (getCurrentUserId() == null) {
            throw new BusinessException(401, "用户未登录");
        }
    }

    /**
     * 检查是否有admin权限
     */
    public static void checkAdmin() {
        Integer userStatus = getCurrentUserStatus();
        if (userStatus == null || userStatus < 1) {
            throw new BusinessException(403, "无权限操作，需要管理员权限");
        }
    }

    /**
     * 检查是否有super权限
     */
    public static void checkSuper() {
        Integer userStatus = getCurrentUserStatus();
        if (userStatus == null || userStatus < 2) {
            throw new BusinessException(403, "无权限操作，需要超级管理员权限");
        }
    }
}