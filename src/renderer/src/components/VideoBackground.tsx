import { Stateful } from '@/interface/stateful';
import React, { useRef, useEffect, useState } from 'react';

import BackgroundVideo from '../assets/video/bg.mp4'
import sync from '../utils/sync';

const VideoBackground = ({src=BackgroundVideo, setState, persistent=false, state}) => {
    const backgroundVideo = useRef(null);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        if(!persistent || !loaded) return;
        const timer = setInterval(() => {
            if(backgroundVideo.current){
                setState({
                    field: 't',
                    value: backgroundVideo.current.currentTime,
                    broadcast: true
                });
            }
        },10);
        return () => {
            clearInterval(timer)
        };
    }, [])

    const syncVideoCurrentTime = (e) => {
        const state = sync();
        if(e.target){
            if(state.t){
                e.target.currentTime = state.t;
            }
        }
        setLoaded(true);
    };

    return <video style={{position: 'fixed',
        left: '50%',
        top: '50%',
        width: '100%',
        height: '100%',
        transform: 'translate(-50%, -50%)',
        objectFit: 'fill'
    }} loop autoPlay ref={backgroundVideo} onLoadedData={syncVideoCurrentTime}>
        <source src={src} type="video/mp4"></source>
        Your browser does not support the video tag.
    </video>;
};

export default VideoBackground;