import { useState, useEffect } from 'react';
import { Table, Form, Input, Button, Space, DatePicker, message } from 'antd';
import dayjs from 'dayjs';
import { getInvoiceList } from '../../api/invoice';

const InvoiceRecord = () => {
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
      if (formValues.operater) params.operater = formValues.operater;
      if (formValues.invoiceTimeStart) params.invoiceTimeStart = formValues.invoiceTimeStart.format('YYYY-MM-DD');
      if (formValues.invoiceTimeEnd) params.invoiceTimeEnd = formValues.invoiceTimeEnd.format('YYYY-MM-DD');
      const res = await getInvoiceList(params);
      setData(res.data.list || []);
      setPagination({ ...pagination, current: page, pageSize: size, total: res.data.total });
    } catch (error: any) {
      message.error(error.message || '加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleSearch = () => loadData(1, pagination.pageSize);
  const handleReset = () => { searchForm.resetFields(); loadData(1, pagination.pageSize, {}); };

  const columns = [
    { title: '发票ID', dataIndex: 'invoiceId', key: 'invoiceId' },
    { title: '客户名', dataIndex: 'customerName', key: 'customerName' },
    { title: '开票人', dataIndex: 'operater', key: 'operater' },
    { title: '开票时间', dataIndex: 'invoiceTime', key: 'invoiceTime', render: (v: string) => v ? dayjs(v).format('YYYY-MM-DD HH:mm') : '-' },
    { title: '总金额', dataIndex: 'totalMoney', key: 'totalMoney', render: (v: number) => `¥${v?.toFixed(2)}` },
  ];

  return (
    <div>
      <Form form={searchForm} layout="inline" style={{ marginBottom: 16 }}>
        <Form.Item name="customerName"><Input placeholder="客户名" allowClear /></Form.Item>
        <Form.Item name="operater"><Input placeholder="开票人" allowClear /></Form.Item>
        <Form.Item name="invoiceTimeStart"><DatePicker placeholder="开票开始日期" /></Form.Item>
        <Form.Item name="invoiceTimeEnd"><DatePicker placeholder="开票结束日期" /></Form.Item>
        <Form.Item>
          <Space>
            <Button type="primary" onClick={handleSearch}>搜索</Button>
            <Button onClick={handleReset}>重置</Button>
          </Space>
        </Form.Item>
      </Form>
      <Table dataSource={data} columns={columns} rowKey="invoiceId" loading={loading} pagination={{...pagination, onChange: (p, s) => loadData(p, s)}} />
    </div>
  );
};

export default InvoiceRecord;