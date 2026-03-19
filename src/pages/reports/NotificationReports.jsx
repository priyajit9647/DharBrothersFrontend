import React, { useState } from 'react';
import Grid from '@mui/material/Grid';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import MainCard from 'components/MainCard';

// ==============================|| BMS - NOTIFICATION REPORTS ||============================== //

function TabPanel({ value, index, children }) {
  if (value !== index) return null;
  return (
    <Box sx={{ pt: 2 }}>
      {children}
    </Box>
  );
}

export default function NotificationReports() {
  const [tab, setTab] = useState(0);

  const handleChange = (event, newValue) => {
    setTab(newValue);
  };

  return (
    <Grid container rowSpacing={3} columnSpacing={2.75}>
      <Grid item xs={12}>
        <Typography variant="h5">Notification Reports</Typography>
        <Typography variant="body2" color="text.secondary">
          History of notification deliveries across Email, WhatsApp and in-app channels for audit and troubleshooting.
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <MainCard contentSX={{ p: 2 }}>
          <Tabs
            value={tab}
            onChange={handleChange}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="Email Notifications" />
            <Tab label="WhatsApp Notifications" />
            <Tab label="In-App Notifications" />
          </Tabs>

          <TabPanel value={tab} index={0}>
            <Typography variant="body2" color="text.secondary">
              Table of email notifications (To, Subject, Template, Status, Sent Time, Related Job/Order).
            </Typography>
          </TabPanel>

          <TabPanel value={tab} index={1}>
            <Typography variant="body2" color="text.secondary">
              Table of WhatsApp messages (Customer, Mobile, Template, Status, Sent Time, Delivery Info).
            </Typography>
          </TabPanel>

          <TabPanel value={tab} index={2}>
            <Typography variant="body2" color="text.secondary">
              Table of in-app notifications (User, Title, Channel, Seen Status, Created Time).
            </Typography>
          </TabPanel>
        </MainCard>
      </Grid>
    </Grid>
  );
}
