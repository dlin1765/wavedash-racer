import React, { useRef, useContext, memo, useState, useEffect} from "react";
import { Canvas, extend, useThree, useFrame, useLoader } from "@react-three/fiber";
import {
  CubeTextureLoader,
  CubeCamera,
  WebGLCubeRenderTarget,
  RGBFormat,
  LinearMipmapLinearFilter,
  MeshBasicMaterial,
  PlaneGeometry,
  DoubleSide,
  NearestFilter,
} from "three";
import { OrbitControls, GizmoHelper, GizmoViewport } from '@react-three/drei';
import { Root, Container, Fullscreen, Text} from "@react-three/uikit";
import { Button } from "@react-three/uikit-default"
import { TextureLoader } from 'three';
import Player from './Player.jsx';
import './GameWindow.jsx';
import { GamepadsProvider } from 'react-gamepads';
import { GamepadsContext, useGamepads } from 'react-gamepads';
import InputVisualization from "./InputVisualization.jsx";
import { io } from 'socket.io-client'
import { socket } from "../socket.jsx";
import idleSheet from '../assets/player-spritesheets/char-idle.png';
import wavuSheet from '../assets/player-spritesheets/char-wavedash.png';
import walkingSheet from '../assets/player-spritesheets/char-walking.png';
import cdSheet from '../assets/player-spritesheets/char-crouchdash3.png';
import forwardDashSheet from '../assets/player-spritesheets/char-forwarddash2.png'
import crouchSheet from '../assets/player-spritesheets/char-crouch3.png'
import crouchingSheet from '../assets/player-spritesheets/char-crouching2.png'
import uncrouchSheet from '../assets/player-spritesheets/char-uncrouch.png'

const animations = {
  'idle': [idleSheet, 8], 
  'wavu': [wavuSheet, 6], 
  'cd': [cdSheet, 5],
  'cd1': [cdSheet, 5],
  'dash': [forwardDashSheet, 7],
  'crouch': [crouchSheet, 3],
  'crouching': [crouchingSheet, 8],
  'uncrouch': [uncrouchSheet, 3]
};

const specialActions = {
    'cd': {input: ['f', 'n', 'df'], totalTime: 20, playOnce: true, index: 0},
    'cd1': {input: ['f','n', 'd', 'df'], totalTime: 20, playOnce: true, index: 0},
    'dash': {input: ['f', 'n', 'f'], totalTime: 20, playOnce: true}
}


const SkyBox = memo(function SkyBox(){
    const { scene } = useThree();
    const loader = new CubeTextureLoader();
    // The CubeTextureLoader load method takes an array of urls representing all 6 sides of the cube.
    const texture = loader.load([
      "/src/assets/skycube_1/skyrender0001.png",
      "/src/assets/skycube_1/skyrender0004.png",
      "/src/assets/skycube_1/skyrender0003.png",
      "/src/assets/skycube_1/skyrender0006.png",
      "/src/assets/skycube_1/skyrender0005.png",
      "/src/assets/skycube_1/skyrender0002.png",
    ]);
    // Set the scene background property to the resulting texture.
    scene.background = texture;
    return null;
});

// wavu priority HIGHER
// dash priority high

// cd = d df 
// f n d df f f (or f n d qcf f)
// f can hold for 7f, n can be for 40f ->  d -> 10f -> df -> (cd animation) -> any time during the cd animation and even past that you can input ff
// f n df f f 
// f can hold for 7f, n can be for 40f -> df -> (CD ANIMATION) -> any time during cd animation you need two forwards with at most 18f of neutral in between

// 7 + 

// after df you need to double tap to get a dash

// after f you have 20f or so to tap f again and get run state (run state lets you cd any time during it)
// inputs seem to be stored for 20 frames

// f stored for 15 frames before being cleared 
// cd input has to be completed in 20 frames 

// f -> looking for nuetral for 7 frames otherwise clear 
// f n -> if during crouchdash, look for d or df for the cd animation length, 

// current button
// past buttons 


function Controls(){
    const{ 
        camera,
        gl: {domElement},
    }= useThree();
    return <OrbitControls args={[camera, domElement]}/>
}

