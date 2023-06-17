const main = async () => {
    const [deployer] = await hre.ethers.getSigners();
    const accountBalance = await deployer.accountBalance; // Was .getBalance()

    console.log("Deploying contracts with account: ", await deployer.getAddress());
    console.log("Account balance: ", accountBalance); // Was .toString(), it's still undefined though
  
    const waveContractFactory = await hre.ethers.getContractFactory("WavePortal");
    const waveContract = await waveContractFactory.deploy();
    await waveContract.waitForDeployment();
  
    console.log("Wave contract address: ", await waveContract.getAddress());
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

  // 0x356Dc300afa95dAeA85171fab6D4be7D6A4763EF