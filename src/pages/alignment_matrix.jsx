import { useState, useRef } from "react";
import {
  Box, Typography, Stack, Button, Paper, Menu, MenuItem, IconButton,
  Table, TableHead, TableBody, TableRow, TableCell, Chip, Tooltip,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import UploadIcon from "@mui/icons-material/Upload";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import HubIcon from "@mui/icons-material/Hub";
import { programs as programsData, courses as coursesData, departments } from "../data";
import { Modal } from "../components/Modal";

export default function Alignment() {
  const [selectedDept, setSelectedDept] = useState(departments[0]);
  const [deptAnchor, setDeptAnchor] = useState(null);

  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState("program");
  const [wizardProgram, setWizardProgram] = useState("");
  const [wizardCourse, setWizardCourse] = useState("");

  const [entries, setEntries] = useState([]);
  const [alignState, setAlignState] = useState([]);

  const [importOpen, setImportOpen] = useState(false);
  const [importStep, setImportStep] = useState("upload");
  const fileRef = useRef(null);

  const deptPrograms = programsData.filter(p => p.dept === selectedDept);
  const wizardCourses = coursesData.filter(c => c.program === wizardProgram);

  function openWizard() {
    setWizardProgram("");
    setWizardCourse("");
    setWizardStep("program");
    setWizardOpen(true);
  }

  function wizardNext() {
    if (wizardStep === "program" && wizardProgram) setWizardStep("course");
  }

  function wizardConfirm() {
    if (!wizardProgram || !wizardCourse) return;
    const already = entries.some(e => e.programCode === wizardProgram && e.courseCode === wizardCourse);
    if (!already) {
      setEntries(prev => [...prev, { programCode: wizardProgram, courseCode: wizardCourse }]);
    }
    setWizardOpen(false);
  }

  function removeEntry(programCode, courseCode) {
    setEntries(prev => prev.filter(e => !(e.programCode === programCode && e.courseCode === courseCode)));
  }

  function isAligned(courseCode, cloCode, ploCode) {
    return alignState.some(a => a.courseCode === courseCode && a.cloCode === cloCode && a.ploCode === ploCode);
  }

  function toggleAlignment(courseCode, cloCode, ploCode) {
    setAlignState(prev => {
      const exists = prev.some(a => a.courseCode === courseCode && a.cloCode === cloCode && a.ploCode === ploCode);
      if (exists) return prev.filter(a => !(a.courseCode === courseCode && a.cloCode === cloCode && a.ploCode === ploCode));
      return [...prev, { courseCode, cloCode, ploCode }];
    });
  }

  function changeDept(d) {
    setSelectedDept(d);
    setEntries([]);
    setDeptAnchor(null);
  }

  return (
    <Box sx={{ p: 4 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={700} color="grey.800">Alignment Matrix</Typography>
          <Typography variant="body2" color="grey.500" sx={{ mt: 0.5 }}>Map CLO to PLO alignment</Typography>
        </Box>

        <Stack direction="row" spacing={1.5}>
          <Button variant="outlined" color="inherit" startIcon={<UploadIcon fontSize="small" />} onClick={() => { setImportStep("upload"); setImportOpen(true); }}>
            Import
          </Button>
          <Button
            variant="outlined" color="inherit" onClick={e => setDeptAnchor(e.currentTarget)}
            endIcon={<ExpandMoreIcon fontSize="small" />}
          >
            {selectedDept}
          </Button>
          <Menu anchorEl={deptAnchor} open={!!deptAnchor} onClose={() => setDeptAnchor(null)}>
            {departments.map(d => (
              <MenuItem key={d} selected={d === selectedDept} onClick={() => changeDept(d)}>{d}</MenuItem>
            ))}
          </Menu>
        </Stack>
      </Stack>

      {entries.length === 0 ? (
        <Paper elevation={0} variant="outlined" sx={{ borderRadius: 3, p: 8, display: "flex", flexDirection: "column", alignItems: "center", gap: 2, textAlign: "center" }}>
          <Box sx={{ width: 56, height: 56, borderRadius: 3, bgcolor: "#eef2ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <HubIcon sx={{ fontSize: 24, color: "#a5b4fc" }} />
          </Box>
          <Box>
            <Typography fontWeight={600} color="grey.700">No alignments yet</Typography>
            <Typography variant="body2" color="grey.400" sx={{ mt: 0.5 }}>
              Select a program and course to start building the CLO–PLO matrix.
            </Typography>
          </Box>
          <Button variant="contained" startIcon={<AddIcon fontSize="small" />} onClick={openWizard} sx={{ mt: 0.5 }}>
            Add Alignment
          </Button>
        </Paper>
      ) : (
        <Stack spacing={3}>
          {entries.map(({ programCode, courseCode }) => {
            const program = programsData.find(p => p.code === programCode);
            const course = coursesData.find(c => c.code === courseCode);
            if (!program || !course) return null;
            const plos = program.plos;
            return (
              <Paper key={`${programCode}-${courseCode}`} elevation={0} variant="outlined" sx={{ borderRadius: 3, overflow: "hidden" }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 2.5, py: 1.5, borderBottom: "1px solid", borderColor: "grey.100", bgcolor: "grey.50" }}>
                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Chip label={course.code} size="small" sx={{ fontFamily: "monospace", fontWeight: 700, bgcolor: "#eef2ff", color: "primary.main", fontSize: 11, height: 20 }} />
                    <Typography variant="body2" fontWeight={600} color="grey.800">{course.name}</Typography>
                    <Typography variant="caption" color="grey.400">·</Typography>
                    <Typography variant="caption" color="grey.500">{program.name}</Typography>
                  </Stack>
                  <IconButton size="small" onClick={() => removeEntry(programCode, courseCode)} title="Remove" sx={{ color: "grey.300", "&:hover": { color: "error.light" } }}>
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Stack>

                <Box sx={{ overflowX: "auto" }}>
                  <Table size="small" sx={{ minWidth: 600 }}>
                    <TableHead>
                      <TableRow sx={{ bgcolor: "grey.50" }}>
                        <TableCell sx={{ minWidth: 260, fontSize: 11, fontWeight: 600, color: "grey.500", textTransform: "uppercase", letterSpacing: 0.5 }}>
                          CLO
                        </TableCell>
                        {plos.map(plo => (
                          <TableCell key={plo.code} align="center" sx={{ minWidth: 72, fontSize: 11, fontWeight: 600, color: "grey.500", textTransform: "uppercase", letterSpacing: 0.5 }}>
                            <Tooltip title={plo.desc}>
                              <Box>
                                {plo.code}
                                {plo.keyword && (
                                  <Typography variant="caption" sx={{ display: "block", fontWeight: 400, textTransform: "none", color: "grey.400", fontSize: 9, mt: 0.25 }}>
                                    {plo.keyword}
                                  </Typography>
                                )}
                              </Box>
                            </Tooltip>
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {course.clos.map(clo => (
                        <TableRow key={clo.code} hover>
                          <TableCell>
                            <Stack direction="row" spacing={1} alignItems="flex-start">
                              <Chip label={clo.code} size="small" sx={{ fontFamily: "monospace", fontWeight: 700, bgcolor: "#eef2ff", color: "primary.main", fontSize: 10, height: 18, mt: 0.25 }} />
                              <Typography variant="caption" color="grey.600" sx={{ lineHeight: 1.4 }}>{clo.desc}</Typography>
                            </Stack>
                          </TableCell>
                          {plos.map(plo => {
                            const aligned = isAligned(course.code, clo.code, plo.code);
                            return (
                              <TableCell key={plo.code} align="center">
                                <IconButton
                                  size="small"
                                  onClick={() => toggleAlignment(course.code, clo.code, plo.code)}
                                  title={aligned ? "Remove alignment" : "Add alignment"}
                                  sx={{
                                    width: 28, height: 28,
                                    bgcolor: aligned ? "#e0e7ff" : "grey.100",
                                    "&:hover": { bgcolor: aligned ? "#c7d2fe" : "grey.200" },
                                  }}
                                >
                                  {aligned
                                    ? <CheckIcon sx={{ fontSize: 14, color: "primary.main" }} />
                                    : <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "grey.300" }} />
                                  }
                                </IconButton>
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              </Paper>
            );
          })}

          <Button
            fullWidth onClick={openWizard} color="inherit"
            startIcon={<AddIcon fontSize="small" />}
            sx={{
              border: "2px dashed", borderColor: "grey.200", borderRadius: 3, py: 2, color: "grey.400",
              "&:hover": { borderColor: "primary.light", color: "primary.main", bgcolor: "#eef2ff44" },
            }}
          >
            Add Another Course
          </Button>
        </Stack>
      )}

      {wizardOpen && (
        <Modal title="Add Alignment" onClose={() => setWizardOpen(false)}>
          {wizardStep === "program" ? (
            <Stack spacing={2}>
              <Typography variant="body2" color="grey.600">
                Select a program under <Box component="span" fontWeight={600} color="grey.800">{selectedDept}</Box>:
              </Typography>
              <Stack spacing={1}>
                {deptPrograms.length === 0 ? (
                  <Typography variant="body2" color="grey.400" align="center" sx={{ py: 2 }}>No programs found for this department.</Typography>
                ) : (
                  deptPrograms.map(p => (
                    <Paper
                      key={p.code}
                      variant="outlined"
                      onClick={() => setWizardProgram(p.code)}
                      sx={{
                        p: 1.5, borderRadius: 2, cursor: "pointer",
                        borderColor: wizardProgram === p.code ? "primary.main" : "grey.200",
                        bgcolor: wizardProgram === p.code ? "#eef2ff" : "white",
                        "&:hover": { bgcolor: wizardProgram === p.code ? "#eef2ff" : "grey.50" },
                      }}
                    >
                      <Typography variant="body2" fontWeight={500} color={wizardProgram === p.code ? "primary.main" : "grey.700"}>{p.name}</Typography>
                      <Typography variant="caption" color="grey.400">{p.code} · {p.plos.length} PLOs</Typography>
                    </Paper>
                  ))
                )}
              </Stack>
              <Stack direction="row" justifyContent="flex-end" spacing={1}>
                <Button onClick={() => setWizardOpen(false)} color="inherit" variant="outlined">Cancel</Button>
                <Button onClick={wizardNext} disabled={!wizardProgram} variant="contained">Next: Select Course</Button>
              </Stack>
            </Stack>
          ) : (
            <Stack spacing={2}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Button size="small" onClick={() => setWizardStep("program")} sx={{ fontSize: 12 }}>← Back</Button>
                <Typography variant="body2" color="grey.600">
                  Select a course from <Box component="span" fontWeight={600} color="grey.800">{programsData.find(p => p.code === wizardProgram)?.name}</Box>:
                </Typography>
              </Stack>
              <Stack spacing={1} sx={{ maxHeight: 260, overflowY: "auto", pr: 0.5 }}>
                {wizardCourses.length === 0 ? (
                  <Typography variant="body2" color="grey.400" align="center" sx={{ py: 2 }}>No courses found for this program.</Typography>
                ) : (
                  wizardCourses.map(c => {
                    const alreadyAdded = entries.some(e => e.programCode === wizardProgram && e.courseCode === c.code);
                    return (
                      <Paper
                        key={c.code}
                        variant="outlined"
                        onClick={() => !alreadyAdded && setWizardCourse(c.code)}
                        sx={{
                          p: 1.5, borderRadius: 2,
                          cursor: alreadyAdded ? "not-allowed" : "pointer",
                          borderColor: alreadyAdded ? "grey.100" : wizardCourse === c.code ? "primary.main" : "grey.200",
                          bgcolor: alreadyAdded ? "grey.50" : wizardCourse === c.code ? "#eef2ff" : "white",
                          color: alreadyAdded ? "grey.300" : "inherit",
                        }}
                      >
                        <Typography variant="body2" fontWeight={500} color={alreadyAdded ? "grey.300" : wizardCourse === c.code ? "primary.main" : "grey.700"}>
                          {c.name} {alreadyAdded && <Typography component="span" variant="caption" color="grey.300"> (already added)</Typography>}
                        </Typography>
                        <Typography variant="caption" color="grey.400">{c.code} · {c.clos.length} CLOs</Typography>
                      </Paper>
                    );
                  })
                )}
              </Stack>
              <Stack direction="row" justifyContent="flex-end" spacing={1}>
                <Button onClick={() => setWizardOpen(false)} color="inherit" variant="outlined">Cancel</Button>
                <Button onClick={wizardConfirm} disabled={!wizardCourse} variant="contained">Add to Matrix</Button>
              </Stack>
            </Stack>
          )}
        </Modal>
      )}

      {importOpen && (
        <Modal title="Import Alignment Data" onClose={() => setImportOpen(false)}>
          {importStep === "upload" ? (
            <Stack spacing={2}>
              <Box
                onClick={() => fileRef.current?.click()}
                sx={{ border: "2px dashed", borderColor: "grey.200", borderRadius: 3, p: 4, textAlign: "center", cursor: "pointer", "&:hover": { borderColor: "primary.light", bgcolor: "#eef2ff44" } }}
              >
                <UploadIcon sx={{ fontSize: 28, color: "grey.300", mb: 1 }} />
                <Typography variant="body2" fontWeight={500} color="grey.600">Click to upload an Excel file</Typography>
                <Typography variant="caption" color="grey.400" sx={{ mt: 0.5, display: "block" }}>Supported: .xlsx, .xls</Typography>
              </Box>
              <input ref={fileRef} type="file" accept=".xlsx,.xls" hidden onChange={() => setImportStep("preview")} />
              <Typography variant="caption" color="grey.400" align="center" sx={{ display: "block" }}>
                File must include columns: Course Code, CLO Code, PLO Code
              </Typography>
            </Stack>
          ) : (
            <Stack spacing={2}>
              <Paper variant="outlined" sx={{ borderRadius: 3, p: 2, bgcolor: "grey.50" }}>
                <Stack spacing={0.5}>
                  <Typography variant="body2"><Box component="span" color="grey.400">Rows detected:</Box> <b>12 alignments</b></Typography>
                  <Typography variant="body2"><Box component="span" color="grey.400">Courses:</Box> CS301, CS302, CS303</Typography>
                  <Typography variant="body2"><Box component="span" color="grey.400">PLOs referenced:</Box> PLO1 – PLO6</Typography>
                </Stack>
              </Paper>
              <Typography variant="body2" color="grey.600">Does this look correct? Confirm to apply these alignments.</Typography>
              <Stack direction="row" justifyContent="flex-end" spacing={1}>
                <Button onClick={() => setImportStep("upload")} color="inherit" variant="outlined">Back</Button>
                <Button onClick={() => setImportOpen(false)} variant="contained">Confirm Import</Button>
              </Stack>
            </Stack>
          )}
        </Modal>
      )}
    </Box>
  );
}