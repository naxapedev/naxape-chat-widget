import React from "react";
import ReactDOM from "react-dom/client";
import { ChatWidget } from "./components/chat/ChatWidget";

// Inlines compiled Tailwind & widget CSS
import cssString from "./styles.css?inline";

function initChatWidget() {
  if (typeof document === "undefined") return;

  // Prevent double initialization
  if (document.getElementById("naxape-chat-host")) return;

  // 1. Create a host element for the Shadow DOM
  const host = document.createElement("div");
  host.id = "naxape-chat-host";
  host.style.position = "fixed";
  host.style.top = "0";
  host.style.left = "0";
  host.style.width = "0";
  host.style.height = "0";
  host.style.zIndex = "2147483647"; // Max z-index
  document.body.appendChild(host);

  // 2. Attach Shadow DOM to isolate styles from host page
  const shadowRoot = host.attachShadow({ mode: "open" });

  // 3. Inject CSS into the Shadow DOM
  const styleElement = document.createElement("style");
  styleElement.textContent = cssString;
  shadowRoot.appendChild(styleElement);

  // 4. Create mount point
  const mountPoint = document.createElement("div");
  mountPoint.id = "naxape-widget-mount";
  shadowRoot.appendChild(mountPoint);

  // 5. Mount React component
  ReactDOM.createRoot(mountPoint).render(
    <React.StrictMode>
      <ChatWidget />
    </React.StrictMode>
  );
}

// Auto-initialize when script loads
if (typeof window !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => initChatWidget());
  } else {
    initChatWidget();
  }

  (window as any).NaxapeChatWidget = {
    init: initChatWidget,
  };
}

export default initChatWidget;

