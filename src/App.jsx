import { useState } from 'react'
import './App.css'

function App() {
  const [likes, setLikes] = useState(0)
  const [userName, setUserName] = useState("Alberto Zepeda")
  const userId = "IX-9831-AZ"

  // Get initials using standard JS
  const initials = userName
    .split(" ")
    .filter(Boolean)
    .map(n => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "AZ"

  return (
    <div className="app-container">
      <div className="glass-card">
        <div className="glow-effect"></div>
        
        {/* Header */}
        <div className="card-header">
          <span className="badge">REACT + VITE</span>
          <h1>¡Hola Mundo!</h1>
          <p className="subtitle">Prototipo Web Inicial de Impact.X en React</p>
        </div>

        {/* User Card */}
        <div className="user-profile-box">
          <div className="avatar-circle">
            {initials}
          </div>
          <div className="user-details">
            <h3 className="user-name">{userName}</h3>
            <span className="user-id">ID de Cuenta: {userId}</span>
          </div>
        </div>

        {/* Interactive Element */}
        <div className="interactive-section">
          <button 
            type="button" 
            className="btn-primary" 
            onClick={() => setLikes(likes + 1)}
          >
            ❤️ Dar un Latido ({likes})
          </button>
        </div>

        {/* Footer */}
        <div className="card-footer">
          <p>Compilado y listo para integrar las APIs del backend.</p>
        </div>
      </div>
    </div>
  )
}

export default App
