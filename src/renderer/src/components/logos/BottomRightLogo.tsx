import { Box } from "@mui/material";

import Main2Logo from '../../assets/logos/main.png';
import DesignWeekLogo from '../../assets/logos/designweek.png';
import DesignTimeLogo from '../../assets/logos/designtime.png';
import formalLogo from '../../assets/logos/formal.png';
import informalLogo from '../../assets/logos/informal.png';

const BottomRightLogo = () => {
    const logos = [formalLogo, informalLogo, DesignWeekLogo, DesignTimeLogo, Main2Logo];
    const logoStyle = {
        height: '4.5vw',
        marginLeft: '.5vw'
    };
    return <Box sx={{ position:"fixed", right: 0, bottom: 0, pointerEvents: 'none'}}>
        { logos.map((logo, index) => <img alt={logo} src={logo} style={logoStyle} key={index} />) }
    </Box>;
};

export default BottomRightLogo;