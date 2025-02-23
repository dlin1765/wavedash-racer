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
import wavuSheet from '../assets/player-spritesheets/char-wavedash.png';
import Player from './Player.jsx';
import walkingSheet from '../assets/player-spritesheets/char-walking.png';
import crouchingSheet from '../assets/player-spritesheets/char-crouching.png';
import './GameWindow.jsx';
import crouchDashSheet from '../assets/player-spritesheets/char-crouchdash2.png';
import { GamepadsProvider } from 'react-gamepads';
import { GamepadsContext, useGamepads } from 'react-gamepads';

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

// after f you have 16f or so to tap f again and get run state (run state lets you cd any time during it)


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
  "up":{button: 1}, // -1 
  "down":{button: 1}, // 1
  "right":{button: "axis[0]"}, // 1
  "left":{button: "axis[0]"}, // -1
  "A": {button: "buttons[4]"},
  "B": {button: "buttons[1]"}
}

const keyboardMapping = {
  "up": {button: 'KeyW'},
  "down": {button: "KeyS"},
  "right": {button:"KeyD"},
  "left": {button: "KeyA"},
  "A": {button: "Enter"},
  "B": {button: "Escape"}
}

function Scene({}){
  const [sceneId, setSceneId] = useState('title');
  const [inputBuffer, setInputBUffer] = useState([])
  const [selectedController, setSelectedController] = useState(-1);
  const { gamepads } = useContext(GamepadsContext);

  useEffect(() => {
    window.addEventListener('keydown', KeyPressed);
    //window.addEventListener('keydown', escKeyPressed);
    return() => {
        window.removeEventListener('keydown', KeyPressed);
        //window.removeEventListener('keydown', escKeyPressed);
    };
  });
     
  const KeyPressed = (event) =>{
    console.log(event.code);
    switch(event.code){
      case(keyboardMapping['up'].button):
        console.log("up");
        break;
      case(keyboardMapping['down'].button):
        console.log("up");
        break;
      case(keyboardMapping['left'].button):
        console.log("left");
        break;
      case(keyboardMapping['right'].button):
        console.log("right");
        break;
    }
  }

  function UpPressed(){

  }

  function DownPressed(){
    console.log('DOWNPRESSED')
  }

  function LeftPressed(){

  }

  function RightPressed(){

  }

  // const [temp, setTemp] = useState('hello');

  function createLobby(){

  }

  function joinLobby(){

  }

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
        if(gamepads[selectedController].axes[controllerMapping['down'].button] >= .8){
          DownPressed();
        }
      
      } 
      else {

      }
    };
    if(gamepads[selectedController]){
      checkGamepadInput();
    }
    const interval = setInterval(checkGamepadInput, 166.67); 
    return () => clearInterval(interval); 
  },[gamepads])

  // const KeyPressed = (event) =>{
  //   if(sceneId == 1 && event.code == "KeyJ"){
  //     console.log("can play");
  //     setTemp('playing the game')
  //   }
  // }

  function playButtonClicked(){
      console.log('play button clicked');
      setSceneId('play');
  }
    
  function menuButtonClicked(){
    console.log('menu button clicked');
    setSceneId('title');
  }

  function controllerConfigClicked(){
    console.log('controller config button clicked');
    setSceneId('controller');
  }

  const controllerSelect = (controllerID) => {
    setSelectedControler(parseInt(controllerID))
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
        <Container flexGrow={1} margin={32} backgroundColor="blue">
          <Text>
            {selectedController != -1 ? 
              `Selected Controller: ${gamepads[selectedController]['id']}`
              :
              `Selected Controller: None, Keyboard controls`
            }
          </Text>

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
        </Container>
      </Fullscreen>
      <OrbitControls/>
      <gridHelper/>
      <Player />
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
      sceneArr[sceneId]
    );
}

export default Scene