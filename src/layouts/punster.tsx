import React, {
  useCallback,
  useState,
} from 'react';
import Avatar from '@/components/avatar';
import { Link } from 'umi';
import {
  useAppDispatch,
} from '@/models/store';
import {
  follow,
  unFollow,
  readAll,
  Punster as PunsterModel,
} from '@/models/punster';
import {
  Button,
  message,
} from 'antd';
import { includes } from 'lodash/fp';

import s from './punster.less';

export interface PunsterProps {
  punster: PunsterModel
  followings?: string[]
}

export default function Punster({
  punster: {
    avatarHash,
    id,
    nickname,
    owner,
  },
  followings,
}: PunsterProps) {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const onFollow = useCallback(async () => {
    setLoading(true);
    await dispatch(follow(owner));
    await dispatch(readAll());
    message.success('Follow success.');
    setLoading(false);
  }, [owner]);
  const onUnFollow = useCallback(async () => {
    setLoading(true);
    await dispatch(unFollow(owner));
    await dispatch(readAll());
    message.success('UnFollow success.');
    setLoading(false);
  }, [owner]);

  return (
    <div className={s.Root}>
      <Avatar className={s.Avatar} avatarHash={avatarHash} />
      <Link className={s.Link} to={`/punster/${id}`}>
        {nickname}
      </Link>
      {includes(owner)(followings) ? (
        <Button
          onClick={onUnFollow}
          loading={loading}
        >
          {!loading && 'unFollow'}
        </Button>
      ) : (
        <Button
          onClick={onFollow}
          type="primary"
          loading={loading}
        >
          {!loading && 'Follow'}
        </Button>
      )}
    </div>
  );
}
