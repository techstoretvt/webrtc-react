// ShareButton.js
import React from "react";

const ShareButton = ({ startSharing, stopSharing }) => {
  return (
    <div>
      <button onClick={startSharing}>Start Sharing Webcam</button>
      <button onClick={stopSharing}>Stop Sharing Webcam</button>
    </div>
  );
};

export default ShareButton;
