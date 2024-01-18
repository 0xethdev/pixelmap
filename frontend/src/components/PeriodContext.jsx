import React, { createContext, useState, useEffect } from 'react';
import { readContract } from '@wagmi/core';
import Pixelmap from '../artifacts/contracts/Pixelmap.sol/Pixelmap.json';
import contractAddr from '../hooks/contractAddr';

const PeriodContext = createContext();

export const PeriodProvider = ({ children }) => {
    const [currentPeriodisArt, setCurrentPeriod] = useState(true);
    const [currentCycleNr, setCurrentCycleNr] = useState(0);
    const [cycleEndTime, setCycleEndTime] = useState(0);

    const fetchCurrentPeriod = async () => {
        const isInArtistic = await readContract({
            address: contractAddr,
            abi: Pixelmap.abi,
            functionName: 'isInArtisticPeriod',
        });

        setCurrentPeriod(isInArtistic);

        const cycleperiod = await readContract({
            address: contractAddr,
            abi: Pixelmap.abi,
            functionName: 'CYCLE_PERIOD',
        });

        setCurrentCycleNr(Number(cycleperiod))

        const canvasCreation = await readContract({
            address: contractAddr,
            abi: Pixelmap.abi,
            functionName: 'canvasCreation',
        });

        const currentCycleTime = await readContract({
            address: contractAddr,
            abi: Pixelmap.abi,
            functionName: 'getCurrentCycle',
        });

        const cycleEnd = (Number(currentCycleTime)+1) * Number(cycleperiod) + Number(canvasCreation);
        setCycleEndTime(cycleEnd);
    };

    useEffect(() => {
        fetchCurrentPeriod();
        const interval = setInterval(fetchCurrentPeriod, 30000); // Update every minute
        return () => clearInterval(interval);
    }, []);

    const value = {
        currentPeriodisArt,
        cycleEndTime,
        currentCycleNr
    };

    return <PeriodContext.Provider value={value}>{children}</PeriodContext.Provider>;
};

export default PeriodContext;
