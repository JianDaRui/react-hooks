import { Layout } from 'antd';
import React, { useState, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom'
import { routes } from '@/router'
const { Content } = Layout;

const ContentComponent = () => {

	return (
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
	);
};

export default ContentComponent;