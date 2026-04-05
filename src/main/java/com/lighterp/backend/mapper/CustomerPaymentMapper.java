package com.lighterp.backend.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.lighterp.backend.entity.CustomerPayment;
import org.apache.ibatis.annotations.Mapper;

/**
 * 客户货款 Mapper
 */
@Mapper
public interface CustomerPaymentMapper extends BaseMapper<CustomerPayment> {
}