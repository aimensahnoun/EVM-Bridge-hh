import hre, { ethers } from "hardhat";

import bridgeLibrary from "../artifacts/contracts/Bridge.sol/Bridge.json";
import erc20 from "../artifacts/contracts/WERC20.sol/WrapperToken.json";

import axios from "axios";

const amount = ethers.utils.parseEther("25");

let name: string;
let symbol: string;

const targetAddress = "0x58bC544C284cCF8f95Ee2BadCb0E56203D7cE674";

async function main() {
  const providerMumbai = new ethers.providers.JsonRpcProvider(
    process.env.MUMBAI_RPC_URL as string
  );

  const walletMumbai = new ethers.Wallet(
    process.env.PRIVATE_KEY as string,
    providerMumbai
  );

  const MumbaiBalance = await walletMumbai.getBalance();

  console.log("Mumbai Balance: ", ethers.utils.formatEther(MumbaiBalance));

  //   Get contract from address
  const mumbaiBridgeAddress = "0xb50676dF038AFFE12373394D112e89DE28e7b7e3";

  const bridgeMumbai = new ethers.Contract(
    mumbaiBridgeAddress,
    bridgeLibrary.abi,
    walletMumbai
  );

  const erc20Address = "0x82dC256Ff60f33c84d17323544909B765103ec21";

  const erc20Contract = new ethers.Contract(
    erc20Address,
    erc20.abi,
    walletMumbai
  );

  // transfering token to bridge
  const transferTx = await erc20Contract.transfer(mumbaiBridgeAddress, amount);

  await transferTx.wait();

  const balance = await erc20Contract.balanceOf(mumbaiBridgeAddress);

  const erc20Name = await erc20Contract.name();
  const erc20Symbol = await erc20Contract.symbol();

  console.log("ERC20 Name: ", erc20Name);
  console.log("ERC20 Symbol: ", erc20Symbol);

  name = erc20Name;
  symbol = erc20Symbol;

  console.log(
    "Balance of bridge: ",
    ethers.utils.formatEther(balance) + " ASH"
  );

  // Initiate transaction in m\umbai
  const initiateTx = await bridgeMumbai.initiateTransfer(
    walletMumbai.address,
    erc20Address,
    5,
    amount,
    erc20Name,
    erc20Symbol
  );

  await initiateTx.wait();

  const mumbaiTxHash = initiateTx.hash;

  console.log("Mumbai Tx Hash: ", mumbaiTxHash);
}
main()
  .then(async () => {
    // This method would run after the initiateTransfer event would be recieved
    const result = await axios.post(
      "WEBHOOK_URL",
      {
        symbol: symbol,
        tokenName: name,
        amount: amount,
        to: "0x93da76CFc683E1536C91d37abcfE17a60c29B578",
        contractAddress: targetAddress,
      }
    );

    console.log(result.data);
  })
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
