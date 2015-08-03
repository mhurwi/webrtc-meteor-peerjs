if (Meteor.isClient) {
  Template.hello.events({
    "click #makeCall": function () {
      var user = this;
      var outgoingCall = peer.call(user.profile.peerId, window.localStream);
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

  Template.hello.helpers({
    users: function () {
      // exclude the currentUser
      var userIds = Presences.find().map(function(presence) {return presence.userId;});
      return Meteor.users.find({_id: {$in: userIds, $ne: Meteor.userId()}});
    }
  });

  Template.hello.onCreated(function () {
    Meteor.subscribe("presences");
    Meteor.subscribe("onlineUsers");

    window.peer = new Peer({
      key: '2p9ffp7ol6p3nmi',  // change this key
      debug: 3,
      config: {'iceServers': [
        { url: 'stun:stun.l.google.com:19302' },
        { url: 'stun:stun1.l.google.com:19302' },
      ]}
    });

    // This event: remote peer receives a call
    peer.on('open', function () {
      $('#myPeerId').text(peer.id);
      // update the current user's profile
      Meteor.users.update({_id: Meteor.userId()}, {
        $set: {
          profile: { peerId: peer.id}
        }
      });
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

    navigator.getUserMedia = ( navigator.getUserMedia ||
                      navigator.webkitGetUserMedia ||
                      navigator.mozGetUserMedia ||
                      navigator.msGetUserMedia );

    // get audio/video
    navigator.getUserMedia({audio:true, video: true}, function (stream) {
      //display video
      $('#myVideo').prop('src', URL.createObjectURL(stream));
      window.localStream = stream;
    }, function (error) { console.log(error); }
    );

  });

}

if (Meteor.isServer) {
  Meteor.publish('presences', function() {
    return Presences.find({}, { userId: true });
  });
  Meteor.publish("onlineUsers", function () {
    return Meteor.users.find({}, {fields: {"profile.peerId": true, "emails.address": true} });
  });
}
