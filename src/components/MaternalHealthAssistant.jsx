import { useState, useRef, useEffect } from 'react'
import './../App.css'
import Header from './Header'
import InputSection from './InputSection'
import ChatBox from './ChatBox'
import ActionButtons from './ActionButtons'
import InfoModal from './InfoModal'
import Loader from './Loader'
import Footer from './Footer'
import { useSpeechRecognition } from '../hooks/useSpeechRecognition'
import { formatAdvice } from '../utils/formatAdvice'
import { generateAdvice } from '../utils/api'
import { useAuth } from '../context/AuthContext'
import { createChat, updateChat, getChatById } from '../utils/chats'

function MaternalHealthAssistant({ chatId, onBack, onClose }) {
  const [inputText, setInputText] = useState('');
  const [outputContent, setOutputContent] = useState('');
  const [isRTL, setIsRTL] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [currentChatId, setCurrentChatId] = useState(chatId || null);
  const [loadingChat, setLoadingChat] = useState(false);
  const chatBoxRef = useRef(null);
  const { user } = useAuth();

  // Speech recognition hook
  const { isListening, toggleListening, stopListening, isSupported: isSpeechSupported } = useSpeechRecognition((transcript) => {
    setInputText(transcript);
  });

  // Load chat if chatId is provided
  useEffect(() => {
    if (chatId && user?.email) {
      loadChat(chatId);
      setCurrentChatId(chatId); // Set when explicitly loading a chat
    } else if (!chatId) {
      // Reset for new chat
      setInputText('');
      setOutputContent('');
      setCurrentChatId(null);
      setIsRTL(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatId, user?.email]);

  // Load chat function
  const loadChat = async (id) => {
    if (!user?.email) return;
    
    setLoadingChat(true);
    try {
      const chat = await getChatById(id, user.email);
      setInputText(chat.user_input);
      const formattedContent = formatAdvice(chat.advice_output);
      setOutputContent(formattedContent);
      setIsRTL(/[\u0600-\u06FF]/.test(chat.advice_output));
      setCurrentChatId(chat.id);
    } catch (error) {
      alert('Failed to load chat: ' + error.message);
    } finally {
      setLoadingChat(false);
    }
  };

  // Handle generate advice
  const handleGenerate = async () => {
    // Stop speech recognition if active
    stopListening();

    const userInput = inputText.trim();

    // Check if input is empty
    if (userInput === '') {
      alert('Please enter your pregnancy stage!');
      return;
    }

    console.log('Generating advice for:', userInput);
    setIsLoading(true);
    setOutputContent('');

    try {
      const rawText = await generateAdvice(userInput);
      console.log('Raw text received:', rawText);

      // Display formatted advice
      const formattedContent = formatAdvice(rawText);
      console.log('Formatted HTML length:', formattedContent.length);
      console.log('Formatted HTML preview:', formattedContent.substring(0, 200));
      
      // Detect if content is in Urdu/Arabic (RTL)
      const detectedRTL = /[\u0600-\u06FF]/.test(rawText); // Checks for Arabic/Urdu characters
      console.log('Is RTL (Urdu/Arabic):', detectedRTL);
      setIsRTL(detectedRTL);
      setOutputContent(formattedContent);
      
      // Save chat
      if (user?.email) {
        try {
          // Only update if we're explicitly viewing an existing chat (chatId prop was provided)
          if (chatId && currentChatId === chatId) {
            // Update existing chat that was opened
            await updateChat(currentChatId, user.email, userInput, rawText);
            console.log('Chat updated successfully');
          } else {
            // Always create new chat for new messages
            const newChat = await createChat(user.email, userInput, rawText);
            // Don't set currentChatId - let next message create a new chat
            setCurrentChatId(null);
            // Clear input field for next message
            setInputText('');
            console.log('Chat created successfully');
          }
        } catch (saveError) {
          console.error('Failed to save chat:', saveError);
          // Don't show error to user, just log it
        }
      }
      
      console.log('Advice displayed successfully');

    } catch (error) {
      console.error('Error details:', error);
      console.error('Error stack:', error.stack);
      
      let errorMessage = "There was an error getting the advice. ";
      if (error.message) {
        errorMessage += error.message;
      } else {
        errorMessage += "Please check the console for details and try again.";
      }
      
      setOutputContent(`<div class='advice-card' style='background-color: #ffe6e6; border-color: #ff6b6b; color: #c92a2a;'>${errorMessage}</div>`);
    } finally {
      setIsLoading(false);
      console.log('Request completed');
    }
  };

  // Copy text functionality
  const handleCopy = () => {
    if (chatBoxRef.current) {
      const text = chatBoxRef.current.getText();
      navigator.clipboard.writeText(text)
        .then(() => alert('Advice copied!'))
        .catch(err => console.error('Failed to copy: ', err));
    }
  };

  // Download text functionality
  const handleDownload = () => {
    if (chatBoxRef.current) {
      const text = chatBoxRef.current.getText();
      const blob = new Blob([text], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'maternal_health_advice.txt';
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  // Handle speech toggle
  const handleToggleSpeech = () => {
    if (!isListening) {
      setInputText('');
    }
    toggleListening();
  };

  if (loadingChat) {
    return (
      <div className="container loading-chat-container">
        <Loader />
      </div>
    );
  }

  return (
    <>
      <div className="container">
        {(onBack || onClose) && (
          <div className="chat-header-actions">
            {onBack && (
              <button onClick={onBack} className="back-btn">
                ← Back
              </button>
            )}
            {onClose && (
              <button onClick={onClose} className="close-btn" title="Close">
                ×
              </button>
            )}
          </div>
        )}
        <Header />

        <InputSection 
          inputText={inputText}
          setInputText={setInputText}
          onGenerate={handleGenerate}
          isListening={isListening}
          onToggleSpeech={handleToggleSpeech}
          isSpeechSupported={isSpeechSupported}
        />

        <ChatBox 
          ref={chatBoxRef}
          outputContent={outputContent}
          isRTL={isRTL}
        />

        <ActionButtons 
          onCopy={handleCopy}
          onDownload={handleDownload}
          onInfo={() => setShowModal(true)}
        />

        <InfoModal 
          show={showModal}
          onClose={() => setShowModal(false)}
        />

        {isLoading && <Loader />}
      </div>

      <Footer />
    </>
  )
}

export default MaternalHealthAssistant

