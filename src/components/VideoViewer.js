// VideoViewer.js
import React, { useRef, useEffect } from "react";

const VideoViewer = ({ stream }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (stream && videoRef.current) {
      console.log("stream: ", stream);
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return <video ref={videoRef} autoPlay playsInline />;
};

export default VideoViewer;
