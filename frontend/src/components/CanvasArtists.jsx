import { useState, useEffect } from 'react'
import { MerkleTree } from 'merkletreejs';
import keccak256 from 'keccak256';
import { fetchEnsName } from '@wagmi/core'


const truncateAddress = (address) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

const CanvasArtists = ({ pixels }) => {
    const [oneArtist, setOneArtist] = useState('');
    const [ownerNames, setOwnerNames] = useState({});

    useEffect(() => {
        const createArtistMerkleTree = (pixels) => {
            const leaves = pixels.map(pixel => keccak256(pixel.owner));
            const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });
            const root = tree.getRoot();
    
            let artistHex = '0x' + root.toString('hex');
            setOneArtist(artistHex);
        }
        createArtistMerkleTree(pixels);

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
