export interface networkConfigItem {
    name: string;
    blockConfirmations: number;
    nativeStable: string;
}

export interface networkConfigInfo {
    [key: number]: networkConfigItem;
}

export const networkConfig: networkConfigInfo = {
    31337: { 
        name: 'localhost', 
        blockConfirmations: 1,
        nativeStable: "0xf2edF1c091f683E3fb452497d9a98A49cBA84666",
    },
    // hardhat: {},
    122: {
        name: 'fuse',
        blockConfirmations: 6,
        nativeStable: "0x249BE57637D8B013Ad64785404b24aeBaE9B098B",
    },
    123: {
        name: 'fusespark',
        blockConfirmations: 6,
        nativeStable: "0x249BE57637D8B013Ad64785404b24aeBaE9B098B",
    },
    5: {
        name: "goerli",
        blockConfirmations: 5,
        nativeStable: "0xf2edF1c091f683E3fb452497d9a98A49cBA84666",
    },
};

export const developmentChains = ['hardhat','localhost'];
