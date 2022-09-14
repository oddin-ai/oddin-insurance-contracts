import { expect } from 'chai';
import { network, deployments, ethers, getNamedAccounts } from 'hardhat';
import {
    FiatTokenV1,
    InsurancePool,
    CoverManager,
} from '../../typechain-types';
import constants from '../helpers/constants';
import { ValueStringInEthers } from '../helpers/functions';

describe('Insurance Pool Test', function () {
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
    this.beforeEach(async () => {
        await network.provider.send('hardhat_reset');

        const { deployer, externalDeployer, user_a, user_b, externalAdmin } =
            await getNamedAccounts();
        minter = externalAdmin;

        accounts = await ethers.getSigners();
        fake_address = accounts[10];

        await deployments.fixture(['dist']);

        Mock_InsurancePool = await ethers.getContract(
            'InsurancePool',
            deployer
        );

        // MockCoverManager = await ethers.getContract("CoverManager")
        await Mock_fUSD.connect(externalDeployer).configureMinter(
            minter,
            constants._1m
        );
        await Mock_fUSD.connect(minter).mint(user_a, constants._500k);
        await Mock_fUSD.connect(minter).mint(user_b, constants._50k);
    });

    describe('Deposit Function', function () {
        it('Deposit - sufficient amount & sufficient account balance & sufficient allowance', async function () {
            await Mock_fUSD.connect(user_a).approve(
                Mock_InsurancePool.address,
                constants._100k
            );
            expect(
                await Mock_InsurancePool.connect(user_a).Deposit(
                    constants._100k
                )
            )
                .to.emit(Mock_InsurancePool, 'PoolFundDeposited')
                .withArgs(user_a, constants._100k);
            expect((await Mock_fUSD.balanceOf(user_a)).toString()).to.equal(
                '400000'
            );
        });

        it('Deposit - sufficient amount & sufficient account balance & insufficient allowance', async function () {
            await Mock_fUSD.connect(user_a).approve(
                Mock_InsurancePool.address,
                constants._10k
            );
            await expect(
                Mock_InsurancePool.connect(user_a).Deposit(constants._100k)
            ).to.be.reverted;
        });

        it('Deposit - insufficient amount & sufficient account balance & sufficient allowance', async function () {
            await Mock_fUSD.connect(user_a).approve(
                Mock_InsurancePool.address,
                constants._10k
            );
            await expect(
                Mock_InsurancePool.connect(user_a).Deposit(constants._10k)
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
                constants._50k
            );
            await expect(
                Mock_InsurancePool.connect(user_b).Deposit(constants._100k)
            ).to.be.revertedWith('Account: Insufficient balance');
        });

        it('Deposit - insufficient amount & insufficient account balance', async function () {
            await Mock_fUSD.connect(user_b).approve(
                Mock_InsurancePool.address,
                constants._10k
            );
            await expect(
                Mock_InsurancePool.connect(user_b).Deposit(constants._10k)
            ).to.be.revertedWith('Pool: Insufficient fund');
        });
    });

    describe('Withdraw Function', function () {
        it('Withdraw - sufficient amount & sufficient account balance & sufficient allowance', async function () {
            expect(
                await Mock_InsurancePool.connect(user_a).Deposit(
                    constants._100k
                )
            )
                .to.emit(Mock_InsurancePool, 'PoolFundDeposited')
                .withArgs(user_a, constants._100k);
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
