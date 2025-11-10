import React from 'react'

function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer>
      <p>&copy; <span id="footerYear">{currentYear}</span> Maternal Health Assistant. All rights reserved.</p>
      <p>Developed by Tooba Mir</p>
    </footer>
  )
}

export default Footer


