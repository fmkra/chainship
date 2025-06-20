## Deployment

Contracts:

```
npx hardhat node
npx hardhat ignition deploy ignition/modules/Chainship.ts --network localhost
```

Frontend:

```
cd frontend
pnpm install
pnpm dev
```

## TODOs:

-   Update architecture file
-   Automatic deployments
-   Frontend should display list of rooms that player has ever joined and their statuses
-   Claim idle handling on frontend side
-   More tests for contracts
-   Playwright tests
