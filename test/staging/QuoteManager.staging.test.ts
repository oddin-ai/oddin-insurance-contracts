import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { network, deployments, ethers, getNamedAccounts } from 'hardhat';
import {
    FiatTokenV1,
    InsurancePool,
    QuoteManager,
    FeeDistribution,
} from '../../typechain-types';
import constants from '../../helpers/constants';
import { Decimals18 } from '../../helpers/functions';
import { increase } from '@nomicfoundation/hardhat-network-helpers/dist/src/helpers/time';
import initials from '../../helpers/deploy-initials';
import { BigNumber } from 'ethers';
import {
    impersonateAccount,
    setBalance,
    stopImpersonatingAccount,
    time,
    mine,
} from '@nomicfoundation/hardhat-network-helpers';

describe('Quote Manager Staging Test', function () {
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
    let Mock_QuoteManager: QuoteManager;
    let Mock_FeeDistribution: FeeDistribution;
    let Mock_fUSD: FiatTokenV1;
    let Mock_InsurancePool: InsurancePool;
    before(async () => {
        await network.provider.send('hardhat_reset');
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
        Mock_QuoteManager = await ethers.getContract('QuoteManager');
        Mock_InsurancePool = await ethers.getContract(
            'InsurancePool',
            deployer
        );
        Mock_fUSD = await ethers.getContract('FiatTokenV1', deployer);
    });
    describe('Function GetQuote(uint256 _amount, Periods _periodtype) external payable returns (uint256, uint256)', function () {
        let Mock_QuoteManager_USER_A: QuoteManager;
        let Mock_QuoteManager_USER_B: QuoteManager;

        describe('GetQuote - Sufficient pool funds', function () {
            before(async () => {
                await deployments.fixture(['all']);
                await Mock_fUSD.connect(
                    externalDeployer_Singer
                ).configureMinter(minter, Decimals18(constants._1m));
                await Mock_fUSD.connect(minter_Singer).mint(
                    Mock_InsurancePool.address,
                    Decimals18(constants._500k)
                );
                await Mock_fUSD.connect(minter_Singer).mint(
                    user_a,
                    Decimals18(constants._500k)
                );
                await Mock_fUSD.connect(user_a_Singer).approve(
                    Mock_InsurancePool.address,
                    Decimals18(constants._200k)
                );
                await Mock_InsurancePool.connect(user_a_Singer).Deposit(
                    Decimals18(constants._200k)
                );
                Mock_QuoteManager_USER_A =
                    Mock_QuoteManager.connect(user_a_Singer);
                Mock_QuoteManager_USER_B =
                    Mock_QuoteManager.connect(user_b_Singer);
            });
            it('GetQuote - NEW & V amount & V periodtype (0)', async function () {
                const p = Math.floor(
                    (20000 * 250 * initials.periods[0]) / 3650000
                );
                expect(
                    await Mock_QuoteManager_USER_A.GetQuote(
                        Decimals18(constants._20k),
                        0
                    )
                )
                    .to.emit(Mock_QuoteManager, 'oddinNewQuote')
                    .withArgs(user_a, 123, p);
            });
            it('GetQuote - NEW & V amount & V periodtype (1)', async function () {
                const p = Math.floor(
                    (20000 * 250 * initials.periods[1]) / 3650000
                );
                expect(
                    await Mock_QuoteManager_USER_A.GetQuote(
                        Decimals18(constants._20k),
                        1
                    )
                )
                    .to.emit(Mock_QuoteManager, 'oddinNewQuote')
                    .withArgs(user_a, 123, p);
            });
            it('GetQuote - NEW & V amount & V periodtype (2)', async function () {
                const p = Math.floor(
                    (20000 * 250 * initials.periods[2]) / 3650000
                );
                expect(
                    await Mock_QuoteManager_USER_A.GetQuote(
                        Decimals18(constants._20k),
                        2
                    )
                )
                    .to.emit(Mock_QuoteManager, 'oddinNewQuote')
                    .withArgs(user_a, 123, p);
            });
            it('GetQuote - NEW & X amount & V periodtype', async function () {
                await expect(
                    Mock_QuoteManager_USER_A.GetQuote(Decimals18('0'), 2)
                ).to.be.reverted;
            });

            it('GetQuote - NEW & V amount & X periodtype', async function () {
                await expect(
                    Mock_QuoteManager_USER_A.GetQuote(
                        Decimals18(constants._20k),
                        3
                    )
                ).to.be.reverted;
            });

            it('GetQuote - NEW & X amount & X periodtype', async function () {
                await expect(
                    Mock_QuoteManager_USER_A.GetQuote(Decimals18('0'), 3)
                ).to.be.reverted;
            });
        });
        describe('GetQuote - Insufficient pool funds', function () {
            before(async () => {
                await deployments.fixture(['all']);
                await Mock_fUSD.connect(
                    externalDeployer_Singer
                ).configureMinter(minter, Decimals18(constants._1m));
                await Mock_fUSD.connect(minter_Singer).mint(
                    Mock_InsurancePool.address,
                    Decimals18(constants._500k)
                );
                await Mock_fUSD.connect(minter_Singer).mint(
                    user_a,
                    Decimals18(constants._500k)
                );
                await Mock_fUSD.connect(user_a_Singer).approve(
                    Mock_InsurancePool.address,
                    Decimals18(constants._1k)
                );
                await Mock_InsurancePool.connect(user_a_Singer).Deposit(
                    Decimals18(constants._1k)
                );
                Mock_QuoteManager_USER_A =
                    Mock_QuoteManager.connect(user_a_Singer);
                Mock_QuoteManager_USER_B =
                    Mock_QuoteManager.connect(user_b_Singer);
            });
            it('GetQuote - NEW & V amount & V periodtype (0)', async function () {
                const p = Math.floor(
                    (20000 * 250 * initials.periods[0]) / 3650000
                );
                await expect(
                    Mock_QuoteManager_USER_A.GetQuote(
                        Decimals18(constants._20k),
                        0
                    )
                ).to.be.revertedWith('QuoteManager: Insufficient pool funds');
            });
            it('GetQuote - NEW & V amount & V periodtype (1)', async function () {
                const p = Math.floor(
                    (20000 * 250 * initials.periods[1]) / 3650000
                );
                await expect(
                    Mock_QuoteManager_USER_A.GetQuote(
                        Decimals18(constants._20k),
                        1
                    )
                ).to.be.revertedWith('QuoteManager: Insufficient pool funds');
            });
            it('GetQuote - NEW & V amount & V periodtype (2)', async function () {
                const p = Math.floor(
                    (20000 * 250 * initials.periods[2]) / 3650000
                );
                await expect(
                    Mock_QuoteManager_USER_A.GetQuote(
                        Decimals18(constants._20k),
                        2
                    )
                ).to.be.revertedWith('QuoteManager: Insufficient pool funds');
            });
            it('GetQuote - NEW & X amount & V periodtype', async function () {
                await expect(
                    Mock_QuoteManager_USER_A.GetQuote(Decimals18('0'), 2)
                ).to.be.revertedWith('QuoteManager: Insufficient amount');
            });

            it('GetQuote - NEW & V amount & X periodtype', async function () {
                await expect(
                    Mock_QuoteManager_USER_A.GetQuote(
                        Decimals18(constants._20k),
                        3
                    )
                ).to.be.reverted;
            });

            it('GetQuote - NEW & X amount & X periodtype', async function () {
                await expect(
                    Mock_QuoteManager_USER_A.GetQuote(Decimals18('0'), 3)
                ).to.be.reverted;
            });
        });
    });

    describe('Function IsQuoteActive(address _account, uint256 _qid) external view returns (bool, CoverDetails memory)', function () {
        let Mock_QuoteManager_USER_B: QuoteManager;
        let Mock_QuoteManager_USER_A: QuoteManager;
        let Mock_QuoteManager_USER_C: QuoteManager;

        before(async () => {
            await deployments.fixture(['all']);
            Mock_QuoteManager_USER_B = Mock_QuoteManager.connect(user_b_Singer);
            Mock_QuoteManager_USER_A = Mock_QuoteManager.connect(user_a_Singer);
            Mock_QuoteManager_USER_C = Mock_QuoteManager.connect(minter_Singer);
            await Mock_fUSD.connect(externalDeployer_Singer).configureMinter(
                minter,
                Decimals18(constants._1m)
            );
            await Mock_fUSD.connect(minter_Singer).mint(
                Mock_InsurancePool.address,
                Decimals18(constants._500k)
            );
            await Mock_fUSD.connect(minter_Singer).mint(
                user_a,
                Decimals18(constants._500k)
            );
            await Mock_fUSD.connect(user_a_Singer).approve(
                Mock_InsurancePool.address,
                Decimals18(constants._200k)
            );
            await Mock_InsurancePool.connect(user_a_Singer).Deposit(
                Decimals18(constants._200k)
            );
        });

        it('IsQuoteActive - V account & V qid & V expiry', async function () {
            await Mock_QuoteManager_USER_B.GetQuote(
                Decimals18(constants._20k),
                2
            );
            await increase(initials.validDuration - 1);
            const res = await Mock_QuoteManager_USER_B.IsQuoteActive(
                user_b,
                123
            );
            expect(res[0]).to.be.eq(true);
        });

        it('IsQuoteActive - V account & V qid & X expiry', async function () {
            await Mock_QuoteManager_USER_A.GetQuote(
                Decimals18(constants._20k),
                2
            );
            await increase(initials.validDuration + 1);
            const res = await Mock_QuoteManager_USER_A.IsQuoteActive(
                user_b,
                123
            );
            expect(res[0]).to.be.eq(false);
        });
        it('IsQuoteActive - X account & V qid & - expiry', async function () {
            await expect(
                Mock_QuoteManager_USER_C.IsQuoteActive(externalDeployer, 123)
            ).to.revertedWith('QuoteManager: No Quotes with given address/QID');
        });
        it('IsQuoteActive - V account & X qid & - expiry', async function () {
            await expect(
                Mock_QuoteManager_USER_C.IsQuoteActive(user_a, 321)
            ).to.revertedWith('QuoteManager: No Quotes with given address/QID');
        });
        it('IsQuoteActive - X account & X qid & - expiry', async function () {
            await expect(
                Mock_QuoteManager_USER_C.IsQuoteActive(externalDeployer, 321)
            ).to.revertedWith('QuoteManager: No Quotes with given address/QID');
        });
    });

    describe('Function GetQuoteData external view returns (Quote memory)', function () {
        let Mock_QuoteManager_USER_C: QuoteManager;
        before(async () => {
            await deployments.fixture(['all']);
            await Mock_fUSD.connect(externalDeployer_Singer).configureMinter(
                minter,
                Decimals18(constants._1m)
            );
            await Mock_fUSD.connect(minter_Singer).mint(
                Mock_InsurancePool.address,
                Decimals18(constants._500k)
            );
            await Mock_fUSD.connect(minter_Singer).mint(
                user_a,
                Decimals18(constants._500k)
            );
            await Mock_fUSD.connect(user_a_Singer).approve(
                Mock_InsurancePool.address,
                Decimals18(constants._200k)
            );
            await Mock_InsurancePool.connect(user_a_Singer).Deposit(
                Decimals18(constants._200k)
            );
            Mock_QuoteManager_USER_C = Mock_QuoteManager.connect(minter_Singer);
            await Mock_QuoteManager_USER_C.GetQuote(
                Decimals18(constants._20k),
                1
            );
        });
        it('GetQuoteData - V account & V qid', async function () {
            const [res] = await Mock_QuoteManager_USER_C.GetQuoteData(
                minter,
                123
            );

            expect(res.balance).to.be.eq(
                BigNumber.from(Decimals18(constants._20k))
            );
            expect(res.period).to.be.eq(90);
            expect(res.endDate).to.be.eq(
                BigNumber.from(
                    ((await time.latest()) + 90 * 24 * 60 * 60).toString()
                )
            );
            expect(res.premium).to.be.eq(
                BigNumber.from(Decimals18(constants._20k))
                    .mul(250 * 90)
                    .div(3650000)
            );
        });
        it('GetQuoteData - X account & V qid', async function () {
            await expect(
                Mock_QuoteManager_USER_C.GetQuoteData(externalDeployer, 123)
            ).to.revertedWith('QuoteManager: No Quotes with given address/QID');
        });
        it('GetQuoteData - V account & X qid', async function () {
            await expect(
                Mock_QuoteManager_USER_C.GetQuoteData(user_a, 321)
            ).to.revertedWith('QuoteManager: No Quotes with given address/QID');
        });
        it('GetQuoteData - X account & X qid', async function () {
            await expect(
                Mock_QuoteManager_USER_C.GetQuoteData(externalDeployer, 321)
            ).to.revertedWith('QuoteManager: No Quotes with given address/QID');
        });
    });

    describe('Function Verify(address _account, uint256 _qid) external', function () {
        let Mock_QuoteManager_USER_A: QuoteManager;
        let Mock_QuoteManager_FEEDIST: QuoteManager;
        let Mock_QuoteManager_FAKE_FEEDIST: QuoteManager;
        before(async () => {
            await deployments.fixture(['all']);
            await Mock_fUSD.connect(externalDeployer_Singer).configureMinter(
                minter,
                Decimals18(constants._1m)
            );
            await Mock_fUSD.connect(minter_Singer).mint(
                Mock_InsurancePool.address,
                Decimals18(constants._500k)
            );
            await Mock_fUSD.connect(minter_Singer).mint(
                user_a,
                Decimals18(constants._500k)
            );
            await Mock_fUSD.connect(user_a_Singer).approve(
                Mock_InsurancePool.address,
                Decimals18(constants._200k)
            );
            await Mock_InsurancePool.connect(user_a_Singer).Deposit(
                Decimals18(constants._200k)
            );
            Mock_QuoteManager_USER_A = Mock_QuoteManager.connect(user_a_Singer);

            Mock_FeeDistribution = await ethers.getContract(
                'FeeDistribution',
                deployer
            );

            await impersonateAccount(Mock_FeeDistribution.address);
            await setBalance(
                Mock_FeeDistribution.address,
                BigNumber.from(Decimals18(constants._1k)).toHexString()
            );
            // console.log(Mock_FeeDistribution.address);
            // console.log(
            //     (await ethers.getSigner(Mock_FeeDistribution.address)).address
            // );
            Mock_QuoteManager_USER_A = Mock_QuoteManager.connect(user_a_Singer);
            Mock_QuoteManager_FEEDIST = Mock_QuoteManager.connect(
                await ethers.getSigner(Mock_FeeDistribution.address)
            );
            Mock_QuoteManager_FAKE_FEEDIST =
                Mock_QuoteManager.connect(minter_Singer);
            await Mock_QuoteManager_USER_A.GetQuote(
                Decimals18(constants._20k),
                1
            );
        });
        after(async () => {
            await stopImpersonatingAccount(Mock_FeeDistribution.address);
        });
        it('Verify - V COVER_VERIFIER & V account & V qid', async function () {
            expect(await Mock_QuoteManager_FEEDIST.Verify(user_a, 123))
                .to.emit(Mock_QuoteManager, 'QuoteVerified')
                .withArgs(user_a, 123);
        });
        it('Verify - V COVER_VERIFIER & X account & V qid', async function () {
            await expect(
                Mock_QuoteManager_FEEDIST.Verify(externalDeployer, 123)
            ).to.revertedWith('QuoteManager: No Quotes with given address/QID');
        });
        it('Verify - V COVER_VERIFIER & V account & X qid', async function () {
            await expect(
                Mock_QuoteManager_FEEDIST.Verify(user_a, 321)
            ).to.revertedWith('QuoteManager: No Quotes with given address/QID');
        });
        it('Verify - V COVER_VERIFIER & X account & X qid', async function () {
            await expect(
                Mock_QuoteManager_FEEDIST.Verify(externalDeployer, 321)
            ).to.revertedWith('QuoteManager: No Quotes with given address/QID');
        });
        it('Verify - X COVER_VERIFIER & V account & V qid', async function () {
            await expect(
                Mock_QuoteManager_FAKE_FEEDIST.Verify(user_a, 123)
            ).to.revertedWith(
                `AccessControl: account ${minter.toLowerCase()} is missing role ${await Mock_QuoteManager.COVER_VERIFIER()}`
            );
        });
        it('Verify - X COVER_VERIFIER & X account & V qid', async function () {
            await expect(
                Mock_QuoteManager_FAKE_FEEDIST.Verify(externalDeployer, 123)
            ).to.revertedWith(
                `AccessControl: account ${minter.toLowerCase()} is missing role ${await Mock_QuoteManager.COVER_VERIFIER()}`
            );
        });
        it('Verify - X COVER_VERIFIER & V account & X qid', async function () {
            await expect(
                Mock_QuoteManager_FAKE_FEEDIST.Verify(user_a, 321)
            ).to.revertedWith(
                `AccessControl: account ${minter.toLowerCase()} is missing role ${await Mock_QuoteManager.COVER_VERIFIER()}`
            );
        });
        it('Verify - X COVER_VERIFIER & X account & X qid', async function () {
            await expect(
                Mock_QuoteManager_FAKE_FEEDIST.Verify(externalDeployer, 321)
            ).to.revertedWith(
                `AccessControl: account ${minter.toLowerCase()} is missing role ${await Mock_QuoteManager.COVER_VERIFIER()}`
            );
        });
    });

    describe('Function setCoverVerifier(address _cv) public onlyOwner onlyRole(DEFAULT_ADMIN_ROLE)', function () {
        let Mock_QuoteManager_USER_A: QuoteManager;
        let Mock_QuoteManager_OWNER: QuoteManager;
        before(async () => {
            await deployments.fixture(['all']);
            Mock_QuoteManager_USER_A = Mock_QuoteManager.connect(user_a_Singer);
            Mock_QuoteManager_OWNER =
                Mock_QuoteManager.connect(deployer_Singer);
        });
        it('setCoverVerifier - V owner', async function () {
            await expect(Mock_QuoteManager_OWNER.setCoverVerifier(user_b)).to.be
                .not.reverted;
            expect(
                await Mock_QuoteManager.hasRole(
                    await Mock_QuoteManager.COVER_VERIFIER(),
                    user_b
                )
            ).to.be.true;
        });
        it('setCoverVerifier - X owner', async function () {
            await expect(Mock_QuoteManager_USER_A.setCoverVerifier(user_a)).to
                .be.reverted;
            expect(
                await Mock_QuoteManager.hasRole(
                    await Mock_QuoteManager.COVER_VERIFIER(),
                    user_a
                )
            ).to.be.false;
        });
    });

    describe('function staging-getPriorCover(address account, uint256 blockNumber)', function () {
        let Mock_QuoteManager_USER_A: QuoteManager;
        let Mock_QuoteManager_FEEDIST: QuoteManager;
        before(async () => {
            await deployments.fixture(['all']);
            await Mock_fUSD.connect(externalDeployer_Singer).configureMinter(
                minter,
                Decimals18(constants._1m)
            );
            await Mock_fUSD.connect(minter_Singer).mint(
                Mock_InsurancePool.address,
                Decimals18(constants._500k)
            );
            await Mock_fUSD.connect(minter_Singer).mint(
                user_a,
                Decimals18(constants._500k)
            );
            await Mock_fUSD.connect(user_a_Singer).approve(
                Mock_InsurancePool.address,
                Decimals18(constants._200k)
            );
            await Mock_InsurancePool.connect(user_a_Singer).Deposit(
                Decimals18(constants._200k)
            );
            Mock_QuoteManager_USER_A = Mock_QuoteManager.connect(user_a_Singer);
            Mock_FeeDistribution = await ethers.getContract(
                'FeeDistribution',
                deployer
            );

            await impersonateAccount(Mock_FeeDistribution.address);
            await setBalance(
                Mock_FeeDistribution.address,
                BigNumber.from(Decimals18(constants._1k)).toHexString()
            );
            Mock_QuoteManager_FEEDIST = Mock_QuoteManager.connect(
                await ethers.getSigner(Mock_FeeDistribution.address)
            );
        });
        after(async () => {
            await stopImpersonatingAccount(Mock_FeeDistribution.address);
        });

        it('staging-getPriorCover - get cover amount', async function () {
            // arrange
            await Mock_QuoteManager_USER_A.GetQuote(
                Decimals18(constants._20k),
                1
            );
            await Mock_QuoteManager_FEEDIST.Verify(user_a, 123);

            // act
            const resMinus1 = await Mock_QuoteManager_USER_A.getPriorCover(
                user_a,
                (await time.latestBlock()) - 2
            );
            mine(2);
            const res = await Mock_QuoteManager_USER_A.getPriorCover(
                user_a,
                (await time.latestBlock()) - 1
            );
            // assert
            expect(resMinus1).to.be.eq(0);
            expect(res).to.be.eq(Decimals18(constants._20k));
        });
    });
    // describe('Function setPoolVerifier(address _cv) public onlyOwner onlyRole(DEFAULT_ADMIN_ROLE)', function () {
    //     let Mock_QuoteManager_USER_A: QuoteManager;
    //     let Mock_QuoteManager_OWNER: QuoteManager;
    //     before(async () => {
    //         await deployments.fixture(['all']);
    //         // console.log(Mock_FeeDistribution.address);
    //         // console.log(
    //         //     (await ethers.getSigner(Mock_FeeDistribution.address)).address
    //         // );
    //         Mock_QuoteManager_USER_A = Mock_QuoteManager.connect(user_a_Singer);
    //         Mock_QuoteManager_OWNER =
    //             Mock_QuoteManager.connect(deployer_Singer);
    //     });
    //     it('setPoolVerifier - V owner', async function () {
    //         await expect(Mock_QuoteManager_OWNER.setPoolVerifier(user_b)).to.be
    //             .not.reverted;
    //         expect(
    //             await Mock_QuoteManager.hasRole(
    //                 await Mock_QuoteManager.POOL_VERIFIER(),
    //                 user_b
    //             )
    //         ).to.be.true;
    //     });

    //     it('setPoolVerifier - X owner', async function () {
    //         await expect(Mock_QuoteManager_USER_A.setPoolVerifier(user_a)).to.be
    //             .reverted;
    //         expect(
    //             await Mock_QuoteManager.hasRole(
    //                 await Mock_QuoteManager.POOL_VERIFIER(),
    //                 user_a
    //             )
    //         ).to.be.false;
    //     });
    // });
    // describe('Function calculatePremium', function () {
    //     before(async () => {
    //         await deployments.fixture(['quote']);
    //     });
    //     it('RegisterCover NEW - V amount & V period', async function () {});
    // });

    // describe('Function getPeriodDuration', function () {
    //     before(async () => {
    //         await deployments.fixture(['quote']);
    //     });
    //     it('RegisterCover NEW - V amount & V period', async function () {});
    // });

    // describe('Function getPeriod', function () {
    //     before(async () => {
    //         await deployments.fixture(['quote']);
    //     });
    //     it('RegisterCover NEW - V amount & V period', async function () {});
    // });

    // describe('Function _authorizeUpgrade', function () {
    //     before(async () => {
    //         await deployments.fixture(['quote']);
    //     });
    //     it('RegisterCover NEW - V amount & V period', async function () {});
    // });
});
