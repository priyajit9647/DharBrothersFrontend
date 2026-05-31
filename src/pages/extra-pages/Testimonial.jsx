import React from 'react'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import banner3 from 'assets/banner/banner3.jpg'

import { HeaderNav, TopInfoBar, FooterSection } from './PlaceOrder'

const styles = `
/* Testimonial page styles - inlined into JSX */
.testimonial-main { padding: 48px 0 80px; background: #fff; }
.testimonial-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 28px 34px; align-items: start; }
.testimonial-card { border: 1px solid #e7e7e7; padding: 28px 28px 40px; position: relative; background: #fff; min-height: 220px; }
.testimonial-card::before { content: ''; position: absolute; left: 20px; top: 22px; width: 70px; height: 70px; border-top: 2px solid #e6e6e6; border-left: 2px solid #e6e6e6; }
.card-inner { display: flex; flex-direction: column; height: 100%; }
.card-quote { padding-right: 10px; margin-bottom: 22px; }
.stars { text-align: right; margin-bottom: 12px; }
.star { color: #ddd; font-size: 20px; margin-left: 6px; }
.star.filled { color: #ffb400; }
.quote-text { color: #333; line-height: 1.8; font-size: 15px; margin: 0; }
.card-author { display: flex; align-items: center; margin-top: auto; padding-top: 12px; border-top: 1px solid #eaeaea; }
.avatar { width: 52px; height: 52px; border-radius: 50%; background: #15a1a4; color: #fff; display: inline-flex; align-items: center; justify-content: center; font-weight: 700; font-size: 20px; margin-right: 14px; }
.author-name { font-weight: 700; color: #111; }
@media (max-width: 1100px) { .testimonial-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 700px) { .testimonial-grid { grid-template-columns: 1fr; } .testimonial-main { padding: 28px 20px 60px; } }
`

const testimonials = [
  {
    name: 'Swagata Guha',
    initial: 'S',
    rating: 5,
    text:
      "Dhar Brothers' simple binding service is outstanding. Efficient, cost-effective, and of the highest quality. Perfect for anyone looking for reliable binding solutions.",
  },
  {
    name: 'BIMAL RAKSHIT',
    initial: 'B',
    rating: 5,
    text:
      "Dhar Brothers' Thesis on Demand service is a game-changer! Fast, reliable, and tailored to perfection. A must-try for hassle-free thesis printing and binding!",
  },
  {
    name: 'Rakesh Das',
    initial: 'R',
    rating: 4,
    text:
      "It's one of the famous printing place in Kolkata. They are very professional. Any kind of binding and printing is done here. They have a vast collection of binding cover. The quality of the printing is very fine.",
  },
  {
    name: 'Akash bose',
    initial: 'A',
    rating: 5,
    text:
      "The behavior of all the staff members is very friendly and polite. They are experts in editing, binding, printing your thesis, and finishing touches are awesome.",
  },
  {
    name: 'Mahender Singh Poonia',
    initial: 'M',
    rating: 5,
    text:
      'A very good and reliable place for thesis printing and binding. Highly recommended for anyone in need of professional printing services.',
  },
  {
    name: 'Sanjay sarkar',
    initial: 'S',
    rating: 4,
    text:
      "Nice place for thesis hard binding. Good quality. Their quality is impeccable, I'm impressed by their attention to detail and promptness.",
  },
  {
    name: 'Srijit Ghosh',
    initial: 'S',
    rating: 5,
    text:
      "One of the best places for thesis binding. Their quality is top notch with on time delivery. The people in the shop guide you very well and help you in getting your work done smoothly.",
  },
  {
    name: 'Anubha ganguly',
    initial: 'A',
    rating: 5,
    text:
      'The best place for thesis binding in the city. They are extremely professional and their work is absolutely the best. Was recommended by my college professor.',
  },
  {
    name: 'Sutapa Joti',
    initial: 'S',
    rating: 5,
    text:
      'Very good experience. Delivery timing is also very good. Even they delivered the items before time. Service provided is methodical, systematic and particular. Professional with very warm attitude.',
  },
]

const Stars = ({ count = 5 }) => (
  <div className="stars">
    {Array.from({ length: 5 }).map((_, i) => (
      <span key={i} className={i < count ? 'star filled' : 'star'}>
        ★
      </span>
    ))}
  </div>
)

function TestimonialCard({ t }) {
  return (
    <article className="testimonial-card">
      <div className="card-inner">
        <div className="card-quote">
          <Stars count={t.rating} />
          <p className="quote-text">{t.text}</p>
        </div>
        <div className="card-author">
          <div className="avatar">{t.initial}</div>
          <div className="author-name">{t.name}</div>
        </div>
      </div>
    </article>
  )
}

export default function Testimonial() {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8f7f2' }}>
      <style>{styles}</style>
      <TopInfoBar />
      <HeaderNav />

      <Box
        sx={{
          position: 'relative',
          minHeight: { xs: 200, md: 260 },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          color: 'common.white',
          backgroundImage: `linear-gradient(0deg, rgba(27, 24, 20, 0.38), rgba(27, 24, 20, 0.38)), url(${banner3})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <Container maxWidth="lg">
          <Stack spacing={1} alignItems="center">
            <Typography variant="h1" sx={{ fontSize: { xs: '2rem', md: '3rem' }, fontWeight: 400, letterSpacing: 0.4 }}>
              Testimonial
            </Typography>
            <Typography sx={{ fontSize: '0.9rem', letterSpacing: 0.5 }}>Home / Testimonial</Typography>
          </Stack>
        </Container>
      </Box>

      <Box component="main" className="testimonial-main">
        <Container maxWidth="lg">
          <section className="testimonial-grid">
            {testimonials.map((t, i) => (
              <TestimonialCard t={t} key={i} />
            ))}
          </section>
        </Container>
      </Box>

      <FooterSection />
    </Box>
  )
}
