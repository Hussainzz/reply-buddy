import { Box, Paper, Typography } from "@mui/material";
import React from "react";

const DashboardMain = () => {
  return (
    <Paper elevation={1}>
      <Box component="main" sx={{ p: 3 }}>
        <Typography variant="h6">
            Welcome Hussain ⚡️
        </Typography>
      </Box>
    </Paper>
  );
};

export default DashboardMain;
