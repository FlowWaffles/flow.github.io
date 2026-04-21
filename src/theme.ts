import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        primary: {
            main: '#e266c7',
        },
    },
    components: {
        MuiOutlinedInput: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(255, 255, 255, 0.5)',
                        boxShadow: '0 0 10px rgba(255, 255, 255, 0.2)',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(255, 255, 255, 0.8)',
                        boxShadow: '0 0 15px rgba(255, 255, 255, 0.4)',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(255, 255, 255, 1)',
                        boxShadow: '0 0 20px rgba(255, 255, 255, 0.6)',
                    },
                },
                input: {
                    color: 'rgba(255, 255, 255, 0.87)',
                    '&::placeholder': {
                        color: 'rgba(255, 255, 255, 0.5)',
                        opacity: 1,
                    },
                },
                inputMultiline: {
                    color: 'rgba(255, 255, 255, 0.87)',
                    '&::placeholder': {
                        color: 'rgba(255, 255, 255, 0.5)',
                        opacity: 1,
                    },
                },
            },
        },
        MuiInputBase: {
            styleOverrides: {
                input: {
                    '&::placeholder': {
                        color: 'rgba(255, 255, 255, 0.5)',
                        opacity: 1,
                    },
                },
            },
        },
        MuiInputLabel: {
            styleOverrides: {
                root: {
                    color: 'rgba(255, 255, 255, 0.7)',
                    '&.Mui-focused': {
                        color: 'rgba(255, 255, 255, 1)',
                    },
                },
            },
        },
        MuiFormHelperText: {
            styleOverrides: {
                root: {
                    color: 'rgba(255, 255, 255, 0.7)',
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                containedPrimary: {
                    background: 'linear-gradient(90deg, #e266c7, #85dcf0)',
                    backgroundSize: '200% 100%',
                    color: '#fff',
                    boxShadow: '0 0 12px rgba(226, 102, 199, 0.5)',
                    animation: 'gradientShift 5s ease infinite',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    '&:hover': {
                        boxShadow: '0 0 18px rgba(226, 102, 199, 0.8)',
                    },
                },
            },
        },
        MuiAlert: {
            styleOverrides: {
                standard: {
                    backgroundColor: 'rgba(100, 200, 255, 0.2)',
                    color: '#85dcf0',
                    border: '1px solid rgba(133, 220, 240, 0.5)',
                },
            },
        },
    },
});

export default theme;
