package com.lighterp.backend.config;

import com.lighterp.backend.common.BusinessException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * 登录拦截器
 */
@Slf4j
@Component
public class LoginInterceptor implements HandlerInterceptor {

    /**
     * 不需要拦截的路径
     */
    private static final String[] EXCLUDE_PATHS = {
            "/auth/login",
            "/auth/register",
            "/error"
    };

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        // 放行静态资源和预检请求
        String method = request.getMethod();
        if ("OPTIONS".equals(method)) {
            return true;
        }

        String uri = request.getRequestURI();

        // 检查是否在排除路径中
        for (String excludePath : EXCLUDE_PATHS) {
            if (uri.endsWith(excludePath) || uri.contains(excludePath)) {
                return true;
            }
        }

        // 检查是否已登录
        Long userId = SessionUtils.getCurrentUserId();
        if (userId == null) {
            log.warn("用户未登录，访问被拦截: {}", uri);
            throw new BusinessException(401, "用户未登录，请先登录");
        }

        return true;
    }
}