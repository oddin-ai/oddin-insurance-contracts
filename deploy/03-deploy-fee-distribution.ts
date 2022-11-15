import { network, ethers } from 'hardhat';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { developmentChains, networkConfig } from '../helper-hardhat-config';
import { QuoteManager } from '../typechain-types';
// import { verify } from '../utils/verify';

const deployFeeDistribution = async (hre: HardhatRuntimeEnvironment) => {
    const { getNamedAccounts, deployments, upgrades, ethers } = hre;
    const { deployProxy } = upgrades;
    const { getContractFactory, getContract } = ethers;
    const { deployer, externalDeployer } = await getNamedAccounts();
    const chainId = network.config.chainId;
    const DEPLOY_CONTRACT = 'FeeDistribution';

    let fusdd;
    let insurancepool;
    let quoteManager;
    const speed = ethers.utils.parseUnits('16000', 'gwei');
    if (
        network.name !== undefined &&
        developmentChains.includes(network.name)
    ) {
        const stableCoin = await deployments.get('FiatTokenV1');
        fusdd = stableCoin.address;
        insurancepool = (await deployments.get('InsurancePool')).address;
        quoteManager = (await deployments.get('QuoteManager')).address;
    } else {
        if (chainId === 122) {
            fusdd = networkConfig[chainId].nativeStable; 
            insurancepool = (await getContract('InsurancePool', deployer)).address;
            quoteManager = (await getContract('QuoteManager',deployer)).address;
        }
    }
''
    const args = [fusdd, insurancepool, quoteManager, speed];
    // TODO: I'm not doing verification for now
    const c = await deployProxy(
        await getContractFactory(DEPLOY_CONTRACT, deployer),
        args,
        {
            kind: 'uups',
            initializer: 'initialize',
        }
    );
    await c.deployed();
    const artifact = await deployments.getExtendedArtifact(DEPLOY_CONTRACT); // artifacts.readArtifactSync('FiatTokenV1'),

    deployments.save(DEPLOY_CONTRACT, {
        ...artifact,
        address: c.address,
    });
};

deployFeeDistribution.tags = ['all', 'fee', 'dist'];
export default deployFeeDistribution;

