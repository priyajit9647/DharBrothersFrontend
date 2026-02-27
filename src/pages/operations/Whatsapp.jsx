import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';

import { SearchOutlined, SendOutlined, MoreOutlined } from '@ant-design/icons';

import MainCard from 'components/MainCard';

// ==============================|| BMS - WHATSAPP (WEB-STYLE VIEW) ||============================== //

export default function Whatsapp() {
  return (
    <Grid container sx={{ width: '100%', flexGrow: 1 }}>
      <Grid item xs={12} sx={{ width: '100%' }}>
        <Typography variant="h5">WhatsApp</Typography>
        <Typography variant="body2" color="text.secondary">
          Internal WhatsApp-style console to review conversations linked to jobs and orders.
        </Typography>
      </Grid>

      <Grid item xs={12} sx={{ width: '100%', flexGrow: 1, mt: 2 }}>
        <MainCard contentSX={{ p: 0, height: 'calc(100vh - 260px)', display: 'flex', overflow: 'hidden' }}>
          {/* Left pane: chat list */}
          <Box
            sx={{
              width: { xs: '40%', md: '35%' },
              borderRight: (theme) => `1px solid ${theme.palette.divider}`,
              display: 'flex',
              flexDirection: 'column',
              minWidth: 0
            }}
          >
            <Box sx={{ p: 1.5, borderBottom: (theme) => `1px solid ${theme.palette.divider}` }}>
              <TextField
                size="small"
                fullWidth
                placeholder="Search or start a chat"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchOutlined style={{ fontSize: 16 }} />
                    </InputAdornment>
                  )
                }}
              />
            </Box>
            <Box sx={{ flex: 1, overflow: 'auto' }}>
              <List disablePadding>
                {[1, 2, 3, 4, 5].map((item) => (
                  <Box key={item}>
                    <ListItem button alignItems="flex-start">
                      <ListItemAvatar>
                        <Avatar>{`C${item}`}</Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
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
                            Last message preview linked to Job #{1000 + item}
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

          {/* Right pane: conversation */}
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              minWidth: 0
            }}
          >
            {/* Conversation header */}
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
                  <Typography variant="subtitle1">Customer Universe</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Linked to Job #1234 · Last seen today 10:30 AM
                  </Typography>
                </Box>
              </Stack>
              <IconButton size="small">
                <MoreOutlined style={{ fontSize: 18 }} />
              </IconButton>
            </Box>

            {/* Messages area */}
            <Box
              sx={{
                flex: 1,
                p: 2,
                bgcolor: (theme) => theme.palette.background.default,
                overflowY: 'auto'
              }}
            >
              <Stack spacing={1.5}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                  <Box
                    sx={{
                      maxWidth: '100%',
                      px: 1.5,
                      py: 1,
                      borderRadius: 2,
                      bgcolor: 'background.paper'
                    }}
                  >
                    <Typography variant="body2">
                      Hello, your thesis job #1234 has been received. Please review the attached PDF proof.
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'right', mt: 0.5 }}>
                      10:02 AM
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Box
                    sx={{
                      maxWidth: '100%',
                      px: 1.5,
                      py: 1,
                      borderRadius: 2,
                      bgcolor: 'success.light'
                    }}
                  >
                    <Typography variant="body2">Looks good. Please proceed with printing 3 copies.</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'right', mt: 0.5 }}>
                      10:05 AM
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                  <Box
                    sx={{
                      maxWidth: '100%',
                      px: 1.5,
                      py: 1,
                      borderRadius: 2,
                      bgcolor: 'background.paper'
                    }}
                  >
                    <Typography variant="body2">Great, we will confirm once printing is complete.</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'right', mt: 0.5 }}>
                      10:07 AM
                    </Typography>
                  </Box>
                </Box>
              </Stack>
            </Box>

            {/* Composer */}
            <Box
              sx={{
                px: 1.5,
                py: 1,
                borderTop: (theme) => `1px solid ${theme.palette.divider}`,
                bgcolor: 'background.paper'
              }}
            >
              <TextField
                fullWidth
                size="small"
                placeholder="Type a message"
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
