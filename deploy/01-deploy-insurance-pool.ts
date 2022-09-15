import { network } from 'hardhat';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { developmentChains, networkConfig } from '../helper-hardhat-config';
import constants from '../helpers/constants';
import { Decimals18 } from '../helpers/functions';
// import { verify } from '../utils/verify';

const deployInsurancePool = async (hre: HardhatRuntimeEnvironment) => {
    const { getNamedAccounts, deployments, upgrades, ethers } = hre;
    const { deployProxy } = upgrades;
    const { getContractFactory } = ethers;
    const { deployer, externalDeployer } = await getNamedAccounts();
    const chainId = network.config.chainId;
    const DEPLOY_CONTRACT = 'InsurancePool';

    let fusd;
    if (
        network.name !== undefined &&
        developmentChains.includes(network.name)
    ) {
        fusd = (await deployments.get('FiatTokenV1')).address;
    } else {
        if (chainId) {
            fusd = null; // this is for now, need to see how to do on-chain testing
        }
    }

    // function initialize(uint256 _minFund, address _nativeStable)
    const args = [Decimals18(constants._1k), fusd];

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

deployInsurancePool.tags = ['all', 'insurance', 'pool'];
export default deployInsurancePool;
