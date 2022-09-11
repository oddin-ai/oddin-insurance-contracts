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
        solidity: '0.8.16',
        etherscan: {
            apiKey: ETHERSCAN_API_KEY,
        },
        //     path: {
        //     sources: "./contracts",
        //     tests: "./test",
        //     cache: "./cache",
        //     artifacts: "./artifacts"
        //   }
    };
} else {
    config = {
        defaultNetwork: 'hardhat',
        solidity: '0.8.16',
    };
}

export default config;
