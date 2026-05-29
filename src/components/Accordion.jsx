import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Box, Typography } from '@mui/material';
import Collapse from '@mui/material/Collapse';
import { useTheme } from '@mui/material/styles';

export default function AccordionGroup({ title, items = [], questionSx = {}, answerSx = {}, itemSx = {} }) {
  const theme = useTheme();
  const [openIndex, setOpenIndex] = useState(null);

  const handleToggle = (idx) => {
    setOpenIndex((prev) => (prev === idx ? null : idx));
  };

  const wrapperSx = { mb: 4 };

  return (
    <Box sx={wrapperSx}>
      <Typography sx={{ fontSize: { xs: '1.05rem', md: '1.15rem' }, fontWeight: 700, mb: 1 }}>{title}</Typography>
      <Box sx={{ width: 84, height: 3, bgcolor: theme.palette.info.main, mb: 2 }} />

      <Box sx={{ bgcolor: 'transparent' }}>
        {items.map((it, idx) => {
          const open = openIndex === idx;

          return (
            <Box key={idx} sx={{ borderBottom: '1px solid', borderColor: 'divider', py: 2, ...itemSx }}>
              <Box
                role="button"
                onClick={() => handleToggle(idx)}
                tabIndex={0}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleToggle(idx)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  gap: 2,
                  '&:hover': { color: 'info.main' }
                }}
              >
                <Typography sx={{ color: 'text.primary', ...questionSx }}>{it.question}</Typography>

                <Box
                  sx={{
                    transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 250ms ease',
                    display: 'grid',
                    placeItems: 'center'
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 9l6 6 6-6" stroke={theme.palette.text.primary} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Box>
              </Box>

              <Collapse in={open} timeout="auto" unmountOnExit>
                <Box sx={{ mt: 2, color: 'text.secondary', ...answerSx }}>{it.answer}</Box>
              </Collapse>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

AccordionGroup.propTypes = {
  title: PropTypes.string.isRequired,
  items: PropTypes.arrayOf(
    PropTypes.shape({
      question: PropTypes.string.isRequired,
      answer: PropTypes.string
    })
  ),
  questionSx: PropTypes.object,
  answerSx: PropTypes.object,
  itemSx: PropTypes.object
};

