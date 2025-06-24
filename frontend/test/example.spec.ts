// Import necessary Synpress modules and setup
import { testWithSynpress } from '@synthetixio/synpress'
import { MetaMask, metaMaskFixtures } from '@synthetixio/synpress/playwright'
import basicSetup from './wallet-setup/basic.setup'

// Create a test instance with Synpress and MetaMask fixtures
const test = testWithSynpress(metaMaskFixtures(basicSetup))

// Extract expect function from test
const { expect } = test

// Define a basic test case
test('should connect wallet to the MetaMask Test Dapp', async ({ context, page, metamaskPage, extensionId }) => {
    const metamask = new MetaMask(context, metamaskPage, basicSetup.walletPassword, extensionId)

    await page.goto('/')

    await page.locator('#contract-list > div:first-child').click()
    await page.locator('#contract-settings-close').click()

    await expect(page.locator('#contract-chain')).toHaveText('Localhost')
    await expect(page.locator('#contract-address')).toHaveText('0x5Fb...aa3')

    await page.locator('#wallet-button').click()

    await metamask.connectToDapp()

    await expect(page.locator('#account-address')).toHaveText('0xf39...266')

    await page.locator('#create-room-button').click()
})
