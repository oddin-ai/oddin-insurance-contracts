import { expect } from 'chai';
import { deployments, ethers, getNamedAccounts, network } from 'hardhat';
import { developmentChains } from '../../helper-hardhat-config';
import { FeeDistribution, FUSDDToken } from './../../typechain-types';

!developmentChains.includes(network.name)
    ? describe.skip
    : describe('FeeDistribution tests', async () => {
          let distributer: FeeDistribution;
          let mockFeesToken: FUSDDToken;
          let deployer: string;

          beforeEach(async () => {
              deployer = (await getNamedAccounts()).deployer;
              await deployments.fixture(['dist']);
              distributer = await ethers.getContract(
                  'FeeDistribution',
                  deployer
              );
              mockFeesToken = await ethers.getContract('FUSDDToken', deployer);
              await mockFeesToken.transfer(
                  distributer.address,
                  ethers.utils.parseUnits('1000', 'ether'),
                  { from: deployer }
              );
          });

          describe('Ctor', async () => {
              it('Sets the fee token address correctly', async () => {
                  const response = await distributer.feesToken();
                  expect(response).to.be.eq(mockFeesToken.address);
              });

              it('Expects fee contract to be funded', async () => {
                  const feeBalance = await mockFeesToken.balanceOf(
                      distributer.address
                  );
                  expect(feeBalance).to.be.eq(
                      ethers.utils.parseUnits('1000', 'ether')
                  );
              });
          });

          describe('claim', async () => {
              it('Address claims hers fees', async () => {
                  const accounts = await ethers.getSigners();
                  const workingAccount = accounts[1];
                  const feesConnectedContract = await distributer.connect(
                      workingAccount
                  );
                  const FeesContactedToken = await mockFeesToken.connect(
                      workingAccount
                  );

                  const startBalance = await mockFeesToken.balanceOf(
                      workingAccount.address
                  );
                  expect(startBalance).to.be.eq(0);
                  await FeesContactedToken.approve(
                      distributer.address,
                      ethers.utils.parseUnits('10', 'ether')
                  );
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
