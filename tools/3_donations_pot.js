var DonationsPot = artifacts.require("./DonationsPot.sol");
var DaiMock = artifacts.require("./DaiMock.sol");

module.exports = function(deployer, network, accounts) {
  let socialProjectManager = accounts[1];
  let tokenDistributor = accounts[2];
  deployer.deploy(DonationsPot, socialProjectManager, tokenDistributor, DaiMock.address);
};
