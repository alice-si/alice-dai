const Web3 = require('web3');
const Contract = require('truffle-contract');
const DaiMock_artifact = require("../build/contracts/DaiMock.json");
var Dai = Contract(DaiMock_artifact);

let web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
let dai;
Dai.setProvider(web3.currentProvider);

//Here we define the deployed addresses:
let daiAddress = "0x8c808003e8831396ca18fe7dbd1ff9e70dbb2e8a";

let daiOwner = "0xfb1d14b22b957eb3c29f6302d4cf5d90a5ea5da5";
let target = "0xbc773ca86d9071e163168a8a5ad25e235907f9e7";


let value = web3.toWei(5, 'ether');

Dai.at(daiAddress).then(function(instance) {
  dai = instance;
  return dai.mint(target, value, {from: daiOwner, gas: 1000000});
}).then(function(result) {
  console.log("Dai minted in: " + result.tx);
});
