export default {
    abi: [
        {
            type: 'event',
            name: 'Approval',
            inputs: [
                {
                    type: 'address',
                    name: 'owner',
                    internalType: 'address',
                    indexed: true,
                },
                {
                    type: 'address',
                    name: 'spender',
                    internalType: 'address',
                    indexed: true,
                },
                {
                    type: 'uint256',
                    name: 'value',
                    internalType: 'uint256',
                    indexed: false,
                },
            ],
            anonymous: false,
        },
        {
            type: 'event',
            name: 'Blacklisted',
            inputs: [
                {
                    type: 'address',
                    name: '_account',
                    internalType: 'address',
                    indexed: true,
                },
            ],
            anonymous: false,
        },
        {
            type: 'event',
            name: 'BlacklisterChanged',
            inputs: [
                {
                    type: 'address',
                    name: 'newBlacklister',
                    internalType: 'address',
                    indexed: true,
                },
            ],
            anonymous: false,
        },
        {
            type: 'event',
            name: 'Burn',
            inputs: [
                {
                    type: 'address',
                    name: 'burner',
                    internalType: 'address',
                    indexed: true,
                },
                {
                    type: 'uint256',
                    name: 'amount',
                    internalType: 'uint256',
                    indexed: false,
                },
            ],
            anonymous: false,
        },
        {
            type: 'event',
            name: 'MasterMinterChanged',
            inputs: [
                {
                    type: 'address',
                    name: 'newMasterMinter',
                    internalType: 'address',
                    indexed: true,
                },
            ],
            anonymous: false,
        },
        {
            type: 'event',
            name: 'Mint',
            inputs: [
                {
                    type: 'address',
                    name: 'minter',
                    internalType: 'address',
                    indexed: true,
                },
                {
                    type: 'address',
                    name: 'to',
                    internalType: 'address',
                    indexed: true,
                },
                {
                    type: 'uint256',
                    name: 'amount',
                    internalType: 'uint256',
                    indexed: false,
                },
            ],
            anonymous: false,
        },
        {
            type: 'event',
            name: 'MinterConfigured',
            inputs: [
                {
                    type: 'address',
                    name: 'minter',
                    internalType: 'address',
                    indexed: true,
                },
                {
                    type: 'uint256',
                    name: 'minterAllowedAmount',
                    internalType: 'uint256',
                    indexed: false,
                },
            ],
            anonymous: false,
        },
        {
            type: 'event',
            name: 'MinterRemoved',
            inputs: [
                {
                    type: 'address',
                    name: 'oldMinter',
                    internalType: 'address',
                    indexed: true,
                },
            ],
            anonymous: false,
        },
        {
            type: 'event',
            name: 'OwnershipTransferred',
            inputs: [
                {
                    type: 'address',
                    name: 'previousOwner',
                    internalType: 'address',
                    indexed: false,
                },
                {
                    type: 'address',
                    name: 'newOwner',
                    internalType: 'address',
                    indexed: false,
                },
            ],
            anonymous: false,
        },
        { type: 'event', name: 'Pause', inputs: [], anonymous: false },
        {
            type: 'event',
            name: 'PauserChanged',
            inputs: [
                {
                    type: 'address',
                    name: 'newAddress',
                    internalType: 'address',
                    indexed: true,
                },
            ],
            anonymous: false,
        },
        {
            type: 'event',
            name: 'Transfer',
            inputs: [
                {
                    type: 'address',
                    name: 'from',
                    internalType: 'address',
                    indexed: true,
                },
                {
                    type: 'address',
                    name: 'to',
                    internalType: 'address',
                    indexed: true,
                },
                {
                    type: 'uint256',
                    name: 'value',
                    internalType: 'uint256',
                    indexed: false,
                },
            ],
            anonymous: false,
        },
        {
            type: 'event',
            name: 'UnBlacklisted',
            inputs: [
                {
                    type: 'address',
                    name: '_account',
                    internalType: 'address',
                    indexed: true,
                },
            ],
            anonymous: false,
        },
        { type: 'event', name: 'Unpause', inputs: [], anonymous: false },
        {
            type: 'function',
            stateMutability: 'view',
            outputs: [{ type: 'uint256', name: '', internalType: 'uint256' }],
            name: 'allowance',
            inputs: [
                { type: 'address', name: 'owner', internalType: 'address' },
                {
                    type: 'address',
                    name: 'spender',
                    internalType: 'address',
                },
            ],
        },
        {
            type: 'function',
            stateMutability: 'nonpayable',
            outputs: [{ type: 'bool', name: '', internalType: 'bool' }],
            name: 'approve',
            inputs: [
                {
                    type: 'address',
                    name: 'spender',
                    internalType: 'address',
                },
                { type: 'uint256', name: 'value', internalType: 'uint256' },
            ],
        },
        {
            type: 'function',
            stateMutability: 'view',
            outputs: [{ type: 'uint256', name: '', internalType: 'uint256' }],
            name: 'balanceOf',
            inputs: [
                {
                    type: 'address',
                    name: 'account',
                    internalType: 'address',
                },
            ],
        },
        {
            type: 'function',
            stateMutability: 'nonpayable',
            outputs: [],
            name: 'blacklist',
            inputs: [
                {
                    type: 'address',
                    name: '_account',
                    internalType: 'address',
                },
            ],
        },
        {
            type: 'function',
            stateMutability: 'view',
            outputs: [{ type: 'address', name: '', internalType: 'address' }],
            name: 'blacklister',
            inputs: [],
        },
        {
            type: 'function',
            stateMutability: 'nonpayable',
            outputs: [],
            name: 'burn',
            inputs: [
                {
                    type: 'uint256',
                    name: '_amount',
                    internalType: 'uint256',
                },
            ],
        },
        {
            type: 'function',
            stateMutability: 'nonpayable',
            outputs: [{ type: 'bool', name: '', internalType: 'bool' }],
            name: 'configureMinter',
            inputs: [
                {
                    type: 'address',
                    name: 'minter',
                    internalType: 'address',
                },
                {
                    type: 'uint256',
                    name: 'minterAllowedAmount',
                    internalType: 'uint256',
                },
            ],
        },
        {
            type: 'function',
            stateMutability: 'view',
            outputs: [{ type: 'string', name: '', internalType: 'string' }],
            name: 'currency',
            inputs: [],
        },
        {
            type: 'function',
            stateMutability: 'view',
            outputs: [{ type: 'uint8', name: '', internalType: 'uint8' }],
            name: 'decimals',
            inputs: [],
        },
        {
            type: 'function',
            stateMutability: 'nonpayable',
            outputs: [],
            name: 'initialize',
            inputs: [
                {
                    type: 'string',
                    name: 'tokenName',
                    internalType: 'string',
                },
                {
                    type: 'string',
                    name: 'tokenSymbol',
                    internalType: 'string',
                },
                {
                    type: 'string',
                    name: 'tokenCurrency',
                    internalType: 'string',
                },
                {
                    type: 'uint8',
                    name: 'tokenDecimals',
                    internalType: 'uint8',
                },
                {
                    type: 'address',
                    name: 'newMasterMinter',
                    internalType: 'address',
                },
                {
                    type: 'address',
                    name: 'newPauser',
                    internalType: 'address',
                },
                {
                    type: 'address',
                    name: 'newBlacklister',
                    internalType: 'address',
                },
                {
                    type: 'address',
                    name: 'newOwner',
                    internalType: 'address',
                },
            ],
        },
        {
            type: 'function',
            stateMutability: 'view',
            outputs: [{ type: 'bool', name: '', internalType: 'bool' }],
            name: 'isBlacklisted',
            inputs: [
                {
                    type: 'address',
                    name: '_account',
                    internalType: 'address',
                },
            ],
        },
        {
            type: 'function',
            stateMutability: 'view',
            outputs: [{ type: 'bool', name: '', internalType: 'bool' }],
            name: 'isMinter',
            inputs: [
                {
                    type: 'address',
                    name: 'account',
                    internalType: 'address',
                },
            ],
        },
        {
            type: 'function',
            stateMutability: 'view',
            outputs: [{ type: 'address', name: '', internalType: 'address' }],
            name: 'masterMinter',
            inputs: [],
        },
        {
            type: 'function',
            stateMutability: 'nonpayable',
            outputs: [{ type: 'bool', name: '', internalType: 'bool' }],
            name: 'mint',
            inputs: [
                { type: 'address', name: '_to', internalType: 'address' },
                {
                    type: 'uint256',
                    name: '_amount',
                    internalType: 'uint256',
                },
            ],
        },
        {
            type: 'function',
            stateMutability: 'view',
            outputs: [{ type: 'uint256', name: '', internalType: 'uint256' }],
            name: 'minterAllowance',
            inputs: [
                {
                    type: 'address',
                    name: 'minter',
                    internalType: 'address',
                },
            ],
        },
        {
            type: 'function',
            stateMutability: 'view',
            outputs: [{ type: 'string', name: '', internalType: 'string' }],
            name: 'name',
            inputs: [],
        },
        {
            type: 'function',
            stateMutability: 'view',
            outputs: [{ type: 'address', name: '', internalType: 'address' }],
            name: 'owner',
            inputs: [],
        },
        {
            type: 'function',
            stateMutability: 'nonpayable',
            outputs: [],
            name: 'pause',
            inputs: [],
        },
        {
            type: 'function',
            stateMutability: 'view',
            outputs: [{ type: 'bool', name: '', internalType: 'bool' }],
            name: 'paused',
            inputs: [],
        },
        {
            type: 'function',
            stateMutability: 'view',
            outputs: [{ type: 'address', name: '', internalType: 'address' }],
            name: 'pauser',
            inputs: [],
        },
        {
            type: 'function',
            stateMutability: 'nonpayable',
            outputs: [{ type: 'bool', name: '', internalType: 'bool' }],
            name: 'removeMinter',
            inputs: [
                {
                    type: 'address',
                    name: 'minter',
                    internalType: 'address',
                },
            ],
        },
        {
            type: 'function',
            stateMutability: 'view',
            outputs: [{ type: 'string', name: '', internalType: 'string' }],
            name: 'symbol',
            inputs: [],
        },
        {
            type: 'function',
            stateMutability: 'view',
            outputs: [{ type: 'uint256', name: '', internalType: 'uint256' }],
            name: 'totalSupply',
            inputs: [],
        },
        {
            type: 'function',
            stateMutability: 'nonpayable',
            outputs: [{ type: 'bool', name: '', internalType: 'bool' }],
            name: 'transfer',
            inputs: [
                { type: 'address', name: 'to', internalType: 'address' },
                { type: 'uint256', name: 'value', internalType: 'uint256' },
            ],
        },
        {
            type: 'function',
            stateMutability: 'nonpayable',
            outputs: [{ type: 'bool', name: '', internalType: 'bool' }],
            name: 'transferFrom',
            inputs: [
                { type: 'address', name: 'from', internalType: 'address' },
                { type: 'address', name: 'to', internalType: 'address' },
                { type: 'uint256', name: 'value', internalType: 'uint256' },
            ],
        },
        {
            type: 'function',
            stateMutability: 'nonpayable',
            outputs: [],
            name: 'transferOwnership',
            inputs: [
                {
                    type: 'address',
                    name: 'newOwner',
                    internalType: 'address',
                },
            ],
        },
        {
            type: 'function',
            stateMutability: 'nonpayable',
            outputs: [],
            name: 'unBlacklist',
            inputs: [
                {
                    type: 'address',
                    name: '_account',
                    internalType: 'address',
                },
            ],
        },
        {
            type: 'function',
            stateMutability: 'nonpayable',
            outputs: [],
            name: 'unpause',
            inputs: [],
        },
        {
            type: 'function',
            stateMutability: 'nonpayable',
            outputs: [],
            name: 'updateBlacklister',
            inputs: [
                {
                    type: 'address',
                    name: '_newBlacklister',
                    internalType: 'address',
                },
            ],
        },
        {
            type: 'function',
            stateMutability: 'nonpayable',
            outputs: [],
            name: 'updateMasterMinter',
            inputs: [
                {
                    type: 'address',
                    name: '_newMasterMinter',
                    internalType: 'address',
                },
            ],
        },
        {
            type: 'function',
            stateMutability: 'nonpayable',
            outputs: [],
            name: 'updatePauser',
            inputs: [
                {
                    type: 'address',
                    name: '_newPauser',
                    internalType: 'address',
                },
            ],
        },
    ],
    bytecode: `0x608060405234801561001057600080fd5b50600436106101e55760003560e01c806370a082311161010f578063aa271e1a116100a2578063e5a6b10f11610071578063e5a6b10f14610821578063f2fde38b14610829578063f9f92be41461085c578063fe575a871461088f576101e5565b8063aa271e1a14610778578063ad38bf22146107ab578063bd102430146107de578063dd62ed3e146107e6576101e5565b806395d89b41116100de57806395d89b41146106fc5780639fd0506d14610704578063a9059cbb1461070c578063aa20e1e414610745576101e5565b806370a08231146106865780638456cb59146106b95780638a6db9c3146106c15780638da5cb5b146106f4576101e5565b80633357162b1161018757806342966c681161015657806342966c68146105f55780634e44d95614610612578063554bab3c1461064b5780635c975abb1461067e576101e5565b80633357162b1461039757806335d99f35146105835780633f4ba83a146105b457806340c10f19146105bc576101e5565b80631a895266116101c35780631a895266146102ce57806323b872dd146103035780633092afd514610346578063313ce56714610379576101e5565b806306fdde03146101ea578063095ea7b31461026757806318160ddd146102b4575b600080fd5b6101f26108c2565b6040805160208082528351818301528351919283929083019185019080838360005b8381101561022c578181015183820152602001610214565b50505050905090810190601f1680156102595780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b6102a06004803603604081101561027d57600080fd5b5073ffffffffffffffffffffffffffffffffffffffff813516906020013561096e565b604080519115158252519081900360200190f35b6102bc610afb565b60408051918252519081900360200190f35b610301600480360360208110156102e457600080fd5b503573ffffffffffffffffffffffffffffffffffffffff16610b01565b005b6102a06004803603606081101561031957600080fd5b5073ffffffffffffffffffffffffffffffffffffffff813581169160208101359091169060400135610be5565b6102a06004803603602081101561035c57600080fd5b503573ffffffffffffffffffffffffffffffffffffffff16610eeb565b610381610fe4565b6040805160ff9092168252519081900360200190f35b61030160048036036101008110156103ae57600080fd5b8101906020810181356401000000008111156103c957600080fd5b8201836020820111156103db57600080fd5b803590602001918460018302840111640100000000831117156103fd57600080fd5b91908080601f016020809104026020016040519081016040528093929190818152602001838380828437600092019190915250929594936020810193503591505064010000000081111561045057600080fd5b82018360208201111561046257600080fd5b8035906020019184600183028401116401000000008311171561048457600080fd5b91908080601f01602080910402602001604051908101604052809392919081815260200183838082843760009201919091525092959493602081019350359150506401000000008111156104d757600080fd5b8201836020820111156104e957600080fd5b8035906020019184600183028401116401000000008311171561050b57600080fd5b91908080601f0160208091040260200160405190810160405280939291908181526020018383808284376000920191909152509295505050813560ff16925050602081013573ffffffffffffffffffffffffffffffffffffffff90811691604081013582169160608201358116916080013516610fed565b61058b61132f565b6040805173ffffffffffffffffffffffffffffffffffffffff9092168252519081900360200190f35b61030161134b565b6102a0600480360360408110156105d257600080fd5b5073ffffffffffffffffffffffffffffffffffffffff813516906020013561140e565b6103016004803603602081101561060b57600080fd5b5035611843565b6102a06004803603604081101561062857600080fd5b5073ffffffffffffffffffffffffffffffffffffffff8135169060200135611afd565b6103016004803603602081101561066157600080fd5b503573ffffffffffffffffffffffffffffffffffffffff16611c90565b6102a0611df7565b6102bc6004803603602081101561069c57600080fd5b503573ffffffffffffffffffffffffffffffffffffffff16611e18565b610301611e40565b6102bc600480360360208110156106d757600080fd5b503573ffffffffffffffffffffffffffffffffffffffff16611f1a565b61058b611f42565b6101f2611f5e565b61058b611fd7565b6102a06004803603604081101561072257600080fd5b5073ffffffffffffffffffffffffffffffffffffffff8135169060200135611ff3565b6103016004803603602081101561075b57600080fd5b503573ffffffffffffffffffffffffffffffffffffffff16612175565b6102a06004803603602081101561078e57600080fd5b503573ffffffffffffffffffffffffffffffffffffffff166122dc565b610301600480360360208110156107c157600080fd5b503573ffffffffffffffffffffffffffffffffffffffff16612307565b61058b61246e565b6102bc600480360360408110156107fc57600080fd5b5073ffffffffffffffffffffffffffffffffffffffff8135811691602001351661248a565b6101f26124c2565b6103016004803603602081101561083f57600080fd5b503573ffffffffffffffffffffffffffffffffffffffff1661253b565b6103016004803603602081101561087257600080fd5b503573ffffffffffffffffffffffffffffffffffffffff1661268e565b6102a0600480360360208110156108a557600080fd5b503573ffffffffffffffffffffffffffffffffffffffff16612775565b6004805460408051602060026001851615610100027fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0190941693909304601f810184900484028201840190925281815292918301828280156109665780601f1061093b57610100808354040283529160200191610966565b820191906000526020600020905b81548152906001019060200180831161094957829003601f168201915b505050505081565b60015460009074010000000000000000000000000000000000000000900460ff16156109fb57604080517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601060248201527f5061757361626c653a2070617573656400000000000000000000000000000000604482015290519081900360640190fd5b3360008181526003602052604090205460ff1615610a64576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260258152602001806130f06025913960400191505060405180910390fd5b73ffffffffffffffffffffffffffffffffffffffff8416600090815260036020526040902054849060ff1615610ae5576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260258152602001806130f06025913960400191505060405180910390fd5b610af03386866127a0565b506001949350505050565b600b5490565b60025473ffffffffffffffffffffffffffffffffffffffff163314610b71576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252602c815260200180612edb602c913960400191505060405180910390fd5b73ffffffffffffffffffffffffffffffffffffffff811660008181526003602052604080822080547fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff00169055517f117e3210bb9aa7d9baff172026820255c6f6c30ba8999d1c2fd88e2848137c4e9190a250565b60015460009074010000000000000000000000000000000000000000900460ff1615610c7257604080517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601060248201527f5061757361626c653a2070617573656400000000000000000000000000000000604482015290519081900360640190fd5b3360008181526003602052604090205460ff1615610cdb576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260258152602001806130f06025913960400191505060405180910390fd5b73ffffffffffffffffffffffffffffffffffffffff8516600090815260036020526040902054859060ff1615610d5c576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260258152602001806130f06025913960400191505060405180910390fd5b73ffffffffffffffffffffffffffffffffffffffff8516600090815260036020526040902054859060ff1615610ddd576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260258152602001806130f06025913960400191505060405180910390fd5b73ffffffffffffffffffffffffffffffffffffffff87166000908152600a60209081526040808320338452909152902054851115610e66576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401808060200182810382526028815260200180612f7d6028913960400191505060405180910390fd5b610e718787876128e7565b73ffffffffffffffffffffffffffffffffffffffff87166000908152600a60209081526040808320338452909152902054610eac9086612b12565b73ffffffffffffffffffffffffffffffffffffffff88166000908152600a60209081526040808320338452909152902055600193505050509392505050565b60085460009073ffffffffffffffffffffffffffffffffffffffff163314610f5e576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401808060200182810382526029815260200180612eb26029913960400191505060405180910390fd5b73ffffffffffffffffffffffffffffffffffffffff82166000818152600c6020908152604080832080547fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff00169055600d909152808220829055517fe94479a9f7e1952cc78f2d6baab678adc1b772d936c6583def489e524cb666929190a2506001919050565b60065460ff1681565b60085474010000000000000000000000000000000000000000900460ff1615611061576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252602a815260200180612fd3602a913960400191505060405180910390fd5b73ffffffffffffffffffffffffffffffffffffffff84166110cd576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252602f815260200180612f4e602f913960400191505060405180910390fd5b73ffffffffffffffffffffffffffffffffffffffff8316611139576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401808060200182810382526029815260200180612e3a6029913960400191505060405180910390fd5b73ffffffffffffffffffffffffffffffffffffffff82166111a5576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252602e815260200180612fa5602e913960400191505060405180910390fd5b73ffffffffffffffffffffffffffffffffffffffff8116611211576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260288152602001806130966028913960400191505060405180910390fd5b87516112249060049060208b0190612cc7565b5086516112389060059060208a0190612cc7565b50855161124c906007906020890190612cc7565b50600680547fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff001660ff8716179055600880547fffffffffffffffffffffffff000000000000000000000000000000000000000090811673ffffffffffffffffffffffffffffffffffffffff87811691909117909255600180548216868416179055600280549091169184169190911790556112e681612b5b565b5050600880547fffffffffffffffffffffff00ffffffffffffffffffffffffffffffffffffffff1674010000000000000000000000000000000000000000179055505050505050565b60085473ffffffffffffffffffffffffffffffffffffffff1681565b60015473ffffffffffffffffffffffffffffffffffffffff1633146113bb576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260228152602001806130746022913960400191505060405180910390fd5b600180547fffffffffffffffffffffff00ffffffffffffffffffffffffffffffffffffffff1690556040517f7805862f689e2f13df9f062ff482ad3ad112aca9e0847911ed832e158c525b3390600090a1565b60015460009074010000000000000000000000000000000000000000900460ff161561149b57604080517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601060248201527f5061757361626c653a2070617573656400000000000000000000000000000000604482015290519081900360640190fd5b336000908152600c602052604090205460ff16611503576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401808060200182810382526021815260200180612f2d6021913960400191505060405180910390fd5b3360008181526003602052604090205460ff161561156c576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260258152602001806130f06025913960400191505060405180910390fd5b73ffffffffffffffffffffffffffffffffffffffff8416600090815260036020526040902054849060ff16156115ed576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260258152602001806130f06025913960400191505060405180910390fd5b73ffffffffffffffffffffffffffffffffffffffff8516611659576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401808060200182810382526023815260200180612dcf6023913960400191505060405180910390fd5b600084116116b2576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401808060200182810382526029815260200180612e636029913960400191505060405180910390fd5b336000908152600d60205260409020548085111561171b576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252602e815260200180613046602e913960400191505060405180910390fd5b600b546117289086612ba2565b600b5573ffffffffffffffffffffffffffffffffffffffff861660009081526009602052604090205461175b9086612ba2565b73ffffffffffffffffffffffffffffffffffffffff871660009081526009602052604090205561178b8186612b12565b336000818152600d6020908152604091829020939093558051888152905173ffffffffffffffffffffffffffffffffffffffff8a16937fab8530f87dc9b59234c4623bf917212bb2536d647574c8e7e5da92c2ede0c9f8928290030190a360408051868152905173ffffffffffffffffffffffffffffffffffffffff8816916000917fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef9181900360200190a350600195945050505050565b60015474010000000000000000000000000000000000000000900460ff16156118cd57604080517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601060248201527f5061757361626c653a2070617573656400000000000000000000000000000000604482015290519081900360640190fd5b336000908152600c602052604090205460ff16611935576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401808060200182810382526021815260200180612f2d6021913960400191505060405180910390fd5b3360008181526003602052604090205460ff161561199e576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260258152602001806130f06025913960400191505060405180910390fd5b3360009081526009602052604090205482611a04576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401808060200182810382526029815260200180612da66029913960400191505060405180910390fd5b82811015611a5d576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401808060200182810382526026815260200180612f076026913960400191505060405180910390fd5b600b54611a6a9084612b12565b600b55611a778184612b12565b33600081815260096020908152604091829020939093558051868152905191927fcc16f5dbb4873280815c1ee09dbd06736cffcc184412cf7a71a0fdb75d397ca592918290030190a260408051848152905160009133917fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef9181900360200190a3505050565b60015460009074010000000000000000000000000000000000000000900460ff1615611b8a57604080517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601060248201527f5061757361626c653a2070617573656400000000000000000000000000000000604482015290519081900360640190fd5b60085473ffffffffffffffffffffffffffffffffffffffff163314611bfa576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401808060200182810382526029815260200180612eb26029913960400191505060405180910390fd5b73ffffffffffffffffffffffffffffffffffffffff83166000818152600c6020908152604080832080547fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff00166001179055600d825291829020859055815185815291517f46980fca912ef9bcdbd36877427b6b90e860769f604e89c0e67720cece530d209281900390910190a250600192915050565b60005473ffffffffffffffffffffffffffffffffffffffff163314611d1657604080517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820181905260248201527f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e6572604482015290519081900360640190fd5b73ffffffffffffffffffffffffffffffffffffffff8116611d82576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401808060200182810382526028815260200180612d7e6028913960400191505060405180910390fd5b600180547fffffffffffffffffffffffff00000000000000000000000000000000000000001673ffffffffffffffffffffffffffffffffffffffff83811691909117918290556040519116907fb80482a293ca2e013eda8683c9bd7fc8347cfdaeea5ede58cba46df502c2a60490600090a250565b60015474010000000000000000000000000000000000000000900460ff1681565b73ffffffffffffffffffffffffffffffffffffffff1660009081526009602052604090205490565b60015473ffffffffffffffffffffffffffffffffffffffff163314611eb0576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260228152602001806130746022913960400191505060405180910390fd5b600180547fffffffffffffffffffffff00ffffffffffffffffffffffffffffffffffffffff16740100000000000000000000000000000000000000001790556040517f6985a02210a168e66602d3235cb6db0e70f92b3ba4d376a33c0f3d9434bff62590600090a1565b73ffffffffffffffffffffffffffffffffffffffff166000908152600d602052604090205490565b60005473ffffffffffffffffffffffffffffffffffffffff1690565b6005805460408051602060026001851615610100027fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0190941693909304601f810184900484028201840190925281815292918301828280156109665780601f1061093b57610100808354040283529160200191610966565b60015473ffffffffffffffffffffffffffffffffffffffff1681565b60015460009074010000000000000000000000000000000000000000900460ff161561208057604080517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601060248201527f5061757361626c653a2070617573656400000000000000000000000000000000604482015290519081900360640190fd5b3360008181526003602052604090205460ff16156120e9576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260258152602001806130f06025913960400191505060405180910390fd5b73ffffffffffffffffffffffffffffffffffffffff8416600090815260036020526040902054849060ff161561216a576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260258152602001806130f06025913960400191505060405180910390fd5b610af03386866128e7565b60005473ffffffffffffffffffffffffffffffffffffffff1633146121fb57604080517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820181905260248201527f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e6572604482015290519081900360640190fd5b73ffffffffffffffffffffffffffffffffffffffff8116612267576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252602f815260200180612f4e602f913960400191505060405180910390fd5b600880547fffffffffffffffffffffffff00000000000000000000000000000000000000001673ffffffffffffffffffffffffffffffffffffffff83811691909117918290556040519116907fdb66dfa9c6b8f5226fe9aac7e51897ae8ee94ac31dc70bb6c9900b2574b707e690600090a250565b73ffffffffffffffffffffffffffffffffffffffff166000908152600c602052604090205460ff1690565b60005473ffffffffffffffffffffffffffffffffffffffff16331461238d57604080517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820181905260248201527f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e6572604482015290519081900360640190fd5b73ffffffffffffffffffffffffffffffffffffffff81166123f9576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260328152602001806130be6032913960400191505060405180910390fd5b600280547fffffffffffffffffffffffff00000000000000000000000000000000000000001673ffffffffffffffffffffffffffffffffffffffff83811691909117918290556040519116907fc67398012c111ce95ecb7429b933096c977380ee6c421175a71a4a4c6c88c06e90600090a250565b60025473ffffffffffffffffffffffffffffffffffffffff1681565b73ffffffffffffffffffffffffffffffffffffffff9182166000908152600a6020908152604080832093909416825291909152205490565b6007805460408051602060026001851615610100027fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0190941693909304601f810184900484028201840190925281815292918301828280156109665780601f1061093b57610100808354040283529160200191610966565b60005473ffffffffffffffffffffffffffffffffffffffff1633146125c157604080517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820181905260248201527f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e6572604482015290519081900360640190fd5b73ffffffffffffffffffffffffffffffffffffffff811661262d576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401808060200182810382526026815260200180612df26026913960400191505060405180910390fd5b6000546040805173ffffffffffffffffffffffffffffffffffffffff9283168152918316602083015280517f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e09281900390910190a161268b81612b5b565b50565b60025473ffffffffffffffffffffffffffffffffffffffff1633146126fe576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252602c815260200180612edb602c913960400191505060405180910390fd5b73ffffffffffffffffffffffffffffffffffffffff811660008181526003602052604080822080547fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff00166001179055517fffa4e6181777692565cf28528fc88fd1516ea86b56da075235fa575af6a4b8559190a250565b73ffffffffffffffffffffffffffffffffffffffff1660009081526003602052604090205460ff1690565b73ffffffffffffffffffffffffffffffffffffffff831661280c576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260248152602001806130226024913960400191505060405180910390fd5b73ffffffffffffffffffffffffffffffffffffffff8216612878576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401808060200182810382526022815260200180612e186022913960400191505060405180910390fd5b73ffffffffffffffffffffffffffffffffffffffff8084166000818152600a6020908152604080832094871680845294825291829020859055815185815291517f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b9259281900390910190a3505050565b73ffffffffffffffffffffffffffffffffffffffff8316612953576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401808060200182810382526025815260200180612ffd6025913960400191505060405180910390fd5b73ffffffffffffffffffffffffffffffffffffffff82166129bf576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401808060200182810382526023815260200180612d5b6023913960400191505060405180910390fd5b73ffffffffffffffffffffffffffffffffffffffff8316600090815260096020526040902054811115612a3d576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401808060200182810382526026815260200180612e8c6026913960400191505060405180910390fd5b73ffffffffffffffffffffffffffffffffffffffff8316600090815260096020526040902054612a6d9082612b12565b73ffffffffffffffffffffffffffffffffffffffff8085166000908152600960205260408082209390935590841681522054612aa99082612ba2565b73ffffffffffffffffffffffffffffffffffffffff80841660008181526009602090815260409182902094909455805185815290519193928716927fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef92918290030190a3505050565b6000612b5483836040518060400160405280601e81526020017f536166654d6174683a207375627472616374696f6e206f766572666c6f770000815250612c16565b9392505050565b600080547fffffffffffffffffffffffff00000000000000000000000000000000000000001673ffffffffffffffffffffffffffffffffffffffff92909216919091179055565b600082820183811015612b5457604080517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601b60248201527f536166654d6174683a206164646974696f6e206f766572666c6f770000000000604482015290519081900360640190fd5b60008184841115612cbf576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825283818151815260200191508051906020019080838360005b83811015612c84578181015183820152602001612c6c565b50505050905090810190601f168015612cb15780820380516001836020036101000a031916815260200191505b509250505060405180910390fd5b505050900390565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f10612d0857805160ff1916838001178555612d35565b82800160010185558215612d35579182015b82811115612d35578251825591602001919060010190612d1a565b50612d41929150612d45565b5090565b5b80821115612d415760008155600101612d4656fe45524332303a207472616e7366657220746f20746865207a65726f20616464726573735061757361626c653a206e65772070617573657220697320746865207a65726f206164647265737346696174546f6b656e3a206275726e20616d6f756e74206e6f742067726561746572207468616e203046696174546f6b656e3a206d696e7420746f20746865207a65726f20616464726573734f776e61626c653a206e6577206f776e657220697320746865207a65726f206164647265737345524332303a20617070726f766520746f20746865207a65726f206164647265737346696174546f6b656e3a206e65772070617573657220697320746865207a65726f206164647265737346696174546f6b656e3a206d696e7420616d6f756e74206e6f742067726561746572207468616e203045524332303a207472616e7366657220616d6f756e7420657863656564732062616c616e636546696174546f6b656e3a2063616c6c6572206973206e6f7420746865206d61737465724d696e746572426c61636b6c69737461626c653a2063616c6c6572206973206e6f742074686520626c61636b6c697374657246696174546f6b656e3a206275726e20616d6f756e7420657863656564732062616c616e636546696174546f6b656e3a2063616c6c6572206973206e6f742061206d696e74657246696174546f6b656e3a206e6577206d61737465724d696e74657220697320746865207a65726f206164647265737345524332303a207472616e7366657220616d6f756e74206578636565647320616c6c6f77616e636546696174546f6b656e3a206e657720626c61636b6c697374657220697320746865207a65726f206164647265737346696174546f6b656e3a20636f6e747261637420697320616c726561647920696e697469616c697a656445524332303a207472616e736665722066726f6d20746865207a65726f206164647265737345524332303a20617070726f76652066726f6d20746865207a65726f206164647265737346696174546f6b656e3a206d696e7420616d6f756e742065786365656473206d696e746572416c6c6f77616e63655061757361626c653a2063616c6c6572206973206e6f74207468652070617573657246696174546f6b656e3a206e6577206f776e657220697320746865207a65726f2061646472657373426c61636b6c69737461626c653a206e657720626c61636b6c697374657220697320746865207a65726f2061646472657373426c61636b6c69737461626c653a206163636f756e7420697320626c61636b6c6973746564a26469706673582212208fe5689b26206af2a8060a80244f2af2aa2c332fc27053c4316e2b1f90727eee64736f6c634300060c0033`,
};
