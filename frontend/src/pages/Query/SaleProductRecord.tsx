import { useState, useEffect } from 'react';
import { Table, message } from 'antd';
import api from '../../api';

const SaleProductRecord = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0, totalMoney: 0 });

  const loadData = async (page = 1, size = 10) => {
    setLoading(true);
    try {
      const res = await api.get('/query/sale-product/list', { params: { page, pageSize: size } });
      setData(res.data.list || []);
      setPagination({ ...pagination, current: page, pageSize: size, total: res.data.total, totalMoney: res.data.totalMoney || 0 });
    } catch (error: any) { message.error(error.message || '加载失败');
    } finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);
  const columns = [
    { title: '发票ID', dataIndex: 'invoiceId', key: 'invoiceId' },
    { title: '产品名', dataIndex: 'productName', key: 'productName' },
    { title: '单价', dataIndex: 'productPrice', key: 'productPrice', render: (v: number) => `¥${v?.toFixed(2)}` },
    { title: '数量', dataIndex: 'productNum', key: 'productNum' },
    { title: '出库金额', dataIndex: 'productMoney', key: 'productMoney', render: (v: number) => `¥${v?.toFixed(2)}` },
    { title: '开票人', dataIndex: 'operater', key: 'operater' },
  ];
  return (
    <div>
      <div style={{marginBottom: 8, fontWeight: 'bold'}}>总金额: ¥{pagination.totalMoney?.toFixed(2) || '0.00'}</div>
      <Table dataSource={data} columns={columns} rowKey="id" loading={loading} pagination={{...pagination, onChange: (p, s) => loadData(p, s)}} />
    </div>
  );
};

export default SaleProductRecord;