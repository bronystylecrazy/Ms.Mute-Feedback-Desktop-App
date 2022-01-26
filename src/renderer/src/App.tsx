import { HashRouter, Route, Routes } from 'react-router-dom'
import { ThemeContextProvider } from './context/theme';

import Home from './pages/Home';
import Monitor from './pages/Monitor';
import DrawMode from './pages/DrawMode';

import { useCallback, useEffect, useMemo, useState } from "react";
const ipcRenderer = window.ipcRenderer;
import deepeq from './utils/deepeq';
import VideoBackground from './components/VideoBackground';


const App = () => {
    const [appState, setAppState] = useState({ inputField: ""});

    const setState = ({broadcast, ...arg}) => {
        if (broadcast) {
            ipcRenderer.send('setState:broadcast', arg);
            return true;
        }
        ipcRenderer.send('setState', arg);
        return false;
    };

    const onSyncHandler = useMemo(() => (_, state) => {
        if(!deepeq(appState, state,'t')){
            setAppState({...state})
            console.log('app state changed!', appState)
        }
    }, [appState])

    useEffect(() => {
        ipcRenderer.on('sync', (event, state) => onSyncHandler(event, state));
        ipcRenderer.send('sync');
        return () => { 
            ipcRenderer.removeAllListeners('sync');
        };
    },[onSyncHandler]);

    return <ThemeContextProvider>
        <HashRouter>
            <VideoBackground state={appState} setState={setState} persistent/>
            <Routes>
                <Route path="/text" element={<Home state={appState} setState={setState}/>} />
                <Route path="/drawmode" element={<DrawMode state={appState} setState={setState}/>} />
                <Route path="/monitor" element={<Monitor state={appState} setState={setState}/>} />
            </Routes>
        </HashRouter>
    </ThemeContextProvider>
};

export default App;