import { Settings } from "@mui/icons-material";
import { LoadingButton } from '@mui/lab';
import { Box , Button, IconButton } from "@mui/material";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import CastIcon from '@mui/icons-material/Cast';

const TopRight = ({ showButton=true, buttonTitle="Draw Mode", to="/drawmode", icon=<></>}) => {
    const [isMonitLoading, setIsMonitLoading] = useState(false);
    const [monitor, setMonitor] = useState(null);

    const style = {
        position: 'fixed',
        top: '.5rem',
        right: '.5rem',
        zIndex: 1000,

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
        {showButton && <Link to={to}>
          <LoadingButton variant="outlined" size="large" color="secondary" sx={{ marginRight: '.5rem'}}>{icon} {buttonTitle}</LoadingButton>
        </Link>}
        <LoadingButton variant="outlined" size="large" disabled={isMonitLoading} onClick={turnOnMonitor}>
            <CastIcon sx={{ fontSize: '1.5rem', marginRight: '.5rem'}}/> เปิดหน้าจอ
        </LoadingButton>
    </Box>;
};

export default TopRight;