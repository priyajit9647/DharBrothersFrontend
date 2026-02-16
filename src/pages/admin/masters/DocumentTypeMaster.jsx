import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import MainCard from 'components/MainCard';

// ==============================|| MASTER - DOCUMENT TYPE ||============================== //

export default function DocumentTypeMaster() {
  return (
    <Grid container rowSpacing={3} columnSpacing={2.75}>
      <Grid item xs={12}>
        <Typography variant="h5">Document Type Master</Typography>
        <Typography variant="body2" color="text.secondary">
          Maintain document categories such as Thesis, Synopsis and others.
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <MainCard title="Document Types" contentSX={{ p: 2 }}>
          <Typography variant="body2" color="text.secondary">
            CRUD UI for document types will be implemented here.
          </Typography>
        </MainCard>
      </Grid>
    </Grid>
  );
}
