import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Rating from '@mui/material/Rating';
import CircularProgress from '@mui/material/CircularProgress';
import MainCard from 'components/MainCard';

import { getCustomerFeedbackQuestions, createCustomerFeedbackForOrder, getCustomerFeedbackByOrderId } from 'api/customerPortal';

// Normalize various server shapes into an array of { questionNo, question }
function normalizeQuestions(resp) {
  if (!resp) return [];
  const out = [];

  if (Array.isArray(resp)) {
    resp.forEach((item, idx) => {
      if (typeof item === 'string') {
        out.push({ questionNo: idx + 1, question: item });
        return;
      }
      if (item && typeof item === 'object') {
        const q = item.question ?? item.text ?? item.label ?? item.questionText ?? '';
        const qNo = item.questionNo ?? item.id ?? item.key ?? idx + 1;
        if (q) out.push({ questionNo: qNo, question: q });
      }
    });
    return out;
  }

  if (resp && typeof resp === 'object') {
    Object.entries(resp).forEach(([key, val], idx) => {
      if (typeof val === 'string') {
        out.push({ questionNo: key, question: val });
        return;
      }
      if (val && typeof val === 'object') {
        const q = val.question ?? val.text ?? val.label ?? val.questionText ?? '';
        const qNo = val.questionNo ?? val.id ?? key ?? idx + 1;
        if (q) out.push({ questionNo: qNo, question: q });
      }
    });
  }

  return out;
}

function normalizeExistingFeedback(resp) {
  if (!resp) return [];
  let arr = [];
  if (Array.isArray(resp)) arr = resp;
  else if (Array.isArray(resp.feedbacks)) arr = resp.feedbacks;
  else if (Array.isArray(resp.data)) arr = resp.data;
  else arr = [];

  return arr
    .map((item, idx) => {
      if (!item) return null;
      const questionNo = item.questionNo ?? item.id ?? item.question_id ?? idx + 1;
      const question = item.question ?? item.text ?? item.questionText ?? '';
      const rating = item.rating ?? item.score ?? null;
      return { questionNo, question, rating };
    })
    .filter(Boolean);
}

