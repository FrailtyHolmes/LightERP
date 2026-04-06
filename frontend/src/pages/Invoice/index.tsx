import { useState, useEffect, useRef } from 'react';
import { Button, Card, Form, Input, Select, DatePicker, InputNumber, message } from 'antd';
import { UnorderedListOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { createInvoice } from '../../api/invoice';
import { getAllCustomers } from '../../api/customer';

const InvoiceList = () => {
  const [customers, setCustomers] = useState([] as any[]);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();
  const lastValuesRef = useRef<any>(null);
  const navigate = useNavigate();

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
    if (lastValuesRef.current) {
      form.setFieldsValue(lastValuesRef.current);
    }
  }, []);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const values = await form.validateFields();
      await createInvoice(values);
      message.success('提交成功');
      lastValuesRef.current = values;
    } catch (error: any) {
      if (error?.errorFields) return;
      message.error(error.message || '提交失败');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <h1>新建出库发票</h1>
        <Button icon={<UnorderedListOutlined />} onClick={() => navigate('/query?tab=invoice')}>查看历史记录</Button>
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