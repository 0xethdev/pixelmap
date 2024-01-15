import React from 'react';
import { Utils } from 'alchemy-sdk'
import { useState, useEffect } from 'react';
import { createShape } from '../assets/gridShapes';
import { useAccount } from 'wagmi'
import { motion } from 'framer-motion'

const truncateAddress = (address) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

const HoverCard = ({ pixelInfo }) => {
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
        <div className='w-[576px] h-[100px] justify-between absolute px-4 bg-black border-2 border-darkgrey z-10 font-connection'>
            {pixelInfo ? (
                <div className='flex flex-col justify-between h-full'>
                    <div className='flex flex-row h-[40px] border-b-2 border-darkgrey'>
                        <div className='flex justify-end flex-col w-1/2'>
                            <p className='text-lg text-white'>{pixelInfo.x} <span className='text-darkgrey text-xl'>x</span> {pixelInfo.y}</p>
                        </div>
                        <div className='flex flex-col w-1/2 justify-center items-end'>
                            {renderShape(Number(pixelInfo.shapeID), pixelInfo.color)}
                        </div>
                    </div>
                    <div className='flex flex-row items-center h-[30px]'>
                        <p className="text-xs text-white"><span className='text-darkgrey text-xs'>owned by</span> {truncateAddress(pixelInfo.owner)}</p>
                    </div>
                    <div className='flex flex-row justify-between items-center h-[30px]'>
                        <p className='text-md text-white'><span className='text-darkgrey text-xs'>price:</span> {Math.round(Utils.formatEther(pixelInfo.price)*100)/100}</p>
                        <p className='text-xs text-white'><span className='text-darkgrey text-xs'>royalties last paid:</span> {formatDate(pixelInfo.royaltyLastPaid)}</p>
                    </div>
                </div>
            ) : (
                <div className='flex items-center flex-col justify-center h-full text-darkgrey'>
                    Hover over pixels for info
                </div>
            )}
        </div>
    );
};


const GeneralInfo = ({ pixels }) => {
    const [generalInfo, setGeneralInfo] = useState({
        lowestPrice: '',
        averagePrice: '',
        highestPrice: '',
        uniqueOwnersCount: null,
        ownerWithMostPixels: null
    });

    useEffect(() => {
        if ( pixels.length > 0) {
            let totalPrices = 0;
            let lowestPrice = Infinity;
            let highestPrice = -Infinity;
            let ownersMap = {};

            pixels.forEach(pixel => {
                const price = Number(pixel.price);
                totalPrices += price;
                if (price < lowestPrice) lowestPrice = price;
                if (price > highestPrice) highestPrice = price;

                const owner = pixel.owner;
                if (ownersMap[owner]) {
                    ownersMap[owner]++;
                } else {
                    ownersMap[owner] = 1;
                }
            });

            const uniqueOwnersCount = Object.keys(ownersMap).length;
            const ownerWithMostPixels = Object.keys(ownersMap).reduce((a, b) => ownersMap[a] > ownersMap[b] ? a : b);
            
            setGeneralInfo({
                lowestPrice: Math.round(Utils.formatEther(BigInt(lowestPrice))*100)/100,
                averagePrice: Math.round(Utils.formatEther(BigInt(totalPrices / pixels.length))*100)/100,
                highestPrice: Math.round(Utils.formatEther(BigInt(highestPrice))*100)/100,
                uniqueOwnersCount,
                ownerWithMostPixels
            });
        }
    }, [pixels]);

    const { lowestPrice, averagePrice, highestPrice, uniqueOwnersCount, ownerWithMostPixels } = generalInfo;

    return (
        <div className='p-1 flex flex-row items-center w-[576px] text-black font-connection text-xs border-2 border-darkgrey bg-offblack'>
            <div className='flex flex-col items-center w-1/5 border-r-2 border-darkgrey'>
                <div>Lowest Price</div>
                <div className='text-sm text-lightgrey'>{lowestPrice !== ''? lowestPrice.toString() : 'N/A'}</div>
            </div>
            <div className='flex flex-col items-center w-1/5 border-r-2 border-darkgrey'>
                <div>Average Price</div>
                <div className='text-sm text-lightgrey'>{averagePrice!== ''? averagePrice.toString() : 'N/A'}</div>
            </div>
            <div className='flex flex-col items-center w-1/5 border-r-2 border-darkgrey'>
                <div>Highest Price</div>
                <div className='text-sm text-lightgrey'>{highestPrice!== ''? highestPrice.toString()  : 'N/A'}</div>
            </div>
            <div className='flex flex-col items-center w-1/5 border-r-2 border-darkgrey'>
                <div>Unique Artists</div>
                <div className='text-sm text-lightgrey'>{uniqueOwnersCount? uniqueOwnersCount.toString() : 'N/A'}</div>
            </div>
            <div className='flex flex-col items-center w-1/5'>
                <div>Largest Artist</div>
                <div className='text-sm text-lightgrey'>{ownerWithMostPixels ? truncateAddress(ownerWithMostPixels) : 'N/A'}</div>
            </div>
        </div>
    );
};

