import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { network, deployments, ethers, getNamedAccounts } from 'hardhat';
import {
    FiatTokenV1,
    InsurancePool,
    CoverManager,
} from '../../typechain-types';
import constants from '../../helpers/constants';
import { Decimals18 } from '../../helpers/functions';

describe('Cover Manager Test', function () {
    // set-up
    let accounts;
    let externalDeployer: string;
    let deployer: string;
    let user_a: string;
    let user_b: string;
    let minter: string;
    let externalDeployer_Singer: SignerWithAddress;
    let deployer_Singer: SignerWithAddress;
    let user_a_Singer: SignerWithAddress;
    let user_b_Singer: SignerWithAddress;
    let minter_Singer: SignerWithAddress;
    let Mock_fUSD: FiatTokenV1;
    let Mock_InsurancePool: InsurancePool;
    let Mock_CoverManager: CoverManager;
    before(async () => {
        // await network.provider.send('hardhat_reset');
        const namedAccounts = await getNamedAccounts();
        externalDeployer_Singer = await ethers.getSigner(
            namedAccounts.externalDeployer
        );
        deployer_Singer = await ethers.getSigner(namedAccounts.deployer);
        user_a_Singer = await ethers.getSigner(namedAccounts.user_a);
        user_b_Singer = await ethers.getSigner(namedAccounts.user_b);
        minter_Singer = await ethers.getSigner(namedAccounts.externalAdmin);
        externalDeployer = externalDeployer_Singer.address;
        deployer = deployer_Singer.address;
        user_a = user_a_Singer.address;
        user_b = user_b_Singer.address;
        minter = minter_Singer.address;

        accounts = (await ethers.getSigners()).slice(5);
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
            await Mock_fUSD.connect(externalDeployer_Singer).configureMinter(
                minter,
                Decimals18(constants._1m)
            );
            await Mock_fUSD.connect(minter_Singer).mint(
                user_a,
                Decimals18(constants._500k)
            );
            await Mock_fUSD.connect(minter_Singer).mint(
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
