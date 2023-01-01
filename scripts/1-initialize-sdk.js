import { ThirdwebSDK } from "@thirdweb-dev/sdk";
import dotenv from "dotenv";
dotenv.config();

if (!process.env.PRIVATE_KEY || process.env.PRIVATE_KEY === "") {
  console.log("Private key not found");
}

if (!process.env.QUICKNODE_API_URL || process.env.QUICKNODE_API_URL === "") {
  console.log("quicknode API URL not found");
}

if (!process.env.WALLET_ADDRESS || process.env.WALLET_ADDRESS === "") {
  console.log("Wallet address not found.");
}

const sdk = ThirdwebSDK.fromPrivateKey(
  process.env.PRIVATE_KEY,
  process.env.QUICKNODE_API_URL
);

(async () => {
  try {
    const address = await sdk.getSigner().getAddress();
    console.log("SDK initialized by address:", address);
  } catch (err) {
    console.error("failed to get apps from the sdk", err);
    process.emit(1);
  }
})();

export default sdk;
