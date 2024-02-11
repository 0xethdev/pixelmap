import { createContext, useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { useContractEvent } from 'wagmi'
import { fetchBalance, readContract } from '@wagmi/core';
import contractAddr from '../hooks/contractAddr';
import currencyAddr from '../hooks/currencyAddr';

const wETH_ABI = [{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"guy","type":"address"},{"name":"wad","type":"uint256"}],"name":"approve","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"src","type":"address"},{"name":"dst","type":"address"},{"name":"wad","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"wad","type":"uint256"}],"name":"withdraw","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"balanceOf","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"dst","type":"address"},{"name":"wad","type":"uint256"}],"name":"transfer","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"deposit","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"},{"name":"","type":"address"}],"name":"allowance","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"payable":true,"stateMutability":"payable","type":"fallback"},{"anonymous":false,"inputs":[{"indexed":true,"name":"src","type":"address"},{"indexed":true,"name":"guy","type":"address"},{"indexed":false,"name":"wad","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"src","type":"address"},{"indexed":true,"name":"dst","type":"address"},{"indexed":false,"name":"wad","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"dst","type":"address"},{"indexed":false,"name":"wad","type":"uint256"}],"name":"Deposit","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"src","type":"address"},{"indexed":false,"name":"wad","type":"uint256"}],"name":"Withdrawal","type":"event"}];

export const UserBalanceContext = createContext(null);

export const UserBalanceProvider = ({ children }) => {
    const [tokenBalance, setTokenBalance] = useState('0');
    const [tokenAllowance, setAllowance] = useState('0');
    const { isConnected, address } = useAccount();
    const [updateBalance, setUpdateBalance] = useState(false);
    const pollInterval = 60000; // Poll every 60 seconds

    const handleBalanceChange = (event) => {
        if(event[0].args.src == address || event[0].args.dst == address ){
            setUpdateBalance(true);
        }
    }

    useContractEvent({
        address: currencyAddr,
        abi: wETH_ABI,
        eventName: 'Approval',
        listener:handleBalanceChange,
    })
    useContractEvent({
        address: currencyAddr,
        abi: wETH_ABI,
        eventName: 'Transfer',
        listener:handleBalanceChange,
    })
    useContractEvent({
        address: currencyAddr,
        abi: wETH_ABI,
        eventName: 'Deposit',
        listener:handleBalanceChange,
    })
    useContractEvent({
        address: currencyAddr,
        abi: wETH_ABI,
        eventName: 'Withdrawal',
        listener:handleBalanceChange,
    })
    
    const fetchData = useCallback(async () => {
        const tokenResponse = await fetchBalance({
            address: address,
            token: currencyAddr,
        })
        setTokenBalance(tokenResponse.formatted);

        const allowanceResponse = await readContract({
            address: currencyAddr,
            abi: wETH_ABI,
            functionName: 'allowance',
            args: [address, contractAddr],
        });
        setAllowance(Number(allowanceResponse));
    });

    useEffect(() => {
        let interval;
        
        if (isConnected) {
            fetchData();
            interval = setInterval(fetchData, pollInterval);
        }
        if(updateBalance){
            setUpdateBalance(false);
            fetchData();
        }

        return () => clearInterval(interval);
    }, [address, isConnected, tokenBalance, tokenAllowance, updateBalance]);

    return (
        <UserBalanceContext.Provider value={{ tokenBalance, tokenAllowance, refreshBalanceData:fetchData }}>
            {children}
        </UserBalanceContext.Provider>
    );
};
