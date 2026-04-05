/**
 * 认证API接口
 *
 * 封装用户登录、注册、退出等认证相关的HTTP请求
 *
 * @author LightERP
 * @version 1.0.0
 */

import api from './index';

/**
 * 登录请求参数
 */
interface LoginParams {
  userAccount: string;  // 用户账号，6-18位数字
  password: string;     // 用户密码，6-18位数字字母组合
}

/**
 * 注册请求参数
 */
interface RegisterParams {
  userName: string;       // 用户名
  userAccount: string;   // 用户账号
  password: string;      // 密码
  confirmPassword: string; // 确认密码
}

/**
 * 用户信息响应
 */
interface UserInfo {
  userId: number;
  userName: string;
  userAccount: string;
  userStatus: number;  // 0-浏览者, 1-管理员, 2-超级管理员
}

/**
 * 用户登录
 *
 * 根据用户账号和密码进行登录验证
 * 成功后服务器会创建Session，后续请求通过Session保持登录状态
 *
 * @param data - 登录参数，包含userAccount和password
 * @returns Promise，包含用户信息
 * @throws 如果账号不存在、密码错误、账号已删除，会抛出错误
 *
 * @example
 * ```ts
 * try {
 *   const res = await login({ userAccount: '123456', password: 'password123' });
 *   console.log('登录成功', res.data);
 * } catch (error) {
 *   console.error('登录失败', error.message);
 * }
 * ```
 */
export const login = (data: LoginParams) =>
  api.post<any, any>('/auth/login', data);

/**
 * 用户注册
 *
 * 创建新用户账号，首次注册默认为浏览者权限(viewer)
 *
 * @param data - 注册参数，包含userName、userAccount、password、confirmPassword
 * @returns Promise，包含新创建的用户信息
 * @throws 如果两次密码不一致或账号已存在，会抛出错误
 *
 * @example
 * ```ts
 * try {
 *   const res = await register({
 *     userName: '张三',
 *     userAccount: '123456',
 *     password: 'password123',
 *     confirmPassword: 'password123'
 *   });
 *   console.log('注册成功', res.data);
 * } catch (error) {
 *   console.error('注册失败', error.message);
 * }
 * ```
 */
export const register = (data: RegisterParams) =>
  api.post<any, any>('/auth/register', data);

/**
 * 获取当前登录用户信息
 *
 * 用于检查用户登录状态和获取用户详情
 *
 * @returns Promise，包含当前登录用户的详细信息
 * @throws 如果用户未登录，会抛出401错误
 *
 * @example
 * ```ts
 * const res = await getCurrentUser();
 * console.log('当前用户', res.data.userName);
 * ```
 */
export const getCurrentUser = () =>
  api.get<any, any>('/auth/current');

/**
 * 用户退出登录
 *
 * 清除服务器端的Session信息
 *
 * @returns Promise，操作结果
 *
 * @example
 * ```ts
 * await logout();
 * console.log('已退出登录');
 * ```
 */
export const logout = () =>
  api.post<any, any>('/auth/logout');