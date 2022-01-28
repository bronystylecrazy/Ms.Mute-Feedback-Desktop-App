import { Badge, Button, Divider, Grid, IconButton, Stack, Typography, alpha, Slider, Avatar, TextField } from "@mui/material";
import { Box } from "@mui/system";
import CollectionButton from "../components/buttons/CollectionButton";
import VideoBackground from '../components/VideoBackground';
import { LibraryBooksOutlined, CollectionsOutlined, Edit, SaveAlt, Save, Delete, Add, Circle, DeleteOutlined, RampLeft } from "@mui/icons-material";
import InputBox from "../components/InputBox";
import TopLeftLogo from "../components/logos/TopLeftLogo";
import BottomRightLogo from "../components/logos/BottomRightLogo";
import TopRight from "../components/logos/TopRight";
import { useEffect, useMemo, useState } from "react";
import ColorLensIcon from '@mui/icons-material/ColorLens';
import { fabric } from 'fabric'
import { FabricJSCanvas, useFabricJSEditor } from "fabricjs-react";
import Swal from 'sweetalert2';
import { useLocation } from 'react-router-dom'

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { ipcRenderer } from "electron/renderer";
import ButtomLeft from "@/components/logos/BottomLeft";

// fabric.Object.prototype.exportPNG = function() {
// 	function trimCanvas(canvas)
// 	{
// 		var ctx = canvas.getContext('2d'),
// 			w = canvas.width,
// 			h = canvas.height,
// 			pix = {x:[], y:[]}, n,
// 			imageData = ctx.getImageData(0,0,w,h),
// 			fn = function(a,b) { return a-b };

// 		for (var y = 0; y < h; y++) {
// 			for (var x = 0; x < w; x++) {
// 				if (imageData.data[((y * w + x) * 4)+3] > 0) {
// 					pix.x.push(x);
// 					pix.y.push(y);
// 				}
// 			}
// 		}
// 		pix.x.sort(fn);
// 		pix.y.sort(fn);
// 		n = pix.x.length-1;

// 		w = pix.x[n] - pix.x[0];
// 		h = pix.y[n] - pix.y[0];
// 		var cut = ctx.getImageData(pix.x[0], pix.y[0], w, h);

// 		canvas.width = w;
// 		canvas.height = h;
// 		ctx.putImageData(cut, 0, 0);
// 	};

// 	var bound = this.getBoundingRect(),
// 		json = JSON.stringify(this),
// 		canvas = fabric.util.createCanvasElement();
// 	canvas.width = bound.width;
// 	canvas.height = bound.height;
// 	var fcanvas = new fabric.Canvas(canvas, {enableRetinaScaling:false});

// 	fabric.util.enlivenObjects([JSON.parse(json)], function(objects) {
// 		objects.forEach(function(o) {
// 			o.top -= bound.top;
// 			o.left -= bound.left;
// 			fcanvas.add(o);
// 		});
// 		fcanvas.renderAll();

// 		var canvas = fcanvas.getElement();
// 		trimCanvas(canvas);

// 		/*
// 		var url = canvas.toDataURL('image/png'),
// 			  img = new Image();
// 		img.width = canvas.width;
// 		img.height = canvas.height;
// 		img.src = url;
// 		document.body.appendChild(img);
// 		*/

// 		// This requires FileSaver.js!
// 		// canvas.toBlob(function(blob) {
// 		// 	saveAs(blob, 'element.png');
// 		// }, 'image/png');
// 	});
// };
const app = window.app;

console.log(app)

