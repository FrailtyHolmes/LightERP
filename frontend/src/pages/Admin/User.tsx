import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, message } from 'antd';
import api from '../../api';

const UserAdmin = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/user/list');
      setData(res.data.list || []);
    } catch (error: any) { message.error(error.message || '加载失败'); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const handleSubmit = async () => {
    try {
      await form.validateFields();
      await api.post('/admin/user', form.getFieldsValue());
      message.success('添加成功'); setModalVisible(false); form.resetFields(); loadData();
    } catch (error: any) { message.error(error.message || '添加失败'); }
  };

  const columns = [
    { title: '用户名', dataIndex: 'userName', key: 'userName' },
    { title: '用户账号', dataIndex: 'userAccount', key: 'userAccount' },
    { title: '权限', dataIndex: 'userStatus', key: 'userStatus', render: (v: number) => ['浏览者', '管理员', '超级管理员'][v] || v },
  ];

  return (
    <div>
      <div style={{marginBottom: 16}}><Button type="primary" onClick={() => setModalVisible(true)}>添加用户</Button></div>
      <Table dataSource={data} columns={columns} rowKey="userId" loading={loading} />
      <Modal title="添加用户" open={modalVisible} onCancel={() => setModalVisible(false)} onOk={handleSubmit}>
        <Form form={form} layout="vertical">
          <Form.Item name="userName" label="用户名" rules={[{required: true}]}><Input /></Form.Item>
          <Form.Item name="userAccount" label="用户账号" rules={[{required: true}]}><Input /></Form.Item>
          <Form.Item name="password" label="密码" rules={[{required: true}]}><Input.Password /></Form.Item>
          <Form.Item name="userStatus" label="权限" initialValue={0}><Select options={[{value: 0, label: '浏览者'}, {value: 1, label: '管理员'}, {value: 2, label: '超级管理员'}]} /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserAdmin;