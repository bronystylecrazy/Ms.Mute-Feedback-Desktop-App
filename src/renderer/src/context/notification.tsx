import { createContext, useState } from "react";
import { Alert, AlertClassKey, AlertColor, Snackbar, SnackbarOrigin } from '@mui/material'

export const NotificationContext = createContext({})

export const NotificationContextProvider = ({ children }) => {
    const [state, setState] = useState({
        open: false as Boolean,
        message: "" as String,
        duration: 3000 as Number,
        variant: 'success' as String,
        position: {
            vertical: 'bottom',
            horizontal: 'left',
        } as SnackbarOrigin
    });

    const handlers = {
        notify(_state){
            setState( state => ({
                state,
                open: true,
                ..._state
            }))
        }
    }

    const onClose = () => {
		setState((state) => ({
			...state,
			open: false,
		}))
	}

    return <NotificationContext.Provider value={handlers}>
        <Snackbar
            open={state.open}
            anchorOrigin={state.position}
            autoHideDuration={state.duration}
            onClose={onClose}
            message={state.message}
        >
             <Alert onClose={onClose} severity={state.variant as AlertColor} sx={{ width: '100%' }}>
                { state.message }
            </Alert>
        </Snackbar>
        {children}
    </NotificationContext.Provider>
};