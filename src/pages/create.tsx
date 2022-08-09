import {
  Button,
  Form,
  Input,
  message,
  Switch,
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
import { create } from '@/models/duanji';
import {
  flow,
  map,
  prop,
  split,
} from 'lodash/fp';
import { useNavigate } from 'umi';
import { ipfsDomain } from '@/services/ipfs';

const { Item } = Form;
const { TextArea } = Input;

interface Values {
  title: string
  content: string
  images: UploadChangeParam<UploadFile<string>>
  isAdvertisement: boolean
}

export default function Create() {
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const onSubmit = useCallback(async ({ title, content, images, isAdvertisement }: Values) => {
    setSubmitting(true)
    try {
      const imageHashes = flow(
        prop('fileList'),
        map(prop('response.Hash')),
      )(images);
      await dispatch(create({
        name: title,
        description: content,
        title,
        content,
        imageHashes,
        image: `${ipfsDomain}:8080/ipfs/${imageHashes[0]}`,
        createdAt: new Date().toISOString(),
        isAdvertisement,
      })).unwrap();
      message.success('Create success.');
      navigate('/');
    } catch (e: any) {
      let errorMessage = split('panic: ')(e.message)[1];
      errorMessage = split('\n')(errorMessage)[0];
      message.error(errorMessage);
    }
    setSubmitting(false);
  }, [setSubmitting, navigate, dispatch]);

  return (
    <Form<Values>
      onFinish={onSubmit}
      labelCol={{ span: 4 }}
      wrapperCol={{ span: 14 }}
    >
      <h3>Create Duanji</h3>
      <Item label="Title" name="title" rules={[{ required: true }]}>
        <Input />
      </Item>
      <Item label="Images" name="images" rules={[{ required: true }]}>
        <Uploader maxCount={3} />
      </Item>
      <Item label="Content" name="content" rules={[{ required: true }]}>
        <TextArea />
      </Item>
      <Item label="Is AD" name="isAdvertisement" valuePropName="checked">
        <Switch />
      </Item>
      <Item wrapperCol={{ offset: 4, span: 8 }}>
        <Button htmlType="submit" type="primary" block loading={submitting}>Submit</Button>
      </Item>
    </Form>
  );
};
