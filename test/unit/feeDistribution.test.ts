import { expect } from 'chai';
import { deployments, ethers, getNamedAccounts, network } from 'hardhat';
import { developmentChains } from '../../helper-hardhat-config';

!developmentChains.includes(network.name)
    ? describe.skip
    : describe('FundMe tests', async () => {
          beforeEach(async () => {});
      });
