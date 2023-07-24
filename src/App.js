// src/App.js
import Peer from "peerjs";
import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";

const socket = io(process.env.REACT_APP_URL_BACKEND);

const peer = new Peer();

const App = () => {
  const [yourId, setYourId] = useState("");
  const [remoteId, setRemoteId] = useState("");
  const [username, setUsername] = useState("");
  const [arrUser, setArrUser] = useState([]);
  const [showChat, setShowChat] = useState(false);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  useEffect(() => {
    socket.on("connect", () => {
      console.log("user connect: ", socket.id);
    });

    socket.on("DANH_SACH_ONLINE", (arrUserInfo) => {
      setArrUser(arrUserInfo);
      setShowChat(true);

      socket.on("CO_NGUOI_DUNG_MOI", (user) => {
        setArrUser((arrOld) => [...arrOld, user]);
      });

      socket.on("AI_DO_NGAT_KET_NOT", (peerId) => {
        setArrUser((arrOld) => {
          const newArr = [...arrOld];
          const index = newArr.findIndex((user) => user.peerId === peerId);
          newArr.splice(index, 1);
          return newArr;
        });
      });
    });

    socket.on("DANH_KY_THAT_BAI", () => {
      alert("Vui long chon username khac!");
    });

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

    return () => {
      socket.on("disconnect", () => {
        console.log(socket.id); // undefined
      });
    };
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

  const onClickBtnSignUp = () => {
    if (yourId)
      socket.emit("NGUOI_DUNG_DANG_KY", { ten: username, peerId: yourId });
  };

  const onClickUserName = (peerId) => {
    if (peerId !== yourId) {
      openStream().then((stream) => {
        playStream(localVideoRef.current, stream);
        const call = peer.call(peerId, stream);
        call.on("stream", (remoteStream) => {
          playStream(remoteVideoRef.current, remoteStream);
        });
      });
    }
  };

  return (
    <div>
      {showChat && (
        <>
          <p>Online Users:</p>
          <ul>
            {arrUser?.map((item) => (
              <li
                key={item.peerId}
                onClick={() => onClickUserName(item.peerId)}
              >
                {item.ten}
              </li>
            ))}
          </ul>
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
          <input
            value={remoteId}
            onChange={(e) => setRemoteId(e.target.value)}
            placeholder="Remote ID"
          />
          <button onClick={onClickBtnCall}>Call</button>
          <br />
        </>
      )}

      {!showChat && (
        <>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
          />
          <button onClick={onClickBtnSignUp}>Sing up</button>
        </>
      )}
    </div>
  );
};

export default App;
