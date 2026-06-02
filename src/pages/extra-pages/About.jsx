import React, { useState, useEffect } from 'react';
import { Box, Container, Grid, Typography, Paper, Stack, Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { Link as RouterLink } from 'react-router-dom';

import banner1 from 'assets/banner/banner1.jpg';
import banner2 from 'assets/banner/banner2.jpg';
import banner3 from 'assets/banner/banner3.jpg';
import avatar1 from 'assets/images/users/avatar-6.png';
import avatar2 from 'assets/images/users/avatar-7.png';
import avatar3 from 'assets/images/users/avatar-8.png';
import avatar4 from 'assets/images/users/avatar-4.png';
import { Building, Globe, Trophy, DollarSign } from 'lucide-react';

// reuse header/footer pieces
import { HeaderNav, TopInfoBar, FooterSection } from './PlaceOrder';

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
    const t = setInterval(() => setIndex((s) => (s + 1) % slides.length), 5000);
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
                  <Typography sx={{ color: 'text.secondary', lineHeight: 1.8, mb: 2, fontSize: '0.95rem' }}>{t.text}</Typography>
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

export default function About() {
  const theme = useTheme();
  const [selectedPerson, setSelectedPerson] = useState(null);

  const PEOPLE = [
    {
      id: 0,
      name: 'Rashmohan Dhar',
      image: avatar1,
      description:
        "Back in 1930, Late Rashmohan Dhar started the journey with a golden dream of being the pioneer in book binding. On that time the company was in book sewing, book binding, panjika binding and restoration of old books. It was a simple and honest start to what would re-define printing and binding in India in the years to come."
    },
    {
      id: 1,
      name: 'Hiralal Dhar',
      image: avatar2,
      description: "Hiralal Dhar carried forward the tradition and helped modernize the operations. His leadership expanded the company's reach and introduced new binding techniques to improve quality."
    },
    {
      id: 2,
      name: 'Mr. Kishore Dhar',
      image: avatar3,
      description:
        "After the demise of Late Hiralal Dhar, his youngest son, Mr. Kishore Dhar took on the responsibility as the Director of Dhar Brothers. Mr. Kishore Dhar quickly realized that their current business is giving them high volume of work but low returns and he decided to give the company a new direction, installing letterpress and photocopier machines and later introduced digital printing."
    }
  ];

  const StatsCard = ({ value, label, IconSvg }) => (
    <Box sx={{ position: 'relative', pt: 4, display: 'flex', justifyContent: 'center' }}>
      <Box sx={{ position: 'absolute', top: 0, transform: 'translateY(-50%)' }}>
        <Box sx={{ width: 64, height: 64, borderRadius: '50%', bgcolor: '#14a0a5', display: 'grid', placeItems: 'center', boxShadow: '0 6px 18px rgba(20,160,165,0.12)' }}>
          {IconSvg ? <IconSvg /> : null}
        </Box>
      </Box>

      <Paper elevation={1} sx={{ width: '100%', pt: 6, pb: 3, px: 2, textAlign: 'center', borderRadius: 1 }}>
        <Typography sx={{ fontSize: '1.5rem', fontWeight: 700 }}>{value}</Typography>
        <Typography sx={{ fontSize: '0.78rem', color: 'text.secondary', mt: 1 }}>{label}</Typography>
      </Paper>
    </Box>
  );

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'common.white' }}>
      <TopInfoBar />
      <HeaderNav pageTitle="Order Thesis Online" hideOrderButton={false} />

      {/* Hero */}
      <Box component="section" sx={{ position: 'relative', height: { xs: 200, md: 220 }, overflow: 'hidden' }}>
        <Box component="img" src={banner3} alt="about-hero" sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(0,0,0,0.35)' }} />
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2, height: '100%' }}>
          <Stack sx={{ height: '100%' }} justifyContent="center" alignItems="center">
            <Typography sx={{ color: '#fff', fontSize: { xs: '1.6rem', md: '2.25rem' }, fontWeight: 600 }}>About Us</Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.9rem', mt: 1 }}>Home / About Us</Typography>
          </Stack>
        </Container>
      </Box>

      {/* Main content - Who We Are with large left image and right text/stats */}
      {/* ================= WHO WE ARE ================= */}
