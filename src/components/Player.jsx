import React, { useState, useRef, useEffect, useContext } from 'react';
import { useLoader, useFrame } from '@react-three/fiber';
import { Root, Container, Fullscreen, Text} from "@react-three/uikit";
import { GamepadsContext, useGamepads } from 'react-gamepads';
import { TextureLoader, NearestFilter } from 'three';
import { OrbitControls, GizmoHelper, GizmoViewport } from '@react-three/drei'

import idleSheet from '../assets/player-spritesheets/char-idle.png';
import wavuSheet from '../assets/player-spritesheets/char-wavedash.png';

const animations = {
  'idle': [idleSheet, 8], 
  'wavu': [wavuSheet, 6], 
};

function AnimatedSprite({ animation }) {
  const [currentAnimation, setCurrentAnimation] = useState(animation);
  const texture = useLoader(TextureLoader, animations[animation][0]);
  texture.minFilter = NearestFilter;
  texture.magFilter = NearestFilter;
  texture.repeat.set(1 / animations[animation][1], 1);

  const frame = useRef(0);
  const t = useRef(0);

  useEffect(()=>{
    console.log('animation changed')
    if(animation != currentAnimation){
      console.log('reset frame and time')
      frame.current = 0;
      t.current = 0;
      texture.offset.x = 0;
    }
    setCurrentAnimation(animation);
  }, [animation]);
  
  useFrame((_, delta) => {
    t.current += delta * 1000;
    if (t.current >= 100) {
      frame.current = (frame.current + 1) % animations[animation][1];
      t.current = 0;
      texture.offset.x = frame.current / animations[animation][1];
    }
  });

  return (
    <>
      <sprite>
        <spriteMaterial map={texture} />
      </sprite>
      <Fullscreen flexDirection="column" >
          <Container flexGrow={1}  justifyContent={'center'}>
                 <Text>
                   {`frame: ${frame.current} time: ${t.current}`}
                </Text>
           </Container>
           <Container flexGrow={1}  justifyContent={'center'}>
                 <Text>
                   {`frame: ${frame.current} time: ${t.current}`}
                </Text>
           </Container>
      </Fullscreen>
    </>
    
  );
}

function Player() {
  const [animationState, setAnimationState] = useState('idle');
  // const [gamepads, setGamepads] = useState({});
  const { gamepads } = useContext(GamepadsContext);
  // useGamepads((_gamepads) => {
  //   setGamepads(_gamepads);
  //   console.log("hello");
  // });

  useEffect(() => {
    const checkGamepadInput = () => {
      if (gamepads[0] && gamepads[0].buttons[4].pressed) {
        console.log('button pressed');
        setAnimationState('wavu');
      } else {
        setAnimationState('idle');
      }
    };
    if(gamepads[0]){
      checkGamepadInput();
    }
    const interval = setInterval(checkGamepadInput, 100); 
    return () => clearInterval(interval); 
  },[gamepads]);

  return (
    <group>
      <AnimatedSprite animation={animationState}/>
      <Fullscreen flexDirection="column" >
          <Container flexGrow={1}  justifyContent={'center'}>
                 <Text>
                   {gamepads[0] ? (gamepads[0].buttons[4].pressed ? "Pressed" : "Not Pressed") : "not connected"}
                </Text>
           </Container>
      </Fullscreen>
    </group>
  );
}

export default Player;
