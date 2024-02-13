import {
  Box,
  Button,
  Card,
  CardActions,
  CardHeader,
  Grid,
  Paper,
} from "@mui/material";
import React from "react";
import { useRecoilValue } from "recoil";
import { isLoggedInAtom } from "../recoil-store/atoms/authState";
import { Navigate } from "react-router-dom";

const Login = () => {
  const isLoggedIn = useRecoilValue(isLoggedInAtom);

  if (isLoggedIn) {
    return <Navigate to={"/"} />;
  }

  return (
    <Box mx="8px" my="16px">
      <Grid
        container
        spacing={0}
        direction="column"
        alignItems="center"
        justifyContent="center"
        sx={{ minHeight: "90vh" }}
      >
        <Grid item xs={12} style={{ textAlign: "center", width: "100%" }}>
          <Card elevation={1}>
            <CardHeader
              title={"Reply Buddy 👾"}
              subheaderTypographyProps={{
                align: "center",
              }}
              sx={{
                backgroundColor: (theme) =>
                  theme.palette.mode === "light"
                    ? theme.palette.grey[200]
                    : theme.palette.grey[700],
              }}
            />
            <CardActions sx={{ display: "flex", justifyContent: "center" }}>
              <Button
                variant="contained"
                onClick={() => {
                  window.open(
                    "http://localhost:8002/api/auth/google",
                    "_blank"
                  );
                }}
              >
                Login With Google
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Login;
