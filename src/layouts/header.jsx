import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
  } from '@ant-design/icons';
import { Layout } from 'antd';
import React, { useState } from 'react';
const { Header } = Layout;

const LayoutComponent = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
      <Header style={{ color: '#fff' }} className='layout-header'>
      {React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
        className: 'trigger',
        onClick: () => setCollapsed(!collapsed),
      })}
    </Header>
  );
};

export default LayoutComponent;