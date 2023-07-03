const main = async () => {
    const [deployer] = await hre.ethers.getSigners();
    const accountBalance = await deployer.accountBalance; // Was .getBalance()

    console.log("Deploying contracts with account: ", await deployer.getAddress());
    console.log("Account balance: ", accountBalance); // Was .toString(), it's still undefined though
  
    const bidContractFactory = await hre.ethers.getContractFactory("BidContract");
    const bidContract = await bidContractFactory.deploy();
    await bidContract.waitForDeployment();
  
    console.log("Bid contract address: ", await bidContract.getAddress());
  };
  
  const runMain = async () => {
    try {
      await main();
      process.exit(0);
    } catch (error) {
      console.log(error);
      process.exit(1);
    }
  };
  
  runMain();