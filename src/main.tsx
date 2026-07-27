import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App";

import { AuthProvider } from "./context/AuthContext";
import { ExpenseProvider } from "./context/ExpenseContext";

import "./index.css";
import "./styles/auth.css";
import './styles/savings.css'
import { ThemeProvider } from "./context/ThemeContext";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ExpenseProvider>
          <ThemeProvider>
            <App />
          </ThemeProvider>
        </ExpenseProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
