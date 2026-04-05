/**
 * 注册页面组件
 *
 * 提供用户注册功能，包含表单验证、错误提示、注册成功跳转登录
 *
 * @author LightERP
 * @version 1.0.0
 */

import { useState } from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined, IdcardOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';

import { register } from '../../api/auth';

/**
 * 注册表单数据类型
 */
interface RegisterFormValues {
  userName: string;
  userAccount: string;
  password: string;
  confirmPassword: string;
}

/**
 * 注册页面组件
 *
 * 功能：
 * - 用户名、账号、密码、确认密码表单
 * - 前端表单验证（格式校验 + 两次密码一致性校验）
 * - 注册成功后跳转到登录页
 *
 * @returns 注册页面JSX元素
 */
const Register = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  /**
   * 处理注册表单提交
   *
   * @param values - 表单数据
   */
  const onFinish = async (values: RegisterFormValues) => {
    console.log('[Register] 提交注册表单:', values.userAccount);
    setLoading(true);

    try {
      await register(values);
      message.success('注册成功，请登录');
      navigate('/login');
    } catch (error: any) {
      console.error('[Register] 注册失败:', error);
      message.error(error?.message || '注册失败，请稍后重试');
    } finally {
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
        title="LightERP 注册"
        style={{ width: 400 }}
        bordered={true}
      >
        <Form
          name="register"
          onFinish={onFinish}
          validateTrigger="onBlur"
        >
          {/* 用户名 */}
          <Form.Item
            name="userName"
            rules={[
              { required: true, message: '请输入用户名' },
              { max: 50, message: '用户名不能超过50个字符' }
            ]}
          >
            <Input
              prefix={<IdcardOutlined />}
              placeholder="用户名"
              maxLength={50}
              autoComplete="name"
            />
          </Form.Item>

          {/* 用户账号 */}
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

          {/* 密码 */}
          <Form.Item
            name="password"
            rules={[
              { required: true, message: '请输入密码' },
              { pattern: /^[a-zA-Z0-9]{6,18}$/, message: '密码必须为6-18位数字、字母组合' }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="密码 (6-18位数字字母组合)"
              maxLength={18}
              autoComplete="new-password"
            />
          </Form.Item>

          {/* 确认密码 */}
          <Form.Item
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: '请确认密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('两次输入的密码不一致'));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="确认密码"
              maxLength={18}
              autoComplete="new-password"
            />
          </Form.Item>

          {/* 注册按钮 */}
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              size="large"
            >
              注册
            </Button>
          </Form.Item>

          {/* 跳转登录 */}
          <Form.Item style={{ marginBottom: 0, textAlign: 'center' }}>
            已有账号？<Link to="/login">去登录</Link>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Register;
