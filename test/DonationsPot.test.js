require('./test-utils');

var DaiMock = artifacts.require("DaiMock");
var DonationsPot = artifacts.require("DonationsPot");

contract('Donations Pot', function([owner, charityManager, tokenDistributor, donor1, donor2]) {
  var dai, pot;

  before("deploy Donations Pot", async function() {
    dai = await DaiMock.new();
    pot = await DonationsPot.new(charityManager, tokenDistributor, dai.address);
  });

  it("should not register donation without Dai payment", async function() {
    await pot.registerDonation(donor1, "Donor_1", 5).shouldBeReverted();
  });


  it("should not register donation from someone other than the Ttoken distributor", async function() {
    await dai.mint(pot.address, 5);
    await pot.registerDonation(donor1, "Donor_1", 5).shouldBeReverted();
  });


  it("should not register empty donation", async function() {
    await pot.registerDonation(donor1, "Donor_1", 0, {from: tokenDistributor}).shouldBeReverted();
  });


  it("should register the first donation from Donor 1", async function() {
    await pot.registerDonation(donor1, "Donor_1", 5, {from: tokenDistributor});

    (await dai.balanceOf(pot.address)).should.be.bignumber.equal(5);

    (await pot.registeredBalance()).should.be.bignumber.equal(5);
    (await pot.getDonorBalance(donor1)).should.be.bignumber.equal(5);
    (await pot.getDonorDonationsCount(donor1)).should.be.bignumber.equal(1);
  });

});
