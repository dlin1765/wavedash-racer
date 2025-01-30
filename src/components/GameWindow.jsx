import React, { useRef, useEffect, useState } from "react";
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
import Player from '../components/Player.jsx';
import Scene from "./Scene.jsx";
import walkingSheet from '../assets/player-spritesheets/char-walking.png';
import crouchingSheet from '../assets/player-spritesheets/char-crouching.png';
import crouchDashSheet from '../assets/player-spritesheets/char-crouchdash2.png';

function SkyBox() {
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
}
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







function GameWindow(){
    const [sceneId, setSceneId] = useState(0);

    useEffect(() => {
      window.addEventListener('keydown', sKeyPressed);
      //window.addEventListener('keydown', escKeyPressed);
    
      return() => {
          window.removeEventListener('keydown', sKeyPressed);
          //window.removeEventListener('keydown', escKeyPressed);
      };
    });
   
    const sKeyPressed = (event) =>{
      if(event.code == 'KeyS'){
          console.log("S key pressed");
          setSceneId(1);
      }
    }
    


    return(
        <>
            
            <div className="flex py-0 pl-paddingLength pr-paddingLength h-[80vh]">
                <Scene sceneId={sceneId}>

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