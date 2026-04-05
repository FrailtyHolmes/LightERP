import { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { getInvoiceList, deleteInvoice } from '../../api/invoice';
import InvoiceModal from './InvoiceModal';

const InvoiceList = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

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

  useEffect(() => {
    loadData();
  }, []);

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

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <h1>出库发票</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>
          新建发票
        </Button>
      </div>
      <Table
        dataSource={data}
        columns={columns}
        rowKey="invoiceId"
        loading={loading}
        pagination={{ ...pagination, onChange: (page, size) => loadData(page, size) }}
      />
      <InvoiceModal visible={modalVisible} onClose={() => setModalVisible(false)} onSuccess={() => { setModalVisible(false); loadData(); }} />
    </div>
  );
};

export default InvoiceList;