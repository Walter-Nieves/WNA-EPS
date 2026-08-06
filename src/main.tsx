import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

(function (l) {
  if (l.search[1] === "/") {
    const decoded = l.search.slice(1).split("&").map((s) => s.replace(/~and~/g,"&")).join("?");
    window.history.replaceState(
      null,
      '',
      l.pathname.slice(0, -1) + decoded + l.hash
    );
  }
})(window.location);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <App />
  </StrictMode>,
)
