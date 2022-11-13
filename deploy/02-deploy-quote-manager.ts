import { network } from 'hardhat';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { developmentChains, networkConfig } from '../helper-hardhat-config';
import initials from '../helpers/deploy-initials';
// import { verify } from '../utils/verify';

const deployQuoteManager = async (hre: HardhatRuntimeEnvironment) => {
    const { getNamedAccounts, deployments, upgrades, ethers } = hre;
    const { deployProxy } = upgrades;
    const { getContractFactory, getContract } = ethers;
    const { deployer, externalDeployer } = await getNamedAccounts();
    const chainId = network.config.chainId;
    const DEPLOY_CONTRACT = 'QuoteManager';
    let fusd;
    let insurancepool;
    let validDuration = initials.validDuration;
    let periods = initials.periods;
    if (
        network.name !== undefined &&
        developmentChains.includes(network.name)
    ) {
        fusd = (await deployments.get('FiatTokenV1')).address;
        insurancepool = (await deployments.get('InsurancePool')).address;
    } else {
        if (chainId) {
            fusd = networkConfig[chainId].nativeStable; 
            insurancepool = (await getContract('InsurancePool', deployer)).address;
        }
    }

    const args = [periods, validDuration, insurancepool];
    // TODO: I'm not doing verification for now
    const c = await deployProxy(
        await getContractFactory(DEPLOY_CONTRACT, deployer),
        args,
        {
            kind: 'uups',
            initializer: 'initialize',
            // timeout: 13000, // milisecs
            // pollingInterval: 4500,
            // useDeployedImplementation: undefined,
        }
    );
    await c.deployed();
    const artifact = await deployments.getExtendedArtifact(DEPLOY_CONTRACT); // artifacts.readArtifactSync('FiatTokenV1'),

    deployments.save(DEPLOY_CONTRACT, {
        ...artifact,
        address: c.address,
    });
};

deployQuoteManager.tags = ['all', 'quote', 'manager'];
export default deployQuoteManager;
