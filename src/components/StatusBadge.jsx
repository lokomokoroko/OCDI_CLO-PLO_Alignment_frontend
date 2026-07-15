import { Chip } from "@mui/material";

const config = {
  Approved:        { color: "success" },
  Draft:           { color: "default" },
  "Pending Chair": { color: "warning" },
  "Pending OCDI":  { color: "info" },
  Rejected:        { color: "error" },
};

export function StatusBadge({ status }) {
  const c = config[status] ?? config.Draft;
  return (
    <Chip
      label={status}
      color={c.color}
      size="small"
      variant="outlined"
      sx={{ fontWeight: 500, fontSize: 12, height: 22 }}
    />
  );
}