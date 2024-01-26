import { useEffect, useState, useContext } from 'react'
import PixelContext from './PixelContext'

const faqData = [
    {
        question: "WHAT IS _MOSAIX?",
        answer: "_mosaix is a dynamic, blockchain-powered project that merges art creation with digital ownership and community collaboration. It allows participants to contribute to a collective digital canvas, where each pixel can be customized and owned. Through a unique blend of creativity and technology, _mosaix redefines the traditional boundaries of art, offering a new way for creators and collectors to engage with digital masterpieces."
    },
    {
        question: "HOW CAN I JOIN THIS PROJECT?",
        answer: "Joining _mosaix is simple. Start by connecting your ethereum digital wallet to our platform. Once connected, you can participate by purchasing pixels. To purchase pixels, simply select your prefered pixels from the grid (either by clicking on single pixels or click and dragging across the canvas to select up to 32 pixels at once). Initially pixels will be owned by the null address and will therefore be free to claim. Should you wish to purchase pixels already owned by other users, you will need to pay the fixed pixel value by paying with wrapped ETH."
    },
    {
        question: "CAN YOU GUIDE ME THROUGH THE PROJECT TIMELINES?",
        answer: "_mosaix operates on a cyclical timeline that consists of two main phases: the Artistic Phase and the Voting Phase. The Artistic Phase lasts for three days, during which participants can freely create art by filling pixel colors and customizing pixels shapes. This is followed by a one-day Voting Phase, during which aethetic changes to pixels won-t be allowed and where the community decides whether to mint the current canvas as an NFT. After the Voting Phase a new Artistic Phase automatically begings. Should the community decide to mint the NFT, an automatic auction is kicked-off which will be open for 18 hours (thus partially overlapping with the next Artistic Phase). Proceeds from the NFT sale can always be claimed by pixel owners after the auction ends."
      },
    {
        question: "HOW DO I FILL MY PIXELS AND CHANGE THEIR SHAPE?",
        answer: "Once you own pixels, filling them is easy. Connect your wallet to the website and a portfolio page will appear on the right side of the screen displaying all pixels you own. From here you can click the 'Set Pixel Color & Shape' button to change their color and shape. Should you be happy with your choices you can commit your changes to the blockchain (which will cost some gas). Once committed to the blockchain, your creative changes are instantly visible on the canvas, contributing to the evolving digital mosaic that is collectively crafted by the _mosaix community."
    },
    {
        question: "WHAT IF I AM NOT SURE HOW TO BEST USE THE PIXELS I OWN?",
        answer: "That is not a problem, on the left side of the screen you will find a Test Canvas button which will load the latest canvas from the blockchain and place it in demo mode. This allows you to freely test any color and shape combination you like before actually committing these changes to the blockchain. Also, this test canvas allows you to test changes to pixels you currently don't own, thus helping you make more informed purchasing decisions."
    },
    {
        question: "WHAT ARE HARBERGER TAXES?",
        answer: "Harberger taxes are an interesting economic concept aimed at regulating property rights and property taxes. In the real world these rules are difficult to apply/enforce but thanks to blockchain technology and smart contract, we are able to apply this concept to ownership within _mosaix. Pixel owners are invited to set a self-assessed value for their pixels which triggers two distict but related effects: (i) a periodic royalty is paid to the contract deployer based on this valuation (calculated based on a total royalty rate of 5% annual) and (ii) every other person can purchase pixels based on this self-assessed valuation without the owner being able to interfere. This twofold mechanism encourages fair pricing and ensures that pixels always land in the hands of people who value them most and are those incentive to engage more positively throught the artistic journey, thus fostering an active and dynamic marketplace."
    },
    {
        question: "I KNOW WHAT HARBERGER TAXES ARE, BUT WHY HAVE YOU DECIDED TO APPLY THEM TO _MOSAIX",
        answer: "Are reasoning was really twofold: firstly, we would like to bring forward a case study illustrating which innovative economic models are feasible thanks to blockchain tech and smart contract. Harberger taxes have been widely discussed in theory but their application in the real world has simply not been feasible until now. Maybe harberger taxes won't be part of the economic toolbox in the future, but this project clearly demonstrates the endless possibilities that are now implementable thanks to smart contracts. Secondly, we would like to showcase an alternative to the current royalty model that is market standard in ethereum NFTs today (i.e. a % of transaction price which is impossible to enforce in practice). Our framework is much different since it leverages harberger taxes to implement a yearly royalty rate based on individual value assessemnts (irrespective of trade volume / sales price). Maybe this economic model prove to be a valid alternative to the current NFT royalty model."
    },
    {
        question: "HOW ARE ROYALTY PAYMENTS ENFORCED?",
        answer: "Royalty payments, based on Harberger taxes, are automatically enforced through smart contracts on the Ethereum blockchain and are paid in one of 2 ways: (i) whenever pixel owners wish to change the value of their pixels, they must first pay any outstanding royalties that have accrued based on the old value, or (ii) whenever a pixel is bought, any outstanding royalty that has accrued and not been paid, will be deducted from the sales price. Thus, the purchaser will pay the declared pixel value and the seller will receive the value net of outstanding royalties."
    },
    {
        question: "HOW DO YOU PREVENT HARMFUL BEHAVIOR FROM PEOPLE WHO COULD BE SETTING ARBITRARILY HIGH PIXEL VALUES SUCH THAT THOSE PIXELS WILL NEVER BE SOLD BUT WHO DO NOT PAY THEIR ROYALTIES?",
        answer: "The smart contract allows the pixelmap manager to seek royalty payment on specific pixels which are deemed to not be participating actively in the community. In such cases, the pixel owner will be given three days to pay any outstanding royalties that are due (based on the arbitrarily high pixel value). Should the owner not proceed with the royalty payment, the pixel value will be lowered to a fairer market value, thus enabling more active and engageing community members to purchase that pixel and use it appropriatly."
    },
    {
        question: "HOW DOES VOTING WORK?",
        answer: "Voting in _mosaix is a straightforward process available to all pixel owners. During the Voting Phase, in the mint tab of our website, you can cast your vote on whether the current canvas should be minted as an NFT. Votes are registered on-chain and a are decided through a simple majority (i.e. more than 50% of casted votes). All owners will be allowed to vote once during each Voting Phase and his vote will be weighted based on their relative pixel ownership. When decided on whether to mint or not, pixel owners are encouraged to keep a variety of factors in mind such as, for example: is the current canvas related to the others we have minted? are we creating a coherent collection? Is there enough demand to auction this piece or would it be better to limit NFT supply? The platform ensures that every vote is counted fairly, with results directly influencing the project's direction."
    },
    {
        question: "WHAT HAPPENS IF THE COMMUNITY VOTES NOT TO MINT THE CANVAS NFT?",
        answer: "If the community votes against minting the canvas, the project immediately enters a new Artistic Phase. This allows participants to start fresh, offering another opportunity to collaborate on a new digital masterpiece. The cycle of creation and decision-making then continues as outlined in the project timelines."
    },
    {
        question: "HOW ARE NFT AUCTION REVENUES DISTRIBUTED?",
        answer: "When a canvas is minted as an NFT and sold at auction, the proceeds are distributed among pixel owners proportional to their ownership share. In particular, as soon as the auction ends, a snapshot will be taken and stored on chain showing exactly which address owned how many pixels and thus what each owner's share of the auction proceeds is. This share can be withdrawn from each owner without any time limit directly in the gallery of the mint tab, by navigating to the NFT for which one wishes to withdraw proceeds. This system rewards contributors for their artistic input and investment, aligning financial incentives with the collaborative spirit of _mosaix."
    },
    {
        question: "WHAT HAPPENS IF NOBODY BIDS ON THE NFT AUCTION?",
        answer: "In the unlikely event that an NFT receives no bids during the auction, it will not be sold and there won't be any proceeds distributed to pixel owners. It is therefore important that pixel owners keep demand/supply dynamics in mind when voting on new mints. The already minted NFT will then be airdropped to a randomly chosen pixel owner who particiapted in its creating in order to avoid burning this new piece. After that a new Artistic Phase begins, allowing the community to work on a new canvas. It will be up to the new NFT owner to decide whether to keep the NFT, sell it or burn it."
    },
    {
        question: "WHAT DOES THE FUTURE HOLD FOR _MOSAIX?",
        answer: "The future of _mosaix is shaped by its community. We encourage pixel owners to make the most of their digital canvas and decide wisely on which NFTs to mint. The ultimate goal for this project to to assign the manager role of the pixel map contract to a new multi-sig wallet controlled by the collective pixel owners."
    },
    {
        question: "WHO CREATED _MOSAIX?",
        answer: "_mosaix is a passion project created by @0x7967. Please reach out on twitter/X for any questions."
    },
  ];
  

