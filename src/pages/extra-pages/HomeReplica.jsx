import React, { useEffect, useState, useRef } from 'react';
import { Box, Container, Stack, Typography, Button, Grid, Paper, TextField, IconButton } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { Link as RouterLink, useLocation } from 'react-router-dom';

import banner1 from 'assets/banner/banner1.jpg';
import banner2 from 'assets/banner/banner2.jpg';
import banner3 from 'assets/banner/banner3.jpg';
import headerLogo from 'assets/logo/hader-logo.png';
// Note: avoid importing @mui icons here to prevent missing-package resolution errors

// reuse the public header pieces from PlaceOrder (visual header only)
import { TopInfoBar, HeaderNav } from './PlaceOrder';

export default function HomeReplica() {
  const theme = useTheme();
  const slides = [
    { id: 0, image: banner1, text: 'Setting Global Standards\nSince the 1930s' },
    { id: 1, image: banner2, text: 'From Humble Beginnings to Global Recognition' },
    { id: 2, image: banner3, text: 'Your Trusted Partner in Thesis Printing & Binding' }
  ];

  const [activeIndex, setActiveIndex] = useState(0);
  const sliderTimer = useRef(null);

  useEffect(() => {
    const start = () => {
      if (sliderTimer.current) clearInterval(sliderTimer.current);
      sliderTimer.current = setInterval(() => {
        setActiveIndex((prev) => (prev + 1) % slides.length);
      }, 5000);
    };

    start();

    return () => {
      if (sliderTimer.current) clearInterval(sliderTimer.current);
    };
  }, [slides.length]);
  const location = useLocation();

  // If a hash is provided in the URL (e.g. /home#what-we-do), smoothly scroll to it
  useEffect(() => {
    if (location && location.hash) {
      const id = location.hash.replace('#', '');
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 80);
    }
  }, [location]);

  const goPrev = () => {
    setActiveIndex((prev) => (prev - 1 + slides.length) % slides.length);
    if (sliderTimer.current) {
      clearInterval(sliderTimer.current);
      sliderTimer.current = setInterval(() => setActiveIndex((p) => (p + 1) % slides.length), 5000);
    }
  };

  const goNext = () => {
    setActiveIndex((prev) => (prev + 1) % slides.length);
    if (sliderTimer.current) {
      clearInterval(sliderTimer.current);
      sliderTimer.current = setInterval(() => setActiveIndex((p) => (p + 1) % slides.length), 5000);
    }
  };

  const stopTimer = () => {
    if (sliderTimer.current) {
      clearInterval(sliderTimer.current);
      sliderTimer.current = null;
    }
  };

  const startTimer = () => {
    if (sliderTimer.current) clearInterval(sliderTimer.current);
    sliderTimer.current = setInterval(() => setActiveIndex((p) => (p + 1) % slides.length), 5000);
  };

  const stats = [
    { emoji: '📜', value: '1930', label: 'Year Since Established' },
    { emoji: '🌍', value: '9', label: 'Clients in How Many Countries/States/Cities' },
    { emoji: '⏳', value: '90', label: 'Years/Hours of Experience of All Employee N' },
    { emoji: '📦', value: '500000', label: 'Total units Sold' }
  ];

  const servicesList = [
    { key: 'hard', label: 'Hard Thesis Binding' },
    { key: 'soft', label: 'Soft Thesis Binding' },
    { key: 'synopsis', label: 'Synopsis' },
    { key: 'thesis', label: 'Thesis Binding' }
  ];

  const [activeService, setActiveService] = useState('hard');

  const testimonials = [
    {
      name: 'Archan Nandi',
      text: 'Excellent service in providing thesis printing and binding in the entire eastern region. All the staff members are very friendly and polite.'
    },
    {
      name: 'Anirban Ganguly',
      text: 'One of the best in Kolkata when it comes to thesis or dissertation binding. The quality they provide at a reasonable amount is one of the best features of Dhar Brothers.'
    },
    {
      name: 'Devdeep Banerjee',
      text: 'Very good experience. Delivery timing is also very good. Service provided is methodical, systematic and particular.'
    }
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'common.white' }}>
      <TopInfoBar />
      <HeaderNav pageTitle="Order Thesis Online" hideOrderButton={false} />

      {/* Hero (auto slider) */}
      <Box
        component="section"
        onMouseEnter={stopTimer}
        onMouseLeave={startTimer}
        sx={{ position: 'relative', height: { xs: 420, md: 520 }, color: '#fff', overflow: 'hidden' }}
      >
        {/* slides */}
        {slides.map((s, idx) => (
          <Box
            key={s.id}
            sx={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `url(${s.image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              transition: 'opacity 800ms ease, transform 800ms ease',
              opacity: idx === activeIndex ? 1 : 0,
              transform: idx === activeIndex ? 'translateX(0)' : 'translateX(18px)',
              zIndex: idx === activeIndex ? 2 : 1
            }}
          />
        ))}

        <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(0,0,0,0.6)', zIndex: 3 }} />

        {/* left/right circular arrows */}
        <Box sx={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', zIndex: 6 }}>
          <IconButton
            onClick={goPrev}
            aria-label="previous slide"
            sx={{
              bgcolor: 'transparent',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.28)',
              width: 36,
              height: 36,
              borderRadius: '50%'
            }}
          >
            <Box component="span" sx={{ fontSize: 18, lineHeight: 1 }}>&lsaquo;</Box>
          </IconButton>
        </Box>
        <Box sx={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', zIndex: 6 }}>
          <IconButton
            onClick={goNext}
            aria-label="next slide"
            sx={{
              bgcolor: 'transparent',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.28)',
              width: 36,
              height: 36,
              borderRadius: '50%'
            }}
          >
            <Box component="span" sx={{ fontSize: 18, lineHeight: 1 }}>&rsaquo;</Box>
          </IconButton>
        </Box>

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 4, height: '100%' }}>
          <Stack sx={{ height: '100%' }} justifyContent="center">
            <Box sx={{ maxWidth: 760 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ height: 1, width: 64, bgcolor: 'rgba(255,255,255,0.28)' }} />
                <Typography
                  sx={{
                    fontSize: { xs: '0.85rem', md: '0.95rem' },
                    fontWeight: 500,
                    letterSpacing: 1.5,
                    color: 'rgba(255,255,255,0.9)'
                  }}
                >
                  Pioneers in Thesis Composition
                </Typography>
                <Box sx={{ flex: 1, height: 1, bgcolor: 'rgba(255,255,255,0.18)' }} />
              </Box>

              <Typography
                sx={{
                  fontSize: { xs: '1.9rem', md: '4.6rem' },
                  fontWeight: 700,
                  lineHeight: 1.02,
                  mt: 2,
                  letterSpacing: 0.5
                }}
              >
                {slides[activeIndex].text.split('\n').map((line, i) => (
                  <React.Fragment key={i}>
                    {line}
                    <br />
                  </React.Fragment>
                ))}
              </Typography>

              <Typography sx={{ fontSize: { xs: '1.8rem', md: '3.8rem' }, mt: 1.5, letterSpacing: 4, fontWeight: 300 }}>
                DHARBROTHERS
              </Typography>

              <Box sx={{ mt: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
                <Button
                  component={RouterLink}
                  to="/order"
                  sx={{
                    px: 4,
                    py: 1.6,
                    bgcolor: '#f5e8a8',
                    color: '#1f2937',
                    boxShadow: 'none',
                    borderRadius: 0,
                    textTransform: 'none',
                    fontWeight: 600,
                    '&:hover': { bgcolor: '#f2df7f' }
                  }}
                >
                  Order Thesis Online
                </Button>

                <Button
                  component={RouterLink}
                  to="/contact"
                  sx={{
                    color: 'rgba(255,255,255,0.95)',
                    textTransform: 'none',
                    borderBottom: '2px solid rgba(255,255,255,0.3)',
                    fontSize: '0.95rem',
                    pl: 0
                  }}
                >
                  Need Help? Contact Us
                </Button>
              </Box>
            </Box>
          </Stack>
        </Container>

        {/* dots */}
        <Box sx={{ position: 'absolute', bottom: 18, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 1, zIndex: 5 }}>
          {slides.map((_, i) => (
            <Box
              key={i}
              onClick={() => setActiveIndex(i)}
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: i === activeIndex ? '#14a0a5' : 'rgba(255,255,255,0.45)',
                cursor: 'pointer'
              }}
            />
          ))}
        </Box>
      </Box>

      {/* What We Do (grid of service cards matching reference) */}
      <Box component="section" id="what-we-do" sx={{ py: { xs: 6, md: 10 }, bgcolor: 'common.white' }}>
        <Container maxWidth="lg">
          <Typography sx={{ textAlign: 'center', fontSize: { xs: '1.6rem', md: '1.9rem' }, fontWeight: 700, mb: 4 }}>What We Do</Typography>

          <Grid container spacing={4} alignItems="stretch">
            {[
              { title: 'Hard Thesis Binding', img: banner1, desc: 'At Dhar Brothers, we understand the significance of presenting your thesis or dissertation in a manner that reflects the dedication and rigor you’ve invested in your research.' },
              { title: 'Soft Thesis Binding', img: banner2, desc: 'Soft binding is an art form that requires precision, care, and attention to detail. At Dhar Brothers, we have perfected the craft of soft binding to offer you a solution that is both elegant and durable.' },
              { title: 'Synopsis', img: banner3, desc: 'At Dhar Brothers, we understand the importance of succinctly summarizing complex scholarly works. Our Synopsis Service offers a professional solution for condensing the essence of your work.' },
              { title: 'Thesis Binding', img: banner2, desc: 'Dhar Brothers is proud to present Thesis on Demand, a convenient and streamlined service designed to simplify the process of thesis submission.' }
            ].map((card, idx) => (
              <Grid item xs={12} sm={6} md={3} key={card.title}>
                <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <Box component="img" src={card.img} alt={card.title} sx={{ width: '100%', height: { xs: 180, md: 220 }, objectFit: 'cover', display: 'block', mb: 2 }} />

                  <Typography sx={{ fontSize: { xs: '1rem', md: '1.05rem' }, fontWeight: 600, mb: 1 }}>{card.title}</Typography>
                  <Typography sx={{ color: 'text.secondary', fontSize: { xs: '0.9rem', md: '0.95rem' }, lineHeight: 1.85, flex: 1 }}>{card.desc}</Typography>

                  <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <Box sx={{ width: '70%', height: 1, bgcolor: 'divider', position: 'relative' }}>
                      <Box sx={{ position: 'absolute', left: '50%', top: -18, transform: 'translateX(-50%)' }}>
                        <Box sx={{ width: 36, height: 36, borderRadius: '50%', border: '1px solid', borderColor: 'divider', display: 'grid', placeItems: 'center', bgcolor: 'common.white' }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 12h14M13 5l6 7-6 7" stroke="#111827" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* About */}
      <Box component="section" sx={{ py: { xs: 6, md: 10 } }}>
        <Container maxWidth="lg">
          <Typography sx={{ textAlign: 'center', fontSize: '1.6rem', fontWeight: 700, mb: 3 }}>About Dhar Brothers</Typography>

          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, md: 6 },
              border: '1px solid #efeef0',
              position: 'relative'
            }}
          >
            <Typography sx={{ color: 'text.secondary', fontSize: '0.95rem', lineHeight: 1.9 }}>
              We, Dhar Brothers, had a humble start back in the 1930s and today we take pride in saying that we have reached the
              pinnacle of thesis/dissertation composing, printing and binding. Our works have been submitted to all major universities around the globe.
              We have a happy customer base of over a thousand to our credit.
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Button
                component={RouterLink}
                to="/about"
                sx={{ px: 3, py: 1.1, bgcolor: '#f5e8a8', color: '#1f2937', borderRadius: 0, boxShadow: 'none', fontWeight: 600 }}
              >
                Know More
              </Button>
            </Box>
          </Paper>

          <Grid container spacing={2} sx={{ mt: 3 }}>
            {stats.map((s) => (
              <Grid item xs={12} md={3} key={s.label}>
                <Box sx={{ p: 2, textAlign: 'center', border: '1px solid #f1f1f1', bgcolor: 'common.white' }}>
                  <Typography sx={{ fontSize: '1.25rem', fontWeight: 700 }}>{s.value}</Typography>
                  <Typography sx={{ fontSize: '0.82rem', color: 'text.secondary' }}>{s.label}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Statistics */}
      <Box component="section" sx={{ py: { xs: 4, md: 6 }, bgcolor: '#fff' }}>
        <Container maxWidth="lg">
          <Grid container spacing={2}>
            {stats.map((s, i) => (
              <Grid item xs={6} md={3} key={s.label}>
                <Paper sx={{ p: 3, textAlign: 'center', border: '1px solid #f1f1f1' }} elevation={0}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                    <Typography sx={{ fontSize: 28 }}>{s.emoji}</Typography>
                  </Box>
                  <Typography sx={{ fontSize: '1.4rem', fontWeight: 700 }}>{s.value}</Typography>
                  <Typography sx={{ color: 'text.secondary', fontSize: '0.9rem' }}>{s.label}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      

      {/* Testimonials */}
      <Box component="section" sx={{ py: { xs: 6, md: 10 } }}>
        <Container maxWidth="lg">
          <Typography sx={{ textAlign: 'center', fontSize: '1.6rem', fontWeight: 700, mb: 3 }}>Customer Saying</Typography>

          <Grid container spacing={3}>
            {testimonials.map((t, idx) => (
              <Grid item xs={12} md={4} key={t.name + idx}>
                <Paper sx={{ p: 3, minHeight: 180, border: '1px solid #f1f1f1' }} elevation={0}>
                  <Typography sx={{ mb: 1, color: 'text.secondary' }}>★★★★★</Typography>
                  <Typography sx={{ fontWeight: 600, mb: 1 }}>{t.name}</Typography>
                  <Typography sx={{ color: 'text.secondary', fontSize: '0.95rem' }}>{t.text}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Get In Touch */}
      <Box component="section" sx={{ py: { xs: 6, md: 10 }, bgcolor: '#fff' }}>
        <Container maxWidth="lg">
          <Box sx={{ position: 'relative' }}>
            <Box sx={{ bgcolor: '#14a0a5', height: 220, width: '100%', position: 'absolute', left: 0, top: 30, zIndex: 0 }} />

            <Grid container spacing={3} sx={{ position: 'relative', zIndex: 2 }}>
              <Grid item xs={12} md={6}>
                <Box component="img" src={banner3} alt="contact" sx={{ width: '100%', boxShadow: 3 }} />
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 4, maxWidth: 480, mx: { xs: 0, md: 'auto' } }}>
                  <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, mb: 2 }}>Get In Touch</Typography>
                  <Stack spacing={2}>
                    <TextField size="small" placeholder="Name" />
                    <TextField size="small" placeholder="Phone" />
                    <TextField size="small" placeholder="Email" />
                    <TextField size="small" placeholder="Message" multiline rows={4} />
                    <Button sx={{ bgcolor: '#f5e8a8', color: '#1f2937', borderRadius: 0 }}>Submit</Button>
                  </Stack>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        </Container>
      </Box>

      {/* Footer (simplified) */}
      <Box component="footer" sx={{ bgcolor: '#0ea5a4', color: '#fff', py: 6 }}>
        <Container maxWidth="lg">
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Box component="img" src={headerLogo} alt="logo" sx={{ maxWidth: 160 }} />
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography>Home | What We Do | About Us | Testimonials</Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography>Call: + ( 91 ) 983 006 6537</Typography>
              <Typography>Email: contactus@dharbrothers.com</Typography>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
}
