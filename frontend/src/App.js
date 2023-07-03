// import * as React from "react";
import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import './App.css';
import abi from "./utils/BidContract.json";
import devconnect from "./devconnect.png";

const getEthereumObject = () => window.ethereum;

/*
 * This function returns the first linked account found.
 * If there is no account linked, it will return null.
 */
const findMetaMaskAccount = async () => {
  try {
    const ethereum = getEthereumObject();

    /*
    * First make sure we have access to the Ethereum object.
    */
    if (!ethereum) {
      console.error("Make sure you have Metamask!");
      return null;
    }

    console.log("We have the Ethereum object", ethereum);
    const accounts = await ethereum.request({ method: "eth_accounts" });

    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account:", account);
      return account;
    } else {
      console.error("No authorized account found");
      return null;
    }
  } catch (error) {
    console.error(error);
    return null;
  }
};

const App = () => {

  const [currentAccount, setCurrentAccount] = useState("");
  const [message, setMessage] = useState("");

  const [allBids, setAllBids] = useState([]);
  const contractAddress = "0x7D4fF8648F1C58661BAa36EC5cb5E82386040921";

  const contractABI = abi.abi;

  /*
   * Create a method that gets all bids from your contract
   */
  const getAllBids = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const bidContract = new ethers.Contract(contractAddress, contractABI, signer);

        // Call getAllBids method from smart contract
        const bids = await bidContract.getAllBids();

        /*
         * We only need address, timestamp, and message in our UI so let's
         * pick those out
         */
        let bidsCleaned = [];
        bids.forEach(bid => {
          bidsCleaned.push({
            address: bid.bidder,
            timestamp: new Date(bid.timestamp * 1000),
            message: bid.message
          });
        });

        /*
         * Store our data in React State
         */
        setAllBids(bidsCleaned);
      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log(error);
    }
  }

  const connectWallet = async () => {
    try {
      const ethereum = getEthereumObject();
      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);

      await getAllBids();
    } catch (error) {
      console.error(error);
    }
  };

  const handleMessageChange = (event) => {
    setMessage(event.target.value);
  };

  const bid = async () => {
    console.log(message);
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum); // Changed after update
        const signer = provider.getSigner();
        const bidContract = new ethers.Contract(contractAddress, contractABI, signer);
        let count = await bidContract.getTotalBids();
        console.log("Retrieved total bid count...", count.toNumber());

        /*
        * Execute the actual bid from your smart contract
        */
        const bidTxn = await bidContract.bid("Sample message!");
        console.log("Mining...", bidTxn.hash);

        await bidTxn.wait();
        console.log("Mined -- ", bidTxn.hash);

        count = await bidContract.getTotalBids();
        console.log("Retrieved total bid count...", count.toNumber());
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  }

  /*
   * This runs our function when the page loads.
   * More technically, when the App component "mounts".
   */
  useEffect(() => {
    const fetchAccount = async () => {
      const account = await findMetaMaskAccount();
      if (account !== null) {
        setCurrentAccount(account);
      }
    };
  
    fetchAccount();
  }, []);

  return (
    <div className="mainContainer">

      <div className="dataContainer">
        <div className="header">
        ✋ BidBuddy
        </div>

        <div className="bio">
          Connect your ETH wallet and bid for a ticket to Devconnect 2023!
        </div>

        <div className="inputContainer">

          <img src={devconnect} style={{ borderRadius: '2%' }}/>
          <textarea
            type="text"
            className="messageInput"
            onChange={handleMessageChange}
            placeholder="Enter an optional message here :)"
          />

          <button className="bidButton" onClick={bid}>
            Place a bid
          </button>
        </div>

        {/*
         * If there is no currentAccount render this button
         */}
        {!currentAccount && (
          <button className="bidButton" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}     
      
        {allBids.map((bid, index) => {
          return (
            <div key={index} style={{ backgroundColor: "OldLace", marginTop: "16px", padding: "8px" }}>
              <div>Address: {bid.address}</div>
              <div>Time: {bid.timestamp.toString()}</div>
              <div>Message: {bid.message}</div>
            </div>)
        })}
      </div>
    </div>
  );
};

export default App;
