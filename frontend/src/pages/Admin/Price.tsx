import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, InputNumber, DatePicker, Select, message } from 'antd';
import api from '../../api';

const PriceAdmin = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [customers, setCustomers] = useState([] as any[]);
  const [products, setProducts] = useState([] as any[]);
  const [form] = Form.useForm();

  const loadData = async () => {
    setLoading(true);
    try { const res = await api.get('/admin/price/list'); setData(res.data.list || []); }
    catch (error: any) { message.error(error.message || '加载失败'); }
    finally { setLoading(false); }
  };

  const loadOptions = async () => {
    try {
      const [cRes, pRes] = await Promise.all([api.get('/common/customers'), api.get('/common/products')]);
      setCustomers(cRes.data || []); setProducts(pRes.data || []);
    } catch {}
  };

  useEffect(() => { loadData(); loadOptions(); }, []);

  const handleSubmit = async () => {
    try { await form.validateFields(); await api.post('/admin/price', form.getFieldsValue()); message.success('添加成功'); setModalVisible(false); form.resetFields(); loadData(); }
    catch (error: any) { message.error(error.message || '添加失败'); }
  };

  const columns = [
    { title: '客户名', dataIndex: 'customerName', key: 'customerName' },
    { title: '产品名', dataIndex: 'productName', key: 'productName' },
    { title: '单价', dataIndex: 'price', key: 'price', render: (v: number) => v ? `¥${v?.toFixed(2)}` : '未添加单价' },
    { title: '生效开始', dataIndex: 'effectiveDateStart', key: 'effectiveDateStart' },
    { title: '生效结束', dataIndex: 'effectiveDateEnd', key: 'effectiveDateEnd' },
  ];

  return (
    <div>
      <div style={{marginBottom: 16}}><Button type="primary" onClick={() => setModalVisible(true)}>添加单价</Button></div>
      <Table dataSource={data} columns={columns} rowKey="id" loading={loading} />
      <Modal title="添加单价" open={modalVisible} onCancel={() => setModalVisible(false)} onOk={handleSubmit}>
        <Form form={form} layout="vertical">
          <Form.Item name="customerId" label="客户" rules={[{required: true}]}><Select options={customers.map(c => ({value: c.customerId, label: c.customerName}))} /></Form.Item>
          <Form.Item name="productId" label="产品" rules={[{required: true}]}><Select options={products.map(p => ({value: p.productId, label: p.productName}))} /></Form.Item>
          <Form.Item name="price" label="单价" rules={[{required: true}]}><InputNumber min={0} style={{width: '100%'}} /></Form.Item>
          <Form.Item name="effectiveDateStart" label="生效开始日期"><DatePicker style={{width: '100%'}} /></Form.Item>
          <Form.Item name="effectiveDateEnd" label="生效结束日期"><DatePicker style={{width: '100%'}} /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PriceAdmin;