const Web3 = require('web3');
const Contract = require('truffle-contract');
const DaiMock_artifact = require("../build/contracts/DaiMock.json");
var Dai = Contract(DaiMock_artifact);

let web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
let dai;
Dai.setProvider(web3.currentProvider);

//Here we define the deployed addresses:
let daiAddress = "0xba790feee551b7639acb3464c971400541eb8610";

let daiOwner = "0xfb1d14b22b957eb3c29f6302d4cf5d90a5ea5da5";
let target   = "0x1e2220a4211b34266d803567b835086632d8cbec";


let value = web3.toWei(5, 'ether');

Dai.at(daiAddress).then(function(instance) {
  dai = instance;
  return dai.mint(target, value, {from: daiOwner, gas: 1000000});
}).then(function(result) {
  console.log("Dai minted in: " + result.tx);
});
