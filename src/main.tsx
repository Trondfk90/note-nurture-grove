
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Ensure the root element exists
const rootElement = document.getElementById("root");
if (!rootElement) {
  const root = document.createElement("div");
  root.id = "root";
  document.body.appendChild(root);
}

createRoot(document.getElementById("root")!).render(<App />);
