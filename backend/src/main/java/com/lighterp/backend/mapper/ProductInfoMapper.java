package com.lighterp.backend.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.lighterp.backend.entity.ProductInfo;
import org.apache.ibatis.annotations.Mapper;

/**
 * 产品信息 Mapper
 */
@Mapper
public interface ProductInfoMapper extends BaseMapper<ProductInfo> {
}