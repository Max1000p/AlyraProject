const Voting = artifacts.require("./Voting.sol");
const { BN, expectRevert, expectEvent } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');

contract('Voting', accounts => {
    const owner = accounts[0];
    const second = accounts[1];
    const third = accounts[2];

    let VotingInstance;

    describe("Test Workflowstatus and Registration Voters", function () {

        beforeEach(async function () {
            VotingInstance = await Voting.new({from:owner});
        });

        it("should Workflow status is set to Registering Voters", async () => {
            expect(await VotingInstance.workflowStatus.call()).to.be.bignumber.equal(new BN(0));
        });

       
       
    });
  })