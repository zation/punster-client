import {
  createEntityAdapter,
  createAsyncThunk,
  createReducer,
  isAnyOf,
} from '@reduxjs/toolkit';
import { uploadJSON } from '@/services/ipfs';
import {
  destroy,
  readMine as readMineService,
  register as registerService,
  PunsterResource,
} from '@/services/punster';
import { prop } from 'lodash/fp';
import type { RootState } from './store';

export interface Punster extends PunsterResource {
  nickname: string
  avatarHash: string
}

const adapter = createEntityAdapter<Punster>();
const namespace = 'punster';
export const selectors = adapter.getSelectors<RootState>(prop(namespace));

interface RegisterParams {
  avatarHash: string
  nickname: string
}

export const register = createAsyncThunk(
  `${namespace}/register`,
  async ({ avatarHash, nickname }: RegisterParams) => {
    const { Hash } = await uploadJSON({ avatarHash, nickname });
    await destroy();
    await registerService('', Hash);
    return await readMineService();
  },
);

export const readMine = createAsyncThunk(
  `${namespace}/readMine`,
  async () => readMineService(),
);

const reducer = createReducer(adapter.getInitialState(), (builder) => {
  builder.addMatcher(isAnyOf(register.fulfilled, readMine.fulfilled), (state, { payload }) => {
    if (payload !== null) {
      adapter.setOne(state, payload);
    }
  });
});

export default { [namespace]: reducer };
