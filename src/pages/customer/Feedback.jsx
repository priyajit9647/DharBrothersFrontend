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

export default function Feedback() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [existingFeedback, setExistingFeedback] = useState(null);

  useEffect(() => {
    const fetchFeedbackData = async () => {
      setLoading(true);
      setError(null);
      try {
        const existing = await getCustomerFeedbackByOrderId(orderId);
        if (existing && existing.feedbacks && existing.feedbacks.length > 0) {
          setExistingFeedback(existing.feedbacks);
        } else {
          const response = await getCustomerFeedbackQuestions();
          setQuestions(response);
          const initialRatings = {};
          Object.keys(response).forEach((key) => {
            initialRatings[key] = 0;
          });
          setRatings(initialRatings);
        }
      } catch (err) {
        setError(err?.message || 'Failed to load feedback data.');
      } finally {
        setLoading(false);
      }
    };
    fetchFeedbackData();
  }, [orderId]);

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      await createCustomerFeedbackForOrder(orderId, ratings);
      setSubmitting(false);
      setSubmitError(null);
    } catch (err) {
      setSubmitting(false);
      setSubmitError(err?.message || 'Failed to submit feedback.');
    }
  };

  return (
    <Box
      sx={{
        backgroundColor: 'grey.100',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        px: { xs: 2, sm: 4 },
        py: 6
      }}
    >
      <Box sx={{ width: '100%', maxWidth: 600, mx: 'auto' }}>
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', gap: 2, alignItems: 'center' }}>
          <Box>
            <Typography variant="h4">Customer Feedback</Typography>
            <Typography variant="body2" color="text.secondary">
              Provide feedback for order ID {orderId}
            </Typography>
          </Box>
        </Box>

        <MainCard content={false} sx={{ p: 3 }}>
          {loading ? (
            <CircularProgress />
          ) : error ? (
            <Typography color="error" sx={{ mb: 3 }}>
              {error}
            </Typography>
          ) : success ? (
            <Box sx={{ py: 6, textAlign: 'center' }}>
              <Typography variant="h6" color="success.main">Feedback submitted successfully!</Typography>
              <Button variant="contained" sx={{ mt: 2 }} onClick={() => navigate(`/customer/orders/view/${orderId}`)}>
                View Order
              </Button>
            </Box>
          ) : existingFeedback ? (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6">Feedback Already Submitted</Typography>
              </Grid>
              {existingFeedback.map((feedback) => (
                <Grid item xs={12} key={feedback.questionNo}>
                  <Typography variant="subtitle1" sx={{ mb: 1 }}>
                    {feedback.question}
                  </Typography>
                  <Rating name={`question-${feedback.questionNo}`} value={feedback.rating} readOnly precision={1} max={5} />
                </Grid>
              ))}
              <Grid item xs={12}>
                <Button variant="contained" onClick={() => navigate(`/customer/orders/view/${orderId}`)}>
                  Back to Order
                </Button>
              </Grid>
            </Grid>
          ) : (
            <Grid container spacing={3}>
              {Object.keys(questions).map((questionNo) => (
                <Grid item xs={12} key={questionNo}>
                  <Typography variant="subtitle1" sx={{ mb: 1 }}>
                    {questions[questionNo]}
                  </Typography>
                  <Rating
                    name={`question-${questionNo}`}
                    value={ratings[questionNo]}
                    onChange={(event, newValue) => handleRatingChange(questionNo, newValue)}
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
                  disabled={submitting || Object.values(ratings).some((rating) => rating === 0)}
                >
                  {submitting ? <CircularProgress size={24} /> : 'Submit Feedback'}
                </Button>
                {submitError && (
                  <Typography color="error" sx={{ mt: 2 }}>
                    {submitError}
                  </Typography>
                )}
              </Grid>
            </Grid>
          )}
        </MainCard>
      </Box>
    </Box>
  );
}
