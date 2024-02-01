import { useEffect, useContext } from 'react'
import PixelContext from './PixelContext'
import contractAddr from '../hooks/contractAddr';
import nftContractAddr from '../hooks/nftContractAddr';

const Info = ({ setInitialLoading }) => {
    const { pixels, loading } = useContext(PixelContext);
    useEffect(() => {
        setInitialLoading(loading);        
    }, [loading, setInitialLoading]);

    return (
        <div className="container">
            <div className='flex flex-col items-center justify-center md:mt-10 mt-4 mb-10 '>
                <div className='flex flex-col mb-20 md:w-[60%] w-[90%] justify-center items-center text-left font-connection md:text-xs text-sm md:p-3 p-2 border-offblack border-2'>
                    <div className='text-center text-white md:text-sm text-md p-2 mt-3 w-full'>
                        THERE IS NO SUCH THING AS ART. THERE ARE ONLY ARTISTS.
                    </div>
                    <div className='text-right text-lightgrey p-2 mb-6 w-full'>
                        - Ernst Gombrich
                    </div>

                    <div className='border-b-2 border-offblack text-left text-white md:text-xs text-md p-2 w-full'>
                        INTRODUCING _MOSAIX: A NEW EPOCH OF COLLABORATIVE ARTISTRY AND BLOCKCHAIN INGENUITY
                    </div>
                    <div className=' text-left text-lightgrey p-2 mb-3'>
                        In the vast expanse of the internet, a unique convergence of art and technology takes form as _mosaix. This project isn't just a collection of digital pixels; it's a bold exploration of how we create, share, and value art in the blockchain era.
                    </div>

                    <div className='border-b-2 border-offblack text-left text-white md:text-xs text-md p-2 w-full'>
                        A COLLECTIVE CANVAS
                    </div>
                    <div className=' text-left text-lightgrey p-2 mb-3'>
                        At the heart of _mosaix lies a digital canvas that challenges traditional notions of art. Here, every pixel carries the potential for expression, set against a backdrop of Ethereum's blockchain. It's a space where the community's imagination shapes the evolving masterpiece, reflecting a diverse tapestry of thoughts and visions. Every pixel is a piece of a larger narrative shaped by the collective will of its creators
                    </div>

                    <div className='border-b-2 border-offblack text-left text-white md:text-xs text-md p-2 w-full'>
                        NEW PARADIGM OF OWNERSHIP
                    </div>
                    <div className=' text-left text-lightgrey p-2 mb-3'>
                        _mosaix introduces a nuanced approach to ownership through Harberger taxes. It's a concept that breathes life into the digital canvas, allowing pixels to change hands in a way that ensures they always land in the hands artists that value them most. This mechanism not only democratizes creation but also ensures that the canvas remains a fluid tapestry of current expressions and ideas.
                    </div>

                    <div className='border-b-2 border-offblack text-left text-white md:text-xs text-md p-2 w-full'>
                        ARTISTIC CYCLE
                    </div>
                    <div className=' text-left text-lightgrey p-2 mb-3'>
                        The rhythm of _mosaix is marked by alternating periods of artistic freedom and collective decision-making. In the artistic phase, creators have three days to imbue the canvas with their vision, selecting from a palette of colors and shapes for each pixel. What follows is a day of choice and decision making, where the fate of the collective artwork is put to a vote: to mint the collective artwork as an NFT, storing the resulting image directly on-chain and immortalizing a moment of collective achievement, or to begin anew, embracing the ever-changing nature of artistic endeavor.
                    </div>

                    <div className='border-b-2 border-offblack text-left text-white md:text-xs text-md p-2 w-full'>
                        ART AUCTION
                    </div>
                    <div className=' text-left text-lightgrey p-2 mb-3'>
                        Success in the vote triggers an auction, transforming the digital mosaic into a valuable NFT. Proceeds are distributed among the pixel owners, aligning financial incentives with creative contributions. This cycle of creation, appreciation, and reward encapsulates the essence of _mosaix, where art means shared culture and ideas, and ownership extends beyond possession to participation.
                    </div>

                    <div className='border-b-2 border-offblack text-left text-white md:text-xs text-md p-2 w-full'>
                        VOICE OF WEB3
                    </div>
                    <div className=' text-left text-lightgrey p-2 mb-3'>
                        _mosaix is a beacon for all. It promises not just a platform for artistic expression but a space where financial and creative dynamics intersect, attracting people from all over web3, from established crypto artists to speculators, innovators, developers and investors, thus fostering a melting pot of innovation.
                    </div>

                    <div className='border-b-2 border-offblack text-left text-white md:text-xs text-md p-2 w-full'>
                        EXPLORE THE POSSIBILITIES
                    </div>
                    <div className=' text-left text-lightgrey p-2 mb-3'>
                        _mosaix invites you to step into a world where art is reimagined. It's an opportunity to be part of a living, evolving project that pushes the boundaries of what digital art can be. Here, the journey is just as important as the destination, with each pixel and vote contributing to the ongoing narrative of collective creation.
                        Discover _mosaix—a platform where art, technology, and community converge to redefine the landscape of digital expression. _mosaix stands as a testament to the power of collective action and blockchain's potential to reimagine art, ownership, and community. It's a project where every pixel tells a story, every vote shapes the future, and every participant makes or breaks the collective effort.
                    </div>

                    <div className='border-b-2 border-offblack text-left text-white md:text-xs text-md p-2 w-full'>
                        DEPLOYED & VERIFIED CONTRACTS
                    </div>
                    <div className='text-left text-lightgrey p-2 mb-3'>
                        <p>Pixelmap { contractAddr }</p>
                        <p>NFT Collection { nftContractAddr }</p>
                    </div>

                </div>
            </div>
                
            <div className="fixed bottom-0 left-0 w-full h-24 bg-gradient-to-t from-black to-transparent z-20"></div>
        </div>
        
    );
};

export default Info;
