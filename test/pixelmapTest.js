const { ethers } = require('hardhat'); 
const { expect } = require('chai');
const { time } = require('@nomicfoundation/hardhat-network-helpers');

describe('PixelMap', function () {
  let wETH;
  let weETHadd;
  let contract;
  let contractAddr;
  let owner;
  let buyer;
  let manager;
  let thirdP;

  beforeEach(async () => {
    [owner, buyer, manager, thirdP] = await ethers.getSigners();

    const WETH = await ethers.getContractFactory('WETH');
    wETH = await WETH.deploy();
    weETHadd = await wETH.getAddress();

    const Pixelmap = await ethers.getContractFactory('Pixelmap');
    contract = await Pixelmap.connect(manager).deploy();
    contractAddr = await contract.getAddress();

    // give every test player sufficient currency to start with
    let initialMint = ethers.parseEther('10').toString();
    await wETH.mint(owner, initialMint);
    await wETH.mint(buyer, initialMint);
    await wETH.mint(thirdP, initialMint);
    // set contract currency to test currency
    await contract.connect(manager).updateCurrency(weETHadd);

  });
  
  it('should allow to check pixel', async function () {
    await contract.checkPixel(1,1);
    expect(contract.checkPixel(-1,1)).to.be.reverted;
    expect(contract.checkPixel(1,-1)).to.be.reverted;
    expect(contract.checkPixel(1001,1)).to.be.reverted;
    expect(contract.checkPixel(1,1001)).to.be.reverted;
  });
  it('should allow to set multiple pixel colors and prices', async function () {
    let inputArray = [];

    let x1 = 1;
    let y1 = 1;
    let shape1 = 4;
    let color1 = '#FF0000';
    let input1 = ethers.AbiCoder.defaultAbiCoder().encode(["uint256", "uint256", "uint256", "string"], [x1, y1, shape1, color1]);
    inputArray.push(input1);

    let x2 = 2;
    let y2 = 2;
    let shape2 = 6;
    let color2 = '#FF1000';
    let input2 = ethers.AbiCoder.defaultAbiCoder().encode(["uint256", "uint256", "uint256", "string"], [x2, y2, shape2, color2]);
    inputArray.push(input2);

    let x3 = 3;
    let y3 = 3;
    let shape3 = 8;
    let color3 = '#FF2000';
    let input3 = ethers.AbiCoder.defaultAbiCoder().encode(["uint256", "uint256","uint256", "string"], [x3, y3, shape3, color3]);
    inputArray.push(input3);

    await contract.connect(buyer).buyPixel([x1, x2, x3], [y1, y2, y3]);
    await contract.connect(buyer).fillPixel(inputArray);
    const [owner1, shapeR1, price1, returnedColor1] = await contract.checkPixel(1, 1);
    const [owner2, shapeR2, price2, returnedColor2] = await contract.checkPixel(2, 2);
    const [owner3, shapeR3, price3, returnedColor3] = await contract.checkPixel(3, 3);
    expect(owner1).to.equal(buyer.address);
    expect(owner2).to.equal(buyer.address);
    expect(owner3).to.equal(buyer.address);

    expect(returnedColor1).to.equal(color1);
    expect(returnedColor2).to.equal(color2);
    expect(returnedColor3).to.equal(color3);

    expect(shapeR1).to.equal(shape1);
    expect(shapeR2).to.equal(shape2);
    expect(shapeR3).to.equal(shape3);
  });

  it('should allow to buy 1 pixel', async function () {
    let x = 1;
    let y = 1;
    
    await contract.connect(buyer).buyPixel([x], [y]);
    const [owner1, shape1, price1, returnedColor1] = await contract.checkPixel(x, y);
    expect(owner1).to.equal(buyer.address);
    
    let color = '#FF0000';
    let askPrice = ethers.parseEther('0.05').toString();
    let input = ethers.AbiCoder.defaultAbiCoder().encode(["uint256", "uint256", "uint256", "string"], [x, y, 3, color]);
    await contract.connect(buyer).fillPixel([input]);
    await contract.connect(buyer).setPixelValue([x],[y],[askPrice]);
    const [owner2, shape2, price2, returnedColor2] = await contract.checkPixel(x, y);
    expect(returnedColor2).to.equal(color);
    expect(price2).to.equal(ethers.parseEther('0.05'));

    await wETH.connect(owner).approve(contractAddr, ethers.parseEther('0.05').toString());

    await contract.connect(owner).buyPixel([x], [y]);
    const [owner3, shape3, price3, returnedColor3] = await contract.checkPixel(x, y);
    expect(owner3).to.equal(owner.address);
    let balance1 = await contract.getBalance(buyer.address);
    let balance2 = await contract.getBalance(owner.address);
    expect(balance1).to.be.equal(0);
    expect(balance2).to.be.equal(1);

  });

  it('should pay royalties for 1 pixel', async function () {
    let x = 1;
    let y = 1;
    
    await contract.connect(buyer).buyPixel([x], [y]);
    const [owner1, shape1, price1, returnedColor1] = await contract.checkPixel(x, y);
    expect(owner1).to.equal(buyer.address);
    
    let color = '#FF0000';
    let askPrice = ethers.parseEther('100').toString();
    let input = ethers.AbiCoder.defaultAbiCoder().encode(["uint256", "uint256", "uint256", "string"], [x, y, 3, color]);
    await contract.connect(buyer).fillPixel([input]);
    await contract.connect(buyer).setPixelValue([x],[y],[askPrice]);
    const [owner2, shape2, price2, returnedColor2] = await contract.checkPixel(x, y);
    expect(returnedColor2).to.equal(color);
    expect(price2).to.equal(ethers.parseEther('100'));

    let prevBalance = await wETH.balanceOf(buyer.address);
    await time.increase(60*60*24*360);
    await wETH.connect(buyer).approve(contractAddr, ethers.parseEther('5.5').toString());
    await contract.connect(buyer).payRoyalties([x], [y]);
    let postBalance = await wETH.balanceOf(buyer.address);
    //console.log(ethers.formatEther(postBalance.toString()));
    expect(postBalance).to.be.lessThan(prevBalance);

  });

  it('should pay royalties for multiple pixels', async function () {
    let x = 1;
    let y = 1;
    let x2 = 2;
    let y2 = 2;
    
    await contract.connect(buyer).buyPixel([x, x2], [y, y2]);
    const [[owner1, price1, returnedColor1],[owner2, price2, returnedColor2]] = await contract.checkMultiplePixel([x, x2], [y, y2]);
    expect(owner1).to.equal(buyer.address);
    expect(owner2).to.equal(buyer.address);
    
    let color = '#FF0000';
    let askPrice = ethers.parseEther('50').toString();
    let input = ethers.AbiCoder.defaultAbiCoder().encode(["uint256", "uint256", "uint256", "string"], [x, y, 3, color]);
    await contract.connect(buyer).fillPixel([input]);
    await contract.connect(buyer).setPixelValue([x],[y],[askPrice]);
    const [owner3, shape3, price3, returnedColor3] = await contract.checkPixel(x, y);
    expect(returnedColor3).to.equal(color);
    expect(price3).to.equal(ethers.parseEther('50'));

    let prevBalance = await wETH.balanceOf(buyer.address);
    await time.increase(60*60*24*360);
    await wETH.connect(buyer).approve(contractAddr, ethers.parseEther('7').toString());
    await contract.connect(buyer).payRoyalties([x, x2], [y, y2]);
    let postBalance = await wETH.balanceOf(buyer.address);
    //console.log(ethers.formatEther(postBalance.toString()));
    expect(postBalance).to.be.lessThan(prevBalance);

  });

  it('should update value after royalty payment', async function () {
    let x = 1;
    let y = 1;
    let x2 = 2;
    let y2 = 2;
    
    await contract.connect(buyer).buyPixel([x, x2], [y, y2]);
    const [[owner1, price1, returnedColor1],[owner2, price2, returnedColor2]] = await contract.checkMultiplePixel([x, x2], [y, y2]);
    expect(owner1).to.equal(buyer.address);
    expect(owner2).to.equal(buyer.address);
    
    let askPrice = ethers.parseEther('100').toString();
    let askPrice2 = ethers.parseEther('10000').toString();
    await contract.connect(buyer).setPixelValue([x, x2],[y, y2],[askPrice, askPrice2]);

    let prevBalance = await wETH.balanceOf(manager.address);
    await time.increase(60*60*24*360);
    await wETH.connect(buyer).approve(contractAddr, ethers.parseEther('6').toString());
    await contract.connect(buyer).setPixelValue([x],[y],[askPrice2]);
    let postBalance = await wETH.balanceOf(manager.address);
    //console.log(ethers.formatEther(postBalance.toString()));
    expect(postBalance).to.be.greaterThan(prevBalance);
    expect(contract.connect(buyer).setPixelValue([x2],[y2],[askPrice])).to.be.reverted;
    

  });

  it('should generate SVG', async function () {
    await contract.connect(buyer).buyPixel([0,1,2,3,4,5,6,7,8,9],[0,0,0,0,0,0,0,0,0,0]);
    
    let inputArray = [];
    let color = '#FF0000';

    for (let y = 0; y<10; y++){
      let input = ethers.AbiCoder.defaultAbiCoder().encode(["uint256", "uint256", "uint256", "string"], [y, 0, y, color]);
      inputArray.push(input);
    }
    
    await contract.connect(buyer).fillPixel(inputArray);
    let response = await contract.generateSVG();
    //console.log(response.toString());
    
  });

  it('should allow manager to seek royalty payment', async function () {
    let x = 1;
    let y = 1;
    
    await contract.connect(buyer).buyPixel([x], [y]);
    const [[owner1, price1, returnedColor1]] = await contract.checkMultiplePixel([x], [y]);
    expect(owner1).to.equal(buyer.address);
    const timeStamp1 = (await ethers.provider.getBlock("latest")).timestamp
    
    let askPrice = ethers.parseEther('10000').toString();
    await contract.connect(buyer).setPixelValue([x],[y],[askPrice]);

    let prevBalance = await wETH.balanceOf(manager.address);
    await time.increase(60*60*24*360);
    
    let managerPrice = ethers.parseEther('1').toString();
    await contract.connect(manager).seekRoyaltyPayment(x,y,managerPrice);
    let response1 = await contract.checkPixel(x,y);
    expect(response1.askedToPayRoyalties).to.be.equal(true);

    await time.increase(60*60*24*4);
    await contract.connect(manager).seekRoyaltyPayment(x,y,managerPrice);
    let response2 = await contract.checkPixel(x,y);
    expect(response2.price).to.be.equal(ethers.parseEther('1'));
    
    await wETH.connect(thirdP).approve(contractAddr, ethers.parseEther('1').toString());
    await contract.connect(thirdP).buyPixel([x], [y]);
    let response3 = await contract.checkPixel(x,y);
    expect(response3.owner).to.be.equal(thirdP.address);
    expect(response3.askedToPayRoyalties).to.be.equal(false);
    console.log(prevBalance, ethers.formatEther(BigInt( await wETH.balanceOf(manager.address))));
    


  });

  it('should revert color function calls outside of periods', async function () {
    let inputArray = [];

    let x1 = 1;
    let y1 = 1;
    let shape1 = 4;
    let color1 = '#FF0000';
    let input1 = ethers.AbiCoder.defaultAbiCoder().encode(["uint256", "uint256", "uint256", "string"], [x1, y1, shape1, color1]);
    inputArray.push(input1);

    await contract.connect(buyer).buyPixel([x1], [y1]);
    let balance = await contract.connect(buyer).getBalance(buyer.address);
    expect(balance).to.be.equal(1);
    expect( contract.connect(buyer).castVote(true)).to.be.reverted;
    console.log('vote failed');

    await time.increase(60*60*24*3 +3);
    expect( contract.connect(buyer).fillPixel(inputArray) ).to.be.reverted;
    await contract.connect(buyer).castVote(true);

    let response = await contract.checkVoteOutcome();
    expect(response).to.be.equal(true);

    expect( contract.connect(buyer).castVote(true) ).to.be.reverted;

  });

});