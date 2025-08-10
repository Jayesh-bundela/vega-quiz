import React from "react";
import { useRouter } from "next/router";
import { Container, Box, Typography, Button, Grid } from "@mui/material";

export default function Home() {
  const router = useRouter();
  const selectDifficulty = (level) => {
    router.push({ pathname: "/quiz", query: { difficulty: level } });
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Box textAlign="center">
        <Typography variant="h4" gutterBottom>
          VEGA Quiz
        </Typography>
        <Typography variant="subtitle1" gutterBottom>
          Select difficulty to start — 4 random questions will be chosen.
        </Typography>

        <Grid container spacing={2} sx={{ mt: 3 }}>
          {["Easy", "Medium", "Hard", "Any"].map((d) => (
            <Grid item xs={6} key={d}>
              <Button
                fullWidth
                variant="contained"
                onClick={() => selectDifficulty(d)}
                size="large"
              >
                {d}
              </Button>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
}
