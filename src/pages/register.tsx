import {
  Button,
  Form,
  Input,
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

const { Item } = Form;

interface Values {
  nickname: string
  avatar: UploadChangeParam<UploadFile<string>>
}

export default function Register() {
  const [submitting, setSubmitting] = useState(false)
  const dispatch = useAppDispatch();
  const onSubmit = useCallback(async ({ nickname, avatar }: Values) => {
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

  return (
    <Form<Values> onFinish={onSubmit}>
      <Item label="Nickname" name="nickname" rules={[{ required: true }]}>
        <Input />
      </Item>
      <Item label="Avatar" name="avatar" rules={[{ required: true }]}>
        <Uploader maxCount={1} />
      </Item>
      <Item>
        <Button htmlType="submit" loading={submitting}>Submit</Button>
      </Item>
    </Form>
  );
};