export default function Feedback() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // questions: array of { questionNo, question }
  const [questions, setQuestions] = useState([]);
  // existingFeedback: array of { questionNo, question, rating }
  const [existingFeedback, setExistingFeedback] = useState([]);
  const [ratings, setRatings] = useState({});

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      if (!orderId) return;
      setLoading(true);
      setError(null);
      setExistingFeedback([]);
      setQuestions([]);
      setRatings({});

      try {
        const [fbRes, qRes] = await Promise.allSettled([
          getCustomerFeedbackByOrderId(orderId),
          getCustomerFeedbackQuestions()
        ]);

        const questionList = qRes.status === 'fulfilled' ? normalizeQuestions(qRes.value) : [];
        const existingList = fbRes.status === 'fulfilled' ? normalizeExistingFeedback(fbRes.value) : [];

        // Build a map for question lookup by questionNo (string keys)
        const qMap = new Map();
        questionList.forEach((q) => qMap.set(String(q.questionNo), q.question));

        // Try to enrich existing feedback items with question text from questions list
        const enriched = existingList
          .map((fb) => {
            const qText = fb.question || qMap.get(String(fb.questionNo)) || '';
            return { questionNo: fb.questionNo, question: qText, rating: fb.rating };
          })
          .filter((it) => it && (it.question || it.rating != null));

        if (enriched.length > 0) {
          if (!mounted) return;
          setExistingFeedback(enriched);
          setQuestions([]);
          setRatings({});
          return;
        }

        // No existing feedback found, but questions are available for submission
        if (questionList.length > 0) {
          if (!mounted) return;
          setQuestions(questionList);
          const initial = {};
          questionList.forEach((q) => {
            const key = String(q.questionNo ?? q.index ?? Math.random());
            initial[key] = 0;
          });
          setRatings(initial);
          return;
        }

        // Neither feedback nor questions
        if (!mounted) return;
        setExistingFeedback([]);
        setQuestions([]);
      } catch (err) {
        if (!mounted) return;
        setError(err?.message || 'Failed to load feedback data.');
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [orderId]);

  const handleRatingChange = (questionNo, value) => {
    setRatings((prev) => ({ ...prev, [String(questionNo)]: value || 0 }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const feedbacks = Object.entries(ratings)
        .map(([k, v]) => ({ questionNo: Number(k) && !Number.isNaN(Number(k)) ? Number(k) : k, rating: v }))
        .filter((f) => f.rating && f.rating > 0);

      if (feedbacks.length === 0) {
        setSubmitError('Please provide at least one rating before submitting.');
        setSubmitting(false);
        return;
      }

      await createCustomerFeedbackForOrder(orderId, { feedbacks });
      setSuccess(true);
    } catch (err) {
      setSubmitError(err?.message || 'Failed to submit feedback.');
    } finally {
      setSubmitting(false);
    }
  };

  const hasQuestionsToAnswer = Array.isArray(questions) && questions.length > 0;
  const hasExisting = Array.isArray(existingFeedback) && existingFeedback.length > 0;

  return (
    <Box sx={{ backgroundColor: 'grey.100', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', px: { xs: 2, sm: 4 }, py: 6 }}>
      <Box sx={{ width: '100%', maxWidth: 700, mx: 'auto' }}>
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', gap: 2, alignItems: 'center' }}>
          <Box>
            <Typography variant="h4">Customer Feedback</Typography>
            <Typography variant="body2" color="text.secondary">Order ID {orderId}</Typography>
          </Box>
        </Box>

        <MainCard content={false} sx={{ p: 3 }}>
          {loading ? (
            <Box sx={{ py: 6, textAlign: 'center' }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Typography color="error" sx={{ mb: 3 }}>{error}</Typography>
          ) : success ? (
            <Box sx={{ py: 6, textAlign: 'center' }}>
              <Typography variant="h6" color="success.main">Feedback submitted successfully!</Typography>
              <Button variant="contained" sx={{ mt: 2 }} onClick={() => navigate(`/customer/orders/view/${orderId}`)}>View Order</Button>
            </Box>
          ) : hasExisting ? (
            <Grid container spacing={3}>
              <Grid item xs={12}><Typography variant="h6">Submitted Feedback</Typography></Grid>
              {existingFeedback.map((fb) => (
                <Grid item xs={12} key={String(fb.questionNo)}>
                  <Typography variant="subtitle1" sx={{ mb: 1 }}>{fb.question}</Typography>
                  <Rating name={`question-${fb.questionNo}`} value={Number(fb.rating) || 0} readOnly precision={1} max={5} />
                </Grid>
              ))}
              <Grid item xs={12}><Button variant="contained" onClick={() => navigate(`/customer/orders/view/${orderId}`)}>Back to Order</Button></Grid>
            </Grid>
          ) : hasQuestionsToAnswer ? (
            <Grid container spacing={3}>
              {questions.map((q) => (
                <Grid item xs={12} key={String(q.questionNo)}>
                  <Typography variant="subtitle1" sx={{ mb: 1 }}>{q.question}</Typography>
                  <Rating
                    name={`question-${q.questionNo}`}
                    value={ratings[String(q.questionNo)]}
                    onChange={(e, v) => handleRatingChange(q.questionNo, v)}
                    precision={1}
                    max={5}
                  />
                </Grid>
              ))}
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSubmit}
                  disabled={submitting || Object.values(ratings).every((r) => !r)}
                >
                  {submitting ? <CircularProgress size={24} /> : 'Submit Feedback'}
                </Button>
                {submitError && <Typography color="error" sx={{ mt: 2 }}>{submitError}</Typography>}
              </Grid>
            </Grid>
          ) : (
            <Box sx={{ py: 6, textAlign: 'center' }}>
              <Typography variant="h6">No Feedback Available</Typography>
            </Box>
          )}
        </MainCard>
      </Box>
    </Box>
  );
}
