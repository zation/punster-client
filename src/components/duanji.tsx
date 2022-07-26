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
} from 'antd';
import classNames from 'classnames';
import parseISO from 'date-fns/fp/parseISO';
import isValid from 'date-fns/fp/isValid';
import format from 'date-fns/fp/format';
import {
  upVote,
  cancelUpVote,
  Duanji as DuanjiModel,
} from '@/models/duanji';
// import {
//   follow,
//   unFollow,
// } from '@/models/punster';
import Image from './ipfs-image';
import { useAppDispatch } from '@/models/store';

import s from './duanji.less';

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
  currentPunsterAddress?: string | null
  ownerNickname: string
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
  },
  ownerNickname,
  currentPunsterAddress,
}: DuanjiProps) {
  const dispatch = useAppDispatch();
  const isUpVoted = includes(currentPunsterAddress)(commends);
  const [isVoting, setIsVoting] = useState(false);

  const onUpVote = useCallback(async () => {
    if (!currentPunsterAddress) {
      message.error('Please login or register');
    }
    setIsVoting(true);
    await dispatch(upVote({ id, owner }));
    setIsVoting(false);
  }, [owner, id, setIsVoting, dispatch, currentPunsterAddress]);

  const onCancelUpVote = useCallback(async () => {
    if (!currentPunsterAddress) {
      message.error('Please login or register');
    }
    setIsVoting(true);
    await dispatch(cancelUpVote({ id, owner }));
    setIsVoting(false);
  }, [owner, id, setIsVoting, dispatch, currentPunsterAddress]);

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
          <span className={s.Address}>{ownerNickname}</span>
          <span className={s.lighten}>Created</span>: {time()(createdAt)}
        </div>
        <div className={s.Title}>{title}</div>
        <div className={s.Content}>{content}</div>
        <div className={s.Images}>
          {map<string, ReactNode>((hash) => (
            <Image key={hash} className={s.Image} hash={hash} />
          ))(imageHashes)}
        </div>
      </div>
    </div>
  );
};
