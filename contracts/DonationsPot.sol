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

    /**
    * @dev Throws if called by any account other than the token distributor.
    */
    modifier onlyCharityManager() {
        require(msg.sender == charityManager);
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

    /**
    * @dev Function to add charity and enable it to receive donations.
    * @param _charityAddress address of the charity project registered on the Alice platform.
    * @param _charityName name of charity acting as a human readable label.
    */
    function addCharity(address _charityAddress, string _charityName) public onlyCharityManager {
        require(bytes(_charityName).length > 0);
        require(bytes(charities[_charityAddress].name).length == 0);

        charities[_charityAddress] = Charity(_charityName, 0, 0);
    }

    function registerDonation(address _from, string _name, uint256 _value) public onlyTokenDistributor {
        require(daiToken.balanceOf(this).sub(registeredBalance) >= _value);
        require(_value > 0);

        if (donors[_from].donationsCount == 0) {
            donors[_from] = Donor(_name, _value, 1);
        } else {
            donors[_from].balance = donors[_from].balance.add(_value);
            donors[_from].donationsCount = donors[_from].donationsCount.add(1);
        }

        registeredBalance = registeredBalance.add(_value);
        emit DonationRegistered(_from, _name, _value);
    }

    function transferDonation(address _charity) public {

    }

    /**
    * @dev Function to check the total balance of a donor.
    * @param _donorAddress address of the donor.
    * @return A uint256 specifying the amount of dai.
    */
    function getDonorBalance(address _donorAddress) public view returns(uint256) {
        return donors[_donorAddress].balance;
    }

    /**
    * @dev Function to check the number of donations made by a donor.
    * @param _donorAddress address of the donor.
    * @return A uint256 specifying the number of donations.
    */
    function getDonorDonationsCount(address _donorAddress) public view returns(uint256) {
        return donors[_donorAddress].donationsCount;
    }


}
