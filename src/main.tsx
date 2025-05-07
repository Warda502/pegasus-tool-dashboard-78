
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// Add Buffer polyfill for browser environment
import { Buffer } from 'buffer';
// Add it to the window object
window.Buffer = Buffer;

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
