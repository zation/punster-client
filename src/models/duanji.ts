import {
  createEntityAdapter,
  createAsyncThunk,
  createReducer,
  isAnyOf,
} from '@reduxjs/toolkit';
import { uploadJSON } from '@/services/ipfs';
import {
  create as createService,
  readMyLatest as readMyLatestService,
  readFollowing as readFollowingService,
  readMine as readMineService,
  upVote as upVoteService,
  cancelUpVote as cancelUpVoteService,
  readFunnyIndex as readFunnyIndexService,
  readByAddress as readByAddressService,
  Duanji,
  DuanjiIPFS,
} from '@/services/duanji';
import { create as createAdertisementService } from '@/services/advertisement';
import {
  find,
  flow,
  map,
  prop,
  propEq,
  sortBy,
} from 'lodash/fp';
import type { RootState } from './store';
import { selectEntities } from './auth';
import { Punster, selectors as punsterSelectors } from './punster';

export type {
  Duanji,
  DuanjiIPFS,
  DuanjiResource,
} from '@/services/duanji';

export interface DuanjiDisplay extends Duanji {
  punster: Punster
}

const adapter = createEntityAdapter<Duanji>();
const namespace = 'duanji';
export const selectors = adapter.getSelectors<RootState>(prop(namespace));
export const getDuanjisSelector = (state: RootState) => {
  const punsters = punsterSelectors.selectAll(state);
  return flow(
    selectors.selectAll,
    map<Duanji, DuanjiDisplay>((duanji) => ({
      ...duanji,
      punster: find(propEq('owner', duanji.owner))(punsters),
    })),
    sortBy(({ createdAt }) => -new Date(createdAt).getTime()),
  )(state);
};

export const readMine = createAsyncThunk(
  `${namespace}/readMine`,
  async () => readMineService(),
);

export const readFollowing = createAsyncThunk(
  `${namespace}/readFollowing`,
  async () => readFollowingService(),
);

export const readByAddress = createAsyncThunk(
  `${namespace}/readByAddress`,
  async (address: string) => readByAddressService(address),
);

export interface CreateParams extends DuanjiIPFS {
  isAdvertisement: boolean
}

export const create = createAsyncThunk(
  `${namespace}/create`,
  async ({ title, content, imageHashes, createdAt, isAdvertisement }: CreateParams) => {
    const { Hash } = await uploadJSON<DuanjiIPFS>({ title, content, imageHashes, createdAt });
    if (isAdvertisement) {
      await createAdertisementService('', Hash);
    } else {
      await createService('', Hash);
    }
    return readMyLatestService();
  },
);

type UpVoteParams = {
  owner: string
  id: string
}

export const upVote = createAsyncThunk<{ id: string, address: string, funnyIndex: string }, UpVoteParams, { state: RootState }>(
  `${namespace}/upVote`,
  async ({ owner, id }, { getState }) => {
    await upVoteService(owner, id);
    const funnyIndex = await readFunnyIndexService(owner, id);
    return { id, address: selectEntities(getState()).punsterAddress!, funnyIndex };
  },
);

export const cancelUpVote = createAsyncThunk<{ id: string, address: string, funnyIndex: string }, UpVoteParams, { state: RootState }>(
  `${namespace}/cancelUpVote`,
  async ({ owner, id }, { getState }) => {
    await cancelUpVoteService(owner, id);
    const funnyIndex = await readFunnyIndexService(owner, id);
    return { id, address: selectEntities(getState()).punsterAddress!, funnyIndex };
  },
);

const reducer = createReducer(adapter.getInitialState(), (builder) => {
  builder.addCase(create.fulfilled, (state, { payload }) => {
    if (payload) {
      adapter.setOne(state, payload);
    }
  });
  builder.addCase(upVote.fulfilled, (state, { payload: { address, id, funnyIndex } }) => {
    state.entities[id]!.commends.push(address);
    state.entities[id]!.funnyIndex = funnyIndex;
  });
  builder.addCase(cancelUpVote.fulfilled, (state, { payload: { address, id, funnyIndex } }) => {
    state.entities[id]!.commends = state.entities[id]!.commends.filter((commend) => commend !== address);
    state.entities[id]!.funnyIndex = funnyIndex;
  });
  builder.addMatcher(isAnyOf(readFollowing.fulfilled, readMine.fulfilled, readByAddress.fulfilled), (state, { payload }) => {
    adapter.setMany(state, payload);
  });
});

export default { [namespace]: reducer };
