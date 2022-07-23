import { configureStore } from '@reduxjs/toolkit'
import {
  useDispatch,
  TypedUseSelectorHook,
  useSelector,
} from 'react-redux'
import auth from './auth';
import punster from './punster';

const store = configureStore({
  reducer: {
    ...auth,
    ...punster,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppSelector = TypedUseSelectorHook<RootState>;
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: AppSelector = useSelector;

export default store;
