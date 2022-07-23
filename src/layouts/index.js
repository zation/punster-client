import { useCallback, useState } from 'react';
import { Link, Outlet } from 'umi';
import { Button, Form, Input } from 'antd';
import { useDispatch } from 'react-redux';
import Uploader from 'components/uploader';
import { flow, first, prop } from 'lodash/fp';
import { register } from '../models/punster';
import { destroy } from '../services/punster';
import styles from './index.less';
import './global.less';

const { Item } = Form;

export default function Layout() {
  const [submitting, setSubmitting] = useState(false)
  const dispatch = useDispatch();
  const onSubmit = useCallback(async ({ nickname, avatar }) => {
    setSubmitting(true)
    try {
      const result = await dispatch(register({
        nickname,
        avatarHash: flow(
          prop('fileList'),
          first,
          prop('response.Hash'),
        )(avatar),
      }));
      console.log('in submit', result);
    } catch (e) {
      console.error(e);
    }
    setSubmitting(false)
  }, [])
  const onDestroy = useCallback(async () => {
    const result = await destroy()
    console.log(result)
  }, [])

  return (
    <div className={styles.navs}>
      <Form onFinish={onSubmit}>
        <Item label="昵称" name="nickname">
          <Input />
        </Item>
        <Item label="头像" name="avatar">
          <Uploader maxCount={1} />
        </Item>
        <Item>
          <Button htmlType="submit" loading={submitting}>Submit</Button>
        </Item>
      </Form>
      <ul>
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/docs">Docs</Link>
        </li>
        <li><Button onClick={onDestroy}>Destroy</Button></li>
        <li>
          <a href="https://github.com/umijs/umi">Github</a>
        </li>
      </ul>
      <Outlet />
    </div>
  );
}
