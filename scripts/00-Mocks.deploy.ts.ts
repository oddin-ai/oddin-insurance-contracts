import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

const DECIMALS = '18';
const INITIAL_PRICE = '2000000000000000000000'; // 2000
const deployMocks: DeployFunction = async function (
    hre: HardhatRuntimeEnvironment
) {
    const { deployments, getNamedAccounts, network } = hre;
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainId = network.config.chainId;
    // If we are on a local development network, we need to deploy mocks!
    if (chainId == 31337) {
        log('Local network detected! Deploying mocks...');
        // deploy COVER MANAGER
        await deploy('Cover Manager Mock', {
            contract: 'MockV3Aggregator',
            from: deployer,
            log: true,
            args: [DECIMALS, INITIAL_PRICE],
        });
        // deploy NATIVE STABLE COIN
        await deploy('Native Stable Coin Mock', {
            contract: 'MockV3Aggregator',
            from: deployer,
            log: true,
            args: [DECIMALS, INITIAL_PRICE],
        });
        // deploy

        log('Mocks Deployed!');
        log('----------------------------------');
        log(
            'run `yarn hardhat console` to interact with the deployed smart contracts!'
        );
        log('----------------------------------');
    }
};
export default deployMocks;
deployMocks.tags = ['all', 'mocks'];
