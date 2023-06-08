const Spa = artifacts.require("./Spa.sol");
const { BN, expectRevert, expectEvent } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');

contract('Spa', accounts => {
    const owner = accounts[0];
    const second = accounts[1];
    const third = accounts[2];

    let SpaInstance;

    describe.skip("test setter/getter", function () {

        beforeEach(async function () {
            SpaInstance = await Spa.new({from:owner});
        });

        it("should store animal in array, get race", async () => {
            await SpaInstance.Add("chien",100, 3, { from: owner });
            const storedData = await SpaInstance.Get(0);
            expect(storedData.race).to.equal("chien");
        });

        it("should store animal in array, get height", async () => {
            await SpaInstance.Add("chien",100, 3, { from: owner });
            const storedData = await SpaInstance.Get(0);
            expect(storedData.taille).to.be.bignumber.equal(new BN(100));
        });
        it("should store animal in array, get age", async () => {
            await SpaInstance.Add("chien",100, 3, { from: owner });
            const storedData = await SpaInstance.Get(0);
            expect(storedData.age).to.be.bignumber.equal(new BN(3));
        });
        it("should store animal in array, get status", async () => {
            await SpaInstance.Add("chien",100, 3, { from: owner });
            const storedData = await SpaInstance.Get(0);
            expect(storedData.isAdopted).to.be.false;
        });
        it("should store 10 animals in array, get 1 height", async () => {
            await SpaInstance.Add("chien",100, 3, { from: owner });            
            await SpaInstance.Add("chien",100, 3, { from: owner });
            await SpaInstance.Add("chien",100, 3, { from: owner });
            await SpaInstance.Add("chien",100, 3, { from: owner });
            await SpaInstance.Add("chien",150, 4, { from: owner });
            await SpaInstance.Add("chien",100, 3, { from: owner });
            await SpaInstance.Add("chien",100, 3, { from: owner });
            await SpaInstance.Add("chien",100, 3, { from: owner });
            await SpaInstance.Add("chien",100, 3, { from: owner });
            await SpaInstance.Add("chien",100, 3, { from: owner });
            const storedData = await SpaInstance.Get(4);
            expect(storedData.taille).to.be.bignumber.equal(new BN(150));
        });
    });
  })