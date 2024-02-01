import React, { useState, useEffect, useContext } from 'react';
import { Utils } from 'alchemy-sdk'
import Art from './Art';
import DemoCanvas from './DemoCanvas.jsx';
import AnimationGrid from './AnimationGrid';
import SideBar from './Sidebar.jsx'
import PixelContext from './PixelContext.jsx';
import useFetchSinglePixelData from '../hooks/useFetchSinglePixelData.jsx';
import PixelPortfolio from './PixelPortfolio.jsx';
import CanvasArtists from './CanvasArtists.jsx';
import { createShape } from '../assets/gridShapes';
import { useAccount } from 'wagmi'
import { motion, AnimatePresence } from 'framer-motion';
import MobilePortfolio from './MobilePortfolio.jsx';

const truncateAddress = (address) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

function useWindowSize() {
    const [windowSize, setWindowSize] = useState({
      width: undefined,
      height: undefined,
    });
  
    useEffect(() => {
      function handleResize() {
        setWindowSize({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      }
  
      window.addEventListener('resize', handleResize);
      
      // Call handleResize immediately to set the initial size
      handleResize();
  
      return () => window.removeEventListener('resize', handleResize);
    }, []);
  
    return windowSize;
}

const ProgressBar = ({ progress }) => {
    const progressBarStyle = {
        width: `${progress}%`,
        height: '10px',
        backgroundColor: '#EBEBEB',
        transition: 'width 1s ease-in-out',
    };

    return (
        <div style={{ width: '100%', backgroundColor: '#3D3D3D' }}>
            <div style={progressBarStyle}></div>
        </div>
    );
};


const MobileArtGrid = ({grid, priceFilterFlag, priceFilterValue, setMobileHighlightPixel }) => {
    const { address, isConnected } = useAccount();
    const squareSize = 7; // Size of each square
    const gap = 1; // Gap between squares

    const handlePixelSelection = (pixel) => {
        setMobileHighlightPixel({x:pixel.x, y:pixel.y});
    }

    return (
        <svg width='100%' className="canvas-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 520">
                {grid.map((pixel, i) => {
                    const x = (i % 64) * (squareSize + gap)+4; 
                    const y = Math.floor(i / 64) * (squareSize + gap)+4;
                    const isDimmed = priceFilterFlag && pixel.price > priceFilterValue;
                    
                return createShape(i, Number(pixel.shapeID), squareSize, squareSize, x, y, pixel.color, pixel, null, handlePixelSelection, null, null, isDimmed);
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

const Canvas = ({ setInitialLoading }) => {
    const { isConnected, address } = useAccount();
    const [filterActive, setFilterActive] = useState(false);
    const [setPixelData, toggleSetPixelData] = useState(false);
    const [tempPixelData, setTempPixelData] = useState([]);
    const { pixels, loading, progress } = useContext(PixelContext);
    const [selectedPixels, setSelectedPixels] = useState([]);
    const [demoCanvas, setDemoCanvas] = useState(false);
    const [demoGridData, setDemoGridData] = useState([]);
    useFetchSinglePixelData();
    const { width } = useWindowSize();
    const [searchInputX, setSearchInputX] = useState('');
    const [searchInputY, setSearchInputY] = useState('');
    const [mobileHighlightPixel,setMobileHighlightPixel] = useState({x:0,y:0});
    const [currentPixel, setCurrentPixel] = useState();
    const [toggleMobileSideBar, setToggleMobileSideBar] = useState(false);
    const [toggleMobilePortfolio, setToggleMobilePortfolio] = useState(false);
    const [priceFilterFlag, setPriceFilterFlag] = useState(false);
    const [priceFilterValue, setPriceFilterValue] = useState('');
    
    const handleCloseMobileSideBar = () => {
        setToggleMobileSideBar(false);
    };
    const handleCloseMobilePortfolio = () => {
        setToggleMobilePortfolio(false);
    };

    const handlePixelSelectionLeft = () => {
        const currentX = mobileHighlightPixel.x;
        const currentY = mobileHighlightPixel.y;
        if(currentX == 0){
            if(currentY == 0){
                setMobileHighlightPixel({x:63,y:63});
            }else{
                setMobileHighlightPixel({x:63,y:currentY-1});
            }
        }else{
            setMobileHighlightPixel({x:currentX-1,y:currentY});
        }
    }
    const handlePixelSelectionRight = () => {
        const currentX = mobileHighlightPixel.x;
        const currentY = mobileHighlightPixel.y;
        if(currentX == 63){
            if(currentY == 63){
                setMobileHighlightPixel({x:0,y:0});
            }else{
                setMobileHighlightPixel({x:0,y:currentY+1});
            }
        }else{
            setMobileHighlightPixel({x:currentX+1,y:currentY});
        }
    }

    const handleInputX = (e) => {
        let newValue = Math.max(0, Math.min(63, Number(e.target.value)));
        setSearchInputX(newValue);
    }
    const handleInputY = (e) => {
        let newValue = Math.max(0, Math.min(63, Number(e.target.value)));
        setSearchInputY(newValue);
    }
    const handleSerachClick = () => {
        const foundPixel = pixels.find(pixel => {
            const pixelX = pixel.x;
            const pixelY = pixel.y;
            return pixelX === searchInputX && pixelY === searchInputY;
        });
        if (foundPixel) {
            setMobileHighlightPixel({x:foundPixel.x,y:foundPixel.y});
            setCurrentPixel(foundPixel)
            setSearchInputX('');
            setSearchInputY('');
        }
    }

    useEffect(() => {
        if(!currentPixel){
            const foundPixel = pixels.find(pixel => pixel.x === 0 && pixel.y === 0);
            if(foundPixel){
                setCurrentPixel(foundPixel);
            }
        }
    },[pixels]);

    useEffect(() => {
        const foundPixel = pixels.find(pixel => pixel.x === mobileHighlightPixel.x && pixel.y === mobileHighlightPixel.y);
        setCurrentPixel(foundPixel);

    },[mobileHighlightPixel]);
    
    const breakpoints = {
        sm: 640,
        md: 768,
        lg: 1024,
    };
    

    useEffect(() => {
        setInitialLoading(loading);        
    }, [loading, setInitialLoading]);

    const toggleDemoCanvas = () => {
        if(!demoCanvas && demoGridData.length === 0){
            const originalGridData = pixels
            const demoGridDataLoaded = JSON.parse(JSON.stringify(originalGridData));
            setDemoGridData(demoGridDataLoaded)
        }
        

        setDemoCanvas(!demoCanvas);
    }

    const handlePixelClick = (pixel) => {
        const isPixelSelected = selectedPixels.some(
            (selectedPixel) => selectedPixel.x === pixel.x && selectedPixel.y === pixel.y
        );
        if (!isPixelSelected && selectedPixels.length < 32) {
            setSelectedPixels([...selectedPixels, pixel]);
        }
    };

    const addDragSelectedPixels = (newPixels) => {
        setSelectedPixels(prevSelectedPixels => [...prevSelectedPixels, ...newPixels]);
    };
    

    const removePixel = (index) => {
        const newSelectedPixels = [...selectedPixels];
        newSelectedPixels.splice(index, 1);
        setSelectedPixels(newSelectedPixels);
    };

    const handlePriceInput = (e) => {
        let newValue = Math.max(0, Number(e.target.value));
        setPriceFilterValue(newValue);
    }
    const handlePriceFilterToggle = () => {
        setFilterActive(false);
        setPriceFilterFlag(!priceFilterFlag);
        console.log(priceFilterFlag)
    }


    if (loading) {
        return (
            <div className='container'>
                <div className="flex flex-col mx-4 w-100% h-full items-center justify-center items-top pt-12 pb-10">
                    <AnimationGrid width={width > breakpoints.md? '100%' : '300px'} height={width > breakpoints.md? '100%' : '300px'}/>
                    <div className='flex flex-row w-full items-center justify-center gap-3'>
                        <p className='p-3 text-sm md:text-md font-connection text-white'>Loading Canvas... {Math.round(progress*100)/100}%</p>
                        <ProgressBar progress={progress} />
                    </div>
                    
                </div>
            </div>
            
        );
    }

    if(width > breakpoints.md){
    return (
        <div className='flex flex-col'>
            <div className='flex justify-start items-start text-white text-xs font-connection py-1 px-10'>
                <div className='absolute mt-1'>
                    <button
                    onClick={() => toggleDemoCanvas()}>
                        {!demoCanvas ? (
                            <div className='flex flex-row justify-between gap-2 items-center text-black bg-lightgrey border-2 border-white py-1 px-2'>
                                <span>Test Canvas</span>
                                <svg className='w-[16px] h-[16px]' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"> <path d="M9 3H7v2h2V3zm0 12H7v2h2v-2zm2-12h2v2h-2V3zm2 12h-2v2h2v-2zm2-12h2v2h-2V3zm2 12h-2v2h2v-2zm2-12h2v2h-2V3zm2 4h-2v2h2V7zM7 7h2v2H7V7zm14 4h-2v2h2v-2zM7 11h2v2H7v-2zm14 4h-2v2h2v-2zM3 7h2v12h12v2H3V7z" fill="currentColor"/> </svg>
                            </div>
                            
                        ):(
                            <div className='flex flex-row justify-between gap-2 items-center bg-offblack border-2 border-darkgrey py-1 px-2'>
                                <span>Actual Canvas</span>
                                <svg className='w-[16px] h-[16px]' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"> <path d="M21 3H7v14h14V3zm-2 12H9V5h10v10zM5 7H3v2h2V7zm-2 4h2v2H3v-2zm2 4H3v2h2v-2zm-2 4h2v2H3v-2zm6 0H7v2h2v-2zm2 0h2v2h-2v-2zm6 0h-2v2h2v-2z" fill="currentColor"/> </svg>
                            </div>
                        )}
                    </button>
                </div>
            </div>
            <div className='flex-grow'>
            {!demoCanvas && (
                <div className='flex flex-col'>

                <div className='flex gap-10 pb-10'>            
                    <div className='flex flex-col w-1/5 ml-10 mt-10'>
                        <SideBar isOpen={toggleMobileSideBar} onClose={handleCloseMobileSideBar} selectedPixels={selectedPixels} removePixel={removePixel} setSelectedPixels={setSelectedPixels}/>
                    </div>
                    <div className='flex flex-col w-3/5'>
                        <div className="flex justify-center items-top ">
                            <Art grid={ setPixelData ? tempPixelData : pixels} handlePixelClick={handlePixelClick} filterActive={filterActive} setFilterActive={setFilterActive} addDragSelectedPixels={addDragSelectedPixels} selectedPixels={selectedPixels} priceFilterFlag={priceFilterFlag} setPriceFilterValue={setPriceFilterValue} setPriceFilterFlag={setPriceFilterFlag} priceFilterValue={priceFilterValue}/>
                        </div>
                        
                    </div>
                    <div className='flex flex-col w-1/5 mr-10 mt-10'>
                        <PixelPortfolio 
                            filterActive={filterActive} setFilterActive={setFilterActive}
                            setPixelData={setPixelData} toggleSetPixelData={toggleSetPixelData}
                            tempPixelData={tempPixelData} setTempPixelData={setTempPixelData}
                            setPriceFilterFlag={setPriceFilterFlag} setPriceFilterValue={setPriceFilterValue}
                            />
                    </div>
                    
                </div>
                <div className='mt-20'>
                    <CanvasArtists pixels={pixels}/>
                </div>
                </div>
            )}
            {demoCanvas && (
                <div className='flex gap-10 pb-10'>            
                    <div className='flex flex-col w-1/5 ml-10'>
                    </div>
                    <div className='flex flex-col w-3/5'>
                        <div className="flex justify-center items-top ">
                            <DemoCanvas grid={demoGridData} setDemoGridData={setDemoGridData} />
                        </div>
                    </div>
                    <div className='flex flex-col w-1/5 mr-10'>
                    </div>
                </div>
            )}
            </div>
        </div>        
    );
    }

    

    if(width <= breakpoints.md){
        return(
            <div className='flex flex-col mx-4 mt-4 font-connection text-white'>
                <div className='flex flex-row justify-between mx-2 gap-2'>
                    <button className='text-xs text-black bg-lightgrey mr-auto border-2 border-darkgrey py-2 px-2 w-28 text-center'
                        onClick={() => setToggleMobileSideBar(true)}
                        disabled={selectedPixels.length ===0}
                        hidden={selectedPixels.length ===0}
                    >
                        Selection {selectedPixels.length > 0 ? `(${selectedPixels.length}/32)` : ''}
                    </button>
                    
                    <button className='text-xs text-black bg-lightgrey ml-auto border-2 border-darkgrey py-2 px-2 w-28 text-center'
                        onClick={() => setToggleMobilePortfolio(true)}
                        disabled={!isConnected}
                        hidden={!isConnected}
                    >
                        Portfolio
                    </button>
                </div>
                    
                    <div className='flex items-center justify-center mt-4'>
                        <MobileArtGrid grid={pixels} priceFilterFlag={priceFilterFlag} priceFilterValue={priceFilterValue} setMobileHighlightPixel={setMobileHighlightPixel} />
                    </div>
                    <div className='flex flex-row justify-between items-center mx-2 text-lightgrey font-connection text-sm border-2 border-darkgrey mt-2 mb-1 py-2 px-2'>
                        <span className='w-1/2' >pixel price filter</span>
                        <div className='flex flex-row justify-center items-center w-1/2'>
                            <input className='w-20 text-center bg-inherit hide-arrows-number-input' type="number" value={priceFilterValue} onChange={(e) => handlePriceInput(e)} placeholder="price (ETH)"/>
                            <button
                                className='ml-auto'
                                onClick={() => handlePriceFilterToggle()}
                            >
                                {priceFilterFlag ?
                                    <svg className="ml-auto h-[20px] w-[20px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"> <path d="M5 3H3v18h18V3H5zm0 2h14v14H5V5zm4 7H7v2h2v2h2v-2h2v-2h2v-2h2V8h-2v2h-2v2h-2v2H9v-2z" fill="currentColor"/> </svg>
                                :
                                    <svg className="ml-auto h-[20px] w-[20px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"> <path d="M3 3h18v18H3V3zm16 16V5H5v14h14z" fill="currentColor"/> </svg>
                                }
                            </button>
                        </div>
                    </div>
                    <div className='flex flex-row justify-between items-center mx-2 text-lightgrey font-connection text-sm border-2 border-darkgrey mt-1 mb-2 py-2 px-2'>
                        <span className='w-3/5' >pixel search</span>
                        <div className='flex flex-row justify-center items-center'>
                            <input className='w-20 text-center bg-inherit hide-arrows-number-input' type="number" value={searchInputX} onChange={(e) => handleInputX(e)} min="0" max="63" placeholder="X: 0-63"/>
                            <span className='text-darkgrey text-md'> x </span>
                            <input className='w-20 text-center bg-inherit hide-arrows-number-input' type="number" value={searchInputY} onChange={(e) => handleInputY(e)} min="0" max="63" placeholder="Y: 0-63"/>
                        </div>
                        <button
                            className='w-2/5'
                            onClick={() => handleSerachClick()}
                            
                        >
                            <svg className="ml-auto h-[16px] w-[16px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                <path d="M6 2h8v2H6V2zM4 6V4h2v2H4zm0 8H2V6h2v8zm2 2H4v-2h2v2zm8 0v2H6v-2h8zm2-2h-2v2h2v2h2v2h2v2h2v-2h-2v-2h-2v-2h-2v-2zm0-8h2v8h-2V6zm0 0V4h-2v2h2z" fill="currentColor"/>
                            </svg>
                        </button>
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
                    <div className='flex flex-row items-center justify-center mx-4 mb-12'>
                        <button className='text-xs text-black bg-lightgrey border-2 border-darkgrey py-3 px-2 w-[80%] flex items-center justify-between'
                            onClick={() => handlePixelClick(currentPixel)}
                        >
                            <span>
                                Add Pixel to Selection
                            </span>
                            <svg className="ml-auto h-[16px] w-[16px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                <path d="M4 11v2h12v2h2v-2h2v-2h-2V9h-2v2H4zm10-4h2v2h-2V7zm0 0h-2V5h2v2zm0 10h2v-2h-2v2zm0 0h-2v2h2v-2z" fill="currentColor"/>
                            </svg>    
                        </button>
                    </div>
                    {selectedPixels.length >0 && (
                    <>
                        <AnimatePresence>
                            {toggleMobileSideBar && (
                            <motion.div
                                initial={{ x: '-100%' }}
                                animate={{ x: 0 }}
                                exit={{ x: '-100%' }}
                                transition={{ type: 'Inertia', duration: 0.2 }}
                                className="fixed top-0 left-0 w-4/5 h-full bg-black z-50"
                            >
                                <div className="h-full bg-offblack">
                                    <SideBar isOpen={toggleMobileSideBar} onClose={handleCloseMobileSideBar} selectedPixels={selectedPixels} removePixel={removePixel} setSelectedPixels={setSelectedPixels}/>
                                </div>
                            </motion.div>
                            )}
                        </AnimatePresence>
                    </>
                    )}
                    {isConnected && (
                    <>
                        <AnimatePresence>
                            {toggleMobilePortfolio && (
                            <motion.div
                                initial={{ x: '+100%' }}
                                animate={{ x: 0 }}
                                exit={{ x: '+100%' }}
                                transition={{ type: 'Inertia', duration: 0.2 }}
                                className="fixed top-0 left-0 w-full h-full bg-black z-50 overflow-y-auto"
                            >
                                <div className="h-full bg-black">
                                    <MobilePortfolio isOpen={toggleMobilePortfolio} onClose={handleCloseMobilePortfolio} />
                                </div>
                            </motion.div>
                            )}
                        </AnimatePresence>
                    </>
                    )}
                    
                    <div className=''>
                        <CanvasArtists pixels={pixels}/>
                    </div>
            </div>
        );
    }
};

export default Canvas;