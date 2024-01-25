const Pixelmap = require('../frontend/src/artifacts/contracts/Pixelmap.sol/Pixelmap.json');

marketPlaceAddr = "0x564Db7a11653228164FD03BcA60465270E67b3d7";

async function main() {
    
    const accounts = await ethers.getSigners();
    const mainAcct = accounts[16];
    const pixelmap = new ethers.Contract(marketPlaceAddr, Pixelmap.abi, mainAcct);
    

    const txn1 = await pixelmap.checkVoteOutcome(0);
    console.log(txn1.hash);
    
}
      
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

// npx hardhat run --network localhost scripts/mintNFT.js