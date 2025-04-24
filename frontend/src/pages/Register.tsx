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

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const token = localStorage.getItem("token");
  
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (password !== confirmPassword) {
      alert("Las contraseñas no coinciden.");
      return;
    }
  
    try {
      const response = await fetch("http://localhost:8000/register", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
  
      if (!response.ok) {
        const error = await response.json();
        alert("Error: " + error.detail);
        return;
      }
  
      const data = await response.json();
      localStorage.setItem("user", JSON.stringify(data));
      alert("Registro exitoso");
      navigate("/login");
    } catch (err) {
      console.error("Registration failed", err);
      alert("Error al registrar el usuario.");
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ padding: 4, marginTop: 8 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Crear Cuenta
        </Typography>
        <Box
          component="form"
          onSubmit={handleRegister}
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
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
          <TextField
            label="Confirmar Contraseña"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            fullWidth
            required
          />
          <Button type="submit" variant="contained" fullWidth>
            Registrarse
          </Button>
          <Button variant="text" fullWidth onClick={() => navigate("/login")}>
            ¿Ya tienes cuenta? Inicia Sesión
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Register;
