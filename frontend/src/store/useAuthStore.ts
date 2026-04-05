/**
 * 认证状态管理
 *
 * 使用Zustand管理用户登录状态，提供全局访问的用户信息
 *
 * @author LightERP
 * @version 1.0.0
 */

import { create } from 'zustand';

/**
 * 用户信息类型定义
 */
export interface UserInfo {
  /** 用户ID */
  userId: number;
  /** 用户名 */
  userName: string;
  /** 用户账号 */
  userAccount: string;
  /**
   * 用户权限
   * - 0: 浏览者(viewer) - 仅可查看数据
   * - 1: 管理员(admin) - 可进行业务操作
   * - 2: 超级管理员(super) - 可进行所有操作，包括后台管理
   */
  userStatus: number;
}

/**
 * 认证状态接口
 */
interface AuthState {
  /** 当前登录用户信息，null表示未登录 */
  user: UserInfo | null;
  /** 设置用户信息 */
  setUser: (user: UserInfo | null) => void;
  /** 清除用户信息（退出登录） */
  clearUser: () => void;
  /** 检查用户是否有管理员权限 */
  isAdmin: () => boolean;
  /** 检查用户是否有超级管理员权限 */
  isSuper: () => boolean;
}

/**
 * 创建认证状态管理Store
 *
 * @example
 * // 获取用户信息
 * const { user } = useAuthStore();
 *
 * // 检查权限
 * const { isAdmin, isSuper } = useAuthStore();
 * if (isAdmin()) {
 *   // 执行需要权限的操作
 * }
 *
 * // 退出登录
 * const { clearUser } = useAuthStore();
 * clearUser();
 */
export const useAuthStore = create<AuthState>((set, get) => ({
  // 初始状态：未登录
  user: null,

  /**
   * 设置用户信息
   * @param user - 用户信息对象，传入null表示清除用户
   */
  setUser: (user) => {
    console.log('[Auth Store] 设置用户信息:', user?.userAccount || 'null');
    set({ user });
  },

  /**
   * 清除用户信息（退出登录时调用）
   */
  clearUser: () => {
    console.log('[Auth Store] 清除用户信息');
    set({ user: null });
  },

  /**
   * 检查用户是否有管理员权限
   * 管理员权限: userStatus >= 1
   * @returns boolean
   */
  isAdmin: () => {
    const { user } = get();
    return user !== null && user.userStatus >= 1;
  },

  /**
   * 检查用户是否有超级管理员权限
   * 超级管理员权限: userStatus >= 2
   * @returns boolean
   */
  isSuper: () => {
    const { user } = get();
    return user !== null && user.userStatus >= 2;
  },
}));

// 导出权限常量，便于其他地方使用
export const UserRole = {
  VIEWER: 0,   // 浏览者
  ADMIN: 1,    // 管理员
  SUPER: 2,    // 超级管理员
} as const;