import { Button, useTheme } from '@mui/material';


const CollectionButton = ({children,...props}) => {
    const style = {
        padding: '.5vw',
        border: `2px solid #fff8`,
        color: 'white',
        borderRadius: '1vw',
        fontSize: '2.5vw',
        fontFamily: "'IBM Plex Sans', Arial, Helvetica, sans-serif",
        backdropFilter: `blur(16px) saturate(180%)`,
        boxShadow: 15
    };

    return <Button variant="outlined" color="secondary" sx={style} {...props} >{children}</Button>
};

export default CollectionButton;