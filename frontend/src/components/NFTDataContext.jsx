import React, { createContext, useState, useEffect } from 'react';
import { readContract } from '@wagmi/core';
import CanvasCollection from '../../src/artifacts/contracts/CanvasCollection.sol/CanvasCollection.json';
import nftContractAddr from '../hooks/nftContractAddr';

export const NFTDataContext = createContext();

export const NFTDataProvider = ({ children }) => {
    const [totalSupply, setTotalSupply] = useState(0);
    const [nftData, setNftData] = useState([]);

    const fetchNFTData = async () => {
        const totalSupplyFetched = await readContract({
            address: nftContractAddr,
            abi: CanvasCollection.abi,
            functionName: 'totalSupply',
        });
        setTotalSupply(Number(totalSupplyFetched));

        if(Number(totalSupplyFetched) > 0 ){
            let allNFTs = [];
            for (let i = 0; i < Number(totalSupplyFetched); i++){
                const tokenURIFetched = await readContract({
                    address: nftContractAddr,
                    abi: CanvasCollection.abi,
                    functionName: 'tokenURI',
                    args:[i]
                });
                const json = atob(tokenURIFetched.substring(29));
                const result = JSON.parse(json);
                let nft = {
                    name: result.name,
                    description: result.description,
                    image:result.image,
                    artist:result.attributes[0].Artist,
                }
                allNFTs.push(nft);
            }
            setNftData(allNFTs);

        }
    };

    useEffect(() => {
        fetchNFTData();
        const interval = setInterval(fetchNFTData, 60000); // Update every minute
        return () => clearInterval(interval);
    }, []);

    return (
        <NFTDataContext.Provider value={{ nftData }}>
            {children}
        </NFTDataContext.Provider>
    );
};

export default NFTDataContext;


{/*
useEffect(() => {
        const storedData = sessionStorage.getItem('nftData');
        if (storedData) {
            setNftData(JSON.parse(storedData));
        } else {
            fetchNFTData().then(data => {
                sessionStorage.setItem('nftData', JSON.stringify(data));
                setNftData(data);
            });
        }
    }, []);

*/}