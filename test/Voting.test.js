const Voting = artifacts.require("./Voting.sol");
const { BN, expectRevert, expectEvent } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');

contract('Voting', accounts => {
    const owner = accounts[0];
    const second = accounts[1];
    const third = accounts[2];
    const four = accounts[3];

    let VotingInstance;

    describe("Test in Voting context : Worflowstatus is RegisteringVoters", function () {

        beforeEach(async function () {
            VotingInstance = await Voting.new({from:owner});
        });

        context("Test Getter getVoter", function () {
            
            it("account who is not a voter can't use getVoter (onlyVoters), revert", async () => {
                await expectRevert(VotingInstance.getVoter(second, {from: owner}), "You're not a voter");
            });

            it("Voter account can use getVoter (onlyVoters)", async () => {
                await VotingInstance.addVoter(second, {from: owner});
                const storedData = await VotingInstance.getVoter(second, {from: second});
                expect(storedData.isRegistered).to.be.true;
            });
        })

        context("Test addvoter", function () {
            
            it("should Workflow status is set to Registering Voters", async () => {
                expect(await VotingInstance.workflowStatus.call()).to.be.bignumber.equal(new BN(0));
            });

            it("should owner can add a new voter", async () => {
                await VotingInstance.addVoter(second, {from: owner});
                const storedData = await VotingInstance.getVoter(second, {from: second});
                expect(storedData.isRegistered).to.be.true;
            });

            it("should owner can add a new voter, get event VoterRegistered", async () => {
                const findEvent = await VotingInstance.addVoter(second, {from: owner});
                expectEvent(findEvent,"VoterRegistered");
            });

            it("should owner can't add an already registered voter, revert", async () => {
                await VotingInstance.addVoter(second, {from: owner});
                await expectRevert(VotingInstance.addVoter(second, {from: owner}), 'Already registered');
            });

            it("Another account than owner can't add voter, revert", async () => {
                await expectRevert(VotingInstance.addVoter(second, {from: second}), 'Ownable: caller is not the owner');
            });
        });

        context("Test changing state since workflowstatus RegisteringVoters for Owner", function () {
            
            it("should owner can launch startProposalsRegistering", async () => {
                await VotingInstance.startProposalsRegistering({from: owner});
                expect(await VotingInstance.workflowStatus.call()).to.be.bignumber.equal(new BN(1));
            });

            it("should owner can launch startProposalsRegistering, get event WorkflowStatusChange", async () => {
                let previousStatus = await VotingInstance.workflowStatus.call();
                const findEvent = await VotingInstance.startProposalsRegistering({from: owner});
                let newStatus = await VotingInstance.workflowStatus.call();
                expectEvent(findEvent,"WorkflowStatusChange", {previousStatus, newStatus});
            });

            it("Owner can't launch endProposalsRegistering since RegisteringVoters, revert", async () => {
                await expectRevert(VotingInstance.endProposalsRegistering({from: owner}), 'Registering proposals havent started yet');
            });

            it("Owner can't launch startVotingSession since RegisteringVoters, revert", async () => {
                await expectRevert(VotingInstance.startVotingSession({from: owner}), 'Registering proposals phase is not finished');
            });

            it("Owner can't launch endVotingSession since RegisteringVoters, revert", async () => {
                await expectRevert(VotingInstance.endVotingSession({from: owner}), 'Voting session havent started yet');
            });

            it("Owner can't launch tallyVotes since RegisteringVoters, revert", async () => {
                await expectRevert(VotingInstance.tallyVotes({from: owner}), 'Current status is not voting session ended');
            });
        });

        context("Test changing state for account who are not Owner", function () {

            it("Another account than owner can't launch startProposalsRegistering, revert", async () => {
                await expectRevert(VotingInstance.startProposalsRegistering({from: second}), 'Ownable: caller is not the owner');
            });

            it("Another account can launch endProposalsRegistering, revert", async () => {
                await expectRevert(VotingInstance.endProposalsRegistering({from: second}), 'Ownable: caller is not the owner');
            });

            it("Another account can launch startVotingSession, revert", async () => {
                await expectRevert(VotingInstance.startVotingSession({from: second}), 'Ownable: caller is not the owner');
            });

            it("Another account can launch endVotingSession, revert", async () => {
                await expectRevert(VotingInstance.endVotingSession({from: second}), 'Ownable: caller is not the owner');
            });

            it("Another account can launch tallyVotes, revert", async () => {
                await expectRevert(VotingInstance.tallyVotes({from: second}), 'Ownable: caller is not the owner');
            });

        });
    })

    describe("Test in Voting context : Worflowstatus is ProposalsRegistrationStarted", function () {

        beforeEach(async function () {
            // Add Voters for second status ProposalsRegistrationStarted
            VotingInstance = await Voting.new({from:owner});
            await VotingInstance.addVoter(second, {from: owner});
            await VotingInstance.addVoter(third, {from: owner});
            await VotingInstance.startProposalsRegistering({from: owner});
        });

        context("Test Getter getOneProposal", function () {
            
            it("account who is not a voter can't use getOneProposal (onlyVoters), revert", async () => {
                await expectRevert(VotingInstance.getOneProposal(new BN(0), {from: owner}), "You're not a voter");
            });

            it("Voter account can use getOneProposal (onlyVoters)", async () => {
                const storedData = await VotingInstance.getOneProposal(new BN(0), {from: second});
                expect(storedData.description).to.be.equal('GENESIS');
            });

            it("Voter account can't use getOneProposal with array ID out of range, revert", async () => {
                await expectRevert.unspecified(VotingInstance.getOneProposal(new BN(1), {from: second}));
            });
        });

        context("Test addProposal", function () {
            
            it("Account who is not voter can't add Proposal, revert", async () => {
                await expectRevert(VotingInstance.addProposal('DUPONT', {from: owner}), "You're not a voter");
            });

            it("Voter account can add proposal", async () => {
                await VotingInstance.addProposal('DUPONT', {from: second});
                const storedData = await VotingInstance.getOneProposal(1, {from: second});
                expect(storedData.description).to.be.equal('DUPONT');
            });

            it("Voter account can't add an empty proposal", async () => {
                await expectRevert(VotingInstance.addProposal('', {from: second}), "Vous ne pouvez pas ne rien proposer");
            });

            it("should voter add a new proposal, get event ProposalRegistered", async () => {
                const findEvent = await VotingInstance.addProposal('DUPONT', {from: second});
                expectEvent(findEvent,"ProposalRegistered");
            });

        });
    
        context("Test changing state since workflowstatus startProposalsRegistering for Owner", function () {
            
            it("should owner can launch endProposalsRegistering", async () => {
                await VotingInstance.endProposalsRegistering({from: owner});
                expect(await VotingInstance.workflowStatus.call()).to.be.bignumber.equal(new BN(2));
            });

            it("should owner can launch endProposalsRegistering, get event WorkflowStatusChange", async () => {
                let previousStatus = await VotingInstance.workflowStatus.call();
                const findEvent = await VotingInstance.endProposalsRegistering({from: owner});
                let newStatus = await VotingInstance.workflowStatus.call();
                expectEvent(findEvent,"WorkflowStatusChange", {previousStatus, newStatus});
            });

            it("Owner can't launch startVotingSession since startProposalsRegistering, revert", async () => {
                await expectRevert(VotingInstance.startVotingSession({from: owner}), 'Registering proposals phase is not finished');
            });

            it("Owner can't launch endVotingSession since startProposalsRegistering, revert", async () => {
                await expectRevert(VotingInstance.endVotingSession({from: owner}), 'Voting session havent started yet');
            });

            it("Owner can't launch tallyVotes since startProposalsRegistering, revert", async () => {
                await expectRevert(VotingInstance.tallyVotes({from: owner}), 'Current status is not voting session ended');
            });
        });
    });
    
    describe("Test in Voting context : Worflowstatus is VotingSessionStarted", function () {

        beforeEach(async function () {
            // Add Voters and proposals - And start voting session
            VotingInstance = await Voting.new({from:owner});
            await VotingInstance.addVoter(second, {from: owner});
            await VotingInstance.addVoter(third, {from: owner});
            await VotingInstance.startProposalsRegistering({from: owner});
            await VotingInstance.addProposal('DUPONT', {from: second});
            await VotingInstance.addProposal('LEGRAND', {from: third});
            await VotingInstance.addProposal('PETIT', {from: second});
            await VotingInstance.endProposalsRegistering({from: owner});
            await VotingInstance.startVotingSession({from: owner});
        });

        context("Test function setVote", function () {
           
            it("Account who is not voter can't vote, revert", async () => {
                await expectRevert(VotingInstance.setVote(new BN(0), {from: owner}), "You're not a voter");
            });

            it("Voter can vote for proposal, set hasVoted", async () => {
                await VotingInstance.setVote(new BN(0), {from: second});
                const storedData = await VotingInstance.getVoter(second, {from: second});
                expect(storedData.hasVoted).to.be.true;
            });

            it("Voter can vote for proposal, set votedProposalId", async () => {
                await VotingInstance.setVote(new BN(0), {from: second});
                const storedData = await VotingInstance.getVoter(second, {from: second});
                expect(storedData.votedProposalId).to.be.bignumber.equal(new BN(0));
            });

            it("Voter account can't vote if already vote (hasVoted) ", async () => {
                await VotingInstance.setVote(new BN(0), {from: second});
                await expectRevert(VotingInstance.setVote(new BN(1), {from: second}), "You have already voted");
            });

            it("should voter add a new vote, get event Voted", async () => {
                const findEvent = await VotingInstance.setVote(new BN(1), {from: second});
                expectEvent(findEvent,"Voted");
            });
        });

        context("Test changing state since workflowstatus VotingSessionStarted for Owner", function () {
            
            it("should owner can launch endVotingSession", async () => {
                await VotingInstance.endVotingSession({from: owner});
                expect(await VotingInstance.workflowStatus.call()).to.be.bignumber.equal(new BN(4));
            });

            it("should owner can launch endVotingSession, get event WorkflowStatusChange", async () => {
                let previousStatus = await VotingInstance.workflowStatus.call();
                const findEvent = await VotingInstance.endVotingSession({from: owner});
                let newStatus = await VotingInstance.workflowStatus.call();
                expectEvent(findEvent,"WorkflowStatusChange", {previousStatus, newStatus});
            });

            it("Owner can't launch startProposalsRegistering since VotingSessionStarted, revert", async () => {
                await expectRevert(VotingInstance.startProposalsRegistering({from: owner}), 'Registering proposals cant be started now');
            });

            it("Owner can't launch endProposalsRegistering since VotingSessionStarted, revert", async () => {
                await expectRevert(VotingInstance.endProposalsRegistering({from: owner}), 'Registering proposals havent started yet');
            });

            it("Owner can't launch tallyVotes since VotingSessionStarted, revert", async () => {
                await expectRevert(VotingInstance.tallyVotes({from: owner}), 'Current status is not voting session ended');
            });
        });
    });
    
    describe("Test in Voting context : Worflowstatus is VotingSessionEnded", function () {

        beforeEach(async function () {
            // Add Voters and proposals - And start voting session
            VotingInstance = await Voting.new({from:owner});
            await VotingInstance.addVoter(second, {from: owner});
            await VotingInstance.addVoter(third, {from: owner});
            await VotingInstance.addVoter(four, {from: owner});
            await VotingInstance.startProposalsRegistering({from: owner});
            await VotingInstance.addProposal('DUPONT', {from: second});
            await VotingInstance.addProposal('LEGRAND', {from: third});
            await VotingInstance.addProposal('PETIT', {from: second});
            await VotingInstance.endProposalsRegistering({from: owner});
            await VotingInstance.startVotingSession({from: owner});
            await VotingInstance.setVote(new BN(2), {from: second});
            await VotingInstance.setVote(new BN(2), {from: third});
            await VotingInstance.setVote(new BN(2), {from: four});
            await VotingInstance.endVotingSession({from: owner});
        });

        context("Test function Tallvotes", function () {
            
            it("Account who is not owner can't launch TallyVotes, revert", async () => {
                await expectRevert(VotingInstance.tallyVotes({from: second}), "Ownable: caller is not the owner");
            });

            it("Owner can launch Tallyvote, get winningProposalID", async () => {
                await VotingInstance.tallyVotes({from: owner});
                expect(await VotingInstance.winningProposalID.call()).to.be.bignumber.equal(new BN(2));
            });

            it("Owner launch tallyVotes, get event VotesTallied", async () => {
                let previousStatus = await VotingInstance.workflowStatus.call();
                const findEvent =  await VotingInstance.tallyVotes({from: owner});
                let newStatus = await VotingInstance.workflowStatus.call();
                expectEvent(findEvent,"WorkflowStatusChange", {previousStatus, newStatus});
            });

            it("should Workflow status is set to VotesTallied", async () => {
                await VotingInstance.tallyVotes({from: owner});
                expect(await VotingInstance.workflowStatus.call()).to.be.bignumber.equal(new BN(5));
            });

        });

    });
});