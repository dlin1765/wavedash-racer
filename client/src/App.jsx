import React, { useRef, useEffect, useState, useContext } from "react";
import { io } from 'socket.io-client'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import GameWindow from './components/GameWindow.jsx'
import { GamepadsContext, useGamepads } from 'react-gamepads';
import { GamepadsProvider } from 'react-gamepads';
import './styles/App.css'





function App() {

  const connect = () =>{
    const socket = io.connect('http://localhost:3001')
  }

  useEffect(()=>{
    connect();
  }, []) 
  return (
    <>
      <div className="grid grid-cols-1">
        <Header/>
        <GamepadsProvider>
          <GameWindow/>
        </GamepadsProvider>
        <Footer/>
      </div>
    </>
  )
}

export default App
