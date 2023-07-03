const main = async () => {
  const bidContractFactory = await hre.ethers.getContractFactory("BidContract");
  const bidContract = await bidContractFactory.deploy();
  await bidContract.waitForDeployment();
  console.log("Contract address: ", await bidContract.getAddress())

  let bidCount;
  bidCount = await bidContract.getTotalBids();

  let bidTxn = await bidContract.bid("A message!");
  await bidTxn.wait(); // Wait for the transaction to be mined

  const [_, randomPerson] = await hre.ethers.getSigners();
  bidTxn = await bidContract.connect(randomPerson).bid("Another message!");
  await bidTxn.wait(); // Wait for the transaction to be mined

  let allBids = await bidContract.getAllBids();
  console.log(allBids);

  let updatedBidCount;
  updatedBidCount = await bidContract.getTotalBids();
};
  
  const runMain = async () => {
    try {
      await main();
      process.exit(0); // exit Node process without error
    } catch (error) {
      console.log(error);
      process.exit(1); // exit Node process while indicating 'Uncaught Fatal Exception' error
    }
    // Read more about Node exit ('process.exit(num)') status codes here: https://stackoverflow.com/a/47163396/7974948
  };
  
  runMain();