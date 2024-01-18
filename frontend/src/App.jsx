import { useState, useEffect, useContext } from "react";
import { Routes, Route } from "react-router-dom";
import { mainnet, sepolia, localhost } from 'wagmi/chains'
import { WagmiConfig, createConfig } from 'wagmi'
import { ConnectKitProvider, getDefaultConfig } from 'connectkit'
import { PixelProvider } from './components/PixelContext';
import { PeriodProvider } from './components/PeriodContext';
import { UserBalanceProvider } from './components/UserBalanceContext'
import NavBar from './components/NavBar'
import Canvas from './components/Canvas'
import Info from './components/Info'
import MintPage from './components/MintPage'
import Banner from './components/Banner'

function App() {
  const[selectedPage, setSelectedPage] = useState('');
  const [isInitialLoading, setInitialLoading] = useState(true);

  const config = createConfig(
    getDefaultConfig({
      // Required API Keys
      alchemyId: import.meta.env.VITE_ETH_MAINNET,
      walletConnectProjectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID,
      chains: [localhost],
      
      // Required
      appName: "Pixel Map",
  
      // Optional
      // appDescription: "Your App Description",
      // appUrl: "https://family.co", // your app's url
      // appIcon: "https://family.co/logo.png", // your app's icon, no bigger than 1024x1024px (max. 1MB)
    }),
  );

  return (
    <WagmiConfig config={config}>
      <ConnectKitProvider>
        <UserBalanceProvider>
          <PixelProvider>
            <PeriodProvider>
              <main className="app">
                <NavBar selectedPage = {selectedPage} setSelectedPage = {setSelectedPage} isInitialLoading={isInitialLoading}/>
                <Banner isInitialLoading={isInitialLoading}/>
                <Routes>
                  <Route exact path="/" element={<Canvas setInitialLoading={setInitialLoading} />}/>
                  <Route exact path="/Info" element={<Info />}/>
                  <Route exact path="/Mint" element={<MintPage />}/>
                </Routes>
              </main>
            </PeriodProvider>
          </PixelProvider>
        </UserBalanceProvider>
      </ ConnectKitProvider>
    </ WagmiConfig>
      
    
  )
}

export default App
