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
  readByAddress as readDuanjiByAddress,
} from '@/models/duanji';
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
import { includes, size } from 'lodash/fp';
import classNames from 'classnames';

import s from './punster.less';

export interface PunsterProps {
  punster: PunsterModel
  currentPunsterFollowings?: string[]
  showFollowInfo?: boolean
  showFunnyIndex?: boolean
  className?: string
}

export default function Punster({
  punster: {
    avatarHash,
    id,
    nickname,
    owner,
    followings,
    followers,
    funnyIndex,
  },
  className,
  currentPunsterFollowings,
  showFollowInfo = false,
  showFunnyIndex = false,
}: PunsterProps) {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const onFollow = useCallback(async () => {
    setLoading(true);
    await dispatch(follow(owner));
    await Promise.all([
      dispatch(readDuanjiByAddress(owner)),
      dispatch(readAll()),
    ]);
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
    <div className={classNames(s.Root, className)}>
      <Avatar className={s.Avatar} avatarHash={avatarHash} />
      <div className={s.Info}>
        <div>
          <Link to={`/punster/${id}`}>
            {nickname}
          </Link>
        </div>
        {showFunnyIndex && (
          <div className={s.FunnyIndex}><b>{funnyIndex}</b> Funny Index</div>
        )}
        {showFollowInfo && (
          <>
            <div className={s.FollowInfo}><b>{size(followings)}</b> Following</div>
            <div className={s.FollowInfo}><b>{size(followers)}</b> Followers</div>
          </>
        )}
      </div>
      {includes(owner)(currentPunsterFollowings) ? (
        <Button
          onClick={onUnFollow}
          loading={loading}
        >
          {!loading && 'Unfollow'}
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
