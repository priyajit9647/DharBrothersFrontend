import { useEffect, useState, useRef } from 'react';
import { Box, Container, Stack, Typography, Button, Grid, Paper, TextField, IconButton } from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';

import banner1 from 'assets/banner/banner1.jpg';
import banner2 from 'assets/banner/banner2.jpg';
import banner3 from 'assets/banner/banner3.jpg';
import banner4 from 'assets/banner/banner4.jpg';
import banner5 from 'assets/banner/banner5.jpg';
import banner6 from 'assets/banner/banner6.jpg';
import banner7 from 'assets/banner/banner7.jpg';
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

  const servicesData = {
    hard: {
      title: 'Hard Thesis Binding',
      shortDescription:
        "At Dhar Brothers, we understand the significance of presenting your thesis or dissertation in a manner that reflects the dedication and rigor you've invested in your work.",
      image: banner4,
      path: '/what-we-do/hard-thesis-binding'
    },
    soft: {
      title: 'Soft Thesis Binding',
      shortDescription:
        'Soft binding is an art form that requires precision, care, and attention to detail. We offer reliable soft binding services for a professional finish.',
      image: banner5,
      path: '/what-we-do/soft-thesis-binding'
    },
    synopsis: {
      title: 'Synopsis',
      shortDescription:
        'Our Synopsis Service condenses the essence of your research into a clear and concise document suitable for submissions and reviews.',
      image: banner6,
      path: '/what-we-do/synopsis'
    },
    thesis: {
      title: 'Thesis Binding',
      shortDescription:
        'Dhar Brothers is proud to present Thesis on Demand, a convenient and streamlined service designed to simplify the process of thesis submission.',
      image: banner7,
      path: '/what-we-do/thesis-binding'
    }
  };

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

  // richer demo data similar to About.jsx
  const testimonialsData = [
    { name: 'Suparna Biswas', initial: 'S', rating: 4, text: 'Best place for thesis biding, they are highly professional, very sincere to their work, service is really very good. Thank you Dhar brothers team.' },
    { name: 'sonai barman', initial: 's', rating: 5, text: "I'm really impressed. They are simply the best, very prompt service, specially in pandemic situation. They delivered book at my house, wow, speachless." },
    { name: 'Mr Mazician', initial: 'M', rating: 5, text: 'Very nice place for thesis printing. Very professional, systematic and with modern printing machines. All the staffs are knowledgeable and helpful.' },
    { name: 'Rakesh Das', initial: 'R', rating: 4, text: "It's one of the famous printing place in Kolkata. They are very professional. Any kind of binding and printing is done here." },
    { name: 'Akash bose', initial: 'A', rating: 5, text: 'The behavior of all the staff members is very friendly and polite. They are experts in editing, binding, printing your thesis.' },
    { name: 'Srijit Ghosh', initial: 'S', rating: 5, text: 'One of the best places for thesis binding. Their quality is top notch with on time delivery.' }
  ];

  function TestimonialsSlider() {
    const [index, setIndex] = useState(0);
    const [perPage, setPerPage] = useState(3);

    useEffect(() => {
      function update() {
        const w = window.innerWidth;
        if (w < 700) setPerPage(1);
        else if (w < 1100) setPerPage(2);
        else setPerPage(3);
      }
      update();
      window.addEventListener('resize', update);
      return () => window.removeEventListener('resize', update);
    }, []);

    const slides = [];
    for (let i = 0; i < testimonialsData.length; i += perPage) {
      slides.push(testimonialsData.slice(i, i + perPage));
    }

    useEffect(() => {
      const t = setInterval(() => setIndex((s) => (s + 1) % slides.length), 3000);
      return () => clearInterval(t);
    }, [slides.length]);

    return (
      <Box>
        <Box sx={{ overflow: 'hidden' }}>
          <Box sx={{ display: 'flex', transition: 'transform 450ms ease', width: `${slides.length * 100}%`, transform: `translateX(-${(index * 100) / slides.length}%)` }}>
            {slides.map((slide, sIdx) => (
              <Box key={sIdx} sx={{ width: `${100 / slides.length}%`, display: 'flex', gap: 3, px: 1, boxSizing: 'border-box' }}>
                {slide.map((t, i) => (
                  <Paper key={i} elevation={0} sx={{ flex: 1, border: '1px solid #eee', p: 3, minHeight: 180 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
                      <Box>
                        {Array.from({ length: 5 }).map((_, ii) => (
                          <Box key={ii} component="span" sx={{ color: ii < t.rating ? '#ffb400' : '#ddd', fontSize: 18, ml: 0.5 }}>★</Box>
                        ))}
                      </Box>
                    </Box>
                    <Typography sx={{ color: '#555', lineHeight: 1.9, mb: 2, fontSize: { xs: '0.95rem', md: '1rem' }, fontFamily: 'Georgia, serif' }}>{t.text}</Typography>
                    <Box sx={{ borderTop: '1px solid #eee', pt: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ width: 44, height: 44, borderRadius: '50%', bgcolor: '#14a0a5', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 700 }}>{t.initial}</Box>
                      <Typography sx={{ fontWeight: 700 }}>{t.name}</Typography>
                    </Box>
                  </Paper>
                ))}
              </Box>
            ))}
          </Box>
        </Box>

        {/* dots */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, gap: 1 }}>
          {slides.map((_, i) => (
            <Box key={i} onClick={() => setIndex(i)} sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: i === index ? '#14a0a5' : '#000', opacity: i === index ? 1 : 0.25, cursor: 'pointer' }} />
          ))}
        </Box>
      </Box>
    );
  }

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
      {/* Our Services (replica of reference image) */}
      <Box component="section" sx={{ py: { xs: 6, md: 10 }, bgcolor: '#f4f4f4' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography sx={{ fontSize: '1.8rem', fontWeight: 700 }}>Our Services</Typography>
            <Box sx={{ width: 64, height: 3, bgcolor: '#14a0a5', mx: 'auto', mt: 1 }} />
          </Box>

          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={3}>
              <Paper elevation={0} sx={{ p: 2, bgcolor: 'transparent' }}>
                <Stack spacing={1}>
                  {servicesList.map((s) => (
                    <Button
                      key={s.key}
                      onClick={() => setActiveService(s.key)}
                      disableRipple
                      sx={{
                        justifyContent: 'flex-start',
                        textTransform: 'none',
                        pl: 0,
                        py: 1.5,
                        color: activeService === s.key ? '#14a0a5' : 'text.secondary',
                        fontWeight: activeService === s.key ? 700 : 500,
                        borderLeft: activeService === s.key ? '4px solid #14a0a5' : '4px solid transparent',
                        bgcolor: activeService === s.key ? '#fff' : 'transparent'
                      }}
                    >
                      {s.label}
                    </Button>
                  ))}
                </Stack>
              </Paper>
            </Grid>

            <Grid item xs={12} md={5}>
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Box
                  component="img"
                  src={servicesData[activeService].image}
                  alt={servicesData[activeService].title}
                  sx={{
                    width: { xs: '88%', md: '100%' },
                    height: { xs: 160, md: 320 },
                    objectFit: 'cover',
                    boxShadow: 3,
                    display: 'block'
                  }}
                />
              </Box>
            </Grid>

            <Grid item xs={12} md={4}>
              <Box sx={{ pl: { xs: 0, md: 3 } }}>
                <Typography sx={{ fontSize: '1.2rem', fontWeight: 700, mb: 2 }}>{servicesData[activeService].title}</Typography>
                <Typography sx={{ color: 'text.secondary', mb: 3 }}>{servicesData[activeService].shortDescription}</Typography>

                <Button component={RouterLink} to={servicesData[activeService].path} sx={{ bgcolor: '#f5e8a8', color: '#1f2937', px: 4, py: 1.2, borderRadius: 0, boxShadow: 'none', textTransform: 'none', fontWeight: 600 }}>
                  Know More
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* `Why Dhar Brothers` section removed per request */}

      {/* Sliding Customer Saying (demo static, same style as About.jsx) */}
      <Box component="section" sx={{ py: { xs: 6, md: 10 }, bgcolor: '#fff' }}>
        <Container maxWidth="lg">
          <Box sx={{ maxWidth: 1100, mx: 'auto', textAlign: 'center' }}>
            <Typography sx={{ fontFamily: 'Georgia, serif', fontSize: { xs: '2.2rem', md: '3.2rem' }, fontWeight: 400, color: '#111' }}>
              Customer Saying
            </Typography>
            <Box sx={{ width: 64, height: 3, bgcolor: '#14a0a5', mx: 'auto', mt: 1, mb: 4 }} />
          </Box>

          <Box sx={{ width: '100%', overflow: 'hidden', position: 'relative' }}>
            <TestimonialsSlider />
          </Box>
        </Container>
      </Box>

      {/* `Customer Saying` section removed per request */}

      {/* Get In Touch (new card design matching reference) */}
      <Box component="section" sx={{ py: { xs: 6, md: 8 }, position: 'relative', bgcolor: '#fff' }}>
        <Container maxWidth="lg">
          <Box sx={{ position: 'relative', maxWidth: 1100, mx: 'auto' }}>
            <Box sx={{ position: 'absolute', left: { xs: -24, md: -260 }, top: { xs: -24, md: -80 }, width: { xs: 160, md: 820 }, height: { xs: 120, md: 260 }, bgcolor: '#14a0a5', zIndex: 1, borderRadius: 0 }} />

            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <Paper elevation={6} sx={{ display: 'block', width: '100%', maxWidth: 1100, overflow: 'hidden', boxShadow: '0 26px 60px rgba(0,0,0,0.14)', borderRadius: 1, position: 'relative', zIndex: 2 }}>
                <Grid container sx={{ minHeight: { md: 300 } }} alignItems="stretch">
                  <Grid item xs={12} md={6} sx={{ display: 'block' }}>
                    <Box component="img" src={banner4} alt="contact" sx={{ width: '100%', height: '100%', minHeight: { xs: 150, md: 300 }, objectFit: 'cover', display: 'block' }} />
                  </Grid>

                  <Grid item xs={12} md={6} sx={{ display: 'flex', alignItems: 'center', borderLeft: { md: '1px solid rgba(0,0,0,0.04)' } }}>
                    <Box sx={{ p: { xs: 3, md: 6 }, height: '100%', width: '100%' }}>
                      <Box sx={{ textAlign: 'center', mb: 2 }}>
                        <Typography sx={{ fontFamily: 'Georgia, serif', fontSize: { xs: '1.6rem', md: '2rem' }, fontWeight: 400 }}>Get In Touch</Typography>
                        <Box sx={{ width: 64, height: 3, bgcolor: '#14a0a5', mx: 'auto', mt: 1, mb: 2 }} />
                      </Box>

                      <Stack spacing={3} sx={{ maxWidth: 560, mx: 'auto', width: '100%' }}>
                        <TextField placeholder="Name" fullWidth variant="outlined" sx={{ '& .MuiOutlinedInput-input': { padding: '14px 16px' }, '& .MuiOutlinedInput-root': { borderRadius: 1 } }} />
                        <TextField placeholder="Phone" fullWidth variant="outlined" sx={{ '& .MuiOutlinedInput-input': { padding: '14px 16px' }, '& .MuiOutlinedInput-root': { borderRadius: 1 } }} />
                        <TextField placeholder="Email" fullWidth variant="outlined" sx={{ '& .MuiOutlinedInput-input': { padding: '14px 16px' }, '& .MuiOutlinedInput-root': { borderRadius: 1 } }} />
                        <TextField placeholder="Message" multiline rows={4} fullWidth variant="outlined" sx={{ '& .MuiOutlinedInput-input': { padding: '12px 16px' }, '& .MuiOutlinedInput-root': { borderRadius: 1 } }} />
                        <Box sx={{ display: 'flex', justifyContent: { xs: 'center', md: 'flex-start' }, mt: 1.5 }}>
                          <Button sx={{ bgcolor: '#f5e8a8', color: '#1f2937', borderRadius: 0, px: 6, py: 1.6, fontWeight: 700, boxShadow: 'none' }}>Submit</Button>
                        </Box>
                      </Stack>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </Box>
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
