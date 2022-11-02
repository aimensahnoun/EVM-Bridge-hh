// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "./WERC20Factory.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

error Bridge__NotAllowedToDoThisAction();

contract Bridge is AccessControl {
    WERC20Factory public factory;
    bytes32 public constant RELAYER = keccak256("RELAYER");

    event TransferInitiated(
        address indexed user,
        address tokenAddress,
        uint256 sourceChainId,
        uint256 amount,
        uint256 indexed targetChainId,
        string indexed tokenSymbol,
        string tokenName
    );

    event TransferCompleted(
        address indexed user,
        address tokenAddress,
        uint256 amount,
        uint256 indexed chainId,
        string indexed tokenSymbol,
        string tokenName
    );

    struct Transaction {
        address user;
        uint256 sourceChainId;
        uint256 targetChainId;
        uint256 amount;
        string tokenName;
        string tokenSymbol;
    }

    mapping(address => Transaction[]) transactions;

    constructor() {
        _grantRole(RELAYER, msg.sender);
        factory = new WERC20Factory();
    }

    modifier onlyAllowed() {
        if (!hasRole(RELAYER, msg.sender))
            revert Bridge__NotAllowedToDoThisAction();
        _;
    }

    function initiateTransfer(
        address _user,
        address _tokenAddress,
        uint256 _targetChainId,
        uint256 _amount,
        string memory _tokenName,
        string memory _tokenSymbol
    ) external onlyAllowed {
        transactions[_user].push(
            Transaction(
                _user,
                block.chainid,
                _targetChainId,
                _amount,
                _tokenName,
                _tokenSymbol
            )
        );

        emit TransferInitiated(
            _user,
            _tokenAddress,
            block.chainid,
            _targetChainId,
            _amount,
            _tokenSymbol,
            _tokenName
        );
    }

    function mintToken(
        string memory _symbol,
        string memory _tokenName,
        address _to,
        uint256 _amount
    ) external onlyAllowed {
        string memory tokenSymbol = string.concat("W", _symbol);
        address werc20 = factory.getWERC20(tokenSymbol);
        if (werc20 == address(0)) {
            werc20 = factory.createWERC20(_tokenName, tokenSymbol);
        }

        factory.mint(tokenSymbol, _to, _amount);

        emit TransferCompleted(
            _to,
            werc20,
            _amount,
            block.chainid,
            tokenSymbol,
            _tokenName
        );
    }

    function addRelayer(address _relayer) external onlyAllowed {
        grantRole(RELAYER, _relayer);
    }

    function removeRelayer(address _relayer) external onlyAllowed {
        revokeRole(RELAYER, _relayer);
    }

    function extractTokens(address _tokenAddress, address _to)
        external
        onlyAllowed
    {
        IERC20(_tokenAddress).transfer(
            _to,
            IERC20(_tokenAddress).balanceOf(address(this))
        );
    }
}
