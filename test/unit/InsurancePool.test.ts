import { expect } from 'chai';
import { network, deployments, ethers, getNamedAccounts } from 'hardhat';
import {
    FiatTokenV1,
    InsurancePool,
    CoverManager,
} from '../../typechain-types';
import constants from '../helpers/constants';
import { Decimals18 } from '../helpers/functions';
import {} from '../../deploy/00-deploy-mocks';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
// import deployMock_FiatTokenV1 from '../../deploy/00-deploy-mock-FiatTokenV1';

describe('Insurance Pool Test', function () {
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
        minter = namedAccounts.externalAdmin;
        deployer = namedAccounts.deployer;
        externalDeployer = namedAccounts.externalDeployer;
        user_a = namedAccounts.user_a;
        user_b = namedAccounts.user_b;
        accounts = await ethers.getSigners();
        fake_address = accounts[10];

        await deployments.fixture(['all']);
    });

    describe('Deposit Function', function () {
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
        it('Deposit - sufficient amount & sufficient account balance & sufficient allowance', async function () {
            await Mock_fUSD.connect(user_a).approve(
                Mock_InsurancePool.address,
                Decimals18(constants._100k)
            );
            expect(
                await Mock_InsurancePool.connect(user_a).Deposit(
                    Decimals18(constants._100k)
                )
            )
                .to.emit(Mock_InsurancePool, 'PoolFundDeposited')
                .withArgs(user_a, Decimals18(constants._100k));
            expect((await Mock_fUSD.balanceOf(user_a)).toString()).to.equal(
                Decimals18('400000')
            );
        });

        it('Deposit - sufficient amount & sufficient account balance & insufficient allowance', async function () {
            await Mock_fUSD.connect(user_a).approve(
                Mock_InsurancePool.address,
                Decimals18(constants._10k)
            );
            await expect(
                Mock_InsurancePool.connect(user_a).Deposit(
                    Decimals18(constants._100k)
                )
            ).to.be.reverted;
        });

        it('Deposit - insufficient amount & sufficient account balance & sufficient allowance', async function () {
            await Mock_fUSD.connect(user_a).approve(
                Mock_InsurancePool.address,
                Decimals18(constants._10k)
            );
            await expect(
                Mock_InsurancePool.connect(user_a).Deposit(
                    Decimals18(constants._10k)
                )
            ).to.be.revertedWith('Pool: Insufficient fund');
        });

        it('Deposit - 0 amount & sufficient account balance', async function () {
            await Mock_fUSD.connect(user_a).approve(
                Mock_InsurancePool.address,
                '0'
            );
            await expect(
                Mock_InsurancePool.connect(user_a).Deposit('0')
            ).to.be.revertedWith('Pool: Insufficient fund');
        });

        it('Deposit - sufficient amount & insufficient account balance', async function () {
            await Mock_fUSD.connect(user_b).approve(
                Mock_InsurancePool.address,
                Decimals18(constants._50k)
            );
            await expect(
                Mock_InsurancePool.connect(user_b).Deposit(
                    Decimals18(constants._100k)
                )
            ).to.be.revertedWith('Account: Insufficient balance');
        });

        it('Deposit - insufficient amount & insufficient account balance', async function () {
            await Mock_fUSD.connect(user_b).approve(
                Mock_InsurancePool.address,
                Decimals18(constants._10k)
            );
            await expect(
                Mock_InsurancePool.connect(user_b).Deposit(
                    Decimals18(constants._10k)
                )
            ).to.be.revertedWith('Pool: Insufficient fund');
        });
    });

    describe('Withdraw Function', function () {
        it('Withdraw - sufficient amount & sufficient account balance & sufficient allowance', async function () {
            expect(
                await Mock_InsurancePool.connect(user_a).Deposit(
                    Decimals18(constants._100k)
                )
            )
                .to.emit(Mock_InsurancePool, 'PoolFundDeposited')
                .withArgs(user_a, Decimals18(constants._100k));
            expect((await Mock_fUSD.balanceOf(user_a)).toString()).to.equal(
                '400000'
            );
        });
    });
    // sufficient amount

    // insufficient amount

    // no amount

    // suffiecient EOA balance in NATIVE STABLE TOKEN

    // in sufficient EOA balance in NATIVE STABLE TOKEN

    // suffiecient Cover Manager balance in NATIVE STABLE TOKEN

    // in sufficient Cover Manager balance in NATIVE STABLE TOKEN

    // extreme cases ?
});
