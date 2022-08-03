import React, {
  ReactNode,
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
  Drawer,
  Divider,
  Form,
  Input,
} from 'antd';
import { useNavigate } from 'umi';
import {
  logout,
} from '@/models/auth';
import {
  destroy,
  readMine,
  createStarPort,
  transfer,
  Punster as PunsterModel,
} from '@/models/punster';
import {
  useAppDispatch,
} from '@/models/store';
import Avatar from '@/components/avatar';
import Punster from '@/components/punster';
import * as fcl from '@onflow/fcl'
import { isRejected } from '@reduxjs/toolkit';
import { MenuOutlined } from '@ant-design/icons';
import {
  map,
  size,
  split,
} from 'lodash/fp';

import s from './header.less';

const { confirm } = Modal;
const { Item, useForm } = Form;

const menuItems = [{
  key: 'createStarPort',
  label: 'Create Star Port',
}, {
  key: 'myDuanji',
  label: 'My Duanji',
}, {
  key: 'logout',
  label: 'Logout',
}, {
  key: 'transfer',
  label: 'Transfer Punster'
}, {
  key: 'destroy',
  label: 'Destroy',
}];

export interface HeaderProps {
  currentPunster?: PunsterModel | null
  punsters: PunsterModel[]
}

export default function Header({
  currentPunster,
  punsters,
}: HeaderProps) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [form] = useForm<{ toAddress: string }>();

  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [transferModelVisible, setTransferModelVisible] = useState(false);

  const toggleDrawer = useCallback(() => {
    setVisible((value) => !value);
  }, []);
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

  const onLogout = useCallback(() => {
    fcl.unauthenticate();
    dispatch(logout());
  }, [dispatch]);

  const onDestroy = useCallback(() => {
    confirm({
      title: 'Do you want to destroy your punster? It can\'t revert.',
      onOk: () => dispatch(destroy()),
    })
  }, [dispatch]);

  const onGoToMyDuanji = () => {
    if (currentPunster) {
      navigate(`/punster/${currentPunster.id}`);
    }
  };
  const onGoToMyDuanjiCallback = useCallback(onGoToMyDuanji, [navigate, currentPunster && currentPunster.id]);

  const onCreateStarPort = async () => {
    try {
      await dispatch(createStarPort()).unwrap();
      message.success('Create star port success');
    } catch (e: any) {
      let errorMessage = split('panic: ')(e.message)[1];
      errorMessage = split('\n')(errorMessage)[0];
      message.error(errorMessage);
    }
  };
  const onCreateStarPortCallback = useCallback(onCreateStarPort, [dispatch]);

  const onTransfer = useCallback(async () => {
    const { toAddress } = await form.validateFields();
    await dispatch(transfer({ id: currentPunster!.id, toAddress: toAddress }));
    form.resetFields();
    setTransferModelVisible(false);
    message.success('Transfer punster success');
  }, [form, setTransferModelVisible, dispatch, currentPunster && currentPunster.id]);

  const menu = useMemo(() => (
    <Menu
      items={menuItems}
      onClick={async ({ key }) => {
        if (key === 'createStarPort') {
          await onCreateStarPort()
        } else if (key === 'myDuanji') {
          onGoToMyDuanji()
        } else if (key === 'logout') {
          fcl.unauthenticate();
          dispatch(logout());
        } else if (key === 'transfer') {
          setTransferModelVisible(true);
        } else if (key === 'destroy') {
          confirm({
            title: 'Do you want to destroy your punster? It can\'t revert.',
            onOk: () => dispatch(destroy()),
          })
          ;
        }
      }}
    />
  ), [dispatch, currentPunster && currentPunster.id]);

  return (
    <Affix offsetTop={0}>
      <div className={s.Root}>
        <Row className={s.Content} align="middle">
          <Col sm={5} xs={24}>
            <div className={s.LogoContainer}>
              <div className={s.Logo} onClick={onLogoClick}>PunStar</div>
              <Button className={s.MenuTrigger} icon={<MenuOutlined />} onClick={toggleDrawer} />
              <Drawer
                title="Menu"
                visible={visible}
                onClose={toggleDrawer}
                width={240}
              >
                <h3>Punsters</h3>
                {map<PunsterModel, ReactNode>((punster) => (
                  <Punster
                    punster={punster}
                    key={punster.id}
                    currentPunsterFollowings={currentPunster?.followings}
                  />
                ))(punsters)}
                <Divider />
                {currentPunster ? (
                  <>
                    <h3>Account Info</h3>
                    {<Avatar className={s.Avatar} avatarHash={currentPunster.avatarHash} />}
                    {currentPunster.nickname}
                    <div style={{ marginTop: 4 }}>
                      <b>{size(currentPunster.followings)}</b> Following <b>{size(currentPunster.followers)}</b> Followers
                    </div>
                    <Button
                      style={{ margin: '8px 0' }}
                      onClick={onGoToMyDuanjiCallback}
                      block
                      size="large"
                    >
                      My Duanji
                    </Button>
                    <Button
                      style={{ margin: '8px 0' }}
                      onClick={onCreateStarPortCallback}
                      block
                      size="large"
                    >
                      Create Star Port
                    </Button>
                    <Button
                      style={{ margin: '8px 0' }}
                      onClick={onLogout}
                      block
                      size="large"
                    >
                      Logout
                    </Button>
                    <Button
                      style={{ margin: '8px 0' }}
                      onClick={() => setTransferModelVisible(true)}
                      block
                      size="large"
                    >
                      Transfer Punster
                    </Button>
                    <Button
                      onClick={onDestroy}
                      block
                    >
                      Destroy
                    </Button>
                  </>
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
              </Drawer>
            </div>
          </Col>
          <Col sm={14} xs={0}>
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
          <Col sm={5} xs={0}>
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

        {currentPunster && (
          <Modal
            title={`Transform Punster ${currentPunster.nickname}`}
            visible={transferModelVisible}
            onCancel={() => setTransferModelVisible(false)}
            onOk={onTransfer}
          >
            <Form form={form}>
              <Item label="To Address" name="toAddress" rules={[{ required: true }]}>
                <Input />
              </Item>
            </Form>
          </Modal>
        )}
      </div>
    </Affix>
  );
};
