pragma solidity ^0.4.24;

import 'openzeppelin-solidity/contracts/ownership/Ownable.sol';
import 'openzeppelin-solidity/contracts/token/ERC20/StandardToken.sol';
import 'openzeppelin-solidity/contracts/token/ERC20/ERC20.sol';
import 'openzeppelin-solidity/contracts/math/SafeMath.sol';

contract DonationsPot is Ownable {
    using SafeMath for uint256;

    address public charityManager;
    address public tokenDistributor;
    ERC20 public daiToken;

    /**
    * @dev Throws if called by any account other than the token distributor.
    */
    modifier onlyTokenDistributor() {
        require(msg.sender == tokenDistributor);
        _;
    }

    struct Donor {
        string name;
        uint256 balance;
        uint256 donationsCount;
    }

    struct Charity {
        string name;
        uint256 balance;
        uint256 donationsCount;
    }

    mapping(address => Donor) donors;
    mapping(address => Charity) charities;

    uint256 public registeredBalance;

    event DonationRegistered(address from, string donorName, uint256 value);
    event DonationTransferred(address from, string donorName, address to, string charity, uint256 value);

    constructor(address _charityManager, address _tokenDistributor, ERC20 _daiToken) {
        charityManager = _charityManager;
        tokenDistributor = _tokenDistributor;
        daiToken =_daiToken;
    }

    function registerDonation(address _from, string _name, uint256 _value) public onlyTokenDistributor {
        require(daiToken.balanceOf(this).sub(registeredBalance) >= _value);
        donors[_from] = Donor(_name, _value, 1);
        registeredBalance = registeredBalance.add(_value);
        emit DonationRegistered(_from, _name, _value);
    }

    function transferDonation(address _charity) public {

    }

    function getDonorBalance(address _donorAddress) public view returns(uint256) {
        return donors[_donorAddress].balance;
    }

    function getDonorDonationsCount(address _donorAddress) public view returns(uint256) {
        return donors[_donorAddress].donationsCount;
    }


}
