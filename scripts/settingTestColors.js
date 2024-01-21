const Pixelmap = require('../frontend/src/artifacts/contracts/Pixelmap.sol/Pixelmap.json');

marketPlaceAddr = "0x76a999d5F7EFDE0a300e710e6f52Fb0A4b61aD58";

async function main() {
    let x1 = 63;
    let y1 = 63;
    let x2 = 12;
    let y2 = 54;
    let x3 = 34;
    let y3 = 23;
    let inputArray =[];

    let shape1 = 6;
    let shape2 = 3;
    let shape3 = 9;

    let color1 = '#FF0000'; //red
    let color2 = '#FFFF00'; //yellow
    let color3 = '#0000FF'; //blue
    let input1 = ethers.AbiCoder.defaultAbiCoder().encode(["uint256", "uint256", "uint256", "string"], [x1, y1, shape1, color1]);
    inputArray.push(input1);

    let input2 = ethers.AbiCoder.defaultAbiCoder().encode(["uint256", "uint256", "uint256", "string"], [x2, y2, shape2, color2]);
    inputArray.push(input2);

    let input3 = ethers.AbiCoder.defaultAbiCoder().encode(["uint256", "uint256", "uint256", "string"], [x3, y3, shape3, color3]);
    inputArray.push(input3);
    
    const accounts = await ethers.getSigners();
    const mainAcct = accounts[16];
    const pixelmap = new ethers.Contract(marketPlaceAddr, Pixelmap.abi, mainAcct);
    

    const txn1 = await pixelmap.buyPixel([x1, x2, x3], [y1, y2, y3]);
    console.log(txn1.hash);
    const response = await pixelmap.fillPixel(inputArray);
    console.log(response.hash);
    
}
      
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

// npx hardhat run --network localhost scripts/settingTestColors.js