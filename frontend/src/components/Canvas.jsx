import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Art from './Art';
import AnimationGrid from './AnimationGrid';
import SideBar from './Sidebar.jsx'
import PixelContext from './PixelContext.jsx';
import useFetchSinglePixelData from '../hooks/useFetchSinglePixelData.jsx';
import PixelPortfolio from './PixelPortfolio.jsx';

const Canvas = ({ setInitialLoading }) => {
    const [filterActive, setFilterActive] = useState(false);
    const [setPixelData, toggleSetPixelData] = useState(false);
    const [tempPixelData, setTempPixelData] = useState([]);
    const { pixels, loading } = useContext(PixelContext);
    const [selectedPixels, setSelectedPixels] = useState([]);
    useFetchSinglePixelData();

    

    useEffect(() => {
        setInitialLoading(loading);        
    }, [loading, setInitialLoading]);

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
        <div className='flex gap-10 pt-6 pb-10'>
            <div className='flex flex-col w-1/5 ml-10'>
                <SideBar selectedPixels={selectedPixels} removePixel={removePixel} setSelectedPixels={setSelectedPixels}/>
            </div>
            <div className='flex flex-col w-3/5'>
                <div className="flex justify-center items-top ">
                    <Art grid={ setPixelData ? tempPixelData : pixels} handlePixelClick={handlePixelClick} filterActive={filterActive} addDragSelectedPixels={addDragSelectedPixels} selectedPixels={selectedPixels}/>
                </div>
            </div>
            <div className='flex flex-col w-1/5 mr-10'>
                <PixelPortfolio 
                    filterActive={filterActive} setFilterActive={setFilterActive}
                    setPixelData={setPixelData} toggleSetPixelData={toggleSetPixelData}
                    tempPixelData={tempPixelData} setTempPixelData={setTempPixelData}
                    />
            </div>
        </div>
        
    );
};

export default Canvas;
