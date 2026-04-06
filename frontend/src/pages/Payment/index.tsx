import { useState, useEffect, useRef } from 'react';
import { Button, Form, Input, InputNumber, DatePicker, Select, Card, message } from 'antd';
import { UnorderedListOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { createPayment } from '../../api/payment';
import { getAllCustomers } from '../../api/customer';

const PaymentList = () => {
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
      const rawValues = await form.validateFields();
      const values = {
        ...rawValues,
        paymentTime: rawValues.paymentTime ? rawValues.paymentTime.format('YYYY-MM-DD') : undefined,
      };
      await createPayment(values);
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
        <h1>录入货款</h1>
        <Button icon={<UnorderedListOutlined />} onClick={() => navigate('/query?tab=payment')}>查看历史记录</Button>
      </div>
      <Card>
        <Form form={form} layout="vertical" style={{ maxWidth: 600 }}>
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
          <Form.Item>
            <Button type="primary" onClick={handleSubmit} loading={submitting}>提交</Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default PaymentList;