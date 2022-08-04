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
// @ts-ignore
import { send as httpSend } from '@onflow/transport-http'

const { dispatch } = store;

fcl.config({
  'accessNode.api': 'https://rest-testnet.onflow.org',
  'discovery.wallet': 'https://fcl-discovery.onflow.org/testnet/authn',
  // @ts-ignore
  'sdk.transport': httpSend,
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
