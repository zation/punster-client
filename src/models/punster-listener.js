import { createListenerMiddleware } from '@reduxjs/toolkit';
import { uploadJSON } from 'services/ipfs';
import { register, readMine, destroy } from 'services/punster';
import { registerSuccess, register as registerStart } from './punster';

const listenerMiddleware = createListenerMiddleware()

listenerMiddleware.startListening({
  actionCreator: registerStart,
  effect: async (action, listenerApi) => {
    const { payload: { avatarHash, nickname } } = action;
    const { Hash } = await uploadJSON({ avatarHash, nickname });
    await destroy();
    await register({
      description: '',
      ipfsURL: Hash,
    });
    const punster = await readMine();
    console.log('in listener', punster);
    listenerApi.dispatch(registerSuccess(punster));
  },
});

export default listenerMiddleware;
