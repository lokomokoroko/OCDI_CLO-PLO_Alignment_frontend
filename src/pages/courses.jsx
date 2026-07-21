import { useState, useEffect, useMemo, useRef } from "react";
import {
  Box, Typography, Stack, Button, TextField, MenuItem, Paper, Grid,
  Collapse, Chip, IconButton, Alert, CircularProgress,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import UploadIcon from "@mui/icons-material/Upload";
import EditIcon from "@mui/icons-material/Edit";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import CloseIcon from "@mui/icons-material/Close";
import api from "../api";
import { Modal, Field, SelectField, ModalActions } from "../components/Modal";

const bloomColors = {
  REMEMBER:   { bg: "grey.100",  color: "grey.600"  },
  UNDERSTAND: { bg: "#eff6ff",   color: "#2563eb" },
  APPLY:      { bg: "#eef2ff",   color: "primary.main" },
  ANALYZE:    { bg: "#f5f3ff",   color: "#7c3aed" },
  EVALUATE:   { bg: "#fffbeb",   color: "#d97706" },
  CREATE:     { bg: "#f0fdf4",   color: "#16a34a" },
};

const bloomLevels = [
  { value: "REMEMBER", label: "Remember" },
  { value: "UNDERSTAND", label: "Understand" },
  { value: "APPLY", label: "Apply" },
  { value: "ANALYZE", label: "Analyze" },
  { value: "EVALUATE", label: "Evaluate" },
  { value: "CREATE", label: "Create" },
];

const semesterOptions = [
  { value: "1ST", label: "1st Semester" },
  { value: "2ND", label: "2nd Semester" },
  { value: "SUMMER", label: "Summer" },
];

const cloDomains = [
  { value: "KNOWLEDGE", label: "Knowledge" },
  { value: "SKILLS", label: "Skills" },
  { value: "ATTITUDE", label: "Attitude" },
];

function bloomLabel(level) {
  const found = bloomLevels.find(b => b.value === level);
  return found ? found.label : level || "";
}

function domainLabel(domain) {
  const found = cloDomains.find(d => d.value === domain);
  return found ? found.label : domain || "";
}

function emptyForm() {
  return {
    id: null,
    code: "", name: "", program: "", units: "3", desc: "",
    year: "", semester: "", versionYear: "",
    clos: [{ id: null, code: "CLO1", desc: "", bloom: "", domain: "" }],
  };
}

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [programs, setPrograms] = useState([]);

  const [filterProgram, setFilterProgram] = useState("");
  const [filterBloom, setFilterBloom] = useState("");
  const [filterYear, setFilterYear] = useState("");

  const [expandedId, setExpandedId] = useState(null);
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [originalCloIds, setOriginalCloIds] = useState([]);

  const [importStep, setImportStep] = useState("upload");
  const [importPreview, setImportPreview] = useState(null);
  const [importFile, setImportFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState("");
  const fileRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");

  const [form, setForm] = useState(emptyForm());

  function loadAll() {
    setLoading(true);
    Promise.all([api.get("courses/"), api.get("programs/")])
      .then(([coursesRes, programsRes]) => {
        setCourses(coursesRes.data);
        setPrograms(programsRes.data);
      })
      .catch(() => setError("Could not load courses. Is the API running?"))
      .finally(() => setLoading(false));
  }

  useEffect(loadAll, []);

  const versionYearOptions = useMemo(
    () => [...new Set(courses.map(c => c.version_year).filter(Boolean))].sort((a, b) => b - a),
    [courses]
  );

  const filtered = courses.filter(c => {
    if (filterProgram && c.program !== filterProgram) return false;
    if (filterBloom && !(c.clos || []).some(cl => cl.clo_bloom === filterBloom)) return false;
    if (filterYear && c.version_year !== Number(filterYear)) return false;
    return true;
  });

  function openAdd() {
    setForm(emptyForm());
    setFormError("");
    setModal("add");
  }

  function openEdit(c) {
    setSelected(c);
    setForm({
      id: c.id,
      code: c.catalog_number, name: c.course_title, program: c.program,
      units: String(c.units ?? "3"), desc: c.course_description ?? "",
      year: c.year != null ? String(c.year) : "",
      semester: c.semester ?? "",
      versionYear: c.version_year ?? "",
      clos: (c.clos || []).map(cl => ({
        id: cl.id, code: cl.clo_code, desc: cl.clo_description,
        bloom: cl.clo_bloom, domain: cl.clo_domain,
      })),
    });
    setOriginalCloIds((c.clos || []).map(cl => cl.id));
    setFormError("");
    setModal("edit");
  }

  async function saveClos(courseId) {
    const keptIds = [];
    for (const clo of form.clos) {
      const payload = {
        course: courseId,
        clo_code: clo.code,
        clo_description: clo.desc,
        clo_bloom: clo.bloom,
        clo_domain: clo.domain,
      };
      if (clo.id) {
        await api.patch(`clos/${clo.id}/`, payload);
        keptIds.push(clo.id);
      } else {
        const { data } = await api.post("clos/", payload);
        keptIds.push(data.id);
      }
    }
    const removed = originalCloIds.filter(id => !keptIds.includes(id));
    await Promise.all(removed.map(id => api.delete(`clos/${id}/`)));
  }

  async function saveAdd() {
    setSaving(true);
    setFormError("");
    try {
      const { data } = await api.post("courses/", {
        catalog_number: form.code,
        course_title: form.name,
        course_description: form.desc,
        program: form.program || null,
        units: Number(form.units) || 3,
        year: Number(form.year) || null,
        semester: form.semester,
        version_year: form.versionYear || null,
      });
      await saveClos(data.id);
      setModal(null);
      loadAll();
    } catch (err) {
      const d = err.response?.data;
      setFormError(d ? Object.values(d).flat().join(" ") : "Could not create course.");
    } finally {
      setSaving(false);
    }
  }

  async function saveEdit() {
    if (!selected) return;
    setSaving(true);
    setFormError("");
    try {
      await api.patch(`courses/${selected.id}/`, {
        catalog_number: form.code,
        course_title: form.name,
        course_description: form.desc,
        program: form.program || null,
        units: Number(form.units) || 3,
        year: Number(form.year) || null,
        semester: form.semester,
        version_year: form.versionYear || null,
      });
      await saveClos(selected.id);
      setModal(null);
      loadAll();
    } catch (err) {
      const d = err.response?.data;
      setFormError(d ? Object.values(d).flat().join(" ") : "Could not save changes.");
    } finally {
      setSaving(false);
    }
  }

  function addCLORow() {
    setForm(f => ({
      ...f,
      clos: [...f.clos, { id: null, code: `CLO${f.clos.length + 1}`, desc: "", bloom: "", domain: "" }],
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

  function openImport() {
    setImportStep("upload");
    setImportPreview(null);
    setImportFile(null);
    setImportError("");
    setModal("import");
  }

  async function handleFileSelected(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportFile(file);
    setImportError("");
    const fd = new FormData();
    fd.append("file", file);
    fd.append("confirm", "false");
    try {
      const { data } = await api.post("courses/import/", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setImportPreview(data);
      setImportStep("preview");
    } catch (err) {
      setImportError(err.response?.data?.detail || "Failed to parse file.");
    }
  }

  async function confirmImport() {
    if (!importFile) return;
    setImporting(true);
    setImportError("");
    const fd = new FormData();
    fd.append("file", importFile);
    fd.append("confirm", "true");
    try {
      await api.post("courses/import/", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setModal(null);
      loadAll();
    } catch (err) {
      setImportError(err.response?.data?.detail || "Import failed.");
    } finally {
      setImporting(false);
    }
  }

  return (
    <Box sx={{ p: 4 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={700} color="grey.800">Courses</Typography>
          <Typography variant="body2" color="grey.500" sx={{ mt: 0.5 }}>Manage courses and their CLOs</Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" color="inherit" startIcon={<UploadIcon fontSize="small" />} onClick={openImport}>
            Import
          </Button>
          <Button variant="contained" startIcon={<AddIcon fontSize="small" />} onClick={openAdd}>
            Add Course
          </Button>
        </Stack>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2.5 }} onClose={() => setError("")}>{error}</Alert>}

      <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap sx={{ mb: 2.5 }}>
        <TextField
          select
          size="small"
          value={filterProgram}
          onChange={(e) => setFilterProgram(e.target.value)}
          sx={{ minWidth: 200 }}
          SelectProps={{
            displayEmpty: true,
            renderValue: (value) =>
              value
                ? programs.find((p) => p.id === value)?.program_code
                : "All Programs",
          }}
        >
          <MenuItem value="">All Programs</MenuItem>
          {programs.map((p) => (
            <MenuItem key={p.id} value={p.id}>
              {p.program_code} – {p.program_name}
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
            renderValue: (value) => (value ? bloomLabel(value) : "All Bloom Levels"),
          }}
        >
          <MenuItem value="">All Bloom Levels</MenuItem>
          {bloomLevels.map((b) => (
            <MenuItem key={b.value} value={b.value}>
              {b.label}
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
          {versionYearOptions.map((y) => (
            <MenuItem key={y} value={y}>
              {y}
            </MenuItem>
          ))}
        </TextField>
        {(filterProgram || filterBloom || filterYear) && (
          <Button
            color="inherit"
            onClick={() => { setFilterProgram(""); setFilterBloom(""); setFilterYear(""); }}
            sx={{ color: "grey.500" }}
          >
            Clear filters
          </Button>
        )}
      </Stack>

      {loading ? (
        <Stack alignItems="center" sx={{ py: 6 }}><CircularProgress size={28} /></Stack>
      ) : (
        <Stack spacing={1.5}>
          {filtered.length === 0 && (
            <Paper elevation={0} variant="outlined" sx={{ borderRadius: 3, p: 5, textAlign: "center", color: "grey.400" }}>
              No courses match the selected filters.
            </Paper>
          )}
          {filtered.map(c => {
            const visibleCLOs = filterBloom ? (c.clos || []).filter(cl => cl.clo_bloom === filterBloom) : (c.clos || []);
            return (
              <Paper key={c.id} elevation={0} variant="outlined" sx={{ borderRadius: 3, overflow: "hidden" }}>
                <Stack direction="row" alignItems="center" spacing={2} sx={{ px: 2.5, py: 2 }}>
                  <IconButton size="small" onClick={() => setExpandedId(expandedId === c.id ? null : c.id)}>
                    {expandedId === c.id ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                  </IconButton>

                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap" useFlexGap>
                      <Typography variant="body2" fontWeight={600} color="grey.800">{c.catalog_number}</Typography>
                      <Chip label={c.course_title} size="small" sx={{ fontFamily: "monospace", bgcolor: "grey.100", color: "grey.500", fontSize: 11, height: 20 }} />
                    </Stack>
                    <Typography variant="caption" color="grey.500" sx={{ mt: 0.25, display: "block" }}>
                      {c.program_name ?? "—"} · {c.units} units · {(c.clos || []).length} CLOs
                      {c.year != null ? ` · Year ${c.year}` : ""}
                      {c.semester ? ` · ${c.semester}` : ""}
                      {c.version_year ? ` · v${c.version_year}` : ""}
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
                      {filterBloom && <Box component="span" sx={{ ml: 1, color: "primary.main", textTransform: "none" }}>· filtered: {bloomLabel(filterBloom)}</Box>}
                    </Typography>
                    <Stack spacing={1}>
                      {visibleCLOs.map(cl => {
                        const bc = bloomColors[cl.clo_bloom] ?? {};
                        return (
                          <Stack key={cl.id} direction="row" spacing={1.5} alignItems="flex-start">
                            <Chip label={cl.clo_code} size="small" sx={{ fontFamily: "monospace", fontWeight: 700, bgcolor: "#eef2ff", color: "primary.main", fontSize: 11, height: 20, mt: 0.25 }} />
                            <Typography variant="body2" color="grey.700" sx={{ flex: 1 }}>{cl.clo_description}</Typography>
                            <Chip label={domainLabel(cl.clo_domain)} size="small" sx={{ bgcolor: "grey.100", color: "grey.500", fontSize: 10.5, height: 20, mt: 0.25, flexShrink: 0 }} />
                            <Chip label={bloomLabel(cl.clo_bloom)} size="small" sx={{ bgcolor: bc.bg, color: bc.color, fontWeight: 500, fontSize: 11.5, height: 22, mt: 0.25, flexShrink: 0 }} />
                          </Stack>
                        );
                      })}
                      {visibleCLOs.length === 0 && (
                        <Typography variant="body2" color="grey.400">No CLOs match this Bloom level.</Typography>
                      )}
                    </Stack>
                    {(c.teaching_methods || []).length > 0 && (
                      <>
                        <Typography variant="caption" fontWeight={600} color="grey.400" sx={{ textTransform: "uppercase", letterSpacing: 0.5, mt: 2, mb: 1, display: "block" }}>
                          Teaching Strategies
                        </Typography>
                        <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                          {c.teaching_methods.map(tm => (
                            <Chip key={tm.id} label={tm.method_name} size="small" sx={{ bgcolor: "#e0e7ff", color: "primary.main", fontSize: 11, height: 22 }} />
                          ))}
                        </Stack>
                      </>
                    )}
                  </Box>
                </Collapse>
              </Paper>
            );
          })}
        </Stack>
      )}

      {(modal === "add" || modal === "edit") && (
        <Modal title={modal === "add" ? "Add Course" : `Edit — ${selected?.course_title}`} onClose={() => !saving && setModal(null)} wide>
          <Stack spacing={2}>
            {formError && <Alert severity="error">{formError}</Alert>}
            {/* COURSE CODE (LEFT) + COURSE NAME (RIGHT) */}
            <Grid container spacing={1.5}>
              <Grid size={3}>
                <Field
                  label="Course Code"
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
            {/* PROGRAM + YEAR + SEMESTER + UNITS */}
            <Grid container spacing={1.5}>
              <Grid size={4}>
                <SelectField
                  label="Offering Department/Program"
                  value={form.program}
                  onChange={v => setForm(f => ({ ...f, program: v }))}
                  options={programs.map(p => ({ value: p.id, label: `${p.program_code} — ${p.program_name}` }))}
                />
              </Grid>
              <Grid size={2}>
                <Field
                  label="Year"
                  value={form.year}
                  onChange={v => setForm(f => ({ ...f, year: v }))}
                  type="number"
                  placeholder="1"
                />
              </Grid>
              <Grid size={3}>
                <SelectField
                  label="Semester"
                  value={form.semester}
                  onChange={v => setForm(f => ({ ...f, semester: v }))}
                  options={semesterOptions}
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
            <Grid container spacing={1.5}>
              <Grid size={12}>
                <Field
                  label="Version Year"
                  value={form.versionYear}
                  onChange={v => setForm(f => ({ ...f, versionYear: v }))}
                  type="number"
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
              <Stack sx={{ maxHeight: 260, overflowY: "auto", pr: 0.5 }}>
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
                      {bloomLevels.map(b => <MenuItem key={b.value} value={b.value}>{b.label}</MenuItem>)}
                    </TextField>
                    <TextField
                      select
                      value={cl.domain}
                      onChange={e => updateCLO(i, "domain", e.target.value)}
                      label="KSA"
                      size="small"
                      sx={{ width: 120 }}
                    >
                      {cloDomains.map(d => <MenuItem key={d.value} value={d.value}>{d.label}</MenuItem>)}
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
            confirmLabel={saving ? "Saving…" : modal === "add" ? "Add Course" : "Save Changes"}
            disabled={saving}
          />
        </Modal>
      )}

      {modal === "import" && (
        <Modal title="Import Course Data" onClose={() => !importing && setModal(null)}>
          {importStep === "upload" ? (
            <Stack spacing={2}>
              {importError && <Alert severity="error">{importError}</Alert>}
              <Box
                onClick={() => fileRef.current?.click()}
                sx={{ border: "2px dashed", borderColor: "grey.200", borderRadius: 3, p: 4, textAlign: "center", cursor: "pointer", "&:hover": { borderColor: "primary.light", bgcolor: "#eef2ff44" } }}
              >
                <UploadIcon sx={{ fontSize: 28, color: "grey.300", mb: 1 }} />
                <Typography variant="body2" fontWeight={500} color="grey.600">Click to upload an Excel file</Typography>
                <Typography variant="caption" color="grey.400" sx={{ mt: 0.5, display: "block" }}>Supported: .xlsx, .xls</Typography>
              </Box>
              <input ref={fileRef} type="file" accept=".xlsx,.xls" hidden onChange={handleFileSelected} />
              <Typography variant="caption" color="grey.400" align="center" sx={{ display: "block" }}>
                Columns: catalog_number, course_title, course_description, program_code, units, year, semester,
                version_year, clo_code, clo_description, clo_bloom, clo_domain
              </Typography>
            </Stack>
          ) : (
            <Stack spacing={2}>
              {importError && <Alert severity="error">{importError}</Alert>}
              <Typography variant="body2" color="grey.600">
                {importPreview?.preview?.length ?? 0} course(s) detected across {importPreview?.row_count ?? 0} row(s).
              </Typography>
              <Stack spacing={1} sx={{ maxHeight: 260, overflowY: "auto" }}>
                {(importPreview?.preview ?? []).map((course, i) => (
                  <Paper key={i} variant="outlined" sx={{ borderRadius: 3, p: 2, bgcolor: "grey.50" }}>
                    <Stack spacing={0.5}>
                      <Typography variant="body2"><Box component="span" color="grey.400">Course:</Box> <b>{course.course_title}</b></Typography>
                      <Typography variant="body2"><Box component="span" color="grey.400">Code:</Box> {course.catalog_number}</Typography>
                      <Typography variant="body2"><Box component="span" color="grey.400">Program:</Box> {course.program_code} · {course.units} units</Typography>
                      <Typography variant="body2"><Box component="span" color="grey.400">CLOs:</Box> {course.clos?.length ?? 0} detected</Typography>
                    </Stack>
                  </Paper>
                ))}
              </Stack>
              {(importPreview?.errors?.length ?? 0) > 0 && (
                <Alert severity="warning">
                  {importPreview.errors.length} row(s) had issues: {importPreview.errors.join(" · ")}
                </Alert>
              )}
              <Typography variant="body2" color="grey.600">Does this look correct? Confirm to save these courses.</Typography>
              <ModalActions
                onCancel={() => setImportStep("upload")}
                onConfirm={confirmImport}
                confirmLabel={importing ? "Importing…" : "Confirm Import"}
                disabled={importing}
              />
            </Stack>
          )}
        </Modal>
      )}
    </Box>
  );
}