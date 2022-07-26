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
  logout,
} from '@/models/auth';
import {
  destroy,
  readMine,
  Punster,
} from '@/models/punster';
import {
  useAppDispatch,
} from '@/models/store';
import Avatar from '@/components/avatar';
import * as fcl from '@onflow/fcl'
import { isRejected } from '@reduxjs/toolkit';

import s from './header.less';

const { confirm } = Modal;

const menuItems = [{
  key: 'logout',
  label: 'Logout',
}, {
  key: 'destroy',
  label: 'Destroy',
}];

export interface HeaderProps {
  currentPunster?: Punster | null
}

export default function Header({
  currentPunster,
}: HeaderProps) {
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
              {currentPunster && (
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
            {currentPunster ? (
              <Dropdown overlay={menu}>
                <Space className={s.UserContainer}>
                  {<Avatar className={s.Avatar} avatarHash={currentPunster.avatarHash} />}
                  {currentPunster.nickname}
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
