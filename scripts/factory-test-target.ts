import hre, { ethers } from "hardhat";

import bridgeLibrary from "../artifacts/contracts/Bridge.sol/Bridge.json";
import erc20 from "../artifacts/contracts/WERC20.sol/WrapperToken.json";
import { Bridge, ERC20 } from "../typechain";

async function main() {


  const providerGoerli = new ethers.providers.JsonRpcProvider(
    process.env.ALCHEMY_GOERELI_KEY as string
  );

 

  const walletGoerli = new ethers.Wallet(
    process.env.PRIVATE_KEY as string,
    providerGoerli
  );

  const amount = ethers.utils.parseEther("1");

  const GoerliBalance = await walletGoerli.getBalance();

  console.log("Goerli Balance: ", ethers.utils.formatEther(GoerliBalance));

  //   Get contract from address
  const goreliBridgeAddress = "0xC3d150B3B6B7921761A30ad8145c5A5292aa9dA7";


  const bridgeGoreli = new ethers.Contract(
    goreliBridgeAddress,
    bridgeLibrary.abi,
    walletGoerli
  );

  
  // Start minting in Goerli
  const mintTx = await bridgeGoreli.mintToken(
    "ASH",
    "Aimen Sahnoun",
    walletGoerli.address,
    amount
  )

  await mintTx.wait();

  console.log("Goerli Tx Hash: ", mintTx.hash);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
