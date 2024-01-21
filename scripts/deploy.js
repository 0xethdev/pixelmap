

async function main() {
    const pixelmap = await ethers.deployContract("contracts/Pixelmap.sol:Pixelmap");
    console.log("pixelmap address:", await pixelmap.getAddress());

    const nftContract = await ethers.deployContract("contracts/CanvasCollection.sol:CanvasCollection",[pixelmap.getAddress()]);
    console.log("nftContract address:", await nftContract.getAddress());

    await pixelmap.setNFTContract(nftContract.getAddress());
    console.log('nft contract address set in pixel map');

  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
  
  // npx hardhat run --network localhost scripts/deploy.js