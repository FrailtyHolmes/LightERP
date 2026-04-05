import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, DatePicker, Select, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { getPaymentList, createPayment, deletePayment } from '../../api/payment';
import { getAllCustomers } from '../../api/customer';

const PaymentList = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [customers, setCustomers] = useState([] as any[]);
  const [form] = Form.useForm();
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  const loadData = async (page = 1, size = 10) => {
    setLoading(true);
    try {
      const res = await getPaymentList({ page, pageSize: size });
      setData(res.data.list || []);
      setPagination({ ...pagination, current: page, pageSize: size, total: res.data.total });
    } catch (error: any) {
      message.error(error.message || '加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); loadCustomers(); }, []);

  const loadCustomers = async () => {
    try {
      const res = await getAllCustomers();
      setCustomers(res.data || []);
    } catch {}
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await createPayment(values);
      message.success('提交成功');
      setModalVisible(false);
      form.resetFields();
      loadData();
    } catch (error: any) {
      message.error(error.message || '提交失败');
    }
  };

  const handleDelete = async (id: number) => {
    Modal.confirm({ title: '确认删除？', onOk: async () => {
      try { await deletePayment(id); message.success('删除成功'); loadData(); } catch { message.error('删除失败'); }
    }});
  };

  const columns = [
    { title: '客户名', dataIndex: 'customerName', key: 'customerName' },
    { title: '客户地址', dataIndex: 'customerAddress', key: 'customerAddress' },
    { title: '付款金额', dataIndex: 'payment', key: 'payment', render: (val: number) => `¥${val?.toFixed(2) || '0.00'}` },
    { title: '付款时间', dataIndex: 'paymentTime', key: 'paymentTime', render: (v: string) => v ? dayjs(v).format('YYYY-MM-DD HH:mm') : '-' },
    { title: '备注', dataIndex: 'comment', key: 'comment' },
    { title: '操作', key: 'action', render: (_: any, r: any) => <Button type="link" danger onClick={() => handleDelete(r.paymentId)}>删除</Button> },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <h1>货款录入</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>录入货款</Button>
      </div>
      <Table dataSource={data} columns={columns} rowKey="paymentId" loading={loading} pagination={{...pagination, onChange: (p, s) => loadData(p, s)}} />
      <Modal title="录入货款" open={modalVisible} onCancel={() => setModalVisible(false)} onOk={handleSubmit} width={500}>
        <Form form={form} layout="vertical">
          <Form.Item name="customerId" label="客户" rules={[{ required: true }]}>
            <Select placeholder="选择客户" options={customers.map(c => ({ value: c.customerId, label: c.customerName }))} />
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

export default PaymentList;