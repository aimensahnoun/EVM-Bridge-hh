import { ethers } from "hardhat";

async function main() {


  const ERC20Factory = await ethers.getContractFactory("Bridge");
  const ERC20 = await ERC20Factory.deploy();

  await ERC20.deployed();

  console.log("WERC20Factory deployed to:", ERC20.address);

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
