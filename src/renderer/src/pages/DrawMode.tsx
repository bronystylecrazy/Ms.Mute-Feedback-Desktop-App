import { Badge, Button, Divider, Grid, IconButton, Stack, Typography, alpha, Slider, Avatar } from "@mui/material";
import { Box } from "@mui/system";
import CollectionButton from "../components/buttons/CollectionButton";
import VideoBackground from '../components/VideoBackground';
import { LibraryBooksOutlined, CollectionsOutlined, Edit, SaveAlt, Save, Delete, Add, Circle } from "@mui/icons-material";
import InputBox from "../components/InputBox";
import TopLeftLogo from "../components/logos/TopLeftLogo";
import BottomRightLogo from "../components/logos/BottomRightLogo";
import TopRight from "../components/logos/TopRight";
import { useEffect, useState } from "react";
import ColorLensIcon from '@mui/icons-material/ColorLens';
import { fabric } from 'fabric'
import { FabricJSCanvas, useFabricJSEditor } from "fabricjs-react";

const DrawMode = ({ state, setState }) => {
    const [fileName, setFileName] = useState('Untitled');
    const { editor, onReady } = useFabricJSEditor()
    const modes = ['pen', 'pen','pen'];
    const [mode, setMode] = useState('pen');
    const [width, setWidth] = useState(5);

    const colors = ['#ff0077', '#00ffea', '#00ff00', '#0000ff', '#ffff00'];
    const glowColors = ['#0084ff', '#00d9ff', '#00ff00', '#0000ff', '#ffff00'];

    const [selectedColor, setSelectedColor] = useState(colors[Math.floor(Math.random() * colors.length)]);
    const [glowColor, setGlowColor] = useState(glowColors[Math.floor(Math.random() * glowColors.length)]);
    const [maxWidth, setMaxWidth] = useState(72);
    const [intensity, setIntensity] = useState(10);

    const titles = {
        pen: 'ปากกา',
        save: 'บันทึก',
    }

    const icons = {
        pen: <Edit/>,
    };

    const marks = [
        {
          value: 1,
          label: '1px',
        },
        {
          value: 2,
          label: '2px',
        },
        {
          value: 4,
          label: '4px',
        },
        {
          value: 8,
          label: '8px',
        },
        {
          value: 16,
          label: '16px',
        },
      ];

    const GetIcon = mode => icons[mode];

    const save = () => {
        if(editor){
            window.fs.writeFileSync(`${fileName}.json`,JSON.stringify(editor.canvas))
            window.fs.writeFileSync(`${fileName}.svg`,editor.canvas.toSVG())
        }
    };

    useEffect(() => {
        if(editor){
            editor.canvas.isDrawingMode = true;
            editor.canvas.freeDrawingBrush.width = width;
            editor.canvas.freeDrawingBrush.color = selectedColor;

            let isDrawing = false;
            editor.canvas.on('mouse:down', function({e}) {
                isDrawing = true;
                const pointer =  editor.canvas.getPointer(e);
                window.ipcRenderer.send('mouse:down',{pointer: {x: pointer.x, y: pointer.y},e});
            }).on('mouse:up', function({e}) {
                isDrawing = false;
                const pointer =  editor.canvas.getPointer(e);
                // window.ipcRenderer.send('mouse:up',{pointer: {x: pointer.x, y: pointer.y},e});
                window.ipcRenderer.send('sync:canvas',JSON.stringify(editor.canvas.toJSON()));
            }).on('mouse:move', function({e}) {
                if (isDrawing) {
                    const pointer =  editor.canvas.getPointer(e);
                    window.ipcRenderer.send('mouse:move',{pointer: {x: pointer.x, y: pointer.y},e});
                }
            });

            if(editor.canvas.freeDrawingBrush){
                var brush = editor.canvas.freeDrawingBrush;
                brush.shadow = new fabric.Shadow({
                    blur: intensity,
                    offsetX: 0,
                    offsetY: 0,
                    affectStroke: true,
                    color: glowColor,
                });
                    
            }
        }

        return () => {
            if(editor){
                editor.canvas.__eventListeners = { };
            }
        };
    },[editor,width, selectedColor, intensity, glowColor]);

    const ButtonGroup = { 
        borderRadius: '1rem',
        border: '2px solid #fff',
        width: 'auto',
        padding: '.5rem',
        background: '#ffffff12',
    };


    return <Box>
        <TopLeftLogo state={state} setState={setState}/>
        <BottomRightLogo />
        <TopRight buttonTitle="Text Only Mode" to="/text"/>

        <Box sx={{position: 'fixed', width: '100%', borderRadius: '2.5rem', top: '0', left: '0', bottom: '0',right: 0}}>
            <FabricJSCanvas onReady={onReady} className="projector"/>
        </Box>
        <Grid container gap={10} sx={{transform: 'translateX(-50%)',
        position: 'fixed', bottom: '1rem', left: '50%',
        justifyContent: 'center', textAlign: 'center', color: 'white'}}>
            <Grid container gap={5} sx={ButtonGroup}>
                {/* {modes.map((target,index) => <Grid item key={index}>
                    <Button variant={mode === target ?  `contained` : "text"} onClick={() => setMode(target)}>{GetIcon(target)}</Button>
                    <Typography component="div" mt={1}><b style={{fontWeight: 500}}>{titles[target]}</b></Typography>
                </Grid>)} */}
                <Grid item sx={{position: 'relative'}}>
                    <Stack sx={{textAlign: 'left',padding: '2rem',width: '20rem', color: '#323232',background: 'white', borderRadius: '1rem', position: 'absolute', top: 0, transform: `translateX(-40%) translateY(calc(-100% - 1.5rem))`}}>
                        <Typography variant="subtitle" fontWeight="500" sx={{color: alpha(`#323232`,0.9), paddingBottom: '.25rem'}}>สีข้างใน</Typography>
                        <Grid container gap={2} sx={{paddingBottom: '2rem'}} justifyContent="center">
                            { colors.map(color => <Grid item md={2}>
                                <IconButton size="small" onClick={() => setSelectedColor(color)} variant="contained" sx={{ border: `4px solid ${selectedColor === color ? 'black' : 'transparent'}`,boxShadow: 15, background: color, color: color, '&:hover': { background: color}}}>
                                    <Edit/>
                                </IconButton>
                            </Grid>)}
                        </Grid>
                        <Typography variant="subtitle" fontWeight="500" sx={{color: alpha(`#323232`,0.9), paddingBottom: '.25rem'}}>สีเรืองแสง</Typography>
                        <Grid container gap={2} sx={{paddingBottom: '2rem'}} justifyContent="center">
                            { glowColors.map(color => <Grid item md={2}>
                                <IconButton size="small" onClick={() => setGlowColor(color)} variant="contained" sx={{ border: `4px solid ${glowColor === color ? 'black' : 'transparent'}`,boxShadow: 15, background: color, color: color, '&:hover': { background: color}}}>
                                    <Edit/>
                                </IconButton>
                            </Grid>)}
                        </Grid>
                        <Typography variant="subtitle" fontWeight="500" sx={{width: '100%',color: alpha(`#323232`,0.9), paddingBottom: '.25rem'}}>ตั้งค่าปากกา</Typography>
                        <Grid container spacing={5}>
                            <Grid item xs={12} md={6}>
                                <Box sx={{width: '100%',height: '100%', position: 'relative', background: alpha(`#000`,.9), borderRadius: '1rem'}}>
                                    {/* <Avatar sx={{position: 'absolute', width: '24', height: '24'}}/> */}
                                    <Box sx={{ borderRadius: '100%', boxShadow: `0px 0px ${intensity}px 0px rgba(255,255,255)`, transition: 'all .25s ease-in-out', background: selectedColor, width: `${width}px`, height:`${width}px` , position: 'absolute', top: '50%',left: '50%', transform: 'translate(-50%,-50%)'}}/>
                                </Box>
                            </Grid>
                            <Grid item xs={12} md={6} sx={{ height: '100%'}}>
                                <Typography variant="subtitle" component="div" fontWeight="500" sx={{color: alpha(`#323232`,0.9),}}>ขนาด(px)</Typography>
                                <Slider
                                    sx={{width: '100%'}}
                                    color="success"
                                    min={1}
                                    value={width}
                                    max={maxWidth}
                                    onChange={(e,value) => setWidth(value)}
                                    getAriaValueText={(width) => `${width}px`}
                                    step={.5}
                                    valueLabelDisplay="auto"
                                    // marks={marks}
                                />
                                 <Typography variant="subtitle" component="div" fontWeight="500" sx={{color: alpha(`#323232`,0.9),}}>ความเรืองแสง</Typography>
                                 <Slider
                                    sx={{width: '100%'}}
                                    color="warning"
                                    min={0}
                                    value={intensity}
                                    max={40}
                                    onChange={(e,value) => setIntensity(value)}
                                    getAriaValueText={(width) => `${width}px`}
                                    step={.5}
                                    valueLabelDisplay="auto"
                                    // marks={marks}
                                />
                            </Grid>
                        </Grid>
                    </Stack>
                    <Button sx={{
                            background: mode === 'pen' ?  `rgba(255,255,255,.4)` : "rgba(255,255,255,.3)",
                            "&:hover": {
                                background: mode === 'pen' ?  `rgba(255,255,255,.4)` : "rgba(255,255,255,.3)",
                            }
                        }}
                        onClick={() => setMode('pen')}
                        >
                        <Badge
                            anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'right',
                            }}
                            color="secondary"
                            variant="dot"
                            overlap="circular"
                            sx={{
                                "& .MuiBadge-badge": {
                                    color: selectedColor,
                                    backgroundColor: selectedColor
                                }
                            }}
                        ><Edit/></Badge></Button>
                    <Typography component="div" mt={1}><b style={{fontWeight: 500}}>{titles['pen']}</b></Typography>
                </Grid>
            </Grid>
            <Grid container gap={5} sx={ButtonGroup}>
                 <Grid item>
                    <Button sx={{background: 'rgba(255,255,255,.1)'}} onClick={save}><Save/></Button>
                    <Typography component="div" mt={1}><b style={{fontWeight: 500}}>{titles['save']}</b></Typography>
                </Grid>
                {/* <Grid item>
                    <Button sx={{background: 'rgba(255,255,255,.1)'}} onClick={save}><Save/></Button>
                    <Typography component="div" mt={1}><b style={{fontWeight: 500}}>{titles['save']}</b></Typography>
                </Grid> */}
            </Grid>
        </Grid>
    </Box>
};

export default DrawMode;