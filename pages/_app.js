import { createGlobalStyle, ThemeProvider } from "styled-components";

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    background-color: #1a1a1a;
    color: #f0f0f0;
    font-family: Arial, sans-serif;
  }
`;

const theme = {
  colors: {
    primary: "#4CAF50",
    secondary: "#4CAF50",
    background: "#f0f0f0",
    text: "#f0f0f0",
  },
};

export default function App({ Component, pageProps }) {
  return (
    <>
      <GlobalStyle />
      <ThemeProvider theme={theme}>
        <Component {...pageProps} />
      </ThemeProvider>
    </>
  );
}
