// src/pages/Login.tsx
import React, { useState } from "react";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from '../store/useAuthStore';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const login = useAuthStore((state) => state.login);
  const token = localStorage.getItem("token");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
  
    try {
      const response = await fetch("http://localhost:8000/login", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          username: email,
          password: password,
        }),
      });
  
      if (!response.ok) {
        throw new Error("Login failed");
      }
  
      const data = await response.json();
      //console.log("Login success:", data);
  
      // Save token & user info
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user_id", data.user_id);
      login(email);
      navigate("/home");
    } catch (err) {
      alert("Login error. Check credentials.");
      console.error(err);
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ padding: 4, marginTop: 8 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Iniciar Sesión
        </Typography>
        <Box component="form" onSubmit={handleLogin} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            label="Correo Electrónico"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            required
          />
          <TextField
            label="Contraseña"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            required
          />
          <Button type="submit" variant="contained" fullWidth>
            Iniciar Sesión
          </Button>
          <Button variant="text" fullWidth onClick={() => navigate("/register")}>
            ¿No tienes cuenta? Regístrate
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login;
