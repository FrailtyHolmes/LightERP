package com.lighterp.backend.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.lighterp.backend.entity.SaleInvoice;
import org.apache.ibatis.annotations.Mapper;

/**
 * 出库发票 Mapper
 */
@Mapper
public interface SaleInvoiceMapper extends BaseMapper<SaleInvoice> {
}