import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
import '@nomicfoundation/hardhat-network-helpers';
import '@nomicfoundation/hardhat-chai-matchers';
import '@nomiclabs/hardhat-ethers';
import '@typechain/hardhat';
import '@openzeppelin/hardhat-upgrades';
import 'hardhat-gas-reporter';
import 'hardhat-deploy';
import 'dotenv/config';

let config: HardhatUserConfig;
if (process.env.NODE_ENV !== 'build') {
    const RINKEBY_RPC_URL = process.env.RINKEBY_RPC_URL || '';
    const PRIVATE_KEY = process.env.PRIVATE_KEY || '';
    const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || '';
    config = {
        defaultNetwork: 'hardhat',
        networks: {
            rinkeby: {
                url: RINKEBY_RPC_URL,
                accounts: [PRIVATE_KEY],
                chainId: 4,
            },
            localhost: {
                url: 'http://127.0.0.1:8545/',
                chainId: 31337,
            },
        },
        solidity: {
            compilers: [{ version: '0.6.12' }, { version: '0.8.16' }],
        },
        etherscan: {
            apiKey: ETHERSCAN_API_KEY,
        },
        namedAccounts: {
            deployer: {
                default: 0, // here this will by default take the first account as deployer
                1: 0, // similarly on mainnet it will take the first account as deployer. Note though that depending on how hardhat network are configured, the account 0 on one network can be different than on another
            },
            externalDeployer: {
                default: 1,
                1: 1,
            },
            externalAdmin: {
                default: 2,
                1: 2,
            },
            user_a: {
                default: 3,
                1: 3,
            },
            user_b: {
                default: 4,
                1: 4,
            },
        },
    };
} else {
    config = {
        defaultNetwork: 'hardhat',
        solidity: {
            compilers: [{ version: '0.6.12' }, { version: '0.8.16' }],
        },
    };
}

export default config;
