import { ReactNode } from 'react';
import Duanji from '@/components/duanji';
import { selectors, Duanji as DuanjiModel } from '@/models/duanji';
import { selectEntities } from '@/models/auth';
import { selectors as punsterSelectors } from '@/models/punster';
import { RootState } from '@/models/store';
import { useSelector } from 'react-redux';
import { map, flow, find, propEq, prop } from 'lodash/fp';

interface DuanjiDisplay extends DuanjiModel {
  ownerNickname: string
}

const selector = (state: RootState) => {
  const punsters = punsterSelectors.selectAll(state);

  return {
    currentPunsterAddress: selectEntities(state).punsterAddress,
    duanjis: flow(
      selectors.selectAll,
      map<DuanjiModel, DuanjiDisplay>((duanji) => ({
        ...duanji,
        ownerNickname: flow(
          find(propEq('owner', duanji.owner)),
          prop('nickname'),
        )(punsters),
      })),
    )(state),
  };
}

export default function HomePage() {
  const {
    duanjis,
    currentPunsterAddress,
  } = useSelector(selector);

  return (
    <div>
      {map<DuanjiDisplay, ReactNode>(({ ownerNickname, ...duanji }) => (
        <Duanji
          key={duanji.id}
          duanji={duanji}
          currentPunsterAddress={currentPunsterAddress}
          ownerNickname={ownerNickname}
        />
      ))(duanjis)}
    </div>
  );
}
