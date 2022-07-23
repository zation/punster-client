import { ReactNode } from 'react';
import * as fcl from '@onflow/fcl';
import { Provider } from 'react-redux';
import store from '@/models/store';
import { readMine } from '@/models/punster';

fcl.config({
  'accessNode.api': 'https://rest-testnet.onflow.org',
  'discovery.wallet': 'https://fcl-discovery.onflow.org/testnet/authn',
  'discovery.wallet.method': 'POP/RPC',
});

fcl.currentUser.subscribe(async (user) => {
  if (user.loggedIn) {
    await store.dispatch(readMine());
  }
});

export function rootContainer(container: ReactNode[]) {
  return (
    <Provider store={store}>
      {container}
    </Provider>
  );
}
