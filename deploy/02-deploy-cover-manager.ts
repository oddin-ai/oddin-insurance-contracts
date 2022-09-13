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

    let fusd;
    if (
        network.name !== undefined &&
        developmentChains.includes(network.name)
    ) {
        const stableCoin = await deployments.get('FiatTokenV1');
        if (stableCoin == null || stableCoin == undefined) {
            console.log('fUSD not in deployments after using deployProxy...');
            fusd = (await ethers.getContract('FiatTokenV1', externalDeployer))
                .address;
        } else {
            fusd = stableCoin.address;
        }
    } else {
        if (chainId) {
            fusd = null; // this is for now, need to see how to do on-chain testing
        }
    }

    const args = [fusd];
    // TODO: I'm not doing verification for now
    const c = await deployProxy(
        await getContractFactory('CoverManager', deployer),
        args,
        {
            kind: 'uups',
            initializer: 'initialize',
            // timeout: 13000, // milisecs
            // pollingInterval: 4500,
            // useDeployedImplementation: undefined,
        }
    );
};

deployCoverManager.tags = ['all', 'cover', 'manager'];
export default deployCoverManager;
