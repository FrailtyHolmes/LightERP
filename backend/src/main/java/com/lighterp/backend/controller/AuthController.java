package com.lighterp.backend.controller;

import com.lighterp.backend.common.BusinessException;
import com.lighterp.backend.common.CommonResult;
import com.lighterp.backend.common.Constants;
import com.lighterp.backend.config.SessionUtils;
import com.lighterp.backend.controller.request.LoginRequest;
import com.lighterp.backend.controller.request.RegisterRequest;
import com.lighterp.backend.controller.request.UserUpdateRequest;
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
 *
 * 处理用户登录、注册、退出等认证相关的请求
 *
 * @author LightERP
 * @version 1.0.0
 */
@Slf4j
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserInfoMapper userInfoMapper;

    /**
     * 用户登录
     *
     * 根据用户账号和密码进行身份验证，验证成功后创建Session
     *
     * @param request 登录请求，包含userAccount和password
     * @return 用户信息，包含用户ID、用户名、账号、权限
     * @throws BusinessException 账号不存在、密码错误、账号已删除
     *
     * @apiNote
     * - 验证账号是否存在
     * - 验证密码是否正确
     * - 检查账号是否已被删除
     * - 登录成功后设置Session
     */
    @PostMapping("/login")
    public CommonResult<UserInfoResponse> login(@Validated @RequestBody LoginRequest request) {
        log.info("用户尝试登录，账号: {}", request.getUserAccount());

        // 查询用户账号
        UserInfo userInfo = userInfoMapper.selectOne(
                new com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<UserInfo>()
                        .eq("user_account", request.getUserAccount())
        );

        // 账号不存在
        if (userInfo == null) {
            log.warn("登录失败：账号不存在 - {}", request.getUserAccount());
            throw new BusinessException("该账号未注册");
        }

        // 验证密码（生产环境应使用BCrypt加密验证）
        // TODO: 生产环境应使用BCrypt加密存储和验证密码
        if (!request.getPassword().equals(userInfo.getUserPassword())) {
            log.warn("登录失败：密码错误 - {}", request.getUserAccount());
            throw new BusinessException("错误的密码");
        }

        // 检查是否被逻辑删除
        if (userInfo.getDeleted() != null && userInfo.getDeleted() == 1) {
            log.warn("登录失败：账号已被删除 - {}", request.getUserAccount());
            throw new BusinessException("该账号已被删除");
        }

        // 设置Session，保存用户信息
        SessionUtils.setCurrentUser(
                userInfo.getUserId(),
                userInfo.getUserName(),
                userInfo.getUserAccount(),
                userInfo.getUserStatus()
        );

        log.info("用户登录成功: {}, 权限: {}", userInfo.getUserAccount(), userInfo.getUserStatus());

        // 返回用户信息（不包含密码）
        UserInfoResponse response = new UserInfoResponse();
        BeanUtils.copyProperties(userInfo, response);
        return CommonResult.success(response);
    }

    /**
     * 用户注册
     *
     * 创建新用户账号，默认权限为浏览者(viewer)
     *
     * @param request 注册请求，包含userName、userAccount、password、confirmPassword
     * @return 新创建的用户信息
     * @throws BusinessException 两次密码不一致、账号已存在
     *
     * @apiNote
     * - 验证两次输入的密码是否一致
     * - 检查账号是否已被注册
     * - 创建新用户，默认权限为viewer(0)
     */
    @PostMapping("/register")
    public CommonResult<UserInfoResponse> register(@Validated @RequestBody RegisterRequest request) {
        log.info("用户尝试注册，账号: {}", request.getUserAccount());

        // 检查密码和确认密码
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            log.warn("注册失败：两次输入的密码不一致");
            throw new BusinessException("两次输入的密码不一致");
        }

        // 检查账号是否已存在
        Long count = userInfoMapper.selectCount(
                new com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<UserInfo>()
                        .eq("user_account", request.getUserAccount())
        );
        if (count > 0) {
            log.warn("注册失败：账号已存在 - {}", request.getUserAccount());
            throw new BusinessException("该账号已注册");
        }

        // 创建新用户
        UserInfo userInfo = new UserInfo();
        userInfo.setUserName(request.getUserName());
        userInfo.setUserAccount(request.getUserAccount());
        userInfo.setUserPassword(request.getPassword());
        // 首次注册默认为 viewer 权限
        userInfo.setUserStatus(Constants.UserStatus.VIEWER);

        userInfoMapper.insert(userInfo);

        log.info("用户注册成功: {}, 初始权限: VIEWER", userInfo.getUserAccount());

        UserInfoResponse response = new UserInfoResponse();
        BeanUtils.copyProperties(userInfo, response);
        return CommonResult.success(response);
    }

    /**
     * 获取当前登录用户信息
     *
     * @return 当前登录用户的详细信息
     * @throws BusinessException 用户未登录或用户不存在
     */
    @GetMapping("/current")
    public CommonResult<UserInfoResponse> getCurrentUser() {
        Long userId = SessionUtils.getCurrentUserId();
        if (userId == null) {
            log.warn("获取用户信息失败：用户未登录");
            throw new BusinessException(401, "用户未登录");
        }

        UserInfo userInfo = userInfoMapper.selectById(userId);
        if (userInfo == null) {
            log.error("获取用户信息失败：用户不存在，ID: {}", userId);
            throw new BusinessException("用户不存在");
        }

        log.debug("获取当前用户信息: {}", userInfo.getUserAccount());

        UserInfoResponse response = new UserInfoResponse();
        BeanUtils.copyProperties(userInfo, response);
        return CommonResult.success(response);
    }

    /**
     * 编辑个人信息
     *
     * 当前登录用户可修改自己的用户名和密码，不可修改账号和权限
     *
     * @param request 更新请求，包含userName和password（均为可选）
     * @return 更新后的用户信息
     * @throws BusinessException 用户未登录或用户不存在
     */
    @PutMapping("/profile")
    public CommonResult<UserInfoResponse> updateProfile(@Validated @RequestBody UserUpdateRequest request) {
        Long userId = SessionUtils.getCurrentUserId();
        if (userId == null) {
            throw new BusinessException(401, "用户未登录");
        }

        UserInfo userInfo = userInfoMapper.selectById(userId);
        if (userInfo == null) {
            log.error("编辑个人信息失败：用户不存在，ID: {}", userId);
            throw new BusinessException("用户不存在");
        }

        if (request.getUserName() != null) {
            userInfo.setUserName(request.getUserName());
        }
        if (request.getPassword() != null) {
            userInfo.setUserPassword(request.getPassword());
        }

        userInfoMapper.updateById(userInfo);

        // 同步更新 Session 中的用户名
        SessionUtils.setCurrentUser(
                userInfo.getUserId(),
                userInfo.getUserName(),
                userInfo.getUserAccount(),
                userInfo.getUserStatus()
        );

        log.info("用户编辑个人信息成功: {}", userInfo.getUserAccount());

        UserInfoResponse response = new UserInfoResponse();
        BeanUtils.copyProperties(userInfo, response);
        return CommonResult.success(response);
    }

    /**
     * 用户退出登录
     *
     * 清除Session中的用户信息
     *
     * @return 操作结果
     */
    @PostMapping("/logout")
    public CommonResult<Void> logout() {
        String userAccount = SessionUtils.getCurrentUserAccount();
        SessionUtils.clearCurrentUser();
        log.info("用户退出登录: {}", userAccount);
        return CommonResult.success();
    }
}