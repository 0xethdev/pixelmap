import React from 'react';
import { useState, useEffect } from 'react';
import { createShape } from '../assets/gridShapes';
import ColorPicker from './DemoColorPicker';


const DemoCanvas = React.memo(({ grid, setDemoGridData }) => {
    const [selectedPixel, setSelectedPixel] = useState(null);
    const [selectedPixelIndex, setSelectedPixelIndex] = useState('');
    const [selectedColor, setSelectedColor] = useState('#FFFFFF');
    const [selectedShape, setSelectedShape] = useState(0);
    const shapes = [0,1,2,3,4,5,6,7,8,9];

    const squareSize = 8; // Size of each square
    const gap = 1; // Gap between squares

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
    
    const handlePixelSelection = (pixel) => {
        setSelectedPixel(pixel);
        const index = grid.findIndex(obj => obj.x === pixel.x && obj.y === pixel.y);
        setSelectedPixelIndex(index);

        setSelectedColor(pixel.color);
        setSelectedShape(pixel.shapeID);
    };

    const handleColorSelection = (newInput) => {
        setSelectedColor(newInput)
        let updatedDemoGrid = [... grid];
        updatedDemoGrid[selectedPixelIndex].color = newInput;
        setDemoGridData(updatedDemoGrid);
    }

    const handleLeftArrowShape = () => {
        let newShape = selectedShape > 0 ? selectedShape - 1 : 9;
        setSelectedShape(newShape);

        let updatedDemoGrid = [... grid];
        updatedDemoGrid[selectedPixelIndex].shapeID = newShape;
        setDemoGridData(updatedDemoGrid);
    };
    
    const handleRightArrowShape = () => {
        let newShape = selectedShape < 9 ? selectedShape + 1 : 0;
        setSelectedShape(newShape);

        let updatedDemoGrid = [... grid];
        updatedDemoGrid[selectedPixelIndex].shapeID = newShape;
        setDemoGridData(updatedDemoGrid);
    };

    return (
        <div className='flex flex-col items-center'>
            <p className='w-[576px] text-center text-lightgrey font-connection text-xs'>This Demo Grid allows you to test different shapes & colors on all pixels before purchasing them or committing designs to blockchain.</p>
            
            <div className='relative'>
                <div className='flex flex-row items-center gap-2'>
                    <svg width="600" height="600" className="canvas-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600">
                        {grid.map((pixel, i) => {
                            
                            const x = (i % 64) * (squareSize + gap)+12; 
                            const y = Math.floor(i / 64) * (squareSize + gap)+12;

                            return createShape(i, Number(pixel.shapeID), squareSize, squareSize, x, y, pixel.color, pixel, null, handlePixelSelection, null, null, null);
                        })}
                    </svg>
                    <div className='flex flex-col w-1/2'>
                        <ColorPicker
                            pixelColor={selectedPixel? selectedPixel.color: '#FFFFFF'}
                            onSelect={handleColorSelection}
                        />
                        <div className='flex flex-row mt-4 justify-around px-4 bg-black border-2 border-darkgrey font-connection'>
                        {selectedPixel ? (
                            <div className='flex flex-row justify-between w-full py-2'>
                                <div className='flex flex-row items-center justify-start w-1/3'>
                                    <p className='text-lg text-white'>{selectedPixel.x} <span className='text-darkgrey text-xl'>x</span> {selectedPixel.y}</p>
                                </div>
                                
                                <div className='w-1/3'>
                                    <div className='flex justify-center items-center gap-3'>
                                        <button className='w-[24px]' onClick={() => handleLeftArrowShape()}>
                                            <svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"> <path d="M16 5v2h-2V5h2zm-4 4V7h2v2h-2zm-2 2V9h2v2h-2zm0 2H8v-2h2v2zm2 2v-2h-2v2h2zm0 0h2v2h-2v-2zm4 4v-2h-2v2h2z" fill='#EBEBEB'/> </svg>
                                        </button>
                                        {renderShape(shapes[selectedShape], '#FFFFFF')}
                                        <button className='w-[24px]' onClick={() => handleRightArrowShape()}>
                                            <svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"> <path d="M8 5v2h2V5H8zm4 4V7h-2v2h2zm2 2V9h-2v2h2zm0 2h2v-2h-2v2zm-2 2v-2h2v2h-2zm0 0h-2v2h2v-2zm-4 4v-2h2v2H8z" fill='#EBEBEB'/> </svg>
                                        </button>
                                    </div>
                                </div>
                                
                                <div className='flex flex-row w-1/3 justify-end items-center'>
                                    {renderShape(Number(selectedPixel.shapeID), selectedPixel.color)}
                                </div>                                
                            </div>
                            ) : (
                            <div className='flex items-center flex-col justify-center h-full text-darkgrey'>
                                <p>select a pixel to change its color & shape</p>
                            </div>
                            )}
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
});

export default DemoCanvas;
