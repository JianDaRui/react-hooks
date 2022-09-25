import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UploadOutlined,
  UserOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons';
import { Layout, Menu } from 'antd';
import React, { useState, Suspense } from 'react';
import { Navigate, Route, Routes, Link, useNavigate } from 'react-router-dom'
import { routes } from '@/router'
import ReactLogo from '@/assets/react.svg'
const { Header, Sider, Content } = Layout;

const LayoutComponent = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState(['/use-state'])
  const navigate = useNavigate()

  const menuItems = [
    {
      key: '/use-state',
      icon: <UserOutlined />,
      label: 'useState',
      onClick: () => navigate('/use-state')
    },
    {
      key: '/use-effect',
      icon: <VideoCameraOutlined />,
      label: 'useEffect',
      onClick: () => navigate('/use-effect')
    },
    {
      key: '/use-context',
      icon: <UploadOutlined />,
      label: 'useContext',
      onClick: () => navigate('/use-context')
    },
  ]

  return (
    <Layout style={{ height: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <div style={{
          height: '64px',
          textAlign: 'center',
          lineHeight: '64px',
          color: '#fff',
          fontWeight: 700
        }} className="logo">
          <img src={ReactLogo} alt="Logo" /> React Hooks
        </div>
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={['/use-state']}
          selectedKeys={selectedKeys}
          items={menuItems}
          onClick={({ key }) => setSelectedKeys([key])}
        />
      </Sider>
      <Layout>
        <Header style={{ color: '#fff' }}>
          {React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
            className: 'trigger',
            onClick: () => setCollapsed(!collapsed),
          })}
        </Header>
        <Content className="site-layout-background"
          style={{
            margin: 16,
            padding: 16,
            minHeight: 280,
            borderRadius: 5,
            boxShadow: '0 0 12px 0 rgba(0, 0, 0, 0.2)',
            backgroundColor: '#fff'
          }}>
          <Suspense>
            <Routes>
              <Route path='/' element={<Navigate to='/use-state' />}/>
              {
                routes.map(router => {
                  const { path, component: Component } = router
                  return (
                    <Route key={path} path={path} element={<Component />} />
                  )
                })
              }
            </Routes>
          </Suspense>
          
        </Content>
      </Layout>
    </Layout>
  );
};

export default LayoutComponent;