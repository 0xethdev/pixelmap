import { ConnectButton } from "./ConnectButton"
import NavBarButton from "./NavBarButton"
import { NavLink } from "react-router-dom"
import { useState, useEffect, useContext } from "react"
import { useAccount } from "wagmi"
import { motion } from 'framer-motion';
import { UserBalanceContext } from './UserBalanceContext';


const NavBar = ({ selectedPage, setSelectedPage, isInitialLoading }) => {
    const { tokenBalance } = useContext(UserBalanceContext);
    const { isConnected, address } = useAccount();

    return (
        <div className="sticky top-0 bg-black z-30" >
            <div className="container hidden md:block">
            { !isInitialLoading ? (
                <div>
                <div className="flex flex-row justify-between items-center px-8 pt-4">
                    <h1 className="text-4xl font-connection text-white w-2/3">_mosaix</h1>
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
                        <NavLink to='/'>
                            <NavBarButton
                                page="FAQ"
                                selectedPage={selectedPage}
                                setSelectedPage={setSelectedPage} />
                        </ NavLink>
                        <NavLink to='/'>
                            <NavBarButton
                                page="Mint"
                                selectedPage={selectedPage}
                                setSelectedPage={setSelectedPage} />
                        </ NavLink>
                        <NavLink to='/'>
                            <NavBarButton
                                page="Chat"
                                selectedPage={selectedPage}
                                setSelectedPage={setSelectedPage} />
                        </ NavLink>
                        < ConnectButton />
                    </div>
                    
                    </div>
                </div>
                <div className="flex flex-row justify-end px-8 pt-1 pb-3">
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