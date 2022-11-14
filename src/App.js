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

  useEffect(() => {
    const onLoad = async () => {
      const provider = await new ethers.providers.Web3Provider(window.ethereum)
      setProvider(provider)

      const tokenContract = getTokenContract()
      setTokenContract(tokenContract)

      const spCoinContract = getSpCoinContract()
      setSpCoinContract(spCoinContract)

      // Listener Events
      provider.on("accountsChanged", handleAccountsChanged);
      provider.on("chainChanged", handleChainChanged);
    }
    onLoad()
  }, [])

  const handleAccountsChanged = (accounts) => {
    console.log("AccountsChanged")
    alert("AccountsChanged")
  }

  const handleChainChanged = (chainId) => {
    console.log("chainId = " + chainId)
    alert("chainId = " + chainId)
  }

  async function sleep(milliseconds) {
    console.log("Sleeping " + milliseconds/1000 + " Seconds")

    const promise =  new Promise(resolvePromise => setTimeout(resolvePromise, milliseconds));
    //await promise
    //alert("Sleep Complete 2")
    return promise
  }

  const swap = async (transaction, signer) => {
    console.log("Executing:swap = async (transaction, signer)")

    let address = await signer.getAddress();
    const tx = await runSwap(transaction, signer)
    //alert("Starting Sleep")
    await sleep(20000)
    //alert("Sleep Complete 2")
    getBalances(address)
  }

  const getSigner = async provider => {
    provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    setSigner(signer)
  }
  
  const isConnected = () => signer !== undefined
  const getWalletAddress = () => {
    signer.getAddress()
      .then(address => {
        setSignerAddress(address)
        getBalances (address)
       })
  }

  const getBalances = (address) => {
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
              getSigner={getSigner}
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
            <span className="swapText">Swap</span>
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
            {isConnected() ? (
              <div
               // onClick={() => runSwap(transaction, signer)}
                onClick={() => swap(transaction, signer)}
                className="swapButton"
              >transaction
                Swap
              </div>
            ) : (
              <div
                onClick={() => getSigner(provider)}
                className="swapButton"
              >
                Connect Wallet
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App