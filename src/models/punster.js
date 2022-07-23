import {
  createSlice,
  createEntityAdapter,
  createAction,
} from '@reduxjs/toolkit';

const punsterAdapter = createEntityAdapter();
const sliceName = 'punster';

const slice = createSlice({
  name: sliceName,
  initialState: punsterAdapter.getInitialState(),
  reducers: {
    registerSuccess: punsterAdapter.setOne,
    loginSuccess: punsterAdapter.setOne,
    readAllSuccess: punsterAdapter.setMany,
  }
});

export const { registerSuccess, loginSuccess, readAllSuccess } = slice.actions;
export const register = createAction(`${sliceName}/register`);
export const login = createAction(`${sliceName}/login`);
export const readAll = createAction(`${sliceName}/readAll`);

export default slice;
