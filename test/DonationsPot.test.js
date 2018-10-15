require('./test-utils');

var DaiMock = artifacts.require("DaiMock");
var DonationsPot = artifacts.require("DonationsPot");

contract('Donations Pot', function([owner, charityManager, tokenDistributor, donor1, donor2, charity, unregisteredCharity]) {
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


  it("should register the second donation from Donor 1", async function() {
    await dai.mint(pot.address, 7);
    await pot.registerDonation(donor1, "Donor_1", 7, {from: tokenDistributor});

    (await dai.balanceOf(pot.address)).should.be.bignumber.equal(12);

    (await pot.registeredBalance()).should.be.bignumber.equal(12);
    (await pot.getDonorBalance(donor1)).should.be.bignumber.equal(12);
    (await pot.getDonorDonationsCount(donor1)).should.be.bignumber.equal(2);
  });


  it("should register the first donation from Donor 2", async function() {
    await dai.mint(pot.address, 9);
    await pot.registerDonation(donor2, "Donor_2", 9, {from: tokenDistributor});

    (await dai.balanceOf(pot.address)).should.be.bignumber.equal(21);

    (await pot.registeredBalance()).should.be.bignumber.equal(21);
    (await pot.getDonorBalance(donor2)).should.be.bignumber.equal(9);
    (await pot.getDonorDonationsCount(donor2)).should.be.bignumber.equal(1);
  });


  it("should not add charity by someone else than a charity manager", async function() {
    await pot.addCharity(charity, "Charity").shouldBeReverted();
  });


  it("should not add charity without a name", async function() {
    await pot.addCharity(charity, "", {from: charityManager}).shouldBeReverted();
  });


  it("should register charity", async function() {
    await pot.addCharity(charity, "Charity", {from: charityManager});
  });


  it("should not register charity if it was added before", async function() {
    await pot.addCharity(charity, "Charity", {from: charityManager}).shouldBeReverted();
  });


  it("should not transfer to an unregistered charity", async function() {
    await pot.transferDonation(unregisteredCharity, 0, {from: donor1}).shouldBeReverted();
  });


  it("should not transfer an empty donation", async function() {
    await pot.transferDonation(charity, 0, {from: donor1}).shouldBeReverted();
  });


  it("should not donate more than registered", async function() {
    await pot.transferDonation(charity, 13, {from: donor1}).shouldBeReverted();
  });


  it("should transfer donation to charity", async function() {
    await pot.transferDonation(charity, 10, {from: donor1});

    //Updated donor data
    (await dai.balanceOf(pot.address)).should.be.bignumber.equal(11);
    (await pot.getDonorBalance(donor1)).should.be.bignumber.equal(2);

    //Updated charity data
    (await dai.balanceOf(charity)).should.be.bignumber.equal(10);
    (await pot.getCharityBalance(charity)).should.be.bignumber.equal(10);
    (await pot.getCharityDonationsCount(charity)).should.be.bignumber.equal(1);
  });


  it("should transfer second donation to charity", async function() {
    await pot.transferDonation(charity, 2, {from: donor1});

    //Updated donor data
    (await dai.balanceOf(pot.address)).should.be.bignumber.equal(9);
    (await pot.getDonorBalance(donor1)).should.be.bignumber.equal(0);

    //Updated charity data
    (await dai.balanceOf(charity)).should.be.bignumber.equal(12);
    (await pot.getCharityBalance(charity)).should.be.bignumber.equal(12);
    (await pot.getCharityDonationsCount(charity)).should.be.bignumber.equal(2);
  });


  it("should transfer thrid donation to charity", async function() {
    await pot.transferDonation(charity, 9, {from: donor2});

    //Updated donor data
    (await dai.balanceOf(pot.address)).should.be.bignumber.equal(0);
    (await pot.getDonorBalance(donor2)).should.be.bignumber.equal(0);

    //Updated charity data
    (await dai.balanceOf(charity)).should.be.bignumber.equal(21);
    (await pot.getCharityBalance(charity)).should.be.bignumber.equal(21);
    (await pot.getCharityDonationsCount(charity)).should.be.bignumber.equal(3);
  });




});
