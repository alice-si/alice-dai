const Web3 = require('web3');
const Contract = require('truffle-contract');
const DonationsPot_artifact = require("../build/contracts/DonationsPot.json");
const DaiMock_artifact = require("../build/contracts/DaiMock.json");
var DonationsPot = Contract(DonationsPot_artifact);
var Dai = Contract(DaiMock_artifact);

let web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
let dai, donationsPot;
DonationsPot.setProvider(web3.currentProvider);
Dai.setProvider(web3.currentProvider);

//Here we define the deployed addresses:
let daiAddress = "0xb409fcd95b4adeb57fe653200b04ea2b9a7a64e4";
let donationsPotAddress = "0x6e39beda1905ca39a65fe3ac9387a07cf81bac03";

let daiOwner = "0x9038156f749d5cfd5a89e0e5ac16808583e8594f";
let tokenDistributor = "0x9038156f749d5cfd5a89e0e5ac16808583e8594f";


let donor = "0x821c2d64f6c9a9e15cdd81f3d952884740bc013e";
let socialProject = "0xc7c2fe014340fd15c62cebf8c5c44484ac7e49d8";
let value = web3.toWei(1, 'ether');

Dai.at(daiAddress).then(function(instance) {
  dai = instance;
  return DonationsPot.at(donationsPotAddress)
}).then(function(instance) {
  donationsPot = instance;
  return dai.mint(donor, value, {from: daiOwner, gas: 1000000});
}).then(function(result) {
  console.log("Dai minted in: " + result.tx);
});
