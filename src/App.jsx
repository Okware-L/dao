import { useAddress, ConnectWallet, useContract, useNFTBalance, Web3Button } from '@thirdweb-dev/react';
import { useState, useEffect, useMemo } from 'react';

const App = () => {
  //thirdweb hooks
  const address = useAddress();
  console.log("Address:", address);

  //initialize our edition-drop contract
  const editionDropAddress = "0x89Ac656cAC8b4A63256B11d3Fc7Dc2a9F8276bC5"
  const { contract: editionDrop } = useContract(editionDropAddress, "edition-drop");
  //initialize token contract
  const { contract: token } = useContract("0x273dE5cb9c0A0B4dC479487BB79Bdc57808680d9", "token");
  //hook to check if user has our nft
  const {data: nftBalance } = useNFTBalance(editionDrop, address, "0")
 
  const hasClaimedNFT = useMemo(() => {
    return nftBalance && nftBalance.gt(0)
  }, [nftBalance])

  //holds the amount of token each member has in state
  const [memberTokenAmounts, setMemberTokenAmounts] = useState([]);
  //the array holding all of our member addresses
  const [memberAddresses, setMemberAddresses] = useState([]);

  //fancy funtion to shorten someones wallet address
  const shortenAddress = (str) => {
    return str.substring(0, 6) + '...' + str.substring(str.length - 4);
  };

  //this use effect grabs all the addresses of members with nft
  useEffect(() => {
    if (!hasClaimedNFT) {
      return;
    }
    //grab users with nft with id 0
    const getAllAddresses = async () => {
      try{
        const memberAddresses = await editionDrop?.history.getAllClaimerAddresses(
            0,
        );
        setMemberAddresses(memberAddresses);
        console.log('Members addresses', memberAddresses);
      } catch (error){
        console.error('failed to get member list', error);
      }
    };
    getAllAddresses();
  }, [hasClaimedNFT, editionDrop?.history]);


  //this useeffect grabs the # of the token each member holds
  useEffect(() => {
    if (!hasClaimedNFT) {
      return;
    }

    const getAllBalances = async () => {
      try {
        const amounts = await token?.history.getAllHolderBalances();
        setMemberTokenAmounts(amounts);
        console.log('Amounts', amounts);
      } catch(error) {
        console.error('failed to get member balances', error);
      }
    };
    getAllBalances();
  }, [hasClaimedNFT, token?.history]);


  //we now combine the memberAddresses and memberTokenAmounts into a single array
  const memberList = useMemo(() => {
    return memberAddresses.map((address) => {
      //check if address is in memberTokenAmounts array
      //if so return amount of token user has
      //otherwise return 0
      const member = memberTokenAmounts?.find(({holder}) => holder === address);

      return{
        address,
        tokenAmount: member?.balance.displayValue || '0',
      };
    });
  }, [memberAddresses, memberTokenAmounts]);

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


// If the user has already claimed their NFT we want to display the internal DAO page to them
// only DAO members will see this. Render all the members + token amounts.
if( hasClaimedNFT) {
  return (
    <div className="member-page">
      <h1>Fom members page, members only!😎</h1>
      <p>Congrats on being a member</p>
      <div>
        <div>
          <h2>Member List</h2>
          <table className="card">
            <thead>
              <tr>
                <th>Address</th>
                <th>Token Amount</th>
              </tr>
            </thead>
            <tbody>
              {memberList.map((member) => {
                return (
                  <tr key={member.address}>
                    <td>{shortenAddress(member.address)}</td>
                    <td>{member.tokenAmount}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
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
