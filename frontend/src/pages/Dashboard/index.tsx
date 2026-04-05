import { useEffect, useState } from 'react';
import { Card, Row, Col, Table } from 'antd';
import { Column } from '@ant-design/plots';
import api from '../../api';

const Dashboard = () => {
  const [topCustomers, setTopCustomers] = useState([] as any[]);
  const [chartData, setChartData] = useState([] as any[]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const customersRes = await api.get('/stats/top-unpaid-customers');
      setTopCustomers(customersRes.data || []);

      const chartRes = await api.get('/stats/invoice-chart', { params: { type: 'month' } });
      setChartData(chartRes.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const chartConfig = {
    data: chartData,
    xField: 'date',
    yField: 'count',
    label: { position: 'middle' as const },
  };

  const columns = [
    { title: '客户名', dataIndex: 'customerName', key: 'customerName' },
    { title: '客户地址', dataIndex: 'customerAddress', key: 'customerAddress' },
  ];

  return (
    <div>
      <h1>可视化</h1>
      <Row gutter={16}>
        <Col span={12}>
          <Card title="Top10 未付款客户">
            <Table dataSource={topCustomers} columns={columns} rowKey="customerId" pagination={false} />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="发票数量趋势">
            {chartData.length > 0 ? <Column {...chartConfig} height={300} /> : <div>暂无数据</div>}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;