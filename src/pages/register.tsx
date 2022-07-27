import {
  Button,
  Form,
  Input,
  message,
} from 'antd';
import Uploader from '@/components/uploader';
import {
  useCallback,
  useState,
} from 'react';
import {
  UploadChangeParam,
  UploadFile,
} from 'antd/lib/upload/interface';
import { useAppDispatch } from '@/models/store';
import { register } from '@/models/punster';
import {
  first,
  flow,
  prop,
} from 'lodash/fp';
import { useNavigate } from 'umi';

const { Item } = Form;

interface Values {
  nickname: string
  avatar: UploadChangeParam<UploadFile<string>>
}

export default function Register() {
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const onSubmit = useCallback(async ({ nickname, avatar }: Values) => {
    setSubmitting(true)
    try {
      await dispatch(register({
        nickname,
        avatarHash: flow(
          prop('fileList'),
          first,
          prop('response.Hash'),
        )(avatar),
      }));
    } catch (e) {
      console.error(e);
    }
    setSubmitting(false);
    message.success('Register success.');
    navigate('/');
  }, [setSubmitting, navigate, dispatch]);

  return (
    <Form<Values>
      onFinish={onSubmit}
      labelCol={{ span: 4 }}
      wrapperCol={{ span: 14 }}
    >
      <h3>Register New Punster</h3>
      <Item label="Nickname" name="nickname" rules={[{ required: true }]}>
        <Input />
      </Item>
      <Item label="Avatar" name="avatar" rules={[{ required: true }]}>
        <Uploader maxCount={1} />
      </Item>
      <Item wrapperCol={{ offset: 4, span: 8 }}>
        <Button htmlType="submit" type="primary" block loading={submitting}>Submit</Button>
      </Item>
    </Form>
  );
};
