import React, { ReactNode } from 'react';
import {
  Outlet,
  Link,
} from 'umi';
import {
  useAppSelector,
  RootState,
} from '@/models/store';
import { selectors } from '@/models/punster';
import { Punster } from '@/services/punster';
import { map } from 'lodash/fp';
import {
  Col,
  Row,
  Affix,
} from 'antd';
import Avatar from '@/components/avatar';
import Header from './header';
import Footer from './footer';
import s from './index.less';
import './global.less';

const selector = (state: RootState) => ({
  punsters: selectors.selectAll(state),
});

export default function Layout() {
  const { punsters } = useAppSelector(selector);

  return (
    <div>
      <Header />
      <Row className={s.ContentContainer}>
        <Col span={5}>
          <Affix offsetTop={80}>
            <div className={s.Punsters}>
              {map<Punster, ReactNode>(({ nickname, id, avatarHash }) => (
                <div className={s.Punter} key={id}>
                  <Avatar className={s.Avatar} avatarHash={avatarHash} />
                  <Link className={s.Punter} key={id} to={`/punster/${id}`}>
                    {nickname}
                  </Link>
                </div>
              ))(punsters)}
            </div>
          </Affix>
        </Col>
        <Col span={14}>
          <div className={s.Content}>
            <Outlet />
          </div>
        </Col>
      </Row>
      <Footer />
    </div>
  );
}
