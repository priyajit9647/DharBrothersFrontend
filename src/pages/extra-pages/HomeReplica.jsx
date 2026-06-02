import { useEffect, useState, useRef } from 'react';
import { Box, Container, Stack, Typography, Button, Grid, Paper, TextField, IconButton } from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';

import banner1 from 'assets/banner/banner1.jpg';
import banner2 from 'assets/banner/banner2.jpg';
import banner3 from 'assets/banner/banner3.jpg';
import headerLogo from 'assets/logo/hader-logo.png';
import { FileText, Globe, Users, Package } from 'lucide-react';
// icons removed from this page
// Note: avoid importing @mui icons here to prevent missing-package resolution errors

// reuse the public header pieces from PlaceOrder (visual header only)
import { TopInfoBar, HeaderNav } from './PlaceOrder';

export default function HomeReplica() {
  const slides = [
    { id: 0, image: banner1, small: 'Crafting Excellence Since 1930', title: 'Your Trusted Partner in Thesis Printing and Binding' },
    { id: 1, image: banner2, small: '95 Years of Thesis Mastery', title: 'From Humble Beginnings to Global Recognition' },
    { id: 2, image: banner3, small: 'Pioneers of Thesis Composition', title: 'Setting Global Standards Since the 1930s' }
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
    { icon: FileText, value: '1930', label: 'Year Since Established' },
    { icon: Globe, value: '9', label: 'Clients in How Many Countries/States/Cities' },
    { icon: Users, value: '90', label: 'Years/Hours of Experience of All Employee N' },
    { icon: Package, value: '500000', label: 'Total Units Sold' }
  ];

  // Per-icon vertical offsets (translateY) to fine-tune overlap visual
  const iconOffsets = ['-56%', '-48%', '-52%', '-48%'];

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
                  {slides[activeIndex].small}
                </Typography>
                <Box sx={{ flex: 1, height: 1, bgcolor: 'rgba(255,255,255,0.18)' }} />
              </Box>

              <Typography
                sx={{
                  fontSize: { xs: '1.9rem', md: '3.6rem' },
                  fontWeight: 700,
                  lineHeight: 1.02,
                  mt: 2,
                  letterSpacing: 0.5
                }}
              >
                {slides[activeIndex].title}
              </Typography>

              <Typography sx={{ fontSize: { xs: '1.6rem', md: '3rem' }, mt: 1.5, letterSpacing: 4, fontWeight: 300 }}>
                DHARBROTHERS
              </Typography>

              <Box sx={{ mt: 3, display: 'flex', gap: 3, alignItems: 'flex-start' }}>
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
                  Dhar Brothers Online
                </Button>

                <Stack spacing={0.5} sx={{ mt: 0.25 }}>
                  <Button
                    component={RouterLink}
                    to="/contact"
                    sx={{
                      color: 'rgba(255,255,255,0.95)',
                      textTransform: 'none',
                      fontSize: '0.95rem',
                      pl: 0,
                      justifyContent: 'flex-start'
                    }}
                  >
                    Need Help?
                  </Button>
                  <Button
                    component={RouterLink}
                    to="/contact"
                    sx={{
                      color: 'rgba(255,255,255,0.95)',
                      textTransform: 'none',
                      fontSize: '0.95rem',
                      pl: 0,
                      justifyContent: 'flex-start'
                    }}
                  >
                    Contact Us
                  </Button>
                </Stack>
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

      {/* Services block moved below to appear after About/Statistics */}

      {/* About (redesigned to match About page references) */}
      <Box component="section" sx={{ py: { xs: 6, md: 12 }, bgcolor: '#fff' }}>
        <Container maxWidth="lg">
          <Box sx={{ maxWidth: 1100, mx: 'auto' }}>
            <Box sx={{ position: 'relative' }}>
              <Paper elevation={0} sx={{ border: '1px solid #e8e3de', p: { xs: 4, md: 6 }, position: 'relative', overflow: 'visible' }}>
                {/* floating centered heading */}
                <Box sx={{ position: 'absolute', top: -48, left: '50%', transform: 'translateX(-50%)', bgcolor: '#fff', px: 4, zIndex: 6 }}>
                  <Typography sx={{ textAlign: 'center', fontSize: { xs: '1.9rem', md: '3.2rem' }, fontWeight: 400, fontFamily: '"Playfair Display", Georgia, serif', zIndex: 7 }}>
                    About Dhar Brothers
                  </Typography>
                </Box>

                {/* thin decorative lines inside the border (left & right) */}
                <Box sx={{ position: 'absolute', top: 14, left: { xs: 20, md: 32 }, width: { xs: '18%', md: '20%' }, height: 2, bgcolor: '#e6e0da', zIndex: 2 }} />
                <Box sx={{ position: 'absolute', top: 14, right: { xs: 20, md: 32 }, width: { xs: '18%', md: '20%' }, height: 2, bgcolor: '#e6e0da', zIndex: 2 }} />

                <Box sx={{ mt: { xs: 1, md: 2 } }}>
                  <Box sx={{ width: 72, height: 4, bgcolor: '#14a0a5', mx: 'auto', mt: 2, mb: 4 }} />

                  <Typography sx={{ color: 'text.secondary', fontSize: '0.98rem', lineHeight: 1.9, mb: 2, textAlign: 'center' }}>
                    We, Dhar Brothers, had a humble start back in the 1930s and today we take pride in saying that we have reached the pinnacle
                    of thesis/dissertation composing, printing and binding. Our works have been submitted to all major universities around the globe.
                    We have a happy customer base of over a thousand to our credit. We have an experience of more than 85 years in the thesis/dissertation printing and binding.
                  </Typography>

                  <Typography sx={{ color: 'text.secondary', fontSize: '0.98rem', lineHeight: 1.9, mb: 3, textAlign: 'center' }}>
                    We compete with the best in the world in terms of thesis printing and binding and our work has often been appreciated for
                    being leagues ahead of our global competitors. We are currently trying to redefine the age-old practice of binding by skillfully
                    balancing modern technology and human touch. The blend of the traditional and the new is what makes us who we are today.
                  </Typography>

                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, mb: 3 }}>
                    <Button component={RouterLink} to="/about" sx={{ px: 4, py: 1.2, bgcolor: '#f5e8a8', color: '#1f2937', borderRadius: 0, boxShadow: 'none', fontWeight: 600 }}>
                      Know More
                    </Button>
                  </Box>
                </Box>
              </Paper>

              {/* Stats cards placed below the About paper; centered single row */}
              <Box
                sx={{
                  display: 'flex',
                  gap: 4,
                  justifyContent: 'center',
                  alignItems: 'stretch',
                  mt: { xs: 8, md: 12 },
                  pb: 6,
                  position: 'relative',
                  zIndex: 3,
                  flexWrap: 'nowrap',
                  overflowX: 'visible',
                  width: '100%'
                }}
              >
                {stats.map((s, idx) => (
                  <Box key={'stat-' + idx} sx={{ flex: '0 0 auto', width: { xs: 220, sm: 260, md: 260 }, mx: { xs: 1, md: 2 } }}>
                    <Box
                      sx={{
                        position: 'relative',
                        textAlign: 'center',
                        height: '100%',
                        '&:hover .stat-card': { transform: 'translateY(-8px)', boxShadow: '0 16px 40px rgba(16,24,40,0.12)', bgcolor: '#fbfbfb' },
                        '&:hover .stat-icon': { transform: 'translate(-50%, -60%) scale(1.06)' }
                      }}
                    >
                      <Paper
                        className="stat-card"
                        elevation={3}
                        sx={{
                          p: 3,
                          pt: 6,
                          height: { xs: 170, md: 170 },
                          borderRadius: 1,
                          boxShadow: '0 8px 28px rgba(16,24,40,0.06)',
                          transition: 'transform 220ms ease, box-shadow 220ms ease, background 220ms ease',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                          alignItems: 'center'
                        }}
                      >
                        <Typography sx={{ fontSize: { xs: '1.35rem', md: '1.8rem' }, fontWeight: 700 }}>{s.value}</Typography>
                        <Typography sx={{ color: 'text.secondary', fontSize: '0.95rem', mt: 1, textAlign: 'center' }}>{s.label}</Typography>
                      </Paper>

                      <Box
                        className="stat-icon"
                        sx={{
                          position: 'absolute',
                          left: '50%',
                          top: 0,
                          transform: `translate(-50%, ${iconOffsets[idx] || '-48%'})`,
                          width: 72,
                          height: 72,
                          borderRadius: '50%',
                          bgcolor: '#14a0a5',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 8px 24px rgba(20,160,165,0.16)',
                          transition: 'transform 220ms ease'
                        }}
                      >
                        {s.icon ? <s.icon size={28} color="#fff" /> : <Typography sx={{ color: '#fff', fontSize: 28 }}>{s.emoji}</Typography>}
                      </Box>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>

      

      {/* Why Dhar Brothers */}
      <Box component="section" sx={{ py: { xs: 6, md: 10 }, bgcolor: '#fafafa' }}>
        <Container maxWidth="lg">
          <Typography sx={{ textAlign: 'center', fontSize: '1.6rem', fontWeight: 700, mb: 3 }}>Why Dhar Brothers</Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Paper elevation={0} sx={{ p: 3, textAlign: 'left', minHeight: 140 }}>
                <Typography sx={{ fontSize: '1rem', fontWeight: 700, mb: 1 }}>Experienced Craftsmanship</Typography>
                <Typography sx={{ color: 'text.secondary' }}>Over 85 years of experience in thesis printing and binding, combining tradition with modern techniques.</Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper elevation={0} sx={{ p: 3, textAlign: 'left', minHeight: 140 }}>
                <Typography sx={{ fontSize: '1rem', fontWeight: 700, mb: 1 }}>Quality Materials</Typography>
                <Typography sx={{ color: 'text.secondary' }}>We source the finest materials to ensure your thesis looks professional and lasts for years.</Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper elevation={0} sx={{ p: 3, textAlign: 'left', minHeight: 140 }}>
                <Typography sx={{ fontSize: '1rem', fontWeight: 700, mb: 1 }}>Dedicated Support</Typography>
                <Typography sx={{ color: 'text.secondary' }}>Friendly customer service and clear order tracking help you through every step of the process.</Typography>
              </Paper>
            </Grid>
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
