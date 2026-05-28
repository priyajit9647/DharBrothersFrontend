import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Rating from '@mui/material/Rating';
import CircularProgress from '@mui/material/CircularProgress';
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import MainCard from 'components/MainCard';
import Paper from '@mui/material/Paper';

import { BookOpen, Printer, Truck, Users, Headphones, Send, Star } from 'lucide-react';

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
    <Box sx={{ backgroundColor: 'grey.100', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', px: { xs: 2, sm: 4 }, py: 6 }}>
      <Box sx={{ width: '100%', maxWidth: 1000, mx: 'auto' }}>
        {/* Header banner */}
        <Box sx={{ mb: 3 }}>
          <Paper sx={{ p: 3.5, borderRadius: 2.5, display: 'flex', alignItems: 'center', gap: 3, background: 'linear-gradient(90deg,#f3f8ff 0%, #ffffff 100%)' }}>
            <Avatar sx={{ bgcolor: '#2563eb', width: 72, height: 72, boxShadow: '0 6px 18px rgba(37,99,235,0.12)' }}>
              <Star color="#fff" size={24} />
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: '-0.2px' }}>Customer Feedback</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>We value your opinion! Please share your experience with us.</Typography>
              <Box sx={{ mt: 1 }}>
                <Button size="small" variant="contained" onClick={() => {}} sx={{ background: '#eef6ff', color: '#2563eb', textTransform: 'none', boxShadow: 'none', '&:hover': { background: '#e6f0ff' } }}>
                  Order ID: {orderId}
                </Button>
              </Box>
            </Box>
          </Paper>
        </Box>

        <MainCard content={false} sx={{ p: 3 }}>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>Please rate the following aspects of your experience</Typography>

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
              {existingFeedback.map((fb, idx) => (
                <Grid item xs={12} sm={6} key={String(fb.questionNo)}>
                  <Box sx={{ p: 2.25, borderRadius: 1.75, background: '#fff', display: 'flex', alignItems: 'center', gap: 2.25, boxShadow: '0 6px 20px rgba(2,6,23,0.04)', transition: 'transform 200ms ease, box-shadow 200ms ease', '&:hover': { transform: 'translateY(-6px)', boxShadow: '0 18px 40px rgba(2,6,23,0.12)' }, '&:active': { transform: 'translateY(-2px) scale(0.997)' } }}>
                    <Avatar sx={{ bgcolor: '#eef2ff', width: 56, height: 56, border: '1px solid rgba(37,99,235,0.10)', boxShadow: '0 8px 22px rgba(37,99,235,0.06)' }}>
                      <BookOpen color="#2563eb" size={22} />
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 700 }}>{fb.question}</Typography>
                      <Rating name={`question-${fb.questionNo}`} value={Number(fb.rating) || 0} readOnly precision={1} max={5} sx={{ color: 'warning.main' }} />
                    </Box>
                  </Box>
                </Grid>
              ))}
              <Grid item xs={12}>
                <Button variant="contained" fullWidth onClick={() => navigate(`/customer/orders/view/${orderId}`)}>Back to Order</Button>
              </Grid>
            </Grid>
          ) : hasQuestionsToAnswer ? (
            <>
              <Grid container spacing={3}>
                {questions.map((q, idx) => {
                  const iconPool = [
                    { icon: <BookOpen color="#2563eb" size={22} />, color: '#eef2ff', ring: 'rgba(37,99,235,0.10)' },
                    { icon: <Printer color="#f97316" size={22} />, color: '#fff6ed', ring: 'rgba(249,115,22,0.10)' },
                    { icon: <Truck color="#7c3aed" size={22} />, color: '#f3f0ff', ring: 'rgba(124,58,237,0.10)' },
                    { icon: <Users color="#f59e0b" size={22} />, color: '#fffbeb', ring: 'rgba(245,158,11,0.10)' },
                    { icon: <Headphones color="#ec4899" size={22} />, color: '#fff0f6', ring: 'rgba(236,72,153,0.10)' }
                  ];
                  const pick = iconPool[idx % iconPool.length];
                  return (
                    <Grid item xs={12} sm={6} key={String(q.questionNo)}>
                      <Box sx={{ p: 2.25, borderRadius: 1.75, background: '#fff', display: 'flex', alignItems: 'center', gap: 2.25, boxShadow: '0 6px 20px rgba(2,6,23,0.04)', transition: 'transform 200ms ease, box-shadow 200ms ease', '&:hover': { transform: 'translateY(-6px)', boxShadow: '0 18px 40px rgba(2,6,23,0.12)' } }}>
                        <Avatar sx={{ bgcolor: pick.color, width: 56, height: 56, border: `1px solid ${pick.ring}`, boxShadow: '0 8px 22px rgba(2,6,23,0.04)' }}>{pick.icon}</Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 700 }}>{q.question}</Typography>
                          <Rating
                            name={`question-${q.questionNo}`}
                            value={ratings[String(q.questionNo)]}
                            onChange={(e, v) => handleRatingChange(q.questionNo, v)}
                            precision={1}
                            max={5}
                            sx={{ color: 'warning.main' }}
                          />
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>Tap a star to rate</Typography>
                        </Box>
                      </Box>
                    </Grid>
                  );
                })}
              </Grid>

              <Box sx={{ mt: 4 }}>
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={submitting || Object.values(ratings).every((r) => !r)}
                  fullWidth
                  sx={{ py: 1.75, fontWeight: 800, borderRadius: 2, background: 'linear-gradient(90deg,#2563eb 0%, #1e40af 100%)', boxShadow: '0 8px 24px rgba(37,99,235,0.18)', transition: 'transform 160ms ease, box-shadow 160ms ease', '&:hover': { boxShadow: '0 12px 32px rgba(30,64,175,0.22)', transform: 'translateY(-3px)' }, '&:active': { transform: 'translateY(0) scale(0.995)' } }}
                >
                  {submitting ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : (
                    <Stack direction="row" spacing={1} alignItems="center" justifyContent="center" sx={{ color: '#fff' }}>
                      <Send size={16} />
                      <span>Submit Feedback</span>
                    </Stack>
                  )}
                </Button>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2, textAlign: 'center' }}>Your feedback is secure and helps us improve our services.</Typography>
                {submitError && <Typography color="error" sx={{ mt: 2 }}>{submitError}</Typography>}
              </Box>
            </>
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
