import {useAddress, ConnectWallet } from '@thirdweb-dev/react';


const App = () => {
  //thirdweb hooks
  const address = useAddress();
  console.log("Address:", address);

//if not connected
if(!address){
  return (
    <div className="landing">
      <h1>Welcome to FomDAO</h1>
      <div className="btn-hero">
        <ConnectWallet/>
      </div>
    </div>
  );
}

//if connected render landing
  return (
    <div className="landing">
      <h1>connected to FomDAO</h1>
    </div>
  );
};

export default App;
