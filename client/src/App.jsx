import { useState } from 'react'
import { io } from 'socket.io-client'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import GameWindow from './components/GameWindow.jsx'
import './styles/App.css'

const socket = io.connect('http://localhost:3001')

function App() {

  

  return (
    <>
      <div className="grid grid-cols-1">
        <Header/>
        <GameWindow/>
        <Footer/>
      </div>
    </>
  )
}

export default App
