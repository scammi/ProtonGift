// index.js
require('dotenv').config();
const { ethers } = require("ethers");
const kovanAddresses = require('@charged-particles/protocol-subgraph/networks/kovan');
const prontonAbi =  require('@charged-particles/protocol-subgraph/abis/Proton');

(async ()=>{
  const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
  const signer = provider.getSigner()
  // console.log(kovanAddresses.proton.address);
  // console.log(await provider.getBlockNumber())

  const protonContract = new ethers.Contract(kovanAddresses.proton.address, prontonAbi, provider);

  const supply = await protonContract.totalSupply();


  console.log(supply.toNumber())
})();
