import React, { useRef, useEffect, useState } from "react";
import { Root, Container, Fullscreen, Text} from "@react-three/uikit";

function ControllerConfigWindow({controllerConnected}){
    const { gamepads } = useContext(GamepadsContext);
    const [newControllerConnected, setNewControllerConnected] = useState(false);

    useEffect(() =>{
        



    }, [gamepads])


    return(
    <Fullscreen>
        <Container flexGrow={1} margin={32} backgroundColor="green">
            <Text>
                Controller config
            </Text>
            <Text>
                Create a private lobby
            </Text>
            <Text>
                Join lobby via code
            </Text>
        </Container>
    </Fullscreen>
    );
}

export default ControllerConfigWindow