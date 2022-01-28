import { Grid } from "@mui/material";
import { Box } from "@mui/system";
import CollectionButton from "../components/buttons/CollectionButton";
import VideoBackground from '../components/VideoBackground';
import { LibraryBooksOutlined, CollectionsOutlined } from "@mui/icons-material";
import InputBox from "../components/InputBox";
import TopLeftLogo from "../components/logos/TopLeftLogo";
import BottomRightLogo from "../components/logos/BottomRightLogo";
import TopRight from "../components/logos/TopRight";
import { useNavigate } from 'react-router-dom';
import { nanoid } from 'nanoid';

const Home = ({ state, setState }) => {
    const navigate = useNavigate();
    const ButtonGroup = { 
        transform: 'translate(-50%,-50%)',
        position: 'fixed', bottom: 0, left: '50%',
        justifyContent: 'center',
        paddingLeft: '2.5vw'
    };

    return <Box>
        <InputBox state={state} setState={setState}/>
        <TopLeftLogo state={state} setState={setState}/>
        <BottomRightLogo/>
        <TopRight  to={`/drawmode?project=Untitled-${nanoid(6)}`}/>

        <Grid container spacing={5} sx={ButtonGroup}>

            <CollectionButton onClick={() => navigate('/text_collection')} style={{width: "20vw", marginRight: "2vw"}} >
                <LibraryBooksOutlined sx={{fontSize: '2.5vw',marginRight: '0.5vw'}}/>คลังข้อความ
            </CollectionButton>
            <CollectionButton onClick={() => navigate('/image_collection')} style={{width: "20vw"}}><CollectionsOutlined sx={{fontSize: '2.5vw', marginRight: '0.5vw'}}/> คลังรูปภาพ</CollectionButton>
        </Grid>
    </Box>
};

export default Home;