import { useState } from "react";
import {
  Box, Typography, Stack, Paper, Grid, Button, Menu, MenuItem, TextField, Chip,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DescriptionIcon from "@mui/icons-material/Description";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import { approvalItems as initialItems, programs as allPrograms } from "../data";
import { StatusBadge } from "../components/StatusBadge";
import { Modal } from "../components/Modal";

export default function Approval() {
  const [items, setItems] = useState(initialItems);
  const [selectedProgram, setSelectedProgram] = useState(allPrograms[0].code);
  const [programAnchor, setProgramAnchor] = useState(null);
  const [reviewing, setReviewing] = useState(null);
  const [comment, setComment] = useState("");
  const [done, setDone] = useState([]);

  const programItems = items.filter(i => i.programCode === selectedProgram);

  function resolve(id, action) {
    setDone(d => [...d, { id, action }]);
    setItems(prev => prev.filter(item => item.id !== id));
    setReviewing(null);
    setComment("");
  }

  const approvedCount = done.filter(d => d.action === "Approved").length;
  const rejectedCount = done.filter(d => d.action === "Rejected").length;

  const summaryCards = [
    { label: "Pending Review", value: programItems.length, color: "#d97706", bg: "#fffbeb" },
    { label: "Approved",       value: approvedCount,        color: "#16a34a", bg: "#f0fdf4" },
    { label: "Rejected",       value: rejectedCount,         color: "#dc2626", bg: "#fef2f2" },
  ];

  return (
    <Box sx={{ p: 4 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={700} color="grey.800">Pending Approvals</Typography>
          <Typography variant="body2" color="grey.500" sx={{ mt: 0.5 }}>
            Review course submissions per program
          </Typography>
        </Box>

        <Button
          variant="outlined" color="inherit" onClick={e => setProgramAnchor(e.currentTarget)}
          endIcon={<ExpandMoreIcon fontSize="small" />}
          sx={{ maxWidth: 260 }}
        >
          <Box component="span" sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{selectedProgram}</Box>
        </Button>
        <Menu anchorEl={programAnchor} open={!!programAnchor} onClose={() => setProgramAnchor(null)}>
          {allPrograms.map(p => (
            <MenuItem
              key={p.code}
              selected={p.code === selectedProgram}
              onClick={() => { setSelectedProgram(p.code); setProgramAnchor(null); }}
              sx={{ display: "block" }}
            >
              <Typography variant="body2" fontWeight={500}>{p.code}</Typography>
              <Typography variant="caption" color="grey.400" noWrap sx={{ display: "block", maxWidth: 220 }}>{p.name}</Typography>
            </MenuItem>
          ))}
        </Menu>
      </Stack>

      <Box
  sx={{
    display: "flex",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 2,
    mb: 3.5,
    width: "100%",
  }}
>
  {summaryCards.map(({ label, value, color, bg }) => (
    <Paper
      key={label}
      elevation={0}
      variant="outlined"
      sx={{
        width: 300,
        height: 90,
        borderRadius: 3,
        px: 3,
        py: 2,
        display: "flex",
        alignItems: "center",
        gap: 2,
      }}
    >
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: 2.5,
          bgcolor: bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Typography
          fontWeight={700}
          sx={{ color }}
        >
          {value}
        </Typography>
      </Box>

      <Box>
        <Typography
          variant="body2"
          color="grey.600"
        >
          {label}
        </Typography>
      </Box>
    </Paper>
  ))}
</Box>

      {programItems.length === 0 ? (
        <Paper elevation={0} variant="outlined" sx={{ borderRadius: 3, p: 6, textAlign: "center" }}>
          <Box sx={{ width: 48, height: 48, bgcolor: "success.light", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 1.5 }}>
            <CheckIcon sx={{ fontSize: 22, color: "success.main" }} />
          </Box>
          <Typography fontWeight={600} color="grey.700">All caught up for {selectedProgram}!</Typography>
          <Typography variant="body2" color="grey.400" sx={{ mt: 0.5 }}>No pending course submissions for this program.</Typography>
        </Paper>
      ) : (
        <Stack spacing={2}>
          <Typography variant="caption" fontWeight={600} color="grey.400" sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}>
            {programItems.length} course{programItems.length !== 1 ? "s" : ""} pending in {selectedProgram}
          </Typography>

          {programItems.map((item, idx) => (
            <Paper
              key={item.id}
              elevation={0}
              variant="outlined"
              sx={{
                borderRadius: 3, px: 2.5, py: 2, display: "flex", alignItems: "center", gap: 2,
                opacity: idx === 0 ? 1 : 0.5,
                borderColor: idx === 0 ? "primary.main" : "grey.200",
                borderWidth: idx === 0 ? 2 : 1,
              }}
            >
              <Box sx={{ width: 32, height: 32, borderRadius: "50%", bgcolor: "#eef2ff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Typography variant="caption" fontWeight={700} color="primary.main">#{idx + 1}</Typography>
              </Box>

              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="body2" fontWeight={600} color="grey.800">{item.name}</Typography>
                <Typography variant="caption" color="grey.400" sx={{ mt: 0.25, display: "block" }}>
                  {item.courseCode} · Submitted by {item.submittedBy} · {item.date}
                </Typography>
              </Box>

              <StatusBadge status={item.status} />

              {idx === 0 && (
                <Button
                  size="small" onClick={() => { setReviewing(item); setComment(""); }}
                  endIcon={<ChevronRightIcon fontSize="small" />}
                  sx={{ flexShrink: 0, fontWeight: 600 }}
                >
                  Review
                </Button>
              )}
            </Paper>
          ))}
        </Stack>
      )}

      {done.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="caption" fontWeight={600} color="grey.400" sx={{ textTransform: "uppercase", letterSpacing: 0.5, mb: 1.5, display: "block" }}>
            Resolved
          </Typography>
          <Stack spacing={1}>
            {done.map(({ id, action }) => {
              const original = initialItems.find(i => i.id === id);
              return (
                <Paper key={id} elevation={0} variant="outlined" sx={{ borderRadius: 2.5, px: 2.5, py: 1.5, display: "flex", alignItems: "center", gap: 2, opacity: 0.6 }}>
                  <Typography variant="body2" color="grey.600" sx={{ flex: 1 }}>{original.name}</Typography>
                  <Typography variant="caption" color="grey.400">{original.courseCode} · {original.programCode}</Typography>
                  <StatusBadge status={action} />
                </Paper>
              );
            })}
          </Stack>
        </Box>
      )}

      {reviewing && (
        <Modal title={`Review — ${reviewing.name}`} onClose={() => setReviewing(null)} wide>
          <Stack spacing={2.5}>
            <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap" useFlexGap>
              <Chip label="Course" size="small" sx={{ bgcolor: "#fff7ed", color: "#ea580c", fontWeight: 600, fontSize: 11 }} />
              <StatusBadge status={reviewing.status} />
              <Typography variant="caption" color="grey.400">
                Submitted by <Box component="span" fontWeight={600} color="grey.600">{reviewing.submittedBy}</Box> on {reviewing.date}
              </Typography>
              <Chip label={reviewing.courseCode} size="small" sx={{ bgcolor: "grey.100", color: "grey.500", fontSize: 11 }} />
              <Chip label={reviewing.programCode} size="small" sx={{ bgcolor: "#eef2ff", color: "primary.main", fontSize: 11 }} />
            </Stack>

            <Grid container spacing={1.5}>
              <Grid item xs={6}>
                <Paper variant="outlined" sx={{ borderRadius: 3, p: 2, bgcolor: "error.light", borderColor: "#fecaca" }}>
                  <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 1 }}>
                    <DescriptionIcon sx={{ fontSize: 13, color: "#f87171" }} />
                    <Typography variant="caption" fontWeight={600} color="#f87171" sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}>Current</Typography>
                  </Stack>
                  <Typography variant="body2" color="grey.700" sx={{ lineHeight: 1.6 }}>{reviewing.currentData}</Typography>
                </Paper>
              </Grid>
              <Grid item xs={6}>
                <Paper variant="outlined" sx={{ borderRadius: 3, p: 2, bgcolor: "success.light", borderColor: "#bbf7d0" }}>
                  <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 1 }}>
                    <CompareArrowsIcon sx={{ fontSize: 13, color: "#4ade80" }} />
                    <Typography variant="caption" fontWeight={600} color="#4ade80" sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}>Proposed</Typography>
                  </Stack>
                  <Typography variant="body2" color="grey.700" sx={{ lineHeight: 1.6 }}>{reviewing.proposedData}</Typography>
                </Paper>
              </Grid>
            </Grid>

            <TextField
              label="Comment (optional)"
              value={comment}
              onChange={e => setComment(e.target.value)}
              multiline
              minRows={3}
              placeholder="Add a note for the submitter…"
              fullWidth
            />

            <Stack direction="row" spacing={1.5}>
              <Button
                onClick={() => resolve(reviewing.id, "Approved")}
                variant="contained" color="success" fullWidth
                startIcon={<CheckIcon fontSize="small" />}
              >
                Approve
              </Button>
              <Button
                onClick={() => resolve(reviewing.id, "Rejected")}
                variant="contained" color="error" fullWidth
                startIcon={<CloseIcon fontSize="small" />}
              >
                Reject
              </Button>
              <Button onClick={() => setReviewing(null)} variant="outlined" color="inherit">
                Cancel
              </Button>
            </Stack>
          </Stack>
        </Modal>
      )}
    </Box>
  );
}