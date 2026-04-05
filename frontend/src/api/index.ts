/**
 * Axios HTTP 客户端配置
 *
 * 基于axios封装的HTTP请求库，配置了基础URL、超时时间、请求/响应拦截器
 *
 * @author LightERP
 * @version 1.0.0
 */

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

/**
 * 创建Axios实例
 * 基础路径: /api/v1 (对应后端接口)
 * 超时时间: 30秒
 */
const api: AxiosInstance = axios.create({
  baseURL: '/api/v1',
  timeout: 30000,
  // 允许携带cookie，用于Session认证
  withCredentials: true,
});

/**
 * 请求拦截器
 *
 * 在每个请求发送前执行的处理逻辑
 * - 可以在这里添加统一的请求头
 * - 可以在这里添加Loading状态
 *
 * @param config - Axios请求配置
 * @returns 加工后的配置
 */
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // TODO: 可以在这里添加Token等认证信息
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }

    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error: AxiosError) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

/**
 * 响应拦截器
 *
 * 在收到响应后执行的处理逻辑
 * - 提取response.data
 * - 处理401未授权错误（跳转登录页）
 * - 统一错误处理
 *
 * @param response - Axios响应对象
 * @returns response.data
 */
api.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log(`[API Response] ${response.config.url}`, response.status);
    return response.data;
  },
  (error: AxiosError) => {
    console.error('[API Response Error]', error.response?.status, error.message);

    // 处理401未授权错误
    if (error.response?.status === 401) {
      console.warn('[API] 用户未授权，跳转登录页');
      // 跳转到登录页
      window.location.href = '/login';
    }

    // 返回错误信息
    return Promise.reject(error.response?.data || error);
  }
);

export default api;

/**
 * API错误类型定义
 */
export interface ApiError {
  code: number;
  message: string;
  data?: any;
}

/**
 * 通用响应结果类型
 */
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
}

/**
 * 分页响应结果类型
 */
export interface PageResponse<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}