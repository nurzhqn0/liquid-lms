import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import App from "./App.jsx";
import { queryClient } from "./lib/queryClient.js";
import { AuthProvider } from "./providers/AuthProvider.jsx";
import { ToastProvider } from "./components/ui/toast.jsx";
import "./index.css";

const container = document.getElementById("root");

createRoot(container).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
