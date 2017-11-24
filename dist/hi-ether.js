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

var provider = new _web2.default.providers.HttpProvider('https://ropsten.infura.io');
var web3 = new _web2.default(provider);

exports.default = {
  verify: function verify(email, signature) {
    return new Promise(function (resolve, reject) {
      var message = 'Send a slack invitation for Hi-Ether to ' + email;
      var data = ethUtil.bufferToHex(new Buffer(message, 'utf8'));
      var address = sigUtil.recoverPersonalSignature({ data: data, sig: signature });
      web3.eth.getBalance(address, function (error, balance) {
        if (error) {
          reject(new Error('Could not check your ETH Balance'));
        }
        if (balance.lt(1.0)) {
          reject(new Error('The account you provided does not hold enough ETH'));
        }
        resolve({ balance: balance });
      });
    });
  }
};