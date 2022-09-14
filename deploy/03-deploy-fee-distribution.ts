import { network } from 'hardhat';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { developmentChains, networkConfig } from '../helper-hardhat-config';
// import { verify } from '../utils/verify';

const deployFeeDistribution = async (hre: HardhatRuntimeEnvironment) => {
    const { getNamedAccounts, deployments } = hre;
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainId = network.config.chainId;

    let fusdd;
    let insurancepool;
    let covermanager;
    if (
        network.name !== undefined &&
        developmentChains.includes(network.name)
    ) {
        fusdd = (await deployments.get('FUSDDToken')).address;
        insurancepool = (await deployments.get('InsurancePool')).address;
        covermanager = (await deployments.get('CoverManager')).address;
    } else {
        if (chainId) {
            fusdd = null; // this is for now, need to see how to do on-chain testing
            insurancepool = null;
            covermanager = null;
        }
    }

    const args = [fusdd];
    // TODO: I'm not doing verification for now
    await deploy('FeeDistribution', {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations:
            chainId && networkConfig[chainId]
                ? networkConfig[chainId].blockConfirmations
                : 1,
    });
};

deployFeeDistribution.tags = ['all', 'fee', 'dist'];
export default deployFeeDistribution;