<Box sx={{ backgroundColor: '#fff', py: { xs: 6, md: 10 } }}>
  <Container maxWidth="lg">

    <Box
      sx={{
        maxWidth: '1100px',
        mx: 'auto'
      }}
    >
      <Typography
        sx={{
          fontFamily: 'Georgia, serif',
          fontSize: { xs: '2.5rem', md: '3.8rem' },
          fontWeight: 400,
          color: '#222',
          textAlign: 'center'
        }}
      >
        Who We Are
      </Typography>

      <Box
        sx={{
          width: 72,
          height: 4,
          bgcolor: '#12b7c9',
          mx: 'auto',
          mt: 2,
          mb: 5
        }}
      />

      <Typography
        sx={{
          color: '#555',
          fontSize: '17px',
          lineHeight: '2.2',
          mb: 4,
          textAlign: 'center'
        }}
      >
        We, Dhar Brothers, had a humble start back in the 1930s and today we
        take pride in saying that we have reached the pinnacle of
        thesis/dissertation composing, printing and binding. Our works have
        been submitted to all major universities around the globe. We have a
        happy customer base of over a thousand to our credit. We have an
        experience of more than 85 years in the thesis/dissertation printing
        and binding.
      </Typography>

      <Typography
        sx={{
          color: '#555',
          fontSize: '17px',
          lineHeight: '2.2',
          mb: 8,
          textAlign: 'center'
        }}
      >
        We compete with the best in the world in terms of thesis printing and
        binding and our work has often been appreciated for being leagues ahead
        of our global competitors. We are currently trying to redefine the
        age-old practice of binding by skillfully balancing modern technology
        and human touch. The blend of the traditional and the new is what makes
        us who we are today.
      </Typography>

      <Grid container spacing={4}>
        {[
          {
            value: '1930',
            label: 'Year Since Established',
            Icon: Building
          },
          {
            value: '9',
            label: 'Clients in How Many Countries/States/Cities',
            Icon: Globe
          },
          {
            value: '90',
            label: 'Years/Hours of Experience of All Employee',
            Icon: Trophy
          },
          {
            value: '500000',
            label: 'Total Units Sold',
            Icon: DollarSign
          }
        ].map((item, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Box sx={{ position: 'relative', pt: '34px' }}>
              <Paper
                elevation={0}
                sx={{
                  height: 160,
                  borderRadius: 2,
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  border: '1px solid #f0f0f0',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.06)',
                  transition: 'transform 260ms ease, box-shadow 260ms ease',
                  '&:hover': {
                    transform: 'translateY(-10px)',
                    boxShadow: '0 30px 60px rgba(0,0,0,0.14)'
                  }
                }}
              >
                <Typography
                  sx={{
                    fontSize: '2.2rem',
                    fontWeight: 700,
                    color: '#222',
                    mb: 1
                  }}
                >
                  {item.value}
                </Typography>

                <Typography
                  sx={{
                    fontSize: '14px',
                    color: '#666',
                    px: 2
                  }}
                >
                  {item.label}
                </Typography>
              </Paper>

              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: 74,
                  height: 74,
                  borderRadius: '50%',
                  bgcolor: '#12b7c9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 10px 20px rgba(18,183,201,.18)',
                  border: '6px solid #fff'
                }}
                >
                {item.Icon ? <item.Icon color="#fff" size={28} /> : null}
              </Box>
            </Box>
          </Grid>
        ))}
      </Grid>

    </Box>

  </Container>
