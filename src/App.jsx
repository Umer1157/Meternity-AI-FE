import { useState } from 'react'
import { useAuth } from './context/AuthContext'
import Login from './components/Login'
import Signup from './components/Signup'
import MaternalHealthAssistant from './components/MaternalHealthAssistant'
import ChatListing from './components/ChatListing'
import Loader from './components/Loader'
import './App.css'

function App() {
  const { isAuthenticated, loading } = useAuth()
  const [showSignup, setShowSignup] = useState(false)
  const [view, setView] = useState('listing') // 'listing' or 'chat'
  const [currentChatId, setCurrentChatId] = useState(null)

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        background: 'url(/10508261.jpg) no-repeat center center/cover',
        backgroundColor: '#fceff1'
      }}>
        <Loader />
      </div>
    )
  }

  if (!isAuthenticated) {
    return showSignup ? (
      <Signup onSwitchToLogin={() => setShowSignup(false)} />
    ) : (
      <Login onSwitchToSignup={() => setShowSignup(true)} />
    )
  }

  // Show chat listing or chat view
  if (view === 'listing') {
    return (
      <ChatListing
        onNewChat={() => {
          setCurrentChatId(null)
          setView('chat')
        }}
        onOpenChat={(chatId) => {
          setCurrentChatId(chatId)
          setView('chat')
        }}
      />
    )
  }

  return (
    <MaternalHealthAssistant
      chatId={currentChatId}
      onBack={() => {
        setCurrentChatId(null)
        setView('listing')
      }}
      onClose={() => {
        setCurrentChatId(null)
        setView('listing')
      }}
    />
  )
}

export default App
