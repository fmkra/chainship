// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from '@nomicfoundation/hardhat-ignition/modules'

const ChainshipModule = buildModule('ChainshipModule', (m) => {
    const chainship = m.contract('ChainshipImplementation', [0])

    return { chainship }
})

export default ChainshipModule
