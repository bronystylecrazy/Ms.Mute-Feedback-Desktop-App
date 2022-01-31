import { Grid, Typography, alpha, InputLabel, Select, MenuItem, TextField, InputAdornment, Input, Alert, Button, ButtonGroup, Container } from "@mui/material";
import { Box } from "@mui/system";
import ButtomLeft from '../components/logos/BottomLeft';
import BottomRightLogo from "../components/logos/BottomRightLogo";
import TopLeftLogo from "@/components/logos/TopLeftLogo";
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Search, Add } from "@mui/icons-material";
import { nanoid } from 'nanoid';
import SettingsSystemDaydreamIcon from '@mui/icons-material/SettingsSystemDaydream';
import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded';
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded';

const sortAlg = (left, right, sortBy) => {
    if(sortBy === 0){
        return left.name.localeCompare(right.name);
    }
    if(sortBy === 1){
        return left.updatedAt - right.updatedAt;
    }
    if(sortBy === 2){
        return left.size - right.size;
    }

    return left.updatedAt - right.updatedAt;
};

const Collection = ({state, setState}) => {
    const {search} = useLocation();
    const [searchText, setSearchText] = useState("");
    const [images, setImages] = useState([])
    const [hover, setHover] = useState(-1)
    const [sortBy, setSortBy] = useState(1)
    const [reverse, setReverse] = useState(true)
    

    const filteredItems = useMemo(() => { 
        const filtered = images.filter(item => item.name
            .toLowerCase()
            .includes(searchText.trim().toLowerCase()))
            .sort((a,b) => sortAlg(a,b,sortBy)
        );
        return reverse ? filtered.reverse() : filtered;
    },[images,searchText,sortBy,reverse])
    
    useEffect(() => {
        const setData = (event, data) => {
            setImages(JSON.parse(data).map(item => ({ id: nanoid() , ...item,  preview: `${item.preview}?${Date.now()}` })))
            console.log(JSON.parse(data).map(item => ({ id: nanoid(), ...item })))
        };
        window.ipcRenderer.send('view:image');
        window.ipcRenderer.on('view:image:updated', setData);

        return () => {
            window.ipcRenderer.removeAllListeners('view:image:updated')
        };
    },[search]);

    const downloadAs = () => {
        console.log('Opening... directory')
        window.shell.openPath(window.path.join(window.app.getPath('userData'), './storage/'))
    };

    return <Box>
        <TopLeftLogo state={state} setState={setState}/>
        <Box sx={{position: 'fixed', width: '100%', height: '100%', background: 'rgba(0,0,0,.3)'}}></Box>
        <ButtomLeft buttonTitle="ย้อนกลับ" to="/text?prev=collection"/>
        <Container sx={{display:'flex',flexDirection: 'column', justifyContent: 'flex-start',boxShadow: 17,backdropFilter: `blur(16px) saturate(180%)`,padding: '2rem',position: 'fixed', left: '50%',transform: `translateX(-50%)`,borderRadius: '1rem 1rem 0 0', top: '10rem', bottom: '0',border: '1px solid transparent', background: alpha('#fff',.08)}}>
            <Box md={12} sx={{display: 'flex'}} justifyContent="space-between">
                <Box>
                    <Link to={`/drawmode?prev=image_collection&project=Untitled-${nanoid(6)}`}><Button variant="outlined"><Add sx={{marginRight: '.75rem'}} />สร้างใหม่</Button></Link>
                    <Button variant="outlined" sx={{marginLeft: '1rem'}} onClick={() => downloadAs()}><SettingsSystemDaydreamIcon sx={{marginRight: '.75rem'}} />ดาวน์โหลด</Button>
                </Box>
                <Box sx={{display: 'flex'}}>
                    <Box>
                <Input onChange={e => setSearchText(e.target.value)} value={searchText} placeholder="ค้นหารูปภาพที่นี่.." startAdornment={
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
                    sx={{width: '8rem', marginRight: '1.5rem'}}
                    onChange={(e) => setSortBy(e.target.value)}
                >
                    <MenuItem value={0}>ชื่อรูป</MenuItem>
                    <MenuItem value={1}>วันเวลา</MenuItem>
                    <MenuItem value={2}>ขนาดภาพ</MenuItem>
                </Select>
                </Box>
                <Box>
                    <ButtonGroup size="small" variant="outlined">
                        <Button variant={reverse ? "contained" : 'outlined'} onClick={() => setReverse(reverse => !reverse)} ><ArrowUpwardRoundedIcon/></Button>
                        <Button variant={!reverse ? "contained" : 'outlined'} onClick={() => setReverse(reverse => !reverse)}><ArrowDownwardRoundedIcon/></Button>
                    </ButtonGroup>
                </Box>
                </Box>
            </Box>
            <Box className="project-viewer" mt={5}  sx={{ overflow: 'auto'}}>
            {
            filteredItems.length > 0 ? 
                (<Grid container spacing={5} md={12}>
                    {filteredItems.map((image,index) => <Grid key={image.id} item xs={12} sm={6} md={4}>
                        <Link to={`/drawmode?project=${image.name}&prev=image_collection`}>
                            <Box onMouseEnter={() => setHover(index)} onMouseLeave={() => setHover(-1)} sx={{boxShadow: 10,transition: 'all 0.3s ease-in-out',overflow:'hidden',border: `2px solid ${hover === index ? 'white' : 'rgba(0,0,0,.1)'}`,width: '100%', position: 'relative', paddingTop: '56.25%', background: alpha("#000000",.2), borderRadius: '1rem'}}>
                                <img style={{ opacity: hover === index ? 1 : .6,...(image.meta.ratio > 1 ? {width: '100%'} : {height: '100%'}),transition: 'all 0.3s ease-in-out', transform: `scale(${hover === index ? 1.1 : 1}) translate(-50%, -50%)`,top: '50%', position: 'absolute', left: '50%'}}src={`file:///${image.preview}`}></img>
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
                                    { image.name } <div style={{color: 'white',fontWeight: '300'}}>by {image.author } <span style={{opacity: .7}}>• { (image.size*1024).toFixed(2) }KB</span></div>
                                </Box>
                            </Box>
                        </Link>
                    </Grid>)}
                </Grid>)
            : 
                (<Grid container md={12} sx={{width: '100%'}}>
                    <Box sx={{width: '100%',display: 'flex', justifyContent: 'center'}} mt={6}>
                        { images.length > 0 ? <Alert variant="outlined" severity="info" sx={{width: '100%',justifyContent: 'center'}}>
                            ไม่พบผลการค้นหา <b>{searchText}</b> 
                        </Alert> : <Alert variant="outlined" severity="warning" sx={{width: '100%',justifyContent: 'center'}}>
                            ยังไม่มีการสร้างโปรเจค
                        </Alert>}
                    </Box>
                </Grid>)
            }
            <Box sx={{ display: 'flex',flexGrow: '1'}}></Box>
            </Box>
        </Container>

        <BottomRightLogo/>
    </Box>
};

export default Collection;