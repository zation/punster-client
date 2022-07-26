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
  Duanji,
  DuanjiIPFS,
} from '@/services/duanji';
import { prop } from 'lodash/fp';
import type { RootState } from './store';

const adapter = createEntityAdapter<Duanji>();
const namespace = 'duanji';
export const selectors = adapter.getSelectors<RootState>(prop(namespace));

export const readMine = createAsyncThunk(
  `${namespace}/readMine`,
  async () => readMineService(),
);

export const readFollowing = createAsyncThunk(
  `${namespace}/readAll`,
  async () => readFollowingService(),
);

export const create = createAsyncThunk(
  `${namespace}/readMineFollowings`,
  async ({ title, content, imageHashes }: DuanjiIPFS) => {
    const { Hash } = await uploadJSON({ title, content, imageHashes });
    await createService('', Hash);
    return readMyLatestService();
  },
);

const reducer = createReducer(adapter.getInitialState(), (builder) => {
  builder.addCase(create.fulfilled, (state, { payload }) => {
    if (payload) {
      adapter.setOne(state, payload);
    }
  });
  builder.addMatcher(isAnyOf(readFollowing.fulfilled, readMine.fulfilled), (state, { payload }) => {
    adapter.setMany(state, payload);
  });
});

export default { [namespace]: reducer };
