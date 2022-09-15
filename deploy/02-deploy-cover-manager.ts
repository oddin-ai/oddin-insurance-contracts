import { network } from 'hardhat';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { developmentChains, networkConfig } from '../helper-hardhat-config';
// import { verify } from '../utils/verify';

const deployCoverManager = async (hre: HardhatRuntimeEnvironment) => {
    const { getNamedAccounts, deployments, upgrades, ethers } = hre;
    const { deployProxy } = upgrades;
    const { getContractFactory } = ethers;
    const { deployer, externalDeployer } = await getNamedAccounts();
    const chainId = network.config.chainId;
    const DEPLOY_CONTRACT = 'CoverManager';
    let fusd;
    let insurancepool;
    let periods = [30, 90, 365];

    if (
        network.name !== undefined &&
        developmentChains.includes(network.name)
    ) {
        fusd = (await deployments.get('FiatTokenV1')).address;
        insurancepool = (await deployments.get('InsurancePool')).address;
    } else {
        if (chainId) {
            fusd = null; // this is for now, need to see how to do on-chain testing
            insurancepool = null;
        }
    }

    const args = [fusd, insurancepool, periods];
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

deployCoverManager.tags = ['all', 'cover', 'manager'];
export default deployCoverManager;
