import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useContext } from 'react';
import SpinningLoader from  '../assets/spinningLoader'
import { useAccount, useContractWrite } from 'wagmi'
import { ethers } from 'ethers';
import { Utils } from 'alchemy-sdk'
import Pixelmap from '../../src/artifacts/contracts/Pixelmap.sol/Pixelmap.json';
import contractAddr from '../hooks/contractAddr';
import PixelContext from './PixelContext';
import PeriodContext from './PeriodContext';
import { UserBalanceContext } from './UserBalanceContext';
import { createShape } from '../assets/gridShapes';
import MobileColorPicker from './MobileColorPicker';
import currencyAddr from '../hooks/currencyAddr';

const wETH_ABI = [{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"guy","type":"address"},{"name":"wad","type":"uint256"}],"name":"approve","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"src","type":"address"},{"name":"dst","type":"address"},{"name":"wad","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"wad","type":"uint256"}],"name":"withdraw","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"balanceOf","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"dst","type":"address"},{"name":"wad","type":"uint256"}],"name":"transfer","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"deposit","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"},{"name":"","type":"address"}],"name":"allowance","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"payable":true,"stateMutability":"payable","type":"fallback"},{"anonymous":false,"inputs":[{"indexed":true,"name":"src","type":"address"},{"indexed":true,"name":"guy","type":"address"},{"indexed":false,"name":"wad","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"src","type":"address"},{"indexed":true,"name":"dst","type":"address"},{"indexed":false,"name":"wad","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"dst","type":"address"},{"indexed":false,"name":"wad","type":"uint256"}],"name":"Deposit","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"src","type":"address"},{"indexed":false,"name":"wad","type":"uint256"}],"name":"Withdrawal","type":"event"}];
const truncateAddress = (address) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

const MobileArtGrid = ({grid, dimm}) => {
    const { address, isConnected } = useAccount();
    const squareSize = 7; // Size of each square
    const gap = 1; // Gap between squares

    return (
        <svg width='100%' className="canvas-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 520">
                {grid.map((pixel, i) => {
                    const x = (i % 64) * (squareSize + gap)+4; 
                    const y = Math.floor(i / 64) * (squareSize + gap)+4;
                    const isOwnedByUser = pixel.owner === address;
                    const isDimmed = dimm && isConnected && !isOwnedByUser;
                    
                return createShape(i, Number(pixel.shapeID), squareSize, squareSize, x, y, pixel.color, pixel, null, null, null, null, isDimmed);
            })}
        </svg>
    )

}

const MobileInfoCard = ({ pixelInfo }) => {
    const formatDate = (timestamp) => {
        const date = new Date(Number(timestamp) * 1000);
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

    const renderShape = (shapeID, color) => {
        // Set the size of the shape to be rendered in the hover card
        const size = 20; 
        const x = 0;
        const y = 0;

        return (
            <svg width={size} height={size} className="shape-preview">
                {createShape(null, shapeID, size, size, x, y, color)}
            </svg>
        );
    };
    
    return (    
        <div className='w-[80%] justify-between my-4 px-4 bg-black border-2 border-darkgrey font-connection'>
                <div className='flex flex-col justify-between h-full'>
                    <div className='flex flex-row py-2 border-b-2 border-darkgrey'>
                        <div className='flex justify-end flex-col w-1/2'>
                            <p className='text-lg text-white'>{pixelInfo? pixelInfo.x : 0} <span className='text-darkgrey text-lg'>x</span> {pixelInfo? pixelInfo.y : 0}</p>
                        </div>
                        <div className='flex flex-col w-1/2 justify-center items-end'>
                            {renderShape(pixelInfo? Number(pixelInfo.shapeID) : 0, pixelInfo? pixelInfo.color : "#FFFFFF")}
                        </div>
                    </div>
                    <div className='flex flex-row py-1 items-center'>
                        <p className="text-sm text-white"><span className='text-darkgrey text-sm'>owned by</span> {pixelInfo?truncateAddress(pixelInfo.owner) : ''}</p>
                    </div>
                    <div className='flex flex-row justify-between py-1 items-center'>
                        <p className='text-sm text-white'><span className='text-darkgrey text-sm'>price:</span> {pixelInfo? Math.round(Utils.formatEther(pixelInfo.price)*100)/100 : 0}</p>
                        <p className='text-sm text-white'><span className='text-darkgrey text-sm'>royalties last paid:</span> {pixelInfo? formatDate(pixelInfo.royaltyLastPaid) : 'NA'}</p>
                    </div>
                </div>
        </div>
    );
};

const MobilePortfolio = ({isOpen, onClose }) => {
    const { isConnected, address } = useAccount();
    const { currentPeriodisArt, cycleEndTime } = useContext(PeriodContext);
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
    const [ colorPickerIndex, setColorPickerIndex ] = useState('');
    const [selectedPixelIndex,setSelectedPixelIndex] = useState(0);
    const [currentPixel, setCurrentPixel] = useState();
    const [setPixelData, toggleSetPixelData] = useState(false);
    const [tempPixelData, setTempPixelData] = useState([]);
    const [pixelColorIndex, setPixelColorIndex] = useState(0);

    const handlePixelSelectionLeft = () => {
        const currentIndex = selectedPixelIndex;
        if(currentIndex == 0){
            setSelectedPixelIndex(userPixels.length -1)
            
        }else{
            setSelectedPixelIndex(currentIndex -1)
        }
    }
    const handlePixelSelectionRight = () => {
        const currentIndex = selectedPixelIndex;
        if(currentIndex == userPixels.length-1){
            setSelectedPixelIndex(0)
        }else{
            setSelectedPixelIndex(currentIndex +1)
        }
    }
    const handlePixelSelectionLeft_Color = () => {
        const currentIndex = pixelColorIndex;
        if(currentIndex == 0){
            setPixelColorIndex(userPixels.length -1)
            
        }else{
            setPixelColorIndex(currentIndex -1)
        }
    }
    const handlePixelSelectionRight_Color = () => {
        const currentIndex = pixelColorIndex;
        if(currentIndex == userPixels.length-1){
            setPixelColorIndex(0)
        }else{
            setPixelColorIndex(currentIndex +1)
        }
    }

    useEffect(() => {
        if(!currentPixel){
            const foundPixel = userPixels[0];
            if(foundPixel){
                setCurrentPixel(foundPixel);
            }
        }
    },[userPixels]);
    useEffect(() => {
        const foundPixel = userPixels[selectedPixelIndex];
        setCurrentPixel(foundPixel);
    },[selectedPixelIndex]);


    const shapes = [0,1,2,3,4,5,6,7,8,9];
    
    const renderShape = (shapeID, color) => {
        const size = 20;
        const x = 0;
        const y = 0;

        return (
            <svg width={size} height={size} viewBox="0 0 20 20">
                {createShape(null, shapeID, size, size, x, y, color)}
            </svg>
        );
    };

    const onColorSelect = (newInput) => {
        const updatedColors = [...selectedColor];
        updatedColors[pixelColorIndex] = newInput;
        setSelectedColor(updatedColors);
            
        let updatedTempPixelData = [... tempPixelData];
        updatedTempPixelData[userPixelIndices[pixelColorIndex]].color = newInput;
        setTempPixelData(updatedTempPixelData);
      };

    const outstandingRoyalties = (pixel) => {
        const lastPaymentDate = new Date(Number(pixel.royaltyLastPaid)*1000);
        const currentDate = new Date(Date.now());
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
        address: currencyAddr,
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
        address: currencyAddr,
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
    


    if (userPixels.length ==0) return (
        <div className='flex flex-col mx-4 mt-4 mb-10 font-connection text-white'>
            <div className='flex flex-row justify-between items-center mx-2 gap-2'>
                Your Pixel Portfolio
                <button onClick={onClose} className="text-white text-2xl border-2">
                    <svg width='24px' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"> <path d="M5 5h2v2H5V5zm4 4H7V7h2v2zm2 2H9V9h2v2zm2 0h-2v2H9v2H7v2H5v2h2v-2h2v-2h2v-2h2v2h2v2h2v2h2v-2h-2v-2h-2v-2h-2v-2zm2-2v2h-2V9h2zm2-2v2h-2V7h2zm0 0V5h2v2h-2z" fill="currentColor"/> </svg>
                </button>
            </div>
            <div className='flex flex-col items-center justify-center h-full mt-20'>
                You don't own any pixels yet. Purchase some pixels by selecting your favorite ones from the grid.
            </div>
        </div>
    )
    return (
        <div className='flex flex-col mx-4 mt-4 mb-10 font-connection text-white'>
            {!setPixelData &&(
            <>
            <div className='flex flex-row justify-between items-center mx-2 gap-2'>
                Your Pixel Portfolio
                <button onClick={onClose} className="text-white text-2xl border-2">
                    <svg width='24px' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"> <path d="M5 5h2v2H5V5zm4 4H7V7h2v2zm2 2H9V9h2v2zm2 0h-2v2H9v2H7v2H5v2h2v-2h2v-2h2v-2h2v2h2v2h2v2h2v-2h-2v-2h-2v-2h-2v-2zm2-2v2h-2V9h2zm2-2v2h-2V7h2zm0 0V5h2v2h-2z" fill="currentColor"/> </svg>
                </button>
            </div>
                <div className='flex items-center justify-center mt-4'>
                    <MobileArtGrid grid={pixels} dimm={true} />
                </div>
                <div className='flex flex-row justify-between'>
                    <button className='w-[24px]' onClick={() => handlePixelSelectionLeft()}>
                        <svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"> <path d="M16 5v2h-2V5h2zm-4 4V7h2v2h-2zm-2 2V9h2v2h-2zm0 2H8v-2h2v2zm2 2v-2h-2v2h2zm0 0h2v2h-2v-2zm4 4v-2h-2v2h2z" fill='#EBEBEB'/> </svg>
                    </button>
                    <MobileInfoCard pixelInfo={currentPixel} />
                    <button className='w-[24px]' onClick={() => handlePixelSelectionRight()}>
                        <svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"> <path d="M8 5v2h2V5H8zm4 4V7h-2v2h2zm2 2V9h-2v2h2zm0 2h2v-2h-2v2zm-2 2v-2h2v2h-2zm0 0h-2v2h2v-2zm-4 4v-2h2v2H8z" fill='#EBEBEB'/> </svg>
                    </button>    
                </div>
                <div className='flex flex-col justify-between pt-2 border-t-2 border-darkgrey'>
                        {currentPeriodisArt ? 
                        <button className='flex items-center justify-between w-full text-xs text-black bg-lightgrey border-2 border-darkgrey hover:bg-black hover:text-white hover:border-lightgrey py-2 px-2'
                            disabled={!currentPeriodisArt}
                            onClick={() => handlePixelModification()}
                        >
                            <span>Set Pixel Shape & Color</span>
                            <svg className="ml-auto h-[16px] w-[16px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                <path d="M18 2h-2v2h-2v2h-2v2h-2v2H8v2H6v2H4v2H2v6h6v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2V8h2V6h-2V4h-2V2zm0 8h-2v2h-2v2h-2v2h-2v2H8v-2H6v-2h2v-2h2v-2h2V8h2V6h2v2h2v2zM6 16H4v4h4v-2H6v-2z" fill="currentColor"/>
                            </svg>
                        </button>
                        :
                        <div className='flex items-center justify-between w-full text-xs text-black bg-lightgrey border-2 border-darkgrey py-1 px-2'>
                            Artistic Period currently closed
                        </div>
                        }
                        
                        <div className='flex flex-row justify-between items-center mb-10'>
                            <button className='flex items-center justify-between w-full text-xs text-black bg-lightgrey border-2 border-darkgrey  hover:bg-black hover:text-white hover:border-lightgrey py-2 px-2' onClick={() => handlePayRoyalties()}
                            >
                                <span>Pay Royalties</span>
                                <svg className="ml-auto h-[16px] w-[16px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                    <path d="M4 9V7h12V5h2v2h2v2h-2v2h-2V9H4zm12 2h-2v2h2v-2zm0-6h-2V3h2v2zm4 12v-2H8v-2h2v-2H8v2H6v2H4v2h2v2h2v2h2v-2H8v-2h12z" fill="currentColor"/>
                                </svg>
                            </button>
                            <button className='flex items-center justify-between w-full text-xs text-black bg-lightgrey border-2 border-darkgrey hover:bg-black hover:text-white hover:border-lightgrey py-2 px-2' onClick={() => handleUpdatePixelPrice()}
                            >
                                <span>Set Pixel Values</span>
                                <svg className="ml-auto h-[16px] w-[16px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                    <path d="M6 2h12v2H6V2zM4 6V4h2v2H4zm0 12V6H2v12h2zm2 2v-2H4v2h2zm12 0v2H6v-2h12zm2-2v2h-2v-2h2zm0-12h2v12h-2V6zm0 0V4h-2v2h2zm-9-1h2v2h3v2h-6v2h6v6h-3v2h-2v-2H8v-2h6v-2H8V7h3V5z" fill="currentColor"/>
                                </svg>
                            </button>
                        </div>
                </div>
                <>
                    <AnimatePresence>
                    {updatePixelPrice && (
                    <motion.div
                        initial={{ x: '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '-100%' }}
                        transition={{ type: 'spring', duration: 0.3 }}
                        className="fixed top-0 left-0 w-4/5 h-full bg-black z-50"
                    >
                        <div className="h-full bg-offblack">
                        <div className='flex flex-col w-[100%] justify-center h-full p-2 text-white font-connection border-2 border-darkgrey bg-offblack'>
                            <div className='flex flex-row justify-between items-center p-2 border-b-2 border-darkgrey'>
                                <div className='text-md'>Selected Pixels:</div>
                                <div className='text-md'>{includeInUpdate.reduce((count, value) => {return value ? count + 1 : count;}, 0)} / {userPixels.length}</div>
                            </div>
                        <div className='hide-scrollbar h-full overflow-y-auto'>
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
                                <button className='text-xs bg-black text-lightgrey border-darkgrey hover:border-black border-2 py-2 px-2 w-full flex items-center justify-between' onClick={() => handleUpdatePixelPrice()}
                                >
                                    <span>
                                        Cancel Update
                                    </span>
                                    <svg className="ml-auto h-[16px] w-[16px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                        <path d="M5 5h2v2H5V5zm4 4H7V7h2v2zm2 2H9V9h2v2zm2 0h-2v2H9v2H7v2H5v2h2v-2h2v-2h2v-2h2v2h2v2h2v2h2v-2h-2v-2h-2v-2h-2v-2zm2-2v2h-2V9h2zm2-2v2h-2V7h2zm0 0V5h2v2h-2z" fill="currentColor"/>
                                    </svg>
                                </button>
                                <button className='text-xs text-black bg-lightgrey border-2 border-darkgrey hover:border-lightgrey py-2 px-2 w-full flex items-center justify-between' 
                                    disabled={approvalLoad || setPricesLoad}
                                    onClick={() => handleSetPrices()}
                                >
                                    <span>
                                        {approvalLoad || setPricesLoad ? 'Processing...' : 'Confirm Values' }
                                    </span>
                                    {approvalLoad || setPricesLoad ?
                                        <SpinningLoader className="ml-auto h-[16px] w-[16px]"/>
                                    :
                                        <svg className="ml-auto h-[16px] w-[16px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                            <path d="M18 6h2v2h-2V6zm-2 4V8h2v2h-2zm-2 2v-2h2v2h-2zm-2 2h2v-2h-2v2zm-2 2h2v-2h-2v2zm-2 0v2h2v-2H8zm-2-2h2v2H6v-2zm0 0H4v-2h2v2z" fill="currentColor"/>
                                        </svg>
                                    }
                                </button>
                            </div>
                            <div className='text-xs pt-2 text-lightgrey'>
                                by confirming new pixel values, you will automatically settle any outstanding royalties on your previous pixel values for a total of {(Math.round(Utils.formatEther(BigInt(totalPendingRoyalties))*100)/100)} wETH. Going forward, new royalties will be paid based on your newly updated values.
                            </div>
                        </div>
                        </div>
                        </div>
                    </motion.div>
                    )}
                    </AnimatePresence>
                </>
                <>
                    <AnimatePresence>
                    {payRoyaltyFlag && (
                    <motion.div
                        initial={{ x: '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '-100%' }}
                        transition={{ type: 'spring', duration: 0.3 }}
                        className="fixed top-0 left-0 w-4/5 h-full bg-black z-50"
                    >
                        <div className="h-full bg-offblack">
                        <div className='flex flex-col w-[100%] justify-center h-full p-2 text-white font-connection border-2 border-darkgrey bg-offblack'>
                                    <div className='flex flex-row justify-between items-center p-2 border-b-2 border-darkgrey'>
                                    <div className='text-md'>Selected Pixels:</div>
                                    <div className='text-md'>{includeInUpdate.reduce((count, value) => {return value ? count + 1 : count;}, 0)} / {userPixels.length}</div>
                                </div>
                            <div className='hide-scrollbar h-full overflow-y-auto'>
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
                                        <div className='text-sm'>pending royalties: {Math.round(Utils.formatEther(BigInt(outstandingRoyalties(userPixels[index])))*1000)/1000} ETH</div>
                                    </div>
                                </div>
                            ))}
                            </div>
                            <div className='flex flex-col justify-between pt-2 border-t-2 border-darkgrey text-xs'>
                                <div className='flex flex-row justify-between items-center'>
                                    <button className='text-xs bg-black text-lightgrey border-darkgrey hover:border-black border-2 py-2 px-2 w-full flex items-center justify-between' onClick={() => handlePayRoyalties()}
                                    >
                                        <span>
                                            Cancel Payment
                                        </span>
                                        <svg className="ml-auto h-[16px] w-[16px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                            <path d="M5 5h2v2H5V5zm4 4H7V7h2v2zm2 2H9V9h2v2zm2 0h-2v2H9v2H7v2H5v2h2v-2h2v-2h2v-2h2v2h2v2h2v2h2v-2h-2v-2h-2v-2h-2v-2zm2-2v2h-2V9h2zm2-2v2h-2V7h2zm0 0V5h2v2h-2z" fill="currentColor"/>
                                        </svg>
                                    </button>
                                    <button className={`text-xs py-2 px-2 w-full border-2 flex items-center justify-between
                                                ${Number(tokenBalance) > Utils.formatEther(totalPendingRoyalties.toString()) ? 'text-black bg-lightgrey border-darkgrey hover:border-lightgrey':'text-lightgrey bg-black border-darkgrey'}
                                                ${Number(tokenBalance) < Utils.formatEther(totalPendingRoyalties.toString()) && 'cursor-not-allowed'}`}
                                        disabled={royaltyApprovalLoad || payRoyaltyLoad || Number(tokenBalance) < totalPendingRoyalties}
                                        onClick={() => handleRoyaltyPayment()}
                                    >
                                        <span>
                                            {royaltyApprovalLoad || payRoyaltyLoad ? 'Processing...' :
                                            Number(tokenBalance) < Utils.formatEther(totalPendingRoyalties.toString()) ? 'Not enought wETH' : `Pay Royalties (${(Math.round(Utils.formatEther(totalPendingRoyalties.toString())*100)/100)} ETH)` }    
                                        </span>
                                        {royaltyApprovalLoad || payRoyaltyLoad ?
                                            <SpinningLoader className="ml-auto h-[16px] w-[16px]"/>
                                        :
                                            <svg className="ml-auto h-[16px] w-[16px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                                <path d="M18 6h2v2h-2V6zm-2 4V8h2v2h-2zm-2 2v-2h2v2h-2zm-2 2h2v-2h-2v2zm-2 2h2v-2h-2v2zm-2 0v2h2v-2H8zm-2-2h2v2H6v-2zm0 0H4v-2h2v2z" fill="currentColor"/>
                                            </svg>
                                        }    
                                    </button>
                                </div>
                                
                            </div>
                        </div>
                        </div>
                    </motion.div>
                    )}
                    </AnimatePresence>
                </>
                </>
                )}
                {setPixelData && (
                <>
                    <div className='flex flex-col justify-between pt-2 mb-4 border-t-2 border-darkgrey'>
                            <div className='flex flex-row justify-between gap-2 items-center'>
                                <button className='text-xs bg-black text-lightgrey border-darkgrey hover:border-black border-2 py-2 px-2 w-full flex items-center justify-between' onClick={() => handlePixelModification()}
                                >
                                    <span>
                                        Cancel Update
                                    </span>
                                    <svg className="ml-auto h-[16px] w-[16px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                        <path d="M5 5h2v2H5V5zm4 4H7V7h2v2zm2 2H9V9h2v2zm2 0h-2v2H9v2H7v2H5v2h2v-2h2v-2h2v-2h2v2h2v2h2v2h2v-2h-2v-2h-2v-2h-2v-2zm2-2v2h-2V9h2zm2-2v2h-2V7h2zm0 0V5h2v2h-2z" fill="currentColor"/>
                                    </svg>
                                </button>
                                <button className='text-xs text-black bg-lightgrey border-2 border-darkgrey hover:border-lightgrey py-2 px-2 w-full flex items-center justify-between' 
                                    disabled={ fillPixelLoad }
                                    onClick={() => handlePixelFill()}
                                >
                                    <span>
                                        {fillPixelLoad ? 'Processing...' : 'Confirm Update' }
                                    </span>
                                    {fillPixelLoad ?
                                        <SpinningLoader className="ml-auto h-[16px] w-[16px]"/>
                                    : 
                                    <svg className="ml-auto h-[16px] w-[16px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                        <path d="M18 6h2v2h-2V6zm-2 4V8h2v2h-2zm-2 2v-2h2v2h-2zm-2 2h2v-2h-2v2zm-2 2h2v-2h-2v2zm-2 0v2h2v-2H8zm-2-2h2v2H6v-2zm0 0H4v-2h2v2z" fill="currentColor"/>
                                    </svg> }
                                </button>
                            </div>
                        </div>

            
                <div className='flex items-center justify-center mt-2'>
                    <MobileArtGrid grid={tempPixelData} dimm={false} />
                </div>
                <div className='flex flex-row justify-between items-center p-2 '>
                    <div className='text-md'>Selected Pixels:</div>
                    <div className='text-md'>{includeInUpdate.reduce((count, value) => {return value ? count + 1 : count;}, 0)} / {userPixels.length}</div>
                </div>
                <div className='flex flex-row justify-between gap-2 py-2 items-center border-b-2 border-darkgrey'>
                    <button className='text-xs text-black bg-lightgrey border-2 border-darkgrey hover:border-lightgrey py-2 px-2 w-full flex items-center justify-between'
                        onClick={() => handlePixelSelectionLeft_Color()}
                    >
                        <svg className="mr-auto h-[16px] w-[16px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"> <path d="M20 11v2H8v2H6v-2H4v-2h2V9h2v2h12zM10 7H8v2h2V7zm0 0h2V5h-2v2zm0 10H8v-2h2v2zm0 0h2v2h-2v-2z" fill="currentColor"/> </svg>
                        Prev Pixel
                    </button>
                    <button className='text-xs text-black bg-lightgrey border-2 border-darkgrey hover:border-lightgrey py-2 px-2 w-full flex items-center justify-between' 
                        onClick={() => handlePixelSelectionRight_Color()}
                    >
                        <span>Next Pixel</span>
                        <svg className="ml-auto h-[16px] w-[16px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"> <path d="M4 11v2h12v2h2v-2h2v-2h-2V9h-2v2H4zm10-4h2v2h-2V7zm0 0h-2V5h2v2zm0 10h2v-2h-2v2zm0 0h-2v2h2v-2z" fill="currentColor"/> </svg>
                    </button>
                </div>
                <div className='hide-scrollbar h-full overflow-y-auto'>
                    <div className='flex justify-between items-center p-3 mb-2 border-b-2 border-darkgrey'>
                        <div className='flex flex-1 justify-start items-center gap-3'>
                            <button className='w-[24px]' onClick={() => handleIncludeInUpdate(pixelColorIndex)}>
                            {includeInUpdate[pixelColorIndex] ? 
                                <svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"> <path d="M5 3H3v18h18V3H5zm0 2h14v14H5V5zm4 7H7v2h2v2h2v-2h2v-2h2v-2h2V8h-2v2h-2v2h-2v2H9v-2z" fill='#EBEBEB'/> </svg>    
                            :
                                <svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"> <path d="M3 3h18v18H3V3zm16 16V5H5v14h14z" fill='#EBEBEB'/> </svg>
                            }
                            </button>
                            <div className='text-lg'>{userPixels[pixelColorIndex].x} x {userPixels[pixelColorIndex].y}</div>
                        </div>
                        <div className='flex flex-1 justify-center items-center gap-3'>
                            <button className='w-[36px]' onClick={() => handleLeftArrowShape(pixelColorIndex)}>
                                <svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"> <path d="M16 5v2h-2V5h2zm-4 4V7h2v2h-2zm-2 2V9h2v2h-2zm0 2H8v-2h2v2zm2 2v-2h-2v2h2zm0 0h2v2h-2v-2zm4 4v-2h-2v2h2z" fill='#EBEBEB'/> </svg>
                            </button>
                            {renderShape(shapes[selectedShape[pixelColorIndex]], selectedColor[pixelColorIndex])}
                            <button className='w-[36px]' onClick={() => handleRightArrowShape(pixelColorIndex)}>
                                <svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"> <path d="M8 5v2h2V5H8zm4 4V7h-2v2h2zm2 2V9h-2v2h2zm0 2h2v-2h-2v2zm-2 2v-2h2v2h-2zm0 0h-2v2h2v-2zm-4 4v-2h2v2H8z" fill='#EBEBEB'/> </svg>
                            </button>
                        </div>
                    </div>
                </div>
                <MobileColorPicker
                    onSelect={onColorSelect}
                    bgColor={'bg-offblack'}
                />
            </>
                )}
        </div>
    )
};

export default MobilePortfolio;
