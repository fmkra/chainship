import { HardhatUserConfig } from 'hardhat/config'
import '@nomicfoundation/hardhat-toolbox'
import 'hardhat-gas-reporter'
import '@nomicfoundation/hardhat-chai-matchers'

import dotenv from 'dotenv'
dotenv.config()

const config: HardhatUserConfig = {
    solidity: {
        version: '0.8.28',
        settings: {
            viaIR: true,
            optimizer: {
                enabled: true,
                runs: 1000,
            },
        },
    },
    networks: {
        sepolia: {
            url: 'https://ethereum-sepolia-rpc.publicnode.com',
            accounts: [process.env.PRIVATE_KEY as string],
            chainId: 11155111,
        },
        deployment: {
            url: process.env.RPC_URL as string,
            accounts: [process.env.PRIVATE_KEY as string],
            chainId: 123123,
        },
    },
    etherscan: {
        apiKey: {
            sepolia: process.env.ETHERSCAN_API_KEY as string,
        },
    },
}

export default config
