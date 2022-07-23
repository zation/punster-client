import {
  isAnyOf,
  createReducer,
} from '@reduxjs/toolkit';
import { register, readMine } from './punster';
import { prop } from 'lodash/fp';
import type { RootState } from './store';

const namespace = 'auth';
export const selectEntities = prop<RootState, 'auth'>(namespace);

const reducer = createReducer<{
  punsterId: number | null
  isLogin: boolean
}>({
  punsterId: null,
  isLogin: false,
}, (builder) => {
  builder.addMatcher(isAnyOf(register.fulfilled, readMine.fulfilled), (state, { payload }) => {
    if (payload?.id) {
      return {
        isLogin: true,
        punsterId: payload.id,
      };
    }
    return state;
  });
});

export default { [namespace]: reducer };
