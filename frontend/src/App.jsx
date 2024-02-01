import { useState, useEffect, useContext } from "react";
import { Routes, Route } from "react-router-dom";
import { mainnet, sepolia, localhost } from 'wagmi/chains'
import { defineChain } from 'viem'
import { WagmiConfig, createConfig } from 'wagmi'
import { ConnectKitProvider, getDefaultConfig } from 'connectkit'
import { PixelProvider } from './components/PixelContext';
import { PeriodProvider } from './components/PeriodContext';
import { NFTDataProvider } from './components/NFTDataContext';
import { UserBalanceProvider } from './components/UserBalanceContext'
import NavBar from './components/NavBar'
import Canvas from './components/Canvas'
import Info from './components/Info'
import MintPage from './components/MintPage'
import FAQ from './components/FAQ'
import Banner from './components/Banner'
import { frame } from "framer-motion";

const frameTestnet = {
  id: 68840142,
  sourceId: 11155111,
  name: 'Frame Testnet',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls:{
    default: {http: ['https://rpc.testnet.frame.xyz/http']},
    alchemy:{http: ['https://rpc.testnet.frame.xyz/http']},
    infura:{http: ['https://rpc.testnet.frame.xyz/http']},
    public:{http: ['https://rpc.testnet.frame.xyz/http']},
  },
  blockExplorers: {
    default: { name: 'Frame Explorer', url: 'https://explorer.testnet.frame.xyz' },
  },
  testnet:true
} 

function App() {
  const [selectedPage, setSelectedPage] = useState(localStorage.getItem('selectedPage') || '');
  const [isInitialLoading, setInitialLoading] = useState(true);

  const config = createConfig(
    getDefaultConfig({
      alchemyId: import.meta.env.VITE_SEPOLIA_TESTNET,
      walletConnectProjectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID,
      chains: [frameTestnet],
      appName: "Pixel Map",
    }),
  );

  return (
    <WagmiConfig config={config}>
      <ConnectKitProvider>
        <UserBalanceProvider>
          <PixelProvider>
            <PeriodProvider>
              <NFTDataProvider>
                <main className="app">
                  <NavBar selectedPage = {selectedPage} setSelectedPage = {setSelectedPage} isInitialLoading={isInitialLoading}/>
                  <Banner isInitialLoading={isInitialLoading}/>
                  <Routes>
                    <Route exact path="/" element={<Canvas setInitialLoading={setInitialLoading} />}/>
                    <Route exact path="/Info" element={<Info setInitialLoading={setInitialLoading}/>}/>
                    <Route exact path="/Mint" element={<MintPage setInitialLoading={setInitialLoading}/>}/>
                    <Route exact path="/FAQ" element={<FAQ setInitialLoading={setInitialLoading}/>}/>
                  </Routes>
                </main>
              </NFTDataProvider>
            </PeriodProvider>
          </PixelProvider>
        </UserBalanceProvider>
      </ ConnectKitProvider>
    </ WagmiConfig>
      
    
  )
}

export default App
