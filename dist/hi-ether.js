'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _ethSigUtil = require('eth-sig-util');

var sigUtil = _interopRequireWildcard(_ethSigUtil);

var _ethereumjsUtil = require('ethereumjs-util');

var ethUtil = _interopRequireWildcard(_ethereumjsUtil);

var _bignumber = require('bignumber.js');

var BigNumber = _interopRequireWildcard(_bignumber);

var _web = require('web3');

var _web2 = _interopRequireDefault(_web);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var PROVIDER_URL = process.env.INFURA_URL;
var TOKEN_ADDRESS = process.env.TOKEN_ADDRESS;
var MINIMUM_BALANCE = process.env.MINIMUM_BALANCE;

var provider = new _web2.default.providers.HttpProvider(PROVIDER_URL);
var web3 = new _web2.default(provider);

var erc20ABI = [{
  "constant": true,
  "inputs": [{ "name": "_owner", "type": "address" }],
  "name": "balanceOf",
  "outputs": [{ "name": "balance", "type": "uint256" }],
  "type": "function"
}, {
  "constant": true,
  "inputs": [],
  "name": "decimals",
  "outputs": [{ "name": "", "type": "uint8" }],
  "type": "function"
}];
var erc20contract = web3.eth.contract(erc20ABI).at(TOKEN_ADDRESS);

function messageToBeSigned(email) {
  return 'Send a slack invitation to ' + email;
}

exports.default = {
  verify: function verify(email, signature) {
    return new Promise(function (resolve, reject) {
      var message = messageToBeSigned(email);
      var data = ethUtil.bufferToHex(new Buffer(message, 'utf8'));
      var address = sigUtil.recoverPersonalSignature({ data: data, sig: signature });
      erc20contract.balanceOf(address, function (error, balance) {
        if (error) {
          reject(new Error('Could not check your Token Balance'));
        }
        erc20contract.decimals(function (error, decimals) {
          if (error) {
            reject(new Error('Could not check Token Decimals'));
          }
          var tokenBalance = balance.div(10 ** decimals);
          if (tokenBalance.lt(MINIMUM_BALANCE)) {
            reject(new Error('The account you provided does not hold enough Token'));
          }
          resolve({ tokenBalance: tokenBalance });
        });
      });
    });
  }
};