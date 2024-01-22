// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";


interface CanvasCollection {
    function mint(address to) external;
    function totalSupply() external view returns (uint);
    function safeTransferFrom(address from, address to, uint tokenId) external payable;
}

contract Pixelmap is ReentrancyGuard {
    CanvasCollection public nftContract;

    address public manager;
    uint public constant maxWidth = 64;
    uint public constant maxHeight = 64;
    uint public royaltyRate = 50; // rate per 1'000
    uint public constant royaltyDenominator = 1000;
    uint public constant ARTISTIC_PERIOD = 3 days;
    uint public constant VOTING_PERIOD = 1 days;
    uint public constant CYCLE_PERIOD = ARTISTIC_PERIOD + VOTING_PERIOD;
    uint public constant AUCTION_DURATION = 18 hours;
    uint public canvasCreation;
    uint public constant royaltyAskPeriod = 3 days;
    uint private constant PIXEL_WIDTH_HEIGHT = 8;

    /// royalties are paid with wrapped ETH
    IERC20 currency = IERC20(address(0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2));
    
    struct Pixel {
        address owner;
        uint shapeID;
        uint price;
        string color;
        uint royaltyLastPaid;
        bool askedToPayRoyalties;
        uint royaltyAskDate;
    }

    struct Vote {
        uint yesVotes;
        uint noVotes;
        mapping (address => bool) voted;
    }

    struct Auction {
        address winningAddr;
        uint winningBid;
        uint auctionStart;
        uint auctionEnd;
        bool auctionEnded;
        
    }
    
    /// The window is a map that fits "width -> (height -> pixel)"
    mapping (uint => mapping (uint => Pixel)) public window;
    string[4096] public pixelSVGs;
    string[64] public rowSVGs;
    /// Balance mapping of owner address to number of pixels owned
    mapping (address => uint) public balanceOf;
    /// mapping of period id to Vote
    mapping (uint => Vote) public voteRegister;
    /// mapping tokenID to mint date
    mapping (uint => uint) public mintDates;
    /// mapping tokenID to Auction
    mapping (uint => Auction) public nftAuctions;


    /// ================================================================================
    /// MODIFIERS
    /// ================================================================================

    modifier isManager {
        require(msg.sender == manager, "owner current manager can call this function");
        _;
    }

    modifier isArtisticPeriod {
        require(isInArtisticPeriod(), "Artistic period currently not open");
        _;
    }

    modifier isVotingPeriod {
        require(isInVotingPeriod(), "Voting currently not open");
        _;
    }

    /// ================================================================================
    /// EVENTS
    /// ================================================================================

    event PixelBought (uint indexed x, uint indexed y);
    event PixelFilled (uint indexed x, uint indexed y);
    event PixelValueSet (uint indexed x, uint indexed y);
    event RoyaltiesPaid (uint indexed x, uint indexed y);
    event VoteCasted (address indexed owner);
    event NFTMinted(uint cycle);
    event BidPlace(uint tokenID, address bidder, uint bid);
    event AuctionEnded(uint tokenID, address bidder, uint bid);
    event BidWithdrawn(uint tokenID, address bidder, uint bid);

    /// ================================================================================
    /// CONSTRUCTOR
    /// ================================================================================

    constructor(){
        manager = msg.sender;
        canvasCreation = block.timestamp;
    }

    /// ================================================================================
    /// PIXEL FUNCTIONS
    /// ================================================================================

    /// Function to set color on multiple pixels. inputs encoded as x, y, shape, color
    function fillPixel( bytes[] memory _pixels ) external isArtisticPeriod {
        uint length = _pixels.length;
        bool[] memory uniqueRows = new bool[](64);
        
        for (uint i=0; i < length; i++){
            (uint _x, uint _y, uint _shape, string memory _color) = abi.decode(_pixels[i], (uint, uint, uint, string));
            if (isOutOfBound(_x,_y)) {
            revert('pixel is out of bounds');
            }
            require(_shape < 10, 'shape ID not available');
            require(!window[_x][_y].askedToPayRoyalties, 'owner was asked to first settle royalty payment');
            if(window[_x][_y].owner == msg.sender){
                window[_x][_y].color = _color;
                window[_x][_y].shapeID = _shape;

                uint pixelID = _x + maxWidth * _y;
                
                pixelSVGs[pixelID] = generateShapeSVG(window[_x][_y].shapeID, _x * 9, _y * 9, window[_x][_y].color);
                uniqueRows[_y] = true;
                
                emit PixelFilled (_x,_y);
    
            }
        }
        for(uint row = 0; row < 64;){
            if(uniqueRows[row]){
                rowSVGs[row] = generateSVGRow(row);
            }
            unchecked{row++;}
        }
    }

    /// Function to set color on multiple pixels. inputs encoded as x, y, color
    function setPixelValue (uint[] memory xValues, uint[] memory yValues, uint[] memory priceValues) external {
        require(xValues.length == yValues.length && xValues.length == priceValues.length, 'input arrays must be of the same length');
        
        uint length = xValues.length;
        for (uint i = 0; i < length;) {
            require(!isOutOfBound(xValues[i], yValues[i]), 'A pixel is out of bounds');
            require(window[xValues[i]][yValues[i]].owner == msg.sender, 'only owner can set pixel value');
            unchecked{i++;}
        }
        
        // Pay royalties for all pixels at once based on previous values
        payRoyalties(xValues, yValues);
        // set new pixel values
        for (uint i = 0; i < length;) {
            window[xValues[i]][yValues[i]].price = priceValues[i];
            emit PixelValueSet (xValues[i],yValues[i]);
            unchecked{i++;}
        }
    }


    function payRoyalties (uint[] memory xValues, uint[] memory yValues) public {
        require(xValues.length == yValues.length, 'x and y input arrays are of various lengths');
        
        uint length = xValues.length;
        for (uint i = 0; i < length; i++){
            if (isOutOfBound(xValues[i],yValues[i])) {
                revert('pixel is out of bounds');
            }
            if (window[xValues[i]][yValues[i]].owner != msg.sender) {
                revert('only pixel owner can pay royalties');
            }
            if (window[xValues[i]][yValues[i]].royaltyLastPaid != block.timestamp){
                uint royalties = calculateRoyalties(xValues[i], yValues[i]);
                require(currency.balanceOf(address(msg.sender)) >= royalties, 'not sufficient balance to pay royalties');
                require(currency.allowance(msg.sender, address(this)) >= royalties, 'insufficient allowance to pay royalties');
                currency.transferFrom(msg.sender, manager, royalties);
                window[xValues[i]][yValues[i]].royaltyLastPaid = block.timestamp;

                if(window[xValues[i]][yValues[i]].askedToPayRoyalties){
                    window[xValues[i]][yValues[i]].askedToPayRoyalties = false;
                    window[xValues[i]][yValues[i]].royaltyAskDate = 0;
                }
                emit RoyaltiesPaid (xValues[i], yValues[i]);
            }
        }
    }

    function buyPixel(uint[] memory xValues, uint[] memory yValues) external {
        require(xValues.length == yValues.length, 'x and y input arrays are of various lengths');
        
        uint length = xValues.length;
        for (uint i = 0; i < length; ){
            if (isOutOfBound(xValues[i],yValues[i])) {
                revert('pixel is out of bounds');
            }
            if(window[xValues[i]][yValues[i]].owner == address(0)){
                window[xValues[i]][yValues[i]].owner = msg.sender;
                balanceOf[msg.sender] += 1;
            }else{
                uint royalties = calculateRoyalties(xValues[i], yValues[i]);
                if(window[xValues[i]][yValues[i]].price > royalties){
                    uint netPrice = window[xValues[i]][yValues[i]].price - royalties;
                    require(currency.balanceOf(address(msg.sender)) > window[xValues[i]][yValues[i]].price, 'not sufficient balance to buy pixel');
                    require(currency.allowance(msg.sender, address(this)) >= window[xValues[i]][yValues[i]].price, 'insufficient allowance to buy pixel');
                    currency.transferFrom(msg.sender, window[xValues[i]][yValues[i]].owner, netPrice);
                    currency.transferFrom(msg.sender, manager, royalties);
                    balanceOf[window[xValues[i]][yValues[i]].owner] -= 1;
                    balanceOf[msg.sender] +=1;
                    window[xValues[i]][yValues[i]].owner = msg.sender;
                    window[xValues[i]][yValues[i]].royaltyLastPaid = block.timestamp;
                }else{
                    require(currency.balanceOf(address(msg.sender)) > window[xValues[i]][yValues[i]].price, 'not sufficient balance to buy pixel');
                    require(currency.allowance(msg.sender, address(this)) >= window[xValues[i]][yValues[i]].price, 'insufficient allowance to buy pixel');
                    currency.transferFrom(msg.sender, manager, window[xValues[i]][yValues[i]].price);
                    balanceOf[window[xValues[i]][yValues[i]].owner] -= 1;
                    balanceOf[msg.sender] +=1;
                    window[xValues[i]][yValues[i]].owner = msg.sender;
                    window[xValues[i]][yValues[i]].royaltyLastPaid = block.timestamp;
                }   
            }
            emit PixelBought (xValues[i],yValues[i]);
            unchecked{i++;}
        }
    }

    function seekRoyaltyPayment(uint x, uint y, uint _price) external isManager {
        if(window[x][y].askedToPayRoyalties && block.timestamp > window[x][y].royaltyAskDate + royaltyAskPeriod){
            window[x][y].price = _price;
            window[x][y].askedToPayRoyalties = false;
            window[x][y].royaltyAskDate = 0;

        }else{
            window[x][y].askedToPayRoyalties = true;
            window[x][y].royaltyAskDate = block.timestamp;
        }  
    }

    /// Function used to check the current status of the pixel at (x,y).
    function checkPixel(uint x, uint y) public view returns(Pixel memory) {
        require(x < maxWidth && y < maxHeight, 'pixel out of bounds');
        return window[x][y];
    }

    function checkMultiplePixel (uint[] memory xValues, uint[] memory yValues) external view returns(Pixel[] memory) {
        require(xValues.length == yValues.length, 'x and y input arrays are of various lengths');
        uint length = xValues.length;
        Pixel[] memory results = new Pixel[](length);

        for (uint i = 0; i < length;){
            results[i] = checkPixel(xValues[i], yValues[i]);
            unchecked {
                i++;
            }
        }
        return results;
    }

    /// Function that checks whether the parameters are out of bound respect to the current window.
    function isOutOfBound(uint x, uint y) internal pure returns(bool) {
        return x < 0 || y < 0 || x >= maxWidth || y >= maxHeight;
    }

    function calculateRoyalties(uint x, uint y) public view returns (uint) {
        uint timePeriod = block.timestamp - window[x][y].royaltyLastPaid;
        return (timePeriod * window[x][y].price * royaltyRate) / (360 days * royaltyDenominator);
    }

    /// ================================================================================
    /// MINT VOTE FUNCTIONS
    /// ================================================================================

    /// Voting mechanism
    function castVote(bool vote) external isVotingPeriod {
        uint pixelsOwned = balanceOf[msg.sender];
        require(pixelsOwned > 0, 'no pixels owned = no votes to be casted');
        require(voteRegister[getCurrentCycle()].voted[msg.sender] == false, 'already voted');

        if (vote) {
            voteRegister[getCurrentCycle()].yesVotes += pixelsOwned;
        } else {
            voteRegister[getCurrentCycle()].noVotes += pixelsOwned;
        }
        voteRegister[getCurrentCycle()].voted[msg.sender] = true;
        emit VoteCasted (msg.sender);
    }

    function checkVoteOutcome(uint _cycle) external {
        require(_cycle < getCurrentCycle(), 'check vote outcomes only possible for concluded cycles');
        uint totalVotes = voteRegister[_cycle].yesVotes + voteRegister[_cycle].noVotes;
        require(totalVotes > 0, "No votes cast");

        if (voteRegister[_cycle].yesVotes > totalVotes / 2){
            nftContract.mint(address(this));
            emit NFTMinted(_cycle);
            uint tokenID = nftContract.totalSupply() -1;
            mintDates[tokenID] = block.timestamp;
            nftAuctions[tokenID].auctionStart = block.timestamp;
            nftAuctions[tokenID].auctionEnd = block.timestamp + AUCTION_DURATION;
        }
    }

    function hasVoted(address _owner) external view returns (bool) {
        return voteRegister[getCurrentCycle()].voted[_owner];
    }

    /// ================================================================================
    /// NFT AUCTION
    /// ================================================================================
    
    function placeBid (uint _tokenID) external payable nonReentrant {
        require(nftAuctions[_tokenID].auctionEnded == false, 'auction has ended already');
        require(nftAuctions[_tokenID].auctionStart < block.timestamp, 'auction has not started yet');
        require(nftAuctions[_tokenID].auctionEnd > block.timestamp, 'auction has already ended');

        require(msg.value > nftAuctions[_tokenID].winningBid, 'higher bid already existing');
        (bool sent, ) = nftAuctions[_tokenID].winningAddr.call{value: nftAuctions[_tokenID].winningBid}("");
        require(sent, "Failed to send Ether");
        
        nftAuctions[_tokenID].winningBid = msg.value;
        nftAuctions[_tokenID].winningAddr = msg.sender;

        emit BidPlace(_tokenID, msg.sender, msg.value);
    }
    function closeAuction(uint _tokenID) public nonReentrant {
        require(nftAuctions[_tokenID].auctionEnded == false, 'auction has ended already');
        require(nftAuctions[_tokenID].auctionStart < block.timestamp, 'auction has not started yet');
        require(nftAuctions[_tokenID].auctionEnd < block.timestamp, 'auction not ended yet');

        nftAuctions[_tokenID].auctionEnded = true;
        nftContract.safeTransferFrom(address(this), nftAuctions[_tokenID].winningAddr, _tokenID);
        emit AuctionEnded(_tokenID, nftAuctions[_tokenID].winningAddr, nftAuctions[_tokenID].winningBid);
    }



    /// ================================================================================
    /// PERIOD MANAGEMENT
    /// ================================================================================

    function getCurrentCycle() public view returns (uint) {
        return ((block.timestamp - canvasCreation) / CYCLE_PERIOD);
    }

    function getMintDate( uint _tokenID) public view returns (uint) {
        return mintDates[_tokenID];
    }

    function isInArtisticPeriod() public view returns (bool) {
        uint cycleTime = (block.timestamp - canvasCreation) % CYCLE_PERIOD;
        return cycleTime < ARTISTIC_PERIOD;
    }

    function isInVotingPeriod() public view returns (bool) {
        return !isInArtisticPeriod();
    }

    /// ================================================================================
    /// GETTER AND MANAGEMENT FUNCTIONS
    /// ================================================================================

    ///////
    function getBalance(address _owner) public view returns (uint) {
        return balanceOf[_owner];
    }

    function updateCurrency(address _newToken) external isManager {
        currency = IERC20(address(_newToken));
    }

    function setNFTContract(address _nftContract) external isManager {
        nftContract = CanvasCollection(_nftContract);
    }

    /// ================================================================================
    /// ART FUNCTIONS
    /// ================================================================================

    function generateShapeSVG(uint shapeID, uint x, uint y, string memory color) internal pure returns (string memory) {
        if (shapeID == 0) {
            return string(abi.encodePacked(
                '<rect x="', uint2str(x) ,
                '" y="', uint2str(y), 
                '" width="8" height="8" fill="', color, '" />'));
        }
        if (shapeID == 1) {
            return string(abi.encodePacked(
                '<circle cx="', uint2str(x+4) ,
                '" cy="', uint2str(y+4), 
                '" r="4" fill="', color, '" />'));
        }
        if (shapeID == 2) {
            return string(abi.encodePacked(
                '<path d="M', uint2str(x),' ', uint2str(y),
                ' L', uint2str(x+PIXEL_WIDTH_HEIGHT),' ', uint2str(y),
                ' L', uint2str(x),' ', uint2str(y+PIXEL_WIDTH_HEIGHT), 
                ' z" fill="', color, '" />'));
        }
        if (shapeID == 3) {
            return string(abi.encodePacked(
                '<path d="M', uint2str(x),' ', uint2str(y),
                ' L', uint2str(x+PIXEL_WIDTH_HEIGHT),' ', uint2str(y),
                ' L', uint2str(x+PIXEL_WIDTH_HEIGHT),' ', uint2str(y+PIXEL_WIDTH_HEIGHT), 
                ' z" fill="', color, '" />'));
        }
        if (shapeID == 4) {
            return string(abi.encodePacked(
                '<path d="M', uint2str(x+PIXEL_WIDTH_HEIGHT),' ', uint2str(y+PIXEL_WIDTH_HEIGHT),
                ' L', uint2str(x+PIXEL_WIDTH_HEIGHT),' ', uint2str(y),
                ' L', uint2str(x),' ', uint2str(y+PIXEL_WIDTH_HEIGHT), 
                ' z" fill="', color, '" />'));
        }
        if (shapeID == 5) {
            return string(abi.encodePacked(
                '<path d="M', uint2str(x),' ', uint2str(y+PIXEL_WIDTH_HEIGHT),
                ' L', uint2str(x),' ', uint2str(y),
                ' L', uint2str(x+PIXEL_WIDTH_HEIGHT),' ', uint2str(y+PIXEL_WIDTH_HEIGHT), 
                ' z" fill="', color, '" />'));
        }
        if (shapeID == 6) {
            return string(abi.encodePacked(
                '<path d="M', uint2str(x),' ', uint2str(y+PIXEL_WIDTH_HEIGHT),
                ' A8 8 0 0 0 ', uint2str(x+PIXEL_WIDTH_HEIGHT),' ',uint2str(y),
                ' L', uint2str(x),' ', uint2str(y), 
                ' Z" fill="', color, '" />'));
        }
        if (shapeID == 7) {
            return string(abi.encodePacked(
                '<path d="M', uint2str(x),' ', uint2str(y),
                ' A8 8 0 0 0 ', uint2str(x+PIXEL_WIDTH_HEIGHT),' ',uint2str(y+PIXEL_WIDTH_HEIGHT),
                ' L', uint2str(x+PIXEL_WIDTH_HEIGHT),' ', uint2str(y), 
                ' Z" fill="', color, '" />'));
        }
        if (shapeID == 8) {
            return string(abi.encodePacked(
                '<path d="M', uint2str(x+PIXEL_WIDTH_HEIGHT),' ', uint2str(y),
                ' A8 8 0 0 0 ', uint2str(x),' ',uint2str(y+PIXEL_WIDTH_HEIGHT),
                ' L', uint2str(x+PIXEL_WIDTH_HEIGHT),' ', uint2str(y+PIXEL_WIDTH_HEIGHT),
                ' Z" fill="', color, '" />'));
        }
        if (shapeID == 9) {
            return string(abi.encodePacked(
                '<path d="M', uint2str(x),' ', uint2str(y),
                ' A8 8 0 0 1 ', uint2str(x+PIXEL_WIDTH_HEIGHT),' ',uint2str(y+PIXEL_WIDTH_HEIGHT),
                ' L', uint2str(x),' ', uint2str(y+PIXEL_WIDTH_HEIGHT), 
                ' Z" fill="', color, '" />'));
        }
        
        return "";
    }

    // Function to generate SVG for 1 row by combining single pixel SVGs
    function generateSVGRow(uint _row) internal view returns (string memory) {
        string memory svgString = '';
        
        uint startID = 64 * _row;
        uint endID = 64 + startID;

        for (uint i = startID; i < endID; i++) {
            svgString = string(abi.encodePacked(svgString, pixelSVGs[i]));
        }
        return svgString;
    }

    // Function to generate the complete SVG grid based on single row SVGs
    function generateSVG() public view returns (string memory) {
        string memory svgString = '<svg width="600" height="600" viewBox="0 0 600 600" xmlns="http://www.w3.org/2000/svg">';
        
        for (uint i = 0; i < 64; i++) {
            svgString = string(abi.encodePacked(svgString, rowSVGs[i]));
        }

        svgString = string(abi.encodePacked(svgString, '</svg>'));
        return svgString;
    }

    // Helper function to convert uint to string
    function uint2str(uint _i) internal pure returns (string memory _uintAsString) {
        if (_i == 0) {
            return "0";
        }
        uint j = _i;
        uint len;
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        uint k = len;
        while (_i != 0) {
            k = k-1;
            uint8 temp = (48 + uint8(_i - _i / 10 * 10));
            bytes1 b1 = bytes1(temp);
            bstr[k] = b1;
            _i /= 10;
        }
        return string(bstr);
    }
}