const Pixelmap = require('../frontend/src/artifacts/contracts/Pixelmap.sol/Pixelmap.json');

marketPlaceAddr = "0x02e8910B3B89690d4aeC9fcC0Ae2cD16fB6A4828";

async function main() {
    
    const accounts = await ethers.getSigners();
    const mainAcct = accounts[16];
    const pixelmap = new ethers.Contract(marketPlaceAddr, Pixelmap.abi, mainAcct);
    

    const txn1 = await pixelmap.closeAuction(0);
    console.log(txn1.hash);
    
}
      
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

// npx hardhat run --network localhost scripts/closeAuction.js