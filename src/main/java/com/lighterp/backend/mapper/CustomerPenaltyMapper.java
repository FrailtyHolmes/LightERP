package com.lighterp.backend.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.lighterp.backend.entity.CustomerPenalty;
import org.apache.ibatis.annotations.Mapper;

/**
 * 客户罚款 Mapper
 */
@Mapper
public interface CustomerPenaltyMapper extends BaseMapper<CustomerPenalty> {
}