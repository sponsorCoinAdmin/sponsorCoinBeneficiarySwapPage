const { AlphaRouter } = require('@uniswap/smart-order-router')
const { Token, CurrencyAmount, TradeType, Percent } = require('@uniswap/sdk-core')
const { ethers, BigNumber } = require('ethers')
const JSBI = require('jsbi')
const ERC20ABI = require('./interfaces/ABI.json')
const SPCOINABI = require('./interfaces/SPCOIN_ABI.json')

const V3_SWAP_ROUTER_ADDRESS = '0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45'
const REACT_APP_INFURA_URL_TESTNET = process.env.REACT_APP_INFURA_URL_TESTNET

// Goerli Test Net
const chainId = 5

const web3Provider = new ethers.providers.JsonRpcProvider(REACT_APP_INFURA_URL_TESTNET)
const router = new AlphaRouter({ chainId: chainId, provider: web3Provider })

let tokenName = 'Wrapped Ether'
let tokenSymbol = 'WETH'
let tokenAddress = '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6'

const decimals0 = 18

const spCoinName = 'Sponsor Coin'
const spCoinSymbol = 'SPCoin'
const spCoinAddress = '0x3Cb3d2655dB27d0ef62f0B77E0e13c06630317Ef'

const decimals1 = 18

const WETH = new Token(chainId, tokenAddress, decimals0, tokenSymbol, tokenName)
const SPCOIN = new Token(chainId, spCoinAddress, decimals1, spCoinSymbol, spCoinName)

export const getWethContract = () => new ethers.Contract(tokenAddress, ERC20ABI, web3Provider)
export const getSpCoinContract = () => new ethers.Contract(spCoinAddress, SPCOINABI, web3Provider)

export const getPrice = async (inputAmount, slippageAmount, deadline, walletAddress) => {
  const percentSlippage = new Percent(slippageAmount, 100)
  const wei = ethers.utils.parseUnits(inputAmount.toString(), decimals0)
  const currencyAmount = CurrencyAmount.fromRawAmount(WETH, JSBI.BigInt(wei))

  const route = await router.route(
    currencyAmount,
    SPCOIN,
    TradeType.EXACT_INPUT,
    {
      recipient: walletAddress,
      slippageTolerance: percentSlippage,
      deadline: deadline,
    }
  )

  const transaction = {
    data: route.methodParameters.calldata,
    to: V3_SWAP_ROUTER_ADDRESS,
    value: BigNumber.from(route.methodParameters.value),
    from: walletAddress,
    gasPrice: BigNumber.from(route.gasPriceWei),
    gasLimit: ethers.utils.hexlify(1000000)
  }

  const quoteAmountOut = route.quote.toFixed(6)
  const ratio = (inputAmount / quoteAmountOut).toFixed(10)

  return [
    transaction,
    quoteAmountOut,
    ratio
  ]
}

export const runSwap = async (transaction, signer) => {
  const approvalAmount = ethers.utils.parseUnits('10', 18).toString()
  const contract0 = getWethContract()
  await contract0.connect(signer).approve(
    V3_SWAP_ROUTER_ADDRESS,
    approvalAmount
  )

  // return await signer.sendTransaction(transaction).wait()
  const tx = signer.sendTransaction(transaction)
              // .then (tx => {console.log("SUCCESS => " + JSON.stringify(tx))})
              // .catch(tx => {console.log("ERROR => " + JSON.stringify(tx))});
  return  tx
}