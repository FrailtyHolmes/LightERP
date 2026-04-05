import { useState, useEffect } from 'react';
import { Table, message } from 'antd';
import { getInvoiceList } from '../../api/invoice';

const InvoiceRecord = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
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

  useEffect(() => { loadData(); }, []);

  const columns = [
    { title: '发票ID', dataIndex: 'invoiceId', key: 'invoiceId' },
    { title: '客户名', dataIndex: 'customerName', key: 'customerName' },
    { title: '开票人', dataIndex: 'operater', key: 'operater' },
    { title: '开票时间', dataIndex: 'invoiceTime', key: 'invoiceTime' },
    { title: '总金额', dataIndex: 'totalMoney', key: 'totalMoney', render: (v: number) => `¥${v?.toFixed(2)}` },
  ];

  return <Table dataSource={data} columns={columns} rowKey="invoiceId" loading={loading} pagination={{...pagination, onChange: (p, s) => loadData(p, s)}} />;
};

export default InvoiceRecord;