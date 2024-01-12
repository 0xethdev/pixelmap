import { useState, useEffect, useContext } from 'react';
import { useAccount, useContractWrite } from 'wagmi'
import { Utils } from 'alchemy-sdk'
import Pixelmap from '../../src/artifacts/contracts/Pixelmap.sol/Pixelmap.json';
import contractAddr from '../hooks/contractAddr';
import PixelContext from './PixelContext';
import { UserBalanceContext } from './UserBalanceContext';
import { createShape } from '../assets/gridShapes';

const wETH_ABI = [{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"guy","type":"address"},{"name":"wad","type":"uint256"}],"name":"approve","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"src","type":"address"},{"name":"dst","type":"address"},{"name":"wad","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"wad","type":"uint256"}],"name":"withdraw","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"balanceOf","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"dst","type":"address"},{"name":"wad","type":"uint256"}],"name":"transfer","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"deposit","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"},{"name":"","type":"address"}],"name":"allowance","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"payable":true,"stateMutability":"payable","type":"fallback"},{"anonymous":false,"inputs":[{"indexed":true,"name":"src","type":"address"},{"indexed":true,"name":"guy","type":"address"},{"indexed":false,"name":"wad","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"src","type":"address"},{"indexed":true,"name":"dst","type":"address"},{"indexed":false,"name":"wad","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"dst","type":"address"},{"indexed":false,"name":"wad","type":"uint256"}],"name":"Deposit","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"src","type":"address"},{"indexed":false,"name":"wad","type":"uint256"}],"name":"Withdrawal","type":"event"}];

const Sidebar = ({ selectedPixels, removePixel, setSelectedPixels }) => {
    const [totalPrice, setTotalPrice] = useState(0);
    const [currencyApproval, setCurrencyApproval] = useState(false);
    const { isConnected } = useAccount();
    const { tokenBalance, tokenAllowance, refreshBalanceData } = useContext(UserBalanceContext);
    const { setUpdatedPixels } = useContext(PixelContext);

    useEffect(() => {
        const calculateTotalPrice = () => {
            let totalP = 0;
            for (let i = 0; i < selectedPixels.length; i++) {
                totalP += Number(selectedPixels[i].price);
            }
            setTotalPrice(totalP);
        }
        calculateTotalPrice();
    },[selectedPixels]);

    useEffect(() => {
        if(!isConnected) setSelectedPixels([]);
    },[isConnected]);

    const renderShape = (shapeID, color) => {
        const size = 12; // Size of the shape to be rendered in the sidebar
        const x = 0;
        const y = 0;

        return (
            <svg width={size} height={size} className="shape-preview">
                {createShape(null, shapeID, size, size, x, y, color)}
            </svg>
        );
    };


    /// APPROVE WETH FOR TOTAL PRICE && BUY PIXELS
    const { isLoading:approvalLoad, write: approveWETH } = useContractWrite({
        address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
        abi: wETH_ABI,
        functionName: 'approve',
        onSuccess(){
            setCurrencyApproval(true);
            
        }
    });
      
    const { isLoading:buyLoad, write: buyPixel } = useContractWrite({
        address: contractAddr,
        abi: Pixelmap.abi,
        functionName: 'buyPixel',
        onSuccess(){
            setCurrencyApproval(false);
            setUpdatedPixels(selectedPixels.map(pixel => ({ x: pixel.x, y: pixel.y })));
            setSelectedPixels([]);
        }
    });
    async function handlePixelPurchase() {
        setCurrencyApproval(false);        
        const xValues = selectedPixels.map(pixel => pixel.x);
        const yValues = selectedPixels.map(pixel => pixel.y);
        const sellers = selectedPixels.map(pixel => pixel.owner);
        const sellersOtherThanNull = sellers.some(owner => owner !== '0x0000000000000000000000000000000000000000');
        

        if(!currencyApproval && sellersOtherThanNull){
            console.log('allowance:', Utils.formatEther(tokenAllowance.toString()));
            console.log('total price:', totalPrice);
            if(Utils.formatEther(tokenAllowance.toString()) > Utils.formatEther( totalPrice.toString())) {
                setCurrencyApproval(true);
            }else{
                await approveWETH({args:[ contractAddr , totalPrice ]});
            }
        }else{
            await buyPixel({ args: [xValues,yValues] });
        }        
    }
    useEffect(() => {
        if (currencyApproval) {
            handlePixelPurchase();
        }
    }, [currencyApproval]);


    if (selectedPixels.length === 0) return null;
    return (
        <div className='flex flex-col w-[80%] p-2 text-white font-connection border-2 border-darkgrey bg-offblack'>
            <div className='flex justify-between items-center p-2 border-b-2 border-darkgrey'>
                <div className='text-md'>TOTAL COST: {(Math.round(Utils.formatEther(BigInt(totalPrice))*100)/100).toString()} ETH</div>
                <button 
                    className={`text-xs py-1 px-2 border-2 
                                ${isConnected && Number(Utils.formatEther(totalPrice.toString())) < Number(tokenBalance) ? 'bg-black text-lightgrey border-darkgrey' : 'bg-darkgrey text-white border-darkgrey'} 
                                ${!isConnected || Number(Utils.formatEther(totalPrice.toString())) > Number(tokenBalance) && 'cursor-not-allowed'}`} 
                    disabled={!isConnected || approvalLoad || buyLoad || Number(Utils.formatEther(totalPrice.toString())) > Number(tokenBalance) }
                    onClick={() => handlePixelPurchase()}
                >
                    {approvalLoad || buyLoad ? 'Processing...' : 
                    Number(Utils.formatEther(totalPrice.toString())) > Number(tokenBalance) ? 'Not Enough wETH' : 'Buy Pixels' }
                </button>
            </div>
            <div className='hide-scrollbar max-h-[500px] overflow-y-auto'>
            {selectedPixels.sort((a, b) => a.x - b.x || a.y - b.y).map((pixel, index) => (
                <div key={index} className='flex justify-between items-center mb-2 p-2 border-b-2 border-darkgrey'>
                    <div className='flex items-center'>
                        {renderShape(Number(pixel.shapeID), pixel.color)}
                        <div className='flex flex-col ml-2'>
                            <div className='text-sm'>{pixel.x} x {pixel.y}</div>
                        </div>
                    </div>
                    <div className='text-sm'>{(Math.round(Utils.formatEther(BigInt(pixel.price))*100)/100).toString()} ETH</div>
                    <button className='text-xs text-black bg-lightgrey border-2 border-darkgrey py-1 px-2' onClick={() => removePixel(index)}>Remove</button>
                </div>
            ))}
            </div>
            <div className='text-xs text-end p-2 border-t-2 border-darkgrey'>Selected Items: {selectedPixels.length} / 32</div>
        </div>
    );
};

export default Sidebar;
