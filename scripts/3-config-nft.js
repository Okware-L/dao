import sdk from "./1-initialize-sdk.js";
import { readFileSync } from "fs";

(async () => {
  try {
    const editionDrop = await sdk.getContract(
      "0x89Ac656cAC8b4A63256B11d3Fc7Dc2a9F8276bC5",
      "edition-drop"
    );
    await editionDrop.createBatch([
      {
        name: "Fom logo",
        description: "This nft will give you access to FomDAO",
        image: readFileSync("scripts/assets/fom.png"),
      },
    ]);
    console.log("succesfully created a new nft in the drop!");
  } catch (error) {
    console.log("failed to create the new NFT", error);
  }
})();
