import { buildModule } from '@nomicfoundation/hardhat-ignition/modules'

const TestContractModule = buildModule('TestContractModule', (m) => {
    const testContract = m.contract('TestContract', [0])

    return { testContract }
})

export default TestContractModule
