import { useState } from 'react';
import { Card, Row, Col, Select, DatePicker, Button, Table, message } from 'antd';
import dayjs from 'dayjs';
import api from '../../api';

const Reconciliation = () => {
  const [customerId, setCustomerId] = useState<number | undefined>();
  const [dateRange, setDateRange] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);

  const loadData = async () => {
    if (!customerId) { message.warning('请选择客户'); return; }
    setLoading(true);
    try {
      const params: any = { customerId };
      if (dateRange[0]) params.startDate = dateRange[0].format('YYYY-MM-DD');
      if (dateRange[1]) params.endDate = dateRange[1].format('YYYY-MM-DD');
      const res = await api.get('/query/reconciliation', { params });
      setData(res.data);
    } catch (error: any) { message.error(error.message || '加载失败'); }
    finally { setLoading(false); }
  };

  const formatTime = (v: string) => v ? dayjs(v).format('YYYY-MM-DD HH:mm') : '-';
  const invoiceCols = [{ title: '发票ID', dataIndex: 'invoiceId' }, { title: '发票金额', dataIndex: 'invoiceMoney', render: (v: number) => `¥${v?.toFixed(2)}` }, { title: '运费', dataIndex: 'shippingFee' }, { title: '总金额', dataIndex: 'totalMoney', render: (v: number) => `¥${v?.toFixed(2)}` }, { title: '开票时间', dataIndex: 'invoiceTime', render: formatTime }];
  const paymentCols = [{ title: '付款金额', dataIndex: 'payment', render: (v: number) => `¥${v?.toFixed(2)}` }, { title: '付款时间', dataIndex: 'paymentTime', render: formatTime }, { title: '备注', dataIndex: 'comment' }];
  const penaltyCols = [{ title: '罚款金额', dataIndex: 'penalty', render: (v: number) => `¥${v?.toFixed(2)}` }, { title: '罚款时间', dataIndex: 'penaltyTime', render: formatTime }, { title: '备注', dataIndex: 'comment' }];

  return (
    <div>
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col>客户:</Col>
          <Col><Select style={{width: 200}} placeholder="选择客户" onChange={setCustomerId} /></Col>
          <Col>日期范围:</Col>
          <Col><DatePicker.RangePicker onChange={(dates) => setDateRange(dates || [])} /></Col>
          <Col><Button type="primary" onClick={loadData} loading={loading}>查询</Button></Col>
        </Row>
      </Card>
      {data && (
        <Row gutter={16}>
          <Col span={8}><Card title="发票合计">¥{data.invoiceTotalMoney?.toFixed(2) || '0.00'}</Card></Col>
          <Col span={8}><Card title="汇款合计">¥{data.paymentTotalMoney?.toFixed(2) || '0.00'}</Card></Col>
          <Col span={8}><Card title="罚款合计">¥{data.penaltyTotalMoney?.toFixed(2) || '0.00'}</Card></Col>
        </Row>
      )}
      {data && (
        <div style={{marginTop: 16}}>
          <h3>客户未付款: ¥{data.unpaidMoney?.toFixed(2) || '0.00'}</h3>
          <Row gutter={16}>
            <Col span={8}><h4>发票记录</h4><Table dataSource={data.invoices} columns={invoiceCols} rowKey="invoiceId" size="small" pagination={false} /></Col>
            <Col span={8}><h4>汇款记录</h4><Table dataSource={data.payments} columns={paymentCols} rowKey="paymentId" size="small" pagination={false} /></Col>
            <Col span={8}><h4>罚款记录</h4><Table dataSource={data.penalties} columns={penaltyCols} rowKey="penaltyId" size="small" pagination={false} /></Col>
          </Row>
        </div>
      )}
    </div>
  );
};

export default Reconciliation;