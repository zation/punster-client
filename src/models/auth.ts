import {
  isAnyOf,
  createReducer,
  createAction,
} from '@reduxjs/toolkit';
import { register, readMine, destroy } from './punster';
import { prop } from 'lodash/fp';
import type { RootState } from './store';

const namespace = 'auth';
export const selectEntities = prop<RootState, 'auth'>(namespace);

export const logout = createAction(`${namespace}/logout`);

const reducer = createReducer<{
  punsterId: string | null
  isLogin: boolean
}>({
  punsterId: null,
  isLogin: false,
}, (builder) => {
  builder.addMatcher(isAnyOf(logout, destroy.fulfilled), () => ({
    punsterId: null,
    isLogin: false,
  }));
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
