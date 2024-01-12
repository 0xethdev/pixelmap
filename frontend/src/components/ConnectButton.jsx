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
            <button className="text-darkgrey hover:text-white border-darkgrey hover:border-white py-0 px-1 w-[100px] h-[28px] border-2 font-connection"
            onClick={show}>
                Connect
            </button>
            )
        }
      }}
    </ConnectKitButton.Custom>
  );
};