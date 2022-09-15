import { expect } from 'chai';
import { deployments, ethers, getNamedAccounts, network } from 'hardhat';
import { developmentChains } from '../../helper-hardhat-config';
import constants from '../helpers/constants';
import { Decimals18 } from '../helpers/functions';
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

          describe('claim', async () => {
              it('Address claims hers fees', async () => {
                  const accounts = await ethers.getSigners();
                  const workingAccount = accounts[6];
                  const feesConnectedContract = await distributer.connect(
                      workingAccount
                  );
                  const FeesContactedToken = await mockFeesToken.connect(
                      workingAccount
                  );
                  //   const FeesManagerContactedToken = await mockFeesToken.connect(
                  //       manager.address
                  //   );
                  await mockFeesToken
                      .connect(await ethers.getSigner(minter))
                      .mint(workingAccount.address, Decimals18(constants._500));

                  await FeesContactedToken.approve(
                      insurancePool.address,
                      Decimals18(constants._500)
                  );
                  await insurancePool
                      .connect(workingAccount)
                      .Deposit(Decimals18(constants._500));
                  const startBalance = await mockFeesToken.balanceOf(
                      workingAccount.address
                  );
                  expect(startBalance).to.be.eq(0);
                  //   await FeesManagerContactedToken.approve(
                  //       workingAccount.address,
                  //       Decimals18(constants._1k)
                  //   );
                  const txResponse = await feesConnectedContract.claim();
                  await txResponse.wait(1);
                  const endBalance = await mockFeesToken.balanceOf(
                      workingAccount.address
                  );
                  const userClaimed = await distributer.userFeesPerTokenPaid(
                      workingAccount.address
                  );
                  expect(userClaimed).to.be.eq(
                      ethers.utils.parseUnits('25', 'ether')
                  );

                  expect(endBalance).to.be.eq(
                      ethers.utils.parseUnits('25', 'ether')
                  );
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
