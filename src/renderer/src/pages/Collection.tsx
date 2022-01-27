import { Grid, Typography, alpha, InputLabel, Select, MenuItem, TextField, InputAdornment, Input } from "@mui/material";
import { Box } from "@mui/system";
import CollectionButton from "../components/buttons/CollectionButton";
import VideoBackground from '../components/VideoBackground';
import BottomRightLogo from "../components/logos/BottomRightLogo";
import TopLeftLogo from "@/components/logos/TopLeftLogo";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search } from "@mui/icons-material";

const Collection = ({state, setState}) => {
    const [images, setImages] = useState([])
    const [hover, setHover] = useState(-1)
    const [sortBy, setSortBy] = useState(1)

    useEffect(() => {
        const setData = (event, data) => {
            setImages(JSON.parse(data))
        };
        window.ipcRenderer.send('view:image');
        window.ipcRenderer.on('view:image:updated', setData);

        return () => {
            window.ipcRenderer.removeAllListeners('view:image:updated')
        };
    },[])    
    return <Box>
        <TopLeftLogo state={state} setState={setState}/>
        <Box sx={{padding: '2rem',position: 'fixed', borderRadius: '1rem 1rem 0 0', top: '10rem', left: '15%', bottom: '0',right: '15%',border: '1px solid transparent', background: alpha('#fff',.05)}}>
            <Box sx={{display: 'flex'}} justifyContent="flex-end">
                <Box>
                <Input placeholder="ค้นหารูปภาพที่นี่.." startAdornment={
            <InputAdornment position="start">
              <Search/>
            </InputAdornment>
          } id="input-with-sx" label="ค้นหา" mr={2} variant="standard" />
                <b style={{color: 'white', marginLeft: '1.5rem', marginRight: '.5rem'}}>เรียงจาก: </b>
                <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    variant="standard"
                    value={sortBy}
                    label="Age"
                    size="small"
                    sx={{width: '8rem'}}
                    onChange={(e) => setSortBy(e.target.value)}
                >
                    <MenuItem value={0}>ชื่อรูป</MenuItem>
                    <MenuItem value={1}>วันเวลา</MenuItem>
                    <MenuItem value={2}>ขนาดภาพ</MenuItem>
                </Select>
                </Box>
            </Box>
            <Grid container spacing={5} mt={1}>
                {images.map((image,index) => <Grid key={image.preview} item xs={12} sm={6} md={4}>
                    <Link to={`/drawmode?project=${image.name}`}>
                        <Box onMouseEnter={() => setHover(index)} onMouseLeave={() => setHover(-1)} sx={{transition: 'all 0.3s ease-in-out',overflow:'hidden',border: `2px solid ${hover === index ? 'white' : 'transparent'}`,width: '100%', position: 'relative', paddingTop: '56.25%', background: alpha("#000000",.2), borderRadius: '1rem'}}>
                            <img style={{height: '100%',transition: 'all 0.3s ease-in-out', transform: `scale(${hover === index ? 1.1 : 1}) translateX(-50%)`,top: 0, position: 'absolute', left: '50%'}}src={`file:///${image.preview}`}></img>
                             <Box sx={{
                                    position: 'absolute',
                                    transition: 'all 0.3s ease-in-out',
                                    inset: 0,
                                    background: `linear-gradient(0deg, rgba(8, 8, 8, .6) 0%, rgba(16, 16, 16, 0.1) 70%)`,
                                    opacity: hover === index ? 1 : 0
                                }}
                            /> 
                            <Box sx={{
                                position: 'absolute',
                                transition: 'all 0.3s ease-in-out',
                                inset: 0,
                                background: `linear-gradient(0deg, rgba(8, 8, 8, .6) 0%, rgba(16, 16, 16, 0.1) 40%)`,
                                opacity: hover === index ? 0 : 1
                                }}
                            />
                            
                            <Box sx={{position: 'absolute', bottom: '.5rem', left: '1.5rem', color: 'white', fontWeight: '500'}}>
                                { image.name } <div style={{color: 'white',fontWeight: '300'}}>by {image.author }</div>
                            </Box>
                        </Box>
                    </Link>
                </Grid>)}
            </Grid>
        </Box>

        <BottomRightLogo/>
    </Box>
};

export default Collection;