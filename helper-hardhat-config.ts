export interface networkConfigItem {
    name: string;
    blockConfirmations: number;
}

export interface networkConfigInfo {
    [key: number]: networkConfigItem;
}

export const networkConfig: networkConfigInfo = {
    31337: { name: 'localhost', blockConfirmations: 1 },
    // hardhat: {},
    122: {
        name: 'fuse',
        blockConfirmations: 6,
    },
};

export const developmentChains = ['hardhat', 'localhost'];
