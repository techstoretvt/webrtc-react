// src/App.js
import Peer from "peerjs";
import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";

// const socket = io("http://localhost:5000");

const peer = new Peer();

const App = () => {
  const [yourId, setYourId] = useState("");
  const [remoteId, setRemoteId] = useState("");

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  useEffect(() => {
    peer.on("open", (id) => {
      setYourId(id);
    });

    peer.on("call", (call) => {
      openStream().then((stream) => {
        call.answer(stream);
        playStream(localVideoRef.current, stream);
        call.on("stream", (remoteStream) => {
          playStream(remoteVideoRef.current, remoteStream);
        });
      });
    });
  }, []);

  const openStream = () => {
    const config = {
      audio: false,
      video: true,
    };
    return navigator.mediaDevices.getUserMedia(config);
  };

  const playStream = (video, stream) => {
    video.srcObject = stream;
  };

  const onClickBtnCall = () => {
    openStream().then((stream) => {
      playStream(localVideoRef.current, stream);
      const call = peer.call(remoteId, stream);
      call.on("stream", (remoteStream) => {
        playStream(remoteVideoRef.current, remoteStream);
      });
    });
  };

  return (
    <div>
      <h3>
        Your ID: <p>{yourId}</p>
      </h3>
      <div>
        <h2>Local Video</h2>
        <video ref={localVideoRef} autoPlay playsInline muted width={300} />
      </div>
      <div>
        <h2>Remote Video</h2>
        <video ref={remoteVideoRef} autoPlay playsInline width={300} />
      </div>
      <input value={remoteId} onChange={(e) => setRemoteId(e.target.value)} />
      <button onClick={onClickBtnCall}>Call</button>
    </div>
  );
};

export default App;
