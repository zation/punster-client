import { ReactNode } from 'react';
import * as fcl from '@onflow/fcl';
import { Provider } from 'react-redux';
import store from '@/models/store';
import {
  readMine,
  readAll,
} from '@/models/punster';
import {
  readFollowing as readFollowingDuanji,
  readMine as readMineDuanji,
} from '@/models/duanji';

const { dispatch } = store;

fcl.config({
  'accessNode.api': 'https://rest-testnet.onflow.org',
  'discovery.wallet': 'https://fcl-discovery.onflow.org/testnet/authn',
  'discovery.wallet.method': 'POP/RPC',
});

const preload = () => Promise.all([
  dispatch(readMine()),
  dispatch(readMineDuanji()),
  dispatch(readFollowingDuanji()),
]);

fcl.currentUser.subscribe(async (user) => {
  if (user.loggedIn) {
    preload();
  }
});

dispatch(readAll());
preload();

export function rootContainer(container: ReactNode[]) {
  return (
    <Provider store={store}>
      {container}
    </Provider>
  );
}
