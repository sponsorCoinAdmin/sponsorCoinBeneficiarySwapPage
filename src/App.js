import './App.css';
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { GearFill } from 'react-bootstrap-icons';

import PageButton from './components/PageButton';
import ConnectButton from './components/ConnectButton';
import ConfigModal from './components/ConfigModal';
import CurrencyField from './components/CurrencyField';

import BeatLoader from "react-spinners/BeatLoader";
import { getWethContract as getTokenContract, getSpCoinContract , getPrice, runSwap } from './AlphaRouterService'

function App() {

  const TRANSACTION_STATE = {
    DISCONNECTED : "CONNECT",
    CONNECTING : "CONNECTING WALLET",
    CONNECTED : "SWAP",
    PENDING : "SWAP PENDING",
    REJECTED : "TRANSACTION REJECTED",
    COMPLETE : "SWAP"
  }
  
  const [provider, setProvider] = useState(undefined)
  const [signer, setSigner] = useState(undefined)
  const [signerAddress, setSignerAddress] = useState(undefined)

  const [slippageAmount, setSlippageAmount] = useState(2)
  const [deadlineMinutes, setDeadlineMinutes] = useState(10)
  const [showModal, setShowModal] = useState(undefined)

  const [inputAmount, setInputAmount] = useState(undefined)
  const [outputAmount, setOutputAmount] = useState(undefined)
  const [transaction, setTransaction] = useState(undefined)
  const [loading, setLoading] = useState(undefined)
  const [ratio, setRatio] = useState(undefined)
  const [tokenContract, setTokenContract] = useState(undefined)
  const [spCoinContract, setSpCoinContract] = useState(undefined)
  const [tokenAmount, setTokenAmount] = useState(undefined)
  const [spCoinAmount, setSpCoinAmount] = useState(undefined)
  const [tokenName, setTokenName] = useState("?")

  const [transactionState, setTransactionState] = useState(TRANSACTION_STATE.DISCONNECTED)
  const [isConnected, setIsConnected] = useState(false);

  // Page Configuration Fields
  const [swapTitle, setSwapTitle] = useState("Beneficary: Undefined");

  useEffect(() => {

    setConfigurations()

    const onLoad = async () => {
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      setProvider(provider)

      const tokenContract = getTokenContract()
      setTokenContract(tokenContract)

      const spCoinContract = getSpCoinContract()
      setSpCoinContract(spCoinContract)

      // ToDo Listener Events
      // provider.on("accountsChanged", handleAccountsChanged);
      // provider.on("chainChanged", handleChainChanged);
    }
    onLoad()
  }, [])

  const setConfigurations = () => {

    let swapTitle = "Beneficary: Sponsor's Coin"
    swapTitle = ""

    if (swapTitle !== undefined && swapTitle.length > 0)
    setSwapTitle(swapTitle)

  }

  // ToDo Implement
  const handleAccountsChanged = (accounts) => {
    console.log("AccountsChanged")
    alert("AccountsChanged")
  }

  // ToDo Implement
  const handleChainChanged = (chainId) => {
    console.log("chainId = " + chainId)
    alert("chainId = " + chainId)
  }

  const swap = async (transaction, signer) => {
    setTransactionState(TRANSACTION_STATE.PENDING)
    console.log("Executing:swap = async (transaction, signer)")

    const tx =  runSwap(transaction, signer)
    tx.then (tx => {processTransactionSuccess(tx)})
    .catch(tx => {processTransactionError(tx)});
  }

const processTransactionSuccess = async (tx) => {
    alert("SUCCESS => " + JSON.stringify(tx))
 console.log("SUCCESS => " + JSON.stringify(tx))
 let address = await signer.getAddress();
 await getBalances(address, tx)
 setTransactionState(TRANSACTION_STATE.COMPLETE)
}

const processTransactionError = async (tx) => {
  setTransactionState(TRANSACTION_STATE.REJECTED)
  //alert("ERROR => " + JSON.stringify(tx))
  alert("ERROR => " + JSON.stringify(tx.reason))
  console.log("ERROR => " + JSON.stringify(tx))
  setTransactionState(TRANSACTION_STATE.COMPLETE)
}

  const connect = async provider => {
    setTransactionState(TRANSACTION_STATE.CONNECTING)
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    setSigner(signer)
     if (signer !== undefined) {
      setIsConnected(true)
      setTransactionState(TRANSACTION_STATE.CONNECTED)
    }
  }

  
//  const isConnected = () => signer !== undefined

  const getWalletAddress = () => {
    signer.getAddress()
      .then(address => {
        setSignerAddress(address)
        getBalances (address)
       })
  }

  const getBalances = async (address, tx) =>  {
    if (tx !== undefined)
      await tx.wait()
    tokenContract.balanceOf(address)
      .then(res => {
        setTokenAmount( Number(ethers.utils.formatEther(res)) )
      })
    setTokenName("WETH");

    spCoinContract.balanceOf(address)
      .then(res => {
        setSpCoinAmount( Number(ethers.utils.formatEther(res)) )
      })
    // ToDo get Token Name
  }

  if (signer !== undefined) {
    getWalletAddress()
  }

  const getSwapPrice = (inputAmount) => {
    setLoading(true)
    setInputAmount(inputAmount)
    const minThreashHold = 0;

    if (inputAmount > minThreashHold) {
      const swap = getPrice(
        inputAmount,
        slippageAmount,
        Math.floor(Date.now()/1000 + (deadlineMinutes * 60)),
        signerAddress
      ).then(data => {
        setTransaction(data[0])
        setOutputAmount(data[1])
        setRatio(data[2])
        setLoading(false)
      })
    }
    else {
      setTransaction(TRANSACTION_STATE.COMPLETE)
      setOutputAmount("0.0")
      setRatio()
      setLoading(false) 
    }
  }

  return (
    <div className="App">
      <div className="appNav">
        <div className="my-2 buttonContainer buttonContainerTop">
          <PageButton name={"Swap"} isBold={true} />
          <PageButton name={"Pool"} />
          <PageButton name={"Vote"} />
          <PageButton name={"Charts"} />
        </div>

        <div className="rightNav">
          <div className="connectButtonContainer">
            <ConnectButton
              provider={provider}
              isConnected={isConnected}
              signerAddress={signerAddress}
              getSigner={connect}
            />
          </div>
          <div className="my-2 buttonContainer">
            <PageButton name={"..."} isBold={true} />
          </div>
        </div>
      </div>

      <div className="appBody">
        <div className="swapContainer">
          <div className="swapHeader">
            <span className="swapText">{swapTitle}</span>
            <span className="gearContainer" onClick={() => setShowModal(true)}>
              <GearFill />
            </span>
            {showModal && (
              <ConfigModal
                onClose={() => setShowModal(false)}
                setDeadlineMinutes={setDeadlineMinutes}
                deadlineMinutes={deadlineMinutes}
                setSlippageAmount={setSlippageAmount}
                slippageAmount={slippageAmount} />
            )}
          </div>
          <div className="swapBody">
            <CurrencyField
              field="input"
              tokenName={tokenName}
              getSwapPrice={getSwapPrice}
              signer={signer}
              balance={tokenAmount} />
            <CurrencyField
              field="output"
              tokenName="SPCoin"
              value={outputAmount}
              signer={signer}
              balance={spCoinAmount}
              spinner={BeatLoader}
              loading={loading} />
          </div>

          <div className="ratioContainer">
            {ratio && (
              <>
                {`1 SPCoin = ${ratio} ${tokenName}`}
              </>
            )}
          </div>

          <div className="swapButtonContainer">
            {isConnected ? (
              <div
                onClick={() => swap(transaction, signer)}
                className="swapButton"
              > {transactionState}
              </div>
            ) : (
              <div
                onClick={() => connect(provider)}
                className="swapButton"
              >
                {transactionState}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App