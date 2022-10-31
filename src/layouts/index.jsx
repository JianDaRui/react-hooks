import { Layout } from 'antd';
import React from 'react';
import Header from './header'
import Sider from './sider'
import Content from './content'

const LayoutComponent = () => {

  return (
    <Layout className='layout-main' style={{ height: '100vh' }}>
      <Sider />
      <Layout>
        <Header/>
        <Content  />
      </Layout>
    </Layout>
  );
};

export default LayoutComponent;