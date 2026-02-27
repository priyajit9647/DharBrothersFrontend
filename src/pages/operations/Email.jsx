import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import Checkbox from '@mui/material/Checkbox';
import Avatar from '@mui/material/Avatar';

import { SearchOutlined, SendOutlined } from '@ant-design/icons';

import MainCard from 'components/MainCard';

// ==============================|| BMS - EMAIL (GMAIL-LIKE INBOX) ||============================== //

export default function Email() {
  return (
    <Grid container sx={{ width: '100%', flexGrow: 1 }}>
      <Grid item xs={12} sx={{ width: '100%' }}>
        <Typography variant="h5">Email</Typography>
        <Typography variant="body2" color="text.secondary">
          Internal email inbox and replies for jobs and orders, styled similar to Gmail web.
        </Typography>
      </Grid>

      <Grid item xs={12} sx={{ width: '100%', flexGrow: 1, mt: 2 }}>
        <MainCard contentSX={{ p: 0, height: 'calc(100vh - 260px)', display: 'flex', overflow: 'hidden' }}>
          {/* Left: message list */}
          <Box
            sx={{
              width: { xs: '40%', md: '35%' },
              borderRight: (theme) => `1px solid ${theme.palette.divider}`,
              display: 'flex',
              flexDirection: 'column',
              minWidth: 0
            }}
          >
            <Box
              sx={{
                px: 1.5,
                py: 1,
                borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              <Checkbox size="small" />
              <TextField
                size="small"
                fullWidth
                placeholder="Search mail"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchOutlined style={{ fontSize: 16 }} />
                    </InputAdornment>
                  )
                }}
              />
            </Box>

            <Box sx={{ flex: 1, overflowY: 'auto' }}>
              <List disablePadding>
                {[1, 2, 3, 4, 5].map((item) => (
                  <Box key={item}>
                    <ListItem button alignItems="flex-start" sx={{ py: 1, px: 1.5 }}>
                      <Checkbox size="small" edge="start" sx={{ mr: 1 }} />
                      <ListItemText
                        primary={
                          <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                            <Typography variant="subtitle2" noWrap>
                              Customer {item}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              10:{item} AM
                            </Typography>
                          </Stack>
                        }
                        secondary={
                          <Typography variant="body2" color="text.secondary" noWrap>
                            Subject line for job #{2000 + item} · brief message preview text here
                          </Typography>
                        }
                      />
                    </ListItem>
                    <Divider component="li" />
                  </Box>
                ))}
              </List>
            </Box>
          </Box>

          {/* Right: reading pane + reply */}
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              minWidth: 0
            }}
          >
            <Box
              sx={{
                px: 2,
                py: 1.5,
                borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Avatar>CU</Avatar>
                <Box>
                  <Typography variant="subtitle1" noWrap>
                    Proof approval for Job #1234
                  </Typography>
                  <Typography variant="caption" color="text.secondary" noWrap>
                    customer@example.com · To: operations@dharbrothers.com
                  </Typography>
                </Box>
              </Stack>
              <Typography variant="caption" color="text.secondary">
                10:05 AM (2 hours ago)
              </Typography>
            </Box>

            <Box
              sx={{
                flex: 1,
                p: 2,
                bgcolor: (theme) => theme.palette.background.default,
                overflowY: 'auto'
              }}
            >
              <Typography variant="body2" paragraph>
                Dear Team,
              </Typography>
              <Typography variant="body2" paragraph>
                The attached PDF proof for thesis job #1234 looks good. Please proceed with printing 3 copies on Imported Matt 100 GSM.
              </Typography>
              <Typography variant="body2" paragraph>
                Regards,
                <br />
                Customer Universe
              </Typography>
            </Box>

            <Box
              sx={{
                px: 2,
                py: 1.5,
                borderTop: (theme) => `1px solid ${theme.palette.divider}`,
                bgcolor: 'background.paper'
              }}
            >
              <TextField
                fullWidth
                multiline
                minRows={3}
                placeholder="Reply or forward"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton size="small" color="primary">
                        <SendOutlined style={{ fontSize: 18 }} />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </Box>
          </Box>
        </MainCard>
      </Grid>
    </Grid>
  );
}
