/**
 * 登录页面组件
 *
 * 提供用户登录功能，包含表单验证、错误提示、登录成功跳转
 *
 * @author LightERP
 * @version 1.0.0
 */

import { useState } from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';

import { login } from '../../api/auth';
import { useAuthStore } from '../../store/useAuthStore';

/**
 * 登录表单数据类型
 */
interface LoginFormValues {
  userAccount: string;  // 用户账号，6-18位数字
  password: string;     // 用户密码，6-18位数字字母组合
}

/**
 * 登录页面组件
 *
 * 功能：
 * - 用户名密码登录
 * - 表单验证
 * - 登录成功后保存用户信息到全局状态
 * - 登录成功后跳转到主页
 *
 * @returns 登录页面JSX元素
 */
const Login = () => {
  // 加载状态，用于显示登录中的loading效果
  const [loading, setLoading] = useState(false);

  // 获取全局状态管理
  const setUser = useAuthStore((state) => state.setUser);

  // 路由跳转
  const navigate = useNavigate();

  /**
   * 处理登录表单提交
   *
   * 1. 验证表单数据
   * 2. 调用登录API
   * 3. 登录成功后将用户信息保存到全局状态
   * 4. 跳转到主页
   * 5. 处理登录失败，显示错误提示
   *
   * @param values - 表单数据
   */
  const onFinish = async (values: LoginFormValues) => {
    console.log('[Login] 提交登录表单:', values.userAccount);
    setLoading(true);

    try {
      // 调用登录API
      const res = await login(values);
      console.log('[Login] 登录成功:', res.data);

      // 保存用户信息到全局状态
      setUser(res.data);

      // 显示成功提示
      message.success('登录成功');

      // 跳转到主页
      navigate('/');
    } catch (error: any) {
      // 登录失败，显示错误提示
      console.error('[Login] 登录失败:', error);
      message.error(error?.message || '登录失败，请检查账号密码');
    } finally {
      // 关闭loading状态
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: '#f0f2f5'
    }}>
      <Card
        title="LightERP 登录"
        style={{ width: 400 }}
        bordered={true}
      >
        <Form
          name="login"
          onFinish={onFinish}
          // 表单验证规则
          validateTrigger="onBlur"
        >
          {/* 用户账号输入框 */}
          <Form.Item
            name="userAccount"
            rules={[
              { required: true, message: '请输入用户账号' },
              { pattern: /^\d{6,18}$/, message: '用户账号只允许6-18位数字' }
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="用户账号 (6-18位数字)"
              maxLength={18}
              autoComplete="username"
            />
          </Form.Item>

          {/* 用户密码输入框 */}
          <Form.Item
            name="password"
            rules={[
              { required: true, message: '请输入用户密码' },
              { pattern: /^[a-zA-Z0-9]{6,18}$/, message: '用户密码必须为6-18位数字、字母组合' }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="用户密码"
              maxLength={18}
              autoComplete="current-password"
            />
          </Form.Item>

          {/* 登录按钮 */}
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              size="large"
            >
              登录
            </Button>
          </Form.Item>

          {/* 跳转注册 */}
          <Form.Item style={{ marginBottom: 0, textAlign: 'center' }}>
            没有账号？<Link to="/register">去注册</Link>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Login;