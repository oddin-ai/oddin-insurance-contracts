import { time } from '@nomicfoundation/hardhat-network-helpers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { BigNumber } from 'ethers';
import { deployments, ethers, getNamedAccounts, network } from 'hardhat';
import { developmentChains } from '../../helper-hardhat-config';
import constants from '../../helpers/constants';
import { Decimals18 } from '../../helpers/functions';
import {
    FeeDistribution,
    FiatTokenV1,
    InsurancePool,
    CoverManager,
} from './../../typechain-types';

!developmentChains.includes(network.name)
    ? describe.skip
    : describe('FeeDistribution tests', async () => {
          let distributer: FeeDistribution;
          let mockFeesToken: FiatTokenV1;
          let insurancePool: InsurancePool;
          let manager: CoverManager;
          let deployer: string;
          let minter: string;
          let externalDeployer: string;

          before(async () => {
              const namgedAccounts = await getNamedAccounts();
              deployer = namgedAccounts.deployer;
              externalDeployer = namgedAccounts.externalDeployer;
              minter = namgedAccounts.externalAdmin;
              await deployments.fixture(['all']);
              distributer = await ethers.getContract(
                  'FeeDistribution',
                  deployer
              );
              insurancePool = await ethers.getContract(
                  'InsurancePool',
                  deployer
              );
              manager = await ethers.getContract('CoverManager', deployer);

              //   mockFeesToken = await ethers.getContract('FUSDDToken', deployer);
              //   await mockFeesToken.transfer(
              //       distributer.address,
              //       ethers.utils.parseUnits('1000', 'ether'),
              //       { from: deployer }
              //   );
              mockFeesToken = await ethers.getContract(
                  'FiatTokenV1',
                  externalDeployer
              );
              // MockCoverManager = await ethers.getContract("CoverManager")
              const contactedToken = await mockFeesToken.connect(
                  await ethers.getSigner(externalDeployer)
              );
              await contactedToken.configureMinter(
                  minter,
                  Decimals18(constants._500k)
              );
              await mockFeesToken
                  .connect(await ethers.getSigner(minter))
                  .mint(distributer.address, Decimals18(constants._500));
          });

          describe('Ctor', async () => {
              it('Sets the fee token address correctly', async () => {
                  const response = await distributer.feesToken();
                  expect(response).to.be.eq(mockFeesToken.address);
              });

              it('Expects distributer contract to be funded', async () => {
                  const feeBalance = await mockFeesToken.balanceOf(
                      distributer.address
                  );
                  expect(feeBalance).to.be.eq(
                      ethers.utils.parseUnits('500', 'ether')
                  );
              });
          });

          describe('setRewardRate', async () => {
              it('Only owner can update rewardrate', async () => {
                  await distributer.setRewardRate(
                      ethers.utils.parseUnits('16000', 'gwei')
                  );
                  expect(await distributer.tokenPerSecRate()).to.be.eq(
                      ethers.utils.parseUnits('16000', 'gwei')
                  );
              });

              it('Should not update rewardrate using random address', async () => {
                  const [_owner, notOwner] = await ethers.getSigners();
                  await expect(
                      distributer.connect(notOwner).setRewardRate(2)
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

                  const FeesContactedToken = await mockFeesToken.connect(
                      workingAccount
                  );
                  await mockFeesToken
                      .connect(await ethers.getSigner(minter))
                      .mint(workingAccount.address, Decimals18(constants._1k));

                  await FeesContactedToken.approve(
                      insurancePool.address,
                      Decimals18(constants._1k)
                  );
                  await insurancePool
                      .connect(workingAccount)
                      .Deposit(Decimals18(constants._1k));
                  startBalance = await mockFeesToken.balanceOf(
                      workingAccount.address
                  );
              });
              it('Address claims hers fees', async () => {
                  const feesConnectedContract = await distributer.connect(
                      workingAccount
                  );
                  expect(startBalance).to.be.eq(0);
                  // advance time by ten hours and mine a new block
                  await time.increase(35994);

                  const txResponse = await feesConnectedContract.claim();
                  await txResponse.wait(1);
                  const endBalance = await mockFeesToken.balanceOf(
                      workingAccount.address
                  );
                  const userClaimed = await distributer.userFeesPerTokenPaid(
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
                  const feesConnectedContract = await distributer.connect(
                      noShareAccount
                  );
                  const startBalance = await mockFeesToken.balanceOf(
                      noShareAccount.address
                  );
                  expect(startBalance).to.be.eq(0);
                  await expect(
                      feesConnectedContract.claim()
                  ).to.be.revertedWith('Claim: user has no share in pool');
                  //   const txResponse = await feesConnectedContract.claim();
                  //   await txResponse.wait(1);
                  //   const endBalance = await mockFeesToken.balanceOf(
                  //       noShareAccount.address
                  //   );
                  //   expect(endBalance).to.be.eq(
                  //       ethers.utils.parseUnits('0', 'ether')
                  //   );
              });
          });

          describe('verifyCover', async () => {
              it('Emits event CoverVerified', async () => {
                  const accounts = await ethers.getSigners();
                  const workingAccount = accounts[6];

                  const feesConnectedContract = await distributer.connect(
                      workingAccount
                  );

                  await expect(feesConnectedContract.VerifyCover())
                      .to.emit(feesConnectedContract, 'CoverVerified')
                      .withArgs(workingAccount.address);
              });
          });

          describe('transferOwnership', async () => {
              it('Should not update owner using random address', async () => {
                  const [_owner, notOwner] = await ethers.getSigners();
                  await expect(
                      distributer
                          .connect(notOwner)
                          .transferOwnership(notOwner.address)
                  ).to.be.revertedWith('Ownable: caller is not the owner');
              });
          });
      });
