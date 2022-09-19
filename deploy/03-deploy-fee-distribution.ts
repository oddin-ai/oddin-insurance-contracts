import { network, ethers } from 'hardhat';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { developmentChains, networkConfig } from '../helper-hardhat-config';
import { QuoteManager } from '../typechain-types';
// import { verify } from '../utils/verify';

const deployFeeDistribution = async (hre: HardhatRuntimeEnvironment) => {
    const { getNamedAccounts, deployments } = hre;
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainId = network.config.chainId;

    let fusdd;
    let iPool;
    let cManager;
    let cv;
    const speed = ethers.utils.parseUnits('16000', 'gwei');
    if (
        network.name !== undefined &&
        developmentChains.includes(network.name)
    ) {
        const stableCoin = await deployments.get('FiatTokenV1');
        fusdd = stableCoin.address;
        const pool = await deployments.get('InsurancePool');
        iPool = pool.address;
        const manager = await deployments.get('QuoteManager');
        cManager = manager.address;
        cv = manager;
    } else {
        if (chainId) {
            fusdd = null; // this is for now, need to see how to do on-chain testing
            iPool = null;
        }
    }

    const args = [fusdd, iPool, cManager, speed];
    // TODO: I'm not doing verification for now
    const c = await deploy('FeeDistribution', {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations:
            chainId && networkConfig[chainId]
                ? networkConfig[chainId].blockConfirmations
                : 1,
    });

    await ((await ethers.getContract('QuoteManager')) as QuoteManager)
        .connect(await ethers.getSigner(deployer))
        .setCoverVerifier(c.address);
};

deployFeeDistribution.tags = ['all', 'fee', 'dist'];
export default deployFeeDistribution;
