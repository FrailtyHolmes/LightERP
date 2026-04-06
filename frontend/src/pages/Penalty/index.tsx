import { useState, useEffect, useRef } from 'react';
import { Button, Form, Input, InputNumber, DatePicker, Select, Card, message } from 'antd';
import { UnorderedListOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { createPenalty } from '../../api/penalty';
import { getAllCustomers } from '../../api/customer';

const PenaltyList = () => {
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
        penaltyTime: rawValues.penaltyTime ? rawValues.penaltyTime.format('YYYY-MM-DD') : undefined,
      };
      await createPenalty(values);
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
        <h1>录入罚款</h1>
        <Button icon={<UnorderedListOutlined />} onClick={() => navigate('/query?tab=penalty')}>查看历史记录</Button>
      </div>
      <Card>
        <Form form={form} layout="vertical" style={{ maxWidth: 600 }}>
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
          <Form.Item>
            <Button type="primary" onClick={handleSubmit} loading={submitting}>提交</Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default PenaltyList;