function GreenSquare() {
    const waterText = useLoader(TextureLoader, 'src/assets/skycube_1/water-texture.jpg')    
    return (
      // The mesh is at the origin
      // Since it is inside a group, it is at the origin
      // of that group
      // It's rotated by 90 degrees along the X-axis
      // This is because, by default, planes are rendered
      // in the X-Y plane, where Y is the up direction
      <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[1000, 1000, 1]}>
        {/*
          The thing that gives the mesh its shape
          In this case the shape is a flat plane
        */}
        <planeGeometry />
        {/*
          The material gives a mesh its texture or look.
          In this case, it is just a uniform green
        */}
        <meshBasicMaterial side={DoubleSide} metalness={0.5} roughness={0.2} map={waterText}/>
      </mesh>
    );
}

const controllerMapping = {
  "up":{button: (gamepad) => gamepad.axes[1]}, // -1 
  "down":{button: (gamepad) => gamepad.axes[1]}, // 1
  "forward":{button: (gamepad) => gamepad.axes[0]}, // 1
  "back":{button: (gamepad) => gamepad.axes[0]}, // -1
  "A": {button: "buttons[4]"},
  "B": {button: "buttons[1]"}
}

const keyboardMapping = {
  "up": {button: 'KeyW'},
  "down": {button: "KeyS"},
  "forward": {button:"KeyD"},
  "back": {button: "KeyA"},
  "A": {button: "Enter"},
  "B": {button: "Escape"}
}

function makeid(length) {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}

