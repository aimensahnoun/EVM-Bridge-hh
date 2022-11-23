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
          100
        )
      ).to.be.revertedWithCustomError(bridge, "Bridge__ZeroAddressProvided");
    });

    it("Should revert if token is a zero address", async () => {
      await expect(
        bridge.initiateTransfer(
          accounts[0].address,
          ethers.constants.AddressZero,
          5,
          100
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
        bridge.initiateTransfer(accounts[0].address, testErc20Address, 5, 0)
      ).to.be.revertedWithCustomError(bridge, "Bridge__FundsCannotBeZero");
    });

    it("Should revert user does not approve transferFrom", async () => {
      const testErc20 = await ethers.getContractAt(
        "WrapperToken",
        testErc20Address
      );
      await factory.mint("TST", accounts[0].address, 1000);

      await expect(
        bridge.initiateTransfer(accounts[0].address, testErc20Address, 5, 100)
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
          100
        )
      ).to.emit(bridge, "TransferInitiated");
    });

    it("Should transfer funds to bridge using permit and emit event", async () => {
      // use signERC2612Permit to sign the permit
      const testErc20 = await ethers.getContractAt(
        "WrapperToken",
        testErc20Address
      );
      await factory.mint("TST", accounts[0].address, 1000);

      const deadline = ethers.constants.MaxUint256;

      const spender = bridge.address;
      const value = 100;

      const [nonce, name, version] = await Promise.all([
        testErc20.nonces(accounts[0].address),
        testErc20.name(),
        "1",
        accounts[0].getChainId(),
      ]);

      const chainId = hre.network.config.chainId;

      const { v, r, s } = ethers.utils.splitSignature(
        await accounts[0]._signTypedData(
          {
            name,
            version,
            chainId,
            verifyingContract: testErc20Address,
          },
          {
            Permit: [
              {
                name: "owner",
                type: "address",
              },
              {
                name: "spender",
                type: "address",
              },
              {
                name: "value",
                type: "uint256",
              },
              {
                name: "nonce",
                type: "uint256",
              },
              {
                name: "deadline",
                type: "uint256",
              },
            ],
          },
          {
            owner: accounts[0].address,
            spender,
            value,
            nonce,
            deadline,
          }
        )
      );

      await expect(
        bridge.initiateTransferWithPermit(
          accounts[0].address,
          testErc20Address,
          8001,
          100,
          deadline,
          v,
          r,
          s
        )
      ).to.emit(bridge, "TransferInitiated");

      // Expect bridge to have 100 tokens
      // Expect user to have 900 tokens

      expect(await testErc20.balanceOf(bridge.address)).to.equal(100);

      expect(await testErc20.balanceOf(accounts[0].address)).to.equal(900);
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

    it("Should revert if Symbol is an empty string", async () => {
      await expect(
        bridge.mintToken(
          "",
          "TestToken",
          accounts[0].address,
          testErc20Address,
          100
        )
      ).to.be.revertedWithCustomError(bridge, "Bridge__TokenSymbolEmpty");
    });

    it("Should revert if Name is an empty string", async () => {
      await expect(
        bridge.mintToken("TST", "", accounts[0].address, testErc20Address, 100)
      ).to.be.revertedWithCustomError(bridge, "Bridge__TokenNameEmpty");
    });

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

    it("Should revert if user is a zero address (PERMIT)", async () => {
      await bridge.mintToken(
        "TST",
        "TestToken",
        accounts[0].address,
        testErc20Address,
        100
      );

      const deadline = ethers.constants.MaxUint256;

      const spender = bridge.address;
      const value = 100;

      const testErc20 = await ethers.getContractAt(
        "WrapperToken",
        testErc20Address
      );

      const [nonce, name, version] = await Promise.all([
        testErc20.nonces(accounts[0].address),
        testErc20.name(),
        "1",
        accounts[0].getChainId(),
      ]);

      const chainId = hre.network.config.chainId;

      const { v, r, s } = ethers.utils.splitSignature(
        await accounts[0]._signTypedData(
          {
            name,
            version,
            chainId,
            verifyingContract: testErc20Address,
          },
          {
            Permit: [
              {
                name: "owner",
                type: "address",
              },
              {
                name: "spender",
                type: "address",
              },
              {
                name: "value",
                type: "uint256",
              },
              {
                name: "nonce",
                type: "uint256",
              },
              {
                name: "deadline",
                type: "uint256",
              },
            ],
          },
          {
            owner: accounts[0].address,
            spender,
            value,
            nonce,
            deadline,
          }
        )
      );

      await expect(
        bridge.burnWrappedTokenWithPermit(
          "TST",
          100,
          ethers.constants.AddressZero,
          deadline,
          v,
          r,
          s
        )
      ).to.be.revertedWithCustomError(bridge, "Bridge__ZeroAddressProvided");
    });

    it("Should revert if amount is zero (PERMIT)", async () => {
      await bridge.mintToken(
        "TST",
        "WrapperToken",
        accounts[0].address,
        testErc20Address,
        100
      );

      const deadline = ethers.constants.MaxUint256;

      const spender = bridge.address;
      const value = 100;

      const testErc20 = await ethers.getContractAt(
        "WrapperToken",
        testErc20Address
      );

      const [nonce, name, version] = await Promise.all([
        testErc20.nonces(accounts[0].address),
        testErc20.name(),
        "1",
        accounts[0].getChainId(),
      ]);

      const chainId = hre.network.config.chainId;

      const { v, r, s } = ethers.utils.splitSignature(
        await accounts[0]._signTypedData(
          {
            name,
            version,
            chainId,
            verifyingContract: testErc20Address,
          },
          {
            Permit: [
              {
                name: "owner",
                type: "address",
              },
              {
                name: "spender",
                type: "address",
              },
              {
                name: "value",
                type: "uint256",
              },
              {
                name: "nonce",
                type: "uint256",
              },
              {
                name: "deadline",
                type: "uint256",
              },
            ],
          },
          {
            owner: accounts[0].address,
            spender,
            value,
            nonce,
            deadline,
          }
        )
      );

      await expect(
        bridge.burnWrappedTokenWithPermit(
          "TST",
          0,
          accounts[0].address,
          deadline,
          v,
          r,
          s
        )
      ).to.be.revertedWithCustomError(bridge, "Bridge__FundsCannotBeZero");
    });

    it("Should revert if symbol is empty (PERMIT)", async () => {
      await bridge.mintToken(
        "TST",
        "WrapperToken",
        accounts[0].address,
        testErc20Address,
        100
      );

      const deadline = ethers.constants.MaxUint256;

      const spender = bridge.address;
      const value = 100;

      const testErc20 = await ethers.getContractAt(
        "WrapperToken",
        testErc20Address
      );

      const [nonce, name, version] = await Promise.all([
        testErc20.nonces(accounts[0].address),
        testErc20.name(),
        "1",
        accounts[0].getChainId(),
      ]);

      const chainId = hre.network.config.chainId;

      const { v, r, s } = ethers.utils.splitSignature(
        await accounts[0]._signTypedData(
          {
            name,
            version,
            chainId,
            verifyingContract: testErc20Address,
          },
          {
            Permit: [
              {
                name: "owner",
                type: "address",
              },
              {
                name: "spender",
                type: "address",
              },
              {
                name: "value",
                type: "uint256",
              },
              {
                name: "nonce",
                type: "uint256",
              },
              {
                name: "deadline",
                type: "uint256",
              },
            ],
          },
          {
            owner: accounts[0].address,
            spender,
            value,
            nonce,
            deadline,
          }
        )
      );

      await expect(
        bridge.burnWrappedTokenWithPermit(
          "",
          100,
          accounts[0].address,
          deadline,
          v,
          r,
          s
        )
      ).to.be.revertedWithCustomError(bridge, "Bridge__TokenSymbolEmpty");
    });

    it("Should revert if token does not exist (PERMIT)", async () => {
      const deadline = ethers.constants.MaxUint256;

      const spender = bridge.address;
      const value = 100;

      const testErc20 = await ethers.getContractAt(
        "WrapperToken",
        testErc20Address
      );

      const [nonce, name, version] = await Promise.all([
        testErc20.nonces(accounts[0].address),
        testErc20.name(),
        "1",
        accounts[0].getChainId(),
      ]);

      const chainId = hre.network.config.chainId;

      const { v, r, s } = ethers.utils.splitSignature(
        await accounts[0]._signTypedData(
          {
            name,
            version,
            chainId,
            verifyingContract: testErc20Address,
          },
          {
            Permit: [
              {
                name: "owner",
                type: "address",
              },
              {
                name: "spender",
                type: "address",
              },
              {
                name: "value",
                type: "uint256",
              },
              {
                name: "nonce",
                type: "uint256",
              },
              {
                name: "deadline",
                type: "uint256",
              },
            ],
          },
          {
            owner: accounts[0].address,
            spender,
            value,
            nonce,
            deadline,
          }
        )
      );

      await expect(
        bridge.burnWrappedTokenWithPermit(
          "WTST",
          100,
          accounts[0].address,
          deadline,
          v,
          r,
          s
        )
      ).to.be.revertedWithCustomError(bridge, "Bridge__WrapTokenDoesNotExist");
    });

    it("Should revert if user does not have enough tokens (PERMIT)", async () => {
      await bridge.mintToken(
        "TST",
        "TestToken",
        accounts[0].address,
        testErc20Address,
        100
      );

      const deadline = ethers.constants.MaxUint256;

      const spender = bridge.address;
      const value = 100;

      const testErc20 = await ethers.getContractAt(
        "WrapperToken",
        testErc20Address
      );

      const [nonce, name, version] = await Promise.all([
        testErc20.nonces(accounts[0].address),
        testErc20.name(),
        "1",
        accounts[0].getChainId(),
      ]);

      const chainId = hre.network.config.chainId;

      const { v, r, s } = ethers.utils.splitSignature(
        await accounts[0]._signTypedData(
          {
            name,
            version,
            chainId,
            verifyingContract: testErc20Address,
          },
          {
            Permit: [
              {
                name: "owner",
                type: "address",
              },
              {
                name: "spender",
                type: "address",
              },
              {
                name: "value",
                type: "uint256",
              },
              {
                name: "nonce",
                type: "uint256",
              },
              {
                name: "deadline",
                type: "uint256",
              },
            ],
          },
          {
            owner: accounts[0].address,
            spender,
            value,
            nonce,
            deadline,
          }
        )
      );

      await expect(
        bridge.burnWrappedTokenWithPermit(
          "WTST",
          1000,
          accounts[0].address,
          deadline,
          v,
          r,
          s
        )
      ).to.be.revertedWithCustomError(bridge, "Bridge__InsufficientBalance");
    });

    it("Should burn tokens with permit and emit event", async () => {
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

      const deadline = ethers.constants.MaxUint256;

      const spender = bridgeFactoryAddress;
      const value = 100;

      const [nonce, name, version] = await Promise.all([
        werc20.nonces(accounts[0].address),
        werc20.name(),
        "1",
        accounts[0].getChainId(),
      ]);

      const chainId = hre.network.config.chainId;

      const { v, r, s } = ethers.utils.splitSignature(
        await accounts[0]._signTypedData(
          {
            name,
            version,
            chainId,
            verifyingContract: werc20Address,
          },
          {
            Permit: [
              {
                name: "owner",
                type: "address",
              },
              {
                name: "spender",
                type: "address",
              },
              {
                name: "value",
                type: "uint256",
              },
              {
                name: "nonce",
                type: "uint256",
              },
              {
                name: "deadline",
                type: "uint256",
              },
            ],
          },
          {
            owner: accounts[0].address,
            spender,
            value,
            nonce,
            deadline,
          }
        )
      );

      await expect(
        bridge.burnWrappedTokenWithPermit(
          "WTST",
          100,
          accounts[0].address,
          deadline,
          v,
          r,
          s
        )
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
        1000
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
      ).to.emit(bridge, "UnWrappedToken");

      const bridgeBalanceAfter = await testErc20.balanceOf(bridge.address);
      const userBalanceAfter = await testErc20.balanceOf(accounts[0].address);

      expect(bridgeBalanceAfter).to.equal(
        parseInt(bridgeBalance.toString()) - 100
      );
      expect(userBalanceAfter).to.equal(parseInt(userBalance.toString()) + 100);
    });
  });

  describe("Manage fee", () => {
    it("should be able to get the fee", async () => {
      const fee = await bridge.fee();

      expect(fee).to.not.equal(0);
    });

    it("should revert if not admin tries to set fee", async () => {
      await expect(
        bridge.connect(accounts[1]).setFee(100)
      ).to.be.revertedWithCustomError(
        bridge,
        "Bridge__NotAllowedToDoThisAction"
      );
    });

    it("should be able to set fee", async () => {
      await bridge.setFee(100);

      const fee = await bridge.fee();

      expect(fee).to.equal(100);
    });
  });
});
