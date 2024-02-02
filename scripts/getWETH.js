const Pixelmap = require('../frontend/src/artifacts/contracts/Pixelmap.sol/Pixelmap.json');

async function main() {
    const wETH_ABI = [{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"guy","type":"address"},{"name":"wad","type":"uint256"}],"name":"approve","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"src","type":"address"},{"name":"dst","type":"address"},{"name":"wad","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"wad","type":"uint256"}],"name":"withdraw","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"balanceOf","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"dst","type":"address"},{"name":"wad","type":"uint256"}],"name":"transfer","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"deposit","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"},{"name":"","type":"address"}],"name":"allowance","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"payable":true,"stateMutability":"payable","type":"fallback"},{"anonymous":false,"inputs":[{"indexed":true,"name":"src","type":"address"},{"indexed":true,"name":"guy","type":"address"},{"indexed":false,"name":"wad","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"src","type":"address"},{"indexed":true,"name":"dst","type":"address"},{"indexed":false,"name":"wad","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"dst","type":"address"},{"indexed":false,"name":"wad","type":"uint256"}],"name":"Deposit","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"src","type":"address"},{"indexed":false,"name":"wad","type":"uint256"}],"name":"Withdrawal","type":"event"}];
    //const wETHAddr = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"; 
    const wETH = await ethers.deployContract("WETH9");
    const wETHaddr = await wETH.getAddress();
    console.log("wETH address:", wETHaddr);
    const wETHAmount = '0.3';

    // Get signer for the impersonated account
    const accounts = await ethers.getSigners();
    const mainAcct = accounts[0];
    //const secAcct = accounts[19];
    const wethContract = new ethers.Contract(wETHaddr, wETH_ABI, mainAcct);
    //const wethContract2 = new ethers.Contract(wETHAddr, wETH_ABI, secAcct);
    const response = await wethContract.deposit({ value: ethers.parseEther(wETHAmount) });
    //const response2 = await wethContract2.deposit({ value: ethers.parseEther(wETHAmount) });
    console.log(response);
    //console.log(response2);

    const pixelmap = new ethers.Contract('0x11075Bdf689B98d941Cb4c1b1C21Bb4F8f3de3f1', Pixelmap.abi, mainAcct);
    const currencyUpdate = await pixelmap.updateCurrency(wETHaddr);
    console.log(currencyUpdate.hash);

}
      
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

// npx hardhat run --network frameTest scripts/getWETH.js