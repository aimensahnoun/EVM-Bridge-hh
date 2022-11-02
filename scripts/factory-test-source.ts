import hre, { ethers } from "hardhat";

import bridgeLibrary from "../artifacts/contracts/Bridge.sol/Bridge.json";
import erc20 from "../artifacts/contracts/WERC20.sol/WrapperToken.json";
import { Bridge, ERC20 } from "../typechain";

async function main() {
  const providerMumbai = new ethers.providers.JsonRpcProvider(
    process.env.MUMBAI_RPC_URL as string
  );

 
  const walletMumbai = new ethers.Wallet(
    process.env.PRIVATE_KEY as string,
    providerMumbai
  );

 

  const amount = ethers.utils.parseEther("1");

  const MumbaiBalance = await walletMumbai.getBalance();


  console.log("Mumbai Balance: ", ethers.utils.formatEther(MumbaiBalance));


  //   Get contract from address
  const mumbaiBridgeAddress = "0x42695994e87F716d99941406c444DdA4351a4ad5";


  const bridgeMumbai = new ethers.Contract(
    mumbaiBridgeAddress,
    bridgeLibrary.abi,
    walletMumbai
  );



  const ashAddress = "0x1c2Ef7e363b72f82F5EF8b5B9C04c5899AAD3035";

  const ashContract = new ethers.Contract(ashAddress, erc20.abi, walletMumbai);

  // transfering token to bridge
  const transferTx = await ashContract.transfer(mumbaiBridgeAddress, amount);

  await transferTx.wait();

  const balance = await ashContract.balanceOf(mumbaiBridgeAddress);

  console.log(
    "Balance of bridge: ",
    ethers.utils.formatEther(balance) + " ASH"
  );

  // Initiate transaction in m\umbai
  const initiateTx = await bridgeMumbai.initiateTransfer(
    walletMumbai.address,
    5,
    amount,
    "Aimen Sahnoun",
    "ASH"
  );

  await initiateTx.wait();

  const mumbaiTxHash = initiateTx.hash;

  console.log("Mumbai Tx Hash: ", mumbaiTxHash);
  
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
