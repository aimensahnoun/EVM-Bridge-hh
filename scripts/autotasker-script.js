'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var ethers = require('defender-relay-client/lib/ethers');
var ethers$1 = require('ethers');
var crypto = require('crypto');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var crypto__default = /*#__PURE__*/_interopDefaultLegacy(crypto);

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

function __generator(thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
}

var BridgeContractABI = [
    {
        inputs: [],
        stateMutability: "nonpayable",
        type: "constructor"
    },
    {
        inputs: [],
        name: "Bridge__FundsCannotBeZero",
        type: "error"
    },
    {
        inputs: [],
        name: "Bridge__InsufficientBalance",
        type: "error"
    },
    {
        inputs: [],
        name: "Bridge__NotAllowedToDoThisAction",
        type: "error"
    },
    {
        inputs: [],
        name: "Bridge__TokenNameEmpty",
        type: "error"
    },
    {
        inputs: [],
        name: "Bridge__TokenSymbolEmpty",
        type: "error"
    },
    {
        inputs: [],
        name: "Bridge__TransferToBridgeFailed",
        type: "error"
    },
    {
        inputs: [],
        name: "Bridge__UnwrappingFailed",
        type: "error"
    },
    {
        inputs: [],
        name: "Bridge__WrapTokenDoesNotExist",
        type: "error"
    },
    {
        inputs: [],
        name: "Bridge__ZeroAddressProvided",
        type: "error"
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "user",
                type: "address"
            },
            {
                indexed: false,
                internalType: "address",
                name: "tokenAddress",
                type: "address"
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "amount",
                type: "uint256"
            },
            {
                indexed: true,
                internalType: "uint256",
                name: "chainId",
                type: "uint256"
            },
        ],
        name: "BurnedToken",
        type: "event"
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "bytes32",
                name: "role",
                type: "bytes32"
            },
            {
                indexed: true,
                internalType: "bytes32",
                name: "previousAdminRole",
                type: "bytes32"
            },
            {
                indexed: true,
                internalType: "bytes32",
                name: "newAdminRole",
                type: "bytes32"
            },
        ],
        name: "RoleAdminChanged",
        type: "event"
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "bytes32",
                name: "role",
                type: "bytes32"
            },
            {
                indexed: true,
                internalType: "address",
                name: "account",
                type: "address"
            },
            {
                indexed: true,
                internalType: "address",
                name: "sender",
                type: "address"
            },
        ],
        name: "RoleGranted",
        type: "event"
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "bytes32",
                name: "role",
                type: "bytes32"
            },
            {
                indexed: true,
                internalType: "address",
                name: "account",
                type: "address"
            },
            {
                indexed: true,
                internalType: "address",
                name: "sender",
                type: "address"
            },
        ],
        name: "RoleRevoked",
        type: "event"
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "user",
                type: "address"
            },
            {
                indexed: false,
                internalType: "address",
                name: "tokenAddress",
                type: "address"
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "amount",
                type: "uint256"
            },
            {
                indexed: true,
                internalType: "uint256",
                name: "chainId",
                type: "uint256"
            },
            {
                indexed: true,
                internalType: "string",
                name: "tokenSymbol",
                type: "string"
            },
            {
                indexed: false,
                internalType: "string",
                name: "tokenName",
                type: "string"
            },
        ],
        name: "TransferCompleted",
        type: "event"
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "user",
                type: "address"
            },
            {
                indexed: false,
                internalType: "address",
                name: "tokenAddress",
                type: "address"
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "sourceChainId",
                type: "uint256"
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "amount",
                type: "uint256"
            },
            {
                indexed: true,
                internalType: "uint256",
                name: "targetChainId",
                type: "uint256"
            },
            {
                indexed: true,
                internalType: "string",
                name: "tokenSymbol",
                type: "string"
            },
            {
                indexed: false,
                internalType: "string",
                name: "tokenName",
                type: "string"
            },
        ],
        name: "TransferInitiated",
        type: "event"
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "user",
                type: "address"
            },
            {
                indexed: false,
                internalType: "address",
                name: "nativeTokenAddress",
                type: "address"
            },
            {
                indexed: false,
                internalType: "address",
                name: "werc20Address",
                type: "address"
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "amount",
                type: "uint256"
            },
            {
                indexed: true,
                internalType: "uint256",
                name: "chainId",
                type: "uint256"
            },
        ],
        name: "UwrappedToken",
        type: "event"
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "tokenAddress",
                type: "address"
            },
            {
                indexed: true,
                internalType: "address",
                name: "to",
                type: "address"
            },
        ],
        name: "WithdrawToken",
        type: "event"
    },
    {
        inputs: [],
        name: "DEFAULT_ADMIN_ROLE",
        outputs: [
            {
                internalType: "bytes32",
                name: "",
                type: "bytes32"
            },
        ],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [],
        name: "RELAYER",
        outputs: [
            {
                internalType: "bytes32",
                name: "",
                type: "bytes32"
            },
        ],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "string",
                name: "_symbol",
                type: "string"
            },
            {
                internalType: "uint256",
                name: "_amount",
                type: "uint256"
            },
            {
                internalType: "address",
                name: "_user",
                type: "address"
            },
        ],
        name: "burnWrappedToken",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [],
        name: "factory",
        outputs: [
            {
                internalType: "contract WERC20Factory",
                name: "",
                type: "address"
            },
        ],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "bytes32",
                name: "role",
                type: "bytes32"
            },
        ],
        name: "getRoleAdmin",
        outputs: [
            {
                internalType: "bytes32",
                name: "",
                type: "bytes32"
            },
        ],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "bytes32",
                name: "role",
                type: "bytes32"
            },
            {
                internalType: "address",
                name: "account",
                type: "address"
            },
        ],
        name: "grantRole",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "bytes32",
                name: "role",
                type: "bytes32"
            },
            {
                internalType: "address",
                name: "account",
                type: "address"
            },
        ],
        name: "hasRole",
        outputs: [
            {
                internalType: "bool",
                name: "",
                type: "bool"
            },
        ],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "_user",
                type: "address"
            },
            {
                internalType: "address",
                name: "_tokenAddress",
                type: "address"
            },
            {
                internalType: "uint256",
                name: "_targetChainId",
                type: "uint256"
            },
            {
                internalType: "uint256",
                name: "_amount",
                type: "uint256"
            },
            {
                internalType: "string",
                name: "_tokenName",
                type: "string"
            },
            {
                internalType: "string",
                name: "_tokenSymbol",
                type: "string"
            },
        ],
        name: "initiateTransfer",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "string",
                name: "_symbol",
                type: "string"
            },
            {
                internalType: "string",
                name: "_tokenName",
                type: "string"
            },
            {
                internalType: "address",
                name: "_to",
                type: "address"
            },
            {
                internalType: "address",
                name: "_tokenAddress",
                type: "address"
            },
            {
                internalType: "uint256",
                name: "_amount",
                type: "uint256"
            },
        ],
        name: "mintToken",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "",
                type: "address"
            },
        ],
        name: "nativeToWrapped",
        outputs: [
            {
                internalType: "address",
                name: "",
                type: "address"
            },
        ],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "bytes32",
                name: "role",
                type: "bytes32"
            },
            {
                internalType: "address",
                name: "account",
                type: "address"
            },
        ],
        name: "renounceRole",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "bytes32",
                name: "role",
                type: "bytes32"
            },
            {
                internalType: "address",
                name: "account",
                type: "address"
            },
        ],
        name: "revokeRole",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "bytes4",
                name: "interfaceId",
                type: "bytes4"
            },
        ],
        name: "supportsInterface",
        outputs: [
            {
                internalType: "bool",
                name: "",
                type: "bool"
            },
        ],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "_to",
                type: "address"
            },
            {
                internalType: "address",
                name: "_tokenAddress",
                type: "address"
            },
            {
                internalType: "uint256",
                name: "_amount",
                type: "uint256"
            },
        ],
        name: "unWrapToken",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "_tokenAddress",
                type: "address"
            },
            {
                internalType: "address",
                name: "_to",
                type: "address"
            },
        ],
        name: "withdrawToken",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "",
                type: "address"
            },
        ],
        name: "wrappedToNative",
        outputs: [
            {
                internalType: "address",
                name: "",
                type: "address"
            },
        ],
        stateMutability: "view",
        type: "function"
    },
];
var encrypt = function (body, secret) {
    var encrypted = crypto__default["default"]
        .createHash("sha256")
        .update(secret + body)
        .digest("hex");
    return encrypted;
};
// Entrypoint for the Autotask
function handler(event) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, data, t, hash, HOOKSECRET, now, encrypted, to, amount, tokenAddress, tokenName, symbol, contractAddress, type, provider, signer, contract, tx;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = event.request.body, data = _a.data, t = _a.t, hash = _a.hash;
                    HOOKSECRET = event.secrets.HOOKSECRET;
                    if (!hash || !t || !data) {
                        return [2 /*return*/, {
                                statusCode: 400,
                                body: JSON.stringify({
                                    message: "Missing required parameters"
                                })
                            }];
                    }
                    now = Math.floor(Date.now() / 1000);
                    if (Math.abs(now - t) > 4) {
                        return [2 /*return*/, {
                                statusCode: 400,
                                body: JSON.stringify({
                                    message: "Time Expired"
                                })
                            }];
                    }
                    encrypted = encrypt(JSON.stringify({
                        t: t,
                        content: data
                    }), HOOKSECRET);
                    if (encrypted !== hash) {
                        return [2 /*return*/, {
                                statusCode: 400,
                                body: JSON.stringify({
                                    message: "Invalid Hash"
                                })
                            }];
                    }
                    to = data.to, amount = data.amount, tokenAddress = data.tokenAddress, tokenName = data.tokenName, symbol = data.symbol, contractAddress = data.contractAddress, type = data.type;
                    provider = new ethers.DefenderRelayProvider(event);
                    signer = new ethers.DefenderRelaySigner(event, provider, { speed: "fast" });
                    contract = new ethers$1.ethers.Contract(contractAddress, BridgeContractABI, signer);
                    if (!(type === "mint")) return [3 /*break*/, 3];
                    return [4 /*yield*/, contract.mintToken(symbol, tokenName, to, tokenAddress, amount)];
                case 1:
                    tx = _b.sent();
                    return [4 /*yield*/, tx.wait()];
                case 2:
                    _b.sent();
                    return [3 /*break*/, 6];
                case 3: return [4 /*yield*/, contract.unWrapToken(to, tokenAddress, amount)];
                case 4:
                    tx = _b.sent();
                    return [4 /*yield*/, tx.wait()];
                case 5:
                    _b.sent();
                    _b.label = 6;
                case 6:
                    console.log(" Tx Hash: ", tx.hash);
                    return [2 /*return*/, { tx: tx.hash }];
            }
        });
    });
}
// To run locally (this code will not be executed in Autotasks)
if (require.main === module) {
    require("dotenv").config();
    var _a = process.env, apiKey = _a.API_KEY, apiSecret = _a.API_SECRET;
    handler({ apiKey: apiKey, apiSecret: apiSecret })
        .then(function () { return process.exit(0); })["catch"](function (error) {
        console.error(error);
        process.exit(1);
    });
}

exports.handler = handler;
