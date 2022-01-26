import EventLogo from '../../assets/logos/event.png';

const TopLeftLogo = ({state, setState}) => {
    const style = {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '10vw',
    } as React.CSSProperties;
    return <img alt="event logo" src={EventLogo} style={style}/>
};

export default TopLeftLogo;