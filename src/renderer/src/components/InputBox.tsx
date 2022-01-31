import { PaletteRounded } from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";
import { Box, Button, Grid } from "@mui/material";
import { makeStyles } from '@mui/styles'
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
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

const TIMER = 0.2;

const InputBox = ({ setState, state, withLogo = true }) => {
    const [timer, setTimer] = useState(TIMER * 60);
    const {search} = useLocation();
    const query = useMemo(() => new URLSearchParams(search), [search]);
    const [color, setColor] = useState({ hex: query.get('color') ? query.get('color') : '#fff' });
    const [clickState,setClickState] = useState(false);
    const [value, setValue] = useState(query.get('text') ? query.get('text').replaceAll('<br>','\n') : '');
    const [isCtrl, setIsCtrl] = useState(false);
    const navigate = useNavigate();

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
        document.title = `Feedback app | ${timer}s`;
        if(timer <= 0){
            document.title = `Feedback app`;
            navigate('/text');
        }
    },[timer])

    useEffect(() => {
        setState({
            field: 'inputField',
            value,
            broadcast: true,
        });

        setTimer(TIMER*60);

        // setState({
        //     data: {
        //         inputField: value,
        //         color: color.hex
        //     },
        //     broadcast: true,
        // });
    },[value, color.hex])

    useEffect(() => {
        const t = setInterval(() => {
            setTimer(timer => timer - 1);
        },1000)
        return () => {
            clearInterval(t);
        }
    },[])

    useEffect(() => {
        setState({
            field: 'color',
            value: color.hex,
            broadcast: true
        });
        window.ipcRenderer.on('save:text', (event, result) => {
            console.log(result)
            if(result.success){
                Swal.fire({
                    title: 'บันทึกสำเร็จ',
                    text: 'ขอบคุณที่มาร่วมกิจกรรมครับ ^^',
                    icon: 'success',
                    confirmButtonText: 'ตกลง',
                    timer: 1500
                })
            }else{
                Swal.fire({
                    title: 'ไม่สามารถบันทึกไฟล์ได้',
                    text: 'กรุณาตรวจสอบว่ามีอีกหน้าจออยู่หรือไม่',
                    icon: 'error',
                    confirmButtonText: 'ตกลง'
                })
                return;
            }
        });
        window.ipcRenderer.on('save:image', () => {
            console.log('success!');
            window.ipcRenderer.send('sync:canvas');
        });
        return () => {
            window.ipcRenderer.removeAllListeners('save:text');
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
            saveText();
        }
    }

    const saveText = () => {

        if(value.trim() == '') return;

        window.ipcRenderer.send('save:text', value);
    }

    const SubmitStyle = {
        padding: '.5vw',
        border: `2px solid #fff8`,
        color: 'white',
        borderRadius: '1vw',
        fontSize: '1.5vw',
        fontFamily: "'IBM Plex Sans', Arial, Helvetica, sans-serif",
        backdropFilter: `blur(16px) saturate(180%)`,
        boxShadow: 15,
        width: '20vw',
    };

    return <>
        <Box sx={{position: 'fixed', bottom: '2.5rem', left: '50%', transform: 'translateX(-50%)'}}>
            <LoadingButton size="large" sx={SubmitStyle} onClick={saveText}>
                Submit
            </LoadingButton>
            <Grid container sx={{color: 'white', justifyContent: 'center'}} mt={3}>
                <Box sx={{padding: '.5rem', fontSize: '1rem', borderRadius: '.5rem'}}>Or press </Box>
                <Box sx={{padding: '.5rem', fontSize: '1rem', background: '#323232', borderRadius: '.5rem'}}>Ctrl</Box>
                <Box sx={{padding: '.5rem', fontSize: '1rem',  borderRadius: '.5rem'}}>+</Box>
                <Box sx={{padding: '.5rem', fontSize: '1rem', background: '#323232', borderRadius: '.5rem'}}>Enter</Box>
                <Box sx={{padding: '.5rem', fontSize: '1rem', borderRadius: '.5rem'}}>to submit</Box>
            </Grid>
        </Box>
        <Box sx={{position: 'fixed',
        top: '40%',
        left: '50%',
        transform: 'translate(-50%,-50%)', textAlign: 'center'}}>
            { withLogo && <img style={{width: '30vw', pointerEvents: 'none'}} src={MainLogo} alt="main logo" /> }
            <Box sx={{background: 'rgba(255,255,255,.1)', backdropFilter: `blur(16px) saturate(180%)`, marginTop: '5vh', border: `2px solid #fff`, borderRadius: '1.5vw'}}>
                <Box sx={{position: 'absolute',top: '.5rem', right: '.5rem',display: 'flex',justifyContent:"flex-end"}}>
                    <ColorPickerComponent clickState={clickState} setClickState={setClickState} color={color} onChangeComplete={color => {setColor(color);setState({
                field: 'color',
                value: color.hex,
                broadcast: true
            });}}><PaletteRounded sx={{color: invertColor(color.hex), filter: 'grayscale(100%)'}}/></ColorPickerComponent>
            </Box>
                <textarea onKeyDown={keyDownHandler} rows={3} onKeyUp={keyUpHandler} className="paragraph" onMouseDown={() => setClickState(false)} spellCheck={false} onBlur={(e) => e.target.focus()} style={inputStyle} autoFocus type="text" value={value} placeholder="Enter some text..." onChange={onTextFieldChanged}></textarea>
            </Box>
        </Box>
    </>
};



export default InputBox;