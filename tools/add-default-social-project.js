const Web3 = require('web3');
const Contract = require('truffle-contract');
const DonationsPot_artifact = require("../build/contracts/DonationsPot.json");
var DonationsPot = Contract(DonationsPot_artifact);

let web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
let donationsPot;
DonationsPot.setProvider(web3.currentProvider);

//Here we define the deployed addresses:
let donationsPotAddress = "0x6e39beda1905ca39a65fe3ac9387a07cf81bac03";
let socialProjectManager = "0x793303e187ed167745d45894d5aa3a5b6c501041";

let socialProject = "0xc7c2fe014340fd15c62cebf8c5c44484ac7e49d8";
let socialProjectName = "Test Project";


DonationsPot.at(donationsPotAddress).then(function(instance) {
  donationsPot = instance;
  return donationsPot.addSocialProject(socialProject, socialProjectName, {from: socialProjectManager, gas: 1000000});
}).then(function(result) {
  console.log("Social project added in: " + result.tx);
  return donationsPot.markSocialProjectAsDefault(socialProject, {from: socialProjectManager, gas: 1000000});
}).then(function(result) {
  console.log("Social project marked as default: " + result.tx);
});
