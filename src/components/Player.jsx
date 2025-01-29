import React, { useRef } from "react";
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
import { TextureLoader } from 'three'
import wavuSheet from '../assets/player-spritesheets/char-wavedash.png'


function AnimatedSprite({totalFrames}){
    const texture = useLoader(TextureLoader, wavuSheet);
    texture.minFilter = NearestFilter
    texture.magFilter = NearestFilter
    texture.repeat.set(1 / totalFrames, 1);
    animateSpriteSheet(texture, 100, totalFrames);

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



function Player({}){
    return(
        <AnimatedSprite totalFrames={6} />
    );
}

export default Player