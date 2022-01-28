import { Box } from "@mui/material";

import Main2Logo from '../../assets/logos/main2.png';
import DesignWeekLogo from '../../assets/logos/designweek.png';
import DesignTimeLogo from '../../assets/logos/designtime.png';

const BottomRightLogo = () => {
    const logos = [DesignWeekLogo, DesignTimeLogo, Main2Logo];
    const logoStyle = {
        height: '6vw',
        marginLeft: '.5vw'
    };
    return <Box sx={{ position:"fixed", right: 0, bottom: 0, pointerEvents: 'none'}}>
        { logos.map((logo, index) => <img alt={logo} src={logo} style={logoStyle} key={index} />) }
    </Box>;
};

export default BottomRightLogo;