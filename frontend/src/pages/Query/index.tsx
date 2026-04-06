import { Tabs } from 'antd';
import { useSearchParams } from 'react-router-dom';
import InvoiceRecord from './InvoiceRecord';
import PaymentRecord from './PaymentRecord';
import PenaltyRecord from './PenaltyRecord';
import SaleProductRecord from './SaleProductRecord';
import Reconciliation from './Reconciliation';

const Query = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'invoice';

  const items = [
    { key: 'invoice', label: '发票记录', children: <InvoiceRecord /> },
    { key: 'payment', label: '客户汇款记录', children: <PaymentRecord /> },
    { key: 'penalty', label: '客户罚款记录', children: <PenaltyRecord /> },
    { key: 'saleProduct', label: '出库产品记录', children: <SaleProductRecord /> },
    { key: 'reconciliation', label: '客户对账记录', children: <Reconciliation /> },
  ];

  return (
    <div>
      <h1>查询</h1>
      <Tabs activeKey={activeTab} items={items} onChange={(key) => setSearchParams({ tab: key })} />
    </div>
  );
};

export default Query;