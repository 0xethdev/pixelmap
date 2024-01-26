import { useState, useEffect } from 'react'
import { fetchEnsName, readContract } from '@wagmi/core'
import Pixelmap from '../../src/artifacts/contracts/Pixelmap.sol/Pixelmap.json';
import contractAddr from '../hooks/contractAddr';

const truncateAddress = (address) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

const CanvasArtists = ({ pixels }) => {
    const [oneArtist, setOneArtist] = useState('[generating signature....]');
    const [ownerNames, setOwnerNames] = useState({});

    useEffect(() => {
        const fetchArtistMerkleTree = async () => {
            console.log('fetching merkle tree...')
            const fetchedRoot= await readContract({
                address: contractAddr,
                abi: Pixelmap.abi,
                functionName: 'generateMerkle',
                args:[],
            });
            setOneArtist(fetchedRoot);
        }
        fetchArtistMerkleTree();

        {/* 
        const fetchOwnerNames = async () => {
            const names = {};
            for (const pixel of pixels) {
                const ensName = await fetchEnsName({ address: pixel.owner });
                names[pixel.owner] = ensName || truncateAddress(pixel.owner);
            }
            setOwnerNames(names);
        };
        fetchOwnerNames();
        */}

    }, [pixels]);


  
    return (
        <div className="container">
                <div className="fixed bottom-0 left-0 w-full h-24 bg-gradient-to-t from-black to-transparent z-20"></div>
                <div className="flex flex-row justify-center items-center text-center font-connection text-offblack text-xs p-2 border-t-2 border-b-2 border-offblack ">
                    this artwork is being created by all the below artists who together will sign the canvas as {oneArtist}
                </div>

                <div className="text-offblack text-center font-connection text-xs grid grid-cols-8 gap-1 p-1 mb-24">
                    {pixels.map((pixel, i)  => (
                    <div key={i} className="p-1">
                        {/* {ownerNames[pixel.owner] || 'Loading...'} */}
                        {truncateAddress(pixel.owner)}
                    </div>
                    ))}
                </div>
            
        </div>
      );
}

export default CanvasArtists;