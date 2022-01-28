import { Circle } from "@mui/icons-material";
import { Button, IconButton } from "@mui/material";
import { makeStyles } from '@mui/styles'
import { Box } from "@mui/system";
import { useEffect, useMemo, useRef, useState } from "react";
import { SketchPicker } from 'react-color'
 

const ColorPickerComponent = ({children=<Circle sx={{opacity: 0}}/>,buttonProps={},clickState=false, setClickState=()=>{},...props}) => {
    const target = useRef(null);
    const button = useRef(null);
    const styles = useStyle({ clickState });
    const [_color, setColor] = useState('');

    useEffect(() => {
        const onClickHandler = (e) => {
            if(clickState){
                if(!target.current.contains(e.target)) {
                    setClickState(false);
                }
            }
        };

        document.body.addEventListener('click', onClickHandler);

        return () => {
            document.body.removeEventListener('click', onClickHandler);
        };

    },[target.current, clickState]);
    return <Box  sx={{position: 'relative'}}>
        <IconButton ref={button} size="small" onClick={(e) => {
            console.log(e.target, target.current)
            if(e.target != target.current)
            setClickState(!clickState);
        }}  variant="contained" sx={{background: props?.color?.hex, color: props?.color?.hex, '&:hover': { background: props?.color?.hex}}} {...buttonProps}>
            {children}
        </IconButton>
        
        <SketchPicker ref={target} color={_color} onChange={color => setColor(color)} onChangeComplete={color => {props?.onChangeComplete(color); setClickState(true)}} className={styles.colorPicker}  /></Box>;
};

const useStyle = makeStyles({
    colorPicker: {
        position: 'absolute',
        top: 0,
        left: '100%',
        transform: ({clickState}) =>  clickState ? 'translateY(-100%)' : `translateY(-90%)`,
        transition: 'all .25s ease-in-out',
        opacity: ({clickState}) => clickState ? 1 : 0,
        pointerEvents: ({clickState}) => clickState ? 'all' : 'none',
        zIndex: 3000
    }
})


export default ColorPickerComponent;