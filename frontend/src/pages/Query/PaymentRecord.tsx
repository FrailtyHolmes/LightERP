import { useState, useEffect } from 'react';
import { Table, Form, Input, Button, Space, DatePicker, message } from 'antd';
import { getPaymentList } from '../../api/payment';

const PaymentRecord = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [searchForm] = Form.useForm();

  const loadData = async (page = 1, size = 10, filters?: any) => {
    setLoading(true);
    try {
      const params: any = { page, pageSize: size };
      const formValues = filters !== undefined ? filters : searchForm.getFieldsValue();
      if (formValues.customerName) params.customerName = formValues.customerName;
      if (formValues.paymentTimeStart) params.paymentTimeStart = formValues.paymentTimeStart.format('YYYY-MM-DD');
      if (formValues.paymentTimeEnd) params.paymentTimeEnd = formValues.paymentTimeEnd.format('YYYY-MM-DD');
      const res = await getPaymentList(params);
      setData(res.data.list || []);
      setPagination({ ...pagination, current: page, pageSize: size, total: res.data.total });
    } catch (error: any) { message.error(error.message || '加载失败');
    } finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const handleSearch = () => loadData(1, pagination.pageSize);
  const handleReset = () => { searchForm.resetFields(); loadData(1, pagination.pageSize, {}); };
  const columns = [
    { title: '客户名', dataIndex: 'customerName', key: 'customerName' },
    { title: '付款金额', dataIndex: 'payment', key: 'payment', render: (v: number) => `¥${v?.toFixed(2)}` },
    { title: '付款时间', dataIndex: 'paymentTime', key: 'paymentTime' },
    { title: '备注', dataIndex: 'comment', key: 'comment' },
  ];
  return (
    <div>
      <Form form={searchForm} layout="inline" style={{ marginBottom: 16 }}>
        <Form.Item name="customerName"><Input placeholder="客户名" allowClear /></Form.Item>
        <Form.Item name="paymentTimeStart"><DatePicker placeholder="付款开始日期" /></Form.Item>
        <Form.Item name="paymentTimeEnd"><DatePicker placeholder="付款结束日期" /></Form.Item>
        <Form.Item>
          <Space>
            <Button type="primary" onClick={handleSearch}>搜索</Button>
            <Button onClick={handleReset}>重置</Button>
          </Space>
        </Form.Item>
      </Form>
      <Table dataSource={data} columns={columns} rowKey="paymentId" loading={loading} pagination={{...pagination, onChange: (p, s) => loadData(p, s)}} />
    </div>
  );
};

export default PaymentRecord;