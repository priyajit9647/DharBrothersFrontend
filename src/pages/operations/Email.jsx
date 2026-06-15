import { useEffect, useState } from 'react';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import Avatar from '@mui/material/Avatar';

import { SearchOutlined, SendOutlined, PaperClipOutlined } from '@ant-design/icons';

import MainCard from 'components/MainCard';
import Dot from 'components/@extended/Dot';
import { fetchEmailThreads, fetchThreadMessages, replyToThread, markThreadRead, fetchAttachmentBlob } from 'api/emailApi';

function extractCustomerName(customerEmail) {
  if (!customerEmail) return 'Unknown customer';

  const quotedMatch = customerEmail.match(/"([^\"]+)"/);
  if (quotedMatch && quotedMatch[1]) {
    return quotedMatch[1];
  }

  const angleMatch = customerEmail.match(/<([^>]+)>/);
  if (angleMatch && angleMatch[1]) {
    return angleMatch[1];
  }

  return customerEmail;
}

function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
}

function formatTime(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// ==============================|| BMS - EMAIL (GMAIL-LIKE INBOX) ||============================== //

export default function Email() {
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedThreadId, setSelectedThreadId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messagesError, setMessagesError] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    let isMounted = true;

    const loadThreads = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await fetchEmailThreads();
        if (!isMounted) return;

        const safeData = Array.isArray(data) ? data : [];
        setThreads(safeData);
        if (safeData.length > 0) {
          setSelectedThreadId(safeData[0].id);
        }
      } catch (e) {
        if (!isMounted) return;
        setError(e?.message || 'Failed to load emails');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadThreads();

    return () => {
      isMounted = false;
    };
  }, []);

  const selectedThread = threads.find((t) => t.id === selectedThreadId) || null;

  useEffect(() => {
    let isMounted = true;

    const loadMessages = async () => {
      if (!selectedThreadId) {
        setMessages([]);
        setMessagesError(null);
        return;
      }

      setMessagesLoading(true);
      setMessagesError(null);

      try {
        const data = await fetchThreadMessages(selectedThreadId);
        if (!isMounted) return;

        const safeData = Array.isArray(data) ? data : [];
        setMessages(safeData);
      } catch (e) {
        if (!isMounted) return;
        setMessagesError(e?.message || 'Failed to load conversation');
      } finally {
        if (isMounted) {
          setMessagesLoading(false);
        }
      }
    };

    loadMessages();

    return () => {
      isMounted = false;
    };
  }, [selectedThreadId]);

  const handleSelectThread = async (threadId, thread) => {
    setSelectedThreadId(threadId);

    if (thread && thread.readByAdmin === false) {
      try {
        await markThreadRead(threadId);
        setThreads((prev) =>
          prev.map((t) => (t.id === threadId ? { ...t, readByAdmin: true } : t))
        );
      } catch (e) {
        // ignore read marker errors; inbox should still work
      }
    }
  };

  const handleSendReply = async () => {
    if (!selectedThreadId || !replyText.trim() || sendingReply) return;

    setSendingReply(true);

    try {
      await replyToThread(selectedThreadId, replyText);
      setReplyText('');

      // Refresh messages after successful reply
      try {
        const data = await fetchThreadMessages(selectedThreadId);
        const safeData = Array.isArray(data) ? data : [];
        setMessages(safeData);
        setMessagesError(null);
      } catch (e) {
        setMessagesError(e?.message || 'Failed to refresh conversation');
      }
    } catch (e) {
      setMessagesError(e?.message || 'Failed to send reply');
    } finally {
      setSendingReply(false);
    }
  };

  const cardHeight = zoom >= 1 ? 'calc(100vh - 200px)' : `calc((100vh - 200px) / ${zoom})`;
  const cardWidth = zoom >= 1 ? '100%' : `${100 / zoom}%`;

  const handleDownloadAttachment = async (message, attachmentId, filename) => {
    try {
      const blob = await fetchAttachmentBlob(attachmentId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || 'attachment';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      // Optionally we could surface a toast/snackbar; for now just log.
      // eslint-disable-next-line no-console
      console.error('Failed to download attachment', e);
    }
  };

  return (
    <Grid container sx={{ width: '100%', flexGrow: 1 }}>
      <Grid item xs={12} sx={{ width: '100%', flexGrow: 1 }}>
        {/* <Typography variant="h5">Email</Typography> */}
        <Box sx={{ mb: 1, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <IconButton
            size="small"
            onClick={() => setZoom((z) => Math.min(z + 0.1, 1.5))}
          >
            <Typography variant="button">A+</Typography>
          </IconButton>
          <IconButton
            size="small"
            onClick={() => setZoom((z) => Math.max(z - 0.1, 0.7))}
          >
            <Typography variant="button">A-</Typography>
          </IconButton>
        </Box>
        <MainCard
          contentSX={{
            p: 0,
            height: cardHeight,
            width: cardWidth,
            display: 'flex',
            overflow: 'hidden',
            transform: `scale(${zoom})`,
            transformOrigin: 'top left'
          }}
        >
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
                {loading && (
                  <ListItem sx={{ py: 1, px: 1.5 }}>
                    <ListItemText primary={<Typography variant="body2">Loading emails...</Typography>} />
                  </ListItem>
                )}

                {!loading && error && (
                  <ListItem sx={{ py: 1, px: 1.5 }}>
                    <ListItemText
                      primary={
                        <Typography variant="body2" color="error">
                          {error}
                        </Typography>
                      }
                    />
                  </ListItem>
                )}

                {!loading && !error && threads.length === 0 && (
                  <ListItem sx={{ py: 1, px: 1.5 }}>
                    <ListItemText primary={<Typography variant="body2">No emails found.</Typography>} />
                  </ListItem>
                )}

                {!loading && !error &&
                  threads.map((thread) => {
                    const customerName = extractCustomerName(thread.customerEmail);
                    const timeLabel = formatTime(thread.createdDate);

                    return (
                      <Box key={thread.id}>
                        <ListItem
                          button
                          alignItems="flex-start"
                          sx={{
                            py: 1,
                            px: 1.5,
                            bgcolor: selectedThreadId === thread.id ? 'action.selected' : 'transparent'
                          }}
                          onClick={() => handleSelectThread(thread.id, thread)}
                        >
                          <ListItemText
                            primary={
                              <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                                <Stack direction="row" spacing={1} alignItems="center">
                                  {thread.readByAdmin === false && (
                                    <Dot color="error" size={8} />
                                  )}
                                  <Typography variant="subtitle2" noWrap>
                                    {customerName}
                                  </Typography>
                                </Stack>
                                <Typography variant="caption" color="text.secondary">
                                  {timeLabel}
                                </Typography>
                              </Stack>
                            }
                            secondary={
                              <Typography variant="body2" color="text.secondary" noWrap>
                                {thread.subject}
                              </Typography>
                            }
                          />
                        </ListItem>
                        <Divider component="li" />
                      </Box>
                    );
                  })}
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
                <Avatar>
                  {getInitials(extractCustomerName(selectedThread?.customerEmail))}
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" noWrap>
                    {selectedThread ? selectedThread.subject : 'No conversation selected'}
                  </Typography>
                  {selectedThread && (
                    <Typography variant="caption" color="text.secondary" noWrap>
                      {selectedThread.customerEmail} · Status: {selectedThread.status}
                    </Typography>
                  )}
                </Box>
              </Stack>
              <Typography variant="caption" color="text.secondary">
                {selectedThread ? formatTime(selectedThread.createdDate) : ''}
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
              {!selectedThread && (
                <Typography variant="body2" color="text.secondary">
                  Select a conversation from the left to view details.
                </Typography>
              )}

              {selectedThread && messagesLoading && (
                <Typography variant="body2">Loading conversation...</Typography>
              )}

              {selectedThread && !messagesLoading && messagesError && (
                <Typography variant="body2" color="error">
                  {messagesError}
                </Typography>
              )}

              {selectedThread && !messagesLoading && !messagesError && messages.length === 0 && (
                <Typography variant="body2" color="text.secondary">
                  No messages in this conversation yet.
                </Typography>
              )}

              {selectedThread && !messagesLoading && !messagesError && messages.length > 0 && (
                <Stack spacing={1.5}>
                  {messages.map((msg) => {
                    const isIncoming = msg.direction === 'INCOMING';
                    const fromName = extractCustomerName(msg.fromEmail);
                    const msgTime = formatTime(msg.receivedDate || msg.processedDate);

                    return (
                      <Box
                        key={msg.id}
                        sx={{
                          display: 'flex',
                          justifyContent: isIncoming ? 'flex-start' : 'flex-end'
                        }}
                      >
                        <Box
                          sx={{
                            maxWidth: '75%',
                            p: 1.25,
                            borderRadius: 1.5,
                            bgcolor: isIncoming ? 'background.paper' : 'primary.light'
                          }}
                        >
                          <Typography variant="caption" color="text.secondary">
                            {isIncoming ? 'From' : 'To'} {fromName} · {msgTime}
                          </Typography>
                          <Typography variant="subtitle2" sx={{ mt: 0.5 }}>
                            {msg.subject}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ mt: 0.5, whiteSpace: 'pre-wrap' }}
                          >
                            {msg.body}
                          </Typography>

                          {msg.attachments &&
                            Object.keys(msg.attachments).length > 0 && (
                              <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                                <PaperClipOutlined style={{ fontSize: 16 }} />
                                <Stack spacing={0.5}>
                                  {Object.entries(msg.attachments).map(([attachmentId, filename]) => (
                                    <Button
                                      key={attachmentId}
                                      size="small"
                                      variant="text"
                                      sx={{ justifyContent: 'flex-start', p: 0, minWidth: 0, textTransform: 'none' }}
                                      onClick={() => handleDownloadAttachment(msg, attachmentId, filename)}
                                    >
                                      <Typography variant="body2" color="primary">
                                        {filename}
                                      </Typography>
                                    </Button>
                                  ))}
                                </Stack>
                              </Stack>
                            )}
                        </Box>
                      </Box>
                    );
                  })}
                </Stack>
              )}
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
                minRows={4}
                placeholder="Type your reply"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        color="primary"
                        disabled={!selectedThreadId || !replyText.trim() || sendingReply}
                        onClick={handleSendReply}
                      >
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
