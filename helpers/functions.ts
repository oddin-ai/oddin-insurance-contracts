import { ethers } from 'hardhat';

export function Decimals18(value: string) {
    return ethers.utils.parseEther(value).toString();
}
