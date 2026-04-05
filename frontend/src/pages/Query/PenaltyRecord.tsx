import { useState, useEffect } from 'react';
import { Table, message } from 'antd';
import { getPenaltyList } from '../../api/penalty';

const PenaltyRecord = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  const loadData = async (page = 1, size = 10) => {
    setLoading(true);
    try {
      const res = await getPenaltyList({ page, pageSize: size });
      setData(res.data.list || []);
      setPagination({ ...pagination, current: page, pageSize: size, total: res.data.total });
    } catch (error: any) { message.error(error.message || '加载失败');
    } finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);
  const columns = [
    { title: '客户名', dataIndex: 'customerName', key: 'customerName' },
    { title: '罚款金额', dataIndex: 'penalty', key: 'penalty', render: (v: number) => `¥${v?.toFixed(2)}` },
    { title: '罚款时间', dataIndex: 'penaltyTime', key: 'penaltyTime' },
    { title: '备注', dataIndex: 'comment', key: 'comment' },
  ];
  return <Table dataSource={data} columns={columns} rowKey="penaltyId" loading={loading} pagination={{...pagination, onChange: (p, s) => loadData(p, s)}} />;
};

export default PenaltyRecord;