import { expect } from 'chai';
import { deployments, ethers, getNamedAccounts } from 'hardhat';
import {
    FiatTokenV1,
    InsurancePool,
    QuoteManager,
} from '../../typechain-types';
import constants from '../../helpers/constants';
import { Decimals18 } from '../../helpers/functions';
import {} from '../../deploy/00-deploy-mocks';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
// import deployMock_FiatTokenV1 from '../../deploy/00-deploy-mock-FiatTokenV1';

describe('Insurance Pool Test', function () {
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
    let Mock_CoverManager: QuoteManager;
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
        accounts = await ethers.getSigners();
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
                Decimals18(constants._1k)
            );
        });
        it('Deposit - sufficient amount & sufficient account balance & sufficient allowance', async function () {
            await Mock_fUSD.connect(user_a_Singer).approve(
                Mock_InsurancePool.address,
                Decimals18(constants._100k)
            );
            expect(
                await Mock_InsurancePool.connect(user_a_Singer).Deposit(
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
            await Mock_fUSD.connect(user_a_Singer).approve(
                Mock_InsurancePool.address,
                Decimals18(constants._10k)
            );
            await expect(
                Mock_InsurancePool.connect(user_a_Singer).Deposit(
                    Decimals18(constants._100k)
                )
            ).to.be.reverted;
        });

        it('Deposit - insufficient amount & sufficient account balance & sufficient allowance', async function () {
            await Mock_fUSD.connect(user_a_Singer).approve(
                Mock_InsurancePool.address,
                Decimals18(constants._500)
            );
            await expect(
                Mock_InsurancePool.connect(user_a_Singer).Deposit(
                    Decimals18(constants._500)
                )
            ).to.be.revertedWith('Pool: Insufficient fund');
        });

        it('Deposit - 0 amount & sufficient account balance', async function () {
            await Mock_fUSD.connect(user_a_Singer).approve(
                Mock_InsurancePool.address,
                '0'
            );
            await expect(
                Mock_InsurancePool.connect(user_a_Singer).Deposit('0')
            ).to.be.revertedWith('Pool: Insufficient fund');
        });

        it('Deposit - sufficient amount & insufficient account balance', async function () {
            await Mock_fUSD.connect(user_b_Singer).approve(
                Mock_InsurancePool.address,
                Decimals18(constants._1k)
            );
            await expect(
                Mock_InsurancePool.connect(user_b_Singer).Deposit(
                    Decimals18(constants._10k)
                )
            ).to.be.revertedWith('Account: Insufficient balance');
        });

        it('Deposit - insufficient amount & insufficient account balance', async function () {
            await Mock_fUSD.connect(user_b_Singer).approve(
                Mock_InsurancePool.address,
                Decimals18(constants._500)
            );
            await expect(
                Mock_InsurancePool.connect(user_b_Singer).Deposit(
                    Decimals18(constants._500)
                )
            ).to.be.revertedWith('Pool: Insufficient fund');
        });
    });

    describe('Withdraw Function', function () {
        before(async () => {
            await deployments.fixture(['all']);

            Mock_InsurancePool = await ethers.getContract(
                'InsurancePool',
                deployer
            );
            Mock_fUSD = await ethers.getContract('FiatTokenV1', deployer);
            Mock_CoverManager = await ethers.getContract(
                'CoverManager',
                deployer
            );
            // populate fUSD
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
            await Mock_fUSD.connect(minter_Singer).mint(
                Mock_CoverManager.address,
                Decimals18(constants._5k)
            );
            // populate pool
            await Mock_fUSD.connect(user_a_Singer).approve(
                Mock_InsurancePool.address,
                Decimals18(constants._100k)
            );
            await Mock_InsurancePool.connect(user_a_Singer).Deposit(
                Decimals18(constants._100k)
            );
            await Mock_fUSD.connect(user_b_Singer).approve(
                Mock_InsurancePool.address,
                Decimals18(constants._50k)
            );
            await Mock_InsurancePool.connect(user_b_Singer).Deposit(
                Decimals18(constants._50k)
            );
            // this is bulls**t for testing!
            await Mock_InsurancePool.connect(deployer_Singer).setCoverManager(
                deployer
            );
            await Mock_InsurancePool.connect(
                deployer_Singer
            ).updateActiveCoverage(true, Decimals18(constants._20k));
            // End bulls**t
            // verify starting point
            expect(await Mock_InsurancePool.ActiveCoverage()).to.eq(
                Decimals18(constants._20k)
            );
            expect(await Mock_fUSD.balanceOf(Mock_InsurancePool.address)).to.eq(
                Decimals18(constants._150k)
            );
            expect(await Mock_fUSD.balanceOf(Mock_CoverManager.address)).to.eq(
                Decimals18(constants._5k)
            );
        });
        it('Withdraw - available amount & sufficient4 active cover balance', async function () {
            await expect(
                Mock_InsurancePool.connect(user_a_Singer).Withdraw(
                    Decimals18(constants._50k)
                )
            )
                .to.emit(Mock_InsurancePool, 'PoolFundWithdrawn')
                .withArgs(user_a, Decimals18(constants._50k));

            expect(
                await Mock_fUSD.balanceOf(Mock_InsurancePool.address)
            ).to.be.eq(Decimals18(constants._100k));
        });
    });

    // extreme cases ?
});
