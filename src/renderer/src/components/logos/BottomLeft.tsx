import { Settings } from "@mui/icons-material";
import { LoadingButton } from '@mui/lab';
import { Box , IconButton } from "@mui/material";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';

const ButtomLeft = ({ buttonTitle="Draw Mode", to="/drawmode" }) => {
    const style = {
        position: 'fixed',
        left: 0,
        bottom: 0,
        zIndex: 1000,
        padding: '1rem'
    };
    
    const switchMode = () => {
      
    };

    return <Box sx={style}>
        <Link to={to}>
          <LoadingButton size="large" color="secondary"><ChevronLeftIcon/> {buttonTitle}</LoadingButton>
        </Link>
    </Box>;
};

export default ButtomLeft;