import { ReactNode } from 'react';
import Duanji from '@/components/duanji';
import { selectors, Duanji as DuanjiModel } from '@/models/duanji';
import { selectEntities } from '@/models/auth';
import { selectors as punsterSelectors, Punster as PunsterModel } from '@/models/punster';
import Punster from '@/components/punster';
import { RootState } from '@/models/store';
import { useSelector } from 'react-redux';
import { map, flow, find, propEq } from 'lodash/fp';
import { useParams } from 'umi';
import { filter } from 'lodash';
import { Divider } from 'antd';

import s from './$id.less';

interface DuanjiDisplay extends DuanjiModel {
  punster: PunsterModel
}

const selector = (id?: string) => (state: RootState) => {
  const punsters = punsterSelectors.selectAll(state);
  const { punsterId } = selectEntities(state);

  return {
    currentPunster: punsterId ? punsterSelectors.selectById(state, punsterId) : undefined,
    punster: id ? punsterSelectors.selectById(state, id) : undefined,
    duanjis: flow(
      selectors.selectAll,
      map<DuanjiModel, DuanjiDisplay>((duanji) => ({
        ...duanji,
        punster: find(propEq('owner', duanji.owner))(punsters),
      })),
      filter(propEq('id', id)),
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
