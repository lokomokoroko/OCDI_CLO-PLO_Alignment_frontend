import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  TextField,
  MenuItem,
  Button,
  Stack,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

export function Modal({ title, onClose, children, wide }) {
  return (
    <Dialog
      open
      onClose={onClose}
      maxWidth={wide ? "md" : "xs"}
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pb: 1 }}>
        <Typography variant="subtitle1" fontWeight={600}>{title}</Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ pt: 1.5, px: 2.5 }}>
        {children}
      </DialogContent>
    </Dialog>
  );
}

export function Field({ label, value, onChange, type = "text", placeholder, textarea }) {
  return (
    <TextField
      label={label}
      value={value ?? ""}
      onChange={e => onChange(e.target.value)}
      type={type}
      placeholder={placeholder}
      fullWidth
      multiline={!!textarea}
      minRows={textarea ? 3 : undefined}
      size="small"
    />
  );
}

export function SelectField({ label, value, onChange, options }) {
  return (
    <TextField
      select
      label={label}
      value={value ?? ""}
      onChange={e => onChange(e.target.value)}
      fullWidth
      size="small"
      sx={{
        "& .MuiInputBase-root": {
          minHeight: 42,
        },
      }}
    >
      <MenuItem value="">Select…</MenuItem>
      {options.map(o => (
        <MenuItem key={o} value={o}>
          {o}
        </MenuItem>
      ))}
    </TextField>
  );
}

export function ModalActions({ onCancel, onConfirm, confirmLabel = "Save", danger }) {
  return (
    <DialogActions sx={{ px: 3, pb: 2, pt: 1 }}>
      <Stack direction="row" spacing={1.5} sx={{ width: "100%" }}>
        <Button
          onClick={onConfirm}
          variant="contained"
          color={danger ? "error" : "primary"}
          fullWidth
        >
          {confirmLabel}
        </Button>
        <Button onClick={onCancel} variant="outlined" color="inherit" fullWidth>
          Cancel
        </Button>
      </Stack>
    </DialogActions>
  );
}