import React from 'react'

function InfoModal({ show, onClose }) {
  if (!show) return null;

  return (
    <div 
      id="infoModal" 
      className="modal" 
      onClick={(e) => {
        if (e.target.id === 'infoModal') {
          onClose();
        }
      }}
    >
      <div className="modal-content">
        <span className="close" onClick={onClose}>&times;</span>
        <h2>Info</h2>
        <p>This assistant is for guidance only. For serious medical concerns, please consult a healthcare professional.</p>
      </div>
    </div>
  )
}

export default InfoModal