const DrawMode = ({ state, setState }) => {
    const {search} = useLocation();
    const query = useMemo(() => new URLSearchParams(search), [search]);
    const [open, setOpen] = useState(false);
    const [fileName, setFileName] = useState(query.get('project') || 'Untitled');
    const { editor, onReady } = useFabricJSEditor()
    const modes = ['pen', 'pen','pen'];
    const [mode, setMode] = useState('pen');
    const [width, setWidth] = useState(5);
    const strokeWidth = useMemo(() => width, [width]);

    const colors = ['#ff0077', '#00ffea', '#00ff00', '#0000ff', '#ffff00'];
    const glowColors = ['#0084ff', '#00d9ff', '#00ff00', '#0000ff', '#ffff00'];

    const [selectedColor, setSelectedColor] = useState(colors[Math.floor(Math.random() * colors.length)]);
    const [glowColor, setGlowColor] = useState(glowColors[Math.floor(Math.random() * glowColors.length)]);
    const [maxWidth, setMaxWidth] = useState(72);
    const [intensity, setIntensity] = useState(10);

    const [showPenSetting, setShowPenSetting] = useState(false);

    const titles = {
        pen: 'ปากกา',
        save: 'บันทึก',
        clear: 'เคลียร์'
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
            handleClose();
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
                setShowPenSetting(false)
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
        let loadSuccess = false;
        window.ipcRenderer.on('load:project', (args, json) => {
            
            console.log('loading project',query.get('prev'))
            if(editor && json){
                try{
                    editor.canvas.clear();
                    editor.canvas.loadFromJSON(json, function() {
                        editor.canvas.renderAll(); 
                        // window.ipcRenderer.send('sync:canvas',JSON.stringify(editor.canvas.toJSON()));
                        loadSuccess = true;
                     });
                }catch(e){
                    if(!loadSuccess){
                        console.log('failed trying to load later..')
                        setTimeout(() => window.ipcRenderer.send('load:project', fileName),250)
                    }
                }
            }
        });

        window.ipcRenderer.on('save:image', (args, result) => {
            console.log(result);
        });

        return () => {
            if(editor){
                editor.canvas.__eventListeners = { };
            }
            window.ipcRenderer.removeAllListeners('load:project');
            window.ipcRenderer.removeAllListeners('save:image');
        };
    },[editor,width, selectedColor, intensity, glowColor]);

    const clear = () => {
        Swal.fire({
            title: 'คำเตือน',
            text: 'ลบแล้วเรียกคืนไม่ได้ คุณแน่ใจเหรอหรือไม่',
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

    const loadProject = () => {
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
        <TopRight buttonTitle="Text Only Mode" to="/text"/>

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
                <Grid item sx={{position: 'relative'}}>
                    <Box style={{transition: 'opacity .25s ease-in-out, transform .25s ease-in-out',opacity: showPenSetting ? 1 : 0,textAlign: 'left',padding: '2rem',width: '20rem', color: '#ffffff',backgroundColor: '#161627a5', borderRadius: '1rem', position: 'absolute', top: 0, transform: `translateX(-40%) translateY(calc(-${showPenSetting ? 100 : 0}% - 1.5rem))`, backdropFilter: `blur(16px) saturate(180%)`}}>
                        <Typography variant="subtitle" fontWeight="500" sx={{color: alpha(`#fff`,0.9), paddingBottom: '.25rem'}}>สีข้างใน</Typography>
                        <Grid container gap={2} sx={{paddingBottom: '2rem'}} justifyContent="center">
                            { colors.map((color,index) => <Grid item md={2} key={index}>
                                <IconButton size="small" onClick={() => setSelectedColor(color)} variant="contained" sx={{ border: `4px solid ${selectedColor === color ? '#fff' : 'transparent'}`,boxShadow: 15, background: color, color: color, '&:hover': { background: color}}}>
                                    <Edit/>
                                </IconButton>
                            </Grid>)}
                        </Grid>
                        <Typography variant="subtitle" fontWeight="500" sx={{color: alpha(`#fff`,0.9), paddingBottom: '.25rem'}}>สีเรืองแสง</Typography>
                        <Grid container gap={2} sx={{paddingBottom: '2rem'}} justifyContent="center">
                            { glowColors.map((color,index) => <Grid item md={2} key={index}>
                                <IconButton size="small" onClick={() => setGlowColor(color)} variant="contained" sx={{ border: `4px solid ${glowColor === color ? '#fff' : 'transparent'}`,boxShadow: 15, background: color, color: color, '&:hover': { background: color}}}>
                                    <Edit/>
                                </IconButton>
                            </Grid>)}
                        </Grid>
                        <Typography variant="subtitle" fontWeight="500" sx={{width: '100%',color: alpha(`#fff`,0.9), paddingBottom: '.25rem'}}>ตั้งค่าปากกา</Typography>
                        <Grid container spacing={5}>
                            <Grid item xs={12} md={6}>
                                <Box sx={{width: '100%',height: '100%', position: 'relative', background: alpha(`#fff`,.9), borderRadius: '1rem'}}>
                                    {/* <Avatar sx={{position: 'absolute', width: '24', height: '24'}}/> */}
                                    <Box sx={{ borderRadius: '100%', boxShadow: `0px 0px ${intensity}px 0px rgba(255,255,255)`, transition: 'all .25s ease-in-out', background: selectedColor, width: `${width}px`, height:`${width}px` , position: 'absolute', top: '50%',left: '50%', transform: 'translate(-50%,-50%)'}}/>
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
                    <Button sx={{
                            background: mode === 'pen' ?  `rgba(255,255,255,.4)` : "rgba(255,255,255,.3)",
                            "&:hover": {
                                background: mode === 'pen' ?  `rgba(255,255,255,.4)` : "rgba(255,255,255,.3)",
                            }
                        }}
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
                    <Button sx={{background: 'rgba(255,255,255,.1)'}} onClick={handleClickOpen}><Save/></Button>
                    <Typography component="div" mt={1}><b style={{fontWeight: 500}}>{titles['save']}</b></Typography>
                </Grid>
                <Grid item>
                    <Button  onClick={clear}><DeleteOutlined/></Button>
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

export default DrawMode;