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
  Punster as PunsterModel,
} from '@/models/punster';
import { map } from 'lodash/fp';
import {
  Col,
  Row,
  Affix,
} from 'antd';
import Punster from '@/components/punster';
import { selectEntities } from '@/models/auth';
import Header from './header';
import Footer from './footer';
import s from './index.less';
import './global.less';

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
      <Header currentPunster={currentPunster} punsters={punsters} />
      <Row className={s.ContentContainer}>
        <Col sm={5} xs={0}>
          <Affix offsetTop={80}>
            <div className={s.Punsters}>
              {map<PunsterModel, ReactNode>((punster) => (
                <Punster
                  className={s.Punster}
                  punster={punster}
                  key={punster.id}
                  currentPunsterFollowings={currentPunster?.followings}
                />
              ))(punsters)}
            </div>
          </Affix>
        </Col>
        <Col sm={14} xs={24}>
          <div className={s.Content}>
            <Outlet />
          </div>
        </Col>
      </Row>
      <Footer />
    </div>
  );
}
