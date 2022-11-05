import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";

import { WERC20Factory } from "../typechain";

describe("Testing Wrapper ERC20 Contract", function () {
  let factory: WERC20Factory;
  let accounts: SignerWithAddress[] = [];

  beforeEach(async function () {
    accounts = await ethers.getSigners();
    const WERC20Factory = await ethers.getContractFactory("WERC20Factory");
    factory = (await WERC20Factory.deploy()) as WERC20Factory;
    await factory.deployed();
  });


});
