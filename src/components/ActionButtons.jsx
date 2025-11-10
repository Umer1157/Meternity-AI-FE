import React from 'react'

function ActionButtons({ onCopy, onDownload, onInfo }) {
  return (
    <div className="buttons">
      <button id="copyBtn" className="action-btn" onClick={onCopy}>Copy</button>
      <button id="downloadBtn" className="action-btn" onClick={onDownload}>Download</button>
      <button id="infoBtn" className="action-btn" onClick={onInfo}>Info</button>
    </div>
  )
}

export default ActionButtons


