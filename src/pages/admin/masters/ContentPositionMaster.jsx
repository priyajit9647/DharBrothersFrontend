import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import MainCard from 'components/MainCard';

// ==============================|| MASTER - CONTENT POSITION ||============================== //

export default function ContentPositionMaster() {
  return (
    <Grid container rowSpacing={3} columnSpacing={2.75}>
      <Grid item xs={12}>
        <Typography variant="h5">Content Position Master</Typography>
        <Typography variant="body2" color="text.secondary">
          Configure content positions such as Top, Middle and Bottom for spine printing.
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <MainCard title="Content Positions" contentSX={{ p: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Placeholder for managing content position options.
          </Typography>
        </MainCard>
      </Grid>
    </Grid>
  );
}
