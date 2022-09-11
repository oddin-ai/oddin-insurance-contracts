import { Contract, ContractFactory } from '@ethersproject/contracts';
import { expect } from 'chai';
import { network, deployments, ethers } from 'hardhat';
import constants from '../constants/constants';
import fUSD from '../constants/fUSD';

describe('Insurance Pool Test', function () {
    // set-up
    let fUSDContract: ContractFactory, MockfUSD: Contract;
    let MockCoverManager: Contract, MockInsurancePool: Contract;
    this.beforeAll(async () => {

        fUSDContract = await ethers.getContractFactory(fUSD.abi, fUSD.bytecode);
        MockfUSD = await fUSDContract.deploy();
        await deployments.fixture(["all"])
        MockInsurancePool = await ethers.getContract("InsurancePool")
        MockCoverManager = await ethers.getContract("CoverManager")

    });

    // sufficient amount
    it('Deposit - sufficient amount', async function () {
        const [owner] = await ethers.getSigners();
        MockfUSD
        expect(await ).to.equal(ownerBalance);
    });

    // insufficient amount

    // suffiecient EOA balance in NATIVE STABLE TOKEN

    // in sufficient EOA balance in NATIVE STABLE TOKEN

    // suffiecient Cover Manager balance in NATIVE STABLE TOKEN

    // in sufficient Cover Manager balance in NATIVE STABLE TOKEN

    // extreme cases ?
});
