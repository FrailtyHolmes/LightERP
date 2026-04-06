package com.lighterp.backend.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.lighterp.backend.entity.CustomerProductPrice;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.util.Date;

/**
 * 客户产品单价 Mapper
 */
@Mapper
public interface CustomerProductPriceMapper extends BaseMapper<CustomerProductPrice> {

    /**
     * 查询已逻辑删除的同维度记录（绕过 @TableLogic 过滤）
     */
    @Select("<script>"
            + "SELECT id FROM customer_product_price "
            + "WHERE customer_id = #{customerId} AND product_id = #{productId} "
            + "<if test='effectiveDateStart != null'> AND effective_date_start = #{effectiveDateStart}</if>"
            + "<if test='effectiveDateStart == null'> AND effective_date_start IS NULL</if>"
            + " AND deleted = 1 LIMIT 1"
            + "</script>")
    Long findDeletedRecordId(@Param("customerId") Long customerId,
                             @Param("productId") Long productId,
                             @Param("effectiveDateStart") Date effectiveDateStart);

    /**
     * 恢复已逻辑删除的记录（绕过 @TableLogic 过滤）
     */
    @Update("UPDATE customer_product_price SET deleted = 0, price = #{price}, "
            + "effective_date_end = #{effectiveDateEnd}, modified_time = NOW() "
            + "WHERE id = #{id}")
    int restoreDeletedRecord(@Param("id") Long id,
                             @Param("price") java.math.BigDecimal price,
                             @Param("effectiveDateEnd") Date effectiveDateEnd);
}