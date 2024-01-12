import { useState, useEffect, useContext } from 'react';
import { useAccount, useContractWrite } from 'wagmi'
import { ethers } from 'ethers';
import { Utils } from 'alchemy-sdk'
import Pixelmap from '../../src/artifacts/contracts/Pixelmap.sol/Pixelmap.json';
import contractAddr from '../hooks/contractAddr';
import PixelContext from './PixelContext';
import { UserBalanceContext } from './UserBalanceContext';
import { createShape } from '../assets/gridShapes';

const wETH_ABI = [{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"guy","type":"address"},{"name":"wad","type":"uint256"}],"name":"approve","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"src","type":"address"},{"name":"dst","type":"address"},{"name":"wad","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"wad","type":"uint256"}],"name":"withdraw","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"balanceOf","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"dst","type":"address"},{"name":"wad","type":"uint256"}],"name":"transfer","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"deposit","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"},{"name":"","type":"address"}],"name":"allowance","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"payable":true,"stateMutability":"payable","type":"fallback"},{"anonymous":false,"inputs":[{"indexed":true,"name":"src","type":"address"},{"indexed":true,"name":"guy","type":"address"},{"indexed":false,"name":"wad","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"src","type":"address"},{"indexed":true,"name":"dst","type":"address"},{"indexed":false,"name":"wad","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"dst","type":"address"},{"indexed":false,"name":"wad","type":"uint256"}],"name":"Deposit","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"src","type":"address"},{"indexed":false,"name":"wad","type":"uint256"}],"name":"Withdrawal","type":"event"}];
//const timeOffset = 1000 * 60 * 60 * 24 * 180 * 4;
const timeOffset = 0;

const PixelPortfolio = ({ filterActive, setFilterActive, setPixelData, toggleSetPixelData, tempPixelData, setTempPixelData }) => {
    const { isConnected, address } = useAccount();
    const { tokenBalance, tokenAllowance, refreshBalanceData } = useContext(UserBalanceContext);
    const [currencyApproval, setCurrencyApproval] = useState(false); // WETH FOR PURCHASE
    const [royaltyPaymentApproval, setRoyaltyPaymentApproval] = useState(false); // WETH FOR ROYALTY PAYMENT
    const { pixels, setUpdatedPixels } = useContext(PixelContext);
    const [includeInUpdate, setIncludeinUpdate] = useState([]);
    const [selectedShape, setSelectedShape] = useState([]);
    const [selectedColor, setSelectedColor] = useState([]);
    const [colorInput, setColorInput] = useState([]);
    const userPixelsWithIndex = pixels.map((pixel, index) => ({ pixel, index })).filter(item => item.pixel.owner === address);
    const userPixels = userPixelsWithIndex.map(item => item.pixel);
    const userPixelIndices = userPixelsWithIndex.map(item => item.index);
    const [ updatePixelPrice, setUpdatePixelPrice ] = useState(false);
    const [ payRoyaltyFlag, setPayRoyaltyFlag ] = useState(false);
    const [ updatedPrices, setUpdatedPrices] = useState([]);
    const [ totalPendingRoyalties, setTotalPendingRoyalties] = useState(0);
    
    const shapes = [0,1,2,3,4,5,6,7,8,9];
    
    const renderShape = (shapeID, color) => {
        const size = 12;
        const x = 0;
        const y = 0;

        return (
            <svg width={size} height={size} className="shape-preview">
                {createShape(null, shapeID, size, size, x, y, color)}
            </svg>
        );
    };

    const formatDate = (timestamp) => {
        const date = new Date(timestamp * 1000);
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const day = ("0" + date.getDate()).slice(-2);
        const month = months[date.getMonth()];
        const year = date.getFullYear().toString().slice(-2);
        
        if(day == '01' && month == 'Jan' && year == '70'){
            return 'N/A'
        }else{
            return `${day} ${month} '${year}`;
        }
    }

    const outstandingRoyalties = (pixel) => {
        const lastPaymentDate = new Date(Number(pixel.royaltyLastPaid)*1000);
        const currentDate = new Date(Date.now()+timeOffset);
        const yearDifference = (currentDate - lastPaymentDate)/(1000*60*60*24*360);
        const accruedRoyalty = Math.round(yearDifference * Number(pixel.price) * 0.05);
        //return Math.round(Utils.formatEther(BigInt(accruedRoyalty))*1000)/1000
        return accruedRoyalty
    }

    useEffect(() => {
        let totalPendingRoyaltiesCalc = 0;
        for (let i = 0; i<userPixels.length;i++){
            if(includeInUpdate[i]){
                totalPendingRoyaltiesCalc = totalPendingRoyaltiesCalc + outstandingRoyalties(userPixels[i]);
            }
        }
        setTotalPendingRoyalties(totalPendingRoyaltiesCalc);
        
    },[includeInUpdate]);

    useEffect(() => {
            if(selectedColor.length == 0 && userPixels.length >0){
                setSelectedColor(Array(userPixels.length).fill('#FFFFFF'));
            }
            if(selectedShape.length == 0 && userPixels.length >0){
                setSelectedShape(Array(userPixels.length).fill(0));
            }
            if(colorInput.length == 0 && userPixels.length >0){
                setColorInput(Array(userPixels.length).fill('#FFFFFF'));
            }
            if(includeInUpdate.length == 0 && userPixels.length >0){
                setIncludeinUpdate(Array(userPixels.length).fill(false));
            }
            if(updatedPrices.length == 0 && userPixels.length >0){
                setUpdatedPrices(Array(userPixels.length).fill(0));
            }
        
    }, [userPixels]);

    const handleLeftArrowShape = (index) => {
        let newShape = selectedShape[index] > 0 ? selectedShape[index] - 1 : 9;
        let updatedShapes = [...selectedShape];
        updatedShapes[index] = newShape;
        setSelectedShape(updatedShapes);

        let updatedTempPixelData = [... tempPixelData];
        updatedTempPixelData[userPixelIndices[index]].shapeID = newShape;
        setTempPixelData(updatedTempPixelData);
    };
    
    const handleRightArrowShape = (index) => {
        let newShape = selectedShape[index] < 9 ? selectedShape[index] + 1 : 0;
        let updatedShapes = [...selectedShape];
        updatedShapes[index] = newShape;
        setSelectedShape(updatedShapes);
        
        let updatedTempPixelData = [... tempPixelData];
        updatedTempPixelData[userPixelIndices[index]].shapeID = newShape;
        setTempPixelData(updatedTempPixelData);
    
    };

    const regex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    const handleColorInput = (e, index) => {
        const newInput = e.target.value;
        const updatedColorInputs = [...colorInput];
        updatedColorInputs[index] = newInput;
        setColorInput(updatedColorInputs);
        if (regex.test(newInput)) {
            const updatedColors = [...selectedColor];
            updatedColors[index] = newInput;
            setSelectedColor(updatedColors);
            
            let updatedTempPixelData = [... tempPixelData];
            updatedTempPixelData[userPixelIndices[index]].color = newInput;
            setTempPixelData(updatedTempPixelData);
        }
    };

    const handlePriceChange = (e, index) => {
        const newValue = e.target.value;
        if (newValue === '' || (/^\d*\.?\d{0,4}$/.test(newValue) && Number(newValue) >= 0)) {
            const updatedPricesNew = [...updatedPrices];
            updatedPricesNew[index] = newValue;
            setUpdatedPrices(updatedPricesNew);
        }
      };

    const handlePixelModification = () => {
        const deepCopyPixels = pixels.map(pixel => ({ ...pixel }));
        setTempPixelData(deepCopyPixels);
        toggleSetPixelData(!setPixelData);
        setSelectedColor(Array(userPixels.length).fill('#FFFFFF'));
        setSelectedShape(Array(userPixels.length).fill(0));
        setColorInput(Array(userPixels.length).fill('#FFFFFF'));
        setIncludeinUpdate(Array(userPixels.length).fill(false));
    }

    const handleUpdatePixelPrice = () => {
        setUpdatePixelPrice(updatePixelPrice => !updatePixelPrice);
        setUpdatedPrices(Array(userPixels.length).fill(0));
        setIncludeinUpdate(Array(userPixels.length).fill(false));
    }

    const handlePayRoyalties = () => {
        setPayRoyaltyFlag(payRoyaltyFlag => !payRoyaltyFlag);
        setIncludeinUpdate(Array(userPixels.length).fill(false));
    }
    
    const handleIncludeInUpdate = (index) => {
        const currentFlag = includeInUpdate[index]
        const updateIncludeFlags = [...includeInUpdate];
        updateIncludeFlags[index] = !currentFlag;
        setIncludeinUpdate(updateIncludeFlags);
    }
    

    /// SET PIXEL COLOR AND SHAPE TO BLOCKCHAIN
    const { isLoading:fillPixelLoad, write: fillPixel } = useContractWrite({
        address: contractAddr,
        abi: Pixelmap.abi,
        functionName: 'fillPixel',
        onSuccess(){
            const changedPixels = userPixels.filter((pixels, index) => includeInUpdate[index]);
            setUpdatedPixels(changedPixels.map(pixel => ({ x: pixel.x, y: pixel.y })));
            handlePixelModification();
        }
    });
    async function handlePixelFill() {
        let inputArray = [];
        for (let i = 0; i < userPixels.length; i++){
            if(includeInUpdate[i]){
                inputArray.push(
                    ethers.AbiCoder.defaultAbiCoder().encode(
                    ["uint256", "uint256","uint256", "string"], [userPixels[i].x, userPixels[i].y, selectedShape[i], selectedColor[i]]));
            }
        }
        await fillPixel({ args: [inputArray] });
    }


    /// SET PIXEL VALUES TO BLOCKCHAIN
    const { isLoading:approvalLoad, write: approveWETH } = useContractWrite({
        address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
        abi: wETH_ABI,
        functionName: 'approve',
        onSuccess(){
            setCurrencyApproval(true);
        }
      });
    const { isLoading:setPricesLoad, write: setPrices } = useContractWrite({
        address: contractAddr,
        abi: Pixelmap.abi,
        functionName: 'setPixelValue',
        onSuccess(){
            const changedPixels = userPixels.filter((pixels, index) => includeInUpdate[index]);
            setUpdatedPixels(changedPixels.map(pixel => ({ x: pixel.x, y: pixel.y })));
            handleUpdatePixelPrice();
            refreshBalanceData();
        }
    });
    async function handleSetPrices() {
        setCurrencyApproval(false);
        if(!currencyApproval){
            if(Utils.formatEther(tokenAllowance.toString()) > totalPendingRoyalties) {
                setCurrencyApproval(true);
            }else{
                await approveWETH({args:[ contractAddr , totalPendingRoyalties ]});
            }
        }else{
            let xValues = [];
            let yValues = [];
            let newPrices = [];
            for (let i = 0; i < userPixels.length; i++){
                if(includeInUpdate[i]){
                    xValues.push(userPixels[i].x);
                    yValues.push(userPixels[i].y);
                    newPrices.push(BigInt(Utils.parseEther(updatedPrices[i].toString())));
                }
            }
            await setPrices({ args: [xValues, yValues, newPrices] });
        }
    }
    useEffect(() => {
        if (currencyApproval) {
            handleSetPrices();
        }
    }, [currencyApproval]);
   
    /// PAY ROYALTIES
    const { isLoading:royaltyApprovalLoad, write: royaltyApproveWETH } = useContractWrite({
        address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
        abi: wETH_ABI,
        functionName: 'approve',
        onSuccess(){
            setRoyaltyPaymentApproval(true);
        }
      });
    const { isLoading:payRoyaltyLoad, write: payRoyalty } = useContractWrite({
        address: contractAddr,
        abi: Pixelmap.abi,
        functionName: 'payRoyalties',
        onSuccess(){
            const changedPixels = userPixels.filter((pixels, index) => includeInUpdate[index]);
            setUpdatedPixels(changedPixels.map(pixel => ({ x: pixel.x, y: pixel.y })));
            handlePayRoyalties();
            refreshBalanceData();
        }
    });
    async function handleRoyaltyPayment() {
        setRoyaltyPaymentApproval(false);
        if(!royaltyPaymentApproval){
            if(Utils.formatEther(tokenAllowance.toString()) > totalPendingRoyalties) {
                setRoyaltyPaymentApproval(true);
            }else{
                await royaltyApproveWETH({args:[ contractAddr , Utils.parseEther(totalPendingRoyalties.toString()) ]});
            }
        }else{
            let xValues = [];
            let yValues = [];
            for (let i = 0; i < userPixels.length; i++){
                if(includeInUpdate[i]){
                    xValues.push(userPixels[i].x);
                    yValues.push(userPixels[i].y);
                }
            }
            await payRoyalty({ args: [xValues, yValues] });
        }
    }
    useEffect(() => {
        if (royaltyPaymentApproval) {
            handleRoyaltyPayment();
        }
    }, [royaltyPaymentApproval]);
    



    
    if (!isConnected) return null;
    if (userPixels.length ==0) return (
        <div className='flex flex-col w-[80%] p-2 text-white font-connection border-2 border-darkgrey bg-offblack'>
            <div className='flex justify-between items-center p-2 border-b-2 border-darkgrey'>
                <div className='text-sm'>You don't own any pixels yet. Purchase some pixels by selecting your favorite ones from the grid.</div>
            </div>
            
        </div>
    )
    return (
        <div className='flex flex-col w-[100%] p-2 text-white font-connection border-2 border-darkgrey bg-offblack'>
            <div className='flex flex-row justify-end items-center pb-2 border-darkgrey'>
                <button className={`border-2 py-1 px-2 text-xs ${!filterActive ? ' text-black bg-lightgrey border-darkgrey' : 'bg-black text-lightgrey border-darkgrey'}`} onClick={() => setFilterActive(!filterActive)}>
                    {!filterActive ? 'Filter' : 'Remove Filter'}
                </button>
            </div> 
            {setPixelData && (
                <div>
                    <div className='flex flex-row justify-between items-center p-2 border-b-2 border-darkgrey'>
                        <div className='text-md'>Selected Pixels:</div>
                        <div className='text-md'>{includeInUpdate.reduce((count, value) => {return value ? count + 1 : count;}, 0)} / {userPixels.length}</div>
                    </div>
                <div className='hide-scrollbar max-h-[500px] overflow-y-auto'>
                {userPixels.sort((a, b) => a.y - b.y || a.x - b.x).map((pixel, index) => (
                    <div key={index} className='flex justify-between items-center p-2 mb-2 border-b-2 border-darkgrey'>
                        <div className='flex flex-1 justify-start items-center gap-1'>
                            <button className='w-[24px]' onClick={() => handleIncludeInUpdate(index)}>
                            {includeInUpdate[index] ? 
                                <svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"> <path d="M5 3H3v18h18V3H5zm0 2h14v14H5V5zm4 7H7v2h2v2h2v-2h2v-2h2v-2h2V8h-2v2h-2v2h-2v2H9v-2z" fill='#EBEBEB'/> </svg>    
                            :
                                <svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"> <path d="M3 3h18v18H3V3zm16 16V5H5v14h14z" fill='#EBEBEB'/> </svg>
                            }
                            </button>
                            <div className='text-md'>{pixel.x} x {pixel.y}</div>
                        </div>
                        <div className='flex flex-1 justify-center items-center gap-3'>
                            <button className='w-[24px]' onClick={() => handleLeftArrowShape(index)}>
                                <svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"> <path d="M16 5v2h-2V5h2zm-4 4V7h2v2h-2zm-2 2V9h2v2h-2zm0 2H8v-2h2v2zm2 2v-2h-2v2h2zm0 0h2v2h-2v-2zm4 4v-2h-2v2h2z" fill='#EBEBEB'/> </svg>
                            </button>
                            {renderShape(shapes[selectedShape[index]], selectedColor[index])}
                            <button className='w-[24px]' onClick={() => handleRightArrowShape(index)}>
                                <svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"> <path d="M8 5v2h2V5H8zm4 4V7h-2v2h2zm2 2V9h-2v2h2zm0 2h2v-2h-2v2zm-2 2v-2h2v2h-2zm0 0h-2v2h2v-2zm-4 4v-2h2v2H8z" fill='#EBEBEB'/> </svg>
                            </button>
                        </div>
                        <div className='flex flex-1 items-center gap-1'>
                        {regex.test(colorInput[index]) ? 
                            <svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"> <path d="M9 2h2v2H9V2zm4 4V4h-2v2H9v2H7v2H5v2H3v2h2v2h2v2h2v2h2v2h2v-2h2v-2h2v-2h2v6h2V12h-2v-2h-2V8h-2V6h-2zm0 0v2h2v2h2v2h2v2H5v-2h2v-2h2V8h2V6h2z" fill='#EBEBEB'/> </svg>
                            : 
                            <svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"> <path d="M3 3h16v2H5v14h14v2H3V3zm18 0h-2v18h2V3zM11 15h2v2h-2v-2zm2-8h-2v6h2V7z" fill='#EBEBEB'/> </svg> 
                        }
                            <input type="text" value={colorInput[index]} onChange={(e) =>handleColorInput(e, index)} placeholder={selectedColor[index]} className='bg-offblack text-lightgrey text-right border-b-2 max-w-[100px]' />
                        </div>
                    </div>
                ))}
                </div>
                <div className='flex flex-col justify-between pt-2 border-t-2 border-darkgrey'>
                    <div className='flex flex-row justify-between items-center'>
                        <button className='text-xs bg-black text-lightgrey border-darkgrey border-2 py-1 px-2 w-full' onClick={() => handlePixelModification()}>Cancel Update</button>
                        <button className='text-xs text-black bg-lightgrey border-2 border-darkgrey py-1 px-2 w-full' 
                            disabled={ fillPixelLoad }
                            onClick={() => handlePixelFill()}
                        >
                            {fillPixelLoad ? 'Processing...' : 'Confirm Update' }
                        </button>
                    </div>
                </div>
                </div>
            )}

            {updatePixelPrice && (
                <div>
                    <div className='flex flex-row justify-between items-center p-2 border-b-2 border-darkgrey'>
                        <div className='text-md'>Selected Pixels:</div>
                        <div className='text-md'>{includeInUpdate.reduce((count, value) => {return value ? count + 1 : count;}, 0)} / {userPixels.length}</div>
                    </div>
                <div className='hide-scrollbar max-h-[500px] overflow-y-auto'>
                {userPixels.sort((a, b) => a.y - b.y || a.x - b.x).map((pixel, index) => (
                    <div key={index} className='flex justify-between items-center p-2 mb-2 border-b-2 border-darkgrey'>
                        <div className='flex flex-1 justify-start items-center gap-1'>
                            <button className='w-[24px]' onClick={() => handleIncludeInUpdate(index)}>
                            {includeInUpdate[index] ? 
                                <svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"> <path d="M5 3H3v18h18V3H5zm0 2h14v14H5V5zm4 7H7v2h2v2h2v-2h2v-2h2v-2h2V8h-2v2h-2v2h-2v2H9v-2z" fill='#EBEBEB'/> </svg>    
                            :
                                <svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"> <path d="M3 3h18v18H3V3zm16 16V5H5v14h14z" fill='#EBEBEB'/> </svg>
                            }
                            </button>
                            <div className='text-md'>{pixel.x} x {pixel.y}</div>
                        </div>
                        <div className='flex flex-1 items-center gap-1'>
                            <input type="text" value={updatedPrices[index]} onChange={(e) =>handlePriceChange(e, index)} step="0.01" className='bg-offblack text-lightgrey text-center border-b-2 max-w-[50px]'/>
                            ETH
                        </div>
                        <div className='flex flex-1 flex-col justify-end items-end gap-1'>
                            <div className='text-xs'>5% royalty:</div>
                            <div className='text-xs'>{(Math.ceil(updatedPrices[index]*5)/100).toString()} ETH/year</div> 
                        </div>
                    </div>
                ))}
                </div>
                <div className='flex flex-col justify-between pt-2 border-t-2 border-darkgrey text-xs'>
                    <div className='flex flex-row justify-between items-center'>
                        <button className='text-xs bg-black text-lightgrey border-darkgrey border-2 py-1 px-2 w-full' onClick={() => handleUpdatePixelPrice()}>Cancel Update</button>
                        <button className='text-xs text-black bg-lightgrey border-2 border-darkgrey py-1 px-2 w-full' 
                            disabled={approvalLoad || setPricesLoad}
                            onClick={() => handleSetPrices()}
                        >
                            {approvalLoad || setPricesLoad ? 'Processing...' : 'Confirm Values' }
                        </button>
                    </div>
                    <div className='text-xs pt-2 text-lightgrey'>
                        by confirming new pixel values, you will automatically settle any outstanding royalties on your previous pixel values for a total of {(Math.round(totalPendingRoyalties*100)/100)} wETH. Going forward, new royalties will be paid based on your newly updated values.
                    </div>
                </div>
                </div>
            )}

            {payRoyaltyFlag && (
                <div>
                    <div className='flex flex-row justify-between items-center p-2 border-b-2 border-darkgrey'>
                        <div className='text-md'>Selected Pixels:</div>
                        <div className='text-md'>{includeInUpdate.reduce((count, value) => {return value ? count + 1 : count;}, 0)} / {userPixels.length}</div>
                    </div>
                <div className='hide-scrollbar max-h-[500px] overflow-y-auto'>
                {userPixels.sort((a, b) => a.y - b.y || a.x - b.x).map((pixel, index) => (
                    <div key={index} className='flex flex-row justify-between items-center p-2 mb-2 border-b-2 border-darkgrey'>
                        <div className='flex flex-row justify-start items-center gap-1'>
                            <button className='w-[24px]' onClick={() => handleIncludeInUpdate(index)}>
                            {includeInUpdate[index] ? 
                                <svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"> <path d="M5 3H3v18h18V3H5zm0 2h14v14H5V5zm4 7H7v2h2v2h2v-2h2v-2h2v-2h2V8h-2v2h-2v2h-2v2H9v-2z" fill='#EBEBEB'/> </svg>    
                            :
                                <svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"> <path d="M3 3h18v18H3V3zm16 16V5H5v14h14z" fill='#EBEBEB'/> </svg>
                            }
                            </button>
                            <div className='text-md'>{pixel.x} x {pixel.y}</div>
                        </div>
                        <div className='flex flex-row ml-auto text-end items-end'>
                            <div className='text-md'>pending royalties: {Math.round(Utils.formatEther(BigInt(outstandingRoyalties(userPixels[index])))*1000)/1000} ETH</div>
                        </div>
                    </div>
                ))}
                </div>
                <div className='flex flex-col justify-between pt-2 border-t-2 border-darkgrey text-xs'>
                    <div className='flex flex-row justify-between items-center'>
                        <button className='text-xs bg-black text-lightgrey border-darkgrey border-2 py-1 px-2 w-full' onClick={() => handlePayRoyalties()}>Cancel Payment</button>
                        <button className={`text-xs py-1 px-2 w-full border-2
                                    ${Number(tokenBalance) > Utils.formatEther(totalPendingRoyalties.toString()) ? 'text-black bg-lightgrey border-darkgrey':'text-lightgrey bg-black border-darkgrey'}
                                    ${Number(tokenBalance) < Utils.formatEther(totalPendingRoyalties.toString()) && 'cursor-not-allowed'}`}
                            disabled={royaltyApprovalLoad || payRoyaltyLoad || Number(tokenBalance) < totalPendingRoyalties}
                            onClick={() => handleRoyaltyPayment()}
                        >
                            {royaltyApprovalLoad || payRoyaltyLoad ? 'Processing...' :
                            Number(tokenBalance) < Utils.formatEther(totalPendingRoyalties.toString()) ? 'Not enought wETH' : `Pay Royalties (${(Math.round(Utils.formatEther(totalPendingRoyalties.toString())*100)/100)} ETH)` }    
                        </button>
                    </div>
                    
                </div>
                </div>
            )}

            {!setPixelData && !updatePixelPrice && !payRoyaltyFlag &&(
                <div>
                    <div className='flex flex-row justify-between items-center p-2 border-b-2 border-darkgrey'>
                        <div className='text-md'>Pixels You Own:</div>
                        <div className='text-md'>{userPixels.length} / 4096</div>
                    </div>
                    <div className='hide-scrollbar max-h-[500px] overflow-y-auto'>
                    {userPixels.sort((a, b) => a.y - b.y || a.x - b.x).map((pixel, index) => (
                        <div key={index} className='flex justify-between items-center mb-2 p-2 border-b-2 border-darkgrey'>
                            <div className='flex flex-row align-middle items-center'>
                                <div className='flex flex-col mr-2 w-16'>
                                    <div className='text-sm'>{pixel.x} x {pixel.y}</div>
                                </div>
                                {renderShape(Number(pixel.shapeID), pixel.color)}
                            </div>
                            <div className='flex flex-row gap-5 align-middle items-center'>
                                <div className='text-sm'> {Math.round(Utils.formatEther(pixel.price)*100)/100} ETH</div>
                            </div>
                            <div className='flex flex-col text-end items-end w-32'>
                                <div className='text-xs'>pending royalties: {Math.round(Utils.formatEther(BigInt(outstandingRoyalties(pixel)))*1000)/1000} ETH</div>
                            </div>
                        </div>
                    ))}
                    </div>
                    <div className='flex flex-col justify-between pt-2 border-t-2 border-darkgrey'>
                        <button className='text-xs text-black bg-lightgrey border-2 border-darkgrey py-1 px-2' onClick={() => handlePixelModification()}>Set Pixel Shape & Color</button>
                        <div className='flex flex-row justify-between items-center'>
                            <button className='text-xs text-black bg-lightgrey border-2 border-darkgrey py-1 px-2 w-full' onClick={() => handlePayRoyalties()}>Pay Royalties</button>
                            <button className='text-xs text-black bg-lightgrey border-2 border-darkgrey py-1 px-2 w-full' onClick={() => handleUpdatePixelPrice()}>Set Pixel Values</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PixelPortfolio;
