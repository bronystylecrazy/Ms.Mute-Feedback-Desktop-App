import { Grid } from "@mui/material";
import { Box } from "@mui/system";
import { LibraryBooksOutlined, CollectionsOutlined } from "@mui/icons-material";
import InputBox from "../components/InputBox";
import TopLeftLogo from "../components/logos/TopLeftLogo";
import BottomRightLogo from "../components/logos/BottomRightLogo";
import TopRight from "../components/logos/TopRight";
import { nanoid } from 'nanoid';
import BrushIcon from '@mui/icons-material/Brush';
import ButtomLeft from "@/components/logos/BottomLeft";


const TextMode = ({ state, setState }) => {
   
    return <Box>
        <InputBox state={state} setState={setState}/>
        <TopLeftLogo state={state} setState={setState}/>
        <BottomRightLogo/>
        <ButtomLeft buttonTitle="ย้อนกลับ" to="/text"/>
        <TopRight  to={`/drawmode?project=Untitled-${nanoid(6)}`} icon={ <BrushIcon sx={{marginRight: '.75rem'}}/> }  buttonTitle="โหมดวาดภาพ"/>
    </Box>
};

export default TextMode;