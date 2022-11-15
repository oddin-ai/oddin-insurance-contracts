import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
import '@nomicfoundation/hardhat-network-helpers';
import '@nomicfoundation/hardhat-chai-matchers';
import '@nomiclabs/hardhat-ethers';
import '@typechain/hardhat';
import '@openzeppelin/hardhat-upgrades';
import 'hardhat-gas-reporter';
import 'solidity-coverage';
import 'hardhat-deploy';
import 'dotenv/config';
import { Mnemonic } from 'ethers/lib/utils';

let config: HardhatUserConfig;
if (process.env.NODE_ENV !== 'build') {
    const RINKEBY_RPC_URL = process.env.RINKEBY_RPC_URL || '';
    const PRIVATE_KEY = process.env.PRIVATE_KEY || '';
    const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || '';
    const GOERLI_RPC_URL = process.env.GOERLI_URL || '';
    config = {
        defaultNetwork: 'hardhat',
        networks: {
            // hardhat: {
            //     chainId:31337,
            //     forking: {
            //         url: GOERLI_RPC_URL,  
            //         blockNumber: 7915297,
            //     }
            // },
            rinkeby: {
                url: RINKEBY_RPC_URL,
                accounts: [PRIVATE_KEY],
                chainId: 4,
            },
            goerli: {
                url: GOERLI_RPC_URL,
                accounts: [PRIVATE_KEY],
                chainId: 5,
            },
            localhost: {
                url: 'http://127.0.0.1:8545/',
                chainId: 31337,
            },
            gnosis: {
                url: 'https://rpc.fuse.io',
                gasPrice: 10000000000,
                accounts: [PRIVATE_KEY],
                chainId: 122,
            },
            chiado: {
                url: 'https://rpc.fusespark.io',
                gasPrice: 10000000000,
                accounts: [PRIVATE_KEY],
                chainId: 123,
            }
        },
        solidity: {
            compilers: [
                {
                    version: '0.6.12',
                    settings: {
                        outputSelection: {
                            '*': {
                                '*': ['storageLayout'],
                            },
                        },
                    },
                },
                {
                    version: '0.8.16',
                    settings: {
                        outputSelection: {
                            '*': {
                                '*': ['storageLayout'],
                            },
                        },
                    },
                },
            ],
        },
        etherscan: {
            apiKey: ETHERSCAN_API_KEY,
        },
        gasReporter: {
            enabled:true,
            outputFile: "gas-report.txt",
            // currency: "USD",
            // coinmarketcap: COINMARKETCAP
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
}

export default config;
