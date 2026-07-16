import { useState } from "react";
import {
  Box, Typography, Grid, Paper, Stack, Menu, MenuItem, Button, Tabs, Tab, LinearProgress,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/SpaceDashboard";
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
import { programs as programsData, courses as coursesData } from "../data";

const ploData = {
  "BS CS": [
    { plo: "PLO1", aligned: 25, total: 25, color: "#6366f1" },
    { plo: "PLO2", aligned: 25, total: 25, color: "#f97316" },
    { plo: "PLO3", aligned: 12, total: 25, color: "#22c55e" },
    { plo: "PLO4", aligned: 11, total: 25, color: "#a855f7" },
    { plo: "PLO5", aligned: 12, total: 25, color: "#ef4444" },
    { plo: "PLO6", aligned: 18, total: 25, color: "#eab308" },
  ],
  "BS MIS": [
    { plo: "PLO1", aligned: 20, total: 30, color: "#6366f1" },
    { plo: "PLO2", aligned: 28, total: 30, color: "#f97316" },
    { plo: "PLO3", aligned: 15, total: 30, color: "#22c55e" },
    { plo: "PLO4", aligned: 9,  total: 30, color: "#a855f7" },
    { plo: "PLO5", aligned: 22, total: 30, color: "#ef4444" },
  ],
  "AB DS": [
    { plo: "PLO1", aligned: 18, total: 20, color: "#6366f1" },
    { plo: "PLO2", aligned: 14, total: 20, color: "#f97316" },
    { plo: "PLO3", aligned: 20, total: 20, color: "#22c55e" },
    { plo: "PLO4", aligned: 10, total: 20, color: "#a855f7" },
  ],
};

const radarData = {
  "BS CS": [
    { plo: "PLO1", value: 92 }, { plo: "PLO2", value: 88 },
    { plo: "PLO3", value: 55 }, { plo: "PLO4", value: 60 },
    { plo: "PLO5", value: 45 }, { plo: "PLO6", value: 72 },
  ],
  "BS MIS": [
    { plo: "PLO1", value: 80 }, { plo: "PLO2", value: 85 },
    { plo: "PLO3", value: 60 }, { plo: "PLO4", value: 50 },
    { plo: "PLO5", value: 70 },
  ],
  "AB DS": [
    { plo: "PLO1", value: 90 }, { plo: "PLO2", value: 75 },
    { plo: "PLO3", value: 65 }, { plo: "PLO4", value: 55 },
  ],
};

const ksaData = {
  "BS CS": [
    { name: "Knowledge", value: 32, color: "#6366f1" },
    { name: "Skills",    value: 48, color: "#22c55e" },
    { name: "Attitude",  value: 20, color: "#f97316" },
  ],
  "BS MIS": [
    { name: "Knowledge", value: 28, color: "#6366f1" },
    { name: "Skills",    value: 52, color: "#22c55e" },
    { name: "Attitude",  value: 20, color: "#f97316" },
  ],
  "AB DS": [
    { name: "Knowledge", value: 40, color: "#6366f1" },
    { name: "Skills",    value: 42, color: "#22c55e" },
    { name: "Attitude",  value: 18, color: "#f97316" },
  ],
};

const fourCsData = {
  "BS CS": [
    { name: "Commitment",    value: 42, fill: "#a855f7" },
    { name: "Character",     value: 58, fill: "#f97316" },
    { name: "Communication", value: 65, fill: "#22c55e" },
    { name: "Competence",    value: 85, fill: "#6366f1" },
  ],
  "BS MIS": [
    { name: "Commitment",    value: 50, fill: "#a855f7" },
    { name: "Character",     value: 55, fill: "#f97316" },
    { name: "Communication", value: 60, fill: "#22c55e" },
    { name: "Competence",    value: 80, fill: "#6366f1" },
  ],
  "AB DS": [
    { name: "Commitment",    value: 38, fill: "#a855f7" },
    { name: "Character",     value: 62, fill: "#f97316" },
    { name: "Communication", value: 70, fill: "#22c55e" },
    { name: "Competence",    value: 88, fill: "#6366f1" },
  ],
};

const bloomsData = {
  "BS CS": [
    { year: "Year 1", Remember: 20, Understand: 30, Apply: 25, Analyze: 15, Evaluate: 5,  Create: 5  },
    { year: "Year 2", Remember: 10, Understand: 20, Apply: 30, Analyze: 25, Evaluate: 10, Create: 5  },
    { year: "Year 3", Remember: 5,  Understand: 10, Apply: 25, Analyze: 30, Evaluate: 20, Create: 10 },
    { year: "Year 4", Remember: 3,  Understand: 7,  Apply: 20, Analyze: 25, Evaluate: 25, Create: 20 },
  ],
  "BS MIS": [
    { year: "Year 1", Remember: 25, Understand: 35, Apply: 20, Analyze: 12, Evaluate: 5,  Create: 3  },
    { year: "Year 2", Remember: 12, Understand: 22, Apply: 35, Analyze: 20, Evaluate: 8,  Create: 3  },
    { year: "Year 3", Remember: 6,  Understand: 12, Apply: 30, Analyze: 28, Evaluate: 15, Create: 9  },
    { year: "Year 4", Remember: 4,  Understand: 8,  Apply: 22, Analyze: 26, Evaluate: 22, Create: 18 },
  ],
  "AB DS": [
    { year: "Year 1", Remember: 18, Understand: 28, Apply: 22, Analyze: 18, Evaluate: 8,  Create: 6  },
    { year: "Year 2", Remember: 8,  Understand: 18, Apply: 28, Analyze: 28, Evaluate: 12, Create: 6  },
    { year: "Year 3", Remember: 4,  Understand: 8,  Apply: 22, Analyze: 32, Evaluate: 22, Create: 12 },
    { year: "Year 4", Remember: 2,  Understand: 5,  Apply: 18, Analyze: 28, Evaluate: 28, Create: 19 },
  ],
};

const bloomColors = {
  Remember:   "#94a3b8",
  Understand: "#60a5fa",
  Apply:      "#6366f1",
  Analyze:    "#a855f7",
  Evaluate:   "#f59e0b",
  Create:     "#22c55e",
};

const totalAlignments = Object.values(ploData).flat().reduce((sum, r) => sum + r.aligned, 0);
const totalPLOs = programsData.reduce((sum, p) => sum + p.plos.length, 0);

const tabs = [
  { key: "clos",   label: "CLOs per PLO" },
  { key: "radar",  label: "Alignment Radar" },
  { key: "ksa",    label: "KSA Distribution" },
  { key: "fourcs", label: "4Cs Profile" },
  { key: "blooms", label: "Bloom's Taxonomy" },
];

const statCards = [
  { icon: SchoolIcon,    label: "Programs",     key: "programs",   bg: "#eef2ff", color: "#6366f1" },
  { icon: MenuBookIcon,  label: "Courses",      key: "courses",    bg: "#fff7ed", color: "#fb923c" },
  { icon: FactCheckIcon, label: "PLOs Defined", key: "plos",       bg: "#f0fdf4", color: "#22c55e" },
  { icon: HubIcon, label: "Alignments",   key: "alignments", bg: "#fff1f2", color: "#fb7185" },
];
const statValues = {
  programs: programsData.length,
  courses: coursesData.length,
  plos: totalPLOs,
  alignments: totalAlignments,
};

export default function Dashboard() {
  const [selectedCode, setSelectedCode] = useState("BS CS");
  const [anchorEl, setAnchorEl] = useState(null);
  const [activeTab, setActiveTab] = useState("clos");

  const rows = ploData[selectedCode] ?? [];
  const selectedProgram = programsData.find(p => p.code === selectedCode);

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h5" fontWeight={700} color="grey.800">Dashboard</Typography>
      <Typography variant="body2" color="grey.500" sx={{ mt: 0.5, mb: 3.5 }}>
        Overview of curriculum alignment data
      </Typography>

      <Box
  sx={{
    display: "flex",
    gap: 2,
    mb: 3.5,
    width: "100%",
  }}
>
  {statCards.map(({ icon: Icon, label, key, bg, color }) => (
    <Paper
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
          {statValues[key]}
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
            sx={{ justifyContent: "space-between", py: 1.25, px: 2, fontWeight: 500, color: "grey.800", borderColor: "grey.200" }}
          >
            {selectedProgram?.name ?? selectedCode}
          </Button>
          <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={() => setAnchorEl(null)} PaperProps={{ sx: { width: anchorEl?.offsetWidth, mt: 0.5 } }}>
            {programsData.map(p => (
              <MenuItem
                key={p.code}
                selected={p.code === selectedCode}
                onClick={() => { setSelectedCode(p.code); setAnchorEl(null); }}
              >
                {p.name}
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
                {rows.map(({ plo, aligned, total, color }) => {
                  const pct = Math.round((aligned / total) * 100);
                  return (
                    <Stack key={plo} direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3.0  , px: 0.5 }}>
                      <Stack direction="row" alignItems="center" spacing={1} sx={{ width: 64, flexShrink: 0 }}>
                        <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: color, flexShrink: 0 }} />
                        <Typography variant="body2" fontWeight={500} color="grey.700">{plo}</Typography>
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
                        {aligned} / {total} CLOs
                      </Typography>
                    </Stack>
                    
                  );
                })}
              </Stack>
              {selectedProgram?.plos?.length > 0 && (
  <Stack
    spacing={1.5}
    sx={{
      mt: 3,
      pt: 2.5,
      borderTop: "1px solid",
      borderColor: "grey.100",
      width: "100%",
    }}
  >
    {selectedProgram.plos.map((plo) => (
      <Stack
        key={plo.code}
        direction="row"
      >
        {/* PLO Number */}
        <Box
          sx={{
            width: 100,
            display: "flex",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Typography
            variant="caption"
            fontWeight={700}
            color="primary.main"
            sx={{ fontFamily: "monospace" }}
          >
            {plo.code}
          </Typography>
        </Box>

        {/* Description */}
        <Box sx={{ flex: 1 }}>
          <Typography
            variant="body2"
            color="grey.600"
            sx={{ lineHeight: 1.5 }}
          >
            {plo.desc}
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
                <RadarChart data={radarData[selectedCode]} outerRadius="75%">
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
  sx={{
    mt: 3,
    pt: 2.5,
    borderTop: "1px solid",
    borderColor: "grey.100",
    width: "100%",
  }}
>
  {selectedProgram.plos.map((plo) => (
    <Stack
      key={plo.code}
      direction="row"
    >
      {/* PLO Number Column */}
      <Box
        sx={{
          width: 100,
          display: "flex",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Typography
          variant="caption"
          fontWeight={700}
          color="primary.main"
          sx={{
            fontFamily: "monospace",
          }}
        >
          {plo.code}
        </Typography>
      </Box>

      {/* Description Column */}
      <Box
        sx={{
          flex: 1,
        }}
      >
        <Typography
          variant="body2"
          color="grey.600"
          sx={{
            lineHeight: 1.5,
          }}
        >
          {plo.desc}
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
                  <Pie data={ksaData[selectedCode]} cx="50%" cy="50%" innerRadius={70} outerRadius={120} paddingAngle={3} dataKey="value">
                    {ksaData[selectedCode].map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip formatter={v => [`${v}%`, ""]} contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <Stack
                direction="row"
                justifyContent="center"
                spacing={3}
                sx={{ mt: 2 }}
              >
                {[
                  { label: "Knowledge", color: "#6366f1" },
                  { label: "Skills", color: "#22c55e" },
                  { label: "Attitude", color: "#f97316" },
                ].map((item) => (
                  <Stack
                    key={item.label}
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
                      {item.label}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </Box>
          )}

          {activeTab === "fourcs" && (
            <Box>
              <Typography variant="caption" color="grey.400" sx={{ mb: 2, display: "block" }}>
                Number of major courses aligned to each of the 4Cs
              </Typography>
              <ResponsiveContainer width="100%" height={320}>
                <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="90%" data={fourCsData[selectedCode]} startAngle={90} endAngle={-270}>
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
                <BarChart data={bloomsData[selectedCode]} margin={{ top: 4, right: 12, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="year" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <Tooltip
                    itemSorter={(item) => {
                      const order = {
                        Remember: 0,
                        Understand: 1,
                        Apply: 2,
                        Analyze: 3,
                        Evaluate: 4,
                        Create: 5,
                      };

                      return order[item.dataKey];
                    }}
                    contentStyle={{
                      borderRadius: 8,
                      border: "1px solid #e2e8f0",
                      fontSize: 12,
                    }}
                  />
                  {[
                    "Create",
                    "Evaluate",
                    "Analyze",
                    "Apply",
                    "Understand",
                    "Remember",
                  ].map(level => (
                    <Bar
                      key={level}
                      dataKey={level}
                      stackId="bloom"
                      fill={bloomColors[level]}
                      radius={level === "Remember" ? [3, 3, 0, 0] : [0, 0, 0, 0]}
                    >
                      <LabelList
                        dataKey={level}
                        position="center"
                        formatter={(v) => `${v}%`}
                        fill="#fff"
                        fontSize={10}
                        fontWeight={600}
                      />
                    </Bar>
                  ))}
                  ))}
                </BarChart>
              </ResponsiveContainer>
              <Stack
                direction="row"
                justifyContent="center"
                spacing={3}
                sx={{ mt: 2, flexWrap: "wrap" }}
              >
                {[
                  { label: "Remember", color: bloomColors.Remember },
                  { label: "Understand", color: bloomColors.Understand },
                  { label: "Apply", color: bloomColors.Apply },
                  { label: "Analyze", color: bloomColors.Analyze },
                  { label: "Evaluate", color: bloomColors.Evaluate },
                  { label: "Create", color: bloomColors.Create },
                ].map((item) => (
                  <Stack
                    key={item.label}
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
                      {item.label}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
                          </Box>
                        )}
                      </Box>
                    </Paper>
                  </Box>
                );
              }