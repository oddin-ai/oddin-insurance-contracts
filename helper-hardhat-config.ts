export interface networkConfigItem {}

export interface networkConfigInfo {
    [key: string]: networkConfigItem;
}

export const networkConfig: networkConfigInfo = {
    localhost: {},
    hardhat: {},
    kovan: {},
};

export const developmentChains = ['hardhat', 'localhost'];
