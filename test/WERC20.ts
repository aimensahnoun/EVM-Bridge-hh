import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import hre, { ethers } from "hardhat";

import { WrapperToken } from "../typechain";

describe("Testing Wrapper ERC20 Contract", function () {
  let wrapperToken: WrapperToken;
  let accounts: SignerWithAddress[] = [];
  hre.run("compile");

  beforeEach(async function () {
    accounts = await ethers.getSigners();
    const wrapperTokenFactory = await ethers.getContractFactory("WrapperToken");
    wrapperToken = (await wrapperTokenFactory.deploy(
      "Aimen Snoun",
      "AIM"
    )) as WrapperToken;
    await wrapperToken.deployed();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await wrapperToken.owner()).to.equal(accounts[0].address);
    });

    it("Should return the name and symbol of token", async function () {
      expect(await wrapperToken.name()).to.equal("Aimen Snoun");
      expect(await wrapperToken.symbol()).to.equal("AIM");
    });
  });

  describe("Minting", function () {
    it("Should mint tokens", async function () {
      await wrapperToken.mint(accounts[0].address, 100);
      expect(await wrapperToken.balanceOf(accounts[0].address)).to.equal(100);
    });

    it("Should not mint tokens if sender is not owner", async function () {
      await expect(
        wrapperToken.connect(accounts[1]).mint(accounts[1].address, 100)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });
});
