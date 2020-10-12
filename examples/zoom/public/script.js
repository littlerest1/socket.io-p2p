const videoGrid = document.getElementById('video-grid')
const myVideo = document.createElement('video')
myVideo.muted = true

if(status == 'lounge'){
  document.getElementById('start').style.visibility = ""
}
document.getElementById('start').addEventListener('click', redirectTo);
function redirectTo(){
  var li = document.createElement('li')
  var a = document.createElement('a')
  a.id = 'room'
  var link = "http://localhost:3000/"+ ROOM_ID
  console.log("direct to ",link)
  var linkText = document.createTextNode(link)
  a.href = link
  a.appendChild(linkText)
  li.appendChild(a)
  document.getElementById('zoomLink').appendChild(li)
}

const peers = {}
const socket = io('/')
const myPeer = new Peer(undefined, {
  host: '/',
  port: '3001'
})


myPeer.on('open', id => {
  socket.emit('join-room', ROOM_ID, id)
})

socket.on('user-connected', userId => {
    console.log("User Connected " + userId)
})

if(status == "InRoom"){
  navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
  }).then(stream => {
    addVideoStream(myVideo, stream)

    myPeer.on('call', call => {
      call.answer(stream)
      const video = document.createElement('video')
      call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream)
      })
    })

    socket.on('user-connected', userId => {
      console.log("User Connected " + userId)
      connectToNewUser(userId, stream)
    })

    socket.on('user-disconnected', userId => {
      if (peers[userId]) peers[userId].close()
    })
  })
}

function connectToNewUser(userId, stream) {
    const call = myPeer.call(userId, stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
      addVideoStream(video, userVideoStream)
    })
    call.on('close', () => {
      video.remove()
    })
  
    peers[userId] = call
}

function addVideoStream(video, stream) {
  video.srcObject = stream
  video.addEventListener('loadedmetadata', () => {
    video.play()
  })
  videoGrid.append(video)
}



