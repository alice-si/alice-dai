require('./test-utils');

var DaiMock = artifacts.require("DaiMock");
var DonationsPot = artifacts.require("DonationsPot");

contract('Donations Pot', function([owner, socialProjectManager, tokenDistributor, donor1, donor2, socialProject, unregisteredSocialProject]) {
  var dai, pot;

  before("deploy Donations Pot", async function() {
    dai = await DaiMock.new();
    pot = await DonationsPot.new(socialProjectManager, tokenDistributor, dai.address);
  });

  it("should not register donation without Dai payment", async function() {
    await pot.notifyDonation(donor1, "Donor_1", 5).shouldBeReverted();
  });


  it("should not register donation from someone other than the Ttoken distributor", async function() {
    await dai.mint(pot.address, 5);
    await pot.notifyDonation(donor1, "Donor_1", 5).shouldBeReverted();
  });


  it("should not register empty donation", async function() {
    await pot.notifyDonation(donor1, "Donor_1", 0, {from: tokenDistributor}).shouldBeReverted();
  });


  it("should register the first donation from Donor 1", async function() {
    await pot.notifyDonation(donor1, "Donor_1", 5, {from: tokenDistributor});

    (await dai.balanceOf(pot.address)).should.be.bignumber.equal(5);

    (await pot.registeredBalance()).should.be.bignumber.equal(5);
    (await pot.getDonorBalance(donor1)).should.be.bignumber.equal(5);
    (await pot.getDonorDonationsCount(donor1)).should.be.bignumber.equal(1);

    //Updated global data
    (await pot.getDonationsCount()).should.be.bignumber.equal(1);
    (await pot.getDonationsTotalAmount()).should.be.bignumber.equal(5);
  });


  it("should register the second donation from Donor 1", async function() {
    await dai.mint(pot.address, 7);
    await pot.notifyDonation(donor1, "Donor_1", 7, {from: tokenDistributor});

    (await dai.balanceOf(pot.address)).should.be.bignumber.equal(12);

    (await pot.registeredBalance()).should.be.bignumber.equal(12);
    (await pot.getDonorBalance(donor1)).should.be.bignumber.equal(12);
    (await pot.getDonorDonationsCount(donor1)).should.be.bignumber.equal(2);

    //Updated global data
    (await pot.getDonationsCount()).should.be.bignumber.equal(2);
    (await pot.getDonationsTotalAmount()).should.be.bignumber.equal(12);
  });


  it("should register the first donation from Donor 2 using pull mechanism", async function() {
    await dai.mint(donor2, 9);
    await dai.approve(pot.address, 9, {from: donor2});
    await pot.pullDonation(donor2, "Donor_2", 9, {from: donor2});

    (await dai.balanceOf(pot.address)).should.be.bignumber.equal(21);

    (await pot.registeredBalance()).should.be.bignumber.equal(21);
    (await pot.getDonorBalance(donor2)).should.be.bignumber.equal(9);
    (await pot.getDonorDonationsCount(donor2)).should.be.bignumber.equal(1);

    //Updated global data
    (await pot.getDonationsCount()).should.be.bignumber.equal(3);
    (await pot.getDonationsTotalAmount()).should.be.bignumber.equal(21);
  });


  it("should not add socialProject by someone else than a socialProject manager", async function() {
    await pot.addSocialProject(socialProject, "SocialProject").shouldBeReverted();
  });


  it("should not add socialProject without a name", async function() {
    await pot.addSocialProject(socialProject, "", {from: socialProjectManager}).shouldBeReverted();
  });


  it("should register socialProject", async function() {
    await pot.addSocialProject(socialProject, "SocialProject", {from: socialProjectManager});
  });


  it("should not register socialProject if it was added before", async function() {
    await pot.addSocialProject(socialProject, "SocialProject", {from: socialProjectManager}).shouldBeReverted();
  });


  it("should not transfer to an unregistered socialProject", async function() {
    await pot.transferDonation(unregisteredSocialProject, 0, {from: donor1}).shouldBeReverted();
  });


  it("should not transfer an empty donation", async function() {
    await pot.transferDonation(socialProject, 0, {from: donor1}).shouldBeReverted();
  });


  it("should not donate more than registered", async function() {
    await pot.transferDonation(socialProject, 13, {from: donor1}).shouldBeReverted();
  });


  it("should not distribute forgotten donations before deadline", async function() {
    await pot.distributeForgottenDonations(donor1, socialProject, {from: socialProjectManager}).shouldBeReverted();;
  });

  it("should not distribute forgotten donations by someone other than the socialProject manager", async function() {
    await pot.distributeForgottenDonations(donor1, socialProject).shouldBeReverted();;
  });

  it("should transfer donation to socialProject", async function() {
    await pot.transferDonation(socialProject, 10, {from: donor1});

    //Updated donor data
    (await dai.balanceOf(pot.address)).should.be.bignumber.equal(11);
    (await pot.getDonorBalance(donor1)).should.be.bignumber.equal(2);

    //Updated socialProject data
    (await dai.balanceOf(socialProject)).should.be.bignumber.equal(10);
    (await pot.getSocialProjectBalance(socialProject)).should.be.bignumber.equal(10);
    (await pot.getSocialProjectDonationsCount(socialProject)).should.be.bignumber.equal(1);

    //Updated global data
    (await pot.getTransfersCount()).should.be.bignumber.equal(1);
    (await pot.getTransfersTotalAmount()).should.be.bignumber.equal(10);
  });


  it("should transfer second donation to socialProject", async function() {
    await pot.transferDonation(socialProject, 2, {from: donor1});

    //Updated donor data
    (await dai.balanceOf(pot.address)).should.be.bignumber.equal(9);
    (await pot.getDonorBalance(donor1)).should.be.bignumber.equal(0);

    //Updated socialProject data
    (await dai.balanceOf(socialProject)).should.be.bignumber.equal(12);
    (await pot.getSocialProjectBalance(socialProject)).should.be.bignumber.equal(12);
    (await pot.getSocialProjectDonationsCount(socialProject)).should.be.bignumber.equal(2);

    //Updated global data
    (await pot.getTransfersCount()).should.be.bignumber.equal(2);
    (await pot.getTransfersTotalAmount()).should.be.bignumber.equal(12);
  });


  it("should transfer thrid donation to socialProject", async function() {
    await pot.transferDonation(socialProject, 9, {from: donor2});

    //Updated donor data
    (await dai.balanceOf(pot.address)).should.be.bignumber.equal(0);
    (await pot.getDonorBalance(donor2)).should.be.bignumber.equal(0);

    //Updated socialProject data
    (await dai.balanceOf(socialProject)).should.be.bignumber.equal(21);
    (await pot.getSocialProjectBalance(socialProject)).should.be.bignumber.equal(21);
    (await pot.getSocialProjectDonationsCount(socialProject)).should.be.bignumber.equal(3);

    //Updated global data
    (await pot.getTransfersCount()).should.be.bignumber.equal(3);
    (await pot.getTransfersTotalAmount()).should.be.bignumber.equal(21);
  });


  it("should not transfer unregistered tokens by someone other than socialProject manager", async function() {
    await dai.mint(pot.address, 7);
    await pot.transferUnregisteredTokens(socialProject).shouldBeReverted();
  });


  it("should transfer unregistered tokens", async function() {
    await pot.transferUnregisteredTokens(socialProject, {from: socialProjectManager});

    (await dai.balanceOf(socialProject)).should.be.bignumber.equal(28);
  });

});
