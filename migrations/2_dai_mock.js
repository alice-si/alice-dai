var DaiMock = artifacts.require("./DaiMock.sol");

module.exports = function(deployer) {
  deployer.deploy(DaiMock);
};
