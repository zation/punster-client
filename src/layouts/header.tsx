import React, {
  useCallback,
  useMemo,
  useState,
} from 'react';
import {
  Row,
  Col,
  Button,
  Affix,
  Dropdown,
  Menu,
  Modal,
  Space,
  message,
} from 'antd';
import { useNavigate } from 'umi';
import {
  selectEntities,
  logout,
} from '@/models/auth';
import {
  selectors as punsterSelectors,
  destroy,
  readMine,
} from '@/models/punster';
import {
  RootState,
  useAppDispatch,
} from '@/models/store';
import Image from '@/components/ipfs-image';
import * as fcl from '@onflow/fcl'
import { useSelector } from 'react-redux';
import { isRejected } from '@reduxjs/toolkit';

import s from './header.less';

const { confirm } = Modal;

const selector = (state: RootState) => {
  const { isLogin, punsterId } = selectEntities(state);
  return {
    isLogin,
    punster: punsterId ? punsterSelectors.selectById(state, punsterId) : null,
  };
};

const menuItems = [{
  key: 'logout',
  label: 'Logout',
}, {
  key: 'destroy',
  label: 'Destroy',
}];

export default function Header() {
  const {
    isLogin,
    punster,
  } = useSelector(selector);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [loading, setLoading] = useState(false);

  const onLogoClick = useCallback(() => {
    navigate('/');
  }, [navigate]);
  const onLoginOrRegister = useCallback(async () => {
    setLoading(true);
    await fcl.authenticate();
    const action = await dispatch(readMine());
    if (isRejected(action)) {
      navigate('/register');
    } else {
      message.success('Login success.');
    }
    setLoading(false);
  }, [navigate, setLoading]);
  const onCreate = useCallback(() => {
    navigate('/create');
  }, [navigate]);

  const menu = useMemo(() => (
    <Menu
      items={menuItems}
      onClick={async ({ key }) => {
        if (key === 'logout') {
          fcl.unauthenticate();
          dispatch(logout());
        } else if (key === 'destroy') {
          confirm({
            title: 'Do you want to destroy your punster? It can\'t revert.',
            onOk: () => dispatch(destroy()),
          })
          ;
        }
      }}
    />
  ), [dispatch]);

  return (
    <Affix offsetTop={0}>
      <div className={s.Root}>
        <Row className={s.Content} align="middle">
          <Col span={5} className={s.LogoContainer}>
            <div className={s.Logo} onClick={onLogoClick}>Punster</div>
          </Col>
          <Col span={14}>
            <div className={s.ButtonContainer}>
              {isLogin && (
                <Button
                  type="primary"
                  size="large"
                  onClick={onCreate}
                >
                  Create Duanji
                </Button>
              )}
            </div>
          </Col>
          <Col span={5}>
            {isLogin ? (
              <Dropdown overlay={menu}>
                <Space className={s.UserContainer}>
                  {punster?.avatarHash && <Image className={s.Avatar} hash={punster.avatarHash} />}
                  {punster?.nickname}
                </Space>
              </Dropdown>
            ) : (
              <Button
                type="primary"
                size="large"
                loading={loading}
                onClick={onLoginOrRegister}
              >
                Login / Register
              </Button>
            )}
          </Col>
        </Row>
      </div>
    </Affix>
  );
};
