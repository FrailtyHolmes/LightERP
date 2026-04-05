/**
 * 个人信息编辑弹窗组件
 *
 * 允许当前登录用户修改用户名和密码
 */

import { useState, useEffect } from 'react';
import { Modal, Form, Input, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';

import { updateProfile } from '../../api/auth';
import { useAuthStore } from '../../store/useAuthStore';

interface ProfileEditModalProps {
  visible: boolean;
  onClose: () => void;
}

const ProfileEditModal = ({ visible, onClose }: ProfileEditModalProps) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { user, setUser } = useAuthStore();

  useEffect(() => {
    if (visible && user) {
      form.setFieldsValue({ userName: user.userName, password: '' });
    }
  }, [visible, user, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      const updateData: { userName?: string; password?: string } = {};

      if (values.userName && values.userName !== user?.userName) {
        updateData.userName = values.userName;
      }
      if (values.password) {
        updateData.password = values.password;
      }

      if (Object.keys(updateData).length === 0) {
        message.info('没有需要修改的内容');
        return;
      }

      setLoading(true);
      const res = await updateProfile(updateData);

      setUser(res.data);
      message.success('个人信息更新成功');
      onClose();
    } catch (error: any) {
      if (error?.message) {
        message.error(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="编辑个人信息"
      open={visible}
      onOk={handleSubmit}
      onCancel={onClose}
      confirmLoading={loading}
      destroyOnClose
    >
      <Form form={form} layout="vertical" preserve={false}>
        {/* 账号（只读展示） */}
        <Form.Item label="账号">
          <Input value={user?.userAccount} disabled />
        </Form.Item>

        {/* 用户名 */}
        <Form.Item
          name="userName"
          label="用户名"
          rules={[
            { required: true, message: '请输入用户名' },
            { max: 50, message: '用户名不能超过50个字符' },
            { pattern: /^[a-zA-Z0-9\u4e00-\u9fa5]+$/, message: '用户名只允许数字、字母、汉字的组合' }
          ]}
        >
          <Input prefix={<UserOutlined />} placeholder="用户名" maxLength={50} />
        </Form.Item>

        {/* 新密码（可选） */}
        <Form.Item
          name="password"
          label="新密码（不修改请留空）"
          rules={[
            { pattern: /^[a-zA-Z0-9]{6,18}$/, message: '密码必须为6-18位数字、字母组合' }
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="不修改请留空"
            maxLength={18}
            autoComplete="new-password"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ProfileEditModal;
