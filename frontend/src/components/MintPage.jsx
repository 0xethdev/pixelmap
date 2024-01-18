import { useState, useEffect, useContext } from 'react'
import { useAccount, useContractWrite } from 'wagmi'
import { readContract } from '@wagmi/core';
import PixelContext from './PixelContext'
import PeriodContext from './PeriodContext'
import { createShape } from '../assets/gridShapes';
import Pixelmap from '../../src/artifacts/contracts/Pixelmap.sol/Pixelmap.json';
import contractAddr from '../hooks/contractAddr';

const truncateAddress = (address) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};


const MintPage = ({ setInitialLoading }) => {
    const [updateResults, setUpdateResults] = useState(true);
    const { isConnected, address } = useAccount();
    const { pixels, loading } = useContext(PixelContext);
    const [userAlreadyVoted, setUserAlreadyVoted] = useState(false);
    const [showGallery, setShowGallery] = useState(false);
    const { currentPeriodisArt, cycleEndTime, currentCycleNr } = useContext(PeriodContext);
    const [timeLeft, setTimeLeft] = useState('');
    const [yesVotes, setYesVotes] = useState(0);
    const [noVotes, setNoVotes] = useState(0);
    const [totalVotes, setTotalVotes] = useState(0);
    
    const squareSize = 5; // Size of each square
    const gap = 1; // Gap between squares

    useEffect(() => {
        setInitialLoading(loading);        
    }, [loading, setInitialLoading]);

    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date();
            const endTime = new Date(cycleEndTime*1000);
            const difference = endTime - now;

            let timeLeft = '';

            if (difference > 0) {
                const days = Math.floor(difference / (1000 * 60 * 60 * 24));
                const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
                const minutes = Math.floor((difference / 1000 / 60) % 60);
                timeLeft = `${days}D : ${hours}H : ${minutes}M`;
            }
            return timeLeft;
        };

        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, [cycleEndTime]);


    useEffect(() => {

        const retrieveCurrentVote = async (voteCycle) => {
            const currentVote = await readContract({
                address: contractAddr,
                abi: Pixelmap.abi,
                functionName: 'voteRegister',
                args:[voteCycle],
            });
            setYesVotes(Number(currentVote[0]));
            setNoVotes(Number(currentVote[1]));
            setTotalVotes(Number(currentVote[0]) + Number(currentVote[1]));
        }
        

        const retrieveUserVoted = async () => {
            const hasVoted = await readContract({
                address: contractAddr,
                abi: Pixelmap.abi,
                functionName: 'hasVoted',
                args:[address],
            });
            setUserAlreadyVoted(hasVoted)
            
        }

        if(updateResults){
            retrieveCurrentVote(currentCycleNr);
            retrieveUserVoted();
            setUpdateResults(false);
        }

    },[updateResults, yesVotes, noVotes, totalVotes]);


    /// HANDLE VOTING FUNCTION  
    const { isLoading:voteLoad, write: castVote } = useContractWrite({
        address: contractAddr,
        abi: Pixelmap.abi,
        functionName: 'castVote',
        onSuccess(){
            console.log('vote casted');
            setUpdateResults(true);
        }
    });
    async function handleVoting(vote) {        
        await castVote({ args: [vote] });      
    }

    return (
        <div className='container'>
            <div className='flex flex-col items-center mt-2'>
                <div className='flex flex-row justify-between items-center font-connection'>
                    <button className='bg-offblack text-white text-sm px-2 py-1 border-t-2 border-b-2 border-l-2 border-r-2 border-darkgrey w-24'
                    onClick={() => setShowGallery(false)}    
                    >
                        Voting
                    </button>
                    <button className='bg-offblack text-white text-sm px-2 py-1 border-t-2 border-b-2 border-r-2 border-l-2 border-darkgrey w-24'
                    onClick={() => setShowGallery(true)}    
                    >
                        Gallery
                    </button>

                </div>

            {showGallery ?
                <div>
                    Gallery
                </div>
            :
                <div>
                    {currentPeriodisArt ? 
                    <div className="text-center text-white font-connection text-md p-4">
                        <p>Voting is currently closed, please come back when Artistic Period has ended.</p>
                        <p>In the meantime, feel free to check out the Gallery.</p>
                    </div>
                    :
                    <div className='flex flex-row mt-4 justify-between items-center font-connection gap-4'>
                        <div className='flex flex-col justify-center w-1/2 h-full'>
                        <div className='p-1 flex flex-row items-center w-full text-black font-connection text-xs border-2 border-darkgrey bg-offblack'>
                            <div className='flex flex-col items-center w-1/3 border-r-2 border-darkgrey'>
                                <div>Yes Votes</div>
                                <div className='text-sm text-lightgrey'>{yesVotes} | {totalVotes > 0 ? yesVotes/totalVotes *100 : 0}%</div>
                            </div>
                            <div className='flex flex-col items-center w-1/3 border-r-2 border-darkgrey'>
                                <div>Total Casted Votes</div>
                                <div className='text-sm text-lightgrey'>{totalVotes}</div>
                            </div>
                            <div className='flex flex-col items-center w-1/3'>
                                <div>No Votes</div>
                                <div className='text-sm text-lightgrey'>{noVotes} | {totalVotes > 0 ? noVotes/totalVotes *100 : 0}%</div>
                            </div>
                        </div> 
                        <div className='p-1 flex flex-row justify-center items-center w-full px-2 text-lightgrey font-connection text-sm border-b-2 border-r-2 border-l-2 border-darkgrey bg-offblack'>
                            <div className='flex flex-1 justify-start text-left'>Vote Closes</div>
                            <div className='flex flex-1 justify-end text-right'>{timeLeft}</div>
                        </div>
                        
                            {isConnected && (
                                <div className='text-left text-white text-md mt-6'>
                                    {!userAlreadyVoted ?
                                        <div className='bg-offblack text-xs border-darkgrey p-2 border-2'>
                                            <p className='mb-1'><span className='border-b-2 border-lightgrey'>{truncateAddress(address)}</span>, do you think this period's canvas should be minted as NFT?</p>
                                            <p>you currently own 506 pixels - your vote will count for 506/4096 possible votes (4.5%)</p>
                                        </div>    
                                    :
                                        <p className='bg-offblack text-xs border-darkgrey p-2 border-2'><span className='border-b-2 border-lightgrey'>{truncateAddress(address)}</span> you have already casted your vote for this canvas.</p> 
                                    }
                                    
                                    {!userAlreadyVoted && (
                                    <div className='flex flex-row justify-between items-center mt-4 gap-1'>
                                        <button className='text-xs bg-black text-lightgrey border-darkgrey hover:bg-darkgrey border-2 py-1 px-2 w-full flex items-center justify-between' 
                                            onClick={() => handleVoting(false)}
                                        >
                                            <span>
                                                No - don't mint
                                            </span>
                                            <svg className="ml-auto h-[16px] w-[16px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                                <path d="M5 5h2v2H5V5zm4 4H7V7h2v2zm2 2H9V9h2v2zm2 0h-2v2H9v2H7v2H5v2h2v-2h2v-2h2v-2h2v2h2v2h2v2h2v-2h-2v-2h-2v-2h-2v-2zm2-2v2h-2V9h2zm2-2v2h-2V7h2zm0 0V5h2v2h-2z" fill="currentColor"/>
                                            </svg>
                                        </button>
                                        <button className='text-xs text-black bg-lightgrey border-2 border-darkgrey hover:border-lightgrey py-1 px-2 w-full flex items-center justify-between' 
                                            onClick={() => handleVoting(true)}
                                        >
                                            <span>
                                                Yes - mint
                                            </span>
                                            <svg className="ml-auto h-[16px] w-[16px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                                <path d="M18 6h2v2h-2V6zm-2 4V8h2v2h-2zm-2 2v-2h2v2h-2zm-2 2h2v-2h-2v2zm-2 2h2v-2h-2v2zm-2 0v2h2v-2H8zm-2-2h2v2H6v-2zm0 0H4v-2h2v2z" fill="currentColor"/>
                                            </svg>
                                        </button>
                                    </div>
                                    )}
                                </div>
                            )}
                            {!isConnected && (
                                <div className='text-left text-white text-md mt-20'>    
                                    <div className='text-xs p-2'>
                                        <p>If you are a pixel owner, please connect wallet to vote</p>
                                    </div>    
                                </div>
                            )}
                        </div>
                        <div className='flex justify-center items-center w-1/2 h-full'>        
                                <svg className='border-2 border-darkgrey' width="392" height="392" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 392 392">
                                    {pixels.map((pixel, i) => {
                                        const x = (i % 64) * (squareSize + gap)+4; 
                                        const y = Math.floor(i / 64) * (squareSize + gap)+4;
                                        return createShape(i, Number(pixel.shapeID), squareSize, squareSize, x, y, pixel.color, pixel);
                                    })}
                                </svg>
                        </div>
                    </div>
                    }
                </div>
            }
            </div>
        </div>
    )
}

export default MintPage


{/*

<svg width="520" height="520" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 520">
                                    {pixels.map((pixel, i) => {
                                        const x = (i % 64) * (squareSize + gap)+4; 
                                        const y = Math.floor(i / 64) * (squareSize + gap)+4;
                                        return createShape(i, Number(pixel.shapeID), squareSize, squareSize, x, y, pixel.color, pixel);
                                    })}
                                </svg>



*/}