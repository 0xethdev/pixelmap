import { useState, useEffect } from 'react';
import { HexColorPicker, HexColorInput } from 'react-colorful';

const ColorPicker = ({ onSelect, onClose }) => {
    const colors = ['#E84AA9', '#F2399D', '#DB2F96', '#E73E85', '#FF7F8E', '#FA5B67', '#E8424E', '#D5332F', '#C23532', '#F2281C', '#D41515', '#9D262F', '#DE3237', '#DA3321', '#EA3A2D', '#EB4429', '#EC7368', '#FF8079', '#FF9193', '#EA5B33', '#D05C35', '#ED7C30', '#EF9933', '#EF8C37', '#F18930', '#F09837', '#F9A45C', '#F2A43A', '#F2A840', '#F2A93C', '#FFB340', '#F2B341', '#FAD064', '#F7CA57', '#F6CB45', '#FFAB00', '#F4C44A', '#FCDE5B', '#F9DA4D', '#F9DA4A', '#FAE272', '#F9DB49', '#FAE663', '#FBEA5B', '#A7CA45', '#B5F13B', '#94E337', '#63C23C', '#86E48E', '#77E39F', '#5FCD8C', '#83F1AE', '#9DEFBF', '#2E9D9A', '#3EB8A1', '#5FC9BF', '#77D3DE', '#6AD1DE', '#5ABAD3', '#4291A8', '#33758D', '#45B2D3', '#81D1EC', '#A7DDF9', '#9AD9FB', '#A4C8EE', '#60B1F4', '#2480BD', '#4576D0', '#3263D0', '#2E4985', '#25438C', '#525EAA', '#3D43B3', '#322F92', '#4A2387', '#371471', '#3B088C', '#6C31D7', '#9741DA'];
    const [color, setColor] = useState("#b32aa9");

    const handleConfirmation = () => {
        onSelect(color);
    }

    return (
        <div className='flex flex-col bg-offblack text-white font-connection'>
            <div className='flex flex-row justify-between items-center p-2 border-t-2 border-darkgrey'>
                <div className='flex flex-col'>
                    <HexColorPicker color={color} onChange={setColor} className='custom-layout'/>
                </div>
                <div className='grid grid-cols-8 gap-1'>
                    {colors.map((item, index) => (
                        <button 
                            key={index}
                            style={{ backgroundColor: item }}
                            className='w-4 h-4'
                            onClick={() => setColor(item)}
                        />
                    ))}
                </div>
            </div>
            <div className='flex flex-row justify-between p-2'>
                <p className='text-xs w-1/2'>hex code:</p>
                <HexColorInput color={color} onChange={setColor} prefixed='true' className='w-1/2 text-white text-end bg-offblack font-connection text-xs'/>
            </div>
            <div className='flex flex-row justify-between gap-2 items-center pt-2 px-2 border-t-2 border-darkgrey'>
                <button className='text-xs bg-black text-lightgrey border-darkgrey hover:border-black border-2 py-1 px-2 w-full flex items-center justify-between'
                    onClick={onClose}
                >
                    <span>
                        Back
                    </span>
                    <svg className="ml-auto h-[16px] w-[16px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <path d="M5 5h2v2H5V5zm4 4H7V7h2v2zm2 2H9V9h2v2zm2 0h-2v2H9v2H7v2H5v2h2v-2h2v-2h2v-2h2v2h2v2h2v2h2v-2h-2v-2h-2v-2h-2v-2zm2-2v2h-2V9h2zm2-2v2h-2V7h2zm0 0V5h2v2h-2z" fill="currentColor"/>
                    </svg>
                </button>
                <button className='text-xs text-black bg-lightgrey border-2 border-darkgrey hover:border-lightgrey py-1 px-2 w-full flex items-center justify-between'                 
                    onClick={handleConfirmation}
                >
                    <span>
                        Confirm Color
                    </span>        
                    <svg className="ml-auto h-[16px] w-[16px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <path d="M18 6h2v2h-2V6zm-2 4V8h2v2h-2zm-2 2v-2h2v2h-2zm-2 2h2v-2h-2v2zm-2 2h2v-2h-2v2zm-2 0v2h2v-2H8zm-2-2h2v2H6v-2zm0 0H4v-2h2v2z" fill="currentColor"/>
                    </svg>
                </button>
            </div>
        </div>
    );
}

export default ColorPicker;

