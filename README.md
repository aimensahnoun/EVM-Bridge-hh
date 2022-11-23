
![Logo](https://user-images.githubusercontent.com/62159014/202256101-c48303cb-9149-4e74-bee8-aceb67254bf2.png)


# AimBridge Smart Contracts

AimBridge is a proof of concept for a EVM token-bridge developed that uses OpenZeppelin Defender in order to manage the transactions between two networks.

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)  ![Lines of code](https://img.shields.io/tokei/lines/github/aimensahnoun/EVM-Bridge-hh) ![GitHub top language](https://img.shields.io/github/languages/top/aimensahnoun/EVM-Bridge-hh)


## Smart Contracts

The project is made up of a total of three smart contracts: 
- **WERC20**: an ERC20 contract that allows for creation and minting of new tokens
- **Wrapper Tokan Factory**: a factory smart contract that manages all of the created `ERC20` tokens as well as hold some functionality.
- **Bridge** : Holds the main functionlity for transfering tokens between netowks by using an implementation of the `Factory contract`.

### WERC20

The `WERC20` contract etends `OpenZeppelin ERC20` contracts directly and does not have any extra implementation on top of that.

### Factory 

The `Factory` contract is a way create and manage `WERC20` tokens, it has methods to `create` , `mint`, `burn` as well as get the `balance` of a user.

These methods were created in order to add an extra layer of validation and a different way to access the tokens.

#### Methods 

```
createWERC20
```

Method for creating a new ERC20 token.

| Parameter   | Type        | Description   |
| :---        |    :----:   |:------------------------- |
| `name`      | `string`       | The full length name of the token ex: AimBridge Token   |
| `symbol`   | `string`        | The symbol for the token ex: AIM     |


```
getWERC20
```

Method for getting an address of an ERC20 token.

| Parameter   | Type        | Description   |
| :---        |    :----:   |:------------------------- |
| `symbol`   | `string`        | The symbol for the token ex: AIM     |


```
mint
```

Method for minting a certian amount of a token.

| Parameter   | Type        | Description   |
| :---        |    :----:   |:------------------------- |
| `symbol`   | `string`        | The symbol for the token ex: AIM     |
| `to`   | `address`        | The address of the recipient of the token     |
| `amount`   | `uint256`        | The amount of tokens to be minted


```
BalanceOf
```

 Method for getting the balance of a user on a certain ERC20.

| Parameter   | Type        | Description   |
| :---        |    :----:   |:------------------------- |
| `symbol`   | `string`        | The symbol for the token ex: AIM     |
| `account`   | `address`        | The address of the holder of the token     |

```
myBalanceOf
```

Method for getting the caller's balance for a certain ERC20.

| Parameter   | Type        | Description   |
| :---        |    :----:   |:------------------------- |
| `symbol`   | `string`        | The symbol for the token ex: AIM     |

```
burn
```

Method for burning a certain amount of token.

| Parameter   | Type        | Description   |
| :---        |    :----:   |:------------------------- |
| `tokenAddress`   | `address`        | The address of a token to be burned     |
| `from`   | `address`        | The address of the holder of tokens to be burned    |
| `amount`   | uint256        | Amount of tokens to be burned     |

```
burnWithPermit
```

Method for burning a certain amount of token with permits.

| Parameter   | Type        | Description   |
| :---        |    :----:   |:------------------------- |
| `tokenAddress`   | `address`        | The address of a token to be burned     |
| `from`   | `address`        | The address of the holder of tokens to be burned    |
| `amount`   | `uint256`        | Amount of tokens to be burned     |
| `deadline`   | `uint256`        | Deadline for the permit     |
| `v`   | `uint8`        | Signature element     |
| `r`   | `byte32`        | Signature element     |
| `s`   | `byte32`        | Signature element     |




### Bridge

The bridge contract works in connection with the `Factory` contract to provide the functionality for transfering the token between networks

#### Methods 

```
initiateTransfer
```

This method is responsible for starting the transfer and locking the native token onto the source network bridge contract.

| Parameter   | Type        | Description   |
| :---        |    :----:   |:------------------------- |
| `user`      | `address`       | The address of the user that initiated the transfer   |
| `tokenAddress`   | `address`        | The address of the native token token that is being bridged     |
| `targetChainId`   | `uint256`        | The ID of the network the token is being bridged to, ex: Goerli = 5| 
| `amount`   | `uint256`        | The amount of the token being bridged    |

```
initiateTransferWithPermit
```

This method is responsible for starting the transfer and locking the native token onto the source network bridge contract but implements permit to avoid using the approval method.

| Parameter   | Type        | Description   |
| :---        |    :----:   |:------------------------- |
| `user`      | `address`       | The address of the user that initiated the transfer   |
| `tokenAddress`   | `address`        | The address of the native token token that is being bridged     |
| `targetChainId`   | `uint256`        | The ID of the network the token is being bridged to, ex: Goerli = 5| 
| `amount`   | `uint256`        | The amount of the token being bridged    |
| `deadline`   | `uint256`        | Deadline for the permit     |
| `v`   | `uint8`        | Signature element     |
| `r`   | `byte32`        | Signature element     |
| `s`   | `byte32`        | Signature element     |

```
mintToken
```

This method is called on the target network after the transfer is initiated in order to mint an equivalent amount of token on the target network.

| Parameter   | Type        | Description   |
| :---        |    :----:   |:------------------------- |
| `symbol`   | `string`        | The symbol for the token ex: AIM     |
| `tokenName`      | `string`       | The full length name of the token ex: AimBridge Token   |
| `to`      | `address`       | The address of the recipient of the newly minted token   |
| `tokenAddress`   | `address`        | The address of the native token token that is being bridged     |
| `amount`   | `uint256`        | The amount of the token being bridged    |

```
burnWrappedToken
```

This method burns the user's wrapped tokens, in preperation for releasing the native token on the original network.

| Parameter   | Type        | Description   |
| :---        |    :----:   |:------------------------- |
| `symbol`   | `string`        | The symbol for the token ex: AIM     |
| `amount`   | `uint256`        | The amount of the token being bridged    |
| `user`      | `address`       | The address of the user that is burning the tokens   |

```
burnWrappedTokenWithPermit
```

This method burns the user's wrapped tokens, in preperation for releasing the native token on the original network but with Permits.

| Parameter   | Type        | Description   |
| :---        |    :----:   |:------------------------- |
| `symbol`   | `string`        | The symbol for the token ex: AIM     |
| `amount`   | `uint256`        | The amount of the token being bridged    |
| `user`      | `address`       | The address of the user that is burning the tokens   |
| `deadline`   | `uint256`        | Deadline for the permit     |
| `v`   | `uint8`        | Signature element     |
| `r`   | `byte32`        | Signature element     |
| `s`   | `byte32`        | Signature element     |

```
unWrapToken
```

This method releases native tokens on the original network

| Parameter   | Type        | Description   |
| :---        |    :----:   |:------------------------- |
| `to`      | `address`       | The address of the recipient of the native token   |
| `nativeTokenAddress`   | `address`        | The address of the native token     |
| `amount`   | `uint256`        | The amount of the token being bridged    |


```
setFee
```

A method for the admin to change the bridge fee. defaults to 0.001 ETH.

| Parameter   | Type        | Description   |
| :---        |    :----:   |:------------------------- |
| `fee`      | `uint256`       | The new fee amount for the bridge.   |






## Environment Variables
```
# Wallet Private Key
PRIVATE_KEY=

# Mumbai RPC URL 
MUMBAI_RPC_URL=

#Polyscan API key
POLYSCAN=EWTP38N28M3XSPESIIAW293Y2DCGTXCZWH

#Alchemy API key
ALCHEMY_API_KEY=

#Alchemy Goerli http url
ALCHEMY_GOERELI_KEY=

```
## Run Locally

Clone the project

```bash

git clone https://github.com/aimensahnoun/EVM-Bridge-hh

```

Go to the project directory

```bash

cd my-project

```

Install dependencies

```bash

npm install

  

#or

  

yarn install

```

## Running Tests

To run tests, run the following command

```bash

hardhat test

```

To coverage tests, run the following command

```bash

hardhat coverage

```

![Coverage](https://user-images.githubusercontent.com/62159014/202426569-9ef7627f-2f8a-4b24-b172-dd5014336b00.png)

## Deployment
To deploy this project run

```bash

hh run --network NETWORK scripts/deploy.ts

```

```
📦 
├─ .gitignore
├─ README.md
├─ contracts
│  ├─ Bridge.sol
│  ├─ WERC20.sol
│  └─ WERC20Factory.sol
├─ hardhat.config.ts
├─ package-lock.json
├─ package.json
├─ scripts
│  ├─ autotasker-script.js
│  ├─ deploy.ts
│  ├─ factory-test-source.ts
│  └─ factory-test-target.ts
├─ test
│  ├─ Bridge.ts
│  ├─ WERC20.ts
│  └─ WERC20Factory.ts
├─ tsconfig.json
└─ yarn.lock
```
