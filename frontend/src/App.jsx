import { useState, useEffect, useContext } from "react";
import { Routes, Route } from "react-router-dom";
import { mainnet, sepolia, localhost } from 'wagmi/chains'
import { WagmiConfig, createConfig } from 'wagmi'
import { ConnectKitProvider, getDefaultConfig } from 'connectkit'
import { PixelProvider } from './components/PixelContext';
import { UserBalanceProvider } from './components/UserBalanceContext'
import NavBar from './components/NavBar'
import Canvas from './components/Canvas'
import Info from './components/Info'
import Banner from "./components/Banner";

function App() {
  const[selectedPage, setSelectedPage] = useState("Canvas");
  const [isInitialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    const currentpath = window.location.pathname;
    if(currentpath === "/") {
      setSelectedPage("Canvas");
    }
  },[]);

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
              <main className="app">
                <NavBar selectedPage = {selectedPage} setSelectedPage = {setSelectedPage} isInitialLoading={isInitialLoading}/>
                <Banner />
                <Routes>
                  <Route exact path="/" element={<Canvas setInitialLoading={setInitialLoading} />}/>
                  <Route exact path="/Info" element={<Info />}/>
                </Routes>
              </main>
          </PixelProvider>
        </UserBalanceProvider>
      </ ConnectKitProvider>
    </ WagmiConfig>
      
    
  )
}

export default App
