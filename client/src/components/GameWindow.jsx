import React, { useRef, useEffect, useState, useContext } from "react";
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
import { TextureLoader } from 'three';
import wavuSheet from '../assets/player-spritesheets/char-wavedash.png';
import Player from './Player.jsx';
import Scene from "./Scene.jsx";
import walkingSheet from '../assets/player-spritesheets/char-walking.png';
import crouchingSheet from '../assets/player-spritesheets/char-crouching.png';
import crouchDashSheet from '../assets/player-spritesheets/char-crouchdash2.png';
import { GamepadsContext, useGamepads } from 'react-gamepads';
import { GamepadsProvider } from 'react-gamepads';
import { Button } from "@react-three/uikit-default";

// create an object that represents a gamepad 
// implement input handling in here and pass those inputs to the components
// then, inside the components, send those inputs to the server



const controllerMapping = {
  "up":{button: "axis[1]"}, // -1 
  "down":{button: "axis[1]"}, // 1
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

function GameWindow(){
    const [sceneId, setSceneId] = useState('title');
    const [selectedController, setSelectedControler] = useState(-1);
    const { gamepads } = useContext(GamepadsContext);

    // useEffect(() => {
    //   window.addEventListener('keydown', KeyPressed);
    //   //window.addEventListener('keydown', escKeyPressed);
    //   return() => {
    //       window.removeEventListener('keydown', KeyPressed);
    //       //window.removeEventListener('keydown', escKeyPressed);
    //   };
    // });
   
    // const KeyPressed = (event) =>{
    //   console.log(event.code);
    //   switch(event.code){
    //     case(keyboardMapping['up'].button):
    //       console.log("up");
    //       break;
    //     case(keyboardMapping['down'].button):
    //       console.log("up");
    //       break;
    //     case(keyboardMapping['left'].button):
    //       console.log("left");
    //       break;
    //     case(keyboardMapping['right'].button):
    //       console.log("right");
    //       break;
    //   }
    // }

   


    return(
        <>
            
            <div className="flex py-0 pl-paddingLength pr-paddingLength h-[80vh]">
                <Scene>
                </Scene>
            </div>
        </>
    );
}

export default GameWindow

/*
<div className="flex py-0 pl-paddingLength pr-paddingLength h-95">
                <Canvas camera={{ fov: 90,  position: [0, 5, 10] }}>
                    <OrbitControls/>
                    <gridHelper/>
                    <Player/>
                    <GizmoHelper
                        alignment="bottom-right" // widget alignment within scene
                        margin={[80, 80]} // widget margins (X, Y)
                        >
                        <GizmoViewport axisColors={['red', 'green', 'blue']} labelColor="black" />
                        
                        </GizmoHelper>
                        <SkyBox/>
                    </Canvas>
                </div>
*/