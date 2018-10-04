import * as sigUtil from 'eth-sig-util'
import * as ethUtil from 'ethereumjs-util'
import * as BigNumber from 'bignumber.js'
import Web3 from 'web3'

const PROVIDER_URL = process.env.INFURA_URL
const TOKEN_ADDRESS = process.env.TOKEN_ADDRESS
const MINIMUM_BALANCE = process.env.MINIMUM_BALANCE

const provider = new Web3.providers.HttpProvider(PROVIDER_URL)
const web3 = new Web3(provider)

const erc20ABI = [
  {
    "constant":true,
    "inputs":[{"name":"_owner","type":"address"}],
    "name":"balanceOf",
    "outputs":[{"name":"balance","type":"uint256"}],
    "type":"function"
  },
  {
    "constant":true,
    "inputs":[],
    "name":"decimals",
    "outputs":[{"name":"","type":"uint8"}],
    "type":"function"
  }
]
const erc20contract = web3.eth.contract(erc20ABI).at(TOKEN_ADDRESS)

function messageToBeSigned(email) {
  return `Send a slack invitation to ${email}`
}

export default {
  verify(email, signature) {
    return new Promise((resolve, reject) => {
      let message = messageToBeSigned(email)
      let data = ethUtil.bufferToHex(new Buffer(message, 'utf8'))
      let address = sigUtil.recoverPersonalSignature({ data: data, sig: signature })
      erc20contract.balanceOf(address, (error, balance) => {
        if (error) {
          reject(new Error('Could not check your Token Balance'))
        }
        erc20contract.decimals((error, decimals) => {
          if (error) {
            reject(new Error('Could not check Token Decimals'))
          }
          const tokenBalance = balance.div(10**decimals);
          if (tokenBalance.lt(MINIMUM_BALANCE)) {
            reject(new Error('The account you provided does not hold enough Token'))
          }
          resolve({ tokenBalance })
        })
      })
    })
  }
}
