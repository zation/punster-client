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

interface Fields {
  nickname: string
  avatar: UploadChangeParam<UploadFile<string>>
}

export default function Register() {
  const [submitting, setSubmitting] = useState(false)
  const dispatch = useAppDispatch();
  const onSubmit = useCallback(async ({ nickname, avatar }: Fields) => {
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
    <Form<Fields> onFinish={onSubmit}>
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
  );
};
