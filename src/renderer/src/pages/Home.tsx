import { Grid } from "@mui/material";
import { Box } from "@mui/system";
import TopLeftLogo from "../components/logos/TopLeftLogo";
import BottomRightLogo from "../components/logos/BottomRightLogo";
import TopRight from "../components/logos/TopRight";
import { LibraryBooksOutlined, CollectionsOutlined, Brush } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import CollectionButton from "../components/buttons/CollectionButton";
import { nanoid } from 'nanoid';

import TextLogo from '@/assets/logos/text.svg';
import DrawLogo from '@/assets/logos/draw.svg';
import MainLogo from '@/assets/logos/main.png';
import { useEffect } from "react";

const Home = ({ state, setState}) => {
    const navigate = useNavigate();
    const ButtonGroup = { 
        transform: 'translate(-50%,-50%) scale(.6)',
        position: 'fixed', bottom: 0, left: '50%',
        justifyContent: 'center',
        paddingLeft: '2.5vw',
    };

    useEffect(() => {
        window.ipcRenderer.on('as-monitor', () => {
            navigate('/monitor');
        })
        return () => {
            window.ipcRenderer.removeAllListeners('as-monitor');
        }
    },[])

    return <Box>
        <TopRight showButton={false}/>

        <TopLeftLogo state={state} setState={setState}/>
        <BottomRightLogo/>
        <img style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',width: '60vw', pointerEvents: 'none', opacity: .3}} src={MainLogo} alt="main logo" />
        {/* <TopRight  to={`/drawmode?project=Untitled-${nanoid(6)}`} icon={ <BrushIcon sx={{marginRight: '.75rem'}}/> }  buttonTitle="โหมดวาดภาพ"/> */}
        <Box sx={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%) scale(1.25)'}}>
            <Grid container sx={{ width: 'auto'}} spacing={10}>

                <Grid item md={6}>
                    <CollectionButton style={{width: "20vw", height: '100%'}} onClick={() => navigate(`/textmode`)} >
                        {/* <Brush sx={{marginRight: '.75rem'}}/>  <br/> โหมดวาดภาพ */}
                        <Grid container sx={{ width: '100%'}}>
                            <Grid item sx={{ width: '100%'}}>
                                <img style={{width: '100%', pointerEvents: 'none'}} src={TextLogo}></img> 
                                <Box>ทีมข้อความ!</Box>
                            </Grid>
                        </Grid>
                    </CollectionButton>
                </Grid>
                <Grid item md={6}>
                <CollectionButton style={{width: "20vw", height: '100%'}} onClick={() => navigate(`/drawmode?project=Untitled-${nanoid(6)}`)} >
                    {/* <Brush sx={{marginRight: '.75rem'}}/>  <br/> โหมดวาดภาพ */}
                    <Grid container sx={{ width: '100%'}}>
                        <Grid item sx={{ width: '100%',display: 'flex',flexDirection:'column', justifyContent: 'space-between'}}>
                            <img style={{width: '100%', pointerEvents: 'none'}} src={DrawLogo}></img>
                            <Box>ทีมวาดภาพ!</Box>
                        </Grid>
                    </Grid>
                </CollectionButton>
                </Grid>
            </Grid>
        </Box>

        <Grid container spacing={5} sx={ButtonGroup}>
            <CollectionButton size="small" onClick={() => navigate('/text_collection')} style={{width: "20vw", marginRight: "2vw"}} >
                <LibraryBooksOutlined sx={{fontSize: '2.5vw',marginRight: '0.5vw'}}/>คลังข้อความ
            </CollectionButton>
            <CollectionButton  size="small" onClick={() => navigate('/image_collection')} style={{width: "20vw"}}><CollectionsOutlined sx={{fontSize: '2.5vw', marginRight: '0.5vw'}}/> คลังรูปภาพ</CollectionButton>
        </Grid>
    </Box>;
};

export default Home;