import { Settings } from "@mui/icons-material";
import { LoadingButton } from '@mui/lab';
import { Box , IconButton } from "@mui/material";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const TopRight = ({ buttonTitle="Draw Mode", to="/drawmode" }) => {
    const [isMonitLoading, setIsMonitLoading] = useState(false);
    const [monitor, setMonitor] = useState(null);

    const style = {
        position: 'fixed',
        top: 0,
        right: 0,
        zIndex: 1000
    };

    useEffect(() => {
      window.ipcRenderer.on('save:message-result', (dataUrl) => {
        console.log(dataUrl);
      });
      return () => {
        window.ipcRenderer.removeAllListeners('save:message-result');
      };
    }, []);
    

    const turnOnMonitor = () => {
        setIsMonitLoading(true);
        const result = window.ipcRenderer.sendSync('monitor:open')
        setIsMonitLoading(false);
        setMonitor(result);
    };

    // const saveTextAsImage = () => {
    //     window.ipcRenderer.send('save:message')
    // };

    const switchMode = () => {
      
    };

    return <Box sx={style}>
        <Link to={to}>
          <LoadingButton variant="outlined" color="secondary">{buttonTitle}</LoadingButton>
        </Link>
        <IconButton aria-label="setting"  disabled={isMonitLoading} onClick={turnOnMonitor}>
            <Settings sx={{ fontSize: '2.5rem'}}/>
        </IconButton>
    </Box>;
};

export default TopRight;