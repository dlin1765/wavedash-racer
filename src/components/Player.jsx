import React, { useEffect, useRef, useState } from "react";
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
import { OrbitControls, GizmoHelper, GizmoViewport } from '@react-three/drei'
import { Root, Container, Fullscreen, Text} from "@react-three/uikit";
import { TextureLoader } from 'three'
import wavuSheet from '../assets/player-spritesheets/char-wavedash.png'
import idleSheet from '../assets/player-spritesheets/char-idle.png'
import { useGamepads } from 'react-gamepads';
const animations = {
  "wavedash": [wavuSheet, 6],
  "idle": [idleSheet, 8]
};

function Player({}){
  const [animationState, setAnimationState] = useState('idle');
  const [gamepads, setGamepads] = useState({});
  useGamepads(gamepads => setGamepads(gamepads));

  // useEffect(()=>{
  //   console.log(gamepads[0].buttons[4]);
  // }, [gamepads])
  
  const handleGamepadConnected = (e) => {
    addGamePads(e.gamepad);
    console.log('Gamepad connected:', e.gamepad);
  };

  const addGamePads = gamepad =>{
    setGamepads({
      ...gamepads,
      [gamepad.index]: {
        buttons: gamepad.buttons,
        id: gamepad.id,
        axes: gamepad.axes
      }
    });
  }

  const handleGamepadDisconnected = (e) => {
    setGamepads({});
    console.log('Gamepad disconnected:', e.gamepad);
  };

  useEffect(()=>{
    window.addEventListener('gamepadconnected', handleGamepadConnected);
    window.addEventListener('gamepaddisconnected', handleGamepadDisconnected);
    
    return()=>{
      window.removeEventListener('gamepadconnected', handleGamepadConnected);
      window.removeEventListener('gamepaddisconnected', handleGamepadDisconnected);
    }
  }, []);

  function AnimatedSprite({totalFrames, animation}){
    const texture = useLoader(TextureLoader, animations[animation][0]);
    texture.minFilter = NearestFilter
    texture.magFilter = NearestFilter
    texture.repeat.set(1 / animations[animation][1], 1);
    animateSpriteSheet(texture, 100, animations[animation][1]);
    // inside of the sprite tag you can put the position 
    return(
      <sprite> 
        <spriteMaterial map ={texture}/>
      </sprite>
    )
  }

  function animateSpriteSheet(texture, frames, totalFrames){
    const t = useRef(0)
    const currentFrame = useRef(0)
    useFrame((_, delta) => {
      t.current += delta * 1000
      if (t.current >= frames) {
        currentFrame.current += 1

        if (currentFrame.current >= totalFrames) {
          currentFrame.current = 0
        }
        t.current = 0
        texture.offset.x = currentFrame.current / totalFrames
      }
    })

    return { t, currentFrame }
  }

  return(
    <>
      <AnimatedSprite totalFrames={6} animation={'idle'}  position={[10,5,0]}/>
      <Fullscreen flexDirection="column" >
              <Container flexGrow={1}  justifyContent={'center'}>
                    <Text>
                      {gamepads[0] ? (gamepads[0].buttons[4].pressed ? "Pressed" : "Not Pressed") : "not connected"}
                    </Text>
              </Container>
      </Fullscreen>
    </>
  );
}

export default Player