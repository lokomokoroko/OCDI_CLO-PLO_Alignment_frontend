import { useState, useEffect, useMemo } from "react";
import {
  Box, Typography, Paper, Stack, Menu, MenuItem, Button, Tabs, Tab, LinearProgress, CircularProgress,
} from "@mui/material";
import SchoolIcon from "@mui/icons-material/School";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import HubIcon from "@mui/icons-material/Hub";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  RadialBarChart, RadialBar,
  ResponsiveContainer, LabelList,
} from "recharts";
import api from "../api";

const PLO_COLORS = ["#6366f1", "#f97316", "#22c55e", "#a855f7", "#ef4444", "#eab308", "#0ea5e9", "#ec4899"];
const KSA_COLORS = { KNOWLEDGE: "#6366f1", SKILLS: "#22c55e", ATTITUDE: "#f97316" };
const FOUR_C_LABELS = { CONSCIENCE: "Conscience", COMPETENCE: "Competence", COMPASSION: "Compassion", COMMITMENT: "Commitment" };
const FOUR_C_COLORS = { CONSCIENCE: "#f97316", COMPETENCE: "#6366f1", COMPASSION: "#22c55e", COMMITMENT: "#a855f7" };
const BLOOM_ORDER = ["REMEMBER", "UNDERSTAND", "APPLY", "ANALYZE", "EVALUATE", "CREATE"];

const tabs = [
  { key: "clos",   label: "CLOs per PLO" },
  { key: "radar",  label: "Alignment Radar" },
  { key: "ksa",    label: "KSA Distribution" },
  { key: "fourcs", label: "4Cs Profile" },
  { key: "blooms", label: "Bloom's Taxonomy" },
];

const statMeta = [
  { key: "program_count",   icon: SchoolIcon,    label: "Programs",     bg: "#eef2ff", color: "#6366f1" },
  { key: "course_count",    icon: MenuBookIcon,  label: "Courses",      bg: "#fff7ed", color: "#fb923c" },
  { key: "plo_count",       icon: FactCheckIcon, label: "PLOs Defined", bg: "#f0fdf4", color: "#22c55e" },
  { key: "alignment_count", icon: HubIcon,       label: "Alignments",   bg: "#fff1f2", color: "#fb7185" },
];

const bloomColors = {
  REMEMBER: "#94a3b8",
  UNDERSTAND: "#3b82f6",
  APPLY: "#6366f1",
  ANALYZE: "#8b5cf6",
  EVALUATE: "#f59e0b",
  CREATE: "#22c55e",
};

const bloomLabel = (level) => ({
  REMEMBER: "Remember",
  UNDERSTAND: "Understand",
  APPLY: "Apply",
  ANALYZE: "Analyze",
  EVALUATE: "Evaluate",
  CREATE: "Create",
}[level] || level);

