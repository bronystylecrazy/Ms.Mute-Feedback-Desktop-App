import { createContext } from 'react'
import { createTheme, StyledEngineProvider, ThemeProvider } from '@mui/material/styles';

export const ThemeContext = createContext({})

export const ThemeContextProvider = ({ children }) => {
    const dark = true;
    const theme = createTheme({
		palette: {
			mode: dark ? 'dark' : 'light',
			primary: {
				main: '#ffffff',
			},
				secondary: {
				main: '#ffffff',
			},
		},
		spacing: 4,
		typography: {
			fontFamily: [
                'IBM Plex',
                'IBM Plex Sans',
				'Arial',
				'Roboto',
				'sans-serif',
			].join(','),
		},
		shape: {
			borderRadius: 10,
		},
	});

    return <ThemeContext.Provider value={theme}>
            <ThemeProvider theme={theme}>
                {children}
            </ThemeProvider>
    </ThemeContext.Provider>;
};