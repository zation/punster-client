import React, { useCallback } from 'react';
import { Row, Col, Button, Affix } from 'antd';
import { useNavigate } from 'umi';
import { selectEntities } from '@/models/auth';
import { selectors as punsterSelectors } from '@/models/punster';
import {
  RootState,
} from '@/models/store';

import s from './header.less';
import { useSelector } from 'react-redux';

const selector = (state: RootState) => {
  const { isLogin, punsterId } = selectEntities(state);
  return {
    isLogin,
    punster: punsterId ? punsterSelectors.selectById(state, punsterId) : null,
  };
};

export default function Header() {
  const {
    isLogin,
    punster,
  } = useSelector(selector);
  const navigate = useNavigate();
  const onLogoClick = useCallback(() => {
    navigate('/');
  }, []);
  const onRegister = useCallback(() => {
    navigate('/register');
  }, []);
  const onCreate = useCallback(() => {
    navigate('/create');
  }, []);

  return (
    <Affix offsetTop={0}>
      <div className={s.Root}>
        <Row className={s.Content} align="middle">
          <Col span={5} className={s.LogoContainer}>
            <div className={s.Logo} onClick={onLogoClick}>Punster</div>
          </Col>
          <Col span={14}>
            {punster?.nickname}
          </Col>
          <Col span={5} className={s.ButtonContainer}>
            <Button
              type="primary"
              size="large"
              block
              onClick={isLogin ? onCreate : onRegister}
            >
              {isLogin ? 'Create Duanji' : 'Register / Login'}
            </Button>
          </Col>
        </Row>
      </div>
    </Affix>
  );
};
