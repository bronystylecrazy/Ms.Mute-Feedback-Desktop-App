import { Grid, Typography } from "@mui/material";
import { Box } from "@mui/system";
import CollectionButton from "../components/buttons/CollectionButton";
import VideoBackground from '../components/VideoBackground';
import BottomRightLogo from "../components/logos/BottomRightLogo";
import TopLeftLogo from "@/components/logos/TopLeftLogo";
import { useEffect, useRef } from "react";
import domtoimage from 'dom-to-image';
import { fabric } from 'fabric'
import { FabricJSCanvas, useFabricJSEditor } from 'fabricjs-react'

const Monitor = ({state, setState}) => {
    const { editor, onReady } = useFabricJSEditor()

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
            }
        };
        window.addEventListener('resize', resizeHandler);
        return () => {
            window.removeEventListener('resize', resizeHandler);
        }
    },[]);
    useEffect(() => {
        window.ipcRenderer.on('save:message', (event, args) => {
            window.ipcRenderer.send('save:message-result', args);
        });
        
        if(editor){
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
                    alltogetherObj.setCoord();
                    editor.canvas.renderAll(); 

                 },function(o,object){
                    
                 });
            }
        })
        return () => {
            window.ipcRenderer.removeAllListeners('save:message');
            window.ipcRenderer.removeAllListeners('sync:canvas');
            window.ipcRenderer.removeAllListeners('mouse:down');
            window.ipcRenderer.removeAllListeners('mouse:up');
            window.ipcRenderer.removeAllListeners('mouse:move');
        }
    },[editor]);

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