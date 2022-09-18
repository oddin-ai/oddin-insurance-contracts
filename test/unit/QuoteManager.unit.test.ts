import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { network, deployments, ethers, getNamedAccounts } from 'hardhat';
import {
    FiatTokenV1,
    InsurancePool,
    CoverManager,
    QuoteManager,
} from '../../typechain-types';
import constants from '../../helpers/constants';
import { Decimals18 } from '../../helpers/functions';
import { increase } from '@nomicfoundation/hardhat-network-helpers/dist/src/helpers/time';
import initials from '../../helpers/deploy-initials';
import { BigNumber } from 'ethers';

describe('Quote Manager Unit Test', function () {
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
        await deployments.fixture(['quote']);
        Mock_QuoteManager = await ethers.getContract('QuoteManager');
    });
    describe('Function GetQuote(uint256 _amount, Periods _periodtype)', function () {
        let Mock_QuoteManager_USER_A: QuoteManager;

        before(async () => {
            await deployments.fixture(['quote']);
            Mock_QuoteManager_USER_A = Mock_QuoteManager.connect(user_a_Singer);
        });

        it('GetQuote - NEW & V amount & V periodtype (0)', async function () {
            const p = Math.floor((20000 * 250 * initials.periods[0]) / 3650000);
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
            const p = Math.floor((20000 * 250 * initials.periods[1]) / 3650000);
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
            const p = Math.floor((20000 * 250 * initials.periods[2]) / 3650000);
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
            await expect(Mock_QuoteManager_USER_A.GetQuote(Decimals18('0'), 2))
                .to.be.reverted;
        });

        it('GetQuote - NEW & V amount & X periodtype', async function () {
            await expect(
                Mock_QuoteManager_USER_A.GetQuote(Decimals18(constants._20k), 3)
            ).to.be.reverted;
        });

        it('GetQuote - NEW & X amount & X periodtype', async function () {
            await expect(Mock_QuoteManager_USER_A.GetQuote(Decimals18('0'), 3))
                .to.be.reverted;
        });
    });

    describe('Function IsQuoteActive(address _account, uint256 _qid)', function () {
        let Mock_QuoteManager_USER_B: QuoteManager;
        let Mock_QuoteManager_USER_A: QuoteManager;
        let Mock_QuoteManager_USER_C: QuoteManager;

        before(async () => {
            await deployments.fixture(['quote']);
            Mock_QuoteManager_USER_B = Mock_QuoteManager.connect(user_b_Singer);
            Mock_QuoteManager_USER_A = Mock_QuoteManager.connect(user_a_Singer);
            Mock_QuoteManager_USER_C = Mock_QuoteManager.connect(minter_Singer);
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

    describe('Function GetQuoteData', function () {
        let Mock_QuoteManager_USER_C: QuoteManager;
        before(async () => {
            await deployments.fixture(['quote']);
            Mock_QuoteManager_USER_C = Mock_QuoteManager.connect(minter_Singer);
            await Mock_QuoteManager_USER_C.GetQuote(
                Decimals18(constants._20k),
                1
            );
        });
        it('GetQuoteData - V account & V qid', async function () {
            expect(
                (
                    await Mock_QuoteManager_USER_C.GetQuoteData(
                        externalDeployer,
                        123
                    )
                )[0]
            ).to.eq([
                new BigNumber('', '0x043c33c1937564800000'),
                90,
                Decimals18(),
                new BigNumber('', '0x1b1ae4d6e2ef500000'),
            ]);
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