const ArtisticGrid = React.memo(({ grid, handlePixelClick, filterActive }) => {
    const [hoveredPixel, setHoveredPixel] = useState(null);
    const { address, isConnected } = useAccount();
    const [searchInputX, setSearchInputX] = useState('');
    const [searchInputY, setSearchInputY] = useState('');
    const [isAnimating, setIsAnimating] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    
    const squareSize = 8; // Size of each square
    const gap = 1; // Gap between squares

    const handleMouseOver = (e, pixel) => {
        setHoveredPixel(pixel);
    };

    const handleInputX = (e) => {
        let newValue = Math.max(0, Math.min(63, Number(e.target.value)));
        setSearchInputX(newValue);
    }
    const handleInputY = (e) => {
        let newValue = Math.max(0, Math.min(63, Number(e.target.value)));
        setSearchInputY(newValue);
    }
    const handleSerachClick = () => {
        const foundPixel = grid.find(pixel => {
            const pixelX = pixel.x;
            const pixelY = pixel.y;
            return pixelX === searchInputX && pixelY === searchInputY;
        });
        if (foundPixel) {
            handlePixelClick(foundPixel);
            setSearchInputX('');
            setSearchInputY('');
        }
    }

    useEffect(() => {
        if (searchInputX !== '' && searchInputY !== '') {
            setIsAnimating(true);
        } else {
            setIsAnimating(false);
        }
    }, [searchInputX, searchInputY]);

    
    const animationSettingsSearchButton = isAnimating && !isHovered ? {
        y: [0, -2, 0],
        transition: {
            repeat: Infinity,
            repeatType: "reverse",
            duration: 1
        }
    }:{};
    
    return (
        <div className='flex flex-col items-center'>
            <GeneralInfo pixels={grid} />
            <div className='flex flex-row justify-between items-center w-[576px] mx-2 text-lightgrey font-connection text-sm border-2 border-darkgrey my-2 py-1 px-2'>
                <span className='w-1/5' >pixel search</span>
                <div className='flex flex-row justify-center items-center'>
                    <input className='w-20 text-center bg-inherit hide-arrows-number-input' type="number" value={searchInputX} onChange={(e) => handleInputX(e)} min="0" max="63" placeholder="X: 0-63"/>
                    <span className='text-darkgrey text-md'> x </span>
                    <input className='w-20 text-center bg-inherit hide-arrows-number-input' type="number" value={searchInputY} onChange={(e) => handleInputY(e)} min="0" max="63" placeholder="Y: 0-63"/>
                </div>
                <motion.button
                    className={`${!isAnimating && 'cursor-not-allowed'} w-1/5`}
                    onClick={() => handleSerachClick()}
                    animate={isAnimating ? animationSettingsSearchButton : {}}
                >
                    <motion.svg className="ml-auto h-[16px] w-[16px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                        whileHover={isAnimating ? { scale: 1.1}:{}}
                    >
                        <path d="M6 2h8v2H6V2zM4 6V4h2v2H4zm0 8H2V6h2v8zm2 2H4v-2h2v2zm8 0v2H6v-2h8zm2-2h-2v2h2v2h2v2h2v2h2v-2h-2v-2h-2v-2h-2v-2zm0-8h2v8h-2V6zm0 0V4h-2v2h2z" fill="currentColor"/>
                    </motion.svg>
                </motion.button>
            </div>
            <div className='relative'>
                <svg width="600" height="600" className="canvas-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600"
                onMouseLeave={() => setHoveredPixel(null)}>
                    {grid.map((pixel, i) => {
                        
                        const x = (i % 64) * (squareSize + gap)+12; 
                        const y = Math.floor(i / 64) * (squareSize + gap)+12;
                        const isOwnedByUser = pixel.owner === address;
                        const isDimmed = isConnected && filterActive && !isOwnedByUser 
                        //|| !filterActive && hoveredPixel !== pixel && hoveredPixel !== null;

                        return createShape(i, Number(pixel.shapeID), squareSize, squareSize, x, y, pixel.color, pixel, handleMouseOver, handlePixelClick, isDimmed);
                    })}
                </svg>
                <div className="w-[576px] absolute left-[10px] top-[610px]">
                    <HoverCard pixelInfo={hoveredPixel} />
                </div>
            </div>
        </div>
    );
});

export default ArtisticGrid;
