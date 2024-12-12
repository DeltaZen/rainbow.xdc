import "@webxdc/highscores";

import React from "react";
import { createRoot } from "react-dom/client";
import App from "./js/pages/app.jsx";

window.onHighscoresChanged = () => {}

window.highscores.init({
  onHighscoresChanged: () => window.onHighscoresChanged(),
}).then(() => {
    const container = document.getElementById("app");
    const root = createRoot(container);
    root.render(<App />);
})
