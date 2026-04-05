package com.lighterp.backend.controller;

import com.lighterp.backend.common.BusinessException;
import com.lighterp.backend.common.CommonResult;
import com.lighterp.backend.common.Constants;
import com.lighterp.backend.config.SessionUtils;
import com.lighterp.backend.controller.request.LoginRequest;
import com.lighterp.backend.controller.request.RegisterRequest;
import com.lighterp.backend.controller.response.UserInfoResponse;
import com.lighterp.backend.entity.UserInfo;
import com.lighterp.backend.mapper.UserInfoMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

/**
 * 认证控制器
 */
@Slf4j
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserInfoMapper userInfoMapper;

    /**
     * 用户登录
     */
    @PostMapping("/login")
    public CommonResult<UserInfoResponse> login(@Validated @RequestBody LoginRequest request) {
        // 查询用户账号
        UserInfo userInfo = userInfoMapper.selectOne(
                new com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<UserInfo>()
                        .eq("user_account", request.getUserAccount())
        );

        if (userInfo == null) {
            throw new BusinessException("该账号未注册");
        }

        // 验证密码（这里简化处理，实际应该用BCrypt）
        if (!request.getPassword().equals(userInfo.getUserPassword())) {
            throw new BusinessException("错误的密码");
        }

        // 检查是否被删除
        if (userInfo.getDeleted() != null && userInfo.getDeleted() == 1) {
            throw new BusinessException("该账号已被删除");
        }

        // 设置Session
        SessionUtils.setCurrentUser(
                userInfo.getUserId(),
                userInfo.getUserName(),
                userInfo.getUserAccount(),
                userInfo.getUserStatus()
        );

        log.info("用户登录成功: {}", userInfo.getUserAccount());

        UserInfoResponse response = new UserInfoResponse();
        BeanUtils.copyProperties(userInfo, response);
        return CommonResult.success(response);
    }

    /**
     * 用户注册
     */
    @PostMapping("/register")
    public CommonResult<UserInfoResponse> register(@Validated @RequestBody RegisterRequest request) {
        // 检查密码和确认密码
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new BusinessException("两次输入的密码不一致");
        }

        // 检查账号是否已存在
        Long count = userInfoMapper.selectCount(
                new com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<UserInfo>()
                        .eq("user_account", request.getUserAccount())
        );
        if (count > 0) {
            throw new BusinessException("该账号已注册");
        }

        // 创建用户
        UserInfo userInfo = new UserInfo();
        userInfo.setUserName(request.getUserName());
        userInfo.setUserAccount(request.getUserAccount());
        userInfo.setUserPassword(request.getPassword());
        // 首次注册默认为 viewer
        userInfo.setUserStatus(Constants.UserStatus.VIEWER);

        userInfoMapper.insert(userInfo);

        log.info("用户注册成功: {}", userInfo.getUserAccount());

        UserInfoResponse response = new UserInfoResponse();
        BeanUtils.copyProperties(userInfo, response);
        return CommonResult.success(response);
    }

    /**
     * 获取当前用户信息
     */
    @GetMapping("/current")
    public CommonResult<UserInfoResponse> getCurrentUser() {
        Long userId = SessionUtils.getCurrentUserId();
        if (userId == null) {
            throw new BusinessException(401, "用户未登录");
        }

        UserInfo userInfo = userInfoMapper.selectById(userId);
        if (userInfo == null) {
            throw new BusinessException("用户不存在");
        }

        UserInfoResponse response = new UserInfoResponse();
        BeanUtils.copyProperties(userInfo, response);
        return CommonResult.success(response);
    }

    /**
     * 用户退出
     */
    @PostMapping("/logout")
    public CommonResult<Void> logout() {
        SessionUtils.clearCurrentUser();
        return CommonResult.success();
    }
}