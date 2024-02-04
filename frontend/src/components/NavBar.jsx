import { ConnectButton } from "./ConnectButton"
import NavBarButton from "./NavBarButton"
import { NavLink } from "react-router-dom"
import { useState, useEffect, useContext, useRef } from "react"
import { useAccount, useContractWrite } from "wagmi"
import { motion } from 'framer-motion';
import { UserBalanceContext } from './UserBalanceContext';
import currencyAddr from '../hooks/currencyAddr';
import { Utils } from "alchemy-sdk"
import { TwitterShareButton } from "react-share";

const wETH_ABI = [{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"guy","type":"address"},{"name":"wad","type":"uint256"}],"name":"approve","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"src","type":"address"},{"name":"dst","type":"address"},{"name":"wad","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"wad","type":"uint256"}],"name":"withdraw","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"balanceOf","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"dst","type":"address"},{"name":"wad","type":"uint256"}],"name":"transfer","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"deposit","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"},{"name":"","type":"address"}],"name":"allowance","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"payable":true,"stateMutability":"payable","type":"fallback"},{"anonymous":false,"inputs":[{"indexed":true,"name":"src","type":"address"},{"indexed":true,"name":"guy","type":"address"},{"indexed":false,"name":"wad","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"src","type":"address"},{"indexed":true,"name":"dst","type":"address"},{"indexed":false,"name":"wad","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"dst","type":"address"},{"indexed":false,"name":"wad","type":"uint256"}],"name":"Deposit","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"src","type":"address"},{"indexed":false,"name":"wad","type":"uint256"}],"name":"Withdrawal","type":"event"}];

function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: undefined,
    height: undefined,
  });

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    window.addEventListener('resize', handleResize);
    
    // Call handleResize immediately to set the initial size
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
}

