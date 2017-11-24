import * as sigUtil from 'eth-sig-util'
import * as ethUtil from 'ethereumjs-util'
import * as BigNumber from 'bignumber.js'
import Web3 from 'web3'

const PROVIDER_URL = 'https://ropsten.infura.io'
const MINIMUM_BALANCE = 1.0

const provider = new Web3.providers.HttpProvider(PROVIDER_URL)
const web3 = new Web3(provider)

function messageToBeSigned(email) {
  return 'Send a slack invitation for Hi-Ether to ' + email
}

export default {
  verify(email, signature) {
    return new Promise((resolve, reject) => {
      let message = messageToBeSigned(email)
      let data = ethUtil.bufferToHex(new Buffer(message, 'utf8'))
      let address = sigUtil.recoverPersonalSignature({ data: data, sig: signature })
      web3.eth.getBalance(address, (error, balance) => {
        if (error) {
          reject(new Error('Could not check your ETH Balance'))
        }
        if (balance.lt(web3.toWei(MINIMUM_BALANCE, 'ether'))) {
          reject(new Error('The account you provided does not hold enough Ropsten ETH'))
        }
        resolve({ balance })
      })
    })
  }
}
