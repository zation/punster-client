import * as fcl from '@onflow/fcl';
import {
  map,
  flow,
  values,
} from 'lodash/fp';
import { contractHash } from './constants';
import { fetchJSON } from './ipfs';
import { compact } from 'lodash';

export interface PunsterResource {
  id: string
  owner: string
  description: string
  ipfsUrl: string
  funnyIndex: string
  followings: [string]
  followers: [string]
}

export interface PunsterIPFS {
  nickname: string
  avatarHash: string
}

export type Punster = PunsterResource & PunsterIPFS;

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

export const createStarPort = async () => {
  const transactionId = await fcl.mutate({
    cadence: `
import StarRealm from ${contractHash}

transaction () {
    prepare (acct: AuthAccount) {
        if let starPortRef = acct.borrow<&StarRealm.StarPort>(from: StarRealm.PortStoragePath) {
            panic("\`StarPort\` already exists!");
        }else {
            acct.save(<- StarRealm.createStarPort(), to: StarRealm.PortStoragePath);
            if (acct.getCapability<&{StarRealm.StarDocker}>(StarRealm.DockerPublicPath).borrow() == nil) {
                acct.link<&{StarRealm.StarDocker}>(StarRealm.DockerPublicPath, target: StarRealm.PortStoragePath);
            }
        }
    }

    execute {

    }
}`,
  })
  return fcl.tx(transactionId).onceSealed();
}

export const transfer = async (toAddress: string) => {
  const transactionId = await fcl.mutate({
    cadence: `
import PunstersNFT from ${contractHash}
import StarRealm from ${contractHash}

transaction (to: Address) {
    prepare (acct: AuthAccount) {
        // Check StarPort exesting
        if let starPortRef = acct.borrow<&StarRealm.StarPort>(from: StarRealm.PortStoragePath) {
            // Check saved \`Punster\`
            if let punster <- acct.load<@PunstersNFT.Collection>(from: PunstersNFT.PunsterStoragePath) {
                // Check target docker
                if let targetDocker = StarRealm.getStarDockerFromAddress(addr: to) {
                    // Check docking acceptable
                    let rst <- targetDocker.docking(nft: <- punster);
                    if rst != nil {
                        panic("Transfer failed, the target \`docker\` does not accept!");
                    } else {
                        destroy rst;
                    }
                } else {
                    panic("Target docker does not exists!")
                }

                acct.unlink(PunstersNFT.IPunsterPublicPath);
                acct.unlink(StarRealm.DockerPublicPath);
            }else {
                if let punsterFromPort <- starPortRef.sailing() {
                    // Check if ported thing is \`Punster\`
                    if let portedThing <- punsterFromPort as? @PunstersNFT.Collection{
                        // Check target docker
                         if let targetDocker = StarRealm.getStarDockerFromAddress(addr: to) {
                            // Check docking acceptable
                            let rst <- targetDocker.docking(nft: <- portedThing);
                            if rst != nil {
                                panic("Transfer failed, the target \`docker\` does not accept!");
                            } else {
                                destroy rst;
                            }
                        } else {
                    panic("Target docker does not exists!")
                }
                    }else {
                        panic("No \`Punster\` exists!");
                    }
                }else {
                    panic("No \`Punster\` exists!");
                }
            }

            // Link public docker to \`StarPort\` for receiving punster
            acct.link<&{StarRealm.StarDocker}>(StarRealm.DockerPublicPath, target: StarRealm.PortStoragePath);
        }else {
            panic("Create \`StarPort\` first!");
        }
    }

    execute {

    }
}`,
    args: (arg, type) => [
      arg(toAddress, type.Address),
    ],
  })
  return fcl.tx(transactionId).onceSealed();
}

export const receive = async () => {
  const transactionId = await fcl.mutate({
    cadence: `
import StarRealm from ${contractHash}
import PunstersNFT from ${contractHash}

transaction () {
    prepare (acct: AuthAccount) {
        if let starPortRef = acct.borrow<&StarRealm.StarPort>(from: StarRealm.PortStoragePath) {
             if let punsterFromPort <- starPortRef.sailing() {
                    // Check if ported thing is \`Punster\`
                    if let portedThing <- punsterFromPort as? @PunstersNFT.Collection{
                        acct.save(<- portedThing, to: PunstersNFT.PunsterStoragePath);
                        acct.unlink(StarRealm.DockerPublicPath);
                        acct.link<&{PunstersNFT.IPunsterPublic}>(PunstersNFT.IPunsterPublicPath, target: PunstersNFT.PunsterStoragePath);
                        acct.link<&{StarRealm.StarDocker}>(StarRealm.DockerPublicPath, target: PunstersNFT.PunsterStoragePath);

                        let punsterRef = acct.borrow<&PunstersNFT.Collection>(from: PunstersNFT.PunsterStoragePath)!;
                        PunstersNFT.updateRegisteredPunster(punster: punsterRef);

                    } else {
                        panic("Ported thing is not \`Punster\`");
                    }
             } else {
                panic("Nothing ported")
             }
        }else {
            panic("\`StarPort\` does not exist!");
        }
    }

    execute {

    }
}`,
  });
  return fcl.tx(transactionId).onceSealed();
}

export const readOne = async (address: string | null | undefined): Promise<Punster | undefined> => {
  if (!address) {
    return undefined;
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
  if (resource) {
    const data = await fetchJSON<PunsterIPFS>(resource.ipfsUrl);
    return { ...resource, ...data };
  }
  return undefined;
};

export const readMine = async () => {
  const { addr } = await fcl.currentUser.snapshot();
  return readOne(addr);
};

export const readAll = async (): Promise<Punster[]> => {
  const responses = await fcl.query({
    cadence: `
import PunstersNFT from ${contractHash}

pub fun main(): {UInt64: Address} {
    return PunstersNFT.getRegisteredPunsters();
}`,
  }) as Record<string, string>;

  const results = await Promise.all(flow(
    values,
    map<string, Promise<Punster | undefined>>((address) => readOne(address)),
  )(responses));
  return compact(results);
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
