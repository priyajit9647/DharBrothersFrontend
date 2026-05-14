import PropTypes from 'prop-types';
// material-ui
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';

// project imports
import MainCard from 'components/MainCard';

// assets
import RiseOutlined from '@ant-design/icons/RiseOutlined';
import FallOutlined from '@ant-design/icons/FallOutlined';

const iconSX = { fontSize: '0.75rem', color: 'inherit', marginLeft: 0, marginRight: 0 };

export default function AnalyticEcommerce({ color = 'primary', accent, title, count, percentage, isLoss, extra, subtitle, icon }) {
  const theme = useTheme();
  const accentColor = theme.vars?.palette?.[accent || color]?.main || theme.palette?.[accent || color]?.main || theme.palette.primary.main;
  const iconBorderColor = theme.vars?.palette?.[accent || color]?.light || accentColor;
  const IconComponent = icon;

  return (
    <MainCard
      contentSX={{ p: 2.5 }}
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 3,
        boxShadow: '0 10px 30px rgba(15, 23, 42, 0.06)',
        transition: 'transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          borderColor: iconBorderColor,
          boxShadow: `0 18px 36px ${theme.vars?.palette?.[accent || color]?.main ? `${theme.vars.palette[accent || color].main}14` : 'rgba(15, 23, 42, 0.12)'}`
        }
      }}
    >
      <Stack sx={{ gap: 1.25 }}>
        <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
          <Stack sx={{ gap: 0.5, minWidth: 0 }}>
            <Typography
              variant="overline"
              sx={{
                color: 'text.secondary',
                letterSpacing: 1.3,
                fontWeight: 700,
                lineHeight: 1.2,
                textTransform: 'uppercase'
              }}
            >
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.4 }}>
              {subtitle || extra}
            </Typography>
          </Stack>
          {IconComponent && (
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 2.5,
                display: 'grid',
                placeItems: 'center',
                bgcolor: `${accentColor}14`,
                color: accentColor,
                border: '1px solid',
                borderColor: `${accentColor}22`,
                flex: '0 0 auto'
              }}
            >
              <IconComponent style={{ fontSize: 20 }} />
            </Box>
          )}
        </Stack>

        <Grid container sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <Grid>
            <Typography variant="h3" color="text.primary" sx={{ fontWeight: 800, letterSpacing: -0.5, lineHeight: 1 }}>
              {count}
            </Typography>
          </Grid>
          {percentage && (
            <Grid>
              <Chip
                variant="combined"
                color={color}
                icon={isLoss ? <FallOutlined style={iconSX} /> : <RiseOutlined style={iconSX} />}
                label={`${percentage}%`}
                sx={{ ml: 1.25, pl: 1 }}
                size="small"
              />
            </Grid>
          )}
        </Grid>
      </Stack>
    </MainCard>
  );
}

AnalyticEcommerce.propTypes = {
  color: PropTypes.string,
  accent: PropTypes.string,
  title: PropTypes.string,
  count: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  percentage: PropTypes.number,
  isLoss: PropTypes.bool,
  extra: PropTypes.string,
  subtitle: PropTypes.string,
  icon: PropTypes.elementType
};
