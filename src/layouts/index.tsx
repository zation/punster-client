import React, {
  ReactNode,
} from 'react';
import {
  Outlet,
} from 'umi';
import {
  useAppSelector,
  RootState,
} from '@/models/store';
import {
  selectors,
  selectors as punsterSelectors,
} from '@/models/punster';
import { Punster as PunsterModel } from '@/services/punster';
import { map } from 'lodash/fp';
import {
  Col,
  Row,
  Affix,
} from 'antd';
import Header from './header';
import Footer from './footer';
import Punster from './punster';
import s from './index.less';
import './global.less';
import { selectEntities } from '@/models/auth';

const selector = (state: RootState) => {
  const { punsterId } = selectEntities(state);
  return {
    punsters: selectors.selectAll(state),
    currentPunster: punsterId ? punsterSelectors.selectById(state, punsterId) : null,
  };
};

export default function Layout() {
  const {
    punsters,
    currentPunster,
  } = useAppSelector(selector);

  return (
    <div>
      <Header currentPunster={currentPunster} />
      <Row className={s.ContentContainer}>
        <Col span={5}>
          <Affix offsetTop={80}>
            <div className={s.Punsters}>
              {map<PunsterModel, ReactNode>((punster) => (
                <Punster
                  punster={punster}
                  key={punster.id}
                  followings={currentPunster?.followings}
                />
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
