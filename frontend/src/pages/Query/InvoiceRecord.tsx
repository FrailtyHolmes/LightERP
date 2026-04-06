import { useState, useEffect } from 'react';
import { Table, Form, Input, Button, Space, DatePicker, InputNumber, Select, Modal, Card, Divider, Typography, message } from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { getInvoiceList, getInvoiceDetail, updateInvoice } from '../../api/invoice';
import { getAllCustomers } from '../../api/customer';
import { getAllProducts } from '../../api/product';

const { Text } = Typography;

interface EditProductRow {
  productId?: number;
  productPrice?: number;
  productNum?: number;
  productMoney?: number;
}

const InvoiceRecord = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [searchForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [editVisible, setEditVisible] = useState(false);
  const [editingId, setEditingId] = useState<string>('');
  const [customers, setCustomers] = useState([] as any[]);
  const [products, setProducts] = useState([] as any[]);
  const [editProducts, setEditProducts] = useState<EditProductRow[]>([]);
  const [editShowShipping, setEditShowShipping] = useState(false);

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

  const loadCustomers = async () => {
    try {
      const res = await getAllCustomers();
      setCustomers(res.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const loadProducts = async () => {
    try {
      const res = await getAllProducts();
      setProducts(res.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => { loadData(); loadCustomers(); loadProducts(); }, []);

  const handleSearch = () => loadData(1, pagination.pageSize);
  const handleReset = () => { searchForm.resetFields(); loadData(1, pagination.pageSize, {}); };

  const handleEdit = async (invoiceId: string) => {
    try {
      const res = await getInvoiceDetail(invoiceId);
      const detail = res.data;
      setEditingId(invoiceId);
      editForm.setFieldsValue({
        customerId: detail.customerId,
        invoiceTime: detail.invoiceTime ? dayjs(detail.invoiceTime) : undefined,
        operater: detail.operater,
        comment: detail.comment,
        isFreeShipping: detail.isFreeShipping,
        shippingFee: detail.shippingFee,
      });
      const productRows = (detail.products || []).map((p: any) => ({
        productId: p.productId,
        productPrice: p.productPrice,
        productNum: p.productNum,
        productMoney: p.productMoney,
      }));
      setEditProducts(productRows);
      setEditShowShipping(detail.shippingFee != null || detail.isFreeShipping != null);
      setEditVisible(true);
    } catch (error: any) {
      message.error(error.message || '获取详情失败');
    }
  };

  const handleEditSubmit = async () => {
    try {
      const values = await editForm.validateFields();
      const submitData: any = {
        customerId: values.customerId,
        invoiceTime: values.invoiceTime,
        operater: values.operater,
        comment: values.comment,
        products: editProducts.map(row => ({
          productId: row.productId,
          productPrice: row.productPrice,
          productNum: row.productNum,
          productMoney: row.productMoney,
        })),
      };
      if (editShowShipping) {
        submitData.isFreeShipping = values.isFreeShipping;
        submitData.shippingFee = values.shippingFee;
      }
      await updateInvoice(editingId, submitData);
      message.success('更新成功');
      setEditVisible(false);
      loadData(pagination.current, pagination.pageSize);
    } catch (error: any) {
      if (error?.errorFields) return;
      message.error(error.message || '更新失败');
    }
  };

  // 编辑产品行操作
  const editProductChange = (index: number, field: string, value: any) => {
    const newRows = [...editProducts];
    (newRows[index] as any)[field] = value;
    if (field === 'productPrice' || field === 'productNum') {
      const price = field === 'productPrice' ? value : newRows[index].productPrice;
      const num = field === 'productNum' ? value : newRows[index].productNum;
      if (price && num) {
        newRows[index].productMoney = price * num;
      }
    }
    setEditProducts(newRows);
  };

  const columns = [
    { title: '发票ID', dataIndex: 'invoiceId', key: 'invoiceId' },
    { title: '客户名', dataIndex: 'customerName', key: 'customerName' },
    { title: '开票人', dataIndex: 'operater', key: 'operater' },
    { title: '开票时间', dataIndex: 'invoiceTime', key: 'invoiceTime', render: (v: string) => v ? dayjs(v).format('YYYY-MM-DD HH:mm') : '-' },
    { title: '总金额', dataIndex: 'totalMoney', key: 'totalMoney', render: (v: number) => `¥${v?.toFixed(2)}` },
    { title: '操作', key: 'action', render: (_: any, record: any) => <Button type="link" onClick={() => handleEdit(record.invoiceId)}>编辑</Button> },
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

      <Modal title="编辑出库发票" open={editVisible} onCancel={() => setEditVisible(false)} onOk={handleEditSubmit} width={750} destroyOnClose>
        <Form form={editForm} layout="vertical">
          <Form.Item name="customerId" label="客户" rules={[{ required: true, message: '请选择客户' }]}>
            <Select showSearch optionFilterProp="label" placeholder="选择客户" options={customers.map(c => ({ value: c.customerId, label: c.customerName + ' - ' + c.customerAddress }))} />
          </Form.Item>
          <Form.Item name="invoiceTime" label="开票日期" rules={[{ required: true, message: '请选择开票日期' }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="operater" label="开票人" rules={[{ required: true, message: '请输入开票人' }]}>
            <Input />
          </Form.Item>

          <Divider orientation="left">出库产品</Divider>
          {editProducts.map((row, index) => (
            <Card key={index} size="small" style={{ marginBottom: 8, background: '#fafafa' }}>
              <Space align="start" wrap>
                <div>
                  <Text type="secondary" style={{ fontSize: 12 }}>产品</Text>
                  <Select
                    style={{ width: 180 }}
                    showSearch
                    optionFilterProp="label"
                    placeholder="选择产品"
                    value={row.productId}
                    options={products.map((p: any) => ({ value: p.productId, label: `${p.productName} ${p.productVolume} ${p.productSize}` }))}
                    onChange={(val) => editProductChange(index, 'productId', val)}
                  />
                </div>
                <div>
                  <Text type="secondary" style={{ fontSize: 12 }}>单价</Text>
                  <InputNumber style={{ width: 100 }} min={0} precision={2} value={row.productPrice} onChange={(val) => editProductChange(index, 'productPrice', val)} />
                </div>
                <div>
                  <Text type="secondary" style={{ fontSize: 12 }}>数量</Text>
                  <InputNumber style={{ width: 80 }} min={1} precision={0} value={row.productNum} onChange={(val) => editProductChange(index, 'productNum', val)} />
                </div>
                <div>
                  <Text type="secondary" style={{ fontSize: 12 }}>出库金额</Text>
                  <InputNumber style={{ width: 100 }} min={0} precision={2} value={row.productMoney} onChange={(val) => editProductChange(index, 'productMoney', val)} />
                </div>
                <MinusCircleOutlined style={{ color: '#ff4d4f', fontSize: 18, marginTop: 24, cursor: 'pointer' }} onClick={() => setEditProducts(editProducts.filter((_, i) => i !== index))} />
              </Space>
            </Card>
          ))}
          <Button type="dashed" onClick={() => setEditProducts([...editProducts, {}])} block icon={<PlusOutlined />} style={{ marginBottom: 16 }}>添加出库产品</Button>

          {editShowShipping && (
            <>
              <Divider orientation="left">运费</Divider>
              <Space>
                <Form.Item name="isFreeShipping" label="是否生产商出运费" style={{ marginBottom: 0 }}>
                  <Select style={{ width: 160 }} options={[{ value: true, label: '是（生产商出）' }, { value: false, label: '否（客户出）' }]} />
                </Form.Item>
                <Form.Item name="shippingFee" label="运费金额" style={{ marginBottom: 0 }}>
                  <InputNumber min={0} precision={2} style={{ width: 150 }} />
                </Form.Item>
              </Space>
            </>
          )}
          {!editShowShipping && (
            <Button type="dashed" onClick={() => setEditShowShipping(true)} block icon={<PlusOutlined />} style={{ marginBottom: 16 }}>添加运费</Button>
          )}

          <Form.Item name="comment" label="备注">
            <Input.TextArea rows={2} maxLength={200} showCount placeholder="补废xx、赠送xx" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default InvoiceRecord;