import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { getAllChats, deleteChat } from '../utils/chats'
import Footer from './Footer'
import Loader from './Loader'
import GynecologistMap from './GynecologistMap'
import './ChatListing.css'

function ChatListing({ onNewChat, onOpenChat }) {
  const { user, logout } = useAuth()
  const [chats, setChats] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [showMap, setShowMap] = useState(false)
  const itemsPerPage = 2

  useEffect(() => {
    loadChats()
  }, [])

  const loadChats = async () => {
    if (!user?.email) return
    
    setLoading(true)
    setError('')
    try {
      const data = await getAllChats(user.email)
      setChats(data)
    } catch (err) {
      setError(err.message || 'Failed to load chats')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id, e) => {
    e.stopPropagation()
    if (!window.confirm('Are you sure you want to delete this chat?')) return

    try {
      await deleteChat(id, user.email)
      loadChats() // Reload chats - useEffect will handle page adjustment
    } catch (err) {
      alert(err.message || 'Failed to delete chat')
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now - date)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) {
      return 'Today at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } else if (diffDays === 2) {
      return 'Yesterday at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } else if (diffDays <= 7) {
      return diffDays + ' days ago'
    } else {
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  }

  // Calculate pagination
  const totalPages = Math.ceil(chats.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedChats = chats.slice(startIndex, endIndex)

  // Reset to page 1 when chats change and current page is invalid
  useEffect(() => {
    if (chats.length > 0) {
      const maxPage = Math.ceil(chats.length / itemsPerPage)
      if (currentPage > maxPage && maxPage > 0) {
        setCurrentPage(maxPage)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chats.length])

  // if (loading) {
  //   return (
  //     <div className="chat-listing-container">
  //       <div className="chat-listing-card">
  //         <div className="loading">Loading chats...</div>
  //       </div>
  //     </div>
  //   )
  // }

  return (
    <>
      <div className="chat-listing-container">
        <div className="chat-listing-card">
          <div className="chat-listing-top-bar">
            {user && (
              <div className="user-info">
                <span className="username">{user.email}</span>
              </div>
            )}
            <button onClick={logout} className="logout-btn-listing">
              Logout
            </button>
          </div>
          
          <div className="chat-listing-header">
            <h1>My Chats</h1>
            <div className="header-buttons">
              <button onClick={onNewChat} className="new-chat-btn">
                <span>💬 </span>
                New Chat
              </button>
              <button onClick={() => setShowMap(true)} className="find-gyno-btn">
                <span>📍</span>
                Find Gynecologists
              </button>
            </div>
          </div>

          {loading && (
            <div className="loading">
              <Loader />
            </div>
          )}

          {error && <div className="error-message">{error}</div>}

          {!loading && chats.length === 0 && (
            <div className="no-chats">
              <p>No chats yet. Start a new chat to get advice!</p>
            </div>
          )}

          {!loading && chats.length > 0 && (
            <>
              <div className="chats-list">
                {paginatedChats.map((chat) => (
                  <div
                    key={chat.id}
                    className="chat-item"
                    onClick={() => onOpenChat(chat.id)}
                  >
                    <div className="chat-item-content">
                      <h3>{chat.title || 'Untitled Chat'}</h3>
                      <p className="chat-preview">{chat.user_input.substring(0, 100)}...</p>
                      <p className="chat-date">{formatDate(chat.updated_at)}</p>
                    </div>
                    <button
                      className="delete-chat-btn"
                      onClick={(e) => handleDelete(chat.id, e)}
                      title="Delete chat"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              
              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    className="pagination-btn"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>
                  <div className="pagination-info">
                    Page {currentPage} of {totalPages}
                  </div>
                  <button
                    className="pagination-btn"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <Footer />
      <GynecologistMap show={showMap} onClose={() => setShowMap(false)} />
    </>
  )
}

export default ChatListing

