package com.lighterp.backend.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.lighterp.backend.entity.CustomerProductPrice;
import org.apache.ibatis.annotations.Mapper;

/**
 * 客户产品单价 Mapper
 */
@Mapper
public interface CustomerProductPriceMapper extends BaseMapper<CustomerProductPrice> {
}