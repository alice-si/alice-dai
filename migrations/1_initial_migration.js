var Migrations = artifacts.require("./Migrations.sol");

module.exports = function(deployer, network, accounts) {
  console.log("Coinbase: " + accounts[0]);
  deployer.deploy(Migrations, {from: accounts[0]});
};
