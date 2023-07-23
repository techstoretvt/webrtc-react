// src/App.js
import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:5000");

const App = () => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  let localStream, remoteStream;
  let peerConnection;

  useEffect(() => {
    const callUser = async () => {
      try {
        // Lấy truy cập vào camera và microphone của người dùng
        localStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        // Hiển thị video từ camera người dùng
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = localStream;
        }

        // Tạo kết nối peer-to-peer
        peerConnection = new RTCPeerConnection();

        // Thêm stream của người dùng vào kết nối peer-to-peer
        localStream
          .getTracks()
          .forEach((track) => peerConnection.addTrack(track, localStream));

        // Xử lý sự kiện nhận được stream từ người dùng khác
        peerConnection.ontrack = (event) => {
          remoteStream = event.streams[0];
          // Hiển thị video từ người dùng khác
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
          }
        };

        // Xử lý ICE candidate và gửi cho server
        peerConnection.onicecandidate = (event) => {
          if (event.candidate) {
            socket.emit("candidate", event.candidate);
          }
        };

        // Tạo SDP offer và gửi cho server
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        socket.emit("offer", offer);
      } catch (error) {
        console.error("Error accessing media devices:", error);
      }
    };

    // Gọi video tự động khi vào trang
    callUser();
  }, []);

  return (
    <div>
      <div>
        <h2>Local Video</h2>
        <video ref={localVideoRef} autoPlay playsInline muted />
      </div>
      <div>
        <h2>Remote Video</h2>
        <video ref={remoteVideoRef} autoPlay playsInline />
      </div>
    </div>
  );
};

export default App;
