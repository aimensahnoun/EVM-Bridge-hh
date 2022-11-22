// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "./WERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

error WERC20Factory__TokenAlreadyExists(string tokenSymbol);
error WERC20Factory__TokenDoesNotExist(string tokenSymbol);
error WERC20Factory__EmptySymbol();
error WERC20Factory__EmptyName();
error WERC20Factory__CannotPassZeroAddress();
error WERC20Factory__AmountCannotBeZoro();

contract WERC20Factory is Ownable {
    event NewWERC20(
        address indexed werc20,
        string indexed name,
        string indexed symbol
    );

    mapping(string => address) public werc20s;

    modifier onlyValidSymbol(string memory symbol) {
        if (keccak256(bytes(symbol)) == keccak256(bytes(""))) {
            revert WERC20Factory__EmptySymbol();
        }
        _;
    }

    modifier onlyValidName(string memory name) {
        if (keccak256(bytes(name)) == keccak256(bytes(""))) {
            revert WERC20Factory__EmptyName();
        }
        _;
    }

    modifier onlyValidAddress(address addr) {
        if (addr == address(0)) {
            revert WERC20Factory__CannotPassZeroAddress();
        }
        _;
    }

    modifier onlyValidAmount(uint256 amount) {
        if (amount == 0) {
            revert WERC20Factory__AmountCannotBeZoro();
        }
        _;
    }

    function createWERC20(string memory _name, string memory _symbol)
        public
        onlyOwner
        onlyValidSymbol(_symbol)
        onlyValidName(_name)
        returns (address)
    {
        if (werc20s[_symbol] != address(0))
            revert WERC20Factory__TokenAlreadyExists(_symbol);
        address werc20 = address(new WrapperToken(_name, _symbol));
        werc20s[_symbol] = werc20;
        emit NewWERC20(werc20, _name, _symbol);
        return werc20;
    }

    function getWERC20(string memory _symbol)
        public
        view
        onlyValidSymbol(_symbol)
        returns (address)
    {
        return werc20s[_symbol];
    }

    // Mint function
    function mint(
        string memory _symbol,
        address _to,
        uint256 _amount
    )
        external
        onlyOwner
        onlyValidAddress(_to)
        onlyValidSymbol(_symbol)
        onlyValidAmount(_amount)
        returns (bool)
    {
        address werc20 = getWERC20(_symbol);
        if (werc20 == address(0))
            revert WERC20Factory__TokenDoesNotExist(_symbol);

        WrapperToken(werc20).mint(_to, _amount);
        return true;
    }

    // Get balance
    function balanceOf(string memory _symbol, address _account)
        external
        view
        onlyValidSymbol(_symbol)
        onlyValidAddress(_account)
        returns (uint256)
    {
        address werc20 = getWERC20(_symbol);
        if (werc20 == address(0))
            revert WERC20Factory__TokenDoesNotExist(_symbol);
        return WrapperToken(werc20).balanceOf(_account);
    }

    // Burn function
    function burn(
        address _tokenAddress,
        address _from,
        uint256 _amount
    )
        external
        onlyOwner
        onlyValidAddress(_tokenAddress)
        onlyValidAddress(_from)
        onlyValidAmount(_amount)
        returns (bool)
    {
        WrapperToken(_tokenAddress).burnFrom(_from, _amount);
        return true;
    }

    // Get My balance
    function myBalanceOf(string memory _symbol)
        external
        view
        onlyValidSymbol(_symbol)
        returns (uint256)
    {
        address werc20 = getWERC20(_symbol);
        if (werc20 == address(0))
            revert WERC20Factory__TokenDoesNotExist(_symbol);

        return WrapperToken(werc20).balanceOf(msg.sender);
    }
}
