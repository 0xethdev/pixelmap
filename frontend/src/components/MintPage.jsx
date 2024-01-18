import { useState, useEffect, useContext } from 'react'
import { useAccount, useContractWrite } from 'wagmi'
import PixelContext from './PixelContext'
import PeriodContext from './PeriodContext'
import { createShape } from '../assets/gridShapes';

const truncateAddress = (address) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};


const MintPage = () => {
    const { isConnected, address } = useAccount();
    const { pixels } = useContext(PixelContext);
    const [userAlreadyVoted, setUserAlreadyVoted] = useState(false);
    const [showGallery, setShowGallery] = useState(false);
    const { currentPeriodisArt, cycleEndTime } = useContext(PeriodContext);
    const [timeLeft, setTimeLeft] = useState('');
    
    const squareSize = 5; // Size of each square
    const gap = 1; // Gap between squares

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
                    <div className='flex flex-row mt-4 justify-between font-connection gap-4'>
                        <div className='flex flex-col items-center w-1/2 h-full'>
                            <div className='text-center text-white text-md border-2 border-darkgrey p-2'>
                                <p className="text-sm border-b-2 p-1 border-darkgrey">Voting Period currently Open</p>
                                <p className="text-sm p-1 ">closes in {timeLeft}</p>
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
                                            onClick={() => console.log('cancelling')}
                                        >
                                            <span>
                                                No - don't mint
                                            </span>
                                            <svg className="ml-auto h-[16px] w-[16px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                                <path d="M5 5h2v2H5V5zm4 4H7V7h2v2zm2 2H9V9h2v2zm2 0h-2v2H9v2H7v2H5v2h2v-2h2v-2h2v-2h2v2h2v2h2v2h2v-2h-2v-2h-2v-2h-2v-2zm2-2v2h-2V9h2zm2-2v2h-2V7h2zm0 0V5h2v2h-2z" fill="currentColor"/>
                                            </svg>
                                        </button>
                                        <button className='text-xs text-black bg-lightgrey border-2 border-darkgrey hover:border-lightgrey py-1 px-2 w-full flex items-center justify-between' 
                                            onClick={() => console.log('approving')}
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
                            <div className='flex flex-col text-white text-xs bg-offblack border-2 border-darkgrey mt-6 w-full'>
                                <div className='flex flex-row items-center justify-between p-2 border-b-2 border-darkgrey'>
                                    <div className='flex flex-1 justify-start text-left'>Total Casted Votes</div>
                                    <div className='flex flex-1 justify-end text-right'>566</div>
                                </div>
                                <div className='flex flex-row bg-lightgrey text-black items-center justify-between p-2 border-b-2 border-darkgrey'>
                                    <div className='flex flex-1 justify-start text-left'>Yes Votes:</div>
                                    <div className='flex flex-1 justify-end text-right'>324 | 33%</div>
                                </div>
                                <div className='flex flex-row bg-black text-lightgrey items-center justify-between p-2 border-b-2 border-darkgrey'>
                                    <div className='flex flex-1 justify-start text-left'>No Votes:</div>
                                    <div className='flex flex-1 justify-end text-right'>234 | 57%</div>
                                </div>
                                <div className='flex flex-row items-center justify-between p-2 border-darkgrey'>
                                    <div className='flex flex-1 justify-start text-left'>As per current votes, pixels owner decide to mint the NFT</div>
                                </div>
                                
                            </div>
                        </div>
                        <div className='flex flex-col items-right w-1/2'>
                            <svg width="520" height="520" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 520">
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