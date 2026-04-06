import { useState, useEffect, useRef } from 'react';
import { Table, Button, Space, Modal, Card, Form, Input, Select, DatePicker, InputNumber, message } from 'antd';
import { UnorderedListOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { getInvoiceList, deleteInvoice, createInvoice } from '../../api/invoice';
import { getAllCustomers } from '../../api/customer';

type ViewMode = 'create' | 'list';

const InvoiceList = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('create');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([] as any[]);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const lastValuesRef = useRef<any>(null);

  const loadData = async (page = 1, size = 10) => {
    setLoading(true);
    try {
      const res = await getInvoiceList({ page, pageSize: size });
      setData(res.data.list || []);
      setPagination({ ...pagination, current: page, pageSize: size, total: res.data.total });
    } catch (error: any) {
      message.error(error.message || '加载失败');
    } finally {
      setLoading(false);
    }
  };

  const loadCustomers = async () => {
    try {
      const res = await getAllCustomers();
      setCustomers(res.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadCustomers();
    // 恢复上次填写的内容
    if (lastValuesRef.current) {
      form.setFieldsValue(lastValuesRef.current);
    }
  }, []);

  const switchToList = () => {
    setViewMode('list');
    loadData();
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const values = await form.validateFields();
      await createInvoice(values);
      message.success('提交成功');
      // 保留上次提交的内容
      lastValuesRef.current = values;
    } catch (error: any) {
      if (error?.errorFields) return; // 表单校验失败，不提示
      message.error(error.message || '提交失败');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: '确认删除？',
      onOk: async () => {
        try {
          await deleteInvoice(id);
          message.success('删除成功');
          loadData();
        } catch {
          message.error('删除失败');
        }
      }
    });
  };

  const columns = [
    { title: '发票ID', dataIndex: 'invoiceId', key: 'invoiceId' },
    { title: '客户名', dataIndex: 'customerName', key: 'customerName' },
    { title: '客户地址', dataIndex: 'customerAddress', key: 'customerAddress' },
    { title: '开票人', dataIndex: 'operater', key: 'operater' },
    { title: '开票时间', dataIndex: 'invoiceTime', key: 'invoiceTime', render: (v: string) => v ? dayjs(v).format('YYYY-MM-DD HH:mm') : '-' },
    { title: '总金额', dataIndex: 'totalMoney', key: 'totalMoney', render: (val: number) => `¥${val?.toFixed(2) || '0.00'}` },
    {
      title: '操作', key: 'action',
      render: (_: any, record: any) => (
        <Space>
          <Button type="link" danger onClick={() => handleDelete(record.invoiceId)}>删除</Button>
        </Space>
      ),
    },
  ];

  if (viewMode === 'list') {
    return (
      <div>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
          <h1>出库发票</h1>
          <Button type="primary" onClick={() => setViewMode('create')}>新建发票</Button>
        </div>
        <Table
          dataSource={data}
          columns={columns}
          rowKey="invoiceId"
          loading={loading}
          pagination={{ ...pagination, onChange: (page, size) => loadData(page, size) }}
        />
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <h1>新建出库发票</h1>
        <Button icon={<UnorderedListOutlined />} onClick={switchToList}>查看历史记录</Button>
      </div>
      <Card>
        <Form form={form} layout="vertical" style={{ maxWidth: 600 }}>
          <Form.Item name="customerId" label="客户" rules={[{ required: true, message: '请选择客户' }]}>
            <Select showSearch placeholder="选择客户" options={customers.map((c: any) => ({ value: c.customerId, label: c.customerName + ' - ' + c.customerAddress }))} />
          </Form.Item>
          <Form.Item name="invoiceTime" label="开票日期" rules={[{ required: true, message: '请选择开票日期' }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="operater" label="开票人" rules={[{ required: true, message: '请输入开票人' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="isFreeShipping" label="运费承担" initialValue={false}>
            <Select options={[{ value: true, label: '生产商付' }, { value: false, label: '客户付' }]} />
          </Form.Item>
          <Form.Item name="shippingFee" label="运费金额">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="comment" label="备注">
            <Input.TextArea rows={2} placeholder="补废xx、赠送xx" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" onClick={handleSubmit} loading={submitting}>提交</Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default InvoiceList;