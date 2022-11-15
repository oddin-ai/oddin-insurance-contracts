import { expect } from 'chai';
import {
    network,
    deployments,
    ethers,
    getNamedAccounts,
    upgrades,
} from 'hardhat';
import {
    FiatTokenV1,
    FiatTokenV1__factory,
    InsurancePool,
    InsurancePool__factory,
    QuoteManager,
} from '../../typechain-types';
import constants from '../../helpers/constants';
import { Decimals18 } from '../../helpers/functions';
import initials from '../../helpers/deploy-initials';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { MockContract, FakeContract, smock } from '@defi-wonderland/smock';
import { BigNumberish, Contract } from 'ethers';
import { developmentChains } from '../../helper-hardhat-config';

!developmentChains.includes(network.name)? describe.skip :
describe('Insurance Pool Unit Test', function () {
    // set-up
    let deployer: string;
    let user_a: string;
    let user_b: string;
    let minter: string;
    let externalDeployer: string;
    let externalDeployer_Singer: SignerWithAddress;
    let deployer_Singer: SignerWithAddress;
    let user_a_Singer: SignerWithAddress;
    let user_b_Singer: SignerWithAddress;
    let minter_Singer: SignerWithAddress;
    let Mock_fUSD: MockContract<FiatTokenV1>;
    let Mock_InsurancePool: MockContract<InsurancePool>;
    let Mock_QuoteManager: QuoteManager;

    const allowed: { [key: string]: { [key: string]: BigNumberish } } = {};
    const balances: { [key: string]: BigNumberish } = {};

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
        deployer = deployer_Singer.address;
        externalDeployer = externalDeployer_Singer.address;
        user_a = user_a_Singer.address;
        user_b = user_b_Singer.address;
        minter = minter_Singer.address;

        allowed[user_a] = {};
        allowed[user_b] = {};
        allowed[deployer] = {};
        allowed[externalDeployer] = {};
        allowed[minter] = {};

        const Mock_fUSD_Factory = await smock.mock<FiatTokenV1__factory>(
            'FiatTokenV1'
        );
        Mock_fUSD = await Mock_fUSD_Factory.connect(deployer_Singer).deploy();
        await Mock_fUSD.connect(deployer_Singer).initialize(
            'FUSE USD',
            'fUSD',
            'USD',
            18,
            externalDeployer,
            externalDeployer,
            externalDeployer,
            externalDeployer
        );

        const Mock_InsurancePool_Factory =
            await smock.mock<InsurancePool__factory>('InsurancePool');
        Mock_InsurancePool = await Mock_InsurancePool_Factory.connect(
            deployer_Singer
        ).deploy();
        await Mock_InsurancePool.connect(deployer_Singer).initialize(
            initials.minFunding,
            Mock_fUSD.address
        );
    });

    describe('Unit - Function Deposit(uint256 _amount) external payable', function () {
        before(async () => {
            // Mock_fUSD = await ethers.getContract('FiatTokenV1', deployer);
            // await Mock_fUSD.connect(externalDeployer_Singer).configureMinter(
            //     minter,
            //     Decimals18(constants._1m)
            // );
            // await Mock_fUSD.connect(minter_Singer).mint(
            //     user_a,
            //     Decimals18(constants._500k)
            // );
            // await Mock_fUSD.connect(minter_Singer).mint(
            //     user_b,
            //     Decimals18(constants._1k)
            // );

            balances[user_a] = Decimals18(constants._500k);
            balances[user_b] = Decimals18(constants._1k);
            await Mock_fUSD.setVariable('balances', balances);
        });
        // beforeEach(async () => {
        //     allowed = {}
        //     balance = {}
        // })
        it('Deposit - sufficient amount & sufficient account balance & sufficient allowance', async function () {
            allowed[user_a][Mock_InsurancePool.address] = Decimals18(
                constants._100k
            );
            await Mock_fUSD.setVariable('allowed', allowed);
            expect(
                (
                    await Mock_fUSD.allowance(
                        user_a,
                        Mock_InsurancePool.address
                    )
                ).toString()
            ).to.equal(Decimals18(constants._100k));

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
            allowed[user_a][Mock_InsurancePool.address] = Decimals18(
                constants._10k
            );
            await Mock_fUSD.setVariable('allowed', allowed);
            await expect(
                Mock_InsurancePool.connect(user_a_Singer).Deposit(
                    Decimals18(constants._100k)
                )
            ).to.be.reverted;
        });

        it('Deposit - insufficient amount & sufficient account balance & sufficient allowance', async function () {
            allowed[user_a][Mock_InsurancePool.address] = Decimals18(
                constants._500
            );
            await Mock_fUSD.setVariable('allowed', allowed);
            await expect(
                Mock_InsurancePool.connect(user_a_Singer).Deposit(
                    Decimals18(constants._500)
                )
            ).to.be.revertedWith('Pool: Insufficient fund');
        });

        it('Deposit - 0 amount & sufficient account balance', async function () {
            allowed[user_a][Mock_InsurancePool.address] = Decimals18('0');
            await Mock_fUSD.setVariable('allowed', allowed);
            await expect(
                Mock_InsurancePool.connect(user_a_Singer).Deposit('0')
            ).to.be.revertedWith('Pool: Insufficient fund');
        });

        it('Deposit - sufficient amount & insufficient account balance', async function () {
            allowed[user_b][Mock_InsurancePool.address] = Decimals18(
                constants._1k
            );
            await Mock_fUSD.setVariable('allowed', allowed);
            await expect(
                Mock_InsurancePool.connect(user_b_Singer).Deposit(
                    Decimals18(constants._10k)
                )
            ).to.be.revertedWith('Account: Insufficient balance');
        });

        it('Deposit - insufficient amount & insufficient account balance', async function () {
            allowed[user_b][Mock_InsurancePool.address] = Decimals18(
                constants._500
            );
            await Mock_fUSD.setVariable('allowed', allowed);
            await expect(
                Mock_InsurancePool.connect(user_b_Singer).Deposit(
                    Decimals18(constants._500)
                )
            ).to.be.revertedWith('Pool: Insufficient fund');
        });
    });

    describe('Withdraw Function', function () {
        let activeCover: BigNumberish = 0;
        const funds: { [key: string]: BigNumberish } = {};
        before(async () => {
            // populate fUSD
            balances[user_a] = Decimals18(constants._500k);
            balances[user_b] = Decimals18(constants._50k);
            balances[Mock_InsurancePool.address] = Decimals18(constants._150k);
            await Mock_fUSD.setVariable('balances', balances);
            // populate pool
            await Mock_InsurancePool.setVariable(
                'totalFunds',
                Decimals18(constants._150k)
            );
            await Mock_InsurancePool.setVariable(
                'activeCoverage',
                Decimals18(constants._20k)
            );

            funds[user_a] = Decimals18(constants._50k);

            await Mock_InsurancePool.setVariable('funds', funds);

            // verify starting point
            expect(await Mock_InsurancePool.ActiveCoverage()).to.eq(
                Decimals18(constants._20k)
            );
            expect(await Mock_fUSD.balanceOf(Mock_InsurancePool.address)).to.eq(
                Decimals18(constants._150k)
            );
        });
        it('Withdraw - sufficient available balance & possible amount for user', async function () {
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
        it('Withdraw - sufficient available balance & too high amount for user', async function () {
            await expect(
                Mock_InsurancePool.connect(user_a_Singer).Withdraw(
                    Decimals18(constants._100k)
                )
            ).to.be.reverted;
        });
        it('Withdraw - sufficient available balance & too high amount for pool', async function () {
            await expect(
                Mock_InsurancePool.connect(user_a_Singer).Withdraw(
                    Decimals18(constants._150k)
                )
            ).to.be.revertedWith('Pool: Insufficient available funds');
        });
        it('Withdraw - insufficient available balance & good amount', async function () {
            await Mock_InsurancePool.setVariable(
                'activeCoverage',
                Decimals18(constants._100k)
            );
            await expect(
                Mock_InsurancePool.connect(user_a_Singer).Withdraw(
                    Decimals18(constants._50k)
                )
            ).to.be.reverted;
        });
        it('Withdraw - bad amount', async function () {
            await expect(
                Mock_InsurancePool.connect(user_a_Singer).Withdraw('0')
            ).to.be.revertedWith('Pool: Insufficient withdraw');
        });

        it('Withdraw - no funds of user', async function () {
            await expect(
                Mock_InsurancePool.connect(user_b_Singer).Withdraw(
                    Decimals18(constants._10k)
                )
            ).to.be.reverted;
        });
    });

    // extreme cases ?
});
