import React, { useState, useRef, useEffect, useContext } from 'react';
import { useLoader, useFrame } from '@react-three/fiber';
import { Root, Container, Fullscreen, Text} from "@react-three/uikit";
import { GamepadsContext, useGamepads } from 'react-gamepads';
import { TextureLoader, NearestFilter } from 'three';
import { OrbitControls, GizmoHelper, GizmoViewport } from '@react-three/drei'

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
    'cd': {'input': ['f', 'n', 'df'], 'totalTime': [0, 20], 'playOnce': true},
    'cd1': {'input': ['f','n', 'd', 'df'], 'totalTime': [0, 20], 'playOnce': true, 'index': 0},
    'dash': {'input': ['f', 'n', 'f'], 'totalTime': [0, 20], 'playOnce': true}
}





// animation states
// after triggering an animation, it will play to its entirety and then stop looping
// you can cancel the animations into each other at any point of the animation
// crouch dash animation will play, if no input then no cancel 
// crouch dash animation 

function AnimatedSprite({  animation, playOnce}) {
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

function Player({playOnce, currentInput, onData}) {
  const [animationState, setAnimationState] = useState('idle');
  let lastInput = useRef('')
  // const [gamepads, setGamepads] = useState({});
  const { gamepads } = useContext(GamepadsContext);
  // useGamepads((_gamepads) => {
  //   setGamepads(_gamepads);
  //   console.log("hello");
  // });
  const frame = useRef(0);
  const t = useRef(0);

  

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

  useFrame((_, delta) => {
    t.current += delta * 1000;
    if (t.current >= 16.67) {
      frame.current = (frame.current + 1) % 60;
      t.current = 0;
      const cd1 = specialActions['cd1']
      console.log('currentInput: ' + currentInput + ' == ' + 'specialInput[' + cd1['input'][cd1['index']] + ']' )
      if(currentInput == cd1['input'][cd1['index']] ){
        // lastInput.current = currentInput
        // specialActions['cd1'][specialActions['cd1']['index']] += 1
        cd1['index'] += 1

        if(cd1['index'] >= cd1['input'].length){
          console.log('CROUCH DASH 1 COMPLETED')
        }
      }
      else{
        cd1['index'] = 0
      }
      
    }
    
  });

  // useEffect(() => {
  //   const checkGamepadInput = () => {
  //     if (gamepads[0] && gamepads[0].buttons[4].pressed) {
  //       console.log('button pressed');
  //       setAnimationState('wavu');
  //     } else {
  //       setAnimationState('idle');
  //     }
  //   };
  //   if(gamepads[0]){
  //     checkGamepadInput();
  //   }
  //   const interval = setInterval(checkGamepadInput, 100); 
  //   return () => clearInterval(interval); 
  // },[gamepads]);


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
