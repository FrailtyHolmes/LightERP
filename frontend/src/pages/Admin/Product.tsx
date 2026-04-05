import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, message } from 'antd';
import { getProductList, createProduct, deleteProduct } from '../../api/product';

const ProductAdmin = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  const loadData = async () => {
    setLoading(true);
    try { const res = await getProductList(); setData(res.data.list || []); }
    catch (error: any) { message.error(error.message || '加载失败'); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const handleSubmit = async () => {
    try { await form.validateFields(); await createProduct(form.getFieldsValue()); message.success('添加成功'); setModalVisible(false); form.resetFields(); loadData(); }
    catch (error: any) { message.error(error.message || '添加失败'); }
  };

  const handleDelete = async (id: number) => {
    Modal.confirm({ title: '确认删除?', onOk: async () => { try { await deleteProduct(id); message.success('删除成功'); loadData(); } catch { message.error('删除失败'); }}});
  };

  const columns = [
    { title: '产品名', dataIndex: 'productName', key: 'productName' },
    { title: '净含量', dataIndex: 'productVolume', key: 'productVolume' },
    { title: '规格', dataIndex: 'productSize', key: 'productSize' },
    { title: '特点', dataIndex: 'productTag', key: 'productTag' },
    { title: '操作', key: 'action', render: (_: any, r: any) => <Button type="link" danger onClick={() => handleDelete(r.productId)}>删除</Button> },
  ];

  return (
    <div>
      <div style={{marginBottom: 16}}><Button type="primary" onClick={() => setModalVisible(true)}>添加产品</Button></div>
      <Table dataSource={data} columns={columns} rowKey="productId" loading={loading} />
      <Modal title="添加产品" open={modalVisible} onCancel={() => setModalVisible(false)} onOk={handleSubmit}>
        <Form form={form} layout="vertical">
          <Form.Item name="productName" label="产品名" rules={[{required: true}]}><Input /></Form.Item>
          <Form.Item name="productVolume" label="净含量" rules={[{required: true}]}><Input /></Form.Item>
          <Form.Item name="productSize" label="规格" rules={[{required: true}]}><Input /></Form.Item>
          <Form.Item name="productTag" label="特点"><Input /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProductAdmin;