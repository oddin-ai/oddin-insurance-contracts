import { MockContract, smock } from '@defi-wonderland/smock';
import { time } from '@nomicfoundation/hardhat-network-helpers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { BigNumber, BigNumberish } from 'ethers';
import { deployments, ethers, getNamedAccounts, network } from 'hardhat';
import { developmentChains } from '../../helper-hardhat-config';
import constants from '../../helpers/constants';
import { Decimals18 } from '../../helpers/functions';
import {
    FeeDistribution,
    FeeDistribution__factory,
    FiatTokenV1,
    FiatTokenV1__factory,
    InsurancePool,
    InsurancePool__factory,
    QuoteManager,
    QuoteManager__factory,
} from './../../typechain-types';
import initials from '../../helpers/deploy-initials';

!developmentChains.includes(network.name)
    ? describe.skip
    : describe('FeeDistribution Unit tests', async () => {
          let Mock_FeeDistribution: MockContract<FeeDistribution>;
          let Mock_fUSD: MockContract<FiatTokenV1>;
          let Mock_InsurancePool: MockContract<InsurancePool>;
          let Mock_QuoteManager: MockContract<QuoteManager>;
          let deployer: string;
          let minter: string;
          let externalDeployer: string;
          let deployer_Singer: SignerWithAddress;
          let minter_Signer: SignerWithAddress;
          let externalDeployer_Signer: SignerWithAddress;
          const allowed: { [key: string]: { [key: string]: BigNumberish } } =
              {};
          const balances: { [key: string]: BigNumberish } = {};
          const funds: { [key: string]: BigNumberish } = {};

          before(async () => {
              await network.provider.send('hardhat_reset');
              const namgedAccounts = await getNamedAccounts();
              deployer = namgedAccounts.deployer;
              externalDeployer = namgedAccounts.externalDeployer;
              minter = namgedAccounts.externalAdmin;

              allowed[deployer] = {};
              allowed[externalDeployer] = {};
              allowed[minter] = {};

              deployer_Singer = await ethers.getSigner(deployer);
              minter_Signer = await ethers.getSigner(minter);
              externalDeployer_Signer = await ethers.getSigner(
                  externalDeployer
              );

              const Mock_fUSD_Factory = await smock.mock<FiatTokenV1__factory>(
                  'FiatTokenV1'
              );

              Mock_fUSD = await Mock_fUSD_Factory.connect(
                  deployer_Singer
              ).deploy();
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

              let validDuration = initials.validDuration;
              let periods = initials.periods;
              const Mock_QuoteManager_Factory =
                  await smock.mock<QuoteManager__factory>('QuoteManager');
              Mock_QuoteManager = await Mock_QuoteManager_Factory.connect(
                  deployer_Singer
              ).deploy();
              await Mock_QuoteManager.connect(deployer_Singer).initialize(
                  periods,
                  validDuration,
                  Mock_InsurancePool.address
              );

              const Mock_FeeDistribution_Factory =
                  await smock.mock<FeeDistribution__factory>('FeeDistribution');
              Mock_FeeDistribution = await Mock_FeeDistribution_Factory.connect(
                  deployer_Singer
              ).deploy(
                  Mock_fUSD.address,
                  Mock_InsurancePool.address,
                  Mock_QuoteManager.address,
                  ethers.utils.parseUnits('16000', 'gwei')
              );

              balances[Mock_FeeDistribution.address] = Decimals18(
                  constants._500
              );
              await Mock_fUSD.setVariable('balances', balances);
          });

          describe('Ctor', async () => {
              it('Sets the fee token address correctly', async () => {
                  const response = await Mock_FeeDistribution.feesToken();
                  expect(response).to.be.eq(Mock_fUSD.address);
              });

              it('Expects Mock_FeeDistribution contract to be funded', async () => {
                  const feeBalance = await Mock_fUSD.balanceOf(
                      Mock_FeeDistribution.address
                  );
                  expect(feeBalance).to.be.eq(
                      ethers.utils.parseUnits('500', 'ether')
                  );
              });
          });

          describe('setRewardRate', async () => {
              it('Only owner can update rewardrate', async () => {
                  await Mock_FeeDistribution.setRewardRate(
                      ethers.utils.parseUnits('16000', 'gwei')
                  );
                  expect(await Mock_FeeDistribution.tokenPerSecRate()).to.be.eq(
                      ethers.utils.parseUnits('16000', 'gwei')
                  );
              });

              it('Should not update rewardrate using random address', async () => {
                  const [_owner, notOwner] = await ethers.getSigners();
                  await expect(
                      Mock_FeeDistribution.connect(notOwner).setRewardRate(2)
                  ).to.be.revertedWith('Ownable: caller is not the owner');
              });
          });

          describe('claim', async () => {
              let accounts: SignerWithAddress[];
              let workingAccount: SignerWithAddress;
              let startBalance: BigNumber;
              before(async () => {
                  accounts = await ethers.getSigners();
                  workingAccount = accounts[6];

                  const FeesContactedToken = await Mock_fUSD.connect(
                      workingAccount
                  );
                  funds[workingAccount.address] = Decimals18(constants._1k);
                  await Mock_InsurancePool.setVariable('funds', funds);

                  balances[Mock_InsurancePool.address] = Decimals18(
                      constants._1k
                  );
                  await Mock_fUSD.setVariable('balances', balances);

                  await Mock_InsurancePool.setVariable(
                      'totalFunds',
                      Decimals18(constants._1k)
                  );

                  startBalance = await Mock_fUSD.balanceOf(
                      workingAccount.address
                  );
              });
              it('Address claims hers fees', async () => {
                  const feesConnectedContract =
                      await Mock_FeeDistribution.connect(workingAccount);
                  expect(startBalance).to.be.eq(0);
                  // advance time by ten hours and mine a new block
                  await time.increase(35994);

                  const txResponse = await feesConnectedContract.claim();
                  await txResponse.wait(1);
                  const endBalance = await Mock_fUSD.balanceOf(
                      workingAccount.address
                  );
                  const userClaimed =
                      await Mock_FeeDistribution.userFeesPerTokenPaid(
                          workingAccount.address
                      );
                  expect(userClaimed).to.be.gte(
                      ethers.utils.parseUnits('0.286', 'ether')
                  );
                  expect(userClaimed).to.be.lte(
                      ethers.utils.parseUnits('0.29', 'ether')
                  );

                  expect(endBalance).to.be.gte(
                      ethers.utils.parseUnits('0.286', 'ether')
                  );
                  expect(endBalance).to.be.lte(
                      ethers.utils.parseUnits('0.29', 'ether')
                  );
              });

              it('Address has no share in pool', async () => {
                  const noShareAccount = accounts[7];
                  const feesConnectedContract =
                      await Mock_FeeDistribution.connect(noShareAccount);
                  const startBalance = await Mock_fUSD.balanceOf(
                      noShareAccount.address
                  );
                  expect(startBalance).to.be.eq(0);
                  await expect(
                      feesConnectedContract.claim()
                  ).to.be.revertedWith('Claim: user has no share in pool');
                  //   const txResponse = await feesConnectedContract.claim();
                  //   await txResponse.wait(1);
                  //   const endBalance = await Mock_fUSD.balanceOf(
                  //       noShareAccount.address
                  //   );
                  //   expect(endBalance).to.be.eq(
                  //       ethers.utils.parseUnits('0', 'ether')
                  //   );
              });
          });

          describe('verifyCover', async () => {
              before(async () => {
                  funds[deployer] = Decimals18(constants._200k);
                  await Mock_InsurancePool.setVariable('funds', funds);

                  await Mock_InsurancePool.setVariable(
                      'totalFunds',
                      Decimals18(constants._200k)
                  );

                  balances[Mock_InsurancePool.address] = Decimals18('200000');
                  await Mock_fUSD.setVariable('balances', balances);

                  Mock_QuoteManager.connect(deployer_Singer).setCoverVerifier(
                      Mock_FeeDistribution.address
                  );
                  Mock_InsurancePool.setCoverManager(
                      Mock_FeeDistribution.address
                  );
              });
              it('Emits event CoverVerified', async () => {
                  const accounts = await ethers.getSigners();
                  const workingAccount = accounts[6];

                  const feesConnectedContract =
                      await Mock_FeeDistribution.connect(workingAccount);

                  balances[workingAccount.address] = Decimals18(constants._1k);
                  await Mock_fUSD.setVariable('balances', balances);

                  const Mock_QuoteManager_USER_A =
                      Mock_QuoteManager.connect(workingAccount);
                  const txResponse = await Mock_QuoteManager_USER_A.GetQuote(
                      Decimals18(constants._2k),
                      0
                  );
                  const txReceipt = await txResponse.wait();
                  const premiumLog = txReceipt.events?.filter((x) => {
                      return x.event == 'oddinNewQuote';
                  });
                  const premiumAmount = premiumLog
                      ? premiumLog.length > 0
                          ? premiumLog[0].args
                              ? premiumLog[0].args[2]
                              : 0
                          : 0
                      : 0;
                  allowed[workingAccount.address] = {};
                  allowed[workingAccount.address][
                      Mock_FeeDistribution.address
                  ] = Decimals18(constants._10k);

                  await Mock_fUSD.setVariable('allowed', allowed);

                  await expect(
                      feesConnectedContract.VerifyCover(123, premiumAmount)
                  )
                      .to.emit(feesConnectedContract, 'CoverVerified')
                      .withArgs(workingAccount.address);
              });
          });

          describe('transferOwnership', async () => {
              it('Should not update owner using random address', async () => {
                  const [_owner, notOwner] = await ethers.getSigners();
                  await expect(
                      Mock_FeeDistribution.connect(notOwner).transferOwnership(
                          notOwner.address
                      )
                  ).to.be.revertedWith('Ownable: caller is not the owner');
              });
          });
      });
