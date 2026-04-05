import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Space, message } from 'antd';
import { getCustomerList, createCustomer, updateCustomer, deleteCustomer } from '../../api/customer';

const CustomerAdmin = () => {
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
      if (params.customerName) cleanParams.customerName = params.customerName;
      if (params.customerAddress) cleanParams.customerAddress = params.customerAddress;
      const res = await getCustomerList(cleanParams);
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
    form.setFieldsValue({ customerName: record.customerName, customerAddress: record.customerAddress, customerPhone: record.customerPhone });
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    try {
      await form.validateFields();
      const values = form.getFieldsValue();

      if (isEditing) {
        await updateCustomer(editingRecord.customerId, values);
        message.success('编辑成功');
      } else {
        await createCustomer(values);
        message.success('添加成功');
      }

      setModalVisible(false);
      form.resetFields();
      setEditingRecord(null);
      loadData();
    } catch (error: any) { message.error(error.message || '操作失败'); }
  };

  const handleDelete = async (id: number) => {
    Modal.confirm({ title: '确认删除?', onOk: async () => { try { await deleteCustomer(id); message.success('删除成功'); loadData(); } catch { message.error('删除失败'); }}});
  };

  const columns = [
    { title: '客户名', dataIndex: 'customerName', key: 'customerName' },
    { title: '客户地址', dataIndex: 'customerAddress', key: 'customerAddress' },
    { title: '联系方式', dataIndex: 'customerPhone', key: 'customerPhone' },
    { title: '操作', key: 'action', render: (_: any, r: any) => (
      <Space>
        <Button type="link" onClick={() => openEditModal(r)}>编辑</Button>
        <Button type="link" danger onClick={() => handleDelete(r.customerId)}>删除</Button>
      </Space>
    )},
  ];

  return (
    <div>
      <Form form={searchForm} layout="inline" style={{ marginBottom: 16 }}>
        <Form.Item name="customerName"><Input placeholder="客户名" allowClear /></Form.Item>
        <Form.Item name="customerAddress"><Input placeholder="客户地址" allowClear /></Form.Item>
        <Form.Item>
          <Space>
            <Button type="primary" onClick={handleSearch}>搜索</Button>
            <Button onClick={handleReset}>重置</Button>
          </Space>
        </Form.Item>
      </Form>
      <div style={{marginBottom: 16}}><Button type="primary" onClick={openAddModal}>添加客户</Button></div>
      <Table dataSource={data} columns={columns} rowKey="customerId" loading={loading} />
      <Modal title={isEditing ? '编辑客户' : '添加客户'} open={modalVisible} onCancel={() => { setModalVisible(false); setEditingRecord(null); }} onOk={handleSubmit} destroyOnClose>
        <Form form={form} layout="vertical">
          <Form.Item name="customerName" label="客户名" rules={[{required: true}]}><Input /></Form.Item>
          <Form.Item name="customerAddress" label="客户地址" rules={[{required: true}]}><Input /></Form.Item>
          <Form.Item name="customerPhone" label="联系方式"><Input /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CustomerAdmin;