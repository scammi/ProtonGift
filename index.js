require('dotenv').config();


const { ethers } = require("ethers");
const kovanAddresses = require('@charged-particles/protocol-subgraph/networks/kovan');
const prontonAbi =  require('@charged-particles/protocol-subgraph/abis/Proton');
const chargeStateAbi =  require('@charged-particles/protocol-subgraph/abis/ChargedState');
const genericWalletManagerAbi =  require('@charged-particles/protocol-subgraph/abis/GenericWalletManager');
const fs = require('fs');

(async ()=>{
  const TOKEN_URI = 'https://gateway.pinata.cloud/ipfs/QmQxDjEhnYP6QAtLRyLV9N7dn1kDigz7iWnx5psmyXqy35/1';
  const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
  
  // init addresses
  const walletMnemonic = new ethers.Wallet.fromMnemonic(process.env.MNEMONIC)
  const myWallet = walletMnemonic.connect(provider)
  const receiptWallet = ethers.Wallet.createRandom();
  const receiptWalletAddress = receiptWallet.address;

  // init contracts
  const protonContract = new ethers.Contract(kovanAddresses.proton.address, prontonAbi, provider);
  const chargeStateContract = new ethers.Contract(kovanAddresses.chargedState.address, chargeStateAbi);
  const genericWalletManagerContract = new ethers.Contract(kovanAddresses.genericWalletManager.address, genericWalletManagerAbi);

  // create
  const newProtonId = await protonContract.connect(myWallet).callStatic.createBasicProton(
    myWallet.address,
    myWallet.address,
    TOKEN_URI 
  )
  console.log('New token:',newProtonId.toNumber(), '\n');

  const newProtonTrx = await protonContract.connect(myWallet).createBasicProton(
    myWallet.address, 
    myWallet.address,
    TOKEN_URI,
  );
  await newProtonTrx.wait();
  console.log('Proton created \n');

  // charge 
  // const deposit = await genericWalletManagerContract.connect(myWallet).energize(
  //   kovanAddresses.proton.address,
  //   11,
  //   '0xa36085F69e2889c224210F603D836748e7dC0088',//link
  //   1,
  //   {gasLimit: 185000, gasPrice: 1500000000}
  // );
  // console.log(await deposit.wait());

  // lock
  const lock = await chargeStateContract.connect(myWallet).setReleaseTimelock(
    kovanAddresses.proton.address,
    newProtonId.toNumber(),
    99483079
  );
  await lock.wait();
  console.log('Proton locked \n');

  // transfer
  const transfer = await protonContract.connect(myWallet).transferFrom(
   myWallet.address,
   receiptWalletAddress,
   newProtonId.toNumber()
  )
  await transfer.wait();
  console.log('New owner set \n');

  //get state
  const timeLockState = await chargeStateContract.connect(myWallet).getReleaseTimelockExpiry(kovanAddresses.proton.address, newProtonId.toNumber());
  console.log('Time lock for: ',timeLockState.toNumber(), '\n');
  
  const newOwner = await protonContract.creatorOf(newProtonId.toNumber());
  console.log("New owner", newOwner);

  fs.writeFile('receiptWalletPK.txt', String(receiptWallet.privateKey) , function (err) {
    if (err) return console.log(err);
    console.log('Saved private key... ');
  });
})();