function Scene({events, isConnected}){
  const [sceneId, setSceneId] = useState('title')
  const [inputBuffer, setInputBUffer] = useState([])
  const [currentInput, setCurrentInput] = useState('n')
  const [selectedController, setSelectedController] = useState(-1)
  const { gamepads } = useContext(GamepadsContext);
  const [userSocket, setUserSocket] = useState(io)
  const [currentLobbyId, setCurrentLobbyId] = useState('')
  const [inputValue, setInputValue] = useState('')
  const [playOnce, setPlayOnce] = useState(true)
  const [playerAction, setPlayerAction] = useState('idle')

  const inputRef = useRef(null)
  let timeElapsed = useRef(0)
  // socket.on("connect", () => {
  //   console.log(socket.id); // x8WIv7-mJelg7on_ALbx
  // });

  useEffect(() => {
    window.addEventListener('keydown', KeyPressed);
    //window.addEventListener('keydown', escKeyPressed);
    return() => {
        window.removeEventListener('keydown', KeyPressed);
        //window.removeEventListener('keydown', escKeyPressed);
    };
  });

  useEffect(()=>{
    function playerJoined(arg){
      setCurrentLobbyId(arg['roomId'])
    }
    socket.on('player-joined',playerJoined)
    return ()=>{
      socket.off('player-joined', playerJoined)
    }

  }, [])
     

  // const t = useRef(0);
  // const frame = useRef(0)
  // useFrame((_, delta) => {
  //   t.current += delta * 1000;
  //   if (t.current >= 100) {
  //     frame.current = (frame.current + 1) % 60;
  //     t.current = 0;
  //   }
  // });




  const KeyPressed = (event) =>{
    console.log(event.code);
    switch(event.code){
      case(keyboardMapping['up'].button && keyboardMapping['forward'].button) :
        upForwardPressed()
        break;
      case(keyboardMapping['up'].button && keyboardMapping['back'].button) :
        upBackPressed()
        break;
      case(keyboardMapping['down'].button && keyboardMapping['forward'].button) :
        downForwardPressed()
        break;
      case(keyboardMapping['down'].button && keyboardMapping['back'].button) :
        downBackPressed()
        break;
      case(keyboardMapping['up'].button) :
        UpPressed()
        console.log("up");
        break;
      case(keyboardMapping['down'].button):
        DownPressed()
        console.log("down");
        break;
      case(keyboardMapping['back'].button):
        BackPressed()
        console.log("back");
        break;
      case(keyboardMapping['forward'].button):
        ForwardPressed()
        console.log("forward");
        break;
    }
  }

  function UpPressed(){
    console.log('up pressed')
    setCurrentInput('u')
  }

  function DownPressed(){
    console.log('DOWNPRESSED')
    setCurrentInput('d')
  }

  function BackPressed(){ 
    console.log('back pressed')
    setCurrentInput('b')
  }

  function ForwardPressed(){
    console.log('forward pressed')
    setCurrentInput('f')
  }

  function upBackPressed(){
    setCurrentInput('ub')
  }

  function upForwardPressed(){
    setCurrentInput('uf')
  }

  function downBackPressed(){
    setCurrentInput('db')
  }

  function downForwardPressed(){
    setCurrentInput('df')
  }

  function NoInput(){
    setCurrentInput('n')
  }

  function connectToServer() {
    socket.connect();
    console.trace()
    const lobbyID = makeid(6)
    setCurrentLobbyId(lobbyID)
    socket.emit("create-lobby", {roomId: lobbyID})
  }

  function disconnect() {
    socket.disconnect();
  }

  // const connect = () =>{
  //   const _socket = io.connect('http://localhost:3001')
  //   setUserSocket(_socket)
  //   _socket.emit("create-lobby", {roomId: makeid(6)})
  //   console.trace()
  //   // createLobby()
  // }


  useEffect(() =>{
    if(sceneId == 'title' && Object.entries(gamepads).length != 0){
      console.log('set selected contorller')
      setSelectedController(0);
    }

  }, [Object.entries(gamepads).length])

  // checks every frame for input is this the most efficient?
  useEffect(() => {
    const checkGamepadInput = () => {
      if (gamepads[selectedController]) {
        if(controllerMapping['back'].button(gamepads[selectedController]) >= .5 && controllerMapping['up'].button(gamepads[selectedController]) <= -.5){
          upForwardPressed();
        }
        else if(controllerMapping['down'].button(gamepads[selectedController]) >= .5 && controllerMapping['back'].button(gamepads[selectedController]) <= -.5){
          downBackPressed();
        }
        else if(controllerMapping['down'].button(gamepads[selectedController]) >= .5 && controllerMapping['back'].button(gamepads[selectedController]) >= .5){
          downForwardPressed();
        }
        else if(controllerMapping['back'].button(gamepads[selectedController]) <= -.5 && controllerMapping['up'].button(gamepads[selectedController]) <= -.5){
          upBackPressed();
        }
        else if(controllerMapping['down'].button(gamepads[selectedController]) >= .5){
          DownPressed();
        }
        else if(controllerMapping['up'].button(gamepads[selectedController]) <= -.5){
          UpPressed();
        }
        else if(controllerMapping['back'].button(gamepads[selectedController]) <= -.5){
          BackPressed();
        }
        else if(controllerMapping['back'].button(gamepads[selectedController]) >= .5){
          ForwardPressed();
        }
        else{
          NoInput();
        }

        //checkSpecialMoves()
      } 
      // else {
      //   console.log('no controllers detected')
      // }
    };
    if(gamepads[selectedController]){
      checkGamepadInput();
    }
    const interval = setInterval(checkGamepadInput, 16.67); 
    return () => clearInterval(interval); 
  },[gamepads])

  // function checkSpecialMoves(){
  //   if(currentInput == 'f'){
  //     timeElapsed.current = timeElapsed.current + 1
  //   }
  //   else if(currentInput == 'b'){
  //     timeElapsed.current = 0
  //   }
  // }

  // useEffect(() => {
  //   const checkSpecialMoves = () => {
  //     if (gamepads[selectedController]) {
  //       print("hello???")
  //     }
  //   };
  //   if(gamepads[selectedController]){
  //     checkSpecialMoves();
  //   }
  //   const interval = setInterval(checkSpecialMoves, 166.67); 
  //   return () => clearInterval(interval); 
  // },[currentInput])

  // const KeyPressed = (event) =>{
  //   if(sceneId == 1 && event.code == "KeyJ"){
  //     console.log("can play");
  //     setTemp('playing the game')
  //   }
  // }

  const getPlayerAction = (arg) => {
    setPlayerAction(arg)
  }

  function playButtonClicked(){
      console.log('play button clicked')
      connectToServer()
      setSceneId('play')

      //e.stopPropagation()
  }
    
  function menuButtonClicked(){
    console.log('menu button clicked')
    socket.disconnect()
    setSceneId('title')
  }

  function controllerConfigClicked(){
    console.log('controller config button clicked')
    setSceneId('controller')
  }

  function joinLobbyClicked(){
    const inputValue = inputRef.current.value
    socket.connect()
    socket.emit('join-lobby', {roomId: inputValue})
    console.log('Input value', inputValue)
    setInputValue(inputValue)
  }

  const controllerSelect = (controllerID) => {
    setSelectedControler(parseInt(controllerID))
  }

  function emit(){
    console.log('trying to emit')
    socket.emit('message', {roomId: currentLobbyId, message: socket.id + " says hello"}) 
  }

  const startScene0 = 
  <Canvas style={{  inset: "0", touchAction: "none" }} gl={{ localClippingEnabled: true }} >
      <Fullscreen backgroundColor="red" sizeX={8} sizeY={4} flexDirection="column">
        <Container flexGrow={1} margin={32} backgroundColor="green">
          <Button variant="outline" size="default" backgroundColor='white' onClick={playButtonClicked}>
            <Text>
              Play 
            </Text>
          </Button>
          <Button variant="outline" size="default" backgroundColor='white'>
            <Text>
              Create a private lobby
            </Text>
          </Button>
          <Button variant="outline" size="default" backgroundColor='white'>
            <Text>
              Join lobby via code
            </Text>
          </Button>
          <Button variant="outline" size="default" backgroundColor='white' onClick={controllerConfigClicked}>
            <Text>
              Controller config
            </Text>
          </Button>
          
        </Container>
        <Container flexGrow={1} margin={32}>
           <Text>
            {selectedController != -1 ? 
              `Selected Controller: ${gamepads[selectedController]['id']}`
              :
              `Selected Controller: None, Keyboard controls`
            }
          </Text>
          <InputVisualization controllerConnected={selectedController != -1 ? true:false} currentInput={currentInput} />

        </Container>
      </Fullscreen>
  </Canvas>;

  const controllerScene = 
  <Canvas style={{  inset: "0", touchAction: "none" }} gl={{ localClippingEnabled: true }} >
    <Fullscreen backgroundColor="red" sizeX={8} sizeY={4} flexDirection="column">
        <Container flexGrow={1} margin={32} backgroundColor="blue">
          <Button variant="outline" size="default" backgroundColor='white' onClick={menuButtonClicked}>
            <Text>
              menu 
            </Text>
          </Button>
        </Container>
        <Container flexGrow={1} margin={32} backgroundColor="green">
          {Object.keys(gamepads).length != 0 ? 
            Object.entries(gamepads).map(([key, value]) => (
              <Button key={key} onClick={()=>controllerSelect(key)}>
                <Text>{key}: {value['id']}</Text>
              </Button>
            )) 
            : 
            <Text>
              no controller detected, if you don't see your controller, press a button 
            </Text>
          }
        </Container>
    </Fullscreen>
  </Canvas>

  const gameScene1 = 
  <Canvas camera={{ fov: 90,  position: [0, 5, 10] }}>
      <Fullscreen flexDirection="column" >
        <Container flexGrow={1}>
            <Button variant="outline" size="default" backgroundColor='white' onClick={menuButtonClicked}>
              <Text>
                menu 
              </Text>
            </Button>
            <InputVisualization controllerConnected={selectedController != -1 ? true:false} currentInput={currentInput} />
            <Button variant="outline" size="default" backgroundColor='white' onClick={emit}>
              <Text>
                emit msg
              </Text>
          </Button>
          <Button variant="outline" size="default" backgroundColor='white' onClick={disconnect}>
              <Text>
                disconnect
              </Text>
          </Button>
         
        </Container>
      </Fullscreen>
      <OrbitControls/>
      <gridHelper/>
      <Player playOnce = {playOnce} currentInput={currentInput} onData = {getPlayerAction}/>
     
      <GizmoHelper
          alignment="bottom-right" // widget alignment within scene
          margin={[80, 80]} // widget margins (X, Y)
          >
          <GizmoViewport axisColors={['red', 'green', 'blue']} labelColor="black" />
          {/* alternative: <GizmoViewcube /> */}
      </GizmoHelper>
      <SkyBox/>
  </Canvas>;
  const sceneArr = {'title': startScene0, 'play': gameScene1, 'controller': controllerScene};


    return(
      <>
        <div className="absolute z-10 transform -translate-x-1/2 -translate-y-1/2 border top-1/2 left-1/2">
          <button className="playButton" onClick={playButtonClicked}>
            play
          </button>
          <button className="playButton" onClick={menuButtonClicked}>
            menu
          </button>
          <input type="text" name="fname" ref = {inputRef}/>
          <button className="playButton" onClick={joinLobbyClicked}>
            join lobby
          </button>
          <button className="playButton" onClick={emit}>
            emit
          </button>
        </div>
        {sceneArr[sceneId]}
      </>
        
        


    );
}

export default Scene