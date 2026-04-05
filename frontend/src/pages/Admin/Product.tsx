import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Space, message } from 'antd';
import { getProductList, createProduct, updateProduct, deleteProduct } from '../../api/product';

const ProductAdmin = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [form] = Form.useForm();

  const isEditing = editingRecord !== null;

  const loadData = async () => {
    setLoading(true);
    try { const res = await getProductList(); setData(res.data.list || []); }
    catch (error: any) { message.error(error.message || '加载失败'); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const openAddModal = () => {
    setEditingRecord(null);
    form.resetFields();
    setModalVisible(true);
  };

  const openEditModal = (record: any) => {
    setEditingRecord(record);
    form.setFieldsValue({ productName: record.productName, productVolume: record.productVolume, productSize: record.productSize, productTag: record.productTag });
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    try {
      await form.validateFields();
      const values = form.getFieldsValue();

      if (isEditing) {
        await updateProduct(editingRecord.productId, values);
        message.success('编辑成功');
      } else {
        await createProduct(values);
        message.success('添加成功');
      }

      setModalVisible(false);
      form.resetFields();
      setEditingRecord(null);
      loadData();
    } catch (error: any) { message.error(error.message || '操作失败'); }
  };

  const handleDelete = async (id: number) => {
    Modal.confirm({ title: '确认删除?', onOk: async () => { try { await deleteProduct(id); message.success('删除成功'); loadData(); } catch { message.error('删除失败'); }}});
  };

  const columns = [
    { title: '产品名', dataIndex: 'productName', key: 'productName' },
    { title: '净含量', dataIndex: 'productVolume', key: 'productVolume' },
    { title: '规格', dataIndex: 'productSize', key: 'productSize' },
    { title: '特点', dataIndex: 'productTag', key: 'productTag' },
    { title: '操作', key: 'action', render: (_: any, r: any) => (
      <Space>
        <Button type="link" onClick={() => openEditModal(r)}>编辑</Button>
        <Button type="link" danger onClick={() => handleDelete(r.productId)}>删除</Button>
      </Space>
    )},
  ];

  return (
    <div>
      <div style={{marginBottom: 16}}><Button type="primary" onClick={openAddModal}>添加产品</Button></div>
      <Table dataSource={data} columns={columns} rowKey="productId" loading={loading} />
      <Modal title={isEditing ? '编辑产品' : '添加产品'} open={modalVisible} onCancel={() => { setModalVisible(false); setEditingRecord(null); }} onOk={handleSubmit} destroyOnClose>
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