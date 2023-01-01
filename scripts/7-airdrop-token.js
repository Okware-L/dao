import sdk from "./1-initialize-sdk.js";

(async () => {
  try {
    const editionDrop = await sdk.getContract(
      "0x89Ac656cAC8b4A63256B11d3Fc7Dc2a9F8276bC5",
      "edition-drop"
    );
    const token = await sdk.getContract(
      "0x273dE5cb9c0A0B4dC479487BB79Bdc57808680d9",
      "token"
    );
    // Grab all the addresses of people who own our membership NFT, which has
    // a tokenId of 0.
    const walletAddresses = await editionDrop.history.getAllClaimerAddresses(0);

    if (walletAddresses.length === 0) {
      console.log(
        "No NFTs have been claimed yet, maybe get some friends to claim your free NFTs!"
      );
      process.exit(0);
    }

    // Loop through the array of addresses.
    const airdropTargets = walletAddresses.map((address) => {
      // Pick a random # between 1000 and 10000.
      const randomAmount = Math.floor(
        Math.random() * (10000 - 1000 + 1) + 1000
      );
      console.log("✅ Going to airdrop", randomAmount, "tokens to", address);

      // Set up the target.
      const airdropTarget = {
        toAddress: address,
        amount: randomAmount,
      };

      return airdropTarget;
    });

    // Call transferBatch on all our airdrop targets.
    console.log("Starting airdrop...");
    await token.transferBatch(airdropTargets);
    console.log(
      "Successfully airdropped tokens to all the holders of the NFT!"
    );
  } catch (err) {
    console.error("Failed to airdrop tokens", err);
  }
})();
