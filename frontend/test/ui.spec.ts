// Import necessary Synpress modules and setup
import { testWithSynpress } from '@synthetixio/synpress'
import { MetaMask, metaMaskFixtures } from '@synthetixio/synpress/playwright'
import basicSetup from './wallet-setup/basic.setup'

// Create a test instance with Synpress and MetaMask fixtures
const test = testWithSynpress(metaMaskFixtures(basicSetup))

// Extract expect function from test
const { expect } = test

//! NOTE: Hardhat node has to be running and account 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 needs to have funds
test('Should add 3 to the value', async ({ context, page, metamaskPage, extensionId }) => {
    // Create a new MetaMask instance
    const metamask = new MetaMask(context, metamaskPage, basicSetup.walletPassword, extensionId)

    // Navigate to the homepage
    await page.goto('/')

    // Click the connect button
    await page.locator('#wallet-button').click()

    // Connect MetaMask to the dapp
    await metamask.connectToDapp()

    // Verify the connected account address
    await expect(page.locator('#account')).toHaveText('Connected to: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266')

    const valueBefore = (await page.locator('#value').textContent())?.replace('Value: ', '')
    const valueBeforeNumber = parseInt(valueBefore ?? '0')

    await page.locator('#add-button').click()

    // Confirm the transaction in MetaMask
    await metamask.confirmTransactionAndWaitForMining()

    await page.locator('#refetch-value-button').click()
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Wait for the transaction to be processed and value to update
    await expect(page.locator('#value')).toHaveText(`Value: ${valueBeforeNumber + 3}`)
})
