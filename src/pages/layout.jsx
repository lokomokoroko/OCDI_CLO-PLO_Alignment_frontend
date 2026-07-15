import { useState, useEffect } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
  Box,
  Stack,
  Typography,
  IconButton,
  Avatar,
  Badge,
  Grid,
  Button,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/SpaceDashboard";
import SchoolIcon from "@mui/icons-material/School";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import HubIcon from "@mui/icons-material/Hub";
import CastForEducationIcon from "@mui/icons-material/CastForEducation";
import AssignmentIcon from "@mui/icons-material/Assignment";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import LogoutIcon from "@mui/icons-material/Logout";
import { Modal, Field } from "../components/Modal";

const navItems = [
  { to: "/",                icon: DashboardIcon,        label: "Dashboard",           end: true  },
  { to: "/programs",        icon: SchoolIcon,           label: "Programs",            end: false },
  { to: "/courses",         icon: MenuBookIcon,         label: "Courses",             end: false },
  { to: "/alignment",       icon: HubIcon,               label: "Alignment Matrix",    end: false },
  { to: "/teaching-matrix", icon: CastForEducationIcon, label: "Teaching & Learning", end: false },
  { to: "/approval",        icon: AssignmentIcon,       label: "Pending Approvals",   end: false, badge: 3 },
];

const SIDEBAR_BG = "#1a1f2e";

