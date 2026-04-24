import { useMemo, useState } from 'react';

import { CloudUploadOutlined, EditOutlined, EnvironmentOutlined, FacebookFilled, InfoCircleOutlined, InstagramOutlined, MailOutlined, PhoneOutlined, TwitterOutlined } from '@ant-design/icons';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import { createOrder, getOrderSummary } from 'api/order';
import Logo from 'components/logo';

import banner2 from 'assets/banner/banner2.jpg';

const steps = ['Upload Documents', 'Document Details', 'Hard Binding', 'Soft Binding', 'Order Summary'];
const navItems = ['Home', 'About Us', 'What We Do', 'How We Work', 'Testimonial', 'Price', 'Faq', 'Contact Us'];
const stepGroups = ['Upload File', 'Document Details', 'Hard Binding', 'Soft Binding', 'Order Summary'];
const socialIcons = [FacebookFilled, TwitterOutlined, InstagramOutlined];

const stepTitles = {
  1: 'Document Details',
  2: 'Hard Binding',
  3: 'Soft Binding',
  4: 'Order Summary'
};

export default function PlaceOrder() {
  const theme = useTheme();
  const [activeStep, setActiveStep] = useState(0);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState('');
  const [orderSummary, setOrderSummary] = useState(null);

  const stepGroupIndex = activeStep;
  const currentTitle = useMemo(() => stepTitles[activeStep] || 'Upload Documents', [activeStep]);

  const handleNext = () => {
    setActiveStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const handleBack = () => {
    setActiveStep((prev) => Math.max(prev - 1, 0));
  };

  const loadOrderSummary = async (orderId) => {
    if (!orderId) {
      setSummaryError('Order created, but orderId is missing in response.');
      return;
    }

    setSummaryLoading(true);
    setSummaryError('');

    try {
      const summary = await getOrderSummary(orderId);
      setOrderSummary(summary);
    } catch (error) {
      setSummaryError(error.message || 'Failed to load order summary.');
    } finally {
      setSummaryLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    setSubmitError('');
    setSubmitMessage('');
    setSummaryError('');
    setIsSubmittingOrder(true);

    try {
      const payload = {
        thesisDocument: 'string',
        synopsisDocument: 'string',
        totalPages: 1073741824,
        colourPages: 1073741824,
        pageAndPageTypeIdMap: {
          additionalProp1: 9007199254740991,
          additionalProp2: 9007199254740991,
          additionalProp3: 9007199254740991
        }
      };

      const created = await createOrder(payload);
      setSubmitMessage('Order created successfully.');

      const orderId = created?.orderId ?? created?.id ?? created?.data?.orderId ?? created?.data?.id;
      await loadOrderSummary(orderId);
    } catch (error) {
      setSubmitError(error.message || 'Failed to create order.');
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  const handlePrimaryAction = async () => {
    if (activeStep === steps.length - 1) {
      await handlePlaceOrder();
      return;
    }

    handleNext();
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8f7f2' }}>
      <TopInfoBar />
      <HeaderNav />
      <HeroBanner />

      <Box sx={{ py: { xs: 6, md: 8 } }}>
        <Container maxWidth="lg">
          <Paper
            elevation={0}
            sx={{
              overflow: 'hidden',
              borderRadius: 0,
              bgcolor: 'common.white',
              boxShadow: theme.vars.customShadows.z1,
              border: `1px solid ${alpha(theme.palette.secondary.main, 0.12)}`
            }}
          >
            <Box sx={{ px: { xs: 2, md: 6 }, pt: { xs: 3, md: 4 } }}>
              <ProgressHeader activeIndex={stepGroupIndex} />
            </Box>

            <Box sx={{ px: { xs: 2, md: 6 }, pt: { xs: 1, md: 2 }, pb: { xs: 3, md: 4 } }}>
              {activeStep === 0 && <UploadStep />}
              {activeStep === 1 && <DocumentDetailsStep />}
              {activeStep === 2 && <HardBindingStep />}
              {activeStep === 3 && <SoftBindingStep />}
              {activeStep === 4 && <OrderSummaryStep summary={orderSummary} loading={summaryLoading} error={summaryError} />}

              <Box
                sx={{
                  mt: 3,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <Box>
                  {activeStep > 0 && (
                    <Button
                      onClick={handleBack}
                      variant="outlined"
                      sx={{
                        minWidth: 110,
                        borderRadius: 0,
                        borderColor: alpha(theme.palette.secondary.main, 0.24),
                        color: 'text.primary'
                      }}
                    >
                      Prev
                    </Button>
                  )}
                </Box>

                <Box>
                  <Button
                    onClick={handlePrimaryAction}
                    variant="contained"
                    disabled={isSubmittingOrder}
                    sx={{
                      minWidth: 110,
                      borderRadius: 0,
                      bgcolor: theme.palette.warning.lighter,
                      color: theme.palette.text.primary,
                      boxShadow: 'none',
                      '&:hover': {
                        bgcolor: theme.palette.warning.light,
                        boxShadow: 'none'
                      }
                    }}
                  >
                    {activeStep === steps.length - 1 ? (isSubmittingOrder ? 'Submitting...' : 'Confirm Order') : 'Next'}
                  </Button>
                </Box>
              </Box>

              {submitError ? (
                <Typography color="error" sx={{ mt: 1.5, fontSize: '0.85rem' }}>
                  {submitError}
                </Typography>
              ) : null}

              {submitMessage ? (
                <Typography color="success.main" sx={{ mt: 1.5, fontSize: '0.85rem' }}>
                  {submitMessage}
                </Typography>
              ) : null}
            </Box>
          </Paper>
        </Container>
      </Box>

      <PriceSection />

      <FooterSection />
    </Box>
  );
}

export function TopInfoBar() {
  const theme = useTheme();

  return (
    <Box
      sx={{
        bgcolor: 'common.white',
        borderBottom: `1px solid ${alpha(theme.palette.secondary.main, 0.12)}`
      }}
    >
      <Container maxWidth="lg">
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={{ xs: 1.5, md: 2 }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', md: 'center' }}
          sx={{ py: 1.5 }}
        >
          <HeaderInfo icon={EnvironmentOutlined} text="79, Lenin Sarani Rd, near COMMERCIAL POINT Kolkata, West Bengal 700013" />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 1.5, sm: 3 }}>
            <HeaderInfo icon={PhoneOutlined} text="+ ( 91 ) 983 006 6537" />
            <HeaderInfo icon={MailOutlined} text="contactus@dharbrothers.com" />
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}

export function PriceSection({ bindingRates, printingRates }) {
  const theme = useTheme();

  const border = `1px solid ${alpha(theme.palette.secondary.main, 0.25)}`;

  return (
    <Box sx={{ bgcolor: 'common.white', py: { xs: 5, md: 7 } }}>
      <Container maxWidth="lg">
        {/* Binding Rate Chart */}
        <Typography
          sx={{
            textAlign: 'center',
            fontSize: '1.05rem',
            fontWeight: 600,
            letterSpacing: 1,
            textTransform: 'uppercase',
            mb: 2
          }}
        >
          Binding Rate Chart
        </Typography>

        <Box sx={{ border, borderBottom: 'none', overflowX: 'auto' }}>
          <Box
            component="table"
            sx={{
              width: '100%',
              minWidth: 840,
              borderCollapse: 'collapse',
              '& th, & td': {
                borderRight: border,
                borderBottom: border,
                p: 1,
                fontSize: '0.8rem',
                textAlign: 'center'
              },
              '& tr:last-of-type td': {
                borderBottom: 'none'
              }
            }}
          >
            <Box component="thead">
              <Box component="tr">
                <Box component="th" sx={{ fontWeight: 600 }}>
                  SL.NO
                </Box>
                <Box component="th" sx={{ fontWeight: 600 }}>
                  BINDING TYPE
                </Box>
                <Box component="th" sx={{ fontWeight: 600 }}>
                  QUANTITY
                </Box>
                <Box component="th" sx={{ fontWeight: 600 }}>
                  RATE
                </Box>
              </Box>
            </Box>

            <Box component="tbody">
              {(bindingRates && bindingRates.length
                ? bindingRates.map((item, index) => ({
                    sl: index + 1,
                    type: (item.bindingType || '').toUpperCase() || '- ',
                    qty: 'Per copy',
                    rate: item.ratePerCopy ?? '-'
                  }))
                : [
                    { sl: 1, type: 'HARD BIND [BELOW 3 COPY]', qty: 'Per copy', rate: '300' },
                    { sl: 2, type: 'HARD BIND [3 COPY AND ABOVE]', qty: 'Per copy', rate: '270' },
                    { sl: 3, type: 'SOFT BIND', qty: 'Per copy', rate: '270' },
                    { sl: 4, type: 'SYNOPSIS', qty: 'Per copy', rate: '30' }
                  ]
              ).map((row) => (
                <Box key={row.sl} component="tr" sx={{ bgcolor: 'common.white' }}>
                  <Box component="td">{`${row.sl}.`}</Box>
                  <Box component="td">{row.type}</Box>
                  <Box component="td">{row.qty}</Box>
                  <Box component="td">{row.rate}</Box>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>

        {/* Printing Rate Chart */}
        <Typography
          sx={{
            textAlign: 'center',
            fontSize: '1.05rem',
            fontWeight: 600,
            letterSpacing: 1,
            textTransform: 'uppercase',
            mt: 5,
            mb: 2
          }}
        >
          Printing Rate Chart
        </Typography>

        <Box sx={{ border, overflowX: 'auto' }}>
          {printingRates && printingRates.length ? (
            <Box
              component="table"
              sx={{
                width: '100%',
                minWidth: 720,
                borderCollapse: 'collapse',
                '& th, & td': {
                  borderRight: border,
                  borderBottom: border,
                  p: 1,
                  fontSize: '0.8rem',
                  textAlign: 'center'
                }
              }}
            >
              <Box component="thead">
                <Box component="tr">
                  <Box component="th" sx={{ fontWeight: 600 }}>SL.NO</Box>
                  <Box component="th" sx={{ fontWeight: 600 }}>PAPER</Box>
                  <Box component="th" sx={{ fontWeight: 600 }}>PRINTING COLOR</Box>
                  <Box component="th" sx={{ fontWeight: 600 }}>1ST COPY RATE</Box>
                  <Box component="th" sx={{ fontWeight: 600 }}>NEXT COPY RATE</Box>
                  <Box component="th" sx={{ fontWeight: 600 }}>ACTIVE</Box>
                </Box>
              </Box>
              <Box component="tbody">
                {printingRates.map((row, idx) => (
                  <Box key={row.id ?? idx} component="tr" sx={{ bgcolor: 'common.white' }}>
                    <Box component="td">{`${idx + 1}.`}</Box>
                    <Box component="td">{row.paperName ?? row.paper ?? '-'}</Box>
                    <Box component="td">{row.printColorName ?? row.printingColour ?? '-'}</Box>
                    <Box component="td">{row.firstCopyRate ?? '-'}</Box>
                    <Box component="td">{row.additionalCopyRate ?? '-'}</Box>
                    <Box component="td">{row.active ? 'Yes' : 'No'}</Box>
                  </Box>
                ))}
              </Box>
            </Box>
          ) : (
            <Box
              component="table"
              sx={{
                width: '100%',
                minWidth: 840,
                borderCollapse: 'collapse',
                '& th, & td': {
                  borderRight: border,
                  borderBottom: border,
                  p: 1,
                  fontSize: '0.78rem',
                  textAlign: 'center'
                },
                '& tr:last-of-type td': {
                  borderBottom: 'none'
                }
              }}
            >
              {/* original complex static table retained as fallback */}
              <Box component="thead">
                <Box component="tr">
                  <Box component="th" sx={{ fontWeight: 600 }} colSpan={2}>
                    PAPER TYPE & QUALITY
                  </Box>
                  <Box component="th" sx={{ fontWeight: 600 }} colSpan={4}>
                    NORMAL PRINT (BLACK/WHITE & COLOR)
                  </Box>
                  <Box component="th" sx={{ fontWeight: 600, bgcolor: '#fff7c7' }} colSpan={4}>
                    ROYAL PRINT (ALL COLOR)
                  </Box>
                </Box>

                <Box component="tr">
                  <Box component="th" rowSpan={2} sx={{ fontWeight: 600 }}>
                    SL.NO
                  </Box>
                  <Box component="th" rowSpan={2} sx={{ fontWeight: 600 }}>
                    PAPER TYPE & QUALITY
                  </Box>
                  <Box component="th" sx={{ fontWeight: 600 }} colSpan={2}>
                    BLACK & WHITE
                  </Box>
                  <Box component="th" sx={{ fontWeight: 600 }} colSpan={2}>
                    COLOR
                  </Box>
                  <Box component="th" sx={{ fontWeight: 600, bgcolor: '#fff7c7' }} colSpan={2}>
                    BLACK & WHITE
                  </Box>
                  <Box component="th" sx={{ fontWeight: 600, bgcolor: '#fff7c7' }} colSpan={2}>
                    COLOR
                  </Box>
                </Box>

                <Box component="tr">
                  {['1ST COPY PER PAGE', 'NEXT COPY PER PAGE'].map((label) => (
                    <Box key={`normal-bw-${label}`} component="th" sx={{ fontWeight: 600 }}>
                      {label}
                    </Box>
                  ))}
                  {['1ST COPY PER PAGE', 'NEXT COPY PER PAGE'].map((label) => (
                    <Box key={`normal-color-${label}`} component="th" sx={{ fontWeight: 600 }}>
                      {label}
                    </Box>
                  ))}
                  {['1ST COPY PER PAGE', 'NEXT COPY PER PAGE'].map((label) => (
                    <Box key={`royal-bw-${label}`} component="th" sx={{ fontWeight: 600, bgcolor: '#fff7c7' }}>
                      {label}
                    </Box>
                  ))}
                  {['1ST COPY PER PAGE', 'NEXT COPY PER PAGE'].map((label) => (
                    <Box key={`royal-color-${label}`} component="th" sx={{ fontWeight: 600, bgcolor: '#fff7c7' }}>
                      {label}
                    </Box>
                  ))}
                </Box>
              </Box>

              <Box component="tbody">
                {[
                  {
                    paper: 'Imported Matt 100 GSM or equivalent',
                    values: ['8', '4', '12', '10', '10', '7', '12', '10']
                  },
                  {
                    paper: 'Paper One 100 GSM or equivalent',
                    values: ['6', '2', '10', '8', '8', '5', '10', '8']
                  },
                  {
                    paper: 'Bond Paper 85 GSM or equivalent',
                    values: ['6', '2', '10', '8', '8', '5', '10', '8']
                  },
                  {
                    paper: 'Standard 70/75 GSM or equivalent',
                    values: ['5', '1.5', '10', '8', '6', '4', '10', '8']
                  }
                ].map((row, rowIndex) => (
                  <Box key={row.paper} component="tr" sx={{ bgcolor: 'common.white' }}>
                    <Box component="td">{`${rowIndex + 1}.`}</Box>
                    <Box component="td">{row.paper}</Box>
                    {row.values.map((value, i) => (
                      <Box // eslint-disable-next-line react/no-array-index-key
                        key={i}
                        component="td"
                        sx={{ bgcolor: i >= 4 ? '#fff7c7' : undefined }}
                      >
                        {value}
                      </Box>
                    ))}
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </Box>

        {/* Royal Print note */}
        <Box sx={{ maxWidth: 1200, mx: 'auto', mt: 3, mb: 4 }}>
          <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, mb: 0.75 }}>
            **ROYAL PRINT
          </Typography>
          <Typography sx={{ fontSize: '0.86rem', lineHeight: 1.8 }}>
            Royal Print is when both the black &amp; white pages and the color pages are printed from the same color printer to give a
            superior print quality to your document. Highly recommended for people with small color elements throughout their
            documents like a graph or chart to ensure even the smallest details are best captured in the printing process.
          </Typography>
        </Box>

        {/* Others Rate Chart */}
        <Typography
          sx={{
            textAlign: 'center',
            fontSize: '1.05rem',
            fontWeight: 600,
            letterSpacing: 1,
            textTransform: 'uppercase',
            mt: 5,
            mb: 2
          }}
        >
          Others Rate Chart
        </Typography>

        <Box sx={{ border, borderBottom: 'none', overflowX: 'auto', mb: 5 }}>
          <Box
            component="table"
            sx={{
              width: '100%',
              minWidth: 840,
              borderCollapse: 'collapse',
              '& th, & td': {
                borderRight: border,
                borderBottom: border,
                p: 1,
                fontSize: '0.8rem',
                textAlign: 'center'
              },
              '& tr:last-of-type td': {
                borderBottom: 'none'
              }
            }}
          >
            <Box component="thead">
              <Box component="tr">
                <Box component="th" sx={{ fontWeight: 600 }}>
                  SL.NO
                </Box>
                <Box component="th" sx={{ fontWeight: 600 }}>
                  DESCRIPTION
                </Box>
                <Box component="th" sx={{ fontWeight: 600 }}>
                  QUANTITY
                </Box>
                <Box component="th" sx={{ fontWeight: 600 }}>
                  RATE
                </Box>
              </Box>
            </Box>

            <Box component="tbody">
              {[
                { sl: 1, desc: 'FORMATTING CHARGE (only for WORD file)', qty: 'Per hour', rate: '250' },
                { sl: 2, desc: 'CD', qty: 'Per copy', rate: '30' }
              ].map((row) => (
                <Box key={row.sl} component="tr" sx={{ bgcolor: 'common.white' }}>
                  <Box component="td">{`${row.sl}.`}</Box>
                  <Box component="td">{row.desc}</Box>
                  <Box component="td">{row.qty}</Box>
                  <Box component="td">{row.rate}</Box>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>

        {/* Combined Rate Table */}
        <Box sx={{ border, overflowX: 'auto' }}>
          <Box
            component="table"
            sx={{
              width: '100%',
              minWidth: 840,
              borderCollapse: 'collapse',
              '& th, & td': {
                borderRight: border,
                borderBottom: border,
                p: 1,
                fontSize: '0.8rem',
                textAlign: 'center'
              },
              '& tr:last-of-type td': {
                borderBottom: 'none'
              }
            }}
          >
            <Box component="thead">
              <Box component="tr">
                <Box component="th" sx={{ fontWeight: 600 }}>
                  SL.NO
                </Box>
                <Box component="th" sx={{ fontWeight: 600 }}>
                  PAPER TYPE & QUALITY
                </Box>
                <Box component="th" sx={{ fontWeight: 600 }}>
                  PRINTING TYPE
                </Box>
                <Box component="th" sx={{ fontWeight: 600 }}>
                  PRINTING PREFERENCES
                </Box>
                <Box component="th" sx={{ fontWeight: 600 }}>
                  SINGLE SIDE
                </Box>
                <Box component="th" sx={{ fontWeight: 600 }}>
                  BOTH SIDE
                </Box>
              </Box>
            </Box>

            <Box component="tbody">
              {[
                { sl: 1, paper: 'Imported Matt 100 GSM or equivalent', type: 'ALL BW', pref: 'B/W & COLOR / ROYAL PRINT', single: '800', both: '1600' },
                { sl: 2, paper: 'Paper One 100 GSM or equivalent', type: 'ALL BW', pref: 'B/W & COLOR / ROYAL PRINT', single: '1000', both: '2000' },
                { sl: 3, paper: 'Bond Paper 85 GSM or equivalent', type: 'ALL BW', pref: 'B/W & COLOR / ROYAL PRINT', single: '1000', both: '2000' },
                { sl: 4, paper: 'Standard 70-75 GSM or equivalent', type: 'ALL BW', pref: 'B/W & COLOR / ROYAL PRINT', single: '1200', both: '2400' }
              ].map((row) => (
                <Box key={row.sl} component="tr" sx={{ bgcolor: 'common.white' }}>
                  <Box component="td">{`${row.sl}.`}</Box>
                  <Box component="td">{row.paper}</Box>
                  <Box component="td">{row.type}</Box>
                  <Box component="td">{row.pref}</Box>
                  <Box component="td">{row.single}</Box>
                  <Box component="td">{row.both}</Box>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

function HeaderInfo({ icon: Icon, text }) {
  const theme = useTheme();

  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <Box
        sx={{
          width: 22,
          height: 22,
          borderRadius: '50%',
          display: 'grid',
          placeItems: 'center',
          color: theme.palette.info.main,
          border: `1px solid ${alpha(theme.palette.info.main, 0.22)}`
        }}
      >
        <Icon style={{ fontSize: 12 }} />
      </Box>
      <Typography variant="caption" sx={{ fontSize: '0.72rem', color: 'text.secondary', letterSpacing: 0.15 }}>
        {text}
      </Typography>
    </Stack>
  );
}

export function HeaderNav() {
  const theme = useTheme();

  return (
    <Box sx={{ bgcolor: 'common.white' }}>
      <Container maxWidth="lg">
        <Stack
          direction={{ xs: 'column', lg: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', lg: 'center' }}
          spacing={{ xs: 2, lg: 3 }}
          sx={{ py: 2.5 }}
        >
          <Stack direction="row" spacing={3} alignItems="center" sx={{ width: '100%', justifyContent: { xs: 'space-between', lg: 'flex-start' } }}>
            <Logo to="/" logoHeight={58} />
            <Typography sx={{ display: { xs: 'none', md: 'block' }, fontSize: '0.82rem', fontWeight: 600, letterSpacing: 0.8 }}>
              LOGIN
            </Typography>
          </Stack>

          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={{ xs: 1.25, md: 2.2 }}
            alignItems={{ xs: 'flex-start', md: 'center' }}
            sx={{ width: '100%', justifyContent: 'flex-end' }}
          >
            {navItems.map((item) => (
              <Typography
                key={item}
                sx={{
                  fontSize: '0.76rem',
                  fontWeight: 500,
                  color: 'text.primary',
                  cursor: 'default',
                  whiteSpace: 'nowrap'
                }}
              >
                {item}
              </Typography>
            ))}

            <Button
              variant="contained"
              sx={{
                ml: { md: 1 },
                px: 3,
                py: 1.4,
                borderRadius: 0,
                bgcolor: theme.palette.warning.lighter,
                color: theme.palette.text.primary,
                boxShadow: 'none',
                '&:hover': {
                  bgcolor: theme.palette.warning.light,
                  boxShadow: 'none'
                }
              }}
            >
              Order Thesis Online
            </Button>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}

function HeroBanner() {
  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: { xs: 220, md: 280 },
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        color: 'common.white',
        backgroundImage: `linear-gradient(0deg, rgba(27, 24, 20, 0.38), rgba(27, 24, 20, 0.38)), url(${banner2})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <Typography variant="h1" sx={{ fontSize: { xs: '2rem', md: '3rem' }, fontWeight: 400, letterSpacing: 0.4 }}>
        Order Thesis Online
      </Typography>
    </Box>
  );
}

function ProgressHeader({ activeIndex }) {
  const theme = useTheme();

  return (
    <Box sx={{ maxWidth: 760, mx: 'auto', mb: 3 }}>
      <Box sx={{ position: 'relative', px: { xs: 2, md: 3 }, pb: 1.25 }}>
        <Box
          sx={{
            position: 'absolute',
            top: 7,
            left: 24,
            right: 24,
            height: 2,
            bgcolor: alpha(theme.palette.secondary.main, 0.22)
          }}
        />
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          {stepGroups.map((label, index) => {
            const isActive = index <= activeIndex;

            return (
              <Stack key={label} alignItems="center" spacing={1} sx={{ position: 'relative', zIndex: 1 }}>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: isActive ? theme.palette.info.main : alpha(theme.palette.info.main, 0.38)
                  }}
                />
                <Typography
                  sx={{
                    fontSize: { xs: '0.8rem', md: '0.88rem' },
                    color: isActive ? theme.palette.info.main : 'text.secondary',
                    fontWeight: 500
                  }}
                >
                  {label}
                </Typography>
              </Stack>
            );
          })}
        </Stack>
      </Box>
    </Box>
  );
}

function UploadStep() {
  return (
    <Box>
      <Paper
        elevation={0}
        sx={{
          borderRadius: 0,
          border: '1px solid',
          borderColor: 'divider',
          overflow: 'hidden'
        }}
      >
        <Grid container>
          <Grid item xs={12} md={6}>
            <UploadCard title="UPLOAD THESIS DOCUMENT" showError />
          </Grid>
          <Grid item xs={12} md={6} sx={{ borderLeft: { md: '1px solid' }, borderColor: 'divider' }}>
            <UploadCard title="UPLOAD SYNOPSIS DOCUMENT (Optional)" />
          </Grid>
        </Grid>
      </Paper>

      <Box
        sx={{
          mt: 0,
          px: { xs: 2, md: 2.5 },
          py: 2.5,
          bgcolor: '#f7f7f5',
          borderLeft: (theme) => `3px solid ${theme.palette.info.main}`
        }}
      >
        <Typography sx={{ fontSize: '1rem', fontWeight: 500, mb: 1.25 }}>Additional Information</Typography>
        <Box component="ol" sx={{ m: 0, pl: 2.25, color: 'text.primary' }}>
          <Typography component="li" sx={{ fontSize: '0.82rem', mb: 0.75 }}>
            Upload only one thesis per order
          </Typography>
          <Typography component="li" sx={{ fontSize: '0.82rem' }}>
            We prefer pdf.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

function UploadCard({ title, showError = false }) {
  const theme = useTheme();

  return (
    <Box sx={{ px: { xs: 2, md: 4 }, py: { xs: 3, md: 5 }, textAlign: 'center' }}>
      <Typography sx={{ fontSize: { xs: '1.15rem', md: '1.55rem' }, lineHeight: 1.15, fontWeight: 700, mb: 4 }}>
        {title}
      </Typography>

      <Box
        sx={{
          width: '100%',
          maxWidth: 300,
          minHeight: 208,
          mx: 'auto',
          border: `2px dashed ${alpha(theme.palette.secondary.main, 0.18)}`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          px: 2,
          py: 3.5,
          bgcolor: 'common.white'
        }}
      >
        <Box
          sx={{
            width: 42,
            height: 42,
            borderRadius: '50%',
            display: 'grid',
            placeItems: 'center',
            bgcolor: theme.palette.info.main,
            color: 'common.white',
            mb: 2
          }}
        >
          <CloudUploadOutlined style={{ fontSize: 22 }} />
        </Box>

        <Typography sx={{ fontSize: '0.83rem', letterSpacing: 0.5 }}>DROP YOUR FILE HERE</Typography>
        <Typography color="text.secondary" sx={{ fontSize: '0.8rem' }}>
          or click to select
        </Typography>
      </Box>

      <Box sx={{ mt: 2.5 }}>
        {showError && (
          <Typography sx={{ fontSize: '0.84rem', color: 'error.main', mb: 0.5 }}>*Please upload a pdf.</Typography>
        )}
        <Typography sx={{ fontSize: '0.82rem', color: 'text.secondary' }}>Maximum size allowed is 512MB.</Typography>
        <Typography sx={{ fontSize: '0.82rem', color: 'text.secondary' }}>Supported formats are: pdf</Typography>
        <Typography sx={{ mt: 0.75, fontSize: '0.84rem', color: 'info.main', textDecoration: 'underline' }}>Convert Doc to Pdf here</Typography>
      </Box>
    </Box>
  );
}

function DocumentDetailsStep() {
  const theme = useTheme();
  const [bindingType, setBindingType] = useState('hard');

  const pageStats = [
    { label: 'Total page', value: 1 },
    { label: 'Color page', value: 0 },
    { label: 'BW page', value: 1 }
  ];

  return (
    <Box>
      <Paper
        elevation={0}
        sx={{
          borderRadius: 0,
          border: '1px solid',
          borderColor: 'divider',
          overflow: 'hidden'
        }}
      >
        <Box sx={{ px: { xs: 2, md: 4 }, py: { xs: 2.5, md: 3 } }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              alignItems: { xs: 'flex-start', md: 'center' },
              justifyContent: 'space-between',
              gap: 2,
              pb: 1.75,
              mb: 1.75,
              borderBottom: '1px solid',
              borderColor: 'divider'
            }}
          >
            <Typography
              sx={{
                fontSize: '0.9rem',
                fontWeight: 600,
                letterSpacing: 0.6,
                textTransform: 'uppercase'
              }}
            >
              THESIS FILE NAME :
            </Typography>

            <Button
              variant="contained"
              sx={{
                px: 3,
                py: 1.1,
                borderRadius: 0,
                bgcolor: theme.palette.info.main,
                color: 'common.white',
                boxShadow: 'none',
                fontSize: '0.8rem',
                letterSpacing: 0.4,
                '&:hover': {
                  bgcolor: theme.palette.info.dark,
                  boxShadow: 'none'
                }
              }}
            >
              Edit
            </Button>
          </Box>

          <Box sx={{ borderRadius: 0, overflow: 'hidden' }}>
            {pageStats.map((item, index) => (
              <Grid
                key={item.label}
                container
                sx={{
                  px: { xs: 1.75, md: 2.5 },
                  py: 1.15,
                  bgcolor: index % 2 === 0 ? alpha(theme.palette.info.main, 0.06) : 'transparent',
                  borderBottom: index === pageStats.length - 1 ? 'none' : '1px solid',
                  borderColor: 'divider'
                }}
              >
                <Grid item xs={10}>
                  <Typography sx={{ fontSize: '0.84rem', color: 'text.primary' }}>{item.label}</Typography>
                </Grid>
                <Grid item xs={2} sx={{ textAlign: 'right' }}>
                  <Typography sx={{ fontSize: '0.84rem', color: 'text.primary' }}>{item.value}</Typography>
                </Grid>
              </Grid>
            ))}
          </Box>
        </Box>
      </Paper>

      <Box sx={{ mt: 4 }}>
        <Typography sx={{ fontSize: '1rem', fontWeight: 500, mb: 2 }}>Select type of Binding</Typography>
        <Grid container>
          <Grid item xs={12} md={6}>
            <BindingOptionCard
              label="Hard Binding"
              active={bindingType === 'hard'}
              onClick={() => setBindingType('hard')}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <BindingOptionCard
              label="Soft Binding"
              active={bindingType === 'soft'}
              onClick={() => setBindingType('soft')}
            />
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}

function BindingOptionCard({ label, active, onClick }) {
  const theme = useTheme();

  return (
    <Box
      onClick={onClick}
      sx={{
        cursor: 'pointer',
        px: { xs: 2.5, md: 3 },
        py: 2,
        border: '1px solid',
        borderColor: active ? theme.palette.info.main : 'divider',
        bgcolor: active ? alpha(theme.palette.info.main, 0.04) : 'common.white',
        display: 'flex',
        alignItems: 'center',
        gap: 1.5
      }}
    >
      <Box
        sx={{
          width: 18,
          height: 18,
          borderRadius: 0,
          border: `2px solid ${theme.palette.info.main}`,
          display: 'grid',
          placeItems: 'center',
          flexShrink: 0
        }}
      >
        {active && (
          <Box
            sx={{
              width: 10,
              height: 10,
              bgcolor: theme.palette.info.main
            }}
          />
        )}
      </Box>
      <Typography sx={{ fontSize: '0.9rem', fontWeight: 500 }}>{label}</Typography>
    </Box>
  );
}

function HardBindingStep() {
  const theme = useTheme();
  const [selectedCover, setSelectedCover] = useState('DBL-603');
  const [spinePrinting, setSpinePrinting] = useState('not-required');

  const coverOptions = [
    'DBL-603',
    'DBL-607',
    'DBL-605',
    'DBL-608',
    'DBL-609',
    'DBL-610',
    'DBL-611',
    'DBL-612',
    'DBL-613',
    'DBL-614',
    'DBL-615',
    'DBL-616',
    'DBL-617',
    'DBL-618',
    'DBL-619',
    'DBL-620'
  ];

  return (
    <Box>
      {/* Hard Print Details */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 0,
          border: '1px solid',
          borderColor: 'divider',
          mb: 4
        }}
      >
        <Box sx={{ px: { xs: 2, md: 3 }, pt: { xs: 2, md: 2.5 }, pb: { xs: 2.5, md: 3 } }}>
          <Typography sx={{ fontSize: '0.98rem', fontWeight: 600, mb: 2 }}>Hard Print Details</Typography>

          {/* Header strip */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              px: 2,
              py: 1,
              mb: 1.5,
              bgcolor: alpha(theme.palette.info.main, 0.06)
            }}
          >
            <Typography sx={{ fontSize: '0.82rem' }}>Papers Size :</Typography>
            <Typography sx={{ fontSize: '0.82rem' }}>No Of Copies :</Typography>
          </Box>

          <Grid container spacing={1.5} sx={{ mb: 1.5 }}>
            <Grid item xs={12} md={6}>
              <Typography sx={{ fontSize: '0.8rem', mb: 0.5 }}>Papers Size</Typography>
              <TextField size="small" fullWidth placeholder="A4 - Full" />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography sx={{ fontSize: '0.8rem', mb: 0.5 }}>No. Of Copies</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Button
                  variant="outlined"
                  size="small"
                  sx={{
                    minWidth: 32,
                    borderRadius: 0,
                    borderColor: alpha(theme.palette.secondary.main, 0.4)
                  }}
                >
                  -
                </Button>
                <TextField
                  size="small"
                  sx={{ maxWidth: 80, '& .MuiInputBase-input': { textAlign: 'center' } }}
                  defaultValue={0}
                />
                <Button
                  variant="outlined"
                  size="small"
                  sx={{
                    minWidth: 32,
                    borderRadius: 0,
                    borderColor: alpha(theme.palette.secondary.main, 0.4)
                  }}
                >
                  +
                </Button>
              </Box>
            </Grid>
          </Grid>

          <Grid container spacing={1.5} sx={{ mb: 1.5 }}>
            <Grid item xs={12} md={6}>
              <Typography sx={{ fontSize: '0.8rem', mb: 0.5 }}>Papers</Typography>
              <TextField size="small" fullWidth placeholder="Art Card" />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography sx={{ fontSize: '0.8rem', mb: 0.5 }}>Printing Colour</Typography>
              <TextField size="small" fullWidth placeholder="Select" />
            </Grid>
          </Grid>

          <Grid container spacing={1.5} sx={{ mb: 1.5 }}>
            <Grid item xs={12} md={6}>
              <Typography sx={{ fontSize: '0.8rem', mb: 0.5 }}>Printing Type</Typography>
              <TextField size="small" fullWidth placeholder="Select" />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography sx={{ fontSize: '0.8rem', mb: 0.5 }}>A4 Pockets</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Button
                  variant="outlined"
                  size="small"
                  sx={{
                    minWidth: 32,
                    borderRadius: 0,
                    borderColor: alpha(theme.palette.secondary.main, 0.4)
                  }}
                >
                  -
                </Button>
                <TextField
                  size="small"
                  sx={{ maxWidth: 80, '& .MuiInputBase-input': { textAlign: 'center' } }}
                  defaultValue={0}
                />
                <Button
                  variant="outlined"
                  size="small"
                  sx={{
                    minWidth: 32,
                    borderRadius: 0,
                    borderColor: alpha(theme.palette.secondary.main, 0.4)
                  }}
                >
                  +
                </Button>
              </Box>
            </Grid>
          </Grid>

          <Grid container spacing={1.5} sx={{ mb: 1.5 }}>
            <Grid item xs={12} md={6}>
              <Typography sx={{ fontSize: '0.8rem', mb: 0.5 }}>CD Pockets</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Button
                  variant="outlined"
                  size="small"
                  sx={{
                    minWidth: 32,
                    borderRadius: 0,
                    borderColor: alpha(theme.palette.secondary.main, 0.4)
                  }}
                >
                  -
                </Button>
                <TextField
                  size="small"
                  sx={{ maxWidth: 80, '& .MuiInputBase-input': { textAlign: 'center' } }}
                  defaultValue={0}
                />
                <Button
                  variant="outlined"
                  size="small"
                  sx={{
                    minWidth: 32,
                    borderRadius: 0,
                    borderColor: alpha(theme.palette.secondary.main, 0.4)
                  }}
                >
                  +
                </Button>
              </Box>
            </Grid>
          </Grid>

          <Typography sx={{ fontSize: '0.8rem', mb: 0.5 }}>Additional Information</Typography>
          <TextField fullWidth multiline minRows={2} size="small" sx={{ mb: 2.5 }} />

          <Box
            sx={{
              mt: 1,
              pt: 1.5,
              borderTop: '1px dashed',
              borderColor: alpha(theme.palette.secondary.main, 0.2),
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <Typography sx={{ fontSize: '0.8rem' }}>Papers Size :</Typography>
            <Typography sx={{ fontSize: '0.8rem' }}>No Of Copies :</Typography>
          </Box>

          <Box sx={{ mt: 1.5 }}>
            <Button
              variant="contained"
              sx={{
                borderRadius: 0,
                px: 3,
                py: 0.75,
                bgcolor: theme.palette.warning.lighter,
                color: theme.palette.text.primary,
                boxShadow: 'none',
                '&:hover': {
                  bgcolor: theme.palette.warning.light,
                  boxShadow: 'none'
                }
              }}
            >
              + Create New
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Hard Binding Details */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 0,
          border: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Box sx={{ px: { xs: 2, md: 3 }, py: { xs: 2, md: 2.5 } }}>
          <Typography sx={{ fontSize: '0.98rem', fontWeight: 600, mb: 2 }}>Hard Binding Details</Typography>

          <Typography sx={{ fontSize: '0.8rem', mb: 1.5 }}>Colour of Covering Materials (Block)</Typography>

          <Grid container spacing={1.5} sx={{ mb: 2 }}>
            {coverOptions.map((code) => {
              const isActive = code === selectedCover;

              return (
                <Grid key={code} item xs={6} sm={4} md={3}>
                  <Box
                    onClick={() => setSelectedCover(code)}
                    sx={{
                      cursor: 'pointer',
                      border: '1px solid',
                      borderColor: isActive ? theme.palette.info.main : 'divider',
                      bgcolor: 'common.white',
                      p: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 0.75
                    }}
                  >
                    <Box
                      sx={{
                        width: '100%',
                        pt: '135%',
                        position: 'relative',
                        bgcolor: isActive ? alpha(theme.palette.info.main, 0.3) : alpha(theme.palette.secondary.main, 0.08)
                      }}
                    />
                    <Typography sx={{ fontSize: '0.75rem' }}>{code}</Typography>
                  </Box>
                </Grid>
              );
            })}
          </Grid>

          <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
            <Grid item xs={12} md={6}>
              <Typography sx={{ fontSize: '0.8rem', mb: 0.75 }}>Cover Page Charges</Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                <Button
                  variant="contained"
                  sx={{
                    borderRadius: 0,
                    bgcolor: theme.palette.warning.lighter,
                    color: theme.palette.text.primary,
                    boxShadow: 'none',
                    px: 2.5,
                    py: 0.8,
                    '&:hover': {
                      bgcolor: theme.palette.warning.light,
                      boxShadow: 'none'
                    }
                  }}
                >
                  Same as Thesis Cover
                </Button>
                <Button
                  variant="outlined"
                  sx={{
                    borderRadius: 0,
                    px: 2.5,
                    py: 0.8,
                    borderColor: alpha(theme.palette.secondary.main, 0.4),
                    color: 'text.primary'
                  }}
                >
                  Upload New Design
                </Button>
              </Stack>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography sx={{ fontSize: '0.8rem', mb: 0.75 }}>Spine Printing Details</Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                <Button
                  variant={spinePrinting === 'required' ? 'contained' : 'outlined'}
                  onClick={() => setSpinePrinting('required')}
                  sx={{
                    borderRadius: 0,
                    px: 2.5,
                    py: 0.8,
                    bgcolor: spinePrinting === 'required' ? theme.palette.info.main : 'common.white',
                    color: spinePrinting === 'required' ? 'common.white' : 'text.primary',
                    borderColor: alpha(theme.palette.info.main, 0.6),
                    boxShadow: 'none',
                    '&:hover': {
                      bgcolor:
                        spinePrinting === 'required' ? theme.palette.info.dark : alpha(theme.palette.info.main, 0.06),
                      boxShadow: 'none'
                    }
                  }}
                >
                  Spine Printing Required
                </Button>
                <Button
                  variant={spinePrinting === 'not-required' ? 'contained' : 'outlined'}
                  onClick={() => setSpinePrinting('not-required')}
                  sx={{
                    borderRadius: 0,
                    px: 2.5,
                    py: 0.8,
                    bgcolor: spinePrinting === 'not-required' ? theme.palette.warning.lighter : 'common.white',
                    color: 'text.primary',
                    borderColor: alpha(theme.palette.secondary.main, 0.4),
                    boxShadow: 'none',
                    '&:hover': {
                      bgcolor:
                        spinePrinting === 'not-required'
                          ? theme.palette.warning.light
                          : alpha(theme.palette.warning.light, 0.1),
                      boxShadow: 'none'
                    }
                  }}
                >
                  Spine Printing Not Required
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Box>
  );
}

function SoftBindingStep() {
  const theme = useTheme();
  const [selectedCover, setSelectedCover] = useState('DBL-603');
  const [spinePrinting, setSpinePrinting] = useState('not-required');

  const coverOptions = [
    'DBL-603',
    'DBL-607',
    'DBL-605',
    'DBL-608',
    'DBL-609',
    'DBL-610',
    'DBL-611',
    'DBL-612',
    'DBL-613',
    'DBL-614',
    'DBL-615',
    'DBL-616',
    'DBL-617',
    'DBL-618',
    'DBL-619',
    'DBL-620'
  ];

  return (
    <Box>
      {/* Soft Print Details */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 0,
          border: '1px solid',
          borderColor: 'divider',
          mb: 4
        }}
      >
        <Box sx={{ px: { xs: 2, md: 3 }, pt: { xs: 2, md: 2.5 }, pb: { xs: 2.5, md: 3 } }}>
          <Typography sx={{ fontSize: '0.98rem', fontWeight: 600, mb: 2 }}>Soft Print Details</Typography>

          {/* Header strip */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              px: 2,
              py: 1,
              mb: 1.5,
              bgcolor: alpha(theme.palette.info.main, 0.06)
            }}
          >
            <Typography sx={{ fontSize: '0.82rem' }}>Papers Size :</Typography>
            <Typography sx={{ fontSize: '0.82rem' }}>No Of Copies :</Typography>
          </Box>

          <Grid container spacing={1.5} sx={{ mb: 1.5 }}>
            <Grid item xs={12} md={6}>
              <Typography sx={{ fontSize: '0.8rem', mb: 0.5 }}>Papers Size</Typography>
              <TextField size="small" fullWidth placeholder="A4 - Full" />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography sx={{ fontSize: '0.8rem', mb: 0.5 }}>No. Of Copies</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Button
                  variant="outlined"
                  size="small"
                  sx={{
                    minWidth: 32,
                    borderRadius: 0,
                    borderColor: alpha(theme.palette.secondary.main, 0.4)
                  }}
                >
                  -
                </Button>
                <TextField
                  size="small"
                  sx={{ maxWidth: 80, '& .MuiInputBase-input': { textAlign: 'center' } }}
                  defaultValue={0}
                />
                <Button
                  variant="outlined"
                  size="small"
                  sx={{
                    minWidth: 32,
                    borderRadius: 0,
                    borderColor: alpha(theme.palette.secondary.main, 0.4)
                  }}
                >
                  +
                </Button>
              </Box>
            </Grid>
          </Grid>

          <Grid container spacing={1.5} sx={{ mb: 1.5 }}>
            <Grid item xs={12} md={6}>
              <Typography sx={{ fontSize: '0.8rem', mb: 0.5 }}>Papers</Typography>
              <TextField size="small" fullWidth placeholder="Art Card" />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography sx={{ fontSize: '0.8rem', mb: 0.5 }}>Printing Colour</Typography>
              <TextField size="small" fullWidth placeholder="Select" />
            </Grid>
          </Grid>

          <Grid container spacing={1.5} sx={{ mb: 1.5 }}>
            <Grid item xs={12} md={6}>
              <Typography sx={{ fontSize: '0.8rem', mb: 0.5 }}>Printing Type</Typography>
              <TextField size="small" fullWidth placeholder="Select" />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography sx={{ fontSize: '0.8rem', mb: 0.5 }}>A4 Pockets</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Button
                  variant="outlined"
                  size="small"
                  sx={{
                    minWidth: 32,
                    borderRadius: 0,
                    borderColor: alpha(theme.palette.secondary.main, 0.4)
                  }}
                >
                  -
                </Button>
                <TextField
                  size="small"
                  sx={{ maxWidth: 80, '& .MuiInputBase-input': { textAlign: 'center' } }}
                  defaultValue={0}
                />
                <Button
                  variant="outlined"
                  size="small"
                  sx={{
                    minWidth: 32,
                    borderRadius: 0,
                    borderColor: alpha(theme.palette.secondary.main, 0.4)
                  }}
                >
                  +
                </Button>
              </Box>
            </Grid>
          </Grid>

          <Grid container spacing={1.5} sx={{ mb: 1.5 }}>
            <Grid item xs={12} md={6}>
              <Typography sx={{ fontSize: '0.8rem', mb: 0.5 }}>CD Pockets</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Button
                  variant="outlined"
                  size="small"
                  sx={{
                    minWidth: 32,
                    borderRadius: 0,
                    borderColor: alpha(theme.palette.secondary.main, 0.4)
                  }}
                >
                  -
                </Button>
                <TextField
                  size="small"
                  sx={{ maxWidth: 80, '& .MuiInputBase-input': { textAlign: 'center' } }}
                  defaultValue={0}
                />
                <Button
                  variant="outlined"
                  size="small"
                  sx={{
                    minWidth: 32,
                    borderRadius: 0,
                    borderColor: alpha(theme.palette.secondary.main, 0.4)
                  }}
                >
                  +
                </Button>
              </Box>
            </Grid>
          </Grid>

          <Typography sx={{ fontSize: '0.8rem', mb: 0.5 }}>Additional Information</Typography>
          <TextField fullWidth multiline minRows={2} size="small" sx={{ mb: 2.5 }} />

          <Box
            sx={{
              mt: 1,
              pt: 1.5,
              borderTop: '1px dashed',
              borderColor: alpha(theme.palette.secondary.main, 0.2),
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <Typography sx={{ fontSize: '0.8rem' }}>Papers Size :</Typography>
            <Typography sx={{ fontSize: '0.8rem' }}>No Of Copies :</Typography>
          </Box>

          <Box sx={{ mt: 1.5 }}>
            <Button
              variant="contained"
              sx={{
                borderRadius: 0,
                px: 3,
                py: 0.75,
                bgcolor: theme.palette.warning.lighter,
                color: theme.palette.text.primary,
                boxShadow: 'none',
                '&:hover': {
                  bgcolor: theme.palette.warning.light,
                  boxShadow: 'none'
                }
              }}
            >
              + Create New
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Soft Binding Details */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 0,
          border: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Box sx={{ px: { xs: 2, md: 3 }, py: { xs: 2, md: 2.5 } }}>
          <Typography sx={{ fontSize: '0.98rem', fontWeight: 600, mb: 2 }}>Soft Binding Details</Typography>

          <Typography sx={{ fontSize: '0.8rem', mb: 1.5 }}>Colour of Covering Materials (Soft)</Typography>

          <Grid container spacing={1.5} sx={{ mb: 2 }}>
            {coverOptions.map((code) => {
              const isActive = code === selectedCover;

              return (
                <Grid key={code} item xs={6} sm={4} md={3}>
                  <Box
                    onClick={() => setSelectedCover(code)}
                    sx={{
                      cursor: 'pointer',
                      border: '1px solid',
                      borderColor: isActive ? theme.palette.info.main : 'divider',
                      bgcolor: 'common.white',
                      p: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 0.75
                    }}
                  >
                    <Box
                      sx={{
                        width: '100%',
                        pt: '135%',
                        position: 'relative',
                        bgcolor: isActive ? alpha(theme.palette.info.main, 0.3) : alpha(theme.palette.secondary.main, 0.08)
                      }}
                    />
                    <Typography sx={{ fontSize: '0.75rem' }}>{code}</Typography>
                  </Box>
                </Grid>
              );
            })}
          </Grid>

          <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
            <Grid item xs={12} md={6}>
              <Typography sx={{ fontSize: '0.8rem', mb: 0.75 }}>Cover Page Charges</Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                <Button
                  variant="contained"
                  sx={{
                    borderRadius: 0,
                    bgcolor: theme.palette.warning.lighter,
                    color: theme.palette.text.primary,
                    boxShadow: 'none',
                    px: 2.5,
                    py: 0.8,
                    '&:hover': {
                      bgcolor: theme.palette.warning.light,
                      boxShadow: 'none'
                    }
                  }}
                >
                  Same as Thesis Cover
                </Button>
                <Button
                  variant="outlined"
                  sx={{
                    borderRadius: 0,
                    px: 2.5,
                    py: 0.8,
                    borderColor: alpha(theme.palette.secondary.main, 0.4),
                    color: 'text.primary'
                  }}
                >
                  Upload New Design
                </Button>
              </Stack>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography sx={{ fontSize: '0.8rem', mb: 0.75 }}>Spine Printing Details</Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                <Button
                  variant={spinePrinting === 'required' ? 'contained' : 'outlined'}
                  onClick={() => setSpinePrinting('required')}
                  sx={{
                    borderRadius: 0,
                    px: 2.5,
                    py: 0.8,
                    bgcolor: spinePrinting === 'required' ? theme.palette.info.main : 'common.white',
                    color: spinePrinting === 'required' ? 'common.white' : 'text.primary',
                    borderColor: alpha(theme.palette.info.main, 0.6),
                    boxShadow: 'none',
                    '&:hover': {
                      bgcolor:
                        spinePrinting === 'required' ? theme.palette.info.dark : alpha(theme.palette.info.main, 0.06),
                      boxShadow: 'none'
                    }
                  }}
                >
                  Spine Printing Required
                </Button>
                <Button
                  variant={spinePrinting === 'not-required' ? 'contained' : 'outlined'}
                  onClick={() => setSpinePrinting('not-required')}
                  sx={{
                    borderRadius: 0,
                    px: 2.5,
                    py: 0.8,
                    bgcolor: spinePrinting === 'not-required' ? theme.palette.warning.lighter : 'common.white',
                    color: 'text.primary',
                    borderColor: alpha(theme.palette.secondary.main, 0.4),
                    boxShadow: 'none',
                    '&:hover': {
                      bgcolor:
                        spinePrinting === 'not-required'
                          ? theme.palette.warning.light
                          : alpha(theme.palette.warning.light, 0.1),
                      boxShadow: 'none'
                    }
                  }}
                >
                  Spine Printing Not Required
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Box>
  );
}

function OrderSummaryStep({ summary, loading, error }) {
  const theme = useTheme();

  const border = `1px solid ${alpha(theme.palette.secondary.main, 0.2)}`;
  const tableHeaderBg = alpha(theme.palette.info.main, 0.1);
  const subTotalBg = alpha(theme.palette.info.main, 0.08);

  const tableBaseStyles = {
    width: '100%',
    borderCollapse: 'collapse',
    '& th, & td': {
      border,
      px: 1.5,
      py: 1,
      fontSize: '0.8rem',
      textAlign: 'left'
    }
  };

  function SectionCard({ title, section, bindLabel }) {
    const printRows = Array.isArray(section?.printDetails) ? section.printDetails : [];
    const bindingRows = Array.isArray(section?.bindingDetails) ? section.bindingDetails : [];

    return (
      <Box
        sx={{
          border,
          mb: 3,
          overflow: 'hidden'
        }}
      >
        {/* Section title */}
        <Box sx={{ px: 2.5, py: 1.5, bgcolor: alpha(theme.palette.info.main, 0.06), borderBottom: border }}>
          <Typography sx={{ fontSize: '1rem', fontWeight: 700 }}>{title}</Typography>
        </Box>

        <Box sx={{ p: { xs: 1.5, md: 2.5 } }}>
          {/* Print Details header */}
          <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mb: 1.25 }}>
            <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: theme.palette.info.main }}>Print Details</Typography>
            <InfoCircleOutlined style={{ fontSize: 13, color: theme.palette.info.main }} />
          </Stack>

          {/* Print table */}
          <Box component="table" sx={{ ...tableBaseStyles, mb: 2.5 }}>
            <Box component="thead">
              <Box component="tr" sx={{ bgcolor: tableHeaderBg }}>
                {['Description', 'Copies', 'Colour/ BW', '1st Copy Rate', 'Additional Copy Rate', 'Cost'].map((h) => (
                  <Box key={h} component="th" sx={{ fontWeight: 600 }}>
                    {h}
                  </Box>
                ))}
              </Box>
            </Box>
            <Box component="tbody">
              {printRows.length ? (
                printRows.map((row, index) => (
                  <Box key={`${row.description || 'print'}-${index}`} component="tr">
                    <Box component="td">{row.description || '-'}</Box>
                    <Box component="td">{row.copies ?? 0}</Box>
                    <Box component="td">{row.colorType || '-'}</Box>
                    <Box component="td">{row.firstCopyRate ?? 0}</Box>
                    <Box component="td">{row.additionalCopyRate ?? 0}</Box>
                    <Box component="td" sx={{ color: theme.palette.info.main }}>&#x20B9; {row.cost ?? 0}</Box>
                  </Box>
                ))
              ) : (
                <Box component="tr">
                  <Box component="td">-</Box>
                  <Box component="td">0</Box>
                  <Box component="td">-</Box>
                  <Box component="td">0</Box>
                  <Box component="td">0</Box>
                  <Box component="td" sx={{ color: theme.palette.info.main }}>&#x20B9; 0</Box>
                </Box>
              )}
              <Box component="tr" sx={{ bgcolor: subTotalBg }}>
                <Box component="td" colSpan={5} sx={{ fontWeight: 600, color: theme.palette.info.main }}>
                  Sub Total
                </Box>
                <Box component="td" sx={{ fontWeight: 600, color: theme.palette.info.main }}>&#x20B9; {section?.subTotal ?? 0}</Box>
              </Box>
            </Box>
          </Box>

          {/* Binding Details header */}
          <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mb: 1.25 }}>
            <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: theme.palette.info.main }}>Binding Details</Typography>
            <InfoCircleOutlined style={{ fontSize: 13, color: theme.palette.info.main }} />
          </Stack>

          {/* Binding table */}
          <Box component="table" sx={tableBaseStyles}>
            <Box component="thead">
              <Box component="tr" sx={{ bgcolor: tableHeaderBg }}>
                {['Description', 'Copies', 'Cost'].map((h) => (
                  <Box key={h} component="th" sx={{ fontWeight: 600 }}>
                    {h}
                  </Box>
                ))}
              </Box>
            </Box>
            <Box component="tbody">
              {bindingRows.length ? (
                bindingRows.map((row, index) => (
                  <Box key={`${row.description || bindLabel}-${index}`} component="tr">
                    <Box component="td">{row.description || bindLabel}</Box>
                    <Box component="td">{row.copies ?? 0}</Box>
                    <Box component="td" sx={{ color: theme.palette.info.main }}>&#x20B9; {row.cost ?? 0}</Box>
                  </Box>
                ))
              ) : (
                <Box component="tr">
                  <Box component="td">{bindLabel}</Box>
                  <Box component="td">0</Box>
                  <Box component="td" sx={{ color: theme.palette.info.main }}>&#x20B9; 0</Box>
                </Box>
              )}
            </Box>
          </Box>

          {/* Edit Order */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1.5 }}>
            <Stack
              direction="row"
              spacing={0.6}
              alignItems="center"
              sx={{
                cursor: 'pointer',
                color: theme.palette.info.main,
                '&:hover': { opacity: 0.75 }
              }}
            >
              <EditOutlined style={{ fontSize: 13 }} />
              <Typography sx={{ fontSize: '0.8rem', color: 'inherit' }}>Edit Order</Typography>
            </Stack>
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      <Typography
        sx={{
          fontSize: { xs: '1.2rem', md: '1.4rem' },
          fontWeight: 600,
          textAlign: 'center',
          mb: 3
        }}
      >
        Order Summary
      </Typography>

      {loading ? (
        <Typography sx={{ textAlign: 'center', mb: 2, color: 'text.secondary' }}>Loading order summary...</Typography>
      ) : null}

      {error ? <Typography sx={{ textAlign: 'center', mb: 2, color: 'error.main' }}>{error}</Typography> : null}

      <SectionCard title={summary?.hardSection?.sectionName || 'Hard Binding & Printing'} section={summary?.hardSection} bindLabel="Hard Bind" />
      <SectionCard title={summary?.softSection?.sectionName || 'Soft Binding & Printing'} section={summary?.softSection} bindLabel="Soft Bind" />

      {summary?.synopsisSection ? (
        <SectionCard title={summary.synopsisSection.sectionName || 'Synopsis Binding & Printing'} section={summary.synopsisSection} bindLabel="Synopsis" />
      ) : null}

      {/* Total */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          px: 2,
          py: 1.5,
          border,
          mt: 0.5
        }}
      >
        <Typography sx={{ fontSize: '0.9rem', fontWeight: 600, color: theme.palette.info.main }}>Total</Typography>
        <Typography sx={{ fontSize: '0.9rem', color: 'text.secondary' }}>{summary?.grandTotal ?? 0} INR</Typography>
      </Box>
    </Box>
  );
}

export function FooterSection() {
  const theme = useTheme();

  return (
    <Box sx={{ bgcolor: 'common.white', borderTop: `1px solid ${alpha(theme.palette.secondary.main, 0.12)}` }}>
      <Container maxWidth="lg">
        <Grid container spacing={4} sx={{ py: { xs: 5, md: 6 } }}>
          <Grid item xs={12} md={3}>
            <Logo to="/" logoHeight={82} />
            <Typography sx={{ mt: 1.5, maxWidth: 220, color: 'text.secondary', fontSize: '0.88rem' }}>
              A binding commitment since 1930.
            </Typography>
            <Stack direction="row" spacing={1.25} sx={{ mt: 3 }}>
              {socialIcons.map((Icon, index) => (
                <Box
                  key={index}
                  sx={{
                    width: 34,
                    height: 34,
                    borderRadius: '50%',
                    display: 'grid',
                    placeItems: 'center',
                    bgcolor: '#121212',
                    color: 'common.white'
                  }}
                >
                  <Icon style={{ fontSize: 16 }} />
                </Box>
              ))}
            </Stack>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <FooterLinkList items={['Home', 'What We Do', 'About Us']} />
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <FooterLinkList items={['Testimonials', 'Faq', 'Contact us']} />
          </Grid>

          <Grid item xs={12} md={2}>
            <Stack spacing={2}>
              <FooterContact icon={PhoneOutlined} title="Call" value="+ ( 91 ) 983 006 6537" />
              <FooterContact icon={MailOutlined} title="Email" value="contactus@dharbrothers.com" />
              <FooterContact icon={EnvironmentOutlined} title="Address" value="79, Lenin Sarani Rd, near COMMERCIAL POINT, Maula Ali, Taltala, Kolkata, West Bengal 700013" />
            </Stack>
          </Grid>

          <Grid item xs={12} md={3}>
            <Typography sx={{ fontSize: '1.35rem', fontWeight: 600, mb: 2 }}>Subscribe For The Latest News</Typography>
            <TextField
              fullWidth
              variant="standard"
              placeholder="Email"
              slotProps={{
                input: {
                  disableUnderline: false
                }
              }}
            />
            <Button
              fullWidth
              variant="contained"
              sx={{
                mt: 2.5,
                borderRadius: 0,
                bgcolor: theme.palette.warning.lighter,
                color: theme.palette.text.primary,
                boxShadow: 'none',
                '&:hover': {
                  bgcolor: theme.palette.warning.light,
                  boxShadow: 'none'
                }
              }}
            >
              Submit
            </Button>
          </Grid>
        </Grid>
      </Container>

      <Box sx={{ bgcolor: 'info.main', color: 'common.white', py: 2 }}>
        <Container maxWidth="lg">
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }}>
            <Typography sx={{ fontSize: '0.82rem' }}>© 2024 DHAR PRINTERS AND GENERAL ORDER SUPPLIERS | All Rights Reserved</Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 0.75, sm: 2.5 }}>
              <Typography sx={{ fontSize: '0.82rem' }}>Terms and Conditions</Typography>
              <Typography sx={{ fontSize: '0.82rem' }}>Privacy Policy</Typography>
              <Typography sx={{ fontSize: '0.82rem' }}>Refund Policy</Typography>
            </Stack>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}

function FooterLinkList({ items }) {
  return (
    <Stack spacing={1.5}>
      {items.map((item) => (
        <Typography key={item} sx={{ fontSize: '0.95rem', color: 'text.primary' }}>
          {item}
        </Typography>
      ))}
    </Stack>
  );
}

function FooterContact({ icon: Icon, title, value }) {
  const theme = useTheme();

  return (
    <Stack direction="row" spacing={1.25} alignItems="flex-start">
      <Box
        sx={{
          width: 38,
          height: 38,
          borderRadius: '50%',
          display: 'grid',
          placeItems: 'center',
          border: `1px solid ${alpha(theme.palette.info.main, 0.22)}`,
          color: theme.palette.info.main,
          flexShrink: 0
        }}
      >
        <Icon style={{ fontSize: 16 }} />
      </Box>
      <Box>
        <Typography sx={{ fontSize: '0.92rem', fontWeight: 600 }}>{title}</Typography>
        <Typography sx={{ fontSize: '0.84rem', color: 'text.secondary', lineHeight: 1.6 }}>{value}</Typography>
      </Box>
    </Stack>
  );
}
