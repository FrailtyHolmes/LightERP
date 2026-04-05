import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, message } from 'antd';
import { getCustomerList, createCustomer, deleteCustomer } from '../../api/customer';

const CustomerAdmin = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  const loadData = async () => {
    setLoading(true);
    try { const res = await getCustomerList(); setData(res.data.list || []); }
    catch (error: any) { message.error(error.message || '加载失败'); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const handleSubmit = async () => {
    try { await form.validateFields(); await createCustomer(form.getFieldsValue()); message.success('添加成功'); setModalVisible(false); form.resetFields(); loadData(); }
    catch (error: any) { message.error(error.message || '添加失败'); }
  };

  const handleDelete = async (id: number) => {
    Modal.confirm({ title: '确认删除?', onOk: async () => { try { await deleteCustomer(id); message.success('删除成功'); loadData(); } catch { message.error('删除失败'); }}});
  };

  const columns = [
    { title: '客户名', dataIndex: 'customerName', key: 'customerName' },
    { title: '客户地址', dataIndex: 'customerAddress', key: 'customerAddress' },
    { title: '联系方式', dataIndex: 'customerPhone', key: 'customerPhone' },
    { title: '操作', key: 'action', render: (_: any, r: any) => <Button type="link" danger onClick={() => handleDelete(r.customerId)}>删除</Button> },
  ];

  return (
    <div>
      <div style={{marginBottom: 16}}><Button type="primary" onClick={() => setModalVisible(true)}>添加客户</Button></div>
      <Table dataSource={data} columns={columns} rowKey="customerId" loading={loading} />
      <Modal title="添加客户" open={modalVisible} onCancel={() => setModalVisible(false)} onOk={handleSubmit}>
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