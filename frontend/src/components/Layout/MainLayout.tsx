import { useState } from 'react';
import { Layout, Menu, Avatar, Dropdown } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  DashboardOutlined,
  FileTextOutlined,
  DollarOutlined,
  WarningOutlined,
  SearchOutlined,
  SettingOutlined,
  UserOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { logout } from '../../api/auth';
import { useAuthStore } from '../../store/useAuthStore';
import message from 'antd/es/message';
import ProfileEditModal from '../ProfileEditModal';

const { Header, Sider, Content } = Layout;

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const { user, setUser } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { key: '/', icon: <DashboardOutlined />, label: '可视化' },
    { key: '/invoice', icon: <FileTextOutlined />, label: '出库发票' },
    { key: '/payment', icon: <DollarOutlined />, label: '货款录入' },
    { key: '/penalty', icon: <WarningOutlined />, label: '罚款录入' },
    { key: '/query', icon: <SearchOutlined />, label: '查询' },
    { key: '/admin', icon: <SettingOutlined />, label: '后台管理' },
  ];

  const handleMenuClick = (key: string) => {
    navigate(key);
  };

  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
      message.success('已退出登录');
      navigate('/login');
    } catch {
      message.error('退出失败');
    }
  };

  const userMenu = {
    items: [
      { key: 'profile', icon: <UserOutlined />, label: '编辑个人信息', onClick: () => setProfileModalVisible(true) },
      { type: 'divider' as const },
      { key: 'logout', icon: <LogoutOutlined />, label: '下线', onClick: handleLogout },
    ],
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed}>
        <div style={{ height: 32, margin: 16, background: 'rgba(255, 255, 255, 0.2)', borderRadius: 6 }} />
        <Menu
          theme="dark"
          selectedKeys={[location.pathname]}
          mode="inline"
          items={menuItems}
          onClick={({ key }) => handleMenuClick(key)}
        />
      </Sider>
      <Layout>
        <Header style={{ padding: '0 16px', background: '#fff', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
          <span style={{ marginRight: 8 }}>{user?.userName}</span>
          <Dropdown menu={userMenu}>
            <Avatar style={{ cursor: 'pointer' }} icon={<UserOutlined />} />
          </Dropdown>
        </Header>
        <Content style={{ margin: 16, padding: 24, background: '#fff', minHeight: 280, borderRadius: 8 }}>
          <Outlet />
        </Content>
      </Layout>

      <ProfileEditModal
        visible={profileModalVisible}
        onClose={() => setProfileModalVisible(false)}
      />
    </Layout>
  );
};

export default MainLayout;