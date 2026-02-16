import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import MainCard from 'components/MainCard';

// ==============================|| MASTER - PAPER SIZE ||============================== //

export default function PaperSizeMaster() {
  return (
    <Grid container rowSpacing={3} columnSpacing={2.75}>
      <Grid item xs={12}>
        <Typography variant="h5">Paper Size Master</Typography>
        <Typography variant="body2" color="text.secondary">
          Set up paper sizes such as A4 Full, A4 95% Reduction, etc.
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <MainCard title="Paper Sizes" contentSX={{ p: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Maintain supported paper sizes and display order here.
          </Typography>
        </MainCard>
      </Grid>
    </Grid>
  );
}
