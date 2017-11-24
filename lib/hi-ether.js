import * as sigUtil from 'eth-sig-util'
import * as ethUtil from 'ethereumjs-util'
import * as BigNumber from 'bignumber.js'
import Web3 from 'web3'
const provider = new Web3.providers.HttpProvider('https://ropsten.infura.io')
const web3 = new Web3(provider)

export default {
  verify(email, signature) {
    return new Promise((resolve, reject) => {
      let message = 'Send a slack invitation for Hi-Ether to ' + email
      let data = ethUtil.bufferToHex(new Buffer(message, 'utf8'))
      let address = sigUtil.recoverPersonalSignature({ data: data, sig: signature })
      web3.eth.getBalance(address, (error, balance) => {
        if (error) {
          reject(new Error('Could not check your ETH Balance'))
        }
        if (balance.lt(1.0)) {
          reject(new Error('The account you provided does not hold enough ETH'))
        }
        resolve({ balance })
      })
    })
  }
}
