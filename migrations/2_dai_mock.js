var DaiMock = artifacts.require("./DaiMock.sol");

module.exports = function(deployer, network, accounts) {
  deployer.deploy(DaiMock,  {from: accounts[0]});
};
