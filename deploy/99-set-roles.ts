import { network, ethers } from 'hardhat';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { developmentChains, networkConfig } from '../helper-hardhat-config';
import {
    FeeDistribution,
    FiatTokenV1,
    InsurancePool,
    QuoteManager,
} from '../typechain-types';
// import { verify } from '../utils/verify';

const deployRoles = async (hre: HardhatRuntimeEnvironment) => {
    const { getNamedAccounts, deployments } = hre;
    const { log } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainId = network.config.chainId;

    if (
        network.name !== undefined &&
        developmentChains.includes(network.name)
    ) {
        const stableCoin: FiatTokenV1 = await ethers.getContract('FiatTokenV1');
        const pool: InsurancePool = await ethers.getContract('InsurancePool');
        const quote: QuoteManager = await ethers.getContract('QuoteManager');
        const fee: FeeDistribution = await ethers.getContract(
            'FeeDistribution'
        );

        const deployer_Singer = await ethers.getSigner(deployer);

        await quote.connect(deployer_Singer).setCoverVerifier(fee.address);
        // await quote.connect(deployer_Singer).setPoolVerifier(pool.address);
        await pool.connect(deployer_Singer).setCoverManager(fee.address);
    } else {
        if (chainId) {
            // fusdd = null; // this is for now, need to see how to do on-chain testing
            // iPool = null;
        }
    }
};

deployRoles.tags = ['all'];
export default deployRoles;
