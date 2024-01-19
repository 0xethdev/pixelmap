import { ConnectKitButton } from 'connectkit';

export const ConnectButton = () => {
  return (
    <ConnectKitButton.Custom>
      {({ isConnected, isConnecting, show, truncatedAddress, ensName }) => {
        
        if(isConnected){
            return (
            <button className="text-white hover:text-darksgrey border-white hover:border-darkgrey py-0 px-1 h-[28px] border-2 font-connection"
            onClick={show}>
                {ensName ? ensName : truncatedAddress}
            </button>
            )
        } else if(isConnecting){
          return (
          <button className="text-white border-white py-0 px-1 w-[100px] h-[28px] border-2 font-connection">
              Loading...
          </button>
          );
        }else{
            return(
            <button className="flex flex-row justify-between items-center text-darkgrey hover:text-white border-darkgrey hover:border-white py-0 px-1 w-[100px] h-[28px] border-2 font-connection"
            onClick={show}>
                <svg width='16px' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"> <path d="M5 3H3v4h2V5h14v14H5v-2H3v4h18V3H5zm12 8h-2V9h-2V7h-2v2h2v2H3v2h10v2h-2v2h2v-2h2v-2h2v-2z" fill="currentColor"/> </svg>
                Connect
            </button>
            )
        }
      }}
    </ConnectKitButton.Custom>
  );
};