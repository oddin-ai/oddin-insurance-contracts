// import { HardhatRuntimeEnvironment } from 'hardhat/types';
// import { DeployFunction } from 'hardhat-deploy/types';

// const deployMock_FiatTokenV1: DeployFunction = async function (
//     hre: HardhatRuntimeEnvironment
// ) {
//     const {
//         deployments,
//         getNamedAccounts,
//         network,
//         upgrades,
//         ethers,
//         artifacts,
//     } = hre;
//     const { deployProxy } = upgrades;
//     const { getContractFactory } = ethers;
//     const { deployer, externalDeployer } = await getNamedAccounts();
//     const chainId = network.config.chainId;
//     // If we are on a local development network, we need to deploy mocks!
//     if (chainId == 31337) {
//         // *--- FiatTokenV1 ---*
//         // function initialize(
//         //     string memory tokenName,
//         //     string memory tokenSymbol,
//         //     string memory tokenCurrency,
//         //     uint8 tokenDecimals,
//         //     address newMasterMinter,
//         //     address newPauser,
//         //     address newBlacklister,
//         //     address newOwner
//         // )
//         const ft = await deployProxy(
//             await getContractFactory('FiatTokenV1', externalDeployer),
//             [
//                 'FUSE USD',
//                 'fUSD',
//                 'USD',
//                 0,
//                 externalDeployer,
//                 externalDeployer,
//                 externalDeployer,
//                 externalDeployer,
//             ],
//             {
//                 initializer: 'initialize',
//             }
//         );
//         await ft.deployed();
//         const artifact = await deployments.getExtendedArtifact('FiatTokenV1'); // artifacts.readArtifactSync('FiatTokenV1'),

//         deployments.save('FiatTokenV1', { ...artifact, address: ft.address });
//     }
// };
// export default deployMock_FiatTokenV1;
// deployMock_FiatTokenV1.tags = ['all', 'mocks', 'fUSD', 'fiat'];
