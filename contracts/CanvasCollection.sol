// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "erc721a/contracts/ERC721A.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract CanvasCollection is ERC721A, Ownable {
    Pixelmap public pixelmapContract;

    // Mapping from tokenId to its metadata
    mapping(uint256 => string) private _tokenURIs;

    constructor(address pixelmapAddress) ERC721A("Canvas Collection", "CNVS") Ownable(msg.sender) {
        pixelmapContract = Pixelmap(pixelmapAddress);
    }

    // Set the Pixelmap contract address
    function setPixelmapContract(address pixelmapAddress) external onlyOwner {
        pixelmapContract = Pixelmap(pixelmapAddress);
    }

    // Simplified mint function for minting a single token
    function mint(address to) external {
        require(msg.sender == address(pixelmapContract), "Only Pixelmap contract can mint");
        uint256 tokenId = totalSupply();
        _mint(to, 1);
        _setTokenURI(tokenId);
    }

    // Internal function to set token URI
    function _setTokenURI(uint256 tokenId) internal {
        require(_exists(tokenId), "ERC721Metadata: URI set of nonexistent token");
        _tokenURIs[tokenId] = getTokenURI(tokenId);
    }

    // Function to get token URI
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");
        return _tokenURIs[tokenId];
    }

    function generateImage() internal view returns(string memory){
        bytes memory svg = bytes(pixelmapContract.generateSVG());

        return string(
            abi.encodePacked(
                "data:image/svg+xml;base64,",
                Base64.encode(svg)
            )    
        );
    }
    function getTokenURI(uint256 tokenId) internal view returns (string memory){
        bytes memory dataURI = abi.encodePacked(
            '{',
                '"name": "Pixel Canvas #', Strings.toString(tokenId), '",',
                '"external_url":"https://www.google.xyz/",',
                '"description": "Created by a comunity of artists, builders, visionaries, investors and degens.",',
                '"image": "', generateImage(), '",',
                '"attributes":[{"Artist":""}]',
            '}'
        );
        return string(
            abi.encodePacked(
                "data:application/json;base64,",
                Base64.encode(dataURI)
            )
        );
    }
}



interface Pixelmap {
    function generateSVG() external view returns (string memory);
}



