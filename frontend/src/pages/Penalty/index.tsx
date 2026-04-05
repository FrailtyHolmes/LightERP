import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, DatePicker, Select, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { getPenaltyList, createPenalty, deletePenalty } from '../../api/penalty';
import { getAllCustomers } from '../../api/customer';

const PenaltyList = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [customers, setCustomers] = useState([] as any[]);
  const [form] = Form.useForm();
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  const loadData = async (page = 1, size = 10) => {
    setLoading(true);
    try {
      const res = await getPenaltyList({ page, pageSize: size });
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
      await createPenalty(values);
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
      try { await deletePenalty(id); message.success('删除成功'); loadData(); } catch { message.error('删除失败'); }
    }});
  };

  const columns = [
    { title: '客户名', dataIndex: 'customerName', key: 'customerName' },
    { title: '客户地址', dataIndex: 'customerAddress', key: 'customerAddress' },
    { title: '罚款金额', dataIndex: 'penalty', key: 'penalty', render: (val: number) => `¥${val?.toFixed(2) || '0.00'}` },
    { title: '罚款时间', dataIndex: 'penaltyTime', key: 'penaltyTime' },
    { title: '备注', dataIndex: 'comment', key: 'comment' },
    { title: '操作', key: 'action', render: (_: any, r: any) => <Button type="link" danger onClick={() => handleDelete(r.penaltyId)}>删除</Button> },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <h1>罚款录入</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>录入罚款</Button>
      </div>
      <Table dataSource={data} columns={columns} rowKey="penaltyId" loading={loading} pagination={{...pagination, onChange: (p, s) => loadData(p, s)}} />
      <Modal title="录入罚款" open={modalVisible} onCancel={() => setModalVisible(false)} onOk={handleSubmit} width={500}>
        <Form form={form} layout="vertical">
          <Form.Item name="customerId" label="客户" rules={[{ required: true }]}>
            <Select placeholder="选择客户" options={customers.map(c => ({ value: c.customerId, label: c.customerName }))} />
          </Form.Item>
          <Form.Item name="penalty" label="罚款金额" rules={[{ required: true }]}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="penaltyTime" label="罚款时间">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="comment" label="备注">
            <Input.TextArea rows={2} placeholder="请输入罚款原因" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PenaltyList;