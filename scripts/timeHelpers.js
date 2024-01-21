const { time } = require('@nomicfoundation/hardhat-network-helpers');

async function main() {
  // advance time by one hour and mine a new block
  await time.increase(60*60*24*3+3);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

// npx hardhat run --network localhost scripts/timeHelpers.js