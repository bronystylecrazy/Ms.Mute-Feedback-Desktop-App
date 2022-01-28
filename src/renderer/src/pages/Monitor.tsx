import { Grid, Typography } from "@mui/material";
import { Box } from "@mui/system";
import CollectionButton from "../components/buttons/CollectionButton";
import VideoBackground from '../components/VideoBackground';
import BottomRightLogo from "../components/logos/BottomRightLogo";
import TopLeftLogo from "@/components/logos/TopLeftLogo";
import { useEffect, useRef, useState } from "react";
import domtoimage from 'dom-to-image';
import { fabric } from 'fabric'
import { FabricJSCanvas, useFabricJSEditor } from 'fabricjs-react'

let Bar;

var selectObject = function (canvas, ObjectName) {
    canvas.getObjects().forEach(function(o) {
        if(o.id === ObjectName) {
            canvas.setActiveObject(o);
        }
    })
}

const app = window.app;

const Monitor = ({state, setState}) => {
    const { editor, onReady } = useFabricJSEditor()
    const [isText, setIsText] = useState(true)
    const myCanvas = useRef<HTMLCanvasElement>(null);
    const onAddCircle = () => {
        // editor?.addCircle()
      }
      const onAddRectangle = () => {
        // editor?.addRectangle()
        
      }
    useEffect(() => {
        const resizeHandler = () => {
            if(editor){
                editor.canvas.setWidth(window.innerWidth);
                editor.canvas.setHeight(window.innerHeight);
                updateTextOnCanvas();
            }
        };
        window.addEventListener('resize', resizeHandler);
        return () => {
            window.removeEventListener('resize', resizeHandler);
        }
    },[]);

    const updateTextOnCanvas = () => {
        setIsText(true)
        if(editor){
            if(!Bar) Bar = new fabric.Text(state.inputField, {fontFamily: 'IBM Plex Sans',fontSize: 80,fill: state.color,id: 'mainMonitor',selectable: true, top: 50, left: 10});
            else {
                Bar.set('text',state.inputField);
                Bar.set('fill',state.color);
            }
            editor.canvas.clear();
            editor.canvas.add(Bar)
            Bar.center();
            // selectObject(editor.canvas, 'mainMonitor')
        }
    };

    useEffect(updateTextOnCanvas,[state.inputField, state.color])

    const saveBoundary = () => {
        const storageDir = window.path.join(app.getPath('userData'),`./texts`);
        if(!window.fs.existsSync(storageDir)) window.fs.mkdirSync(storageDir)
        const fileName = state.inputField.trim().replaceAll(' ','_');
        const outDir = window.path.join(storageDir,`./`);
        if(!window.fs.existsSync(outDir)) window.fs.mkdirSync(outDir)
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
        const bounding = new fabric.Rect({height: height + 10*2, left: left - 10, top: top - 10, width: width + 10*2, fill: "#fff0"});
        group.addWithUpdate(bounding)
        const time = Date.now();
        if(!window.fs.existsSync(`${outDir}/${fileName}-${time}`)) window.fs.mkdirSync(`${outDir}/${fileName}-${time}`)
        window.ipcRenderer.send('save:image', {
            dataURL: group.toDataURL({
                format: 'png',
                quality: 0.8
            }),
            outPath: `${outDir}/${fileName}-${time}/text.png`
        });

        window.fs.writeFileSync(`${outDir}/${fileName}-${time}/manifest.json`, JSON.stringify({
            text: state.inputField,
            color: state.color,
            createdAt: Date.now(),
            entry: `${fileName}-${time}/text.png`,
            meta: {width, height, ratio: (width/height)}
        }));
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
    };

    useEffect(() => {
       
        if(editor){
            window.ipcRenderer.on('save:text', (event, args) => {
                saveBoundary()
            });
    
            window.ipcRenderer.on('save:image', (event, args) => {
                console.log('saved!', args)
            })
            // editor.canvas.isDrawingMode = true;
            // editor.canvas.freeDrawingBrush.width = 5;
            // editor.canvas.freeDrawingBrush.color = '#00aeff';

            // window.ipcRenderer.on('mouse:down',(event, {pointer, e}) => {
            //     console.log('mouse:down', {pointer, e})
            //     editor.canvas.freeDrawingBrush.onMouseDown(pointer);
            // });

            // window.ipcRenderer.on('mouse:up',(event, {pointer, e}) => {
            //     console.log('mouse:up', {pointer, e})
            //     editor.canvas.freeDrawingBrush.onMouseUp(pointer);
            // });
            // window.ipcRenderer.on('mouse:move',(event, {pointer, e}) => {
            //     console.log('mouse:move', {pointer, e})
            //     editor.canvas.freeDrawingBrush.onMouseMove(pointer);
            // });

            // function onMouseDown(e) {
            //     const pointer = editor.getPointer(e);
            //     editor.canvas.freeDrawingBrush.onMouseDown(pointer);
            // }
            
            // function onMouseUp(e) {
            //     const pointer = canvas.getPointer(e);
            //     editor.canvas.freeDrawingBrush.onMouseUp(pointer);
            // }
            
            // function drawRealTime(e, pointer) {
            //     editor.canvas.freeDrawingBrush.onMouseMove(pointer);
            // }


        }
        window.ipcRenderer.on('sync:canvas', (event, json) => {
            setIsText(false)
            if(editor){
                editor.canvas.clear();
                editor.canvas.loadFromJSON(json, function() {
                    const objs = [];

                    editor.canvas.forEachObject(function(obj){
                        objs.push(obj);
                    });

                    var alltogetherObj = new fabric.Group(objs);

                    editor.canvas.add(alltogetherObj);
                    alltogetherObj.center();
                    // alltogetherObj.setCoord();
                    editor.canvas.renderAll(); 

                 },function(o,object){
                    
                 });
            }
        })
        return () => {
            if(editor){
                editor.canvas.__eventListeners = { };
            }
            window.ipcRenderer.removeAllListeners('save:image');
            window.ipcRenderer.removeAllListeners('save:text');
            window.ipcRenderer.removeAllListeners('sync:canvas');
            window.ipcRenderer.removeAllListeners('mouse:down');
            window.ipcRenderer.removeAllListeners('mouse:up');
            window.ipcRenderer.removeAllListeners('mouse:move');
        }
    },[editor, editor?.canvas]);

    return <Box>
        <TopLeftLogo state={state} setState={setState}/>
        <Box sx={{position: 'fixed', width: '100vw', borderRadius: '2.5rem', top: '0', left: '0', bottom: '0',right: '0',}}>
            <FabricJSCanvas onReady={onReady} className="projector"/>
        </Box>
        {/* <Typography 
        id="monitor-text"
        component="h3"
        sx={{wordBreak: 'break-word', position: 'fixed',textAlign:'center', width: '40vw',fontSize: '5vw', color: 'white', top: '50%', left: '50%', transform: 'translate(-50%,-50%)'}}>{state.inputField}</Typography> */}
        <BottomRightLogo/>
    </Box>
};

export default Monitor;