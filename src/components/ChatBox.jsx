import React, { useImperativeHandle, forwardRef } from 'react'

const ChatBox = forwardRef(({ outputContent, isRTL }, ref) => {
  const chatBoxRef = React.useRef(null);

  useImperativeHandle(ref, () => ({
    getText: () => {
      if (chatBoxRef.current) {
        return chatBoxRef.current.innerText || '';
      }
      return '';
    }
  }));

  return (
    <div 
      className="chat-box" 
      id="outputContent"
      ref={chatBoxRef}
    >
      {outputContent && (
        <div 
          id="adviceContainer"
          dir={isRTL ? 'rtl' : 'ltr'}
          style={{ textAlign: isRTL ? 'right' : 'left' }}
          dangerouslySetInnerHTML={{ __html: outputContent }}
        />
      )}
    </div>
  )
});

ChatBox.displayName = 'ChatBox';

export default ChatBox
