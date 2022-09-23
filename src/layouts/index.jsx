import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UploadOutlined,
  UserOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons';
import { Layout, Menu } from 'antd';
import React, { useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom'
import { routes } from '@/router'
const { Header, Sider, Content } = Layout;

const LayoutComponent = () => {
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    {
      key: '/use-state',
      icon: <UserOutlined />,
      label: 'useState',
    },
    {
      key: '/use-effect',
      icon: <VideoCameraOutlined />,
      label: 'useEffect',
    },
    {
      key: '/use-context',
      icon: <UploadOutlined />,
      label: 'useContext',
    },
  ]

  return (
    <Layout>
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <div className="logo" />
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={['/use-state']}
          items={menuItems}
        />
      </Sider>
      <Layout>
        <Header>
          {React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
            className: 'trigger',
            onClick: () => setCollapsed(!collapsed),
          })}
        </Header>
        <Content>
          <Routes>
            {
              routes.map(router => {
                const { path, component } = router
                return (
                  <Route
                    key={path}
                    path={path}
                    element={component}
                  >
                  </Route>
                )
              })
            }
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
};

export default LayoutComponent;