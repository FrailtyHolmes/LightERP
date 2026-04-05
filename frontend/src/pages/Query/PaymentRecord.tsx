import { useState, useEffect } from 'react';
import { Table, message } from 'antd';
import { getPaymentList } from '../../api/payment';

const PaymentRecord = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  const loadData = async (page = 1, size = 10) => {
    setLoading(true);
    try {
      const res = await getPaymentList({ page, pageSize: size });
      setData(res.data.list || []);
      setPagination({ ...pagination, current: page, pageSize: size, total: res.data.total });
    } catch (error: any) { message.error(error.message || '加载失败');
    } finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);
  const columns = [
    { title: '客户名', dataIndex: 'customerName', key: 'customerName' },
    { title: '付款金额', dataIndex: 'payment', key: 'payment', render: (v: number) => `¥${v?.toFixed(2)}` },
    { title: '付款时间', dataIndex: 'paymentTime', key: 'paymentTime' },
    { title: '备注', dataIndex: 'comment', key: 'comment' },
  ];
  return <Table dataSource={data} columns={columns} rowKey="paymentId" loading={loading} pagination={{...pagination, onChange: (p, s) => loadData(p, s)}} />;
};

export default PaymentRecord;