// material-ui
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';

// project imports
import MainCard from 'components/MainCard';
import { withAlpha } from 'utils/colorUtils';

// ==============================|| DEFAULT - UNIQUE VISITOR ||============================== //

const pincodeOrderHeat = [
  { area: '700001', orders: 184 },
  { area: '700012', orders: 151 },
  { area: '700091', orders: 136 },
  { area: '700107', orders: 128 },
  { area: '711101', orders: 97 },
  { area: '700156', orders: 88 },
  { area: '700032', orders: 81 },
  { area: '700136', orders: 74 }
];

const cityOrderHeat = [
  { area: 'Kolkata', orders: 462 },
  { area: 'Howrah', orders: 238 },
  { area: 'Barasat', orders: 194 },
  { area: 'Salt Lake', orders: 176 },
  { area: 'Bally', orders: 123 },
  { area: 'Madhyamgram', orders: 117 }
];

function HeatTileGroup({ title, subtitle, data, primaryColor, secondaryColor }) {
  const peak = Math.max(...data.map((item) => item.orders));

  return (
    <Stack spacing={2.25}>
      <Box>
        <Typography variant="subtitle1">{title}</Typography>
        <Typography variant="body2" color="text.secondary">
          {subtitle}
        </Typography>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', sm: 'repeat(4, minmax(0, 1fr))' },
          gap: 1.25
        }}
      >
        {data.map((item) => {
          const intensity = item.orders / peak;
          return (
            <Box
              key={item.area}
              sx={{
                p: 1.5,
                minHeight: 112,
                borderRadius: 2,
                border: '1px solid',
                borderColor: withAlpha(primaryColor, 0.18),
                background: `linear-gradient(180deg, ${withAlpha(primaryColor, 0.14 + intensity * 0.34)} 0%, ${withAlpha(
                  secondaryColor,
                  0.08 + intensity * 0.22
                )} 100%)`
              }}
            >
              <Stack sx={{ height: '100%', justifyContent: 'space-between' }}>
                <Typography variant="subtitle2">{item.area}</Typography>
                <Box>
                  <Typography variant="h5">{item.orders}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    orders
                  </Typography>
                </Box>
              </Stack>
            </Box>
          );
        })}
      </Box>
    </Stack>
  );
}

export default function UniqueVisitorCard() {
  const theme = useTheme();

  const topPincode = pincodeOrderHeat[0];
  const topCity = cityOrderHeat[0];

  return (
    <>
      <Grid container sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <Grid>
          <Typography variant="h5">Order Density Heat Map</Typography>
        </Grid>
        <Grid>
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" justifyContent="flex-end">
            <Chip label={`Top pincode: ${topPincode.area}`} color="warning" variant="outlined" size="small" />
            <Chip label={`Top city: ${topCity.area}`} color="primary" variant="outlined" size="small" />
          </Stack>
        </Grid>
      </Grid>
      <MainCard content={false} sx={{ mt: 1.5 }}>
        <Box sx={{ p: 2.5 }}>
          <Stack spacing={2.5}>
            <Grid container spacing={1.5}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <MainCard contentSX={{ p: 2 }} sx={{ bgcolor: withAlpha(theme.vars.palette.warning.main, 0.08) }}>
                  <Typography variant="overline" color="text.secondary">
                    Highest Pincode Volume
                  </Typography>
                  <Typography variant="h4">{topPincode.orders}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {topPincode.area}
                  </Typography>
                </MainCard>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <MainCard contentSX={{ p: 2 }} sx={{ bgcolor: withAlpha(theme.vars.palette.primary.main, 0.08) }}>
                  <Typography variant="overline" color="text.secondary">
                    Highest City Volume
                  </Typography>
                  <Typography variant="h4">{topCity.orders}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {topCity.area}
                  </Typography>
                </MainCard>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <MainCard contentSX={{ p: 2 }}>
                  <Typography variant="overline" color="text.secondary">
                    Active Pincodes
                  </Typography>
                  <Typography variant="h4">{pincodeOrderHeat.length}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pincodes with live order demand
                  </Typography>
                </MainCard>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <MainCard contentSX={{ p: 2 }}>
                  <Typography variant="overline" color="text.secondary">
                    Active Cities
                  </Typography>
                  <Typography variant="h4">{cityOrderHeat.length}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Cities contributing current orders
                  </Typography>
                </MainCard>
              </Grid>
            </Grid>

            <Divider />

            <HeatTileGroup
              title="Pincode-wise Heat Map"
              subtitle="Darker tiles indicate pincodes with the highest order concentration."
              data={pincodeOrderHeat}
              primaryColor={theme.vars.palette.warning.main}
              secondaryColor={theme.vars.palette.error.main}
            />

            <HeatTileGroup
              title="City-wise Heat Map"
              subtitle="Use this to compare city-level demand and spot the strongest order clusters."
              data={cityOrderHeat}
              primaryColor={theme.vars.palette.primary.main}
              secondaryColor={theme.vars.palette.info.main}
            />
          </Stack>
        </Box>
      </MainCard>
    </>
  );
}
