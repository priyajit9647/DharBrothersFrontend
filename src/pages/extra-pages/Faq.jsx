import React from 'react';
import { Box, Container, Grid, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';

import banner3 from 'assets/banner/banner3.jpg';

// reuse header/footer pieces
import { HeaderNav, TopInfoBar, FooterSection } from './PlaceOrder';
import AccordionGroup from 'components/Accordion';

export default function Faq() {
  const theme = useTheme();

  const printing = [
    { question: 'What is the minimum number of pages for a bound thesis?', answer: 'Minimum pages depend on the university guidelines. Typical minimums are 20-30 pages, but please check your university requirements.' },
    { question: 'What is the maximum number of pages for a bound thesis?', answer: 'We can bind very large documents; please contact us for very large page counts so we can advise on binding options.' }
  ];

  const binding = [
    { question: 'What colours do you have for Thesis covers?', answer: 'We stock a wide range of standard colours; please check our cover catalogue or contact us for special colours.' },
    { question: 'Can I order special colors for my Thesis covers?', answer: 'Yes — special colours can be ordered subject to availability and may incur additional lead time.' }
  ];

  const delivery = [
    { question: 'What is the process of return postage or courier delivery?', answer: 'We pack your thesis securely and ship via trusted courier partners. You will receive tracking information once dispatched.' }
  ];

  const payment = [
    { question: 'How do I make my payments?', answer: 'We accept online payments, bank transfers and in-person payments as per the order instructions. Follow the checkout steps on the order page.' }
  ];

  const workingTime = [
    { question: 'What are Your Opening Hours?', answer: 'Our showroom is open Mon–Sat, 10:00 AM – 7:00 PM. Please call ahead for any special arrangements.' },
    { question: 'What is The Turn Around Time?', answer: 'Typical turnaround time varies by job size; most standard thesis jobs are ready within 2–5 business days.' }
  ];

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'common.white' }}>
      <TopInfoBar />
      <HeaderNav pageTitle="Order Thesis Online" hideOrderButton={false} />

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Hero */}
        <Box component="section" sx={{ position: 'relative', height: { xs: 160, md: 220 }, overflow: 'hidden' }}>
          <Box component="img" src={banner3} alt="faq-hero" sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
          <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(0,0,0,0.35)' }} />
          <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2, height: '100%' }}>
            <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
              <Box>
                <Typography sx={{ color: '#fff', fontSize: { xs: '1.6rem', md: '2.25rem' }, fontWeight: 600 }}>Faq</Typography>
                <Typography sx={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.9rem', mt: 1 }}>Home / Faq</Typography>
              </Box>
            </Box>
          </Container>
        </Box>

        {/* FAQ content */}
        <Container maxWidth="lg" sx={{ py: { xs: 5, md: 10 }, flex: 1, display: 'flex', justifyContent: 'center' }}>
          <Grid container justifyContent="center">
            <Grid item xs={12} md={8}>
              <Box sx={{ maxWidth: 760, mx: 'auto' }}>
                <AccordionGroup
                  title="Printing"
                  items={printing}
                  questionSx={{ fontSize: { xs: '1.02rem', md: '1.12rem' }, fontWeight: 600, lineHeight: 1.9 }}
                  answerSx={{ fontSize: { xs: '0.98rem', md: '1.02rem' }, fontWeight: 500, lineHeight: 1.9 }}
                  itemSx={{ py: { xs: 2.25, md: 3 } }}
                />

                <AccordionGroup
                  title="Binding"
                  items={binding}
                  questionSx={{ fontSize: { xs: '1.02rem', md: '1.12rem' }, fontWeight: 600, lineHeight: 1.9 }}
                  answerSx={{ fontSize: { xs: '0.98rem', md: '1.02rem' }, fontWeight: 500, lineHeight: 1.9 }}
                  itemSx={{ py: { xs: 2.25, md: 3 } }}
                />

                <AccordionGroup title="Delivery" items={delivery} />

                <AccordionGroup title="Payment" items={payment} />

                <AccordionGroup title="Opening Time" items={workingTime} />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Footer-style info area */}
      <FooterSection />
    </Box>
  );
}
