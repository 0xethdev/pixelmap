

async function main() {
    const pixelmap = await ethers.deployContract("Pixelmap");
    console.log("pixelmap address:", await pixelmap.getAddress());
  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
  
  // npx hardhat run --network localhost scripts/deploy.js