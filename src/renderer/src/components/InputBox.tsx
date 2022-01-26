import { Box } from "@mui/material";
import MainLogo from '../assets/logos/main.png';

const InputBox = ({ setState, state, withLogo = true }) => {

    const inputStyle = {
        width: '50vw',
        padding: '2vw',
        border: `2px solid #fff`,
        color: 'white',
        backgroundColor: 'transparent',
        textAlign: 'center',
        outline: 'none',
        borderRadius: '1.5vw',
        fontSize: '3vw',
        fontFamily: "'IBM Plex Sans', Arial, Helvetica, sans-serif",
        marginTop: '5vh'
    } as React.CSSProperties;

    const onTextFieldChanged = (e) => {
        setState({
            field: 'inputField',
            value: e.target.value,
            broadcast: false
        });
    };

    return <Box sx={{position: 'fixed',
    top: '40%',
    left: '50%',
    transform: 'translate(-50%,-50%)', textAlign: 'center'}}>
        { withLogo && <img style={{width: '30vw'}} src={MainLogo} alt="main logo" /> }
        <input style={inputStyle} type="text" value={state.inputField} placeholder="Enter some text..." onChange={onTextFieldChanged}></input>
    </Box>
};


export default InputBox;