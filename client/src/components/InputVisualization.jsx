import React, { useRef, useEffect, useState } from "react";
import { Root, Container, Fullscreen, Text, Image} from "@react-three/uikit";
import { useLoader, useFrame } from '@react-three/fiber';
import { TextureLoader, NearestFilter, MeshBasicMaterial } from 'three';
import stick from "../assets/stick-visual/stick-visualization.png";

class StickMaterial extends MeshBasicMaterial{
    constructor(){
        super({

        })
    }
}

// function AnimatedSprite({controllerConnected, currentInput}){
    
//     // useEffect(()=>{
//     //     if(controllerConnected){
//     //         //texture.offset.x =  inputMap[currentInput] / 9;
//     //     }

//     // }, [currentInput])

//     return(
        
//     );
// }

function InputVisualization({controllerConnected, currentInput}){
    // const { gamepads } = useContext(GamepadsContext);
    // const [newControllerConnected, setNewControllerConnected] = useState(false);
    //  <AnimatedSprite controllerConnected={controllerConnected} currentInput={currentInput}/>
    const texture = useLoader(TextureLoader, stick);
    texture.minFilter = NearestFilter;
    texture.magFilter = NearestFilter;
    texture.repeat.set(1 / 9, 1);
    const inputMap ={
        'n': 0,
        'u': 1,
        'uf': 2,
        'f': 3,
        'df': 4,
        'd': 5,
        'db': 6,
        'b': 7,
        'ub': 8,
    }

    useEffect(()=>{
        if(controllerConnected){
            texture.offset.x =  inputMap[currentInput] / 9;
        }

    }, [currentInput])

    return(
        <Image src={texture} width={100} height={100} keepAspectRatio={false} objectFit={'cover'}> 
            
        </Image>
    );
}

export default InputVisualization