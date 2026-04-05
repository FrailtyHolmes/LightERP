import { Tabs } from 'antd';
import UserAdmin from './User';
import CustomerAdmin from './Customer';
import ProductAdmin from './Product';
import PriceAdmin from './Price';

const Admin = () => {
  const items = [
    { key: 'user', label: '用户管理', children: <UserAdmin /> },
    { key: 'customer', label: '客户管理', children: <CustomerAdmin /> },
    { key: 'product', label: '产品管理', children: <ProductAdmin /> },
    { key: 'price', label: '单价管理', children: <PriceAdmin /> },
  ];

  return (
    <div>
      <h1>后台管理</h1>
      <Tabs items={items} />
    </div>
  );
};

export default Admin;