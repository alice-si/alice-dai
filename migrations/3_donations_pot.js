var DonationsPot = artifacts.require("./DonationsPot.sol");
var DaiMock = artifacts.require("./DaiMock.sol");

module.exports = function(deployer, network, accounts) {
  let tokenDistributor = accounts[1];
  let socialProjectManager = accounts[2];
  deployer.deploy(DonationsPot, tokenDistributor, socialProjectManager, DaiMock.address);
};
