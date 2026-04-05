package com.lighterp.backend.common;

import lombok.Data;
import java.io.Serializable;

/**
 * 通用响应结果
 */
@Data
public class CommonResult<T> implements Serializable {
    private static final long serialVersionUID = 1L;

    private Integer code;
    private String message;
    private T data;

    public static <T> CommonResult<T> success() {
        return success(null);
    }

    public static <T> CommonResult<T> success(T data) {
        CommonResult<T> result = new CommonResult<>();
        result.setCode(200);
        result.setMessage("success");
        result.setData(data);
        return result;
    }

    public static <T> CommonResult<T> success(String message, T data) {
        CommonResult<T> result = new CommonResult<>();
        result.setCode(200);
        result.setMessage(message);
        result.setData(data);
        return result;
    }

    public static <T> CommonResult<T> error(String message) {
        CommonResult<T> result = new CommonResult<>();
        result.setCode(400);
        result.setMessage(message);
        return result;
    }

    public static <T> CommonResult<T> error(Integer code, String message) {
        CommonResult<T> result = new CommonResult<>();
        result.setCode(code);
        result.setMessage(message);
        return result;
    }

    public static <T> CommonResult<T> unauthorized(String message) {
        return error(401, message);
    }

    public static <T> CommonResult<T> forbidden(String message) {
        return error(403, message);
    }
}