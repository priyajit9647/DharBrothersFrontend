// material-ui
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import { useEffect, useState } from 'react';

import { getPincodeHeatmap, getCityHeatmap, getOrderHeatmapsFromOrders } from 'api/dashboard';
import { useAuth } from 'hooks/useAuth';

// project imports
import MainCard from 'components/MainCard';
import { withAlpha } from 'utils/colorUtils';
import { formatLabel } from 'utils/formatLabel';

// ==============================|| DEFAULT - UNIQUE VISITOR ||============================== //

function HeatTileGroup({ title, subtitle, data, primaryColor, secondaryColor, loading }) {
  const peak = Math.max(...data.map((item) => item.volume), 1);

  if (loading) {
    return (
      <Stack spacing={2.25}>
        <Box>
          <Typography variant="overline" sx={{ letterSpacing: 1.4, color: primaryColor }}>
            {formatLabel(title)}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
            Loading Heatmap Data...
          </Typography>
        </Box>
      </Stack>
    );
  }

  if (!data.length) {
    return (
      <Stack spacing={2.25}>
        <Box>
          <Typography variant="overline" sx={{ letterSpacing: 1.4, color: primaryColor }}>
            {formatLabel(title)}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
            No Data To Display
          </Typography>
        </Box>
      </Stack>
    );
  }

  return (
    <Stack spacing={2.25}>
      <Box>
        <Typography variant="overline" sx={{ letterSpacing: 1.4, color: primaryColor }}>
          {formatLabel(title)}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
          {formatLabel(subtitle)}
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
          console.log('Rendered Heatmap Item:', item);
          const intensity = item.volume / peak;
          return (
            <Box
              key={item.label}
              sx={{
                p: 1.75,
                minHeight: 126,
                borderRadius: 3,
                border: '1px solid',
                borderColor: withAlpha(primaryColor, 0.22),
                boxShadow: `0 18px 40px ${withAlpha(primaryColor, 0.12)}`,
                background: `linear-gradient(180deg, ${withAlpha(primaryColor, 0.2 + intensity * 0.38)} 0%, ${withAlpha(
                  secondaryColor,
                  0.12 + intensity * 0.28
                )} 100%)`,
                transition: 'transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: `0 24px 48px ${withAlpha(primaryColor, 0.16)}`,
                  borderColor: withAlpha(primaryColor, 0.4)
                }
              }}
            >
              <Stack sx={{ height: '100%', justifyContent: 'space-between' }}>
                <Typography variant="subtitle2" sx={{ textTransform: 'uppercase', letterSpacing: 0.9 }}>
                  {formatLabel(item.label)}
                </Typography>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, lineHeight: 1 }}>
                    {item.volume}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.8 }}>
                    Orders
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

  const { user } = useAuth();
  const [pincodeOrderHeat, setPincodeOrderHeat] = useState([]);
  const [cityOrderHeat, setCityOrderHeat] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const branchId = user?.branchId ?? user?.branch?.id ?? user?.profile?.branchId ?? null;

    async function load() {
      setLoading(true);

      try {
        const pincodeData = await getPincodeHeatmap({ branchId, limit: 10 });
        if (!active) return;

        console.log('Heatmap API Response:', pincodeData);

        let nextPincodes = Array.isArray(pincodeData) ? pincodeData : [];

        const cityData = await getCityHeatmap({ branchId, limit: 10 });
        if (!active) return;

        console.log('Heatmap API Response:', cityData);

        let nextCities = Array.isArray(cityData) ? cityData : [];

        if (nextPincodes.length === 0 || nextCities.length === 0) {
          const orderHeatmaps = await getOrderHeatmapsFromOrders({ branchId, limit: 10, size: 200 });
          if (!active) return;

          if (nextPincodes.length === 0 && Array.isArray(orderHeatmaps.pincodes) && orderHeatmaps.pincodes.length) {
            nextPincodes = orderHeatmaps.pincodes;
          }

          if (nextCities.length === 0 && Array.isArray(orderHeatmaps.cities) && orderHeatmaps.cities.length) {
            nextCities = orderHeatmaps.cities;
          }
        }

        setPincodeOrderHeat(nextPincodes);
        setCityOrderHeat(nextCities);
      } catch {
        setPincodeOrderHeat([]);
        setCityOrderHeat([]);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      active = false;
    };
  }, [user]);

  const topPincode = pincodeOrderHeat[0] ?? { label: '—', volume: 0 };
  const topCity = cityOrderHeat[0] ?? { label: '—', volume: 0 };

  return (
    <>
      <Grid container sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <Grid>
          <Typography variant="h5" sx={{ textTransform: 'uppercase', letterSpacing: 0.8 }}>
            Order Density Heat Map
          </Typography>
        </Grid>
        <Grid>
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" justifyContent="flex-end">
            <Chip label={`Top Pincode: ${formatLabel(topPincode.label)}`} color="warning" variant="outlined" size="small" />
            <Chip label={`Top City: ${formatLabel(topCity.label)}`} color="primary" variant="outlined" size="small" />
          </Stack>
        </Grid>
      </Grid>
      <MainCard content={false} sx={{ mt: 1.5 }}>
        <Box
          sx={{
            p: 2.5,
            background: `radial-gradient(circle at top right, ${withAlpha(theme.vars.palette.warning.main, 0.12)}, transparent 28%), linear-gradient(180deg, ${withAlpha(
              theme.vars.palette.common.white,
              0.92
            )} 0%, ${withAlpha(theme.vars.palette.warning.main, 0.04)} 100%)`
          }}
        >
          <Stack spacing={2.5}>
            <Grid container spacing={1.5} alignItems="stretch">
              <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex', flexBasis: { md: "calc(25% - 9px)" }, maxWidth: { md: "calc(25% - 9px)" } }}>
                <MainCard contentSX={{ p: 2 }} sx={{ bgcolor: withAlpha(theme.vars.palette.warning.main, 0.1), boxShadow: 'none', flex: 1, minHeight: 140 }}>
                  <Typography variant="overline" color="text.secondary">
                    Highest Pincode Volume
                  </Typography>
                  <Typography variant="h4">{topPincode.volume}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formatLabel(topPincode.label)}
                  </Typography>
                </MainCard>
              </Grid>
              <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex', flexBasis: { md: "calc(25% - 9px)" }, maxWidth: { md: "calc(25% - 9px)" } }}>
                <MainCard contentSX={{ p: 2 }} sx={{ bgcolor: withAlpha(theme.vars.palette.primary.main, 0.1), boxShadow: 'none', flex: 1, minHeight: 140 }}>
                  <Typography variant="overline" color="text.secondary">
                    Highest City Volume
                  </Typography>
                  <Typography variant="h4">{topCity.volume}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formatLabel(topCity.label)}
                  </Typography>
                </MainCard>
              </Grid>
              <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex', flexBasis: { md: "calc(25% - 9px)" }, maxWidth: { md: "calc(25% - 9px)" } }}>
                <MainCard contentSX={{ p: 2 }} sx={{ boxShadow: `0 14px 30px ${withAlpha(theme.vars.palette.warning.main, 0.08)}`, flex: 1, minHeight: 140 }}>
                  <Typography variant="overline" color="text.secondary">
                    Active Pincodes
                  </Typography>
                  <Typography variant="h4">{pincodeOrderHeat.length}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pincodes With Live Order Demand
                  </Typography>
                </MainCard>
              </Grid>
              <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex', flexBasis: { md: "calc(25% - 9px)" }, maxWidth: { md: "calc(25% - 9px)" } }}>
                <MainCard contentSX={{ p: 2 }} sx={{ boxShadow: `0 14px 30px ${withAlpha(theme.vars.palette.primary.main, 0.08)}`, flex: 1, minHeight: 140 }}>
                  <Typography variant="overline" color="text.secondary">
                    Active Cities
                  </Typography>
                  <Typography variant="h4">{cityOrderHeat.length}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Cities Contributing Current Orders
                  </Typography>
                </MainCard>
              </Grid>
            </Grid>

            <Divider />

            <HeatTileGroup
              title="Pincode Wise Heat Map"
              subtitle="Darker tiles indicate pincodes with the highest order concentration."
              data={pincodeOrderHeat}
              primaryColor={theme.vars.palette.warning.main}
              secondaryColor={theme.vars.palette.error.main}
              loading={loading}
            />

            <HeatTileGroup
              title="City Wise Heat Map"
              subtitle="Use this to compare city-level demand and spot the strongest order clusters."
              data={cityOrderHeat}
              primaryColor={theme.vars.palette.primary.main}
              secondaryColor={theme.vars.palette.info.main}
              loading={loading}
            />
          </Stack>
        </Box>
      </MainCard>
    </>
  );
}
