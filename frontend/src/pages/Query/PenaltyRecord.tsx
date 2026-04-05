import { useState, useEffect } from 'react';
import { Table, Form, Input, Button, Space, DatePicker, message } from 'antd';
import { getPenaltyList } from '../../api/penalty';

const PenaltyRecord = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [searchForm] = Form.useForm();

  const loadData = async (page = 1, size = 10, filters?: any) => {
    setLoading(true);
    try {
      const params: any = { page, pageSize: size };
      const formValues = filters !== undefined ? filters : searchForm.getFieldsValue();
      if (formValues.customerName) params.customerName = formValues.customerName;
      if (formValues.penaltyTimeStart) params.penaltyTimeStart = formValues.penaltyTimeStart.format('YYYY-MM-DD');
      if (formValues.penaltyTimeEnd) params.penaltyTimeEnd = formValues.penaltyTimeEnd.format('YYYY-MM-DD');
      const res = await getPenaltyList(params);
      setData(res.data.list || []);
      setPagination({ ...pagination, current: page, pageSize: size, total: res.data.total });
    } catch (error: any) { message.error(error.message || '加载失败');
    } finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const handleSearch = () => loadData(1, pagination.pageSize);
  const handleReset = () => { searchForm.resetFields(); loadData(1, pagination.pageSize, {}); };
  const columns = [
    { title: '客户名', dataIndex: 'customerName', key: 'customerName' },
    { title: '罚款金额', dataIndex: 'penalty', key: 'penalty', render: (v: number) => `¥${v?.toFixed(2)}` },
    { title: '罚款时间', dataIndex: 'penaltyTime', key: 'penaltyTime' },
    { title: '备注', dataIndex: 'comment', key: 'comment' },
  ];
  return (
    <div>
      <Form form={searchForm} layout="inline" style={{ marginBottom: 16 }}>
        <Form.Item name="customerName"><Input placeholder="客户名" allowClear /></Form.Item>
        <Form.Item name="penaltyTimeStart"><DatePicker placeholder="罚款开始日期" /></Form.Item>
        <Form.Item name="penaltyTimeEnd"><DatePicker placeholder="罚款结束日期" /></Form.Item>
        <Form.Item>
          <Space>
            <Button type="primary" onClick={handleSearch}>搜索</Button>
            <Button onClick={handleReset}>重置</Button>
          </Space>
        </Form.Item>
      </Form>
      <Table dataSource={data} columns={columns} rowKey="penaltyId" loading={loading} pagination={{...pagination, onChange: (p, s) => loadData(p, s)}} />
    </div>
  );
};

export default PenaltyRecord;