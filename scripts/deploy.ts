import { ethers } from "hardhat";

async function main() {
  const BridgeFactory = await ethers.getContractFactory("Bridge");
  const Bridge = await BridgeFactory.deploy();

  await Bridge.deployed();

  console.log("Bridge deployed to:", Bridge.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