export default function Dashboard() {
  const [programs, setPrograms] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [activeTab, setActiveTab] = useState("clos");
  const [overview, setOverview] = useState({ program_count: 0, course_count: 0, plo_count: 0, alignment_count: 0 });

  const [cloRows, setCloRows] = useState([]);
  const [radarRows, setRadarRows] = useState([]);
  const [ksaRows, setKsaRows] = useState([]);
  const [fourCsRows, setFourCsRows] = useState({});
  const [bloomsRows, setBloomsRows] = useState({});

  const [loadingPrograms, setLoadingPrograms] = useState(true);
  const [loadingCharts, setLoadingCharts] = useState(false);
  const [error, setError] = useState("");

  // Programs list (for the selector + nested PLOs) and the overview
  // counters — both from apps.programs.views.ProgramViewSet.
  useEffect(() => {
    setLoadingPrograms(true);
    Promise.all([
      api.get("programs/"),
      api.get("programs/overview/"),
    ])
      .then(([programsRes, overviewRes]) => {
        setPrograms(programsRes.data);
        setOverview(overviewRes.data);
        if (programsRes.data.length > 0) setSelectedId(programsRes.data[0].id);
      })
      .catch(() => setError("Could not load dashboard data. Is the API running?"))
      .finally(() => setLoadingPrograms(false));
  }, []);

  // Per-program analytics actions on ProgramViewSet.
  useEffect(() => {
    if (!selectedId) return;
    setLoadingCharts(true);
    Promise.all([
      api.get(`programs/${selectedId}/clos-per-plo/`),
      api.get(`programs/${selectedId}/alignment-radar/`),
      api.get(`programs/${selectedId}/ksa-distribution/`),
      api.get(`programs/${selectedId}/4cs-profile/`),
      api.get(`programs/${selectedId}/blooms-distribution/`),
    ])
      .then(([clos, radar, ksa, fourCs, blooms]) => {
        setCloRows(clos.data);
        setRadarRows(radar.data);
        setKsaRows(ksa.data);
        setFourCsRows(fourCs.data);
        setBloomsRows(blooms.data);
      })
      .catch(() => setError("Could not load chart data for this program."))
      .finally(() => setLoadingCharts(false));
  }, [selectedId]);

  const selectedProgram = programs.find(p => p.id === selectedId);
  const courseCount = selectedProgram?.course_count ?? 0;

  const cloChartRows = useMemo(
    () => cloRows.map((r, i) => ({ ...r, color: PLO_COLORS[i % PLO_COLORS.length] })),
    [cloRows]
  );

  const radarChartData = useMemo(
    () => radarRows.map(r => ({ plo: r.plo_code, value: r.percentage })),
    [radarRows]
  );

  const ksaChartData = useMemo(
    () => ksaRows.map(r => ({
      name: r.clo_domain === "KNOWLEDGE" ? "Knowledge" : r.clo_domain === "SKILLS" ? "Skills" : "Attitude",
      value: r.count,
      color: KSA_COLORS[r.clo_domain] ?? "#94a3b8",
    })),
    [ksaRows]
  );

  const fourCsChartData = useMemo(() => (
    Object.entries(fourCsRows).map(([key, count]) => ({
      name: FOUR_C_LABELS[key] ?? key,
      value: courseCount > 0 ? Math.round((count / courseCount) * 1000) / 10 : 0,
      fill: FOUR_C_COLORS[key] ?? "#94a3b8",
    }))
  ), [fourCsRows, courseCount]);

  const bloomsChartData = useMemo(() => (
    Object.entries(bloomsRows)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([year, counts]) => {
        const total = Object.values(counts).reduce((s, v) => s + v, 0);
        const row = { year: `Year ${year}` };
        BLOOM_ORDER.forEach(level => {
          const count = counts[level] ?? 0;
          row[level] = total > 0 ? Math.round((count / total) * 1000) / 10 : 0;
        });
        return row;
      })
  ), [bloomsRows]);

  const statCards = statMeta.map(m => ({ ...m, value: overview[m.key] ?? 0 }));

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h5" fontWeight={700} color="grey.800">Dashboard</Typography>
      <Typography variant="body2" color="grey.500" sx={{ mt: 0.5, mb: 3.5 }}>
        Overview of curriculum alignment data
      </Typography>

      {error && (
        <Paper elevation={0} variant="outlined" sx={{ borderRadius: 3, p: 2, mb: 2.5, borderColor: "error.light", bgcolor: "error.light" }}>
          <Typography variant="body2" color="error.main">{error}</Typography>
        </Paper>
      )}

      <Box sx={{ display: "flex", gap: 2, mb: 3.5, width: "100%" }}>
        {statCards.map(({ icon: Icon, label, value, bg, color, key }) => (
          <Paper
            key={key}
            elevation={0}
            variant="outlined"
            sx={{
              flex: 1,
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
              <Icon sx={{ fontSize: 22, color }} />
            </Box>

            <Box>
              <Typography variant="h6" fontWeight={700} color="grey.800">
                {value}
              </Typography>

              <Typography variant="body2" color="grey.500">
                {label}
              </Typography>
            </Box>
          </Paper>
        ))}
      </Box>

      <Paper elevation={0} variant="outlined" sx={{ borderRadius: 3, overflow: "hidden" }}>
        <Box sx={{ px: 3, pt: 2.5, pb: 2, borderBottom: "1px solid", borderColor: "grey.100" }}>
          <Typography variant="caption" color="grey.400" fontWeight={500} sx={{ textTransform: "uppercase", letterSpacing: 0.5, mb: 1, display: "block" }}>
            Program
          </Typography>
          <Button
            onClick={e => setAnchorEl(e.currentTarget)}
            fullWidth
            variant="outlined"
            color="inherit"
            endIcon={<ExpandMoreIcon sx={{ color: "grey.400" }} />}
            disabled={loadingPrograms || programs.length === 0}
            sx={{ justifyContent: "space-between", py: 1.25, px: 2, fontWeight: 500, color: "grey.800", borderColor: "grey.200" }}
          >
            {selectedProgram?.program_name ?? (loadingPrograms ? "Loading programs…" : "No programs available")}
          </Button>
          <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={() => setAnchorEl(null)} PaperProps={{ sx: { width: anchorEl?.offsetWidth, mt: 0.5 } }}>
            {programs.map(p => (
              <MenuItem
                key={p.id}
                selected={p.id === selectedId}
                onClick={() => { setSelectedId(p.id); setAnchorEl(null); }}
              >
                {p.program_name}
              </MenuItem>
            ))}
          </Menu>
        </Box>

        <Box sx={{ px: 3, borderBottom: "1px solid", borderColor: "grey.100", bgcolor: "grey.50" }}>
          <Tabs
            value={activeTab}
            onChange={(_, v) => setActiveTab(v)}
            variant="standard"
            centered
            sx={{ minHeight: 44 }}
          >
            {tabs.map(t => <Tab key={t.key} value={t.key} label={t.label} sx={{ minHeight: 44, textTransform: "none", fontSize: 13, fontWeight: 500 }} />)}
          </Tabs>
        </Box>

        <Box sx={{ p: 3 }}>
          {loadingCharts ? (
            <Stack alignItems="center" sx={{ py: 6 }}>
              <CircularProgress size={28} />
            </Stack>
          ) : !selectedProgram ? (
            <Typography variant="body2" color="grey.400" align="center" sx={{ py: 4 }}>
              No program selected.
            </Typography>
          ) : (
            <>
              {activeTab === "clos" && (
                <Box>
                  <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2.5, px: 0.5 }}>
                    <Typography variant="caption" color="grey.400" fontWeight={500} sx={{ width: 64}}>PLOs</Typography>
                    <Typography variant="caption" color="grey.400" fontWeight={500} sx={{ flex: 1}}>Progress</Typography>
                    <Typography variant="caption" color="grey.400" fontWeight={500} sx={{ width: 128, textAlign: "center" }}>
                      CLOs Aligned
                    </Typography>
                  </Stack>
                  <Stack spacing={2}>
                    {cloChartRows.map(({ plo_code, aligned_clos, total_clos, color }) => {
                      const pct = total_clos > 0 ? Math.round((aligned_clos / total_clos) * 100) : 0;
                      return (
                        <Stack key={plo_code} direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3.0, px: 0.5 }}>
                          <Stack direction="row" alignItems="center" spacing={1} sx={{ width: 64, flexShrink: 0 }}>
                            <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: color, flexShrink: 0 }} />
                            <Typography variant="body2" fontWeight={500} color="grey.700">{plo_code}</Typography>
                          </Stack>
                          <LinearProgress
                            variant="determinate"
                            value={pct}
                            sx={{
                              flex: 1, height: 12, borderRadius: 6, bgcolor: "grey.100",
                              "& .MuiLinearProgress-bar": { bgcolor: color, borderRadius: 6 },
                            }}
                          />
                          <Typography variant="body2" color="grey.500" sx={{ width: 128, textAlign: "center", flexShrink: 0 }}>
                            {aligned_clos} / {total_clos} CLOs
                          </Typography>
                        </Stack>
                      );
                    })}
                    {cloChartRows.length === 0 && (
                      <Typography variant="body2" color="grey.400" align="center">
                        No approved PLOs for this program yet.
                      </Typography>
                    )}
                  </Stack>
                  {selectedProgram?.plos?.length > 0 && (
                    <Stack
                      spacing={1.5}
                      sx={{ mt: 3, pt: 2.5, borderTop: "1px solid", borderColor: "grey.100", width: "100%" }}
                    >
                      {selectedProgram.plos.map((plo) => (
                        <Stack key={plo.plo_code} direction="row">
                          <Box sx={{ width: 100, display: "flex", justifyContent: "center", flexShrink: 0 }}>
                            <Typography variant="caption" fontWeight={700} color="primary.main" sx={{ fontFamily: "monospace" }}>
                              {plo.plo_code}
                            </Typography>
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" color="grey.600" sx={{ lineHeight: 1.5 }}>
                              {plo.plo_description}
                            </Typography>
                          </Box>
                        </Stack>
                      ))}
                    </Stack>
                  )}
                </Box>
              )}

              {activeTab === "radar" && (
                <Box>
                  <Typography variant="caption" color="grey.400" sx={{ mb: 2, display: "block" }}>
                    PLO coverage across all courses
                  </Typography>
                  <ResponsiveContainer width="100%" height={320}>
                    <RadarChart data={radarChartData} outerRadius="75%">
                      <PolarGrid stroke="#e2e8f0" />
                      <PolarAngleAxis dataKey="plo" tick={{ fontSize: 12, fill: "#64748b" }} />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10, fill: "#94a3b8" }} />
                      <Radar dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.25} strokeWidth={2} />
                      <Tooltip formatter={v => [`${v}%`, "Coverage"]} contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }} />
                    </RadarChart>
                  </ResponsiveContainer>
                  {selectedProgram?.plos?.length > 0 && (
                    <Stack
                      spacing={1.5}
                      sx={{ mt: 3, pt: 2.5, borderTop: "1px solid", borderColor: "grey.100", width: "100%" }}
                    >
                      {selectedProgram.plos.map((plo) => (
                        <Stack key={plo.plo_code} direction="row">
                          <Box sx={{ width: 100, display: "flex", justifyContent: "center", flexShrink: 0 }}>
                            <Typography variant="caption" fontWeight={700} color="primary.main" sx={{ fontFamily: "monospace" }}>
                              {plo.plo_code}
                            </Typography>
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" color="grey.600" sx={{ lineHeight: 1.5 }}>
                              {plo.plo_description}
                            </Typography>
                          </Box>
                        </Stack>
                      ))}
                    </Stack>
                  )}
                </Box>
              )}

              {activeTab === "ksa" && (
                <Box>
                  <Typography variant="caption" color="grey.400" sx={{ mb: 2, display: "block" }}>
                    Distribution of CLOs by Knowledge, Skills, and Attitude
                  </Typography>
                  <ResponsiveContainer width="100%" height={320}>
                    <PieChart>
                      <Pie data={ksaChartData} cx="50%" cy="50%" innerRadius={70} outerRadius={120} paddingAngle={3} dataKey="value">
                        {ksaChartData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <Stack
                    direction="row"
                    justifyContent="center"
                    spacing={3}
                    sx={{ mt: 2 }}
                  >
                    {ksaChartData.map((item) => (
                      <Stack
                        key={item.name}
                        direction="row"
                        spacing={0.75}
                        alignItems="center"
                      >
                        <Box
                          sx={{
                            width: 10,
                            height: 10,
                            borderRadius: "50%",
                            bgcolor: item.color,
                          }}
                        />
                        <Typography variant="caption">
                          {item.name}
                        </Typography>
                      </Stack>
                    ))}
                    {ksaChartData.length === 0 && (
                      <Typography variant="caption" color="grey.400">No CLO data for this program.</Typography>
                    )}
                  </Stack>
                </Box>
              )}

              {activeTab === "fourcs" && (
                <Box>
                  <Typography variant="caption" color="grey.400" sx={{ mb: 2, display: "block" }}>
                    Percentage of approved courses aligned to each of the 4Cs
                  </Typography>
                  <ResponsiveContainer width="100%" height={320}>
                    <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="90%" data={fourCsChartData} startAngle={90} endAngle={-270}>
                      <RadialBar dataKey="value" cornerRadius={4} background={{ fill: "#f1f5f9" }} label={{ position: "insideStart", fill: "#fff", fontSize: 11, fontWeight: 600 }} />
                      <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                      <Tooltip formatter={v => [`${v}%`, ""]} contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }} />
                    </RadialBarChart>
                  </ResponsiveContainer>
                </Box>
              )}

              {activeTab === "blooms" && (
                <Box>
                  <Typography variant="caption" color="grey.400" sx={{ mb: 2, display: "block" }}>
                    CLO distribution across Bloom's levels by year
                  </Typography>
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart data={bloomsChartData} margin={{ top: 4, right: 12, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="year" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                      <Tooltip
                        itemSorter={(item) => BLOOM_ORDER.indexOf(item.dataKey)}
                        contentStyle={{
                          borderRadius: 8,
                          border: "1px solid #e2e8f0",
                          fontSize: 12,
                        }}
                      />
                      {[...BLOOM_ORDER].reverse().map(level => (
                        <Bar
                          key={level}
                          dataKey={level}
                          stackId="bloom"
                          fill={bloomColors[level]}
                          radius={level === "REMEMBER" ? [3, 3, 0, 0] : [0, 0, 0, 0]}
                        >
                          <LabelList
                            dataKey={level}
                            position="center"
                            formatter={(v) => (v ? `${v}%` : "")}
                            fill="#fff"
                            fontSize={10}
                            fontWeight={600}
                          />
                        </Bar>
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                  <Stack
                    direction="row"
                    justifyContent="center"
                    spacing={3}
                    sx={{ mt: 2, flexWrap: "wrap" }}
                  >
                    {BLOOM_ORDER.map((level) => (
                      <Stack
                        key={level}
                        direction="row"
                        spacing={0.75}
                        alignItems="center"
                      >
                        <Box
                          sx={{
                            width: 10,
                            height: 10,
                            borderRadius: "50%",
                            bgcolor: bloomColors[level],
                          }}
                        />
                        <Typography variant="caption">
                          {bloomLabel(level)}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                </Box>
              )}
            </>
          )}
        </Box>
      </Paper>
    </Box>
  );
}