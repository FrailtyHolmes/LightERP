import { useState, useEffect } from 'react';
import { Table, Form, Input, Button, Space, DatePicker, InputNumber, Modal, Select, message } from 'antd';
import dayjs from 'dayjs';
import { getPaymentList, updatePayment } from '../../api/payment';
import { getAllCustomers } from '../../api/customer';

const PaymentRecord = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [searchForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [editVisible, setEditVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [customers, setCustomers] = useState([] as any[]);

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

  const loadCustomers = async () => {
    try {
      const res = await getAllCustomers();
      setCustomers(res.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => { loadData(); loadCustomers(); }, []);

  const handleSearch = () => loadData(1, pagination.pageSize);
  const handleReset = () => { searchForm.resetFields(); loadData(1, pagination.pageSize, {}); };

  const handleEdit = (record: any) => {
    setEditingRecord(record);
    editForm.setFieldsValue({
      customerId: record.customerId,
      payment: record.payment,
      paymentTime: record.paymentTime ? dayjs(record.paymentTime) : undefined,
      comment: record.comment,
    });
    setEditVisible(true);
  };

  const handleEditSubmit = async () => {
    try {
      const values = await editForm.validateFields();
      await updatePayment(editingRecord.paymentId, values);
      message.success('更新成功');
      setEditVisible(false);
      loadData(pagination.current, pagination.pageSize);
    } catch (error: any) {
      if (error?.errorFields) return;
      message.error(error.message || '更新失败');
    }
  };

  const columns = [
    { title: '客户名', dataIndex: 'customerName', key: 'customerName' },
    { title: '付款金额', dataIndex: 'payment', key: 'payment', render: (v: number) => `¥${v?.toFixed(2)}` },
    { title: '付款时间', dataIndex: 'paymentTime', key: 'paymentTime', render: (v: string) => v ? dayjs(v).format('YYYY-MM-DD HH:mm') : '-' },
    { title: '备注', dataIndex: 'comment', key: 'comment' },
    { title: '操作', key: 'action', render: (_: any, record: any) => <Button type="link" onClick={() => handleEdit(record)}>编辑</Button> },
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
      <Modal title="编辑货款记录" open={editVisible} onCancel={() => setEditVisible(false)} onOk={handleEditSubmit} width={500}>
        <Form form={editForm} layout="vertical">
          <Form.Item name="customerId" label="客户" rules={[{ required: true }]}>
            <Select showSearch optionFilterProp="label" placeholder="选择客户" options={customers.map(c => ({ value: c.customerId, label: c.customerName + ' - ' + c.customerAddress }))} />
          </Form.Item>
          <Form.Item name="payment" label="付款金额" rules={[{ required: true }]}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="paymentTime" label="付款时间" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="comment" label="备注">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PaymentRecord;