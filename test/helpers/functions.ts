import { ethers } from 'hardhat';

export function ValueStringInEthers(value: string) {
    return ethers.utils.parseEther(value).toString();
}
