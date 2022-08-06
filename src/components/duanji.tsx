import React, {
  ReactNode,
  useCallback,
  useState,
} from 'react';
import {
  SmileOutlined,
  MehOutlined,
} from '@ant-design/icons';
import {
  map,
  includes,
} from 'lodash/fp';
import {
  message,
  Spin,
  Dropdown,
  Tag,
  Modal,
  Form,
  Input,
  Button,
} from 'antd';
import classNames from 'classnames';
import parseISO from 'date-fns/fp/parseISO';
import isValid from 'date-fns/fp/isValid';
import format from 'date-fns/fp/format';
import {
  upVote,
  cancelUpVote,
  Duanji as DuanjiModel,
  transfer,
} from '@/models/duanji';
import { Punster as PunsterModel } from '@/models/punster';
import { useAppDispatch } from '@/models/store';
import Punster from './punster';
import Image from './ipfs-image';

import s from './duanji.less';

const { Item, useForm } = Form;

const time = ({
  formatter = 'yyyy-MM-dd HH:mm:ss',
  defaultDisplay = '--',
  parse = parseISO,
} = {}) => (value: number | Date | string): string => {
  try {
    const dateValue = typeof value === 'string' ? parse(value) : value;
    if (isValid(dateValue)) {
      return format(formatter)(dateValue);
    }
    return defaultDisplay;
  } catch (e) {
    console.warn(e);
    return defaultDisplay;
  }
};

export interface DuanjiProps {
  duanji: DuanjiModel
  currentPunster?: PunsterModel
  punster: PunsterModel
}

export default function Duanji({
  duanji: {
    id,
    title,
    content,
    imageHashes,
    commends,
    owner,
    funnyIndex,
    createdAt,
    isAD,
  },
  punster,
  currentPunster,
}: DuanjiProps) {
  const dispatch = useAppDispatch();
  const isUpVoted = includes(currentPunster?.owner)(commends);
  const [isVoting, setIsVoting] = useState(false);
  const [transferModelVisible, setTransferModelVisible] = useState(false);
  const [form] = useForm<{ toAddress: string }>();

  const onUpVote = useCallback(async () => {
    if (!currentPunster) {
      message.error('Please login or register');
    }
    setIsVoting(true);
    await dispatch(upVote({ id, owner }));
    setIsVoting(false);
  }, [owner, id, setIsVoting, dispatch, currentPunster]);

  const onCancelUpVote = useCallback(async () => {
    if (!currentPunster) {
      message.error('Please login or register');
    }
    setIsVoting(true);
    await dispatch(cancelUpVote({ id, owner }));
    setIsVoting(false);
  }, [owner, id, setIsVoting, dispatch, currentPunster]);

  const toggleTransformModel = useCallback(async () => {
    setTransferModelVisible((visible) => !visible);
  }, [setTransferModelVisible]);

  const onTransfer = useCallback(async () => {
    const { toAddress } = await form.validateFields();
    await dispatch(transfer({ id, toAddress: toAddress }));
    form.resetFields();
    setTransferModelVisible(false);
    message.success('Transfer duanji success');
  }, [form, setTransferModelVisible, dispatch, id]);

  return (
    <div className={s.Root}>
      <div className={s.Numbers}>
        <Spin spinning={isVoting}>
          <div onClick={isUpVoted ? onCancelUpVote : onUpVote}>
            {isUpVoted ? (
              <SmileOutlined className={classNames(s.FunnyIndex, s.hot)} />
            ) : (
              <MehOutlined className={s.FunnyIndex} />
            )}
          </div>
        </Spin>
        <div className={s.Number} style={{ marginBottom: 20 }}>{funnyIndex}</div>
      </div>

      <div className={s.Main}>
        <div>
          {punster && (
            <span className={s.PunsterContainer}>
              <Dropdown
                overlay={(
                  <Punster
                    className={s.Punster}
                    punster={punster}
                    currentPunsterFollowings={currentPunster?.followings}
                    showFollowInfo
                    showFunnyIndex
                  />
                )}>
              <span className={s.Nickname}>{punster.nickname}</span>
              </Dropdown>
            </span>
          )}
          <span className={s.lighten}>Created</span>: {time()(createdAt)}
          {currentPunster && currentPunster.owner === owner && !isAD && (
            <Button className={s.Transfer} onClick={toggleTransformModel}>Transfer</Button>
          )}
        </div>
        <div className={s.Title}>
          {isAD && <Tag color="green">AD</Tag>}
          {title}
        </div>
        <div className={s.Content}>{content}</div>
        <div className={s.Images}>
          {map<string, ReactNode>((hash) => (
            <Image key={hash} className={s.Image} hash={hash} />
          ))(imageHashes)}
        </div>
      </div>

      <Modal
        title={`Transform Duanji ${title}`}
        visible={transferModelVisible}
        onCancel={toggleTransformModel}
        onOk={onTransfer}
      >
        <Form form={form}>
          <Item label="To Address" name="toAddress" rules={[{ required: true }]}>
            <Input />
          </Item>
        </Form>
      </Modal>
    </div>
  );
};
