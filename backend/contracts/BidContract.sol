// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.18;

import "hardhat/console.sol";

contract BidContract {
    uint256 totalBids;

    event NewBid(address indexed from, uint256 timestamp, string message);

    struct Bid {
        address bidder; // The address of the user who waved.
        string message; // The message the user sent.
        uint256 timestamp; // The timestamp when the user waved.
    }

    Bid[] bids;

    constructor() {
        console.log("Hello! This is from the constructor.");
    }

    function bid(string memory _message) public {
        totalBids += 1;
        console.log("%s placed a bid w/ message %s", msg.sender, _message);

        bids.push(Bid(msg.sender, _message, block.timestamp));

        emit NewBid(msg.sender, block.timestamp, _message);
    }

    function getAllBids() public view returns (Bid[] memory) {
        return bids;
    }

    function getTotalBids() public view returns (uint256) {
        console.log("We have %d total bids!", totalBids);
        return totalBids;
    }
}