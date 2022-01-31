import { Badge, Button, Divider, Grid, IconButton, Stack, Typography, alpha, Slider, Avatar, TextField, SnackbarOrigin } from "@mui/material";
import { makeStyles } from '@mui/styles'
import { Box } from "@mui/system";
import CollectionButton from "../components/buttons/CollectionButton";
import VideoBackground from '../components/VideoBackground';
import { LibraryBooksOutlined, CollectionsOutlined, Edit, SaveAlt, Save, Delete, Add, Circle, DeleteOutlined, RampLeft, PaletteRounded, CircleRounded } from "@mui/icons-material";
import InputBox from "../components/InputBox";
import TopLeftLogo from "../components/logos/TopLeftLogo";
import BottomRightLogo from "../components/logos/BottomRightLogo";
import TopRight from "../components/logos/TopRight";
import { useContext, useEffect, useMemo, useState } from "react";
import ColorLensIcon from '@mui/icons-material/ColorLens';
import { fabric } from 'fabric'
import { FabricJSCanvas, useFabricJSEditor } from "fabricjs-react";
import Swal from 'sweetalert2';
import { useLocation, useNavigate } from 'react-router-dom'

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { ipcRenderer } from "electron/renderer";
import ButtomLeft from "@/components/logos/BottomLeft";
import { NotificationContext } from "@/context/notification";
import ShortTextIcon from '@mui/icons-material/ShortText';
import MouseIcon from '@mui/icons-material/Mouse';
import ColorPickerComponent from "@/components/ColorPicker";
import { SketchPicker } from "react-color";
import ReplayIcon from '@mui/icons-material/Replay';

