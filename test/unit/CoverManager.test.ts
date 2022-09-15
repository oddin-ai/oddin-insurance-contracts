import { expect } from 'chai';
import { network, deployments, ethers, getNamedAccounts } from 'hardhat';
import {
    FiatTokenV1,
    InsurancePool,
    CoverManager,
} from '../../typechain-types';
import constants from '../helpers/constants';
import { Decimals18 } from '../helpers/functions';

describe('Cover Manager Test', function () {
    // set-up
    let accounts;
    let externalDeployer: string;
    let deployer: string;
    let user_a: string;
    let user_b: string;
    let minter: string;
    let fake_address;
    let Mock_fUSD: FiatTokenV1;
    let Mock_InsurancePool: InsurancePool;
    let Mock_CoverManager: CoverManager;
    before(async () => {
        // await network.provider.send('hardhat_reset');
        const namedAccounts = await getNamedAccounts();
        deployer = namedAccounts.deployer;
        externalDeployer = namedAccounts.externalDeployer;
        minter = namedAccounts.externalAdmin;
        user_a = namedAccounts.user_a;
        user_b = namedAccounts.user_b;
        accounts = await ethers.getSigners();
        fake_address = accounts[10];

        await deployments.fixture(['all']);
    });
    describe('Function RegisterCover', function () {
        before(async () => {
            await deployments.fixture(['all']);

            Mock_InsurancePool = await ethers.getContract(
                'InsurancePool',
                deployer
            );
            Mock_fUSD = await ethers.getContract('FiatTokenV1', deployer);
            // MockCoverManager = await ethers.getContract("CoverManager")
            await Mock_fUSD.connect(externalDeployer).configureMinter(
                minter,
                Decimals18(constants._1m)
            );
            await Mock_fUSD.connect(minter).mint(
                user_a,
                Decimals18(constants._500k)
            );
            await Mock_fUSD.connect(minter).mint(
                user_b,
                Decimals18(constants._50k)
            );
        });
        it('RegisterCover NEW - V amount & V period', async function () {});
        it('RegisterCover NEW - V amount & X period', async function () {});
        it('RegisterCover NEW - X amount & V period', async function () {});
        it('RegisterCover NEW - X amount & X period', async function () {});
        it('RegisterCover UPDATE - V amount & V period', async function () {});
        it('RegisterCover UPDATE - V amount & X period', async function () {});
        it('RegisterCover UPDATE - X amount & V period', async function () {});
        it('RegisterCover UPDATE - X amount & X period', async function () {});
    });
});