const FAQ = ({ setInitialLoading }) => {
    const { pixels, loading } = useContext(PixelContext);
    const [activeIndex, setActiveIndex] = useState(null);

    useEffect(() => {
        setInitialLoading(loading);        
    }, [loading, setInitialLoading]);

    const toggleFAQ = (index) => {
        setActiveIndex(activeIndex === index ? null : index);
      };

    return (
        <div className="container">
            <div className='flex flex-col items-center justify-center md:mt-10 mt-4 mb-10 '>
                <div className='flex flex-col mb-20 md:w-[60%] w-[90%] justify-start items-start text-left font-connection text-xs p-3 border-offblack border-2'>
                {faqData.map((faq, index) => (
                    
                    <div key={index}
                        className='border-b-2 border-offblack text-left text-white md:text-xs text-sm p-2 w-full'
                        onClick={() => toggleFAQ(index)}
                    >
                        {index +1}. {faq.question}
                    
                    <div
                        className={` text-left text-darkgrey p-2 mb-2 ${activeIndex === index ? 'block' : 'hidden'}`}
                    >
                        {faq.answer}
                    </div>
                    </div>
                ))}
    
                </div>
            </div>
                
            <div className="fixed bottom-0 left-0 w-full h-24 bg-gradient-to-t from-black to-transparent z-20"></div>
        </div>
        
    );
};

export default FAQ;
