package com.lighterp.backend.util;

import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.OutputStream;
import java.net.URLEncoder;
import java.util.Date;
import java.util.List;
import java.util.Map;

/**
 * Excel 导出工具类
 */
public class ExcelUtils {

    /**
     * 导出Excel
     */
    public static void exportExcel(HttpServletResponse response, String fileName, String[] headers, List<Object[]> dataList) throws IOException {
        // 创建工作簿
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Sheet1");

            // 创建表头样式
            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setFontHeightInPoints((short) 12);
            headerStyle.setFont(headerFont);
            headerStyle.setAlignment(HorizontalAlignment.CENTER);

            // 创建表头
            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
                sheet.setColumnWidth(i, 4000);
            }

            // 填充数据
            int rowNum = 1;
            for (Object[] rowData : dataList) {
                Row row = sheet.createRow(rowNum++);
                for (int i = 0; i < rowData.length; i++) {
                    Cell cell = row.createCell(i);
                    Object value = rowData[i];
                    if (value == null) {
                        cell.setCellValue("");
                    } else if (value instanceof Number) {
                        cell.setCellValue(((Number) value).doubleValue());
                    } else if (value instanceof Date) {
                        cell.setCellValue(value.toString());
                    } else {
                        cell.setCellValue(value.toString());
                    }
                }
            }

            // 设置响应头
            response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            response.setCharacterEncoding("utf-8");
            fileName = URLEncoder.encode(fileName, "UTF-8");
            response.setHeader("Content-Disposition", "attachment;filename=" + fileName + ".xlsx");

            // 写入输出流
            try (OutputStream outputStream = response.getOutputStream()) {
                workbook.write(outputStream);
            }
        }
    }

    /**
     * 导出简单数据
     */
    public static void exportSimpleData(HttpServletResponse response, String fileName, String[] headers, List<Map<String, Object>> dataList, String[] keys) throws IOException {
        // 转换为 Object 数组格式
        List<Object[]> data = new java.util.ArrayList<>();
        for (Map<String, Object> map : dataList) {
            Object[] row = new Object[keys.length];
            for (int i = 0; i < keys.length; i++) {
                row[i] = map.get(keys[i]);
            }
            data.add(row);
        }
        exportExcel(response, fileName, headers, data);
    }
}