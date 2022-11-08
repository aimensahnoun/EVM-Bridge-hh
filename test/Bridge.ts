import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { Contract } from "ethers";
import hre, { artifacts, ethers, network } from "hardhat";

import { Bridge, WERC20Factory, WrapperToken } from "../typechain";

describe("Testing Bridge Contract", function () {
  let bridge: Bridge;
  let factory: WERC20Factory;
  let testErc20Address: string;
  let accounts: SignerWithAddress[] = [];
  hre.run("compile");

  beforeEach(async function () {
    accounts = await ethers.getSigners();
    const BridgeFactory = await ethers.getContractFactory("Bridge");
    const WERC20Factory = await ethers.getContractFactory("WERC20Factory");
    bridge = (await BridgeFactory.deploy()) as Bridge;

    const relayerBytes = await bridge.RELAYER();
    const tx1 = await bridge.grantRole(relayerBytes, accounts[0].address);
    await tx1.wait();

    factory = (await WERC20Factory.deploy()) as WERC20Factory;
    const tx = await factory.createWERC20("Test", "TST");
    await tx.wait();
    testErc20Address = await factory.getWERC20("TST");
    await bridge.deployed();
  });

  describe("Initiate Transfer", () => {
    it("Should revert if user is a zero address", async () => {
      await expect(
        bridge.initiateTransfer(
          ethers.constants.AddressZero,
          testErc20Address,
          5,
          100,
          "Token Name",
          "Token Symbol"
        )
      ).to.be.revertedWithCustomError(bridge, "Bridge__ZeroAddressProvided");
    });

    it("Should revert if token is a zero address", async () => {
      await expect(
        bridge.initiateTransfer(
          accounts[0].address,
          ethers.constants.AddressZero,
          5,
          100,
          "Token Name",
          "Token Symbol"
        )
      ).to.be.revertedWithCustomError(bridge, "Bridge__ZeroAddressProvided");
    });

    it("Should revert if amount is zero", async () => {
      const testErc20 = await ethers.getContractAt(
        "WrapperToken",
        testErc20Address
      );
      await factory.mint("TST", accounts[0].address, 1000);

      await testErc20.approve(bridge.address, 100);

      await expect(
        bridge.initiateTransfer(
          accounts[0].address,
          testErc20Address,
          5,
          0,
          "Token Name",
          "Token Symbol"
        )
      ).to.be.revertedWithCustomError(bridge, "Bridge__FundsCannotBeZero");
    });

    it("Should revert user does not approve transferFrom", async () => {
      const testErc20 = await ethers.getContractAt(
        "WrapperToken",
        testErc20Address
      );
      await factory.mint("TST", accounts[0].address, 1000);

      await expect(
        bridge.initiateTransfer(
          accounts[0].address,
          testErc20Address,
          5,
          100,
          "Token Name",
          "Token Symbol"
        )
      ).to.be.revertedWith("ERC20: insufficient allowance");
    });

    it("Should transfer funds to bridge and emit event", async () => {
      const testErc20 = await ethers.getContractAt(
        "WrapperToken",
        testErc20Address
      );
      await factory.mint("TST", accounts[0].address, 1000);

      await testErc20.approve(bridge.address, 100);

      await expect(
        bridge.initiateTransfer(
          accounts[0].address,
          testErc20Address,
          8001,
          100,
          "TestToken",
          "TST"
        )
      ).to.emit(bridge, "TransferInitiated");
    });
  });

  describe("Mint token", async () => {
    it("Should revert if user is a zero address", async () => {
      await expect(
        bridge.mintToken(
          "TST",
          "TestToken",
          ethers.constants.AddressZero,
          testErc20Address,
          100
        )
      ).to.be.revertedWithCustomError(bridge, "Bridge__ZeroAddressProvided");
    });

    it("Should revert if token is a zero address", async () => {
      await expect(
        bridge.mintToken(
          "TST",
          "TestToken",
          accounts[0].address,
          ethers.constants.AddressZero,
          100
        )
      ).to.be.revertedWithCustomError(bridge, "Bridge__ZeroAddressProvided");
    });

    it("Should revert if amount is zero", async () => {
      await expect(
        bridge.mintToken(
          "TST",
          "TestToken",
          accounts[0].address,
          testErc20Address,
          0
        )
      ).to.be.revertedWithCustomError(bridge, "Bridge__FundsCannotBeZero");
    });

    it("Should revert if Symbol is an empty string" , async () => {
      await expect(
        bridge.mintToken(
          "",
          "TestToken",
          accounts[0].address,
          testErc20Address,
          100
        )
      ).to.be.revertedWithCustomError(bridge, "Bridge__TokenSymbolEmpty");
    })

    it("Should revert if Name is an empty string" , async () => {
      await expect(
        bridge.mintToken(
          "TST",
          "",
          accounts[0].address,
          testErc20Address,
          100
        )
      ).to.be.revertedWithCustomError(bridge, "Bridge__TokenNameEmpty");
    })

    it("Should revert if called by non-relayer", async () => {
      await expect(
        bridge
          .connect(accounts[1])
          .mintToken(
            "TST",
            "TestToken",
            accounts[0].address,
            testErc20Address,
            100
          )
      ).to.be.revertedWithCustomError(
        bridge,
        "Bridge__NotAllowedToDoThisAction"
      );
    });

    it("Should mint token and emit event", async () => {
      await expect(
        bridge.mintToken(
          "TST",
          "TestToken",
          accounts[0].address,
          testErc20Address,
          100
        )
      ).to.emit(bridge, "TransferCompleted");

      const bridgeFactoryAddress = await bridge.factory();

      const bridgeFactory = await ethers.getContractAt(
        "WERC20Factory",
        bridgeFactoryAddress
      );

      const bridgeBalance = await bridgeFactory.balanceOf(
        "WTST",
        accounts[0].address
      );

      expect(bridgeBalance).to.equal(100);
    });
  });

  describe("Burn Wrapped Token", () => {
    it("Should revert if user is a zero address", async () => {
      await expect(
        bridge.burnWrappedToken("TST", 100, ethers.constants.AddressZero)
      ).to.be.revertedWithCustomError(bridge, "Bridge__ZeroAddressProvided");
    });

    it("Should revert if amount is zero", async () => {
      await expect(
        bridge.burnWrappedToken("TST", 0, accounts[0].address)
      ).to.be.revertedWithCustomError(bridge, "Bridge__FundsCannotBeZero");
    });

    it("Should revert if symbol is empty", async () => {
      await expect(
        bridge.burnWrappedToken("", 100, accounts[0].address)
      ).to.be.revertedWithCustomError(bridge, "Bridge__TokenSymbolEmpty");
    });

    it("Should revert if token does not exist", async () => {
      await expect(
        bridge.burnWrappedToken("WTST", 100, accounts[0].address)
      ).to.be.revertedWithCustomError(bridge, "Bridge__WrapTokenDoesNotExist");
    });

    it("Should revert if user does not have enough tokens", async () => {
      await bridge.mintToken(
        "TST",
        "TestToken",
        accounts[1].address,
        testErc20Address,
        100
      );

      await expect(
        bridge.burnWrappedToken("WTST", 100, accounts[0].address)
      ).to.be.revertedWithCustomError(bridge, "Bridge__InsufficientBalance");
    });

    it("Should burn tokens and emit event", async () => {
      await bridge.mintToken(
        "TST",
        "TestToken",
        accounts[0].address,
        testErc20Address,
        100
      );

      const bridgeFactoryAddress = await bridge.factory();

      const bridgeFactory = await ethers.getContractAt(
        "WERC20Factory",
        bridgeFactoryAddress
      );

      const werc20Address = await bridgeFactory.getWERC20("WTST");

      const werc20 = await ethers.getContractAt("WrapperToken", werc20Address);

      await werc20.approve(bridgeFactoryAddress, 100);

      await expect(
        bridge.burnWrappedToken("WTST", 100, accounts[0].address)
      ).to.emit(bridge, "BurnedToken");

      const userBalance = await werc20.balanceOf(accounts[0].address);

      expect(userBalance).to.equal(0);
    });
  });

  describe("Unwrap Token", async () => {
    it("Should revert if user is a zero address", async () => {
      await expect(
        bridge.unWrapToken(ethers.constants.AddressZero, testErc20Address, 100)
      ).to.be.revertedWithCustomError(bridge, "Bridge__ZeroAddressProvided");
    });

    it("Should revert if token is a zero address", async () => {
      await expect(
        bridge.unWrapToken(
          accounts[0].address,
          ethers.constants.AddressZero,
          100
        )
      ).to.be.revertedWithCustomError(bridge, "Bridge__ZeroAddressProvided");
    });

    it("Should revert if amount is zero", async () => {
      await expect(
        bridge.unWrapToken(accounts[0].address, testErc20Address, 0)
      ).to.be.revertedWithCustomError(bridge, "Bridge__FundsCannotBeZero");
    });

    it("Should transfer tokens to user", async () => {
      await factory.mint("TST", accounts[0].address, 10000);

      // Get contract at
      const testErc20 = await ethers.getContractAt(
        "WrapperToken",
        testErc20Address
      );

      // Approve
      await testErc20.approve(bridge.address, 1000);

      await bridge.initiateTransfer(
        accounts[0].address,
        testErc20Address,
        5,
        1000,
        "TST",
        "TST"
      );

      await bridge.mintToken(
        "TST",
        "TestToken",
        accounts[0].address,
        testErc20Address,
        1000
      );


      const bridgeBalance = await testErc20.balanceOf(bridge.address);
      const userBalance = await testErc20.balanceOf(accounts[0].address);

      console.log("bridgeBalance", bridgeBalance.toString());

      await expect(
        bridge.unWrapToken(accounts[0].address, testErc20Address, 100)
      ).to.emit(bridge, "UwrappedToken");

      const bridgeBalanceAfter = await testErc20.balanceOf(bridge.address);
      const userBalanceAfter = await testErc20.balanceOf(accounts[0].address);

      expect(bridgeBalanceAfter).to.equal(
        parseInt(bridgeBalance.toString()) - 100
      );
      expect(userBalanceAfter).to.equal(parseInt(userBalance.toString()) + 100);
    });
  });
});
