require('./test-utils');

var DaiMock = artifacts.require("DaiMock");

contract('DaiMock', function([owner, sender, receiver]) {
  var dai;

  before("deploy token", async function() {
    dai = await DaiMock.new();
  });

  it("should deploy token", async function() {
    (await dai.name()).should.be.equal("Dai");
  });

  it("approve and transfer", async function() {
    await dai.mint(sender, 100, {from: owner});
    (await dai.balanceOf(sender)).should.be.bignumber.equal(100);

    dai.approve(receiver, 100, {from: sender});
    dai.transferFrom(sender, receiver, 100, {from: receiver});
    (await dai.balanceOf(receiver)).should.be.bignumber.equal(100);
  });

});
