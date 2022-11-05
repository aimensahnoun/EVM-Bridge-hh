import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { Contract } from "ethers";
import { artifacts, ethers, network } from "hardhat";

import { Bridge } from "../typechain";

describe("Testing Bridge Contract", function () {
  let bridge: Bridge;
  let accounts: SignerWithAddress[] = [];

  beforeEach(async function () {
    accounts = await ethers.getSigners();
    const BrdigeFactory = await ethers.getContractFactory("Bridge");
    bridge = (await BrdigeFactory.deploy()) as Bridge;
    await bridge.deployed();
  });
});
