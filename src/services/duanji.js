import * as fcl from '@onflow/fcl';
import { contractHash } from './constants';

export const create = async ({ description, ipfsURL }) => {
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

export const upVote = async ({ address, duanjiId }) => {
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

export const cancelUpVote = async ({ address, duanjiId }) => {
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
  const address = await fcl.currentUser.snapshot()
  return await fcl.query({
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
  })
};

