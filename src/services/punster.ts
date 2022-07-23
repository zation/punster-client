import * as fcl from '@onflow/fcl';
import type { Punster } from '@/models/punster';
import { contractHash } from './constants';
import { fetchJSON } from './ipfs';

export interface PunsterResource {
  id: number
  owner: string
  description: string
  ipfsUrl: string
  funnyIndex: number
  followings: [string]
  followers: [string]
}

export const register = async (description: string, ipfsURL: string) => {
  const transactionId = await fcl.mutate({
    cadence: `
import PunstersNFT from ${contractHash}
import NonFungibleToken from ${contractHash}

transaction (description: String, ipfsURL: String) {

  prepare(acct: AuthAccount) {

      let punster <- PunstersNFT.registerPunster(addr: acct.address, 
                                                description: "Punster: ".concat(acct.address.toString()).concat(". ").concat(description), 
                                                ipfsURL: ipfsURL);

      acct.save(<-punster, to: PunstersNFT.PunsterStoragePath);
      acct.link<&{PunstersNFT.IPunsterPublic}>(PunstersNFT.IPunsterPublicPath, target: PunstersNFT.PunsterStoragePath);
  }

  execute {
    
  }
}`,
    args: (arg, type) => [
      arg(description, type.String),
      arg(ipfsURL, type.String),
    ],
  })
  return fcl.tx(transactionId).onceSealed()
}

export const destroy = async () => {
  const transactionId = await fcl.mutate({
    cadence: `
import PunstersNFT from ${contractHash}
import NonFungibleToken from ${contractHash}

transaction () {

  prepare(acct: AuthAccount) {

    if let punsterRef = acct.borrow<&PunstersNFT.Collection>(from : PunstersNFT.PunsterStoragePath) {
        punsterRef.preDestroy();
    }

    if let resPunster <- acct.load<@PunstersNFT.Collection>(from: PunstersNFT.PunsterStoragePath) {
        destroy resPunster;
    }
  }

  execute {
    
  }
}`,
  })
  return fcl.tx(transactionId).onceSealed()
}

export const follow = async (address: string) => {
  const transactionId = await fcl.mutate({
    cadence: `
import PunstersNFT from ${contractHash}
import NonFungibleToken from ${contractHash}

transaction (followingAddr: Address) {
    prepare (acct: AuthAccount) {
        if let punsterRef = acct.borrow<&PunstersNFT.Collection>(from: PunstersNFT.PunsterStoragePath) {
            punsterRef.followSomeone(addr: followingAddr);
        }
    }

    execute {

    }
}`,
    args: (arg, type) => [
      arg(address, type.Address),
    ],
  })
  return fcl.tx(transactionId).onceSealed()
}

export const unFollow = async (address: string) => {
  const transactionId = await fcl.mutate({
    cadence: `
import PunstersNFT from ${contractHash}
import NonFungibleToken from ${contractHash}

transaction (followingAddr: Address) {
    prepare (acct: AuthAccount) {
        if let punsterRef = acct.borrow<&PunstersNFT.Collection>(from: PunstersNFT.PunsterStoragePath) {
            punsterRef.cancelFollow(addr: followingAddr);
        }
    }

    execute {

    }
}`,
    args: (arg, type) => [
      arg(address, type.Address),
    ],
  })
  return fcl.tx(transactionId).onceSealed()
}

export const readOne = async (address: string | null | undefined): Promise<Punster | null> => {
  if (!address) {
    return null;
  }
  const resource = await fcl.query({
    cadence: `
import PunstersNFT from ${contractHash}

pub fun main(addr: Address): AnyStruct? {
    
    if let punsterRef = PunstersNFT.getIPunsterFromAddress(addr: addr) {
        return punsterRef.getPunsterView();
    }
    
    return nil;
}`,
    args: (arg, type) => [
      arg(address, type.Address),
    ],
  }) as PunsterResource;
  const data = await fetchJSON(resource.ipfsUrl);
  return { ...resource, ...data };
};

export const readMine = async () => {
  const { addr } = await fcl.currentUser.snapshot();
  return readOne(addr);
};

export const readMineFollowers = async () => {
  const { addr } = await fcl.currentUser.snapshot()
  if (!addr) {
    return [];
  }
  return await fcl.query({
    cadence: `
import PunstersNFT from ${contractHash}

pub fun main(addr: Address): [Address]? {
    if let punsterRef = PunstersNFT.getIPunsterFromAddress(addr: addr) {
        return punsterRef.getFollowers();
    }
    
    return nil;
}`,
    args: (arg, type) => [
      arg(addr, type.Address),
    ],
  });
};

export const readMineFollowings = async () => {
  const { addr } = await fcl.currentUser.snapshot()
  if (!addr) {
    return [];
  }
  return await fcl.query({
    cadence: `
import PunstersNFT from ${contractHash}

pub fun main(addr: Address): [Address]? {
    if let punsterRef = PunstersNFT.getIPunsterFromAddress(addr: addr) {
        return punsterRef.getFollowings();
    }
    
    return nil;
}`,
    args: (arg, type) => [
      arg(addr, type.Address),
    ],
  });
};
