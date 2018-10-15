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
        uint256 lastDonationTime;
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
        require(!isCharityActive(_charityAddress));
        charities[_charityAddress] = Charity(_charityName, 0, 0);
    }

    /**
    * @dev Function to register a donation sent to the pot contract on donor account.
    * @param _from address of the charity donor.
    * @param _name name of the donor (recorded on the first donation).
    * @param _value amount of the donation expressed in Dai.
    */
    function registerDonation(address _from, string _name, uint256 _value) public onlyTokenDistributor {
        require(daiToken.balanceOf(this).sub(registeredBalance) >= _value);
        require(_value > 0);

        if (donors[_from].donationsCount == 0) {
            donors[_from] = Donor(_name, _value, 1, now);
        } else {
            donors[_from].balance = donors[_from].balance.add(_value);
            donors[_from].donationsCount = donors[_from].donationsCount.add(1);
            donors[_from].lastDonationTime = now;
        }

        registeredBalance = registeredBalance.add(_value);
        emit DonationRegistered(_from, _name, _value);
    }

    /**
    * @dev Function to transfer a donation to the selected charity.
    * @param _charityAddress address of the target charity.
    * @param _value amount of the donation expressed in Dai.
    */
    function transferDonation(address _charityAddress, uint256 _value) public {
        processDonationTransfer(msg.sender, _charityAddress, _value);
    }

    /**
    * @dev Function to distribute forgotten donations from an inactive donor.
    * @param _donorAddress address of the inactive donor.
    * @param _charityAddress random charity than is going to receive the donation.
    */
    function distributeForgottenDonations(address _donorAddress, address _charityAddress) public onlyCharityManager {
        Donor storage donor = donors[msg.sender];
        require(donor.balance >= 0);
        require(now > donor.lastDonationTime.add(100 days));

        processDonationTransfer(_donorAddress, _charityAddress, donor.balance);
    }

    /**
    * @dev Function to transfer tokens deposited on the contract by mistake without a proper registration.
    * @param _charityAddress random charity than is going to receive the donation.
    */
    function transferUnregisteredTokens(address _charityAddress) public onlyCharityManager {
        uint256 unRegisteredBalance = daiToken.balanceOf(this).sub(registeredBalance);
        require(unRegisteredBalance > 0);

        daiToken.transfer(_charityAddress, unRegisteredBalance);
    }

    function processDonationTransfer(address _donorAddress, address _charityAddress, uint256 _value) private {
        require(isCharityActive(_charityAddress));
        require(_value > 0);

        Donor storage donor = donors[msg.sender];
        require(donor.balance >= _value);

        daiToken.transfer(_charityAddress, _value);

        donor.balance = donor.balance.sub(_value);

        Charity storage charity = charities[_charityAddress];
        charity.balance = charity.balance.add(_value);
        charity.donationsCount = charity.donationsCount.add(1);

        registeredBalance = registeredBalance.sub(_value);

        emit DonationTransferred(msg.sender, donor.name, _charityAddress, charity.name, _value);
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

    /**
    * @dev Function to check the total balance of a charity.
    * @param _charityAddress address of the charity.
    * @return A uint256 specifying the amount of dai.
    */
    function getCharityBalance(address _charityAddress) public view returns(uint256) {
        return charities[_charityAddress].balance;
    }

    /**
    * @dev Function to check the number of donations made by a charity.
    * @param _charityAddress address of the charity.
    * @return A uint256 specifying the number of donations.
    */
    function getCharityDonationsCount(address _charityAddress) public view returns(uint256) {
        return charities[_charityAddress].donationsCount;
    }

    /**
    * @dev Function to check if charity was added by the manager and is available to receive donations.
    * @param _charityAddress address of the donor.
    * @return true if charity can accept donations
    */
    function isCharityActive(address _charityAddress) public view returns(bool) {
        return bytes(charities[_charityAddress].name).length > 0;
    }


}
