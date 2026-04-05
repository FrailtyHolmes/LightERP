import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, Space, message } from 'antd';
import api from '../../api';

const UserAdmin = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [form] = Form.useForm();

  const isEditing = editingRecord !== null;

  const [searchForm] = Form.useForm();

  const loadData = async (filters?: any) => {
    setLoading(true);
    try {
      const params = filters || searchForm.getFieldsValue();
      const cleanParams: any = {};
      if (params.userName) cleanParams.userName = params.userName;
      if (params.userAccount) cleanParams.userAccount = params.userAccount;
      if (params.userStatus !== undefined && params.userStatus !== null) cleanParams.userStatus = params.userStatus;
      const res = await api.get('/admin/user/list', { params: cleanParams });
      setData(res.data.list || []);
    } catch (error: any) { message.error(error.message || '加载失败'); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const handleSearch = () => loadData();
  const handleReset = () => { searchForm.resetFields(); loadData({}); };

  const openAddModal = () => {
    setEditingRecord(null);
    form.resetFields();
    setModalVisible(true);
  };

  const openEditModal = (record: any) => {
    setEditingRecord(record);
    form.setFieldsValue({ userName: record.userName, password: '', userStatus: record.userStatus });
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    try {
      await form.validateFields();
      const values = form.getFieldsValue();

      if (isEditing) {
        const updateData: any = {};
        if (values.userName) updateData.userName = values.userName;
        if (values.password) updateData.password = values.password;
        if (values.userStatus !== undefined) updateData.userStatus = values.userStatus;
        await api.put(`/admin/user/${editingRecord.userId}`, updateData);
        message.success('编辑成功');
      } else {
        await api.post('/admin/user', values);
        message.success('添加成功');
      }

      setModalVisible(false);
      form.resetFields();
      setEditingRecord(null);
      loadData();
    } catch (error: any) { message.error(error.message || '操作失败'); }
  };

  const columns = [
    { title: '用户名', dataIndex: 'userName', key: 'userName' },
    { title: '用户账号', dataIndex: 'userAccount', key: 'userAccount' },
    { title: '权限', dataIndex: 'userStatus', key: 'userStatus', render: (v: number) => ['浏览者', '管理员', '超级管理员'][v] || v },
    { title: '操作', key: 'action', render: (_: any, record: any) => (
      <Button type="link" onClick={() => openEditModal(record)}>编辑</Button>
    )},
  ];

  return (
    <div>
      <Form form={searchForm} layout="inline" style={{ marginBottom: 16 }}>
        <Form.Item name="userName"><Input placeholder="用户名" allowClear /></Form.Item>
        <Form.Item name="userAccount"><Input placeholder="用户账号" allowClear /></Form.Item>
        <Form.Item name="userStatus">
          <Select placeholder="权限" allowClear style={{ width: 120 }} options={[{value: 0, label: '浏览者'}, {value: 1, label: '管理员'}, {value: 2, label: '超级管理员'}]} />
        </Form.Item>
        <Form.Item>
          <Space>
            <Button type="primary" onClick={handleSearch}>搜索</Button>
            <Button onClick={handleReset}>重置</Button>
          </Space>
        </Form.Item>
      </Form>
      <div style={{marginBottom: 16}}><Button type="primary" onClick={openAddModal}>添加用户</Button></div>
      <Table dataSource={data} columns={columns} rowKey="userId" loading={loading} />
      <Modal title={isEditing ? '编辑用户' : '添加用户'} open={modalVisible} onCancel={() => { setModalVisible(false); setEditingRecord(null); }} onOk={handleSubmit} destroyOnClose>
        <Form form={form} layout="vertical">
          <Form.Item name="userName" label="用户名" rules={[{required: true}]}><Input /></Form.Item>
          {!isEditing && <Form.Item name="userAccount" label="用户账号" rules={[{required: true}]}><Input /></Form.Item>}
          <Form.Item name="password" label={isEditing ? '新密码（不修改请留空）' : '密码'} rules={isEditing ? [] : [{required: true}]}><Input.Password /></Form.Item>
          <Form.Item name="userStatus" label="权限" initialValue={0}><Select options={[{value: 0, label: '浏览者'}, {value: 1, label: '管理员'}, {value: 2, label: '超级管理员'}]} /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserAdmin;