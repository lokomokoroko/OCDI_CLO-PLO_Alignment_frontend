import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Box, Paper, TextField, Button, Typography, Stack, Grid } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    nickname: "",
    email: "",
    password: "",
  });
  const [submitted, setSubmitted] = useState(false);

  function set(key) {
    return e => setForm(f => ({ ...f, [key]: e.target.value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    setSubmitted(true);
  }

  if (submitted) {
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
        <Paper sx={{ width: "100%", maxWidth: 380, p: 4, borderRadius: 3, textAlign: "center" }} elevation={0} variant="outlined">
          <Box
            sx={{
              width: 56,
              height: 56,
              bgcolor: "success.light",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: "auto",
              mb: 2,
            }}
          >
            <CheckCircleIcon sx={{ fontSize: 28, color: "success.main" }} />
          </Box>
          <Typography variant="h6" fontWeight={600} color="grey.800" sx={{ mb: 1 }}>
            Check your email
          </Typography>
          <Typography variant="body2" color="grey.500" sx={{ mb: 3, lineHeight: 1.6 }}>
            {"We sent a verification link to "}
            <Typography component="span" fontWeight={600} color="grey.700">{form.email}</Typography>
            {". Click the link to activate your account."}
          </Typography>
          <Button onClick={() => navigate("/login")} color="primary" size="small">
            Back to login
          </Button>
        </Paper>
      </Box>
    );
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
      <Box sx={{ width: "100%", maxWidth: 420 }}>
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
          <Typography variant="h6" fontWeight={700} color="grey.800">Create an account</Typography>
          <Typography variant="body2" color="grey.500">Join the CLO-PLO Alignment Tracker</Typography>
        </Stack>

        <Paper sx={{ p: 3.5, borderRadius: 3 }} elevation={0} variant="outlined">
          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={2}>
              <Grid container spacing={1.5}>
                <Grid item xs={6}>
                  <TextField label="First Name" value={form.firstName} onChange={set("firstName")} required placeholder="Maria" fullWidth />
                </Grid>
                <Grid item xs={6}>
                  <TextField label="Last Name" value={form.lastName} onChange={set("lastName")} required placeholder="Santos" fullWidth />
                </Grid>
              </Grid>
              <TextField label="Nickname" value={form.nickname} onChange={set("nickname")} required placeholder="msantos" fullWidth />
              <TextField label="Email" type="email" value={form.email} onChange={set("email")} required placeholder="you@university.edu" fullWidth />
              <TextField label="Password" type="password" value={form.password} onChange={set("password")} required placeholder="••••••••" fullWidth />
              <Button type="submit" variant="contained" fullWidth size="large">
                Sign Up
              </Button>
            </Stack>
          </Box>
          <Typography variant="body2" align="center" color="grey.500" sx={{ mt: 2.5 }}>
            Already have an account?{" "}
            <Link to="/login" style={{ color: "#4f46e5", fontWeight: 500, textDecoration: "none" }}>
              Sign in
            </Link>
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
}