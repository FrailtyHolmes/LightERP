import { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, DatePicker, InputNumber, message } from 'antd';
import { getAllCustomers } from '../../api/customer';
import { createInvoice } from '../../api/invoice';

const InvoiceModal = ({ visible, onClose, onSuccess }: any) => {
  const [form] = Form.useForm();
  const [customers, setCustomers] = useState([] as any[]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      loadCustomers();
    }
  }, [visible]);

  const loadCustomers = async () => {
    try {
      const res = await getAllCustomers();
      setCustomers(res.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const values = await form.validateFields();
      await createInvoice(values);
      onSuccess();
      form.resetFields();
    } catch (error: any) {
      message.error(error.message || '提交失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="新建出库发票" open={visible} onCancel={onClose} onOk={handleSubmit} confirmLoading={loading} width={600}>
      <Form form={form} layout="vertical">
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
      </Form>
    </Modal>
  );
};

export default InvoiceModal;