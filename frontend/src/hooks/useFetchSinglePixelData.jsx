import { useContext, useEffect } from 'react';
import PixelContext from '../components/PixelContext';
import { readContract } from '@wagmi/core'
import contractAddr from './contractAddr';
import Pixelmap from '../artifacts/contracts/Pixelmap.sol/Pixelmap.json';

const useFetchSinglePixelData = () => {
    const { pixels, setPixels, updatedPixels, setUpdatedPixels } = useContext(PixelContext);

    useEffect(() => {
        const fetchUpdatedPixelData = async (updatedPixels) => {
            //console.log('updating pixel')
        
            const xValues = updatedPixels.map(pixel => BigInt(pixel.x));
            const yValues = updatedPixels.map(pixel => BigInt(pixel.y));
    
            const fetchedPixelData = await readContract({
                address: contractAddr,
                abi: Pixelmap.abi,
                functionName: 'checkMultiplePixel',
                args: [xValues, yValues],
            });
            const newPixelData = fetchedPixelData.map((pixelInfo, i) => ({
                ...pixelInfo,
                color: pixelInfo.color === '' ? '#ffffff' : pixelInfo.color,
                x: Number(xValues[i]),
                y: Number(yValues[i]),
            }));
    
            // Integrate new data into the existing pixels array
            const newPixels = pixels.map(pixel => {
                const updatedPixel = newPixelData.find(up => up.x === pixel.x && up.y === pixel.y);
                return updatedPixel || pixel; // return updated pixel data or the old one if not updated
            });

            newPixels.sort((a, b) => (a.y * 64 + a.x) - (b.y * 64 + b.x));
            const newPixelsStringified = newPixels.map(pixel => ({
                ...pixel,
                shapeID: pixel.shapeID.toString(),
                price: pixel.price.toString(),
                royaltyLastPaid: pixel.royaltyLastPaid.toString(),
                royaltyAskDate: pixel.royaltyAskDate.toString(),
            }));
            sessionStorage.setItem('pixelData', JSON.stringify(newPixelsStringified));
    
            setPixels(newPixels);
            setUpdatedPixels([]);
        };

        if (updatedPixels.length > 0) {
            fetchUpdatedPixelData(updatedPixels);
            //console.log('finished updating pixels')
        }
    }, [updatedPixels, pixels, setPixels, setUpdatedPixels]);
};

export default useFetchSinglePixelData;
