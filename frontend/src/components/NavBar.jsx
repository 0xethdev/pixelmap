import { ConnectButton } from "./ConnectButton"
import NavBarButton from "./NavBarButton"
import { NavLink } from "react-router-dom"
import { useState, useEffect, useContext } from "react"
import { useAccount } from "wagmi"
import { motion } from 'framer-motion';
import { UserBalanceContext } from './UserBalanceContext';

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


const NavBar = ({ selectedPage, setSelectedPage, isInitialLoading }) => {
    const { tokenBalance } = useContext(UserBalanceContext);
    const { isConnected, address } = useAccount();
    const { width } = useWindowSize();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    
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
        <div className="sticky top-0 bg-black z-30" >
            <div className="container mx-auto px-4">
            { !isInitialLoading ? (
                <div>
                <div className="flex flex-row justify-between items-center md:px-8 pt-4">
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
                            <NavLink to="/" className={`py-2 text-center text-3xl mb-3 border-b-2 border-darkgrey w-full ${selectedPage === 'Canvas' ? 'text-darkgrey' : 'text-white'}`} onClick={() => { setSelectedPage('Canvas'); toggleMenu(); }}>Canvas</NavLink>
                            <NavLink to="/Info" className={`py-2 text-center text-3xl mb-3 border-b-2 border-darkgrey w-full ${selectedPage === 'Info' ? 'text-darkgrey' : 'text-white'}`} onClick={() => { setSelectedPage('Info'); toggleMenu(); }}>Info</NavLink>
                            <NavLink to="/FAQ" className={`py-2 text-center text-3xl mb-3 border-b-2 border-darkgrey w-full ${selectedPage === 'FAQ' ? 'text-darkgrey' : 'text-white'}`} onClick={() => { setSelectedPage('FAQ'); toggleMenu(); }}>FAQ</NavLink>
                            <NavLink to="/Mint" className={`py-2 text-center text-3xl mb-3 border-b-2 border-darkgrey w-full ${selectedPage === 'Mint' ? 'text-darkgrey' : 'text-white'}`} onClick={() => { setSelectedPage('Mint'); toggleMenu(); }}>Mint</NavLink>
                        </div>
                    </div>
                )}
                </div>
                <div className="flex flex-row md:justify-end justify-start md:px-8 pt-1 md:pb-3 pb-1">
                    {address && <span className="text-xs font-connection text-lightgrey">current wETH balance: {Math.round(tokenBalance*100)/100} </span>}
                </div>
                </div>
            ):
            (
                <div>
                    <div className="flex flex-row justify-between items-center px-8 pt-4">
                        <motion.h1 
                            className="text-4xl font-connection text-white w-2/3"
                            initial={{ color: '#0F0F0F' }}
                            animate={{ color: '#FFFFFF' }}
                            transition={{ duration: 5, delay: 13, type:"tween", ease:"easeIn"  }} >
                                _mosaix
                        </motion.h1>
                    </div>
                    <div className="flex flex-row justify-end px-8 pt-1 pb-3" />
                </div>
            )}
            </div>
        </div>
    )
}

export default NavBar