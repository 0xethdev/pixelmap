import React, { createContext, useState, useEffect } from 'react';
import { useContractEvent } from 'wagmi'
import { readContract } from '@wagmi/core';
import Pixelmap from '../artifacts/contracts/Pixelmap.sol/Pixelmap.json';
import contractAddr from '../hooks/contractAddr';

const PixelContext = createContext();
const BATCH_SIZE = 32;

export const PixelProvider = ({ children }) => {
    const [pixels, setPixels] = useState(Array(64 * 64).fill({ color: '#ffffff' }));
    const [updatedPixels, setUpdatedPixels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [progress, setProgress] = useState(0);
    let progressCounter = 0;

    const handlePixelChange = (event) => {
        const uniqueKeys = new Set();
        const uniqueXYPairs = [];

        event.forEach(item => {
            const { x, y } = item.args;
            const key = `${x}:${y}`;

            if (!uniqueKeys.has(key)) {
                uniqueKeys.add(key);
                uniqueXYPairs.push({ x, y });
            }
        })
        setUpdatedPixels(uniqueXYPairs);
    };

    useContractEvent({
        address: contractAddr,
        abi: Pixelmap.abi,
        eventName: 'PixelBought',
        listener:handlePixelChange,
    })
    useContractEvent({
        address: contractAddr,
        abi: Pixelmap.abi,
        eventName: 'PixelFilled',
        listener:handlePixelChange,
    })
    useContractEvent({
        address: contractAddr,
        abi: Pixelmap.abi,
        eventName: 'PixelValueSet',
        listener:handlePixelChange,
    })
    useContractEvent({
        address: contractAddr,
        abi: Pixelmap.abi,
        eventName: 'RoyaltiesPaid',
        listener:handlePixelChange,
    })

    const fetchBatch = async (xValues, yValues) => {
        //const startTime = performance.now();  // Start time for the batch fetch

        const pixelBatch = await readContract({
            address: contractAddr,
            abi: Pixelmap.abi,
            functionName: 'checkMultiplePixel',
            args: [xValues, yValues],
        });

        //const endTime = performance.now();  // End time for the batch fetch
        //console.log(`Time taken to fetch batch: ${endTime - startTime}ms`);

        return pixelBatch.map((pixelInfo, index) => ({
            ...pixelInfo,
            color: pixelInfo.color === '' ? '#ffffff' : pixelInfo.color,
            x: xValues[index % BATCH_SIZE],
            y: yValues[Math.floor(index / BATCH_SIZE)]
        }));

    };

    const fetchPixelData = async () => {
        console.log('starting to fetch data from blockchain...');
        const overallStartTime = performance.now();  // Start time for the entire fetch
        setLoading(true);
        let counter = 0;
        const allPixels = [];

        for (let y = 0; y < 64; y++) {
            const yValues = Array(BATCH_SIZE).fill(y);

            for (let x = 0; x < 64; x += BATCH_SIZE) {
                console.log('progress %',progress*100)
                const xValues = Array.from({ length: Math.min(BATCH_SIZE, 64 - x) }, (_, i) => x + i);
                const pixelBatch = await fetchBatch(xValues, yValues);
                //console.log(pixelBatch);
                allPixels.push(...pixelBatch);
                progressCounter += pixelBatch.length;
                setProgress(progressCounter/4096 *100);
            }
        }

        // Sort allPixels based on their coordinates (x, y) before setting them to state
        allPixels.sort((a, b) => (a.y * 64 + a.x) - (b.y * 64 + b.x));

        const allPixelsStringified = allPixels.map(pixel => ({
            ...pixel,
            shapeID: pixel.shapeID.toString(),
            price: pixel.price.toString(),
            royaltyLastPaid: pixel.royaltyLastPaid.toString(),
            royaltyAskDate: pixel.royaltyAskDate.toString(),
        }));
        sessionStorage.setItem('pixelData', JSON.stringify(allPixelsStringified));
        //console.log(allPixels);
        setPixels(allPixels);
        setLoading(false);

        const overallEndTime = performance.now();  // End time for the entire fetch
        console.log(`Total time taken to fetch all pixels: ${overallEndTime - overallStartTime}ms`);
    };

    useEffect(() => {
        const cachedPixels = sessionStorage.getItem('pixelData');
        if (cachedPixels) {
            setPixels(JSON.parse(cachedPixels));  // Use cached data
            setLoading(false);
            progressCounter = 0;
            setProgress(0);
        } else {
            fetchPixelData();  // Fetch data if not in cache
        }
    }, []);

    const value = {
        pixels,
        setPixels,
        updatedPixels,
        setUpdatedPixels,
        loading,
        progress
    };

    return <PixelContext.Provider value={value}>{children}</PixelContext.Provider>;
};

export default PixelContext;
