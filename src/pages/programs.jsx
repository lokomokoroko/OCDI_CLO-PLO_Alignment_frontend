import { useState, useRef } from "react";
import {
  Box, Typography, Stack, Button, TextField, MenuItem, Paper, Grid,
  Collapse, Chip, IconButton, Checkbox, FormControlLabel, Avatar,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import UploadIcon from "@mui/icons-material/Upload";
import DownloadIcon from "@mui/icons-material/Download";
import HistoryIcon from "@mui/icons-material/History";
import EditIcon from "@mui/icons-material/Edit";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import CheckIcon from "@mui/icons-material/Check";
import ScheduleIcon from "@mui/icons-material/Schedule";
import CloseIcon from "@mui/icons-material/Close";
import { programs as initialData, schools, departments, fourCOptions } from "../data";
import { StatusBadge } from "../components/StatusBadge";
import { Modal, Field, SelectField, ModalActions } from "../components/Modal";

const programHistory = [
  { version: "v3 (current)", date: "2026-06-15", author: " Sir Maguyon", note: "Added PLO6 — Teamwork and Collaboration." },
  { version: "v2",           date: "2026-03-10", author: "Sir De Vera",   note: "Revised PLO3 description to align with CHED memo." },
  { version: "v1",           date: "2025-09-01", author: "Sir Barot", note: "Initial program setup with 5 PLOs." },
];

export default function Programs() {
  const [data, setData] = useState(initialData);
  const [filterSchool, setFilterSchool] = useState("");
  const [filterDept, setFilterDept] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [importStep, setImportStep] = useState("upload");
  const fileRef = useRef(null);

  const [form, setForm] = useState({
    name: "", code: "", dept: "", school: "", desc: "",
    plos: [{ code: "PLO1", desc: "", keyword: "", fourC: [] }],
  });

  const filtered = data.filter(p =>
    (!filterSchool || p.school === filterSchool) &&
    (!filterDept   || p.dept   === filterDept)
  );

  function openAdd() {
    setForm({ name: "", code: "", dept: "", school: "", desc: "", plos: [{ code: "PLO1", desc: "", keyword: "", fourC: [] }] });
    setModal("add");
  }

  function openEdit(p) {
    setSelected(p);
    setForm({ name: p.name, code: p.code, dept: p.dept, school: p.school, desc: p.desc, plos: p.plos.map(pl => ({ ...pl })) });
    setModal("edit");
  }

  function openHistory(p) {
    setSelected(p);
    setModal("history");
  }

  function handleExport(p) {
    const lines = [
      `Program: ${p.name} (${p.code})`,
      `School: ${p.school} | Department: ${p.dept}`,
      "",
      "Program Learning Outcomes:",
      ...p.plos.map(pl => `  ${pl.code}: ${pl.desc} [4C: ${pl.fourC}]`),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${p.code}_PLOs.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function saveAdd() {
    setData(d => [...d, { id: d.length + 1, ...form, status: "Draft" }]);
    setModal(null);
  }

  function saveEdit() {
    if (!selected) return;
    setData(d => d.map(p => p.id === selected.id ? { ...p, ...form } : p));
    setModal(null);
  }

  function addPLORow() {
    setForm(f => ({
      ...f,
      plos: [...f.plos, { code: `PLO${f.plos.length + 1}`, desc: "", keyword: "", fourC: [] }],
    }));
  }

  function removePLORow(i) {
    setForm(f => ({ ...f, plos: f.plos.filter((_, idx) => idx !== i) }));
  }

  return (
    <Box sx={{ p: 4 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={700} color="grey.800">Programs</Typography>
          <Typography variant="body2" color="grey.500" sx={{ mt: 0.5 }}>
            Manage academic programs and their PLOs
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined" color="inherit" startIcon={<UploadIcon fontSize="small" />}
            onClick={() => { setImportStep("upload"); setModal("import"); }}
          >
            Import
          </Button>
          <Button variant="contained" startIcon={<AddIcon fontSize="small" />} onClick={openAdd}>
            Add Program
          </Button>
        </Stack>
      </Stack>

      <Stack direction="row" spacing={1.5} sx={{ mb: 2.5 }}>
        <TextField
          select
          size="small"
          value={filterSchool}
          onChange={(e) => setFilterSchool(e.target.value)}
          sx={{ minWidth: 160 }}
          SelectProps={{ displayEmpty: true }}
        >
          <MenuItem value="">All Schools</MenuItem>
          {schools.map((o) => (
            <MenuItem key={o} value={o}>
              {o}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          size="small"
          value={filterDept}
          onChange={(e) => setFilterDept(e.target.value)}
          sx={{ minWidth: 220 }}
          SelectProps={{ displayEmpty: true }}
        >
          <MenuItem value="">All Departments</MenuItem>
          {departments.map((o) => (
            <MenuItem key={o} value={o}>
              {o}
            </MenuItem>
          ))}
        </TextField>
      </Stack>

      <Stack spacing={1.5}>
        {filtered.length === 0 && (
          <Paper elevation={0} variant="outlined" sx={{ borderRadius: 3, p: 5, textAlign: "center", color: "grey.400" }}>
            No programs match the selected filters.
          </Paper>
        )}
        {filtered.map(p => (
          <Paper key={p.id} elevation={0} variant="outlined" sx={{ borderRadius: 3, overflow: "hidden" }}>
            <Stack direction="row" alignItems="center" spacing={2} sx={{ px: 2.5, py: 2 }}>
              <IconButton size="small" onClick={() => setExpandedId(expandedId === p.id ? null : p.id)}>
                {expandedId === p.id ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
              </IconButton>

              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap" useFlexGap>
                  <Typography variant="body2" fontWeight={600} color="grey.800">{p.name}</Typography>
                  <Chip label={p.code} size="small" sx={{ fontFamily: "monospace", bgcolor: "grey.100", color: "grey.500", fontSize: 11, height: 20 }} />
                  <StatusBadge status={p.status} />
                </Stack>
                <Typography variant="caption" color="grey.500" sx={{ mt: 0.25, display: "block" }}>
                  {p.school} · {p.dept} · {p.plos.length} PLOs
                </Typography>
              </Box>

              <Stack direction="row" spacing={0.5}>
                <ActionBtn icon={EditIcon} label="Edit" onClick={() => openEdit(p)} />
                <ActionBtn icon={DownloadIcon} label="Export" onClick={() => handleExport(p)} />
                <ActionBtn icon={HistoryIcon} label="History" onClick={() => openHistory(p)} />
              </Stack>
            </Stack>

            <Collapse in={expandedId === p.id}>
              <Box sx={{ borderTop: "1px solid", borderColor: "grey.100", px: 2.5, py: 2, bgcolor: "grey.50" }}>
                <Typography variant="caption" fontWeight={600} color="grey.400" sx={{ textTransform: "uppercase", letterSpacing: 0.5, mb: 1.5, display: "block" }}>
                  Program Learning Outcomes
                </Typography>
                <Stack spacing={1.5}>
                  {p.plos.map(plo => (
                    <Stack key={plo.code} direction="row" spacing={1.5} alignItems="flex-start">
                      <Chip
                        label={plo.code}
                        size="small"
                        sx={{ fontFamily: "monospace", fontWeight: 700, bgcolor: "#eef2ff", color: "primary.main", fontSize: 11, height: 20, mt: 0.25 }}
                      />
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        {plo.keyword && (
                          <Chip label={plo.keyword} size="small" sx={{ bgcolor: "grey.100", color: "grey.500", fontSize: 10.5, height: 18, mb: 0.5 }} />
                        )}
                        <Typography variant="body2" color="grey.700">{plo.desc}</Typography>
                      </Box>
                      <Stack alignItems="flex-end" spacing={0.25} flexShrink={0}>
                        {(Array.isArray(plo.fourC) ? plo.fourC : [plo.fourC]).map(c => (
                          <Typography key={c} variant="caption" fontStyle="italic" color="grey.400">{c}</Typography>
                        ))}
                      </Stack>
                    </Stack>
                  ))}
                </Stack>
              </Box>
            </Collapse>
          </Paper>
        ))}
      </Stack>

      {(modal === "add" || modal === "edit") && (
        <Modal 
          title={modal === "add" ? "Add Program" : `Edit — ${selected?.name}`} 
          onClose={() => setModal(null)} 
          wide
        >
          <Stack spacing={2.5}>

            {/* SCHOOL + DEPARTMENT */}
            <Grid container spacing={1.5}>
              <Grid size={6}>
                <SelectField
                  label="School"
                  value={form.school}
                  onChange={v => setForm(f => ({ ...f, school: v }))}
                  options={schools}
                  fullWidth
                />
              </Grid>

              <Grid size={6}>
                <SelectField
                  label="Department"
                  value={form.dept}
                  onChange={v => setForm(f => ({ ...f, dept: v }))}
                  options={departments}
                  fullWidth
                />
              </Grid>
            </Grid>


            {/* PROGRAM NAME + CODE */}
            <Grid container spacing={1.5}>
              <Grid size={9}>
                <Field
                  label="Program Name"
                  value={form.name}
                  onChange={v => setForm(f => ({ ...f, name: v }))}
                />
              </Grid>

              <Grid size={3}>
                <Field
                  label="Program Code"
                  value={form.code}
                  onChange={v => setForm(f => ({ ...f, code: v }))}
                />
              </Grid>
            </Grid>


            {/* DESCRIPTION */}
          <Box sx={{ width: "100%" }}>
            <Field
              label="Program Description"
              value={form.desc}
              onChange={v => setForm(f => ({ ...f, desc: v }))}
              textarea
            />
          </Box>


            {/* PLO SECTION */}
            <Box>

              <Stack 
                direction="row" 
                justifyContent="space-between"
                alignItems="center"
                sx={{ mb: 1 }}
              >
                <Typography 
                  variant="caption"
                  fontWeight={600}
                  color="grey.500"
                >
                  Program Learning Outcomes
                </Typography>

                <Button
                  size="small"
                  startIcon={<AddIcon sx={{ fontSize: 14 }} />}
                  onClick={addPLORow}
                  sx={{ fontSize: 12 }}
                >
                  Add PLO
                </Button>
              </Stack>


              <Stack spacing={1.5}>

                {form.plos.map((plo, i) => (

                  <Paper
                    key={i}
                    variant="outlined"
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                    }}
                  >

                    <Stack
                      direction="row"
                      spacing={1.5}
                      alignItems="flex-start"
                    >


                      {/* PLO CODE */}
                      <Box
                        sx={{
                          width: 70,
                          flexShrink: 0,
                        }}
                      >
                        <TextField
                          value={plo.code}
                          size="small"
                          fullWidth
                          onChange={e =>
                            setForm(f => {
                              const plos = [...f.plos];
                              plos[i] = {
                                ...plos[i],
                                code: e.target.value,
                              };
                              return { ...f, plos };
                            })
                          }
                          placeholder="PLO1"
                        />
                      </Box>



                      {/* DESCRIPTION + KEYWORD  */}
                      <Stack
                        spacing={1}
                        sx={{
                          flex: 1,
                          minWidth: 0,
                        }}
                      >

                        <TextField
                          value={plo.desc}
                          size="small"
                          multiline
                          rows={2}
                          fullWidth
                          placeholder="PLO description"
                          onChange={e =>
                            setForm(f => {
                              const plos = [...f.plos];
                              plos[i] = {
                                ...plos[i],
                                desc: e.target.value,
                              };
                              return { ...f, plos };
                            })
                          }
                        />


                        <TextField
                          value={plo.keyword ?? ""}
                          size="small"
                          fullWidth
                          placeholder="Main keyword of PLO"
                          onChange={e =>
                            setForm(f => {
                              const plos = [...f.plos];
                              plos[i] = {
                                ...plos[i],
                                keyword: e.target.value,
                              };
                              return { ...f, plos };
                            })
                          }
                        />

                      </Stack>



                      {/* 4Cs */}
                      <Box
                        sx={{
                          p: 1,
                          width: 150,
                          flexShrink: 0,
                        }}
                      >

                        {fourCOptions.map(c => {

                          const current = Array.isArray(plo.fourC)
                            ? plo.fourC
                            : [];

                          const checked = current.includes(c);

                          return (

                            <FormControlLabel
                              key={c}
                              sx={{
                                display: "block",
                                m: 0,
                                "& .FormControlLabel-label": {
                                  fontSize: 11,
                                },
                              }}

                              control={
                                <Checkbox
                                  size="small"
                                  checked={checked}
                                  sx={{ p: 0.25 }}

                                  onChange={e =>
                                    setForm(f => {

                                      const plos = [...f.plos];

                                      const current =
                                        plos[i].fourC ?? [];

                                      plos[i] = {
                                        ...plos[i],
                                        fourC: e.target.checked
                                          ? [...current, c]
                                          : current.filter(x => x !== c),
                                      };

                                      return {
                                        ...f,
                                        plos,
                                      };

                                    })
                                  }
                                />
                              }

                              label={c}
                            />

                          );
                        })}

                      </Box>



                      {/* REMOVE */}
                      {form.plos.length > 1 && (
                        <IconButton
                          size="small"
                          onClick={() => removePLORow(i)}
                          sx={{
                            color: "error.main",
                          }}
                        >
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      )}


                    </Stack>

                  </Paper>

                ))}

              </Stack>

            </Box>

          </Stack>


          <ModalActions
            onCancel={() => setModal(null)}
            onConfirm={modal === "add" ? saveAdd : saveEdit}
            confirmLabel={modal === "add" ? "Add Program" : "Save Changes"}
          />

        </Modal>
      )}

      {modal === "import" && (
        <Modal title="Import Program Data" onClose={() => setModal(null)}>
          {importStep === "upload" ? (
            <Stack spacing={2}>
              <Box
                onClick={() => fileRef.current?.click()}
                sx={{
                  border: "2px dashed", borderColor: "grey.200", borderRadius: 3, p: 4, textAlign: "center", cursor: "pointer",
                  "&:hover": { borderColor: "primary.light", bgcolor: "#eef2ff44" },
                }}
              >
                <UploadIcon sx={{ fontSize: 28, color: "grey.300", mb: 1 }} />
                <Typography variant="body2" fontWeight={500} color="grey.600">Click to upload an Excel or CSV file</Typography>
                <Typography variant="caption" color="grey.400" sx={{ mt: 0.5, display: "block" }}>Supported: .xlsx, .csv</Typography>
              </Box>
              <input ref={fileRef} type="file" accept=".xlsx,.csv" hidden onChange={() => setImportStep("preview")} />
              <Typography variant="caption" color="grey.400" align="center" sx={{ display: "block" }}>
                File must include columns: Program Name, Code, Department, School, Description, PLO Code, PLO Description, 4C
              </Typography>
            </Stack>
          ) : (
            <Stack spacing={2}>
              <Paper variant="outlined" sx={{ borderRadius: 3, p: 2, bgcolor: "grey.50" }}>
                <Stack spacing={0.5}>
                  <Typography variant="body2"><Box component="span" color="grey.400">Program:</Box> <b>BS Cybersecurity</b></Typography>
                  <Typography variant="body2"><Box component="span" color="grey.400">Code:</Box> BS CY</Typography>
                  <Typography variant="body2"><Box component="span" color="grey.400">School:</Box> SOSE · Information Systems and Computer Science</Typography>
                  <Typography variant="body2"><Box component="span" color="grey.400">PLOs:</Box> 5 detected</Typography>
                </Stack>
              </Paper>
              <Typography variant="body2" color="grey.600">Does this look correct? Confirm to add the program.</Typography>
              <ModalActions onCancel={() => setImportStep("upload")} onConfirm={() => setModal(null)} confirmLabel="Confirm Import" />
            </Stack>
          )}
        </Modal>
      )}

      {modal === "history" && selected && (
        <Modal title={`History — ${selected.name}`} onClose={() => setModal(null)}>
          <Stack spacing={0}>
            {programHistory.map((h, i) => (
              <Stack key={i} direction="row" spacing={1.5}>
                <Stack alignItems="center">
                  <Avatar sx={{ width: 28, height: 28, bgcolor: i === 0 ? "#eef2ff" : "grey.100" }}>
                    {i === 0 ? <CheckIcon sx={{ fontSize: 13, color: "primary.main" }} /> : <ScheduleIcon sx={{ fontSize: 13, color: "grey.400" }} />}
                  </Avatar>
                  {i < programHistory.length - 1 && <Box sx={{ width: "1px", flex: 1, bgcolor: "grey.200", mt: 0.5 }} />}
                </Stack>
                <Box sx={{ pb: 2.5 }}>
                  <Typography variant="body2" fontWeight={600} color="grey.800">{h.version}</Typography>
                  <Typography variant="caption" color="grey.400" sx={{ display: "block", mt: 0.25 }}>{h.date} · {h.author}</Typography>
                  <Typography variant="body2" color="grey.600" sx={{ mt: 0.5 }}>{h.note}</Typography>
                </Box>
              </Stack>
            ))}
          </Stack>
        </Modal>
      )}
    </Box>
  );
}

function ActionBtn({ icon: Icon, label, onClick }) {
  return (
    <IconButton size="small" onClick={onClick} title={label} sx={{ color: "grey.400", "&:hover": { color: "grey.700", bgcolor: "grey.100" } }}>
      <Icon fontSize="small" />
    </IconButton>
  );
}