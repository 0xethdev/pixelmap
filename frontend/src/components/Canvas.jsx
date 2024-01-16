import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Art from './Art';
import DemoCanvas from './DemoCanvas.jsx';
import AnimationGrid from './AnimationGrid';
import SideBar from './Sidebar.jsx'
import PixelContext from './PixelContext.jsx';
import useFetchSinglePixelData from '../hooks/useFetchSinglePixelData.jsx';
import PixelPortfolio from './PixelPortfolio.jsx';
import CanvasArtists from './CanvasArtists.jsx';

const Canvas = ({ setInitialLoading }) => {
    const [filterActive, setFilterActive] = useState(false);
    const [setPixelData, toggleSetPixelData] = useState(false);
    const [tempPixelData, setTempPixelData] = useState([]);
    const { pixels, loading } = useContext(PixelContext);
    const [selectedPixels, setSelectedPixels] = useState([]);
    const [demoCanvas, setDemoCanvas] = useState(false);
    const [demoGridData, setDemoGridData] = useState([]);
    useFetchSinglePixelData();

    

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


    if (loading) {
        return (
            <div className="flex justify-center items-top pt-12 pb-10">
                <AnimationGrid/>
            </div>
        );
    }

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
                        <SideBar selectedPixels={selectedPixels} removePixel={removePixel} setSelectedPixels={setSelectedPixels}/>
                    </div>
                    <div className='flex flex-col w-3/5'>
                        <div className="flex justify-center items-top ">
                            <Art grid={ setPixelData ? tempPixelData : pixels} handlePixelClick={handlePixelClick} filterActive={filterActive} addDragSelectedPixels={addDragSelectedPixels} selectedPixels={selectedPixels}/>
                        </div>
                        
                    </div>
                    <div className='flex flex-col w-1/5 mr-10 mt-10'>
                        <PixelPortfolio 
                            filterActive={filterActive} setFilterActive={setFilterActive}
                            setPixelData={setPixelData} toggleSetPixelData={toggleSetPixelData}
                            tempPixelData={tempPixelData} setTempPixelData={setTempPixelData}
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
};

export default Canvas;
