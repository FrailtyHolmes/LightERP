import { useState, useEffect } from 'react';
import { Table, Form, Input, Button, Space, Select, message } from 'antd';
import api from '../../api';
import { getAllCustomers } from '../../api/customer';

const SaleProductRecord = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0, totalMoney: 0 });
  const [searchForm] = Form.useForm();
  const [customers, setCustomers] = useState([] as any[]);
  const [products, setProducts] = useState([] as any[]);

  const loadOptions = async () => {
    try {
      const [cRes, pRes] = await Promise.all([getAllCustomers(), api.get('/common/products')]);
      setCustomers(cRes.data || []);
      setProducts(pRes.data || []);
    } catch {}
  };

  const loadData = async (page = 1, size = 10, filters?: any) => {
    setLoading(true);
    try {
      const params: any = { page, pageSize: size };
      const formValues = filters !== undefined ? filters : searchForm.getFieldsValue();
      if (formValues.customerId) params.customerId = formValues.customerId;
      if (formValues.productId) params.productId = formValues.productId;
      if (formValues.operater) params.operater = formValues.operater;
      const res = await api.get('/query/sale-product/list', { params });
      setData(res.data.list || []);
      setPagination({ ...pagination, current: page, pageSize: size, total: res.data.total, totalMoney: res.data.totalMoney || 0 });
    } catch (error: any) { message.error(error.message || '加载失败');
    } finally { setLoading(false); }
  };

  useEffect(() => { loadData(); loadOptions(); }, []);

  const handleSearch = () => loadData(1, pagination.pageSize);
  const handleReset = () => { searchForm.resetFields(); loadData(1, pagination.pageSize, {}); };
  const columns = [
    { title: '发票ID', dataIndex: 'invoiceId', key: 'invoiceId' },
    { title: '产品名', dataIndex: 'productName', key: 'productName' },
    { title: '单价', dataIndex: 'productPrice', key: 'productPrice', render: (v: number) => `¥${v?.toFixed(2)}` },
    { title: '数量', dataIndex: 'productNum', key: 'productNum' },
    { title: '出库金额', dataIndex: 'productMoney', key: 'productMoney', render: (v: number) => `¥${v?.toFixed(2)}` },
    { title: '开票人', dataIndex: 'operater', key: 'operater' },
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
        <Form.Item name="operater"><Input placeholder="开票人" allowClear /></Form.Item>
        <Form.Item>
          <Space>
            <Button type="primary" onClick={handleSearch}>搜索</Button>
            <Button onClick={handleReset}>重置</Button>
          </Space>
        </Form.Item>
      </Form>
      <div style={{marginBottom: 8, fontWeight: 'bold'}}>总金额: ¥{pagination.totalMoney?.toFixed(2) || '0.00'}</div>
      <Table dataSource={data} columns={columns} rowKey="id" loading={loading} pagination={{...pagination, onChange: (p, s) => loadData(p, s)}} />
    </div>
  );
};

export default SaleProductRecord;