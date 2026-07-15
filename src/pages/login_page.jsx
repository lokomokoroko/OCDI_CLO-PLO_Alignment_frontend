import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Box, Paper, TextField, Button, Typography, Alert, Stack } from "@mui/material";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError("Please fill in all fields.");
      return;
    }
    localStorage.setItem(
      "clo-plo-auth",
      JSON.stringify({
        email: form.email,
        firstName: "OCDI",
        lastName: "Office",
        nickname: "ocdi",
        role: "OCDI",
      })
    );
    navigate("/");
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
      }}
    >
      <Box sx={{ width: "100%", maxWidth: 380 }}>
        <Stack alignItems="center" spacing={1} sx={{ mb: 4 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              bgcolor: "primary.main",
              borderRadius: 2.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography color="white" fontWeight={700}>CP</Typography>
          </Box>
          <Typography variant="h6" fontWeight={700} color="grey.800">
            CLO-PLO Alignment Tracker
          </Typography>
          <Typography variant="body2" color="grey.500">Sign in to continue</Typography>
        </Stack>

        <Paper sx={{ p: 3.5, borderRadius: 3 }} elevation={0} variant="outlined">
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={2}>
              <TextField
                label="Email"
                type="email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="you@university.edu"
                fullWidth
              />
              <TextField
                label="Password"
                type="password"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                placeholder="••••••••"
                fullWidth
              />
              <Button type="submit" variant="contained" fullWidth size="large">
                Sign In
              </Button>
            </Stack>
          </Box>
          <Typography variant="body2" align="center" color="grey.500" sx={{ mt: 2.5 }}>
            {"Don't have an account? "}
            <Link to="/signup" style={{ color: "#4f46e5", fontWeight: 500, textDecoration: "none" }}>
              Sign up
            </Link>
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
}