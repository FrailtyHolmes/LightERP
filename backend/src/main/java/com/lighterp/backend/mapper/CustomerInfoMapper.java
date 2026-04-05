package com.lighterp.backend.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.lighterp.backend.entity.CustomerInfo;
import org.apache.ibatis.annotations.Mapper;

/**
 * 客户信息 Mapper
 */
@Mapper
public interface CustomerInfoMapper extends BaseMapper<CustomerInfo> {
}