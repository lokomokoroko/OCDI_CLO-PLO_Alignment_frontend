import { useState, useRef } from "react";
import {
  Box, Typography, Stack, Button, TextField, MenuItem, Paper, Grid,
  Collapse, Chip, IconButton,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import UploadIcon from "@mui/icons-material/Upload";
import EditIcon from "@mui/icons-material/Edit";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import CloseIcon from "@mui/icons-material/Close";
import {
  courses as initialData,
  programs as programsData,
  bloomLevels,
  versionYears,
  teachers,
} from "../data";
import { Modal, Field, SelectField, ModalActions } from "../components/Modal";

const bloomColors = {
  Remember:   { bg: "grey.100",  color: "grey.600"  },
  Understand: { bg: "#eff6ff",   color: "#2563eb" },
  Apply:      { bg: "#eef2ff",   color: "primary.main" },
  Analyze:    { bg: "#f5f3ff",   color: "#7c3aed" },
  Evaluate:   { bg: "#fffbeb",   color: "#d97706" },
  Create:     { bg: "#f0fdf4",   color: "#16a34a" },
};

export default function Courses() {
  const [data, setData] = useState(initialData);
  const [filterProgram, setFilterProgram] = useState("");
  const [filterBloom, setFilterBloom] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [filterTeacher, setFilterTeacher] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [importStep, setImportStep] = useState("upload");
  const fileRef = useRef(null);

  const emptyForm = {
    name: "", code: "", program: "", units: "3", desc: "",
    yearOffered: "", semester: "",
    clos: [{ code: "CLO1", desc: "", bloom: "" }],
  };
  const [form, setForm] = useState(emptyForm);

  const filtered = data.filter(c => {
    if (filterProgram && c.program !== filterProgram) return false;
    if (filterBloom && !c.clos.some(cl => cl.bloom === filterBloom)) return false;
    if (filterYear && c.versionYear !== Number(filterYear)) return false;
    if (filterTeacher && c.teacher !== filterTeacher) return false;
    return true;
  });

  function openAdd() {
    setForm(emptyForm);
    setModal("add");
  }

  function openEdit(c) {
    setSelected(c);
    setForm({
      name: c.name, code: c.code, program: c.program,
      units: String(c.units), desc: c.desc,
      yearOffered: c.yearOffered != null ? String(c.yearOffered) : "",
      semester: c.semester != null ? String(c.semester) : "",
      clos: c.clos.map(cl => ({ ...cl })),
    });
    setModal("edit");
  }

  function saveAdd() {
    const newCourse = {
      id: data.length + 1,
      name: form.name, code: form.code, program: form.program,
      units: Number(form.units), desc: form.desc,
      status: "Submitted", clos: form.clos,
      ...(form.yearOffered ? { yearOffered: Number(form.yearOffered) } : {}),
      ...(form.semester !== "" ? { semester: Number(form.semester) } : {}),
    };
    setData(d => [...d, newCourse]);
    setModal(null);
  }

  function saveEdit() {
    if (!selected) return;
    setData(d =>
      d.map(c =>
        c.id === selected.id
          ? {
              ...c,
              name: form.name, code: form.code, program: form.program,
              units: Number(form.units), desc: form.desc, clos: form.clos,
              ...(form.yearOffered ? { yearOffered: Number(form.yearOffered) } : { yearOffered: undefined }),
              ...(form.semester !== "" ? { semester: Number(form.semester) } : { semester: undefined }),
            }
          : c
      )
    );
    setModal(null);
  }

  function addCLORow() {
    setForm(f => ({
      ...f,
      clos: [...f.clos, { code: `CLO${f.clos.length + 1}`, desc: "", bloom: "" }],
    }));
  }

  function removeCLORow(i) {
    setForm(f => ({ ...f, clos: f.clos.filter((_, idx) => idx !== i) }));
  }

  function updateCLO(i, key, value) {
    setForm(f => {
      const clos = [...f.clos];
      clos[i] = { ...clos[i], [key]: value };
      return { ...f, clos };
    });
  }

  return (
    <Box sx={{ p: 4 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={700} color="grey.800">Courses</Typography>
          <Typography variant="body2" color="grey.500" sx={{ mt: 0.5 }}>Manage courses and their CLOs</Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" color="inherit" startIcon={<UploadIcon fontSize="small" />} onClick={() => { setImportStep("upload"); setModal("import"); }}>
            Import
          </Button>
          <Button variant="contained" startIcon={<AddIcon fontSize="small" />} onClick={openAdd}>
            Add Course
          </Button>
        </Stack>
      </Stack>

      <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap sx={{ mb: 2.5 }}>
        <TextField
          select
          size="small"
          value={filterProgram}
          onChange={(e) => setFilterProgram(e.target.value)}
          sx={{ minWidth: 180 }}
          SelectProps={{
            displayEmpty: true,
            renderValue: (value) =>
              value
                ? `${value} – ${programsData.find((p) => p.code === value)?.name}`
                : "All Programs",
          }}
        >
          <MenuItem value="">All Programs</MenuItem>
          {programsData.map((p) => (
            <MenuItem key={p.code} value={p.code}>
              {p.code} – {p.name}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          size="small"
          value={filterBloom}
          onChange={(e) => setFilterBloom(e.target.value)}
          sx={{ minWidth: 160 }}
          SelectProps={{
            displayEmpty: true,
            renderValue: (value) => value || "All Bloom Levels",
          }}
        >
          <MenuItem value="">All Bloom Levels</MenuItem>
          {bloomLevels.map((b) => (
            <MenuItem key={b} value={b}>
              {b}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          size="small"
          value={filterYear}
          onChange={(e) => setFilterYear(e.target.value)}
          sx={{ minWidth: 160 }}
          SelectProps={{
            displayEmpty: true,
            renderValue: (value) => value || "All Version Years",
          }}
        >
          <MenuItem value="">All Version Years</MenuItem>
          {versionYears.map((y) => (
            <MenuItem key={y} value={y}>
              {y}
            </MenuItem>
          ))}
        </TextField>
        {(filterProgram || filterBloom || filterYear || filterTeacher) && (
          <Button
            color="inherit"
            onClick={() => { setFilterProgram(""); setFilterBloom(""); setFilterYear(""); setFilterTeacher(""); }}
            sx={{ color: "grey.500" }}
          >
            Clear filters
          </Button>
        )}
      </Stack>

      <Stack spacing={1.5}>
        {filtered.length === 0 && (
          <Paper elevation={0} variant="outlined" sx={{ borderRadius: 3, p: 5, textAlign: "center", color: "grey.400" }}>
            No courses match the selected filters.
          </Paper>
        )}
        {filtered.map(c => {
          const visibleCLOs = filterBloom ? c.clos.filter(cl => cl.bloom === filterBloom) : c.clos;
          return (
            <Paper key={c.id} elevation={0} variant="outlined" sx={{ borderRadius: 3, overflow: "hidden" }}>
              <Stack direction="row" alignItems="center" spacing={2} sx={{ px: 2.5, py: 2 }}>
                <IconButton size="small" onClick={() => setExpandedId(expandedId === c.id ? null : c.id)}>
                  {expandedId === c.id ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                </IconButton>

                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap" useFlexGap>
                    <Typography variant="body2" fontWeight={600} color="grey.800">{c.code}</Typography>
                    <Chip label={c.name} size="small" sx={{ fontFamily: "monospace", bgcolor: "grey.100", color: "grey.500", fontSize: 11, height: 20 }} />
                  </Stack>
                  <Typography variant="caption" color="grey.500" sx={{ mt: 0.25, display: "block" }}>
                    {c.program} · {c.units} units · {c.clos.length} CLOs
                    {c.yearOffered != null ? ` · Year ${c.yearOffered}` : ""}
                    {c.semester != null ? ` · Sem ${c.semester === 0 ? "Summer" : c.semester}` : ""}
                    {c.versionYear ? ` · v${c.versionYear}` : ""}
                    {c.teacher ? ` · ${c.teacher}` : ""}
                  </Typography>
                </Box>

                <Button size="small" startIcon={<EditIcon sx={{ fontSize: 13 }} />} onClick={() => openEdit(c)}
                  sx={{ color: "grey.400", fontSize: 12, "&:hover": { color: "grey.700", bgcolor: "grey.100" } }}>
                  Edit
                </Button>
              </Stack>

              <Collapse in={expandedId === c.id}>
                <Box sx={{ borderTop: "1px solid", borderColor: "grey.100", px: 2.5, py: 2, bgcolor: "grey.50" }}>
                  <Typography variant="caption" fontWeight={600} color="grey.400" sx={{ textTransform: "uppercase", letterSpacing: 0.5, mb: 1.5, display: "block" }}>
                    Course Learning Outcomes
                    {filterBloom && <Box component="span" sx={{ ml: 1, color: "primary.main", textTransform: "none" }}>· filtered: {filterBloom}</Box>}
                  </Typography>
                  <Stack spacing={1}>
                    {visibleCLOs.map(cl => {
                      const bc = bloomColors[cl.bloom] ?? {};
                      return (
                        <Stack key={cl.code} direction="row" spacing={1.5} alignItems="flex-start">
                          <Chip label={cl.code} size="small" sx={{ fontFamily: "monospace", fontWeight: 700, bgcolor: "#eef2ff", color: "primary.main", fontSize: 11, height: 20, mt: 0.25 }} />
                          <Typography variant="body2" color="grey.700" sx={{ flex: 1 }}>{cl.desc}</Typography>
                          <Chip label={cl.bloom} size="small" sx={{ bgcolor: bc.bg, color: bc.color, fontWeight: 500, fontSize: 11.5, height: 22, mt: 0.25, flexShrink: 0 }} />
                        </Stack>
                      );
                    })}
                    {visibleCLOs.length === 0 && (
                      <Typography variant="body2" color="grey.400">No CLOs match this Bloom level.</Typography>
                    )}
                  </Stack>
                </Box>
              </Collapse>
            </Paper>
          );
        })}
      </Stack>

      {(modal === "add" || modal === "edit") && (
        <Modal title={modal === "add" ? "Add Course" : `Edit — ${selected?.name}`} onClose={() => setModal(null)} wide>
          <Stack spacing={2}>
            {/* COURSE NAME + CODE */}
            <Grid container spacing={1.5}>
              <Grid size={3}>
                <Field
                  label="Catalog Number"
                  value={form.code}
                  onChange={v => setForm(f => ({ ...f, code: v }))}
                />
              </Grid>
              <Grid size={9}>
                <Field
                  label="Course Title"
                  value={form.name}
                  onChange={v => setForm(f => ({ ...f, name: v }))}
                />
              </Grid>
            </Grid>
            {/* PROGRAM + UNITS */}
            <Grid container spacing={1.5}>
              <Grid size={5}>
                <SelectField
                  label="Offering Department/Program"
                  value={form.program}
                  onChange={v => setForm(f => ({ ...f, program: v }))}
                  options={programsData.map(p => p.code)}
                />
              </Grid>
              <Grid size={4}>
                <TextField
                label="Version Year"
                fullWidth
                value={form.versionYear}
                onChange={(e) => setForm(f => ({...f, versionYear: e.target.value,}))}
              />
            </Grid>

              <Grid size={3}>
                <Field
                  label="Units"
                  value={form.units}
                  onChange={v => setForm(f => ({ ...f, units: v }))}
                  type="number"
                  placeholder="3"
                />
              </Grid>
            </Grid>
            <Box sx={{ width: "100%" }}>
              <Field
                label="Course Description"
                value={form.desc}
                onChange={v => setForm(f => ({ ...f, desc: v }))}
                textarea
              />
            </Box>
            <Box>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                <Typography variant="caption" fontWeight={500} color="grey.500">Course Learning Outcomes</Typography>
                <Button size="small" startIcon={<AddIcon sx={{ fontSize: 14 }} />} onClick={addCLORow} sx={{ fontSize: 12 }}>Add CLO</Button>
              </Stack>
              <TextField
                label="Competency Description"
                value={form.competency}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    competency: e.target.value,
                  }))
                }
                fullWidth
                multiline
                rows={1}
                sx={{ mb: 2 }}
              />
              <Stack sx={{ maxHeight: 220, overflowY: "auto", pr: 0.5 }}>
                {form.clos.map((cl, i) => (
                  <Stack key={i} direction="row" spacing={1} alignItems="flex-start" sx={{ py: 1.5, borderTop: i > 0 ? "1px solid" : "none", borderColor: "grey.200" }}>
                    <TextField value={cl.code} onChange={e => updateCLO(i, "code", e.target.value)} sx={{ width: 72 }} />
                    <Box sx={{ flex: 1 }}>
                      <TextField
                        value={cl.desc}
                        onChange={e => updateCLO(i, "desc", e.target.value)}
                        label='CLO Description'
                        size="small"
                        fullWidth
                      />
                    </Box>
                    <TextField select value={cl.bloom} onChange={e => updateCLO(i, "bloom", e.target.value)} label="Bloom Level" size="small" sx={{ width: 140 }}>
                      {bloomLevels.map(b => <MenuItem key={b} value={b}>{b}</MenuItem>)}
                    </TextField>
                    <TextField
                      select
                      value={cl.ksa}
                      onChange={e => updateCLO(i, "ksa", e.target.value)}
                      label="KSA"
                      size="small"
                      sx={{ width: 120 }}
                    >
                      <MenuItem value="Knowledge">Knowledge</MenuItem>
                      <MenuItem value="Skills">Skills</MenuItem>
                      <MenuItem value="Attitude">Attitude</MenuItem>
                    </TextField>
                    {form.clos.length > 1 && (
                      <IconButton size="small" onClick={() => removeCLORow(i)} sx={{ color: "error.main", mt: 0.5 }}>
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Stack>
                ))}
              </Stack>
            </Box>
          </Stack>

          <ModalActions
            onCancel={() => setModal(null)}
            onConfirm={modal === "add" ? saveAdd : saveEdit}
            confirmLabel={modal === "add" ? "Add Course" : "Save Changes"}
          />
        </Modal>
      )}

      {modal === "import" && (
        <Modal title="Import Course Data" onClose={() => setModal(null)}>
          {importStep === "upload" ? (
            <Stack spacing={2}>
              <Box
                onClick={() => fileRef.current?.click()}
                sx={{ border: "2px dashed", borderColor: "grey.200", borderRadius: 3, p: 4, textAlign: "center", cursor: "pointer", "&:hover": { borderColor: "primary.light", bgcolor: "#eef2ff44" } }}
              >
                <UploadIcon sx={{ fontSize: 28, color: "grey.300", mb: 1 }} />
                <Typography variant="body2" fontWeight={500} color="grey.600">Click to upload an Excel or CSV file</Typography>
                <Typography variant="caption" color="grey.400" sx={{ mt: 0.5, display: "block" }}>Supported: .xlsx, .csv</Typography>
              </Box>
              <input ref={fileRef} type="file" accept=".xlsx,.csv" hidden onChange={() => setImportStep("preview")} />
              <Typography variant="caption" color="grey.400" align="center" sx={{ display: "block" }}>
                File must include: Course Name, Code, Program, Units, Description, CLO Code, CLO Description, Bloom Level
              </Typography>
            </Stack>
          ) : (
            <Stack spacing={2}>
              <Paper variant="outlined" sx={{ borderRadius: 3, p: 2, bgcolor: "grey.50" }}>
                <Stack spacing={0.5}>
                  <Typography variant="body2"><Box component="span" color="grey.400">Course:</Box> <b>Human-Computer Interaction</b></Typography>
                  <Typography variant="body2"><Box component="span" color="grey.400">Code:</Box> CS401</Typography>
                  <Typography variant="body2"><Box component="span" color="grey.400">Program:</Box> BS CS · 3 units</Typography>
                  <Typography variant="body2"><Box component="span" color="grey.400">CLOs:</Box> 3 detected</Typography>
                </Stack>
              </Paper>
              <Typography variant="body2" color="grey.600">Does this look correct? Confirm to add the course.</Typography>
              <ModalActions onCancel={() => setImportStep("upload")} onConfirm={() => setModal(null)} confirmLabel="Confirm Import" />
            </Stack>
          )}
        </Modal>
      )}
    </Box>
  );
}