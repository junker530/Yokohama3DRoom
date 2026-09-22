import "maplibre-gl/dist/maplibre-gl.css";
import "./styles/reset.css";
import "./styles/variables.css";
import "./styles/global.css";
import App from "./app/App";
import { createRoot } from "react-dom/client";

createRoot(document.getElementById("root")).render(<App />);
