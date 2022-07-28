import { ReactNode } from 'react';
import Duanji from '@/components/duanji';
import { Duanji as DuanjiModel, getDuanjisSelector } from '@/models/duanji';
import { selectEntities } from '@/models/auth';
import { selectors as punsterSelectors, Punster } from '@/models/punster';
import { RootState } from '@/models/store';
import { useSelector } from 'react-redux';
import { map } from 'lodash/fp';

interface DuanjiDisplay extends DuanjiModel {
  punster: Punster
}

const selector = (state: RootState) => {
  const { punsterId } = selectEntities(state);

  return {
    currentPunster: punsterId ? punsterSelectors.selectById(state, punsterId) : undefined,
    duanjis: getDuanjisSelector(state),
  };
}

export default function HomePage() {
  const {
    duanjis,
    currentPunster,
  } = useSelector(selector);

  return (
    <div>
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
