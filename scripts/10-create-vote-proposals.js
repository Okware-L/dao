import sdk from "./1-initialize-sdk.js";
import { ethers } from "ethers";

(async () => {
  try {
    const vote = await sdk.getContract(
      "0x01C5C704C3438EdaB33c416715Da84D39F85d457",
      "vote"
    );
    const token = await sdk.getContract(
      "0x273dE5cb9c0A0B4dC479487BB79Bdc57808680d9",
      "token"
    );
    // Create proposal to mint 100,000 new token to the treasury.
    const amount = 100_000;
    const description =
      "Should the DAO mint an additional " +
      amount +
      " tokens into the treasury?";
    const executions = [
      {
        // Our token contract that actually executes the mint.
        toAddress: token.getAddress(),
        nativeTokenValue: 0,
        // We're doing a mint! And, we're minting to the vote, which is
        // acting as our treasury.
        // in this case, we need to use ethers.js to convert the amount
        // to the correct format. This is because the amount it requires is in wei.
        transactionData: token.encoder.encode("mintTo", [
          vote.getAddress(),
          ethers.utils.parseUnits(amount.toString(), 18),
        ]),
      },
    ];

    await vote.propose(description, executions);

    console.log("Successfully created proposal to mint tokens");
  } catch (error) {
    console.error("failed to create first proposal", error);
    process.exit(1);
  }

  try {
    // This is our governance contract.
    const vote = await sdk.getContract(
      "0x01C5C704C3438EdaB33c416715Da84D39F85d457",
      "vote"
    );
    // This is our ERC-20 contract.
    const token = await sdk.getContract(
      "0x273dE5cb9c0A0B4dC479487BB79Bdc57808680d9",
      "token"
    );
    // Create proposal to transfer ourselves 6,900 tokens for being awesome.
    const amount = 6_000;
    const description =
      "Should the DAO transfer " +
      amount +
      " tokens from the treasury to " +
      process.env.WALLET_ADDRESS +
      " for being awesome?";
    const executions = [
      {
        nativeTokenValue: 0,
        transactionData: token.encoder.encode(
          // We're doing a transfer from the treasury to our wallet.
          "transfer",
          [
            process.env.WALLET_ADDRESS,
            ethers.utils.parseUnits(amount.toString(), 18),
          ]
        ),
        toAddress: token.getAddress(),
      },
    ];

    await vote.propose(description, executions);

    console.log(
      "Successfully created proposal to reward ourselves from the treasury."
    );
  } catch (error) {
    console.error("failed to create second proposal", error);
  }
})();
