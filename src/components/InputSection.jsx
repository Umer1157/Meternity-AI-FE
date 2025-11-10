import React from 'react'

function InputSection({ 
  inputText, 
  setInputText, 
  onGenerate, 
  isListening, 
  onToggleSpeech, 
  isSpeechSupported 
}) {
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      onGenerate();
    }
  };

  return (
    <div className="input-section">
      <div className="input-wrapper">
        <input 
          type="text" 
          id="inputText" 
          placeholder="Share your pregnancy stage and how you're feeling..." 
          className="input-field" 
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={handleKeyPress}
          autoComplete="off" 
          autoCorrect="off" 
          spellCheck="false"
        />
        <button 
          id="micBtn" 
          className={`mic-btn ${isListening ? 'mic-active' : ''}`}
          onClick={onToggleSpeech}
          style={{ display: isSpeechSupported ? 'flex' : 'none' }}
        >
          <img src="/mic.png" alt="Microphone" className="mic-icon" />
        </button>
      </div>
      <button id="generateBtn" className="generate-btn" onClick={onGenerate}>
        Generate Advice
      </button>
    </div>
  )
}

export default InputSection

