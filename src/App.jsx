import { useAddress, ConnectWallet, useContract, useNFTBalance, Web3Button } from '@thirdweb-dev/react';
import { useState, useEffect, useMemo } from 'react';

const App = () => {
  //thirdweb hooks
  const address = useAddress();
  console.log("Address:", address);

  //initialize our edition-drop contract
  const editionDropAddress = "0x89Ac656cAC8b4A63256B11d3Fc7Dc2a9F8276bC5"
  const { contract: editionDrop } = useContract(editionDropAddress, "edition-drop");
  //hook to check if user has our nft
  const {data: nftBalance } = useNFTBalance(editionDrop, address, "0")
 
  const hasClaimedNFT = useMemo(() => {
    return nftBalance && nftBalance.gt(0)
  }, [nftBalance])

//if not connected
if (!address) {
  return (
    <div className="landing">
      <h1>Welcome to FomDAO, where fom meets you</h1>
      <div className="btn-hero">
        <ConnectWallet/>
      </div>
    </div>
  );
};

if( hasClaimedNFT) {
  return (
    <div className="member-page">
      <h1>Fom members page, members only!😎</h1>
      <p>Congrats on being a member</p>
    </div>
  );
};

//render mint nft screen
return (
    <div className="mint-nft">
      <h1>Mint your free Fom Membership NFT</h1>
      <div className="btn-hero">
        <Web3Button
        contractAddress={editionDropAddress}
        action= {contract => {
          contract.erc1155.claim(0, 1)
        }}
        onSuccess={() => {
          console.log(`Successfully minted! Check it out on OpenSea: https://testnets.opensea.io/assets/${editionDrop.getAddress()}/0`);

        }}
        onError= {error => {
          console.error("Failed to mint NFT", error);
        }}
        >
          Mint your free NFT here!
        </Web3Button>
      </div>
    </div>
  );
};

export default App;
