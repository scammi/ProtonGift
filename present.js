// index.js
require('dotenv').config();
const { ethers } = require("ethers");
const kovanAddresses = require('@charged-particles/protocol-subgraph/networks/kovan');
const prontonAbi =  require('@charged-particles/protocol-subgraph/abis/Proton');

(async ()=>{
  const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
  const signer = provider.getSigner()

  const walletMnemonic = new ethers.Wallet.fromMnemonic(process.env.MEMONIC)
  const wallet = walletMnemonic.connect(provider)

  // console.log(kovanAddresses.proton.address);
  // console.log(await provider.getBlockNumber())

  const protonContract = new ethers.Contract(kovanAddresses.proton.address, prontonAbi, provider);
  const supply = await protonContract.totalSupply();

  // const newProtonTrx = await protonContract.connect(wallet).createBasicProton(
  //   '0x7856C7F4A4Fa0a65Ed2950FbAcFEf7ACB17555E6',
  //   '0x7856C7F4A4Fa0a65Ed2950FbAcFEf7ACB17555E6',
  //   "https://gateway.pinata.cloud/ipfs/QmQxDjEhnYP6QAtLRyLV9N7dn1kDigz7iWnx5psmyXqy35/1",
  // );

  // const newProton = await newProtonTrx.wait() ;

  // console.log(newProtonTrx, newProton);
  // console.log(supply.toNumber()) 

  const ownerOf = await protonContract.creatorOf(10);
  console.log(ownerOf);

  const tokenUri = await protonContract.tokenURI(10);

  console.log(tokenUri);
})();
