
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// Add Buffer polyfill for browser environment
import { Buffer } from 'buffer';
// Add it to the window object
window.Buffer = Buffer;

const rootElement = document.getElementById("root");
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
