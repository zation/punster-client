import { ReactNode } from 'react';
import Duanji from '@/components/duanji';
import { Duanji as DuanjiModel, getDuanjisSelector} from '@/models/duanji';
import { selectEntities } from '@/models/auth';
import { selectors as punsterSelectors, Punster as PunsterModel } from '@/models/punster';
import Punster from '@/components/punster';
import { RootState } from '@/models/store';
import { useSelector } from 'react-redux';
import { map, flow, propEq, filter } from 'lodash/fp';
import { useParams } from 'umi';
import { Divider } from 'antd';

import s from './$id.less';

interface DuanjiDisplay extends DuanjiModel {
  punster: PunsterModel
}

const selector = (id?: string) => (state: RootState) => {
  const { punsterId } = selectEntities(state);

  return {
    currentPunster: punsterId ? punsterSelectors.selectById(state, punsterId) : undefined,
    punster: id ? punsterSelectors.selectById(state, id) : undefined,
    duanjis: flow(
      getDuanjisSelector,
      filter(propEq('punster.id', id)),
    )(state),
  };
}

export default function HomePage() {
  const { id } = useParams();
  const {
    duanjis,
    currentPunster,
    punster,
  } = useSelector(selector(id));

  return (
    <div>
      {punster && (
        <Punster
          className={s.Punster}
          punster={punster}
          showFollowInfo
          showFunnyIndex
          currentPunsterFollowings={currentPunster?.followings}
        />
      )}
      <Divider />
      {map<DuanjiDisplay, ReactNode>(({ punster, ...duanji }) => (
        <Duanji
          key={duanji.id}
          duanji={duanji}
          currentPunster={currentPunster}
          punster={punster}
        />
      ))(duanjis)}
    </div>
  );
}
