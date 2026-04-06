import { useEffect, useState } from 'react';
import { Card, Row, Col, Table, Radio } from 'antd';
import { Line } from '@ant-design/plots';
import api from '../../api';

const TIME_OPTIONS = [
  { label: '日', value: 'day' },
  { label: '周', value: 'week' },
  { label: '月', value: 'month' },
  { label: '年', value: 'year' },
];

const Dashboard = () => {
  const [topCustomers, setTopCustomers] = useState([] as any[]);
  const [chartData, setChartData] = useState([] as any[]);
  const [timeType, setTimeType] = useState('month');

  useEffect(() => {
    loadCustomers();
  }, []);

  useEffect(() => {
    loadChartData(timeType);
  }, [timeType]);

  const loadCustomers = async () => {
    try {
      const customersRes = await api.get('/stats/top-unpaid-customers');
      setTopCustomers(customersRes.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const loadChartData = async (type: string) => {
    try {
      const chartRes = await api.get('/stats/invoice-chart', { params: { type } });
      setChartData(chartRes.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const chartConfig = {
    data: chartData,
    xField: 'date',
    yField: 'count',
    point: { shapeField: 'circle', sizeField: 4 },
    axis: {
      y: {
        tickFilter: (datum: number) => Number.isInteger(datum),
        labelFormatter: (value: number) => String(Math.round(value)),
      },
    },
    style: { lineWidth: 2 },
  };

  const columns = [
    { title: '客户名', dataIndex: 'customerName', key: 'customerName' },
    { title: '客户地址', dataIndex: 'customerAddress', key: 'customerAddress' },
    { title: '未付款金额', dataIndex: 'unpaidAmount', key: 'unpaidAmount', render: (val: number) => val != null ? `¥${Number(val).toFixed(2)}` : '-' },
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
          <Card
            title="发票数量趋势"
            extra={<Radio.Group value={timeType} onChange={(e) => setTimeType(e.target.value)} options={TIME_OPTIONS} optionType="button" buttonStyle="solid" size="small" />}
          >
            {chartData.length > 0 ? <Line {...chartConfig} height={300} /> : <div>暂无数据</div>}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;