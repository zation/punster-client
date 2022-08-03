import {
  createEntityAdapter,
  createAsyncThunk,
  createReducer,
  isAnyOf,
  Update,
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
  createStarPort as createStarPortService,
  transfer as transferService,
  Punster,
  PunsterIPFS,
} from '@/services/punster';
import { prop } from 'lodash/fp';
import { selectEntities as selectAuthEntities } from './auth';
import type { RootState } from './store';

export type {
  Punster,
  PunsterIPFS,
  PunsterResource,
} from '@/services/punster';

const adapter = createEntityAdapter<Punster>();
const namespace = 'punster';
export const selectors = adapter.getSelectors<RootState>(prop(namespace));

export const register = createAsyncThunk(
  `${namespace}/register`,
  async ({ avatarHash, nickname }: PunsterIPFS) => {
    const { Hash } = await uploadJSON<PunsterIPFS>({ avatarHash, nickname });
    await registerService('', Hash);
    return await readMineService();
  },
);

export const destroy = createAsyncThunk<{ punsterId: string | null }, void, { state: RootState }>(
  `${namespace}/destroy`,
  async (_, { getState }) => {
    await destroyService();
    return { punsterId: selectAuthEntities(getState()).punsterId };
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
);

export const createStarPort = createAsyncThunk(
  `${namespace}/createStarPort`,
  async () => {
    await createStarPortService();
  },
);

export const transfer = createAsyncThunk<Update<Punster>, { id: string, toAddress: string }>(
  `${namespace}/transfer`,
  async ({ toAddress, id }) => {
    await transferService(toAddress);
    return { id, changes: { owner: toAddress } };
  },
);

const reducer = createReducer(adapter.getInitialState(), (builder) => {
  builder.addCase(destroy.fulfilled, (state, { payload: { punsterId } }) => {
    if (punsterId) {
      adapter.removeOne(state, punsterId);
    }
  });
  builder.addCase(transfer.fulfilled, (state, { payload }) => {
    adapter.updateOne(state, payload);
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
