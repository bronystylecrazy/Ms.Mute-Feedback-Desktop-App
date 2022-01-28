import { PaletteRounded } from "@mui/icons-material";
import { Box, Button, Grid } from "@mui/material";
import { makeStyles } from '@mui/styles'
import { useEffect, useState } from "react";
import MainLogo from '../assets/logos/main.png';
import ColorPickerComponent from '../components/ColorPicker';

function padZero(str, len) {
    len = len || 2;
    var zeros = new Array(len).join('0');
    return (zeros + str).slice(-len);
}

function invertColor(hex) {
    if (hex.indexOf('#') === 0) {
        hex = hex.slice(1);
    }
    // convert 3-digit hex to 6-digits.
    if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    if (hex.length !== 6) {
        throw new Error('Invalid HEX color.');
    }
    // invert color components
    var r = (255 - parseInt(hex.slice(0, 2), 16)).toString(16),
        g = (255 - parseInt(hex.slice(2, 4), 16)).toString(16),
        b = (255 - parseInt(hex.slice(4, 6), 16)).toString(16);
    // pad each with zeros and return
    return '#' + padZero(r) + padZero(g) + padZero(b);
}

const InputBox = ({ setState, state, withLogo = true }) => {
    const [color, setColor] = useState({ hex: '#fff' });
    const [clickState,setClickState] = useState(false);
    const [value, setValue] = useState('');
    const [isCtrl, setIsCtrl] = useState(false);

    const inputStyle = {
        width: '50vw',
        padding: '2vw',
        color:color.hex,
        backgroundColor: 'transparent',
        textAlign: 'center',
        outline: 'none',
        border: 'none',
        fontSize: '3vw',
        fontFamily: "'IBM Plex Sans', Arial, Helvetica, sans-serif",
    } as React.CSSProperties;

    useEffect(() => {
        setState({
            field: 'inputField',
            value,
            broadcast: true,
        });
    },[value])

    useEffect(() => {
        window.ipcRenderer.on('save:image', () => {
            console.log('success!');
            window.ipcRenderer.send('sync:canvas');
        })
        return () => {
            window.ipcRenderer.removeAllListeners('save:image');
        };
    },[]);

    const onTextFieldChanged = (e) => {
        setValue(e.target.value);
    };

    const keyUpHandler = (e) => {
        if (e.keyCode === 17) {
            setIsCtrl(false);
        }
    };

    const keyDownHandler = (e) => {
        if (e.keyCode === 17) {
            setIsCtrl(true);
        }
        if (e.keyCode === 13 && isCtrl) {
            window.ipcRenderer.send('save:text', value);
            setValue("");
        }
    }

    return <Box sx={{position: 'fixed',
    top: '40%',
    left: '50%',
    transform: 'translate(-50%,-50%)', textAlign: 'center'}}>
        { withLogo && <img style={{width: '30vw', pointerEvents: 'none'}} src={MainLogo} alt="main logo" /> }
        <Box sx={{background: 'rgba(255,255,255,.1)', backdropFilter: `blur(16px) saturate(180%)`, marginTop: '5vh', border: `2px solid #fff`, borderRadius: '1.5vw'}}>
            <Box sx={{position: 'absolute',top: '.5rem', right: '.5rem',display: 'flex',justifyContent:"flex-end"}}><ColorPickerComponent clickState={clickState} setClickState={setClickState} color={color} onChangeComplete={color => {setColor(color);setState({
            field: 'color',
            value: color.hex,
            broadcast: true
        });}}><PaletteRounded sx={{color: invertColor(color.hex), filter: 'grayscale(100%)'}}/></ColorPickerComponent></Box>
            <input onKeyDown={keyDownHandler} onKeyUp={keyUpHandler} className="paragraph" onMouseDown={() => setClickState(false)} spellCheck={false} onBlur={(e) => e.target.focus()} style={inputStyle} autoFocus type="text" value={value} placeholder="Enter some text..." onChange={onTextFieldChanged}></input>
        </Box>
    </Box>
};



export default InputBox;