if (Meteor.isClient) {
  Template.hello.events({
    "click #makeCall": function () {
      var outgoingCall = peer.call($('#remotePeerId').val(), window.localStream);
      window.currentCall = outgoingCall;
      outgoingCall.on('stream', function (remoteStream) {
        window.remoteStream = remoteStream;
        $('#theirVideo').prop('src', URL.createObjectURL(remoteStream));
      });
    },
    "click #endCall": function () {
      window.currentCall.close();
    }
  });

  Template.hello.onCreated(function () {
      window.peer = new Peer({
      key: '2p9ffp7ol6p3nmi',  // change this key
      debug: 3,
      config: {'iceServers': [
        { url: 'stun:stun.l.google.com:19302' },
        { url: 'stun:stun1.l.google.com:19302' },
      ]}
    });

    peer.on('open', function () {
      $('#myPeerId').text(peer.id);
    });

    // This event: remote peer receives a call
    peer.on('call', function (incomingCall) {
      window.currentCall = incomingCall;
      incomingCall.answer(window.localStream);
      incomingCall.on('stream', function (remoteStream) {
        window.remoteStream = remoteStream;
        $('#theirVideo').prop('src', URL.createObjectURL(remoteStream));
      });
    });
  });

  navigator.getUserMedia = ( navigator.getUserMedia ||
                    navigator.webkitGetUserMedia ||
                    navigator.mozGetUserMedia ||
                    navigator.msGetUserMedia );

  // get audio/video
  navigator.getUserMedia({audio:false, video: true}, function (stream) {
    //display video
    $('#myVideo').prop('src', URL.createObjectURL(stream));
    window.localStream = stream;
  }, function (error) { console.log(error); }
  );

}

if (Meteor.isServer) {
}
