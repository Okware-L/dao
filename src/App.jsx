import { useAddress,useNetwork, ConnectWallet, useContract, useNFTBalance, Web3Button } from '@thirdweb-dev/react';
import { useState, useEffect, useMemo } from 'react';
import { AddressZero } from "@ethersproject/constants";
import { ChainId } from '@thirdweb-dev/sdk';

const App = () => {
  //thirdweb hooks
  const address = useAddress();
  const network = useNetwork();
  console.log("Address:", address);

  //initialize our edition-drop contract
  const editionDropAddress = "0x89Ac656cAC8b4A63256B11d3Fc7Dc2a9F8276bC5"
  const { contract: editionDrop } = useContract(editionDropAddress, "edition-drop");
  //initialize token contract
  const { contract: token } = useContract("0x273dE5cb9c0A0B4dC479487BB79Bdc57808680d9", "token");
  const { contract: vote } = useContract("0x01C5C704C3438EdaB33c416715Da84D39F85d457", "vote");
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

  const [proposals, setProposals] = useState([]);
  const [isVoting, setIsVoting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);

  // Retrieve all our existing proposals from the contract.
useEffect(() => {
  if (!hasClaimedNFT) {
    return;
  }

  // A simple call to vote.getAll() to grab the proposals.
  const getAllProposals = async () => {
    try {
      const proposals = await vote.getAll();
      setProposals(proposals);
      console.log("Proposals:", proposals);
    } catch (error) {
      console.log("failed to get proposals", error);
    }
  };
  getAllProposals();
}, [hasClaimedNFT, vote]);

// We also need to check if the user already voted.
useEffect(() => {
  if (!hasClaimedNFT) {
    return;
  }

  // If we haven't finished retrieving the proposals from the useEffect above
  // then we can't check if the user voted yet!
  if (!proposals.length) {
    return;
  }

  const checkIfUserHasVoted = async () => {
    try {
      const hasVoted = await vote.hasVoted(proposals[0].proposalId, address);
      setHasVoted(hasVoted);
      if (hasVoted) {
        console.log("User has already voted");
      } else {
        console.log("User has not voted yet");
      }
    } catch (error) {
      console.error("Failed to check if wallet has voted", error);
    }
  };
  checkIfUserHasVoted();

}, [hasClaimedNFT, proposals, address, vote]);



  //this use effect grabs all the addresses of members with nft
  useEffect(() => {
    if (!hasClaimedNFT) {
      return;
    }

    //A simple call to vote.getAll() to grab

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

//change network to goerli
if (address && (network?.[0].data.chain.id !== ChainId.Goerli)) {
  return (
    <div className="unsupported-network">
      <h2>Please connect to Goerli</h2>
      <p>
        This dapp only works on the Goerli network, please switch networks
        in your connected wallet.
      </p>
    </div>
  );
}

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
      <h1>FomDAO Member Page😎</h1>
      <p>i Know you like to party</p>
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
        <div>
          <h2>Active Proposals</h2>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              e.stopPropagation();

              //before we do async things, we want to disable the button to prevent double clicks
              setIsVoting(true);

              // lets get the votes from the form for the values
              const votes = proposals.map((proposal) => {
                const voteResult = {
                  proposalId: proposal.proposalId,
                  //abstain by default
                  vote: 2,
                };
                proposal.votes.forEach((vote) => {
                  const elem = document.getElementById(
                    proposal.proposalId + '-' + vote.type,
                  );

                  if (elem.checked) {
                    voteResult.vote = vote.type;
                    return;
                  }
                });
                return voteResult;
              });

              // first we need to make sure the user delegates their token to vote
              try {
                //we'll check if the wallet still needs to delegate their tokens before they can vote
                const delegation = await token.getDelegationOf(address);
                // if the delegation is the 0x0 address that means they have not delegated their governance tokens yet
                if (delegation === AddressZero) {
                  //if they haven't delegated their tokens yet, we'll have them delegate them before voting
                  await token.delegateTo(address);
                }
                // then we need to vote on the proposals
                try {
                  await Promise.all(
                    votes.map(async ({ proposalId, vote: _vote }) => {
                      // before voting we first need to check whether the proposal is open for voting
                      // we first need to get the latest state of the proposal
                      const proposal = await vote.get(proposalId);
                      // then we check if the proposal is open for voting (state === 1 means it is open)
                      if (proposal.state === 1) {
                        // if it is open for voting, we'll vote on it
                        return vote.vote(proposalId, _vote);
                      }
                      // if the proposal is not open for voting we just return nothing, letting us continue
                      return;
                    }),
                  );
                  try {
                    // if any of the propsals are ready to be executed we'll need to execute them
                    // a proposal is ready to be executed if it is in state 4
                    await Promise.all(
                      votes.map(async ({ proposalId }) => {
                        // we'll first get the latest state of the proposal again, since we may have just voted before
                        const proposal = await vote.get(proposalId);

                        //if the state is in state 4 (meaning that it is ready to be executed), we'll execute the proposal
                        if (proposal.state === 4) {
                          return vote.execute(proposalId);
                        }
                      }),
                    );
                    // if we get here that means we successfully voted, so let's set the "hasVoted" state to true
                    setHasVoted(true);
                    // and log out a success message
                    console.log('successfully voted');
                  } catch (err) {
                    console.error('failed to execute votes', err);
                  }
                } catch (err) {
                  console.error('failed to vote', err);
                }
              } catch (err) {
                console.error('failed to delegate tokens');
              } finally {
                // in *either* case we need to set the isVoting state to false to enable the button again
                setIsVoting(false);
              }
            }}
          >
            {proposals.map((proposal) => (
              <div key={proposal.proposalId} className="card">
                <h5>{proposal.description}</h5>
                <div>
                  {proposal.votes.map(({ type, label }) => (
                    <div key={type}>
                      <input
                        type="radio"
                        id={proposal.proposalId + '-' + type}
                        name={proposal.proposalId}
                        value={type}
                        //default the "abstain" vote to checked
                        defaultChecked={type === 2}
                      />
                      <label htmlFor={proposal.proposalId + '-' + type}>
                        {label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <button disabled={isVoting || hasVoted} type="submit">
              {isVoting
                ? 'Voting...'
                : hasVoted
                ? 'You Already Voted'
                : 'Submit Votes'}
            </button>
            {!hasVoted && (
              <small>
                This will trigger multiple transactions that you will need to
                sign.
              </small>
            )}
          </form>
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
