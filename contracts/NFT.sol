// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/draft-ERC721Votes.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/// @title DAO Membership NFT contract
/// @author Web3 Hackers Collective
contract NFT is
    ERC721,
    ERC721Enumerable,
    ERC721URIStorage,
    ERC721Burnable,
    Ownable,
    EIP712,
    ERC721Votes
{
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;

    address public original;
    string public uri;

    mapping(uint256 => bool) public claimed;

    event Claimed(uint256 indexed tokenId);

    constructor(
        address _original,
        string memory _name,
        string memory _symbol,
        string memory _uri
    ) ERC721(_name, _symbol) EIP712(_name, "1") {
        original = _original;
        uri = _uri;
    }

    /// @notice Allows holders of the original NFT can mint with the same ID
    /// @dev Marked `claimed` after ownership verification
    /// @param to The address of the recipient
    /// @param tokenId The tokenId of the original NFT
    function claim(address to, uint256 tokenId) public {
        require(
            ERC721(original).ownerOf(tokenId) == msg.sender,
            "Caller does not own one of the original NFTs"
        );
        require(claimed[tokenId] == false, "Token ID already claimed");
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        claimed[tokenId] = true;
        emit Claimed(tokenId);
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }

    function _afterTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override(ERC721, ERC721Votes) {
        super._afterTokenTransfer(from, to, tokenId, batchSize);
    }

    function _burn(
        uint256 tokenId
    ) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(
        uint256 tokenId
    ) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC721, ERC721Enumerable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
