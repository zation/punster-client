import * as fcl from '@onflow/fcl';
import { contractHash } from './constants';
import { fetchJSON } from '@/services/ipfs';
import { map, zipWith } from 'lodash/fp';

export interface DuanjiResource {
  id: string
  owner: string
  description: string
  ipfsUrl: string
  funnyIndex: string
  isAD: boolean
  commends: string[]
}

export interface DuanjiIPFS {
  title: string
  content: string
  imageHashes: string[]
}

export type Duanji = DuanjiIPFS & DuanjiResource

const fetchIPFS = async (resources: DuanjiResource[]) => {
  const results = await Promise.all(map(({
    ipfsUrl,
  }) => fetchJSON<DuanjiIPFS>(ipfsUrl))(resources));
  return zipWith<DuanjiResource, DuanjiIPFS, Duanji>((resource, result) => ({ ...resource, ...result }))(resources)(results);
}

export const create = async (description: string, ipfsURL: string) => {
  const transactionId = await fcl.mutate({
    cadence: `
import PunstersNFT from ${contractHash}
import NonFungibleToken from ${contractHash}

transaction(description: String, ipfsURL: String) {

  prepare(acct: AuthAccount) {

      if let punsterRef = acct.borrow<&PunstersNFT.Collection>(from: PunstersNFT.PunsterStoragePath) {
        punsterRef.publishDuanji(description: "Duanji from ".concat(acct.address.toString()).concat(". ").concat(description), 
                                ipfsURL: ipfsURL);
      }
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

export const upVote = async (address: string, duanjiId: number) => {
  const transactionId = await fcl.mutate({
    cadence: `
import PunstersNFT from ${contractHash}
import NonFungibleToken from ${contractHash}

transaction (ownerAddr: Address, duanjiID: UInt64) {
    prepare (acct: AuthAccount) {
        if let punsterRef = acct.borrow<&PunstersNFT.Collection>(from: PunstersNFT.PunsterStoragePath) {
            punsterRef.commendToDuanji(addr: ownerAddr, duanjiID: duanjiID);
        }
    }

    execute {

    }
}`,
    args: (arg, type) => [
      arg(address, type.Address),
      arg(duanjiId, type.UInt64),
    ],
  })
  return fcl.tx(transactionId).onceSealed()
}

export const cancelUpVote = async (address: string, duanjiId: number) => {
  const transactionId = await fcl.mutate({
    cadence: `
import PunstersNFT from ${contractHash}
import NonFungibleToken from ${contractHash}

transaction (ownerAddr: Address, duanjiID: UInt64) {
    prepare (acct: AuthAccount) {
        if let punsterRef = acct.borrow<&PunstersNFT.Collection>(from: PunstersNFT.PunsterStoragePath) {
            punsterRef.cancelCommendToDuanji(addr: ownerAddr, duanjiID: duanjiID);
        }
    }

    execute {

    }
}`,
    args: (arg, type) => [
      arg(address, type.Address),
      arg(duanjiId, type.UInt64),
    ],
  })
  return fcl.tx(transactionId).onceSealed()
}

export const readFollowing = async () => {
  const { addr } = await fcl.currentUser.snapshot()
  if (!addr) {
    return [];
  }
  const resources = await fcl.query({
    cadence: `
import PunstersNFT from ${contractHash}

pub fun main(addr: Address): AnyStruct? {
    
    if let punsterRef = PunstersNFT.getIPunsterFromAddress(addr: addr) {
        return punsterRef.getPunsterView();
    }
    
    return nil;
}`,
    args: (arg, type) => [
      arg(addr, type.Address),
    ],
  }) as DuanjiResource[];

  return fetchIPFS(resources);
};

export const readMyLatest = async () => {
  const { addr } = await fcl.currentUser.snapshot()
  if (!addr) {
    return null;
  }
  const resource = await fcl.query({
    cadence: `
import PunstersNFT from ${contractHash}

pub fun main(addr: Address): PunstersNFT.DuanjiView? {
    if let punsterRef = PunstersNFT.getIPunsterFromAddress(addr: addr) {
        return punsterRef.getLatestDuanjiView();
    }
    
    return nil;
}`,
    args: (arg, type) => [
      arg(addr, type.Address),
    ],
  }) as DuanjiResource | null;
  if (!resource) {
    return null;
  }
  const data = await fetchJSON<DuanjiIPFS>(resource.ipfsUrl);
  return { ...resource, ...data };
}

export const readByAddress = async (address: string) => {
  const resources = await fcl.query({
    cadence: `
import PunstersNFT from ${contractHash}

pub fun main(addr: Address): [PunstersNFT.DuanjiView]? {
    
    var duanjiView: [PunstersNFT.DuanjiView] = []

    if let punsterRef = PunstersNFT.getIPunsterFromAddress(addr: addr) {
        duanjiView.concat(punsterRef.getAllDuanjiView());
        duanjiView = duanjiView.concat(punsterRef.getAllDuanjiView());
        return duanjiView;
    }

    // let pubAcct = getAccount(addr);
    // let oIPunster = pubAcct.getCapability<&{PunstersNFT.IPunsterPublic}>(PunstersNFT.IPunsterPublicPath);
    // duanjiView.concat(oIPunster.borrow()!.getAllDuanjiView());
    return nil;
}`,
    args: (arg, type) => [
      arg(address, type.Address),
    ],
  }) as DuanjiResource[];

  return fetchIPFS(resources);
};

export const readMine = async () => {
  const { addr } = await fcl.currentUser.snapshot();
  if (!addr) {
    return [];
  }
  return readByAddress(addr);
};

