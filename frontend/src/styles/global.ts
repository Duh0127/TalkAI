import { createGlobalStyle } from "styled-components";

export const GlobalStyle = createGlobalStyle`
  @import url("https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&display=swap");

  :root {
    --bg-night: #04080f;
    --bg-deep: #090f1a;
    --bg-zenith: #101a2a;
    --panel: #0f1725;
    --panel-strong: #0b1320;
    --panel-border: rgba(103, 145, 210, 0.26);
    --text-main: #e8edf8;
    --text-soft: #95a6be;
    --accent-cyan: #4d84ff;
    --accent-mint: #2a63d6;
    --accent-gold: #7bb0ff;
    --accent-blue: var(--accent-cyan);
    --accent-purple: #9bc4ff;
    --danger: #7ea9ff;
    --scrollbar-track: rgba(8, 14, 24, 0.92);
    --scrollbar-thumb: linear-gradient(180deg, rgba(77, 132, 255, 0.9), rgba(50, 99, 214, 0.84));
    --scrollbar-thumb-border: rgba(8, 14, 24, 0.95);
    --scrollbar-thumb-hover: linear-gradient(
      180deg,
      rgba(119, 164, 255, 0.96),
      rgba(74, 123, 228, 0.9)
    );
  }

  * {
    box-sizing: border-box;
    scrollbar-width: thin;
    scrollbar-color: rgba(92, 145, 255, 0.84) var(--scrollbar-track);
  }

  *::-webkit-scrollbar {
    width: 10px;
    height: 10px;
  }

  *::-webkit-scrollbar-track {
    background: var(--scrollbar-track);
    border-radius: 999px;
  }

  *::-webkit-scrollbar-thumb {
    background: var(--scrollbar-thumb);
    border-radius: 999px;
    border: 2px solid var(--scrollbar-thumb-border);
    background-clip: padding-box;
    transition: background 0.2s ease;
  }

  *::-webkit-scrollbar-thumb:hover {
    background: var(--scrollbar-thumb-hover);
  }

  *::-webkit-scrollbar-corner {
    background: var(--scrollbar-track);
  }

  html,
  body,
  #root {
    width: 100%;
    height: 100%;
  }

  body {
    margin: 0;
    color: var(--text-main);
    font-family: "Manrope", "Segoe UI", sans-serif;
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
    background:
      radial-gradient(circle at 50% -10%, rgba(77, 132, 255, 0.16), transparent 40%),
      radial-gradient(circle at 88% 8%, rgba(77, 132, 255, 0.1), transparent 28%),
      linear-gradient(180deg, var(--bg-night), var(--bg-deep) 54%, var(--bg-zenith));
  }
`;
