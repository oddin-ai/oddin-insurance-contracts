import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { network, deployments, ethers, upgrades } from 'hardhat';
import {
    FiatTokenV1,
    FiatTokenV1__factory,
    InsurancePool,
    InsurancePool__factory,
} from '../../typechain-types';
import constants from '../helpers/constants';
import { ValueStringInEthers } from '../helpers/functions';

describe('Insurance Pool Test', function () {
    // set-up
    let accounts;
    let master_all;
    let master_oddin;
    let user_a: SignerWithAddress;
    let user_b: SignerWithAddress;
    let minter;
    let fake_address;
    let fUSDContract: FiatTokenV1__factory, MockfUSD: FiatTokenV1;
    let InsurancePool: InsurancePool__factory, MockInsurancePool: InsurancePool;
    this.beforeAll(async () => {
        await network.provider.send('hardhat_reset');
        accounts = await ethers.getSigners();
        master_all = accounts[0];
        master_oddin = accounts[1];
        user_a = accounts[2];
        user_b = accounts[3];
        minter = accounts[4];
        fake_address = accounts[5];
        fUSDContract = await ethers.getContractFactory(
            'FiatTokenV1',
            master_all.address
        );
        MockfUSD = (await upgrades.deployProxy(fUSDContract, [
            'Fuse USD',
            'fUSD',
            'USD',
            0,
            master_all.address,
            master_all.address,
            master_all.address,
            master_all.address,
        ])) as FiatTokenV1;
        await MockfUSD.deployed();

        InsurancePool = await ethers.getContractFactory(
            'InsurancePool',
            master_oddin.address
        );
        MockInsurancePool = (await upgrades.deployProxy(
            InsurancePool,
            [
                constants._50k, //  '50000', // uint256 _minFund,
                MockfUSD.address, // address _nativeStable,
                fake_address.address, // address _coverManager,
                fake_address.address, // address _withdrawManager
            ],
            {
                kind: 'uups',
                initializer: 'initialize',
            }
        )) as InsurancePool;
        await MockInsurancePool.deployed();
        // MockCoverManager = await ethers.getContract("CoverManager")
        await MockfUSD.connect(master_all).configureMinter(
            minter.address,
            constants._1m
        );
        await MockfUSD.connect(minter).mint(user_a.address, constants._500k);
        await MockfUSD.connect(minter).mint(user_b.address, constants._50k);
    });

    describe('Deposit Function', function () {
        it('Deposit - sufficient amount & sufficient account balance & sufficient allowance', async function () {
            await MockfUSD.connect(user_a).approve(
                MockInsurancePool.address,
                constants._100k
            );
            expect(
                await MockInsurancePool.connect(user_a).Deposit(constants._100k)
            )
                .to.emit(MockInsurancePool, 'PoolFundDeposited')
                .withArgs(user_a.address, constants._100k);
            expect(
                (await MockfUSD.balanceOf(user_a.address)).toString()
            ).to.equal('400000');
        });

        it('Deposit - sufficient amount & sufficient account balance & insufficient allowance', async function () {
            await MockfUSD.connect(user_a).approve(
                MockInsurancePool.address,
                constants._10k
            );
            await expect(
                MockInsurancePool.connect(user_a).Deposit(constants._100k)
            ).to.be.reverted;
        });

        it('Deposit - insufficient amount & sufficient account balance & sufficient allowance', async function () {
            await MockfUSD.connect(user_a).approve(
                MockInsurancePool.address,
                constants._10k
            );
            await expect(
                MockInsurancePool.connect(user_a).Deposit(constants._10k)
            ).to.be.revertedWith('Pool: Insufficient fund');
        });

        it('Deposit - 0 amount & sufficient account balance', async function () {
            await MockfUSD.connect(user_a).approve(
                MockInsurancePool.address,
                '0'
            );
            await expect(
                MockInsurancePool.connect(user_a).Deposit('0')
            ).to.be.revertedWith('Pool: Insufficient fund');
        });

        it('Deposit - sufficient amount & insufficient account balance', async function () {
            await MockfUSD.connect(user_b).approve(
                MockInsurancePool.address,
                constants._50k
            );
            await expect(
                MockInsurancePool.connect(user_b).Deposit(constants._100k)
            ).to.be.revertedWith('Account: Insufficient balance');
        });

        it('Deposit - insufficient amount & insufficient account balance', async function () {
            await MockfUSD.connect(user_b).approve(
                MockInsurancePool.address,
                constants._10k
            );
            await expect(
                MockInsurancePool.connect(user_b).Deposit(constants._10k)
            ).to.be.revertedWith('Pool: Insufficient fund');
        });
    });

    describe('Withdraw Function', function () {
        it('Withdraw - sufficient amount & sufficient account balance & sufficient allowance', async function () {
            expect(
                await MockInsurancePool.connect(user_a).Deposit(constants._100k)
            )
                .to.emit(MockInsurancePool, 'PoolFundDeposited')
                .withArgs(user_a.address, constants._100k);
            expect(
                (await MockfUSD.balanceOf(user_a.address)).toString()
            ).to.equal('400000');
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
