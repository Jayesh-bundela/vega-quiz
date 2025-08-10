import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import "../styles/globals.css";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#00897B", // teal
    },
    secondary: {
      main: "#FF7043", // orange
    },
    background: {
      default: "#F0F4F8", // light grey-blue
      paper: "#ffffff",
    },
  },
  shape: {
    borderRadius: 16, // more rounded cards/buttons
  },
  typography: {
    fontFamily: "'Poppins', sans-serif",
  },
});

export default function MyApp({ Component, pageProps }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Component {...pageProps} />
    </ThemeProvider>
  );
}
