// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "./WERC20Factory.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

error Bridge__NotAllowedToDoThisAction();
error Bridge__TransferToBridgeFailed();
error Bridge__ZeroAddressProvided();
error Bridge__FundsCannotBeZero();
error Bridge__TokenNameEmpty();
error Bridge__TokenSymbolEmpty();
error Bridge__WrapTokenDoesNotExist();
error Bridge__InsufficientBalance();
error Bridge__UnwrappingFailed();

contract Bridge is AccessControl {
    WERC20Factory public factory;
    bytes32 public constant RELAYER = keccak256("RELAYER");

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        factory = new WERC20Factory();
    }

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

    event BurnedToken(
        address indexed user,
        address tokenAddress,
        uint256 amount,
        uint256 indexed chainId
    );

    event UwrappedToken(
        address indexed user,
        address nativeTokenAddress,
        uint256 amount,
        uint256 indexed chainId
    );

    event WithdrawToken(address indexed tokenAddress, address indexed to);

    mapping(address => address) public nativeToWrapped;
    mapping(address => address) public wrappedToNative;

    modifier onlyAllowed() {
        if (!hasRole(RELAYER, msg.sender))
            revert Bridge__NotAllowedToDoThisAction();
        _;
    }

    modifier onlyValidAddress(address _address) {
        if (_address == address(0)) revert Bridge__ZeroAddressProvided();
        _;
    }

    modifier onlyValidAmount(uint256 _amount) {
        if (_amount == 0) revert Bridge__FundsCannotBeZero();
        _;
    }

    function initiateTransfer(
        address _user,
        address _tokenAddress,
        uint256 _targetChainId,
        uint256 _amount,
        string memory _tokenName,
        string memory _tokenSymbol
    )
        external
        onlyValidAddress(_user)
        onlyValidAddress(_tokenAddress)
        onlyValidAmount(_amount)
    {
      IERC20(_tokenAddress).transferFrom(
            _user,
            address(this),
            _amount
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
        address _tokenAddress,
        uint256 _amount
    )
        external
        onlyValidAddress(_to)
        onlyValidAddress(_tokenAddress)
        onlyValidAmount(_amount)
        onlyAllowed
    {
        if (keccak256(bytes(_symbol)) == keccak256(bytes(""))) {
            revert Bridge__TokenSymbolEmpty();
        }

        if (keccak256(bytes(_tokenName)) == keccak256(bytes(""))) {
            revert Bridge__TokenNameEmpty();
        }

        string memory tokenSymbol = string.concat("W", _symbol);
        address werc20 = factory.getWERC20(tokenSymbol);
        if (werc20 == address(0)) {
            werc20 = factory.createWERC20(_tokenName, tokenSymbol);
            nativeToWrapped[_tokenAddress] = werc20;
            wrappedToNative[werc20] = _tokenAddress;
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

    function burnWrappedToken(
        string memory _symbol,
        uint256 _amount,
        address _user
    ) external onlyValidAmount(_amount) onlyValidAddress(_user) onlyAllowed {
        if (keccak256(bytes(_symbol)) == keccak256(bytes(""))) {
            revert Bridge__TokenSymbolEmpty();
        }

        address werc20 = factory.getWERC20(_symbol);
        if (werc20 == address(0)) {
            revert Bridge__WrapTokenDoesNotExist();
        }

        uint256 userBalance = factory.balanceOf(_symbol, msg.sender);
        if (userBalance < _amount) {
            revert Bridge__InsufficientBalance();
        }

        factory.burn(werc20, _user, _amount);

        emit BurnedToken(_user, werc20, _amount, block.chainid);
    }

    function unWrapToken(
        address _to,
        address _nativeTokenAddress,
        uint256 _amount
    )
        external
        onlyValidAddress(_to)
        onlyValidAddress(_nativeTokenAddress)
        onlyValidAmount(_amount)
        onlyAllowed
    {
        

        IERC20(_nativeTokenAddress).transfer(_to, _amount);
    
        emit UwrappedToken(
            _to,
            _nativeTokenAddress,
            _amount,
            block.chainid
        );
    }

}
