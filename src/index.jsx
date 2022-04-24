import React from "react";
import { createRoot } from "react-dom/client";
import App from "./js/pages/app.jsx";

const container = document.getElementById("app");
const root = createRoot(container);
root.render(<App />);
