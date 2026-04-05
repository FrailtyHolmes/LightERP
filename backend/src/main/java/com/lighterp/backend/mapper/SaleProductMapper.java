package com.lighterp.backend.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.lighterp.backend.entity.SaleProduct;
import org.apache.ibatis.annotations.Mapper;

/**
 * 出库产品 Mapper
 */
@Mapper
public interface SaleProductMapper extends BaseMapper<SaleProduct> {
}