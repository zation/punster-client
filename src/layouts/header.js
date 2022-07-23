import React, { useCallback } from 'react';
import { Row, Col, Button, Affix } from 'antd';
import { useNavigate } from 'umi';

import s from './header.less';

const Header = () => {
  const navigate = useNavigate();
  const onRegister = useCallback(() => {
    navigate('/register');
  }, []);
  const onLogoClick = useCallback(() => {
    navigate('/');
  }, []);

  return (
    <Affix offsetTop={0}>
      <div className={s.Root}>
        <Row className={s.Content} align="middle">
          <Col span={5} className={s.LogoContainer}>
            <div className={s.Logo} onClick={onLogoClick}>Breaking News</div>
          </Col>
          <Col span={14}>
          </Col>
          <Col span={5} className={s.ButtonContainer}>
            <Button
              type="primary"
              size="large"
              block
              onClick={onRegister}
            >
              Register / Login
            </Button>
          </Col>
        </Row>
      </div>
    </Affix>
  );
};

Header.propTypes = {};

export default Header;
