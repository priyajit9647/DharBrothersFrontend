import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import MainCard from 'components/MainCard';

// ==============================|| BMS - SYSTEM SETTINGS (ADMIN) ||============================== //

export default function SystemSettings() {
  return (
    <Grid container rowSpacing={3} columnSpacing={2.75}>
      <Grid item xs={12}>
        <Typography variant="h5">System Settings</Typography>
        <Typography variant="body2" color="text.secondary">
          Configure process flow, SLAs, delivery options and integration settings for the Binding Management System.
        </Typography>
      </Grid>

      <Grid item xs={12} md={6}>
        <MainCard title="Process Flow &amp; Stages" contentSX={{ p: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Define and reorder stages (e.g. Cutting → Binding → Packing → Delivery) and per-stage validation rules.
          </Typography>
        </MainCard>
      </Grid>

      <Grid item xs={12} md={6}>
        <MainCard title="SLAs &amp; Thresholds" contentSX={{ p: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Configure SLA times and delay thresholds per job type and branch for alerting.
          </Typography>
        </MainCard>
      </Grid>

      <Grid item xs={12} md={6}>
        <MainCard title="Delivery Options" contentSX={{ p: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Manage delivery modes (Self-pickup, Courier, Address Change) and related business rules.
          </Typography>
        </MainCard>
      </Grid>

      <Grid item xs={12} md={6}>
        <MainCard title="Integrations" contentSX={{ p: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Website/API integration, notification gateways and (future) billing module configuration.
          </Typography>
        </MainCard>
      </Grid>
    </Grid>
  );
}
