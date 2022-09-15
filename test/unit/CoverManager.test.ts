import { expect } from 'chai';
import { network, deployments, ethers, getNamedAccounts } from 'hardhat';
import {
    FiatTokenV1,
    InsurancePool,
    CoverManager,
} from '../../typechain-types';
import constants from '../helpers/constants';
import { ValueStringInEthers } from '../helpers/functions';

describe('Cover Manager Test', function () {
    // set-up
    let accounts;
    let externalDeployer;
    let deployer;
    let user_a: string;
    let user_b: string;
    let minter;
    let fake_address;
    let Mock_fUSD: FiatTokenV1;
    let Mock_InsurancePool: InsurancePool;
    let Mock_CoverManager: CoverManager;
    this.beforeAll(async () => {
        await network.provider.send('hardhat_reset');

        const { deployer, externalDeployer, user_a, user_b, externalAdmin } =
            await getNamedAccounts();
        minter = externalAdmin;

        accounts = await ethers.getSigners();
        fake_address = accounts[10];

        await deployments.fixture(['all']);

        Mock_InsurancePool = await ethers.getContract(
            'InsurancePool',
            deployer
        );
        Mock_CoverManager = await ethers.getContract('CoverManager', deployer);
        Mock_fUSD = await ethers.getContract('FiatTokenV1', externalDeployer);
    });
    describe('Function RegisterCover', function () {
        this.beforeAll(async () => {
            await deployments.fixture(['all']);
        });
        it('RegisterCover - V amount & V period', async function () {});
        it('RegisterCover - V amount & X period', async function () {});
        it('RegisterCover - X amount & V period', async function () {});
        it('RegisterCover - X amount & X period', async function () {});
    });
});
