import { useState, useEffect, useContext } from 'react'
import { useAccount, useContractWrite, useContractEvent } from 'wagmi'
import { readContract } from '@wagmi/core';
import PixelContext from './PixelContext'
import PeriodContext from './PeriodContext'
import NFTDataContext from './NFTDataContext';
import { createShape } from '../assets/gridShapes';
import Pixelmap from '../../src/artifacts/contracts/Pixelmap.sol/Pixelmap.json';
import contractAddr from '../hooks/contractAddr';
import CanvasCollection from '../../src/artifacts/contracts/CanvasCollection.sol/CanvasCollection.json';
import nftContractAddr from '../hooks/nftContractAddr';
import { Utils } from 'alchemy-sdk'
import SpinningLoader from  '../assets/spinningLoader'

const truncateAddress = (address) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

const formatDate = (timestamp) => {
    const date = new Date(Number(timestamp) * 1000);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const day = ("0" + date.getDate()).slice(-2);
    const month = months[date.getMonth()];
    const year = date.getFullYear().toString().slice(-2);
    
    if(day == '01' && month == 'Jan' && year == '70'){
        return 'N/A'
    }else{
        return `${day} ${month} '${year}`;
    }
};

const MintPage = ({ setInitialLoading }) => {
    const [updateResults, setUpdateResults] = useState(true);
    const { isConnected, address } = useAccount();
    const { pixels, loading } = useContext(PixelContext);
    const { nftData } = useContext(NFTDataContext);
    const [userAlreadyVoted, setUserAlreadyVoted] = useState(false);
    const [showGallery, setShowGallery] = useState(false);
    const { currentPeriodisArt, cycleEndTime, currentCycleNr } = useContext(PeriodContext);
    const [timeLeft, setTimeLeft] = useState('');
    const [yesVotes, setYesVotes] = useState(0);
    const [noVotes, setNoVotes] = useState(0);
    const [totalVotes, setTotalVotes] = useState(0);
    const [userBalance, setUserBalance] = useState(0);
    const [loadGallery, setLoadGallery] = useState(true);
    const [galleryID, setGalleryID] = useState(0);
    const [currentOwner, setCurrentOwner] = useState('');
    const [mintDate, setMintDate] = useState(0);
    const [showAuction, setShowAuction] = useState(false);
    const [auctionEnd, setAuctionEnd] = useState(0);
    const [highestBid, setHighestBid] = useState(0);
    const [highestBidder, setHighestBidder] = useState('');
    const [etherBid, setEtherBid] = useState(0);
    const [updateBidResults, setUpdateBidResults] = useState(false);
    const [claimsOwnership, setClaimsOwnership] = useState(0);
    const [claimFlag, setClaimFlag] = useState(false);
    
    const squareSize = 5; // Size of each square
    const gap = 1; // Gap between squares


    const handleLeftArrowShape = () => {
        let currentValue = galleryID;
        let maxValue = nftData.length -1;
        let newValue = currentValue < maxValue ? currentValue + 1 : 0;
        setGalleryID(newValue);
    };
    
    const handleRightArrowShape = () => {
        let currentValue = galleryID;
        let maxValue = nftData.length -1;
        let newValue = currentValue > 0 ? currentValue - 1 : maxValue;
        setGalleryID(newValue);
    
    };

    useEffect(() => {
        if(loadGallery){
            setGalleryID(Math.max(nftData.length -1,0));
            setLoadGallery(false);
        }
    },[])

    useEffect(() => {
        const fetchClaimInfo = async () => {
            const fetchClaim = await readContract({
                address: contractAddr,
                abi: Pixelmap.abi,
                functionName: 'getAuctionClaims',
                args:[galleryID, address]
            });
            setClaimsOwnership(Number(fetchClaim));

            const fetchClaimFlag = await readContract({
                address: contractAddr,
                abi: Pixelmap.abi,
                functionName: 'getAuctionClaimFlag',
                args:[galleryID, address]
            });
            console.log(fetchClaimFlag)
            setClaimFlag(fetchClaimFlag);

            const fetchAuction = await readContract({
                address: contractAddr,
                abi: Pixelmap.abi,
                functionName: 'nftAuctions',
                args:[galleryID]
            });
            setHighestBid(Number(fetchAuction[1]));
            
        }

        if(isConnected && !showAuction){
            fetchClaimInfo();
        }
        

    },[isConnected, showAuction, claimFlag]);

    useEffect(() => {
        const fetchCurrentOwner = async () =>{
            const fetchOwner = await readContract({
                address: nftContractAddr,
                abi: CanvasCollection.abi,
                functionName: 'ownerOf',
                args:[galleryID]
            });
            setCurrentOwner(fetchOwner);
        }
        fetchCurrentOwner();
        
        const fetchMintDate = async () => {
            const fetchedMintDate = await readContract({
                address: contractAddr,
                abi: Pixelmap.abi,
                functionName: 'getMintDate',
                args:[galleryID],
            });
            setMintDate(formatDate(fetchedMintDate));
            
        }
        fetchMintDate();

        const calculateTimeLeft = (endTimeInput) => {
            const now = new Date();
            const endTime = new Date(endTimeInput*1000);
            const difference = endTime - now;

            let timeLeft = '';

            if (difference > 0) {
                const days = Math.floor(difference / (1000 * 60 * 60 * 24));
                const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
                const minutes = Math.floor((difference / 1000 / 60) % 60);
                const sec = Math.floor((difference / 1000) % 60);
                timeLeft = `${days}D : ${hours}H : ${minutes}M : ${sec}s`;
            }
            return timeLeft;
        };
        
        const fetchAuctionInfo = async () =>{
            const fetchAuction = await readContract({
                address: contractAddr,
                abi: Pixelmap.abi,
                functionName: 'nftAuctions',
                args:[galleryID]
            });
            //console.log(fetchAuction);
            setAuctionEnd(calculateTimeLeft(Number(fetchAuction[3])));
            setHighestBid(Number(fetchAuction[1]));
            setHighestBidder(fetchAuction[0]);
            setShowAuction(!fetchAuction[4]);
        }

        if(galleryID == nftData.length-1){
            const timer = setInterval(() => {
                setTimeLeft(fetchAuctionInfo());
            }, 1000);
            return () => clearInterval(timer);
        }else{
            setShowAuction(false);
        }

        if(updateBidResults){
            fetchAuctionInfo();
            setUpdateBidResults(false);
        }

    },[showGallery, currentOwner, mintDate, galleryID, updateBidResults]);


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

        const balanceOfUser = async () => {
            const balance = await readContract({
                address: contractAddr,
                abi: Pixelmap.abi,
                functionName: 'balanceOf',
                args:[address],
            });
            setUserBalance(Number(balance))
        }

        if(updateResults){
            retrieveCurrentVote(currentCycleNr);
            retrieveUserVoted();
            balanceOfUser();
            setUpdateResults(false);
        }
        

    },[updateResults, yesVotes, noVotes, totalVotes, userBalance, isConnected, showGallery]);

    /// HANDLE VOTING FUNCTION  
    const { isLoading:voteLoad, write: castVote } = useContractWrite({
        address: contractAddr,
        abi: Pixelmap.abi,
        functionName: 'castVote',
        onSuccess(){
            setUpdateResults(true);
        }
    });
    async function handleVoting(vote) {        
        await castVote({ args: [vote] });      
    }

    const handleVotingEvent = (event) => {
        setUpdateResults(true);
    };

    useContractEvent({
        address: contractAddr,
        abi: Pixelmap.abi,
        eventName: 'VoteCasted',
        listener:handleVotingEvent,
    });

    /// HANDLE BIDDING FUNCTION
    const handlePriceChange = (e) => {
        const newValue = e.target.value;
        if (newValue === '' || (/^\d*\.?\d{0,4}$/.test(newValue) && Number(newValue) >= 0)) {
            setEtherBid(newValue);
        }
      };


    const { isLoading:bidLoad, write: placeBid } = useContractWrite({
        address: contractAddr,
        abi: Pixelmap.abi,
        functionName: 'placeBid',
        onSuccess(){
            setUpdateBidResults(true);
        }
    });
    async function handleBidding() {        
        if(etherBid > 0){
            await placeBid({ args: [galleryID], value: Utils.parseEther(etherBid) });
        }
    }

    const handleBiddingEvent = (event) => {
        setUpdateBidResults(true);
    };

    useContractEvent({
        address: contractAddr,
        abi: Pixelmap.abi,
        eventName: 'BidPlace',
        listener:handleBiddingEvent,
    })

    /// HANDLE CLAIM FUNCTION
    const { isLoading:claimLoad, write: proceedClaim } = useContractWrite({
        address: contractAddr,
        abi: Pixelmap.abi,
        functionName: 'withdrawPixelProceeds',
        onSuccess(){
            setClaimFlag(true);
        }
    });
    async function handleClaim() {        
        await proceedClaim({ args: [galleryID] });
        
    }

    return (
        <div className='container'>
            <div className='flex flex-col items-center mt-2'>
                <div className='flex flex-row justify-between items-center font-connection gap-2'>
                    <button className='flex flex-row justify-between items-center bg-offblack text-white text-sm px-2 py-1 border-t-2 border-b-2 border-l-2 border-r-2 border-darkgrey w-48 hover:bg-lightgrey hover:border-white hover:text-black'
                    onClick={() => setShowGallery(false)}    
                    >
                        Voting
                        <svg width='16px' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"> <path d="M18 2h-2v2h2V2zM4 4h6v2H4v14h14v-6h2v8H2V4h2zm4 8H6v6h6v-2h2v-2h-2v2H8v-4zm4-2h-2v2H8v-2h2V8h2V6h2v2h-2v2zm2-6h2v2h-2V4zm4 0h2v2h2v2h-2v2h-2v2h-2v-2h2V8h2V6h-2V4zm-4 8h2v2h-2v-2z" fill="currentColor"/> </svg>
                    </button>
                    <button className='flex flex-row justify-between items-center bg-offblack text-white text-sm px-2 py-1 border-t-2 border-b-2 border-r-2 border-l-2 border-darkgrey w-48  hover:bg-lightgrey hover:border-white hover:text-black'
                    onClick={() => setShowGallery(true)}    
                    >
                        Gallery
                        <svg width='16px' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"> <path d="M18 2H6v2h12V2zM4 6h16v2H4V6zm-2 4h20v12H2V10zm18 10v-8H4v8h16z" fill="currentColor"/> </svg>
                    </button>

                </div>

            {showGallery && nftData && nftData[galleryID] ?
                <div className='flex flex-col justify-center w-full font-connection mt-4'>
                    <div className='p-1 flex flex-row items-center w-full mt-10 text-black font-connection text-xs border-2 border-darkgrey bg-offblack'>
                        <div className='flex flex-row justify-between  items-center mx-4 w-full '>
                            <div className='text-sm text-lightgrey'>{nftData[galleryID].name}</div>
                            <p>{nftData[galleryID].description}</p>
                        </div>
                    </div>
                    <div className='flex flex-row justify-between items-center mt-10'>
                        <button className='w-[24px]'
                            onClick={() => handleLeftArrowShape()}
                        >
                            <svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"> <path d="M16 5v2h-2V5h2zm-4 4V7h2v2h-2zm-2 2V9h2v2h-2zm0 2H8v-2h2v2zm2 2v-2h-2v2h2zm0 0h2v2h-2v-2zm4 4v-2h-2v2h2z" fill='#EBEBEB'/> </svg>
                        </button>
                        <div className='w-[400px] border-2 border-darkgrey'>
                            <img src={nftData[galleryID].image}/>
                        </div>
                        <button className='w-[24px]'
                            onClick={() => handleRightArrowShape()}
                        >
                            <svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"> <path d="M8 5v2h2V5H8zm4 4V7h-2v2h2zm2 2V9h-2v2h2zm0 2h2v-2h-2v2zm-2 2v-2h2v2h-2zm0 0h-2v2h2v-2zm-4 4v-2h2v2H8z" fill='#EBEBEB'/> </svg>
                        </button>
                    </div>
                    <div className='p-1 flex flex-row items-center w-full mt-10 text-black font-connection text-xs border-2 border-darkgrey bg-offblack'>
                        <div className='flex flex-col items-center w-1/3 border-r-2 border-darkgrey'>
                            <div>Artist Signature</div>
                            <div className='text-sm text-lightgrey'>{truncateAddress(nftData[galleryID].artist)}</div>
                        </div>
                        <div className='flex flex-col items-center w-1/3 border-r-2 border-darkgrey'>
                            <div>Mint Date</div>
                            <div className='text-sm text-lightgrey'>{mintDate}</div>
                        </div>
                        <div className='flex flex-col items-center w-1/3'>
                            <div>Current Owner</div>
                            <div className='text-sm text-lightgrey'>{currentOwner ==  address? 'you' : truncateAddress(currentOwner)}</div>
                        </div>
                    </div>
                    {showAuction && (
                        <div className='p-1 flex flex-row items-center w-full mt-4 text-offblack font-connection text-xs border-2 border-lightgrey bg-white'>                          
                            <div className='flex flex-col items-center w-1/4 '>
                                <div className='text-sm'>Auction Ongoing</div>
                            </div>
                            <div className='flex flex-col items-center w-1/4 border-r-2 border-lightrey'>
                                <div>Auction Ends</div>
                                <div className='text-sm'>{auctionEnd}</div>
                            </div>
                            <div className='flex flex-col items-center w-1/4 border-r-2 border-lightrey'>
                                <div className='text-sm'>Current Bid: {Utils.formatEther(BigInt(highestBid))} ETH</div>
                                <div>by { highestBidder == address ? 'you' : truncateAddress(highestBidder)}</div>
                            </div>
                            <div className='flex flex-col w-1/4 pl-4 pr-2'>
                                <div className='flex flex-row items-center justify-between gap-3 text-sm'>
                                    <div >
                                        <input type="text" value={etherBid} onChange={(e) =>handlePriceChange(e)} step="0.01" className='bg-white text-black text-center border-b-2 max-w-[50px]' />
                                        ETH
                                    </div>
                                    <button 
                                        className={`text-xs py-1 px-2 border-2 flex items-center justify-between gap-2
                                                    ${isConnected ? 'bg-black text-lightgrey border-darkgrey hover:bg-lightgrey hover:text-black hover:border-lightgrey' : 'bg-darkgrey text-lightgrey border-darkgrey'} 
                                                    ${!isConnected && 'cursor-not-allowed'}`} 
                                        disabled={!isConnected || bidLoad}
                                        onClick={() => handleBidding()}
                                    >
                                    <span>
                                        {bidLoad ? 'Processing...' : isConnected ? 'place bid' : 'please connect' }
                                    </span>
                                        {bidLoad ?
                                            <SpinningLoader className="ml-auto h-[16px] w-[16px]"/>
                                        : isConnected ?  
                                            <svg className="ml-auto h-[16px] w-[16px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"> <path d="M15 6h2v2h-2V6zm-2 4V8h2v2h-2zm-2 2v-2h2v2h-2zm-2 2v-2h2v2H9zm-2 2v-2h2v2H7zm-2 0h2v2H5v-2zm-2-2h2v2H3v-2zm0 0H1v-2h2v2zm8 2h2v2h-2v-2zm4-2v2h-2v-2h2zm2-2v2h-2v-2h2zm2-2v2h-2v-2h2zm2-2h-2v2h2V8zm0 0h2V6h-2v2z" fill="currentColor"/> </svg>
                                        : null}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                    {isConnected && !showAuction && claimsOwnership > 0 && (
                        <div className='p-1 flex flex-row items-center w-full mt-4 text-offblack font-connection text-xs border-2 border-lightgrey bg-white'>                          
                            <div className='flex flex-col items-center w-1/4 border-r-2 border-lightrey'>
                                <div className='text-sm'>This Canvas Auction has Ended</div>
                                <div className='text-sm'>Auction Price: {Utils.formatEther(BigInt(highestBid))} ETH</div>
                            </div>
                            <div className='flex flex-col items-center w-1/4 border-r-2 border-lightrey'>
                                <div>At auction end you owned</div>
                                <div className='text-sm'>{claimsOwnership}/4096 pixels</div>
                            </div>
                            <div className='flex flex-col items-center w-1/4 border-r-2 border-lightrey'>
                                <div>You can claim:</div>
                                <div className='text-sm'> {Math.round(Utils.formatEther(BigInt(highestBid))*claimsOwnership/4096*1000)/1000} ETH from the sale</div>
                            </div>
                            <div className='flex flex-col w-1/4 pl-4 pr-2'>
                                <div className='flex flex-row items-center justify-center gap-3 text-sm'>
                                    {claimFlag ?
                                    <div className='text-xs'>
                                        you already claimed proceeds for this canvas!
                                    </div>
                                :
                                    <button 
                                            className='text-xs py-1 px-2 border-2 flex items-center justify-between gap-2 bg-black text-lightgrey border-darkgrey hover:bg-lightgrey hover:text-black hover:border-lightgrey'
                                            disabled={!isConnected || claimLoad}
                                            onClick={() => handleClaim()}
                                        >
                                        <span>
                                            {claimLoad ? 'Processing...' : 'claim'}
                                        </span>
                                            {claimLoad ?
                                                <SpinningLoader className="ml-auto h-[16px] w-[16px]"/>
                                            : isConnected ?  
                                                <svg className="ml-auto h-[16px] w-[16px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"> <path d="M15 6h2v2h-2V6zm-2 4V8h2v2h-2zm-2 2v-2h2v2h-2zm-2 2v-2h2v2H9zm-2 2v-2h2v2H7zm-2 0h2v2H5v-2zm-2-2h2v2H3v-2zm0 0H1v-2h2v2zm8 2h2v2h-2v-2zm4-2v2h-2v-2h2zm2-2v2h-2v-2h2zm2-2v2h-2v-2h2zm2-2h-2v2h2V8zm0 0h2V6h-2v2z" fill="currentColor"/> </svg>
                                            : null}
                                    </button>
                                
                                }    
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            :
                <div>
                    {currentPeriodisArt ? 
                    <div className="flex flex-row bg-offblack text-left text-white font-connection text-md mt-6 p-2 border-2 border-darkgrey gap-4">
                        <svg width='24' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"> <path d="M3 3h2v18H3V3zm16 0H5v2h14v14H5v2h16V3h-2zm-8 6h2V7h-2v2zm2 8h-2v-6h2v6z" fill="currentColor"/> </svg>
                        <div className='flex flex-col'>
                            <p>Voting is currently closed, please come back when Artistic Period has ended.</p>
                            <p>In the meantime, feel free to check out the Gallery.</p>
                        </div>
                    </div>
                    :
                    
                        <div className='flex flex-row mt-4 justify-between items-center font-connection'>
                            <div className='flex flex-col justify-center h-full'>
                                <div className='p-1 flex flex-row items-center w-full text-black font-connection text-xs border-2 border-darkgrey bg-offblack'>
                                    <div className='flex flex-col items-center w-1/3 border-r-2 border-darkgrey'>
                                        <div>Yes</div>
                                        <div className='text-sm text-lightgrey'>{yesVotes} | {totalVotes > 0 ? (Math.round(yesVotes/totalVotes*1000)/1000) *100 : 0}%</div>
                                    </div>
                                    <div className='flex flex-col items-center w-1/3 border-r-2 border-darkgrey'>
                                        <div>Total Votes</div>
                                        <div className='text-sm text-lightgrey'>{totalVotes}</div>
                                    </div>
                                    <div className='flex flex-col items-center w-1/3'>
                                        <div>No</div>
                                        <div className='text-sm text-lightgrey'>{noVotes} | {totalVotes > 0 ? (Math.round(noVotes/totalVotes*1000)/1000) *100 : 0}%</div>
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
                                                <p className='mb-2 '><span className='border-b-2 border-lightgrey'>{truncateAddress(address)}</span>, do you think this period's canvas should be minted as NFT?</p>
                                                <p>you currently own {userBalance} pixels - your vote will count for {userBalance}/4096 possible votes ({(Math.round(userBalance/4096*1000)/1000) *100} %)</p>
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