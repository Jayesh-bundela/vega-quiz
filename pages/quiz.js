import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  Container,
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Radio,
  RadioGroup,
  FormControlLabel,
  LinearProgress,
  Stack,
  Slide,
} from "@mui/material";
import { InlineMath } from "react-katex";
import data from "../data/questions.json";

function shuffle(array) {
  return array
    .map((v) => ({ v, r: Math.random() }))
    .sort((a, b) => a.r - b.r)
    .map((x) => x.v);
}

export default function QuizPage() {
  const router = useRouter();
  const { difficulty } = router.query;
  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30); // 30 sec per question
  const [slideDirection, setSlideDirection] = useState("left");

  useEffect(() => {
    if (!difficulty) return;
    let pool = data;
    if (difficulty !== "Any") {
      pool = data.filter(
        (q) => q["Difficulty level"].toLowerCase() === difficulty.toLowerCase()
      );
    }
    pool = shuffle(pool);
    const chosen = pool.slice(0, 4);
    setQuestions(chosen);
    setAnswers(Array(chosen.length).fill(null));
    setIndex(0);
    setSubmitted(false);
    setScore(0);
    setTimeLeft(30);
  }, [difficulty]);

  // Timer
  useEffect(() => {
    if (!submitted && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((t) => t - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && !submitted) {
      if (index < questions.length - 1) {
        goNext();
      } else {
        handleSubmit();
      }
    }
  }, [timeLeft, submitted, index, questions.length]);

  if (!difficulty) {
    return <Container sx={{ mt: 6 }}>Loading...</Container>;
  }

  if (!questions.length) {
    return (
      <Container sx={{ mt: 6 }}>
        <Typography>No questions available for this difficulty.</Typography>
        <Button onClick={() => router.push("/")}>Go back</Button>
      </Container>
    );
  }

  const current = questions[index];

  const handleSelect = (value) => {
    const newAnswers = [...answers];
    newAnswers[index] = Number(value);
    setAnswers(newAnswers);
  };

  const goNext = () => {
    if (index < questions.length - 1) {
      setSlideDirection("left");
      setIndex(index + 1);
      setTimeLeft(30);
    }
  };

  const goPrev = () => {
    if (index > 0) {
      setSlideDirection("right");
      setIndex(index - 1);
      setTimeLeft(30);
    }
  };

  const handleSubmit = () => {
    let s = 0;
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (answers[i] && answers[i] === q["Correct Option"]) {
        s += Number(q["Marks allocated"] || 1);
      }
    }
    setScore(s);
    setSubmitted(true);
  };

  const restartQuiz = () => {
    router.push("/");
  };

  const totalMarks = questions.reduce(
    (a, b) => a + Number(b["Marks allocated"] || 1),
    0
  );
  const percentage = Math.round((score / totalMarks) * 100);

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      {!submitted ? (
        <>
          {/* Header */}
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h6" sx={{ fontWeight: "bold", color: "primary.main" }}>
              Question {index + 1} / {questions.length}
            </Typography>
            <Typography variant="subtitle2" sx={{ color: "secondary.main" }}>
              Difficulty: {current["Difficulty level"]}
            </Typography>
          </Stack>

          {/* Timer */}
          <Typography
            variant="subtitle2"
            color={timeLeft <= 5 ? "error" : "textSecondary"}
            sx={{ mt: 1 }}
          >
            Time left: {timeLeft}s
          </Typography>
          <LinearProgress
            variant="determinate"
            value={(timeLeft / 30) * 100}
            sx={{
              mb: 2,
              height: 8,
              borderRadius: 5,
              backgroundColor: "#ffe0b2",
              "& .MuiLinearProgress-bar": {
                background: "linear-gradient(90deg, #26A69A, #00897B)",
              },
            }}
          />

          {/* Animated Question */}
          <Slide in direction={slideDirection} mountOnEnter unmountOnExit>
            <Box>
              <Card
                sx={{
                  boxShadow: 4,
                  borderRadius: 3,
                  background: "linear-gradient(135deg, #E0F2F1, #ffffff)",
                }}
              >
                <CardContent>
                  <Typography
                    variant="body1"
                    gutterBottom
                    sx={{ fontWeight: 500, color: "#004d40" }}
                  >
                    {current.Question.includes("$") ? (
                      <MathRenderer text={current.Question} />
                    ) : (
                      current.Question
                    )}
                  </Typography>

                  <RadioGroup
                    value={answers[index] ?? ""}
                    onChange={(e) => handleSelect(e.target.value)}
                  >
                    {[1, 2, 3, 4].map((i) => {
                      const opt = current[`Option ${i}`];
                      return (
                        <FormControlLabel
                          key={i}
                          value={i}
                          control={<Radio color="primary" />}
                          label={
                            opt.includes("$") ? (
                              <MathRenderer text={opt} />
                            ) : (
                              <span>{opt}</span>
                            )
                          }
                        />
                      );
                    })}
                  </RadioGroup>
                </CardContent>
              </Card>
            </Box>
          </Slide>

          {/* Navigation */}
          <Stack
            direction="row"
            spacing={2}
            sx={{ mt: 3 }}
            justifyContent="space-between"
          >
            <Button
              variant="outlined"
              color="secondary"
              onClick={goPrev}
              disabled={index === 0}
            >
              Previous
            </Button>
            {index < questions.length - 1 ? (
              <Button variant="contained" onClick={goNext}>
                Next
              </Button>
            ) : (
              <Button variant="contained" color="success" onClick={handleSubmit}>
                Submit
              </Button>
            )}
          </Stack>
        </>
      ) : (
        <Box>
          <Typography variant="h5" sx={{ color: "primary.main", fontWeight: "bold" }}>
            Results
          </Typography>
          <Typography sx={{ mt: 1 }}>
            Score: {score} / {totalMarks} ({percentage}%)
          </Typography>

          {/* Results List */}
          <Box sx={{ mt: 3 }}>
            {questions.map((q, i) => (
              <Card
                key={i}
                sx={{
                  mb: 2,
                  borderRadius: 3,
                  backgroundColor: "#f9fbe7",
                  boxShadow: 2,
                }}
              >
                <CardContent>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                      Question {i + 1}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "secondary.main" }}>
                      {q["Difficulty level"]}
                    </Typography>
                  </Stack>

                  <Box sx={{ mt: 1 }}>
                    {q.Question.includes("$") ? (
                      <MathRenderer text={q.Question} />
                    ) : (
                      q.Question
                    )}
                  </Box>
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="body2" sx={{ color: "green" }}>
                      Correct: {q[`Option ${q["Correct Option"]}`]}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: answers[i] === q["Correct Option"] ? "green" : "red" }}
                    >
                      Your answer:{" "}
                      {answers[i] ? q[`Option ${answers[i]}`] : "No answer"}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>

          <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
            <Button variant="contained" color="primary" onClick={restartQuiz}>
              Restart Quiz
            </Button>
          </Stack>
        </Box>
      )}
    </Container>
  );
}

function MathRenderer({ text }) {
  const parts = [];
  let remaining = text;
  while (remaining.length) {
    const dollarIndex = remaining.indexOf("$");
    if (dollarIndex === -1) {
      parts.push({ type: "text", value: remaining });
      break;
    } else {
      if (dollarIndex > 0) {
        parts.push({ type: "text", value: remaining.slice(0, dollarIndex) });
      }
      const second = remaining.indexOf("$", dollarIndex + 1);
      if (second === -1) {
        parts.push({ type: "text", value: remaining.slice(dollarIndex) });
        break;
      }
      const expr = remaining.slice(dollarIndex + 1, second);
      parts.push({ type: "math", value: expr });
      remaining = remaining.slice(second + 1);
    }
  }

  return (
    <span>
      {parts.map((p, i) =>
        p.type === "text" ? (
          <span key={i}>{p.value}</span>
        ) : (
          <InlineMath math={p.value} key={i} />
        )
      )}
    </span>
  );
}