</Box>
      {/* Trust Scene 1930 */}
      <Box sx={{ py: { xs: 4, md: 6 }, bgcolor: '#fff' }}>
        <Container maxWidth="lg">
          <Typography sx={{ textAlign: 'center', fontSize: '1.6rem', fontFamily: 'serif', mb: 1 }}>Trust Scene 1930</Typography>
          <Box sx={{ width: 64, height: 3, bgcolor: '#14a0a5', mx: 'auto', mb: 4 }} />

          <Grid container spacing={4} sx={{ alignItems: 'stretch' }}>
            {[avatar1, avatar2, avatar3].map((src, idx) => (
              <Grid key={idx} item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'left' }}>
                  <Paper
                    elevation={3}
                    sx={{
                      p: 0,
                      borderRadius: 2,
                      overflow: 'hidden',
                      border: '4px solid rgba(0,0,0,0.06)',
                      boxShadow: 'none',
                      transition: 'transform 260ms ease, box-shadow 260ms ease',
                      '&:hover': {
                        transform: 'translateY(-12px)',
                        boxShadow: 'none'
                      }
                    }}
                  >
                    <Box component="img" src={src} alt={`trust-${idx}`} sx={{ width: '100%', height: { xs: 260, md: 360 }, objectFit: 'cover', display: 'block' }} />
                  </Paper>

                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 2 }}>
                    <Box component="button" onClick={() => setSelectedPerson(PEOPLE[idx])} sx={{ background: 'none', border: 'none', padding: 0, textAlign: 'left', cursor: 'pointer' }}>
                      <Typography sx={{ mt: 1, fontSize: '0.98rem', fontWeight: 600, textDecoration: 'underline', textDecorationColor: 'transparent', '&:hover': { textDecorationColor: 'inherit' } }}>{PEOPLE[idx].name}</Typography>
                    </Box>
                    <Typography sx={{ color: 'text.secondary', fontSize: '1.15rem', ml: 2 }}>→</Typography>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Person detail dialog */}
      <Dialog open={Boolean(selectedPerson)} onClose={() => setSelectedPerson(null)} maxWidth="md" fullWidth>
        <DialogContent dividers>
          {selectedPerson && (
            <Box sx={{ display: 'flex', gap: 4, alignItems: 'flex-start', p: { xs: 1, md: 2 } }}>
              <Box component="img" src={selectedPerson.image} alt={selectedPerson.name} sx={{ width: { xs: 180, md: 320 }, height: { xs: 180, md: 360 }, objectFit: 'cover' }} />
              <Box>
                <Typography sx={{ fontSize: '1.4rem', fontWeight: 700, textDecoration: 'underline', mb: 1 }}>{selectedPerson.name}</Typography>
                <Typography sx={{ color: 'text.secondary', lineHeight: 1.8 }}>{selectedPerson.description}</Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedPerson(null)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Mission & Vision with full-width background and overlapping cards */}
      <Box
        sx={{
          position: 'relative',
          py: { xs: 6, md: 10 },
          backgroundImage: `url(${banner1})`,
          backgroundSize: 'cover',
          backgroundPosition: { xs: 'center', md: 'left center' }
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 2 }}>
          <Container maxWidth="lg">
            <Grid container spacing={4} alignItems="center" sx={{ py: { xs: 2, md: 6 } }}>
              <Grid item xs={12} md={6}>
                {/* empty column to show left image */}
              </Grid>

              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', gap: 4, justifyContent: 'center', alignItems: 'stretch', px: { xs: 0, md: 4 } }}>
                  <Paper
                    elevation={3}
                    sx={{
                      p: { xs: 4, md: 6 },
                      width: { xs: '100%', md: 440 },
                      textAlign: 'center',
                      borderRadius: 1,
                      boxShadow: '0 14px 50px rgba(0,0,0,0.12)',
                      transform: { md: 'translateX(-40px)' }
                    }}
                  >
                    <Typography sx={{ fontSize: { xs: '1.4rem', md: '1.9rem' }, fontWeight: 400, mb: 1 }}>Our Mission</Typography>
                    <Box sx={{ width: 64, height: 3, bgcolor: '#14a0a5', mx: 'auto', mb: 3 }} />
                    <Typography sx={{ color: 'text.secondary', mx: 'auto', maxWidth: 380, lineHeight: 1.9 }}>
                      Dhar Brothers' mission is to redefine printing and binding standards, ensuring scholars receive nothing but the best for their academic endeavours. With a legacy of innovation spanning generations, we are committed to delivering unparalleled quality and service.
                    </Typography>
                  </Paper>

                  <Paper
                    elevation={3}
                    sx={{
                      p: { xs: 4, md: 6 },
                      width: { xs: '100%', md: 440 },
                      textAlign: 'center',
                      borderRadius: 1,
                      boxShadow: '0 14px 50px rgba(0,0,0,0.08)',
                      transform: { md: 'translateX(-20px)' }
                    }}
                  >
                    <Typography sx={{ fontSize: { xs: '1.4rem', md: '1.9rem' }, fontWeight: 400, mb: 1 }}>Our Vision</Typography>
                    <Box sx={{ width: 64, height: 3, bgcolor: '#14a0a5', mx: 'auto', mb: 3 }} />
                    <Typography sx={{ color: 'text.secondary', mx: 'auto', maxWidth: 380, lineHeight: 1.9 }}>
                      Dhar Brothers' vision is to uphold its legacy of excellence in thesis/dissertation composing, printing, and binding. With over 85 years of experience, we strive to set global standards by blending traditional craftsmanship with modern technology.
                    </Typography>
                  </Paper>
                </Box>
              </Grid>
            </Grid>
          </Container>
        </Box>
      </Box>

      {/* Customer Saying / Testimonials slider */}
      <Box sx={{ py: { xs: 6, md: 10 }, bgcolor: '#fff' }}>
        <Container maxWidth="lg">
          <Typography sx={{ textAlign: 'center', fontSize: '1.5rem', fontFamily: 'serif', mb: 3 }}>Customer Saying</Typography>
          <Box sx={{ width: '100%', overflow: 'hidden', position: 'relative' }}>
            <TestimonialsSlider />
          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <FooterSection />
    </Box>
  );
}
