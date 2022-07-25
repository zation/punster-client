import { Outlet } from 'umi';
import Header from './header';
import Footer from './footer';
import s from './index.less';
import './global.less';
import {
  Col,
  Row,
} from 'antd';
import React from 'react';

export default function Layout() {
  return (
    <div>
      <Header />
      <Row className={s.Content} align="middle">
        <Col span={14} offset={5}>
          <Outlet />
        </Col>
      </Row>
      <Footer />
    </div>
  );
}
