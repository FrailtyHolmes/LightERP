package com.lighterp.backend.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.lighterp.backend.common.BusinessException;
import com.lighterp.backend.common.CommonResult;
import com.lighterp.backend.common.Constants;
import com.lighterp.backend.common.PageResult;
import com.lighterp.backend.config.SessionUtils;
import com.lighterp.backend.controller.request.UserCreateRequest;
import com.lighterp.backend.controller.request.UserUpdateRequest;
import com.lighterp.backend.controller.response.UserInfoResponse;
import com.lighterp.backend.entity.UserInfo;
import com.lighterp.backend.mapper.UserInfoMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.util.StringUtils;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.stream.Collectors;

/**
 * 后台管理 - 用户管理
 */
@Slf4j
@RestController
@RequestMapping("/admin/user")
@RequiredArgsConstructor
public class AdminUserController {

    private final UserInfoMapper userInfoMapper;

    /**
     * 用户列表查询
     */
    @GetMapping("/list")
    public CommonResult<PageResult<UserInfoResponse>> list(
            @RequestParam(required = false) String userName,
            @RequestParam(required = false) String userAccount,
            @RequestParam(required = false) Integer userStatus,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer pageSize) {

        // 检查权限
        SessionUtils.checkSuper();

        Page<UserInfo> pageParam = new Page<>(page, pageSize);
        QueryWrapper<UserInfo> wrapper = new QueryWrapper<>();

        if (StringUtils.hasText(userName)) {
            wrapper.like("user_name", userName);
        }
        if (StringUtils.hasText(userAccount)) {
            wrapper.like("user_account", userAccount);
        }
        if (userStatus != null) {
            wrapper.eq("user_status", userStatus);
        }

        wrapper.orderByDesc("created_time");
        Page<UserInfo> result = userInfoMapper.selectPage(pageParam, wrapper);

        PageResult<UserInfoResponse> pageResult = PageResult.of(
                result.getRecords().stream().map(userInfo -> {
                    UserInfoResponse response = new UserInfoResponse();
                    BeanUtils.copyProperties(userInfo, response);
                    return response;
                }).collect(Collectors.toList()),
                result.getTotal(),
                (int) result.getCurrent(),
                (int) result.getSize()
        );

        return CommonResult.success(pageResult);
    }

    /**
     * 添加用户
     */
    @PostMapping
    public CommonResult<UserInfoResponse> create(@Validated @RequestBody UserCreateRequest request) {
        // 检查权限
        SessionUtils.checkSuper();

        // 检查账号是否已存在
        Long count = userInfoMapper.selectCount(
                new QueryWrapper<UserInfo>().eq("user_account", request.getUserAccount())
        );
        if (count > 0) {
            throw new BusinessException("已存在该用户记录");
        }

        UserInfo userInfo = new UserInfo();
        BeanUtils.copyProperties(request, userInfo);
        userInfoMapper.insert(userInfo);

        log.info("添加用户: {}", userInfo.getUserAccount());

        UserInfoResponse response = new UserInfoResponse();
        BeanUtils.copyProperties(userInfo, response);
        return CommonResult.success(response);
    }

    /**
     * 编辑用户
     */
    @PutMapping("/{id}")
    public CommonResult<UserInfoResponse> update(
            @PathVariable Long id,
            @Validated @RequestBody UserUpdateRequest request) {
        // 检查权限
        SessionUtils.checkSuper();

        UserInfo userInfo = userInfoMapper.selectById(id);
        if (userInfo == null) {
            throw new BusinessException("用户不存在");
        }

        if (StringUtils.hasText(request.getUserName())) {
            userInfo.setUserName(request.getUserName());
        }
        if (StringUtils.hasText(request.getPassword())) {
            userInfo.setUserPassword(request.getPassword());
        }
        if (request.getUserStatus() != null) {
            userInfo.setUserStatus(request.getUserStatus());
        }

        userInfoMapper.updateById(userInfo);

        log.info("编辑用户: {}", id);

        UserInfoResponse response = new UserInfoResponse();
        BeanUtils.copyProperties(userInfo, response);
        return CommonResult.success(response);
    }

    /**
     * 删除用户
     */
    @DeleteMapping("/{id}")
    public CommonResult<Void> delete(@PathVariable Long id) {
        // 检查权限
        SessionUtils.checkSuper();

        UserInfo userInfo = userInfoMapper.selectById(id);
        if (userInfo == null) {
            throw new BusinessException("用户不存在");
        }

        userInfoMapper.deleteById(id);

        log.info("删除用户: {}", id);
        return CommonResult.success();
    }
}