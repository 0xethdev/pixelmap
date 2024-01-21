const Pixelmap = require('../frontend/src/artifacts/contracts/Pixelmap.sol/Pixelmap.json');

marketPlaceAddr = "0x76a999d5F7EFDE0a300e710e6f52Fb0A4b61aD58";

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