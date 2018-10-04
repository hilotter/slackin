/* global io,superagent */

var body = document.body
var request = superagent

// elements
var form = body.querySelector('form#invite')
var channel = form.elements['channel'] || {}
var email = form.elements['email']
var coc = form.elements['coc']
var button = body.querySelector('button')

// remove loading state
button.className = ''

// capture submit
body.addEventListener('submit', function (ev){
  ev.preventDefault()
  button.disabled = true
  button.className = ''
  button.innerHTML = 'Please Wait'

  // Modified by Hi-Ether
  if (!HiEther.accountAvailable()) {
    button.disabled = false
    button.innerHTML = 'Unlock your MetaMask account'
    return
  }
  HiEther.sign(email.value, function (signature) {
    if (!signature) {
      button.disabled = false
      button.innerHTML = 'Get my Invite'
      return
    }
    invite(channel ? channel.value : null, coc && coc.checked ? 1 : 0, email.value, signature, function (err, msg) {
      if (err) {
        button.removeAttribute('disabled')
        button.className = 'error'
        button.innerHTML = err.message
      } else {
        button.className = 'success'
        button.innerHTML = msg
      }
    })
  })
})

function invite (channel, coc, email, signature, fn){
  request
  .post(data.path + 'invite')
  .send({
    coc: coc,
    channel: channel,
    email: email,
    signature: signature
  })
  .end(function (res){
    if (res.body.redirectUrl) {
      window.setTimeout(function () {
        topLevelRedirect(res.body.redirectUrl)
      }, 1500)
    }
    if (res.error) {
      var err = new Error(res.body.msg || 'Server error')
      return fn(err)
    } else {
      fn(null, res.body.msg)
    }
  })
}

// use dom element for better cross browser compatibility
var url = document.createElement('a')
url.href = window.location
// realtime updates
var socket = io({ path: data.path + 'socket.io' })
socket.on('data', function (users){
  for (var i in users) update(i, users[i])
})
socket.on('total', function (n){ update('total', n) })
socket.on('active', function (n){ update('active', n) })

function update (val, n, noanim){
  var el = document.querySelector('.' + val)
  if (el && n != el.innerHTML) {
    el.innerHTML = n
    anim(el, val)
  }
}

function anim (el, c){
  if (el.anim) return
  el.className = c + ' grow'
  el.anim = setTimeout(function (){
    el.className = c
    el.anim = null
  }, 150)
}

// redirect, using "RPC" to parent if necessary
function topLevelRedirect (url) {
  if (window === top) location.href = url
  else parent.postMessage('slackin-redirect:' + id + ':' + url, '*')
  // Q: Why can't we just `top.location.href = url;`?
  // A:
  // [sandboxing]: http://www.html5rocks.com/en/tutorials/security/sandboxed-iframes/
  // [CSP]: http://www.html5rocks.com/en/tutorials/security/content-security-policy/
  // [nope]: http://output.jsbin.com/popawuk/16
};

// "RPC" channel to parent
var id
window.addEventListener('message', function onmsg (e){
  if (/^slackin:/.test(e.data)) {
    id = e.data.replace(/^slackin:/, '')
    window.removeEventListener('message', onmsg)
  }
})


// Added by Hi-Ether
var HiEther = {
  messageToBeSigned: function (email) {
    return `Send a slack invitation to ${email}`
  },
  init: function () {
    if (typeof web3 !== 'undefined') {
      window.web3 = new Web3(web3.currentProvider)
    } else {
      button.disabled = true
      button.className = ''
      button.innerHTML = 'Please Download MetaMask'
      window.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
    }
  },
  sign: function (email, callback) {
    var text = this.messageToBeSigned(email)
    var msg = web3.toHex(text)
    var from = web3.eth.accounts[0]
    var params = [msg, from]
    var method = 'personal_sign'
    web3.currentProvider.sendAsync({ method: method, params: params, from: from }, function (err, result) {
      if (err) {
        console.error(err)
        return callback(null)
      }
      if (result.error) {
        console.error(result.error)
        return callback(null)
      }
      var signature = result.result
      return callback(signature)
    })
  },
  accountAvailable() {
    return typeof web3.eth.accounts[0] !== 'undefined'
  }
}

window.addEventListener('load', function() {
  HiEther.init()
})
