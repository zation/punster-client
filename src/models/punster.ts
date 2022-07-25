import {
  createEntityAdapter,
  createAsyncThunk,
  createReducer,
  isAnyOf,
} from '@reduxjs/toolkit';
import { uploadJSON } from '@/services/ipfs';
import {
  destroy as destroyService,
  readMine as readMineService,
  readMineFollowings as readMineFollowingsService,
  readAll as readAllService,
  register as registerService,
  follow as followService,
  unFollow as unFollowService,
  Punster,
} from '@/services/punster';
import { prop } from 'lodash/fp';
import { selectEntities as selectAuthEntities } from './auth';
import type { RootState } from './store';

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
    await registerService('', Hash);
    return await readMineService();
  },
);

export const destroy = createAsyncThunk<{ punsterId: string | null }, void, { state: RootState }>(
  `${namespace}/destroy`,
  async (_, thunkAPI) => {
    await destroyService();
    return { punsterId: selectAuthEntities(thunkAPI.getState()).punsterId };
  },
);

export const readMine = createAsyncThunk(
  `${namespace}/readMine`,
  async () => readMineService(),
);

export const readAll = createAsyncThunk(
  `${namespace}/readAll`,
  async () => readAllService(),
);

export const readMineFollowings = createAsyncThunk(
  `${namespace}/readMineFollowings`,
  async () => {
    await readMineFollowingsService();
  },
);

export const follow = createAsyncThunk<void, string>(
  `${namespace}/follow`,
  async (address) => {
    await followService(address);
  },
)

export const unFollow = createAsyncThunk<void, string>(
  `${namespace}/follow`,
  async (address) => {
    await unFollowService(address);
  },
)

const reducer = createReducer(adapter.getInitialState(), (builder) => {
  builder.addCase(destroy.fulfilled, (state, { payload: { punsterId } }) => {
    if (punsterId) {
      adapter.removeOne(state, punsterId);
    }
  });
  builder.addCase(readAll.fulfilled, (state, { payload }) => {
    adapter.setAll(state, payload);
  });
  builder.addMatcher(isAnyOf(register.fulfilled, readMine.fulfilled), (state, { payload }) => {
    if (payload !== null) {
      adapter.setOne(state, payload);
    }
  });
});

export default { [namespace]: reducer };
