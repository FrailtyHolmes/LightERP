import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, InputNumber, DatePicker, Select, Space, message } from 'antd';
import dayjs from 'dayjs';
import api from '../../api';

const PriceAdmin = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [customers, setCustomers] = useState([] as any[]);
  const [products, setProducts] = useState([] as any[]);
  const [form] = Form.useForm();

  const isEditing = editingRecord !== null;

  const [searchForm] = Form.useForm();

  const loadData = async (filters?: any) => {
    setLoading(true);
    try {
      const params = filters || searchForm.getFieldsValue();
      const cleanParams: any = {};
      if (params.customerId) cleanParams.customerId = params.customerId;
      if (params.productId) cleanParams.productId = params.productId;
      const res = await api.get('/admin/price/list', { params: cleanParams });
      setData(res.data.list || []);
    } catch (error: any) { message.error(error.message || '加载失败'); }
    finally { setLoading(false); }
  };

  const loadOptions = async () => {
    try {
      const [cRes, pRes] = await Promise.all([api.get('/common/customers'), api.get('/common/products')]);
      setCustomers(cRes.data || []); setProducts(pRes.data || []);
    } catch {}
  };

  useEffect(() => { loadData(); loadOptions(); }, []);

  const handleSearch = () => loadData();
  const handleReset = () => { searchForm.resetFields(); loadData({}); };

  const openAddModal = () => {
    setEditingRecord(null);
    form.resetFields();
    setModalVisible(true);
  };

  const openEditModal = (record: any) => {
    setEditingRecord(record);
    form.setFieldsValue({
      customerId: record.customerId,
      productId: record.productId,
      price: record.price,
      effectiveDateStart: record.effectiveDateStart ? dayjs(record.effectiveDateStart) : undefined,
      effectiveDateEnd: record.effectiveDateEnd ? dayjs(record.effectiveDateEnd) : undefined,
    });
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    try {
      await form.validateFields();
      const rawValues = form.getFieldsValue();
      const values = {
        ...rawValues,
        effectiveDateStart: rawValues.effectiveDateStart ? dayjs(rawValues.effectiveDateStart).format('YYYY-MM-DD') : undefined,
        effectiveDateEnd: rawValues.effectiveDateEnd ? dayjs(rawValues.effectiveDateEnd).format('YYYY-MM-DD') : undefined,
      };

      if (isEditing) {
        await api.put(`/admin/price/${editingRecord.id}`, values);
        message.success('编辑成功');
      } else {
        await api.post('/admin/price', values);
        message.success('添加成功');
      }

      setModalVisible(false);
      form.resetFields();
      setEditingRecord(null);
      loadData();
    } catch (error: any) { message.error(error.message || '操作失败'); }
  };

  const handleDelete = async (id: number) => {
    Modal.confirm({ title: '确认删除?', onOk: async () => { try { await api.delete(`/admin/price/${id}`); message.success('删除成功'); loadData(); } catch { message.error('删除失败'); }}});
  };

  const columns = [
    { title: '客户名', dataIndex: 'customerName', key: 'customerName' },
    { title: '产品名', dataIndex: 'productName', key: 'productName' },
    { title: '单价', dataIndex: 'price', key: 'price', render: (v: number) => v ? `¥${v?.toFixed(2)}` : '未添加单价' },
    { title: '生效开始', dataIndex: 'effectiveDateStart', key: 'effectiveDateStart', render: (v: string) => v ? dayjs(v).format('YYYY-MM-DD') : '-' },
    { title: '生效结束', dataIndex: 'effectiveDateEnd', key: 'effectiveDateEnd', render: (v: string) => v ? dayjs(v).format('YYYY-MM-DD') : '-' },
    { title: '操作', key: 'action', render: (_: any, r: any) => (
      <Space>
        <Button type="link" onClick={() => openEditModal(r)}>编辑</Button>
        <Button type="link" danger onClick={() => handleDelete(r.id)}>删除</Button>
      </Space>
    )},
  ];

  return (
    <div>
      <Form form={searchForm} layout="inline" style={{ marginBottom: 16 }}>
        <Form.Item name="customerId">
          <Select placeholder="选择客户" allowClear style={{ width: 160 }} options={customers.map(c => ({value: c.customerId, label: c.customerName}))} />
        </Form.Item>
        <Form.Item name="productId">
          <Select placeholder="选择产品" allowClear style={{ width: 160 }} options={products.map(p => ({value: p.productId, label: p.productName}))} />
        </Form.Item>
        <Form.Item>
          <Space>
            <Button type="primary" onClick={handleSearch}>搜索</Button>
            <Button onClick={handleReset}>重置</Button>
          </Space>
        </Form.Item>
      </Form>
      <div style={{marginBottom: 16}}><Button type="primary" onClick={openAddModal}>添加单价</Button></div>
      <Table dataSource={data} columns={columns} rowKey="id" loading={loading} />
      <Modal title={isEditing ? '编辑单价' : '添加单价'} open={modalVisible} onCancel={() => { setModalVisible(false); setEditingRecord(null); }} onOk={handleSubmit} afterClose={() => form.resetFields()}>
        <Form form={form} layout="vertical">
          <Form.Item name="customerId" label="客户" rules={[{required: true}]}><Select disabled={isEditing} options={customers.map(c => ({value: c.customerId, label: c.customerName}))} /></Form.Item>
          <Form.Item name="productId" label="产品" rules={[{required: true}]}><Select disabled={isEditing} options={products.map(p => ({value: p.productId, label: p.productName}))} /></Form.Item>
          <Form.Item name="price" label="单价" rules={[{required: true}]}><InputNumber min={0} style={{width: '100%'}} /></Form.Item>
          <Form.Item name="effectiveDateStart" label="生效开始日期"><DatePicker style={{width: '100%'}} /></Form.Item>
          <Form.Item name="effectiveDateEnd" label="生效结束日期"><DatePicker style={{width: '100%'}} /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PriceAdmin;