const WETHModal = ({ isOpen, onClose }) => {
    const modalRef = useRef();
    const [ethInputSwap, setEthInputSwap] = useState('');
    const [wEthInputSwap, setWEthInputSwap] = useState('');

    useEffect(() => {
        // Function to handle click event
        function handleClickOutside(event) {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                onClose(); // Close the modal if click is outside
            }
        }

        // Add event listener when the component is mounted or isOpen changes
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        // Cleanup event listener
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    const handleETHInput = (e) => {
        let newValue = Math.max(0, Number(e.target.value));
        setEthInputSwap(newValue);
    }
    const handleWETHInput = (e) => {
        let newValue = Math.max(0, Number(e.target.value));
        setWEthInputSwap(newValue);
    }

    const { isLoading:loadETHSwap, write: swapETH } = useContractWrite({
        address: currencyAddr,
        abi: wETH_ABI,
        functionName: 'deposit',
        onSuccess(){
            onClose()
        }
    });

    const { isLoading:loadWETHSwap, write: swapWETH } = useContractWrite({
        address: currencyAddr,
        abi: wETH_ABI,
        functionName: 'withdraw',
        onSuccess(){
            onClose()
        }
    });

    const handleETHSwap = async () => {
        await swapETH({args:[ ], value:Utils.parseEther(ethInputSwap.toString())});
    }
    const handleWETHSwap = async () => {
        await swapWETH({args:[Utils.parseEther(wEthInputSwap.toString()) ]});
    }


    if (!isOpen) return null;
  
    return (
      <div className="fixed inset-0 bg-white bg-opacity-30 flex justify-center items-center">
        <div ref={modalRef} className="flex flex-col w-full mx-4 md:w-[400px] bg-black text-white font-connection text-sm px-4 shadow-x">
        <div className='flex flex-row justify-end items-center py-3'>
            <button onClick={()=> onClose()}>
                <svg width='24px' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"> <path d="M5 5h2v2H5V5zm4 4H7V7h2v2zm2 2H9V9h2v2zm2 0h-2v2H9v2H7v2H5v2h2v-2h2v-2h2v-2h2v2h2v2h2v2h2v-2h-2v-2h-2v-2h-2v-2zm2-2v2h-2V9h2zm2-2v2h-2V7h2zm0 0V5h2v2h-2z" fill="currentColor"/> </svg>
            </button>
        </div>
        <div className='flex flex-row justify-start items-center py-6'>
            You need wrapped Ether to operate this dApp. You can swap ETH to wETH in an exchange of your choice or directly below:
        </div>
        <div className='flex flex-row justify-between border-t-2 border-darkgrey items-center py-3'>
            <p>ETH to wETH (1:1)</p>
            <input className='w-20 text-center bg-inherit hide-arrows-number-input' type="number" value={ethInputSwap} onChange={(e) => handleETHInput(e)} placeholder="Amount"/>
            <button
                disabled={ethInputSwap == 0 || ethInputSwap == ''}
                onClick={()=> handleETHSwap()}
            >
                <svg className='mx-2 border-2 w-[24px]' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"> <path d="M4 9V7h12V5h2v2h2v2h-2v2h-2V9H4zm12 2h-2v2h2v-2zm0-6h-2V3h2v2zm4 12v-2H8v-2h2v-2H8v2H6v2H4v2h2v2h2v2h2v-2H8v-2h12z" fill="currentColor"/> </svg>
            </button>
        </div>
        <div className='flex flex-row justify-between border-b-2 border-t-2 border-darkgrey items-center py-3 mb-6'>
            <p>wETH to ETH (1:1)</p>
            <input className='w-20 text-center bg-inherit hide-arrows-number-input' type="number" value={wEthInputSwap} onChange={(e) => handleWETHInput(e)} placeholder="Amount"/>
            <button
                disabled={wEthInputSwap == 0 || wEthInputSwap == ''}
                onClick={()=> handleWETHSwap()}
            >
                <svg className='mx-2 border-2 w-[24px]' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"> <path d="M4 9V7h12V5h2v2h2v2h-2v2h-2V9H4zm12 2h-2v2h2v-2zm0-6h-2V3h2v2zm4 12v-2H8v-2h2v-2H8v2H6v2H4v2h2v2h2v2h2v-2H8v-2h12z" fill="currentColor"/> </svg>
            </button>
        </div>
        </div>
      </div>
    );
};

const NavBar = ({ selectedPage, setSelectedPage, isInitialLoading }) => {
    const { tokenBalance } = useContext(UserBalanceContext);
    const { isConnected, address } = useAccount();
    const { width } = useWindowSize();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showWETHModal, setShowWETHModel] = useState(false);
    
    const breakpoints = {
        sm: 640,
        md: 768,
        lg: 1024,
    };

    useEffect(() => {
        sessionStorage.setItem('selectedPage', selectedPage);
    }, [selectedPage]);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };


    return (
        <div className="md:sticky top-0 bg-black z-30" >
            <div className="container mx-auto px-4">
            { !isInitialLoading ? (
                <div>
                <div className="flex flex-row justify-between items-center md:px-8 pb-2 pt-4">
                {width < breakpoints.md ? (
                    <>
                        < ConnectButton />
                        <button onClick={toggleMenu} className="text-white">
                            <svg width='24px' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"> <path d="M4 6h16v2H4V6zm0 5h16v2H4v-2zm16 5H4v2h16v-2z" fill="currentColor"/> </svg>
                        </button>
                    </>
                ) : (
                    <>
                    <h1 className="md:text-4xl text-xl font-connection text-white md:w-2/3 w-1/2">_mosaix</h1>
                    <div className="flex flex-col">
                        <div className="flex flex-row justify-end items-center gap-1 w-full">
                            <NavLink to='/'>
                            <NavBarButton
                                page="Canvas"
                                selectedPage={selectedPage}
                                setSelectedPage={setSelectedPage} />
                            </ NavLink>
                            <NavLink to='/Info'>
                                <NavBarButton
                                    page="Info"
                                    selectedPage={selectedPage}
                                    setSelectedPage={setSelectedPage} />
                            </ NavLink>
                            <NavLink to='/FAQ'>
                                <NavBarButton
                                    page="FAQ"
                                    selectedPage={selectedPage}
                                    setSelectedPage={setSelectedPage} />
                            </ NavLink>
                            <NavLink to='/Mint'>
                                <NavBarButton
                                    page="Mint"
                                    selectedPage={selectedPage}
                                    setSelectedPage={setSelectedPage} />
                            </ NavLink>
                            
                            <TwitterShareButton
                                className='text-darkgrey hover:text-white border-darkgrey hover:border-white py-0 px-1 w-[150px] h-[27px] border-b-2 font-connection transition duration-300 ease-in-out'
                                title="You should check out @mosaix, it's an awesome and innovative take on the original pixel map. I have just purchased some pixels! Sooo ready to start making some art together 🔥🔥"
                                url="mosaix.xyz"
                            >
                                <button className='flex flex-row justify-between items-center text-darkgrey hover:text-white border-darkgrey hover:border-white py-0 px-1 w-[150px] h-[27px] border-b-2 font-connection transition duration-300 ease-in-out'>
                                    Invite Friends
                                    <svg className='w-[16px]' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"> <path d="M4 11v2h12v2h2v-2h2v-2h-2V9h-2v2H4zm10-4h2v2h-2V7zm0 0h-2V5h2v2zm0 10h2v-2h-2v2zm0 0h-2v2h2v-2z" fill="currentColor"/> </svg>
                                </button>
                            </TwitterShareButton>
                            < ConnectButton />
                        </div>
                    </div>
                    </>
                )}
                {isMenuOpen && (
                    <div className="fixed top-0 left-0 w-full h-full bg-black z-40 px-4 font-connection">
                        <div className="flex justify-end pt-4">
                            <button onClick={toggleMenu} className="text-white text-2xl">
                                <svg width='24px' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"> <path d="M5 5h2v2H5V5zm4 4H7V7h2v2zm2 2H9V9h2v2zm2 0h-2v2H9v2H7v2H5v2h2v-2h2v-2h2v-2h2v2h2v2h2v2h2v-2h-2v-2h-2v-2h-2v-2zm2-2v2h-2V9h2zm2-2v2h-2V7h2zm0 0V5h2v2h-2z" fill="currentColor"/> </svg>
                            </button>
                        </div>
                        <div className="flex flex-col items-center justify-center h-[80%]">
                            <NavLink to="/" className={`py-2 text-start pl-8 text-3xl mb-3 border-b-2 border-darkgrey w-full ${selectedPage === 'Canvas' ? 'text-darkgrey' : 'text-white'}`} onClick={() => { setSelectedPage('Canvas'); toggleMenu(); }}>Canvas</NavLink>
                            <NavLink to="/Info" className={`py-2 text-start pl-8 text-3xl mb-3 border-b-2 border-darkgrey w-full ${selectedPage === 'Info' ? 'text-darkgrey' : 'text-white'}`} onClick={() => { setSelectedPage('Info'); toggleMenu(); }}>Info</NavLink>
                            <NavLink to="/FAQ" className={`py-2 text-start pl-8 text-3xl mb-3 border-b-2 border-darkgrey w-full ${selectedPage === 'FAQ' ? 'text-darkgrey' : 'text-white'}`} onClick={() => { setSelectedPage('FAQ'); toggleMenu(); }}>FAQ</NavLink>
                            <NavLink to="/Mint" className={`py-2 text-start pl-8 text-3xl mb-3 border-b-2 border-darkgrey w-full ${selectedPage === 'Mint' ? 'text-darkgrey' : 'text-white'}`} onClick={() => { setSelectedPage('Mint'); toggleMenu(); }}>Mint</NavLink>
                            <TwitterShareButton
                                className='flex flex-row text-start pl-8 justify-between items-center py-2 text-3xl mb-3 border-b-2 border-darkgrey w-full text-white'
                                title="You should check out @mosaix, it's an awesome and innovative take on the original pixel map. I have just purchased some pixels! Sooo ready to start making some art together 🔥🔥"
                                url="mosaix.xyz"
                            >
                                <button className='flex flex-row text-start pl-8 justify-between items-center py-2 text-3xl mb-3 border-b-2 border-darkgrey w-full text-white'>
                                    Invite Friends
                                    <svg className='w-[36px]' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"> <path d="M4 11v2h12v2h2v-2h2v-2h-2V9h-2v2H4zm10-4h2v2h-2V7zm0 0h-2V5h2v2zm0 10h2v-2h-2v2zm0 0h-2v2h2v-2z" fill="currentColor"/> </svg>
                                </button>
                            </TwitterShareButton>
                        </div>
                    </div>
                )}
                </div>
                <div className="flex flex-row md:justify-end justify-start md:px-8 pt-1 md:pb-3 pb-2">
                    {address && <span className="text-xs font-connection text-lightgrey">current <button className='border-b-2 hover:border-darkgrey' onClick={()=> setShowWETHModel(true)}>wETH</button> balance: {Math.round(tokenBalance*100)/100} </span>}
                </div>
                <WETHModal
                    isOpen={showWETHModal}
                    onClose={() => setShowWETHModel(false)}
                />
                </div>
            ):
            (
                <div>
                    
                </div>
            )}
            </div>
        </div>
    )
}

export default NavBar