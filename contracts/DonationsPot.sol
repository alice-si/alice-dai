pragma solidity ^0.4.24;

import 'openzeppelin-solidity/contracts/ownership/Ownable.sol';
import 'openzeppelin-solidity/contracts/token/ERC20/StandardToken.sol';
import 'openzeppelin-solidity/contracts/token/ERC20/ERC20.sol';
import 'openzeppelin-solidity/contracts/math/SafeMath.sol';

contract DonationsPot is Ownable {
    using SafeMath for uint256;

    address public SocialProjectManager;
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
    * @dev Throws if called by any account other than the SocialProject manager.
    */
    modifier onlySocialProjectManager() {
        require(msg.sender == SocialProjectManager);
        _;
    }


    struct Donor {
        string name;
        uint256 balance;
        uint256 donationsCount;
        uint256 lastDonationTime;
    }

    struct SocialProject {
        string name;
        uint256 balance;
        uint256 donationsCount;
    }

    mapping(address => Donor) donors;
    mapping(address => SocialProject) charities;

    uint256 public registeredBalance;

    uint256 public donationsCount;
    uint256 public donationsTotalAmount;

    uint256 public transfersCount;
    uint256 public transfersTotalAmount;

    event DonationRegistered(address from, string donorName, uint256 donationId, uint256 value);
    event DonationTransferred(address from, address to, uint256 transferId, string donorName, uint256 value);

    constructor(address _socialProjectManager, address _tokenDistributor, ERC20 _daiToken) public {
        SocialProjectManager = _socialProjectManager;
        tokenDistributor = _tokenDistributor;
        daiToken =_daiToken;
    }

    /**
    * @dev Function to add SocialProject and enable it to receive donations.
    * @param _socialProjectAddress address of the SocialProject project registered on the Alice platform.
    * @param _socialProjectName name of SocialProject acting as a human readable label.
    */
    function addSocialProject(address _socialProjectAddress, string _socialProjectName) public onlySocialProjectManager {
        require(bytes(_socialProjectName).length > 0);
        require(!isSocialProjectActive(_socialProjectAddress));
        charities[_socialProjectAddress] = SocialProject(_socialProjectName, 0, 0);
    }


    /**
    * @dev Function to notify  a donation sent to the pot contract on the donor account.
    *      It could be invoked only by a trusted service that distribute the tokens.
    * @param _from address of the donor.
    * @param _name name of the donor (recorded on the first donation).
    * @param _value amount of the donation expressed in Dai.
    */
    function notifyDonation(address _from, string _name, uint256 _value) public onlyTokenDistributor {
        require(daiToken.balanceOf(this).sub(registeredBalance) >= _value);
        require(_value > 0);

        registerDonation(_from, _name, _value);
    }


    /**
    * @dev Function to pull the donation from the donor account and register it on the pot.
    *      It uses the allowance mechanism of the ERC20 token to encapsulate both
    *      the transfer and registration as an atomic operation.
    * @param _from address of the donor.
    * @param _name name of the donor (recorded on the first donation).
    * @param _value amount of the donation expressed in Dai.
    */
    function pullDonation(address _from, string _name, uint256 _value) public {
        require(_value > 0);
        daiToken.transferFrom(msg.sender, this, _value);

        registerDonation(_from, _name, _value);
    }

    /**
    * @dev Internal function that registers donation on donor account.
    * @param _from address of the donor.
    * @param _name name of the donor (recorded on the first donation).
    * @param _value amount of the donation expressed in Dai.
    */
    function registerDonation(address _from, string _name, uint256 _value) private {
        if (donors[_from].donationsCount == 0) {
            donors[_from] = Donor(_name, _value, 1, now);
        } else {
            donors[_from].balance = donors[_from].balance.add(_value);
            donors[_from].donationsCount = donors[_from].donationsCount.add(1);
            donors[_from].lastDonationTime = now;
        }

        registeredBalance = registeredBalance.add(_value);
        emit DonationRegistered(_from, _name, donationsCount, _value);
        donationsCount = donationsCount.add(1);
        donationsTotalAmount = donationsTotalAmount.add(_value);
    }

    /**
    * @dev Function to transfer a donation to the selected SocialProject.
    * @param _socialProjectAddress address of the target SocialProject.
    * @param _value amount of the donation expressed in Dai.
    */
    function transferDonation(address _socialProjectAddress, uint256 _value) public {
        processDonationTransfer(msg.sender, _socialProjectAddress, _value);
    }

    /**
    * @dev Function to distribute forgotten donations from an inactive donor.
    * @param _donorAddress address of the inactive donor.
    * @param _socialProjectAddress random SocialProject than is going to receive the donation.
    */
    function distributeForgottenDonations(address _donorAddress, address _socialProjectAddress) public onlySocialProjectManager {
        Donor storage donor = donors[_donorAddress];
        require(donor.balance >= 0);
        require(now > donor.lastDonationTime.add(100 days));

        processDonationTransfer(_donorAddress, _socialProjectAddress, donor.balance);
    }

    /**
    * @dev Function to transfer tokens deposited on the contract by mistake without a proper registration.
    * @param _socialProjectAddress random SocialProject than is going to receive the donation.
    */
    function transferUnregisteredTokens(address _socialProjectAddress) public onlySocialProjectManager {
        uint256 unRegisteredBalance = daiToken.balanceOf(this).sub(registeredBalance);
        require(unRegisteredBalance > 0);

        daiToken.transfer(_socialProjectAddress, unRegisteredBalance);
    }

    function processDonationTransfer(address _donorAddress, address _socialProjectAddress, uint256 _value) private {
        require(isSocialProjectActive(_socialProjectAddress));
        require(_value > 0);

        Donor storage donor = donors[_donorAddress];
        require(donor.balance >= _value);

        daiToken.transfer(_socialProjectAddress, _value);

        donor.balance = donor.balance.sub(_value);

        SocialProject storage socialProject = charities[_socialProjectAddress];
        socialProject.balance = socialProject.balance.add(_value);
        socialProject.donationsCount = socialProject.donationsCount.add(1);

        registeredBalance = registeredBalance.sub(_value);

        emit DonationTransferred(_donorAddress, _socialProjectAddress, transfersCount, donor.name, _value);

        transfersCount = transfersCount.add(1);
        transfersTotalAmount = transfersTotalAmount.add(_value);
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
    * @dev Function to check the total balance of a SocialProject.
    * @param _socialProjectAddress address of the SocialProject.
    * @return A uint256 specifying the amount of dai.
    */
    function getSocialProjectBalance(address _socialProjectAddress) public view returns(uint256) {
        return charities[_socialProjectAddress].balance;
    }

    /**
    * @dev Function to check the number of donations made by a SocialProject.
    * @param _socialProjectAddress address of the SocialProject.
    * @return A uint256 specifying the number of donations.
    */
    function getSocialProjectDonationsCount(address _socialProjectAddress) public view returns(uint256) {
        return charities[_socialProjectAddress].donationsCount;
    }

    /**
    * @dev Function to check if SocialProject was added by the manager and is available to receive donations.
    * @param _socialProjectAddress address of the donor.
    * @return true if SocialProject can accept donations
    */
    function isSocialProjectActive(address _socialProjectAddress) public view returns(bool) {
        return bytes(charities[_socialProjectAddress].name).length > 0;
    }


    /**
    * @dev Function to return the total number of donations.
    */
    function getDonationsCount() public view returns(uint256) {
        return donationsCount;
    }

    /**
    * @dev Function to return the total amount of donations in Dai.
    */
    function getDonationsTotalAmount() public view returns(uint256) {
        return donationsTotalAmount;
    }

    /**
    * @dev Function to return the total number of donations.
    */
    function getTransfersCount() public view returns(uint256) {
        return transfersCount;
    }

    /**
    * @dev Function to return the total amount of donations in Dai.
    */
    function getTransfersTotalAmount() public view returns(uint256) {
        return transfersTotalAmount;
    }


}
