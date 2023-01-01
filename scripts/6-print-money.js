import sdk from "./1-initialize-sdk.js";

(async () => {
  try {
    // address of our ERC-20 contract printed out in the step before.
    const token = await sdk.getContract(
      "0x273dE5cb9c0A0B4dC479487BB79Bdc57808680d9",
      "token"
    );
    // max supply
    const amount = 1_000_000;
    // mint tokens
    await token.mint(amount);
    const totalSupply = await token.totalSupply();

    // Print out how many of our token's are out there now!
    console.log("There are", totalSupply.displayValue, "FOM in circulation");
  } catch (error) {
    console.error("Failed to print money", error);
  }
})();
