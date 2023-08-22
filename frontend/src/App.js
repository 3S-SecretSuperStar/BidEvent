import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import './App.css';
import abi from "./utils/BidContract.json";
import consensus from "./consensus-logo.svg";
import bfc from "./bfc.png";
import btc from "./btc.svg";
import nftnyc from "./nftnyc.svg";
import mainnet from "./mainnet.webp";
import collision from "./collision.avif";
import edcon from "./edcon.png";
import tbw from "./tbw.png";
import truncateEthAddress from 'truncate-eth-address';

import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

// Fxn that retrieves the ethereum object that MetaMask injected
// in the window (current tab)
const getEthereumObject = () => window.ethereum;

/*
 * Fxn returns the first linked account found.
 * If there is no account linked, it will return null.
 * Used in useEffect.
 */
const findMetaMaskAccount = async () => {
  try {
    const ethereum = getEthereumObject();

    // First make sure we have access to the Ethereum object
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

  const cardTitleStyle = {
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif",
  };

  const [currentAccount, setCurrentAccount] = useState("");
  const [message, setMessage] = useState("");
  const [allBids, setAllBids] = useState([]);

  const contractAddress = "0x7D4fF8648F1C58661BAa36EC5cb5E82386040921";

  const contractABI = abi.abi;

  /*
   * Create a method that gets all bids from your contract
   * Only used when user's wallet is connected + authorized
   */
  const getAllBids = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const bidContract = new ethers.Contract(contractAddress, contractABI, signer);

        // Call getAllBids method from smart contract to retrieve all the bids
        // This is why above signing is needed^ since data is on chain
        const bids = await bidContract.getAllBids();

        console.log("Bids:", bids);

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

        bidContract.on("NewBid", (from, timestamp, message) => {
          console.log("NewBid", from, timestamp, message);

          setAllBids(prevState => [...prevState, {
            address: from,
            timestamp: new Date(timestamp * 1000),
            message: message
          }]);
        });

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

      // Only show all bids if user's wallet is connected + authorized
      await getAllBids();
    } catch (error) {
      console.error(error);
    }
  };


  const handleMessageChange = (event) => {
    setMessage(event.target.value);
  };


  const bid = async () => {
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
        const bidTxn = await bidContract.bid(message);
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
      await getAllBids();
    };

    fetchAccount();
  }, []);


  return (
    <div>
      <div className="landing-page">
        <div className="navbar">
          <div className="navbar-title">
            👋 BidBuddy
          </div>
          <span className="navbar-address">
            {truncateEthAddress(currentAccount)}
          </span>

          {/*
         * If there is no currentAccount render this button
         */}
          {!currentAccount && (
            <button className="connect-wallet" role="button" onClick={connectWallet}>
              Connect Wallet
            </button>
          )}
        </div>

        <div className="landing-page-container">
          <div className="headline">
            Cheap tickets to the best crypto events around the world
          </div>
          <div className="headline-description">
            A safe, transparent, and secure bidding marketplace powered by the blockchain. Join <b>15,000+</b> crypto natives finding the best deals.
          </div>
          <div className="explore-button-container">
            <button class="explore-button" role="button">Explore</button>
          </div>

          <div className="logo-carousel">
            <div className="logo-carousel-slide">
              <img src={consensus} />
              <img src={bfc} />
              <img src={nftnyc} />
              <img src={btc} />
              <img style={{ filter: 'brightness(0) invert(1)' }} src={collision} />
              <img src={mainnet} />
              <img src={edcon} />
              <img src={tbw} />
            </div>

            <div className="logo-carousel-slide">
              <img src={consensus} />
              <img src={bfc} />
              <img src={nftnyc} />
              <img src={btc} />
              <img style={{ filter: 'brightness(0) invert(1)' }} src={collision} />
              <img src={mainnet} />
              <img src={edcon} />
              <img src={tbw} />
            </div>
          </div>
        </div>
      </div>

      <div>

        <div className="upcoming-events">
          Upcoming events
        </div>

        <Card sx={{ maxWidth: 345, marginLeft: '30px', marginTop: '30px' }}>
          <CardMedia
            component="img"
            alt="devconnect"
            height="140"
            image={process.env.PUBLIC_URL + '/devconnect.png'}
          />
          <CardContent>
            <Typography style={cardTitleStyle} gutterBottom variant="h5" component="div">
              Devconnect | Nov 2023
            </Typography>
            <Typography variant="body2" color="text.secondary">
              A week-long gathering of independent Ethereum events to learn, share, and make progress together.
            </Typography>
          </CardContent>
          <CardActions>
            <Button size="small" sx={{ marginRight: '20px' }}>Place bid</Button>
            <Button size="small" target="_blank" href="https://devconnect.org/">Learn More</Button>
          </CardActions>
        </Card>

      </div>

    </div>
  );
};

export default App;

/*
<div className="mainContainer">

        <div className="dataContainer">

          <div className="inputContainer">

            <img src={devconnect} style={{ borderRadius: '2%' }} />
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

          <div className="header">
            Latest bids
          </div>

          <div className="bio">
            Connect wallet to view
          </div>

          {allBids.map((bid, index) => {
            return (
              <div key={index} style={{ backgroundColor: "lightBlue", marginTop: "16px", padding: "8px" }}>
                <div>Address: {truncateEthAddress(bid.address)}</div>
                <div>Time: {bid.timestamp.toString()}</div>
                <div>Message: {bid.message}</div>
              </div>)
          })}
        </div>
      </div>
*/