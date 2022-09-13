import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

// const DECIMALS = '18';
const INITIAL_SUPPLY = '2000000000000000000000'; // 2000
const deployMocks: DeployFunction = async function (
    hre: HardhatRuntimeEnvironment
) {
    const { deployments, getNamedAccounts, network, upgrades, ethers } = hre;
    const { deploy, log } = deployments;
    const { deployProxy } = upgrades;
    const { getContractFactory } = ethers;
    const { deployer, externalDeployer } = await getNamedAccounts();
    const chainId = network.config.chainId;
    // If we are on a local development network, we need to deploy mocks!
    if (chainId == 31337) {
        log('Local network detected! Deploying mocks...');
        await deploy('FUSDDToken', {
            contract: 'FUSDDToken',
            from: externalDeployer,
            log: true,
            args: [INITIAL_SUPPLY],
        });

        // *--- FiatTokenV1 ---*
        // function initialize(
        //     string memory tokenName,
        //     string memory tokenSymbol,
        //     string memory tokenCurrency,
        //     uint8 tokenDecimals,
        //     address newMasterMinter,
        //     address newPauser,
        //     address newBlacklister,
        //     address newOwner
        // )
        const ft = await deployProxy(
            await getContractFactory('FiatTokenV1', externalDeployer),
            [
                'FUSE USD',
                'fUSD',
                'USD',
                0,
                externalDeployer,
                externalDeployer,
                externalDeployer,
                externalDeployer,
            ],
            {
                initializer: 'initialize',
            }
        );

        log('Mocks Deployed!');
        log('----------------------------------');
        log(
            "You are deploying to a local network, you'll need a local network running to interact"
        );
        log(
            'Please run `yarn hardhat console` to interact with the deployed smart contracts!'
        );
        log('----------------------------------');
    }
};
export default deployMocks;
deployMocks.tags = ['all', 'mocks', 'dist'];
