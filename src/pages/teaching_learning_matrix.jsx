import { useState, useRef } from "react";
import {
  Box, Typography, Stack, Button, Paper, Menu, MenuItem, IconButton,
  Table, TableHead, TableBody, TableRow, TableCell, Chip, TextField,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import UploadIcon from "@mui/icons-material/Upload";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import { Modal } from "../components/Modal";
import { programs as programsData, courses as coursesData, teachingStrategies, departments } from "../data";

function makeKey(courseCode, strategy) {
  return `${courseCode}::${strategy}`;
}

export default function TeachingMatrix() {
  const [selectedDept, setSelectedDept] = useState(departments[0]);
  const [deptAnchor, setDeptAnchor] = useState(null);

  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardProgram, setWizardProgram] = useState("");

  const [activePrograms, setActivePrograms] = useState([]);
  const [active, setActive] = useState(new Set());
  const [others, setOthers] = useState({});

  const [importOpen, setImportOpen] = useState(false);
  const [importStep, setImportStep] = useState("upload");
  const fileRef = useRef(null);

  const deptPrograms = programsData.filter(p => p.dept === selectedDept);

  function openWizard() {
    setWizardProgram("");
    setWizardOpen(true);
  }

  function wizardConfirm() {
    if (!wizardProgram) return;
    if (!activePrograms.includes(wizardProgram)) {
      setActivePrograms(prev => [...prev, wizardProgram]);
    }
    setWizardOpen(false);
  }

  function removeProgram(code) {
    setActivePrograms(prev => prev.filter(p => p !== code));
  }

  function toggle(courseCode, strategy) {
    const key = makeKey(courseCode, strategy);
    setActive(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function isActive(courseCode, strategy) {
    return active.has(makeKey(courseCode, strategy));
  }

  function changeDept(d) {
    setSelectedDept(d);
    setActivePrograms([]);
    setDeptAnchor(null);
  }

  return (
    <Box sx={{ p: 4 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={700} color="grey.800">Teaching &amp; Learning Matrix</Typography>
          <Typography variant="body2" color="grey.500" sx={{ mt: 0.5 }}>Map teaching strategies to courses</Typography>
        </Box>

        <Stack direction="row" spacing={1.5}>
          <Button variant="outlined" color="inherit" startIcon={<UploadIcon fontSize="small" />} onClick={() => { setImportStep("upload"); setImportOpen(true); }}>
            Import
          </Button>
          <Button variant="outlined" color="inherit" onClick={e => setDeptAnchor(e.currentTarget)} endIcon={<ExpandMoreIcon fontSize="small" />}>
            {selectedDept}
          </Button>
          <Menu anchorEl={deptAnchor} open={!!deptAnchor} onClose={() => setDeptAnchor(null)}>
            {departments.map(d => (
              <MenuItem key={d} selected={d === selectedDept} onClick={() => changeDept(d)}>{d}</MenuItem>
            ))}
          </Menu>
        </Stack>
      </Stack>

      {activePrograms.length === 0 ? (
        <Paper elevation={0} variant="outlined" sx={{ borderRadius: 3, p: 8, display: "flex", flexDirection: "column", alignItems: "center", gap: 2, textAlign: "center" }}>
          <Box sx={{ width: 56, height: 56, borderRadius: 3, bgcolor: "#eef2ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <MenuBookIcon sx={{ fontSize: 24, color: "#a5b4fc" }} />
          </Box>
          <Box>
            <Typography fontWeight={600} color="grey.700">No programs added yet</Typography>
            <Typography variant="body2" color="grey.400" sx={{ mt: 0.5 }}>
              Select a program to pull in its courses and start mapping teaching strategies.
            </Typography>
          </Box>
          <Button variant="contained" startIcon={<AddIcon fontSize="small" />} onClick={openWizard} sx={{ mt: 0.5 }}>
            Add Program
          </Button>
        </Paper>
      ) : (
        <Stack spacing={3}>
          {activePrograms.map(programCode => {
            const program = programsData.find(p => p.code === programCode);
            if (!program) return null;
            const programCourses = coursesData.filter(c => c.program === programCode);
            return (
              <Paper key={programCode} elevation={0} variant="outlined" sx={{ borderRadius: 3, overflow: "hidden" }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 2.5, py: 1.5, borderBottom: "1px solid", borderColor: "grey.100", bgcolor: "grey.50" }}>
                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Chip label={program.code} size="small" sx={{ fontFamily: "monospace", fontWeight: 700, bgcolor: "#eef2ff", color: "primary.main", fontSize: 11, height: 20 }} />
                    <Typography variant="body2" fontWeight={600} color="grey.800">{program.name}</Typography>
                    <Typography variant="caption" color="grey.400">·</Typography>
                    <Typography variant="caption" color="grey.500">{programCourses.length} courses</Typography>
                  </Stack>
                  <IconButton size="small" onClick={() => removeProgram(programCode)} title="Remove" sx={{ color: "grey.300", "&:hover": { color: "error.light" } }}>
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Stack>

                <Box sx={{ overflowX: "auto" }}>
                  <Table size="small" sx={{ minWidth: 700 }}>
                    <TableHead>
                      <TableRow sx={{ bgcolor: "grey.50" }}>
                        <TableCell sx={{ minWidth: 180, fontSize: 11, fontWeight: 600, color: "grey.500", textTransform: "uppercase", letterSpacing: 0.5 }}>
                          Course
                        </TableCell>
                        {teachingStrategies.map(s => (
                          <TableCell key={s} align="center" sx={{ minWidth: 76, fontSize: 10, fontWeight: 600, color: "grey.500", textTransform: "uppercase", letterSpacing: 0.5, lineHeight: 1.2 }}>
                            {s}
                          </TableCell>
                        ))}
                        <TableCell align="center" sx={{ minWidth: 120, fontSize: 10, fontWeight: 600, color: "grey.500", textTransform: "uppercase", letterSpacing: 0.5 }}>
                          Others
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {programCourses.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={teachingStrategies.length + 2} align="center" sx={{ py: 5, color: "grey.400" }}>
                            No courses found for this program.
                          </TableCell>
                        </TableRow>
                      ) : (
                        programCourses.map(course => (
                          <TableRow key={course.id} hover>
                            <TableCell>
                              <Typography variant="body2" fontWeight={600} color="grey.800" sx={{ lineHeight: 1.2 }}>{course.name}</Typography>
                              <Typography variant="caption" color="grey.400" sx={{ fontFamily: "monospace" }}>{course.code}</Typography>
                            </TableCell>
                            {teachingStrategies.map(strategy => {
                              const on = isActive(course.code, strategy);
                              return (
                                <TableCell key={strategy} align="center">
                                  <IconButton
                                    size="small"
                                    onClick={() => toggle(course.code, strategy)}
                                    title={on ? "Click to remove" : "Click to add"}
                                    sx={{ width: 28, height: 28, bgcolor: on ? "#e0e7ff" : "grey.100", "&:hover": { bgcolor: on ? "#c7d2fe" : "grey.200" } }}
                                  >
                                    {on
                                      ? <CheckIcon sx={{ fontSize: 14, color: "primary.main" }} />
                                      : <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "grey.300" }} />
                                    }
                                  </IconButton>
                                </TableCell>
                              );
                            })}
                            <TableCell>
                              <TextField
                                size="small" fullWidth placeholder="Type here…"
                                value={others[course.code] ?? ""}
                                onChange={e => setOthers(prev => ({ ...prev, [course.code]: e.target.value }))}
                              />
                            </TableCell>
                          </TableRow>
                        ))
                      )}
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
            Add Another Program
          </Button>
        </Stack>
      )}

      {wizardOpen && (
        <Modal title="Add Program" onClose={() => setWizardOpen(false)}>
          <Stack spacing={2}>
            <Typography variant="body2" color="grey.600">
              Select a program under <Box component="span" fontWeight={600} color="grey.800">{selectedDept}</Box>:
            </Typography>
            <Stack spacing={1} sx={{ maxHeight: 300, overflowY: "auto", pr: 0.5 }}>
              {deptPrograms.length === 0 ? (
                <Typography variant="body2" color="grey.400" align="center" sx={{ py: 2 }}>No programs found for this department.</Typography>
              ) : (
                deptPrograms.map(p => {
                  const alreadyAdded = activePrograms.includes(p.code);
                  const courseCount = coursesData.filter(c => c.program === p.code).length;
                  return (
                    <Paper
                      key={p.code}
                      variant="outlined"
                      onClick={() => !alreadyAdded && setWizardProgram(p.code)}
                      sx={{
                        p: 1.5, borderRadius: 2,
                        cursor: alreadyAdded ? "not-allowed" : "pointer",
                        borderColor: alreadyAdded ? "grey.100" : wizardProgram === p.code ? "primary.main" : "grey.200",
                        bgcolor: alreadyAdded ? "grey.50" : wizardProgram === p.code ? "#eef2ff" : "white",
                      }}
                    >
                      <Typography variant="body2" fontWeight={500} color={alreadyAdded ? "grey.300" : wizardProgram === p.code ? "primary.main" : "grey.700"}>
                        {p.name} {alreadyAdded && <Typography component="span" variant="caption" color="grey.300"> (already added)</Typography>}
                      </Typography>
                      <Typography variant="caption" color="grey.400">{p.code} · {courseCount} courses</Typography>
                    </Paper>
                  );
                })
              )}
            </Stack>
            <Stack direction="row" justifyContent="flex-end" spacing={1}>
              <Button onClick={() => setWizardOpen(false)} color="inherit" variant="outlined">Cancel</Button>
              <Button onClick={wizardConfirm} disabled={!wizardProgram} variant="contained">Add to Matrix</Button>
            </Stack>
          </Stack>
        </Modal>
      )}

      {importOpen && (
        <Modal title="Import Teaching Matrix" onClose={() => setImportOpen(false)}>
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
                File must include columns: Course Code, Teaching Strategy
              </Typography>
            </Stack>
          ) : (
            <Stack spacing={2}>
              <Paper variant="outlined" sx={{ borderRadius: 3, p: 2, bgcolor: "grey.50" }}>
                <Stack spacing={0.5}>
                  <Typography variant="body2"><Box component="span" color="grey.400">Rows detected:</Box> <b>18 mappings</b></Typography>
                  <Typography variant="body2"><Box component="span" color="grey.400">Courses:</Box> CS301, CS302, IT201</Typography>
                  <Typography variant="body2"><Box component="span" color="grey.400">Strategies:</Box> 6 unique strategies</Typography>
                </Stack>
              </Paper>
              <Typography variant="body2" color="grey.600">Does this look correct? Confirm to apply these mappings.</Typography>
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