export default function Layout() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [user, setUser] = useState({
    firstName: "OCDI",
    lastName: "Office",
    email: "ocdi@ateneo.edu",
    role: "OCDI",
  });

  useEffect(() => {
    const raw = localStorage.getItem("clo-plo-auth");
    if (raw) {
      try { setUser(JSON.parse(raw)); } catch {}
    }
  }, []);

  function handleLogout() {
    localStorage.removeItem("clo-plo-auth");
    navigate("/login");
  }

  const initials = `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`;
  const width = collapsed ? 60 : 220;

  return (
    <Box sx={{ display: "flex", height: "100vh", width: "100%", bgcolor: "background.default", overflow: "hidden" }}>
      {/* Sidebar */}
      <Box
        sx={{
          width,
          flexShrink: 0,
          bgcolor: SIDEBAR_BG,
          display: "flex",
          flexDirection: "column",
          transition: "width 0.2s",
          overflow: "hidden",
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ height: 56, px: 1.5, borderBottom: "1px solid rgba(255,255,255,0.1)", flexShrink: 0 }}
        >
          {!collapsed && (
            <Box sx={{ minWidth: 0 }}>
              <Typography color="white" fontWeight={700} fontSize={13} lineHeight={1.2}>CLO-PLO</Typography>
              <Typography color="grey.400" fontSize={10}>Alignment Tracker</Typography>
            </Box>
          )}
          <IconButton
            onClick={() => setCollapsed(c => !c)}
            size="small"
            sx={{ color: "grey.400", mx: collapsed ? "auto" : 0, "&:hover": { color: "white", bgcolor: "rgba(255,255,255,0.1)" } }}
          >
            {collapsed ? <ChevronRightIcon fontSize="small" /> : <ChevronLeftIcon fontSize="small" />}
          </IconButton>
        </Stack>

        <Stack sx={{ flex: 1, py: 1.5, px: 1, gap: 0.5, overflowY: "auto" }}>
          {navItems.map(({ to, icon: Icon, label, end, badge }) => (
            <NavLink key={to} to={to} end={end} style={{ textDecoration: "none" }}>
              {({ isActive }) => (
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={1.25}
                  sx={{
                    px: 1.25,
                    py: 1,
                    borderRadius: 2,
                    fontSize: 13,
                    justifyContent: collapsed ? "center" : "flex-start",
                    bgcolor: isActive ? "primary.main" : "transparent",
                    color: isActive ? "white" : "grey.400",
                    "&:hover": { color: "white", bgcolor: isActive ? "primary.main" : "rgba(255,255,255,0.05)" },
                    cursor: "pointer",
                    transition: "background-color 0.15s, color 0.15s",
                  }}
                >
                  <Icon sx={{ fontSize: 17, flexShrink: 0 }} />
                  {!collapsed && (
                    <>
                      <Typography sx={{ flex: 1, fontSize: 13, lineHeight: 1 }}>{label}</Typography>
                      {badge && !isActive && (
                        <Box
                          sx={{
                            bgcolor: "warning.main",
                            color: "#78350f",
                            fontSize: 10,
                            fontWeight: 700,
                            borderRadius: "50%",
                            width: 20,
                            height: 20,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          {badge}
                        </Box>
                      )}
                    </>
                  )}
                </Stack>
              )}
            </NavLink>
          ))}
        </Stack>

        <Box sx={{ borderTop: "1px solid rgba(255,255,255,0.1)", p: 1, flexShrink: 0 }}>
          {collapsed ? (
            <Stack alignItems="center" spacing={1}>
              <Avatar
                onClick={() => setProfileOpen(true)}
                sx={{ width: 32, height: 32, bgcolor: "#818cf8", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
              >
                {initials}
              </Avatar>
              <IconButton onClick={handleLogout} size="small" sx={{ color: "grey.400", "&:hover": { color: "white" } }}>
                <LogoutIcon sx={{ fontSize: 14 }} />
              </IconButton>
            </Stack>
          ) : (
            <Stack spacing={0.5}>
              <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                onClick={() => setProfileOpen(true)}
                sx={{ px: 1, py: 0.75, borderRadius: 2, cursor: "pointer", "&:hover": { bgcolor: "rgba(255,255,255,0.05)" } }}
              >
                <Avatar sx={{ width: 28, height: 28, bgcolor: "#818cf8", fontSize: 12, fontWeight: 700 }}>{initials}</Avatar>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography color="white" fontSize={12} fontWeight={500} noWrap>
                    {user.firstName} {user.lastName}
                  </Typography>
                  <Typography color="grey.400" fontSize={10}>{user.role}</Typography>
                </Box>
              </Stack>
              <Button
                onClick={handleLogout}
                startIcon={<LogoutIcon sx={{ fontSize: 12 }} />}
                sx={{ justifyContent: "flex-start", color: "grey.400", fontSize: 12, px: 1, "&:hover": { color: "white", bgcolor: "rgba(255,255,255,0.05)" } }}
              >
                Log out
              </Button>
            </Stack>
          )}
        </Box>
      </Box>

      <Box component="main" sx={{ flex: 1, overflowY: "auto" }}>
        <Outlet />
      </Box>

      {profileOpen && (
        <ProfileModal
          user={user}
          onSave={updated => {
            setUser(updated);
            localStorage.setItem("clo-plo-auth", JSON.stringify(updated));
          }}
          onClose={() => setProfileOpen(false)}
        />
      )}
    </Box>
  );
}

function ProfileModal({ user, onSave, onClose }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(user);

  function save() {
    onSave(form);
    setEditing(false);
  }

  return (
    <Modal title={editing ? "Edit Profile" : "My Profile"} onClose={onClose}>
      {editing ? (
        <Stack spacing={2}>
          <Grid container spacing={1.5}>
            <Grid item xs={6}>
              <Field label="First Name" value={form.firstName} onChange={v => setForm(f => ({ ...f, firstName: v }))} />
            </Grid>
            <Grid item xs={6}>
              <Field label="Last Name" value={form.lastName} onChange={v => setForm(f => ({ ...f, lastName: v }))} />
            </Grid>
          </Grid>
          <Field label="Email" value={form.email} onChange={v => setForm(f => ({ ...f, email: v }))} type="email" />
          <Stack direction="row" spacing={1.5} sx={{ pt: 1 }}>
            <Button onClick={save} variant="contained" fullWidth>Save Changes</Button>
            <Button onClick={() => { setForm(user); setEditing(false); }} variant="outlined" color="inherit" fullWidth>
              Cancel
            </Button>
          </Stack>
        </Stack>
      ) : (
        <Stack spacing={2}>
          <Stack direction="row" alignItems="center" spacing={2} sx={{ pb: 2, borderBottom: "1px solid", borderColor: "grey.100" }}>
            <Avatar sx={{ width: 56, height: 56, bgcolor: "#818cf8", fontWeight: 700, fontSize: 18 }}>
              {user.firstName?.[0]}{user.lastName?.[0]}
            </Avatar>
            <Box>
              <Typography fontWeight={600} color="grey.800">{user.firstName} {user.lastName}</Typography>
              <Typography variant="body2" color="grey.500">{user.role}</Typography>
            </Box>
          </Stack>
          <InfoRow label="Full Name" value={`${user.firstName} ${user.lastName}`} />
          <InfoRow label="Email" value={user.email} />
          <InfoRow label="Role" value={user.role} />
          <Button onClick={() => setEditing(true)} variant="outlined" color="inherit" fullWidth sx={{ mt: 1 }}>
            Edit Profile
          </Button>
        </Stack>
      )}
    </Modal>
  );
}

function InfoRow({ label, value }) {
  return (
    <Box>
      <Typography variant="caption" color="grey.400" fontWeight={500} display="block" sx={{ mb: 0.25 }}>
        {label}
      </Typography>
      <Typography variant="body2" color="grey.800">{value}</Typography>
    </Box>
  );
}