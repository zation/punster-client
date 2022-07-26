import { ReactNode } from 'react';
import Duanji from '@/components/duanji';
import { selectors, Duanji as DuanjiModel } from '@/models/duanji';
import { selectEntities } from '@/models/auth';
import { selectors as punsterSelectors, Punster } from '@/models/punster';
import { RootState } from '@/models/store';
import { useSelector } from 'react-redux';
import { map, flow, find, propEq } from 'lodash/fp';

interface DuanjiDisplay extends DuanjiModel {
  punster: Punster
}

const selector = (state: RootState) => {
  const punsters = punsterSelectors.selectAll(state);
  const { punsterId } = selectEntities(state);

  return {
    currentPunster: punsterId ? punsterSelectors.selectById(state, punsterId) : undefined,
    duanjis: flow(
      selectors.selectAll,
      map<DuanjiModel, DuanjiDisplay>((duanji) => ({
        ...duanji,
        punster: find(propEq('owner', duanji.owner))(punsters),
      })),
    )(state),
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