const TIMER = 2; // 5 MINUTES
const app = window.app;
const DrawMode = ({ state, setState }) => {
    const [isWaiting, setIsWaiting] = useState(false);
    const [timer, setTimer] = useState(TIMER * 60);
    const {search} = useLocation();
    const query = useMemo(() => new URLSearchParams(search), [search]);
    const [open, setOpen] = useState(false);
    const [fileName, setFileName] = useState(query.get('project') || 'Untitled');
    const { editor, onReady } = useFabricJSEditor()
    const modes = ['pen', 'pen','pen'];
    const [mode, setMode] = useState('pen');
    const [width, setWidth] = useState(5);
    const strokeWidth = useMemo(() => width, [width]);
    
    const [clickState,setClickState] = useState(true);
    // generate ten colors
    const [colors, setColors] = useState(["#ff0000", "#ff7d00", "#ffbf00", "#ffff00", "#7fff00", "#00ffbf",  "#007fff", "#0000ff", "#7d00ff",  "#ff0000"]);
    // generate ten colors
    const [glowColors, setGlowColors] = useState(["#ff0000", "#ff7d00", "#ffbf00", "#ffff00", "#7fff00", "#00ffbf",  "#007fff", "#0000ff", "#7d00ff",  "#ff0000"]);
    // const glowColors = ['#0084ff', '#00d9ff', '#00ff00', '#0000ff'];
    const [selectedColor, setSelectedColor] = useState(colors[0]);
    const [glowColor, setGlowColor] = useState(glowColors[0]);
    const [maxWidth, setMaxWidth] = useState(72);
    const [intensity, setIntensity] = useState(10);
    const [_color, _setColor] = useState('#fff');
    const [_glowColor, _setGlowColor] = useState('#fff');
    const [showPenSetting, setShowPenSetting] = useState(false);
    const { notify } = useContext(NotificationContext);
    const [additionalColor, setAdditionalColor] = useState('#fff');
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const styles = useStyle({ showPenSetting,clickState, top: position.top, left: position.left });

    const [colorIndex, setColorIndex] = useState(0);
    const [glowColorIndex, setGlowColorIndex] = useState(0);

    useEffect(() => {
        _setColor(selectedColor);
        _setGlowColor(glowColor);
    },[glowColor, selectedColor])

    const navigate = useNavigate();
    const titles = {
        mouse: 'ลากภาพ',
        pen: 'ปากกา',
        save: 'บันทึก',
        clear: 'เคลียร์',
        reload: 'รีโหลด',
    }

    const handleClickOpen = () => {
        setOpen(true);
    };
    
    const handleClose = () => {
        setOpen(false);
    };

    const saveWithBoundary = (outDir, schema) => {
        console.log('cutting...')
        const group = new fabric.Group();
        const canvas = editor.canvas;
        canvas.forEachObject(function(o, i) {
            group.addWithUpdate(o);
        });
        const {height,
            left,
            top,
            width} = group.getBoundingRect();
        const bounding = new fabric.Rect({height: height + intensity*2, left: left - intensity, top: top - intensity, width: width + intensity*2, fill: "#fff0"});
        group.addWithUpdate(bounding)
        console.log('saving as a svg..')
        window.fs.writeFileSync(`${outDir}/${schema.entry.vector}`,editor.canvas.toSVG());
        window.ipcRenderer.send('save:image', {
            dataURL: group.toDataURL({
                format: 'png',
                quality: 0.8
            }),
            outPath: `${outDir}/${schema.entry.png}`
        });
            

        canvas.clear().renderAll();
        canvas.add(group);
        var items = group._objects;
        group._restoreObjectsState();
        group.remove(bounding)
        canvas.remove(group);
        for(var i = 0; i < items.length; i++) {
            canvas.add(items[i]);
        }

        canvas.renderAll();
        console.log('this is a group! ')
        return {
                    width,
                    height
        };
    };

    const save = () => {
        setShowPenSetting(false)
        if(editor){
            const createAt = Date.now();
            let schema = {
                name: fileName,
                entry: {
                    project: 'project.json',
                    vector: 'vector.svg',
                    png: 'drawing.png'
                },
                createdAt: createAt,
                updatedAt: createAt,
                author: '',
                meta: {
                    width: 0,
                    height: 0,
                    ratio: 0
                }
            };
            const storageDir = window.path.join(app.getPath('userData'),`./storage`);
            if(!window.fs.existsSync(storageDir)) window.fs.mkdirSync(storageDir)
            const outDir = window.path.join(storageDir,`./${fileName}`);
            if(!window.fs.existsSync(outDir)) window.fs.mkdirSync(outDir);
            console.log('cutting..')
            console.log('saving json project..')
            
            window.fs.writeFileSync(`${outDir}/${schema.entry.project}`,JSON.stringify(editor.canvas));
            console.log('saving as a png..')
            const {
                width,
                height
            } = saveWithBoundary(outDir, schema);
           
            schema.meta = {width, height, ratio: (width/height)};

            if(window.fs.existsSync(window.path.join(outDir,'./manifest.json'))){
                schema = JSON.parse(window.fs.readFileSync(window.path.join(outDir,'./manifest.json'),'utf-8'));
            }
            
            schema.updatedAt = Date.now();
            schema.meta = {width, height, ratio: (width/height)};

            window.fs.writeFileSync(`${outDir}/manifest.json`,JSON.stringify(schema));
           
            console.log('saved success!', outDir)
            notify({
                message: 'Saved drawing successfully!',
                duration: 1500,
                position: {
                    horizontal: "center",
                    vertical: "top"
                } as SnackbarOrigin
            })
            handleClose();
        }
    };

    useEffect(() => {
        document.title = `Feedback app | ${timer}s`;
        if(timer <= 0){
            document.title = `Feedback app`;
            navigate('/text');
        }
    },[timer])

    useEffect(() => {
        if(document.querySelectorAll('.flexbox-fix').length > 2)
            document.querySelectorAll('.flexbox-fix')
            .forEach(node => {if (node != node.parentNode.lastChild) return; node.remove()})
    },[])

    useEffect(() => {
        if(editor){
            if(mode == 'pen') editor.canvas.isDrawingMode = true;
            editor.canvas.freeDrawingBrush.width = width;
            editor.canvas.freeDrawingBrush.color = selectedColor;

            let isDrawing = false;
            editor.canvas.on('mouse:down', function({e}) {
                isDrawing = true;
                const pointer =  editor.canvas.getPointer(e);
                window.ipcRenderer.send('mouse:down',{pointer: {x: pointer.x, y: pointer.y},e});
                setTimer(TIMER*60);
                setShowPenSetting(false)
            }).on('mouse:up', function({e}) {
                isDrawing = false;
                const pointer =  editor.canvas.getPointer(e);
                // window.ipcRenderer.send('mouse:up',{pointer: {x: pointer.x, y: pointer.y},e});
                setTimer(TIMER*60);
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
        let loadSuccess = false;
        window.ipcRenderer.on('load:project', (args, json) => {
            
            console.log('loading project', query.get('prev'))

            if(editor && json){
                try{
                    editor.canvas.clear();
                    editor.canvas.loadFromJSON(json, function() {
                        editor.canvas.renderAll(); 
                        window.ipcRenderer.send('sync:canvas',JSON.stringify(editor.canvas.toJSON()));
                        loadSuccess = true;
                        notify({
                            message: 'Loaded drawing successfully!',
                            duration: 1500,
                            position: {
                                horizontal: "center",
                                vertical: "top"
                            } as SnackbarOrigin
                        })
                        setTimer(TIMER*60);
                     });
                }catch(e){
                    if(!loadSuccess){
                        console.log('failed trying to load later..')
                        notify({
                            message: 'Error loading drawing..',
                            duration: 1500,
                            position: {
                                horizontal: "center",
                                vertical: "top"
                            } as SnackbarOrigin,
                            variant: 'danger'
                        })
                        setTimeout(() => window.ipcRenderer.send('load:project', fileName),250)
                        setTimer(TIMER*60);
                    }
                }
            }else{
                notify({
                    message: 'Initialized new drawing',
                    duration: 1500,
                    position: {
                        horizontal: "center",
                        vertical: "top"
                    } as SnackbarOrigin,
                    variant: 'info'
                })
                setTimer(TIMER*60);
            }
        });

        window.ipcRenderer.on('save:image', (args, result) => {
            console.log(result);
        });

        const t = setInterval(() => {
            setTimer(timer => timer - 1);
        },1000)

        
        return () => {
            if(editor){
                editor.canvas.__eventListeners = { };
            }
            window.ipcRenderer.removeAllListeners('load:project');
            window.ipcRenderer.removeAllListeners('save:image');
            clearInterval(t);
        };
    },[editor,width, selectedColor, intensity, glowColor, mode]);

    const clear = () => {
        Swal.fire({
            title: 'คำเตือน',
            text: 'ภาพที่คุณวาดจะถูกเคลียร์ทั้งหน้าจอ แน่ใจหรือไม่?',
            icon: 'warning',
            allowEnterKey: true,
            allowEscapeKey: true,
            showCancelButton: true,
            cancelButtonText: 'ยกเลิก',
            confirmButtonText:'แน่ใจ',
        }).then(result => {
            if(result.isConfirmed){
                if(editor){
                    editor.canvas.clear();
                    window.ipcRenderer.send('sync:canvas');
                    notify({
                        message: 'Already cleared drawing!',
                        duration: 1500,
                        position: {
                            horizontal: "center",
                            vertical: "top"
                        } as SnackbarOrigin
                    })
                }
            }
        }).catch(() => {

        })
    };

    const ButtonGroup = { 
        borderRadius: '1rem',
        border: '1px solid #ffffff1b',
        width: 'auto',
        padding: '.5rem',
        background: '#1d1d1d3b',
        backdropFilter: `blur(16px) saturate(180%)`
    };

    const popupPenSetting = () => {
        if(mode === 'pen')
            setShowPenSetting(!showPenSetting)
        setMode('pen')
    };

    const setToCursor = () => {
        setMode('mouse');
        setShowPenSetting(false)
        if(editor){
            editor.canvas.isDrawingMode = false;
        }
    }

    const loadProject = () => {
        setShowPenSetting(false)
        window.ipcRenderer.send('load:project', fileName);
    };

    return <Box>
        <ButtomLeft buttonTitle="ย้อนกลับ" to={`/${query.get('prev')}`}/>
        <Dialog open={open} onClose={handleClose}>
        <DialogTitle>บันทึกรูปภาพ</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ใส่ชื่อไฟล์ที่ต้องการ (ไม่ต้องมีนามสกุลไฟล์)
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="filename"
            label="ชื่อไฟล์รูปภาพ"
            type="text"
            fullWidth
            variant="standard"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>ยกเลิก</Button>
          <Button onClick={save}>บันทึก</Button>
        </DialogActions>
      </Dialog>
        <TopLeftLogo state={state} setState={setState}/>
        <BottomRightLogo />
        <TopRight buttonTitle="โหมดข้อความ" icon={<ShortTextIcon sx={{marginRight: '.75rem'}}/>} to="/text"/>
        <ButtomLeft buttonTitle="ย้อนกลับ" to="/textmode"/>
        <Box onClickCapture={() => setShowPenSetting(false)} sx={{position: 'fixed', width: '100%', borderRadius: '2.5rem', top: '0', left: '0', bottom: '0',right: 0}}>
            <FabricJSCanvas id="fabric-canvas" onReady={(canvas) => {onReady(canvas); loadProject(canvas)}} className="projector"/>
        </Box>
        <Grid container gap={10} sx={{transform: 'translateX(-50%)',
        position: 'fixed', bottom: '1rem', left: '50%',
        justifyContent: 'center', textAlign: 'center', color: 'white'}}>
            <Grid container gap={5} sx={ButtonGroup}>
                {/* {modes.map((target,index) => <Grid item key={index}>
                    <Button variant={mode === target ?  `contained` : "text"} onClick={() => setMode(target)}>{GetIcon(target)}</Button>
                    <Typography component="div" mt={1}><b style={{fontWeight: 500}}>{titles[target]}</b></Typography>
                </Grid>)} */}
                <Grid item>
                    <Button variant={mode === 'mouse' ? 'contained' : 'text'}  onClick={() => setToCursor()}><MouseIcon/></Button>
                    <Typography component="div" mt={1}><b style={{fontWeight: 500}}>{titles['mouse']}</b></Typography>
                </Grid>
                <Grid item sx={{position: 'relative'}}>
                    <SketchPicker color={_color} onChange={color => _setColor(color)} onChangeComplete={__color => { setSelectedColor(_color.hex || _color); setColors(colors => { colors[colorIndex] = _color.hex || _color; return [...colors];}) }} className={styles.colorPicker}  />
                    <SketchPicker color={_glowColor} onChange={color => _setGlowColor(color)}  onChangeComplete={color => {  setGlowColor(_glowColor.hex || _glowColor); setGlowColors(glowColors => { glowColors[glowColorIndex] = _glowColor.hex || _glowColor; return [...glowColors];}) }} className={styles.glowPicker}  />
                    <Box style={{transition: 'opacity .25s ease-in-out, transform .25s ease-in-out',opacity: showPenSetting ? 1 : 0,textAlign: 'left',padding: '2rem',width: '20rem', color: '#ffffff',backgroundColor: '#161627a5', borderRadius: '1rem', position: 'absolute', top: 0, transform: `translateX(-40%) translateY(calc(${showPenSetting ? `-100% - 1.5rem` : `10%`}))`, backdropFilter: `blur(16px) saturate(180%)`}}>
                        <Typography variant="subtitle" fontWeight="500" sx={{color: alpha(`#fff`,0.9), paddingBottom: '.25rem'}}>สีข้างใน</Typography>
                        <Grid container gap={2} sx={{paddingBottom: '2rem'}} justifyContent="center">
                            { colors.map((color,index) => <Grid item md={2} key={index}>
                                <IconButton size="small" onMouseEnter={(e) => setPosition({top: e.clientY, left: e.clientX})} onClick={() => { setColorIndex(index); setClickState(true); setSelectedColor(color);}} sx={{ border: `4px solid ${index === colorIndex ? '#fff' : 'transparent'}`,boxShadow: 15, background: color, color: color, '&:hover': { background: color}}}>
                                    <Edit sx={{opacity: 0}}/>
                                </IconButton>
                            </Grid>)}
                            {/* <Grid item md={2}>
                            
                            </Grid> */}
                        </Grid>
                        <Typography variant="subtitle" fontWeight="500" sx={{color: alpha(`#fff`,0.9), paddingBottom: '.25rem'}}>สีเรืองแสง</Typography>
                        <Grid container gap={2} sx={{paddingBottom: '2rem'}} justifyContent="center">
                            { glowColors.map((color,index) => <Grid item md={2} key={index}>
                                <IconButton size="small" onClick={() => { setGlowColorIndex(index); setGlowColor(color)}} variant="contained" sx={{ border: `4px solid ${index === glowColorIndex ? '#fff' : 'transparent'}`,boxShadow: 15, background: color, color: color, '&:hover': { background: color}}}>
                                    <Edit sx={{opacity: 0}}/>
                                </IconButton>
                            </Grid>)}
                        </Grid>
                        <Typography variant="subtitle" fontWeight="500" sx={{width: '100%',color: alpha(`#fff`,0.9), paddingBottom: '.25rem'}}>ตั้งค่าปากกา</Typography>
                        <Grid container spacing={5}>
                            <Grid item xs={12} md={6}>
                                <Box sx={{width: '100%',height: '100%', position: 'relative', background: alpha(`#000000`,.3), borderRadius: '1rem'}}>
                                    {/* <Avatar sx={{position: 'absolute', width: '24', height: '24'}}/> */}
                                    <Box sx={{ borderRadius: '100%', boxShadow: `0px 0px ${intensity}px 0px ${glowColor}`, transition: 'all .25s ease-in-out', background: selectedColor, width: `${width}px`, height:`${width}px` , position: 'absolute', top: '50%',left: '50%', transform: 'translate(-50%,-50%)'}}/>
                                </Box>
                            </Grid>
                            <Grid item xs={12} md={6} sx={{ height: '100%'}}>
                                <Typography variant="subtitle" component="div" fontWeight="500" sx={{color: alpha(`#fff`,0.9),}}>ขนาด(px)</Typography>
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
                                 <Typography variant="subtitle" component="div" fontWeight="500" sx={{color: alpha(`#fff`,0.9),}}>ความเรืองแสง</Typography>
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
                    </Box>
                    <Button variant={mode === 'pen' ? 'contained' : 'text'}
                        onClick={popupPenSetting}
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
                    <Button onClick={handleClickOpen}><Save/></Button>
                    <Typography component="div" mt={1}><b style={{fontWeight: 500}}>{titles['save']}</b></Typography>
                </Grid>
                <Grid item>
                    <Button onClick={loadProject}><ReplayIcon/></Button>
                    <Typography component="div" mt={1}><b style={{fontWeight: 500}}>{titles['reload']}</b></Typography>
                </Grid>
                <Grid item>
                    <Button onClick={clear}><DeleteOutlined/></Button>
                    <Typography component="div" mt={1}><b style={{fontWeight: 500}}>{titles['clear']}</b></Typography>
                </Grid>
                {/* <Grid item>
                    <Button sx={{background: 'rgba(255,255,255,.1)'}} onClick={save}><Save/></Button>
                    <Typography component="div" mt={1}><b style={{fontWeight: 500}}>{titles['save']}</b></Typography>
                </Grid> */}
            </Grid>
        </Grid>
    </Box>
};

const useStyle = makeStyles({
    colorPicker: {
        position: 'absolute',
        left: `calc(100% + 11.5rem)`,
        bottom:  `150%`,
        transform: ({showPenSetting}) =>  showPenSetting ? 'translateY(-100%)' : `translateY(-90%)`,
        transition: 'all .25s ease-in-out',
        opacity: ({showPenSetting}) => showPenSetting ? 1 : 0,
        pointerEvents: ({showPenSetting}) => showPenSetting ? 'all' : 'none',
        zIndex: 3000,
        "&::selection": {
            userSelect: 'none',
        }
    },
    glowPicker: {
        position: 'absolute',
        left: `calc(100% + 11.5rem)`,
        top:  `-30%`,
        transform: ({showPenSetting}) =>  showPenSetting ? 'translateY(-100%)' : `translateY(-90%)`,
        transition: 'all .25s ease-in-out',
        opacity: ({showPenSetting}) => showPenSetting ? 1 : 0,
        pointerEvents: ({showPenSetting}) => showPenSetting ? 'all' : 'none',
        zIndex: 3000,
        "&::selection": {
            userSelect: 'none',
        }
    }
})

export default DrawMode;