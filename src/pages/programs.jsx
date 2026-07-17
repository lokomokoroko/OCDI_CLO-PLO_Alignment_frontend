import { useState, useEffect, useRef } from "react";
import {
  Box, Typography, Stack, Button, TextField, MenuItem, Paper, Grid,
  Collapse, Chip, IconButton, Checkbox, FormControlLabel, Alert, CircularProgress,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import UploadIcon from "@mui/icons-material/Upload";
import DownloadIcon from "@mui/icons-material/Download";
import EditIcon from "@mui/icons-material/Edit";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import CloseIcon from "@mui/icons-material/Close";
import api from "../api";
import { Modal, Field, SelectField, ModalActions } from "../components/Modal";

const STATUS_COLORS = {
  DRAFT: { bg: "grey.100", color: "grey.600" },
  PENDING_CHAIR: { bg: "#fffbeb", color: "#d97706" },
  PENDING_OCDI: { bg: "#fffbeb", color: "#d97706" },
  APPROVED: { bg: "#f0fdf4", color: "#16a34a" },
  REJECTED: { bg: "#fef2f2", color: "#dc2626" },
};

function emptyForm() {
  return {
    id: null,
    code: "", name: "", deptId: "", schoolCode: "", desc: "", versionYear: "",
    plos: [{ id: null, code: "PLO1", desc: "", keyword: "", fourC: [] }],
  };
}

export default function Programs() {
  const [programs, setPrograms] = useState([]);
  const [schools, setSchools] = useState([]);
  const [depts, setDepts] = useState([]);
  const [modalDepts, setModalDepts] = useState([]);

  const [filterSchool, setFilterSchool] = useState("");
  const [filterDept, setFilterDept] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [originalPloIds, setOriginalPloIds] = useState([]);

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

  const fourCOptions = [
    { value: "CONSCIENCE", label: "Conscience" },
    { value: "COMPETENCE", label: "Competence" },
    { value: "COMPASSION", label: "Compassion" },
    { value: "COMMITMENT", label: "Commitment" },
  ];

  // Schools + departments load once (used for both filters and the form).
  useEffect(() => {
    api.get("schools/").then(({ data }) => setSchools(data)).catch(() => {});
    api.get("depts/").then(({ data }) => setDepts(data)).catch(() => {});
  }, []);

  function loadPrograms() {
    setLoading(true);
    const params = {};
    if (filterSchool) params.school = filterSchool;
    if (filterDept) params.dept = filterDept;
    api.get("programs/", { params })
      .then(({ data }) => setPrograms(data))
      .catch(() => setError("Could not load programs."))
      .finally(() => setLoading(false));
  }

  useEffect(loadPrograms, [filterSchool, filterDept]);

  // Departments scoped to the modal's selected school.
  useEffect(() => {
    if (!modal) return;
    const params = form.schoolCode ? { school: form.schoolCode } : {};
    api.get("depts/", { params }).then(({ data }) => setModalDepts(data)).catch(() => {});
  }, [modal, form.schoolCode]);

  function openAdd() {
    setForm(emptyForm());
    setFormError("");
    setModal("add");
  }

  function openEdit(p) {
    setSelected(p);
    const dept = depts.find(d => d.id === p.dept);
    setForm({
      id: p.id,
      schoolCode: p.school_code ?? "",
      code: p.program_code,
      name: p.program_name,
      deptId: p.dept ?? "",
      desc: p.description ?? "",
      versionYear: p.version_year ?? "",
      plos: (p.plos || []).map(pl => ({
        id: pl.id, code: pl.plo_code, desc: pl.plo_description,
        keyword: pl.category ?? "", fourC: Array.isArray(pl.four_cs) ? pl.four_cs : []
      })),
    });
    setOriginalPloIds((p.plos || []).map(pl => pl.id));
    setFormError("");
    setModal("edit");
  }

  async function handleExport(p) {
    try {
      const res = await api.get(`programs/${p.program_code}/export/`, { responseType: "blob" });
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `${p.program_code}_PLOs.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError(`Could not export ${p.program_code}.`);
    }
  }

  async function savePlos(programId) {
  const keptIds = [];

  for (const plo of form.plos) {

    const payload = {
      program: programId,
      plo_code: plo.code,
      plo_description: plo.desc,
      category: plo.keyword,
      four_cs: plo.fourC,
    };

    console.log("SENDING PLO:", payload);

    try {
      if (plo.id) {
        const response = await api.patch(
          `plos/${plo.id}/`,
          payload
        );

        console.log("PATCH SUCCESS:", response.data);

        keptIds.push(plo.id);

      } else {

        const response = await api.post(
          "plos/",
          payload
        );

        console.log("POST SUCCESS:", response.data);

        keptIds.push(response.data.id);
      }

    } catch (err) {

      console.error("========== PLO ERROR ==========");
      console.error("STATUS:", err.response?.status);
      console.error("RESPONSE DATA:", err.response?.data);
      console.error("SENT PAYLOAD:", payload);
      console.error("FULL ERROR:", err);

      throw err;
    }
  }

  const removed = originalPloIds.filter(
    id => !keptIds.includes(id)
  );

  await Promise.all(
    removed.map(id => api.delete(`plos/${id}/`))
  );
}
  
  async function saveAdd() {
    setSaving(true);
    setFormError("");
    try {
      const { data } = await api.post("programs/", {
        program_code: form.code,
        program_name: form.name,
        description: form.desc,
        schoolCode: dept?.school_code ?? "",
        dept: form.deptId || null,
        version_year: form.versionYear || null,
      });
      await savePlos(data.id);
      setModal(null);
      loadPrograms();
    } catch (err) {
      const d = err.response?.data;
      setFormError(d ? Object.values(d).flat().join(" ") : "Could not create program.");
    } finally {
      setSaving(false);
    }
  }

  async function saveEdit() {
    if (!selected) return;
    setSaving(true);
    setFormError("");
    try {
      await api.patch(`programs/${selected.id}/`, {
        program_code: form.code,
        program_name: form.name,
        description: form.desc,
        dept: form.deptId || null,
        version_year: form.versionYear || null,
      });
      await savePlos(selected.id);
      setModal(null);
      loadPrograms();
    } catch (err) {
      const d = err.response?.data;
      setFormError(d ? Object.values(d).flat().join(" ") : "Could not save changes.");
    } finally {
      setSaving(false);
    }
  }

  function addPLORow() {
    setForm(f => ({
      ...f,
      plos: [...f.plos, { id: null, code: `PLO${f.plos.length + 1}`, desc: "", keyword: "", fourC: [] }],
    }));
  }

  function removePLORow(i) {
    setForm(f => ({ ...f, plos: f.plos.filter((_, idx) => idx !== i) }));
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
      const { data } = await api.post("programs/import/", fd, {
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
      await api.post("programs/import/", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setModal(null);
      loadPrograms();
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
          <Typography variant="h5" fontWeight={700} color="grey.800">Programs</Typography>
          <Typography variant="body2" color="grey.500" sx={{ mt: 0.5 }}>
            Manage academic programs and their PLOs
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined" color="inherit" startIcon={<UploadIcon fontSize="small" />}
            onClick={openImport}
          >
            Import
          </Button>
          <Button variant="contained" startIcon={<AddIcon fontSize="small" />} onClick={openAdd}>
            Add Program
          </Button>
        </Stack>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2.5 }} onClose={() => setError("")}>{error}</Alert>}

      <Stack direction="row" spacing={1.5} sx={{ mb: 2.5 }}>
        <TextField
          select
          size="small"
          value={filterSchool}
          onChange={(e) => { setFilterSchool(e.target.value); setFilterDept(""); }}
          sx={{ minWidth: 160 }}
          SelectProps={{ displayEmpty: true }}
        >
          <MenuItem value="">All Schools</MenuItem>
          {schools.map((s) => (
            <MenuItem key={s.id} value={s.school_code}>
              {s.school_code}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          size="small"
          value={filterDept}
          onChange={(e) => setFilterDept(e.target.value)}
          sx={{ minWidth: 260 }}
          SelectProps={{ displayEmpty: true }}
        >
          <MenuItem value="">All Departments</MenuItem>
          {depts
            .filter(d => !filterSchool || d.school_code === filterSchool || d.school_name)
            .map((d) => (
              <MenuItem key={d.id} value={d.dept_code}>
                {d.dept_name}
              </MenuItem>
            ))}
        </TextField>
      </Stack>

      {loading ? (
        <Stack alignItems="center" sx={{ py: 6 }}><CircularProgress size={28} /></Stack>
      ) : (
        <Stack spacing={1.5}>
          {programs.length === 0 && (
            <Paper elevation={0} variant="outlined" sx={{ borderRadius: 3, p: 5, textAlign: "center", color: "grey.400" }}>
              No programs match the selected filters.
            </Paper>
          )}
          {programs.map(p => {
            const sc = STATUS_COLORS[p.status] ?? {};
            return (
              <Paper key={p.id} elevation={0} variant="outlined" sx={{ borderRadius: 3, overflow: "hidden" }}>
                <Stack direction="row" alignItems="center" spacing={2} sx={{ px: 2.5, py: 2 }}>
                  <IconButton size="small" onClick={() => setExpandedId(expandedId === p.id ? null : p.id)}>
                    {expandedId === p.id ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                  </IconButton>

                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap" useFlexGap>
                      <Typography variant="body2" fontWeight={600} color="grey.800">{p.program_code}</Typography>
                      <Chip label={p.program_name} size="small" sx={{ fontFamily: "monospace", bgcolor: "grey.100", color: "grey.500", fontSize: 11, height: 20 }} />
                      <Chip label={p.status} size="small" sx={{ bgcolor: sc.bg, color: sc.color, fontWeight: 600, fontSize: 10, height: 18 }} />
                    </Stack>
                    <Typography variant="caption" color="grey.500" sx={{ mt: 0.25, display: "block" }}>
                      {p.school_name} · {p.dept_name} · v{p.version_year ?? "—"} · {(p.plos || []).length} PLOs · {p.course_count ?? 0} courses
                    </Typography>
                  </Box>

                  <Stack direction="row" spacing={0.5}>
                    <ActionBtn icon={EditIcon} label="Edit" onClick={() => openEdit(p)} />
                    <ActionBtn icon={DownloadIcon} label="Export" onClick={() => handleExport(p)} />
                  </Stack>
                </Stack>

                <Collapse in={expandedId === p.id}>
                  <Box sx={{ borderTop: "1px solid", borderColor: "grey.100", px: 2.5, py: 2, bgcolor: "grey.50" }}>
                    <Typography variant="caption" fontWeight={600} color="grey.400" sx={{ textTransform: "uppercase", letterSpacing: 0.5, mb: 1.5, display: "block" }}>
                      Program Learning Outcomes
                    </Typography>
                    <Stack spacing={1.5}>
                      {(p.plos || []).map(plo => (
                        <Stack key={plo.id} direction="row" spacing={1.5} alignItems="flex-start">
                          <Chip
                            label={plo.plo_code}
                            size="small"
                            sx={{ fontFamily: "monospace", fontWeight: 700, bgcolor: "#eef2ff", color: "primary.main", fontSize: 11, height: 20, mt: 0.25 }}
                          />
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            {plo.category && (
                              <Chip label={plo.category} size="small" sx={{ bgcolor: "grey.100", color: "grey.500", fontSize: 10.5, height: 18, mb: 0.5 }} />
                            )}
                            <Typography variant="body2" color="grey.700">{plo.plo_description}</Typography>
                          </Box>
                          <Stack alignItems="flex-end" spacing={0.25} flexShrink={0}>
                            {(plo.four_cs || []).map(c => (
                              <Typography key={c} variant="caption" fontStyle="italic" color="grey.400">{c}</Typography>
                            ))}
                          </Stack>
                        </Stack>
                      ))}
                      {(p.plos || []).length === 0 && (
                        <Typography variant="body2" color="grey.400">No PLOs defined yet.</Typography>
                      )}
                    </Stack>
                  </Box>
                </Collapse>
              </Paper>
            );
          })}
        </Stack>
      )}

      {(modal === "add" || modal === "edit") && (
        <Modal
          title={modal === "add" ? "Add Program" : `Edit — ${selected?.program_name}`}
          onClose={() => !saving && setModal(null)}
          wide
        >
          <Stack spacing={2.5}>
            {formError && <Alert severity="error">{formError}</Alert>}

            {/* PROGRAM NAME + CODE */}
            <Grid container spacing={1.5}>
              <Grid size={3}>
                <Field
                  label="Program Code"
                  value={form.code}
                  onChange={v => setForm(f => ({ ...f, code: v }))}
                />
              </Grid>
              <Grid size={9}>
                <Field
                  label="Program Title"
                  value={form.name}
                  onChange={v => setForm(f => ({ ...f, name: v }))}
                />
              </Grid>
            </Grid>

            {/* SCHOOL + DEPARTMENT + VYEAR */}
            <Grid container spacing={1.5}>
              <Grid size={4}>
                <SelectField
                  label="School"
                  value={form.schoolCode}
                  onChange={v => setForm(f => ({ ...f, schoolCode: v, deptId: "" }))}
                  options={schools.map(s => ({ value: s.school_code, label: `${s.school_code} — ${s.school_name}` }))}
                />
              </Grid>

              <Grid size={4}>
                <SelectField
                  label="Department"
                  value={form.deptId}
                  onChange={v => setForm(f => ({ ...f, deptId: v }))}
                  options={modalDepts.map(d => ({ value: d.id, label: d.dept_name }))}
                />
              </Grid>
              <Grid size={4}>
                <TextField
                  label="Version Year"
                  fullWidth
                  type="number"
                  value={form.versionYear}
                  onChange={(e) => setForm(f => ({ ...f, versionYear: e.target.value }))}
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
                    sx={{ p: 1.5, borderRadius: 2 }}
                  >
                    <Stack direction="row" spacing={1.5} alignItems="flex-start">
                      {/* PLO CODE */}
                      <Box sx={{ width: 70, flexShrink: 0 }}>
                        <TextField
                          value={plo.code}
                          size="small"
                          fullWidth
                          onChange={e =>
                            setForm(f => {
                              const plos = [...f.plos];
                              plos[i] = { ...plos[i], code: e.target.value };
                              return { ...f, plos };
                            })
                          }
                          placeholder="PLO1"
                        />
                      </Box>

                      {/* DESCRIPTION + KEYWORD  */}
                      <Stack spacing={1} sx={{ flex: 1, minWidth: 0 }}>
                        <TextField
                          value={plo.desc}
                          size="small"
                          multiline
                          rows={2}
                          fullWidth
                          label="PLO description"
                          onChange={e =>
                            setForm(f => {
                              const plos = [...f.plos];
                              plos[i] = { ...plos[i], desc: e.target.value };
                              return { ...f, plos };
                            })
                          }
                        />
                        <TextField
                          value={plo.keyword ?? ""}
                          size="small"
                          fullWidth
                          label="Main keyword of PLO"
                          onChange={e =>
                            setForm(f => {
                              const plos = [...f.plos];
                              plos[i] = { ...plos[i], keyword: e.target.value };
                              return { ...f, plos };
                            })
                          }
                        />
                      </Stack>

                      {/* 4Cs */}
                      <Box sx={{ p: 1, width: 150, flexShrink: 0 }}>
                        {fourCOptions.map(c => {
                          const current = Array.isArray(plo.fourC) ? plo.fourC : [];
                          const checked = current.includes(c.value);
                          return (
                            <FormControlLabel
                              key={c.value}
                              sx={{
                                display: "block",
                                m: 0,
                                "& .MuiFormControlLabel-label": { fontSize: 11 },
                              }}
                              control={
                                <Checkbox
                                  size="small"
                                  checked={checked}
                                  sx={{ p: 0.25 }}
                                  onChange={e =>
                                    setForm(f => {
                                      const plos = [...f.plos];
                                      const cur = plos[i].fourC ?? [];
                                      plos[i] = {
                                        ...plos[i],
                                        fourC: e.target.checked
                                          ? [...cur, c.value]
                                          : cur.filter(x => x !== c.value),
                                      };
                                      return { ...f, plos };
                                    })
                                  }
                                />
                              }
                              label={c.label}
                            />
                          );
                        })}
                      </Box>

                      {/* REMOVE */}
                      {form.plos.length > 1 && (
                        <IconButton
                          size="small"
                          onClick={() => removePLORow(i)}
                          sx={{ color: "error.main" }}
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
            confirmLabel={saving ? "Saving…" : modal === "add" ? "Add Program" : "Save Changes"}
            disabled={saving}
          />
        </Modal>
      )}

      {modal === "import" && (
        <Modal title="Import Program Data" onClose={() => !importing && setModal(null)}>
          {importStep === "upload" ? (
            <Stack spacing={2}>
              {importError && <Alert severity="error">{importError}</Alert>}
              <Box
                onClick={() => fileRef.current?.click()}
                sx={{
                  border: "2px dashed", borderColor: "grey.200", borderRadius: 3, p: 4, textAlign: "center", cursor: "pointer",
                  "&:hover": { borderColor: "primary.light", bgcolor: "#eef2ff44" },
                }}
              >
                <UploadIcon sx={{ fontSize: 28, color: "grey.300", mb: 1 }} />
                <Typography variant="body2" fontWeight={500} color="grey.600">Click to upload an Excel file</Typography>
                <Typography variant="caption" color="grey.400" sx={{ mt: 0.5, display: "block" }}>Supported: .xlsx, .xls</Typography>
              </Box>
              <input ref={fileRef} type="file" accept=".xlsx,.xls" hidden onChange={handleFileSelected} />
              <Typography variant="caption" color="grey.400" align="center" sx={{ display: "block" }}>
                Columns: program_code, program_name, description, dept_code, plo_code, plo_description, plo_category, plo_four_cs
              </Typography>
            </Stack>
          ) : (
            <Stack spacing={2}>
              {importError && <Alert severity="error">{importError}</Alert>}
              <Typography variant="body2" color="grey.600">
                {importPreview?.preview?.length ?? 0} program(s) detected across {importPreview?.row_count ?? 0} row(s).
              </Typography>
              <Stack spacing={1} sx={{ maxHeight: 260, overflowY: "auto" }}>
                {(importPreview?.preview ?? []).map((prog, i) => (
                  <Paper key={i} variant="outlined" sx={{ borderRadius: 3, p: 2, bgcolor: "grey.50" }}>
                    <Stack spacing={0.5}>
                      <Typography variant="body2"><Box component="span" color="grey.400">Program:</Box> <b>{prog.program_name}</b></Typography>
                      <Typography variant="body2"><Box component="span" color="grey.400">Code:</Box> {prog.program_code}</Typography>
                      <Typography variant="body2"><Box component="span" color="grey.400">Department:</Box> {prog.dept_code}</Typography>
                      <Typography variant="body2"><Box component="span" color="grey.400">PLOs:</Box> {prog.plos?.length ?? 0} detected</Typography>
                    </Stack>
                  </Paper>
                ))}
              </Stack>
              {(importPreview?.errors?.length ?? 0) > 0 && (
                <Alert severity="warning">
                  {importPreview.errors.length} row(s) had issues: {importPreview.errors.join(" · ")}
                </Alert>
              )}
              <Typography variant="body2" color="grey.600">Does this look correct? Confirm to save these programs.</Typography>
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

function ActionBtn({ icon: Icon, label, onClick }) {
  return (
    <IconButton size="small" onClick={onClick} title={label} sx={{ color: "grey.400", "&:hover": { color: "grey.700", bgcolor: "grey.100" } }}>
      <Icon fontSize="small" />
    </IconButton>
  );
}