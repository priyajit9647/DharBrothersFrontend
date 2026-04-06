import { useCallback, useEffect, useMemo, useState } from 'react';

import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';

import { SearchOutlined, SendOutlined, MoreOutlined } from '@ant-design/icons';

import MainCard from 'components/MainCard';
import {
  fetchWhatsappConversations,
  fetchWhatsappConversationById,
  sendWhatsappMessage,
  disableAiForWhatsappConversation,
  closeWhatsappConversation
} from 'api/whatsapp';

// ==============================|| BMS - WHATSAPP (WEB-STYLE VIEW) ||============================== //

export default function Whatsapp() {
  const [conversations, setConversations] = useState([]);
  const [conversationsLoading, setConversationsLoading] = useState(false);
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [conversationLoading, setConversationLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [messageText, setMessageText] = useState('');
  const [error, setError] = useState('');
  const [headerActionLoading, setHeaderActionLoading] = useState(false);

  const loadConversations = useCallback(
    async (searchValue = '') => {
      try {
        setConversationsLoading(true);
        setError('');

        const data = await fetchWhatsappConversations({
          search: searchValue || undefined,
          page: 1,
          pageSize: 50
        });

        const items = Array.isArray(data) ? data : data?.items || data?.data || [];
        setConversations(items);

        if (!selectedConversationId && items.length > 0) {
          const firstId = items[0].id || items[0]._id;
          if (firstId) {
            setSelectedConversationId(firstId);
          }
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Failed to load WhatsApp conversations', err);
        setError(err?.message || 'Failed to load WhatsApp conversations');
      } finally {
        setConversationsLoading(false);
      }
    },
    [selectedConversationId]
  );

  const loadConversationDetail = useCallback(async (conversationId) => {
    if (!conversationId) return;

    try {
      setConversationLoading(true);
      setError('');

      const data = await fetchWhatsappConversationById(conversationId);
      setSelectedConversation(data);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to load WhatsApp conversation', err);
      setError(err?.message || 'Failed to load WhatsApp conversation');
    } finally {
      setConversationLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConversations(search);
  }, [loadConversations, search]);

  useEffect(() => {
    if (selectedConversationId) {
      loadConversationDetail(selectedConversationId);
    } else {
      setSelectedConversation(null);
    }
  }, [selectedConversationId, loadConversationDetail]);

  const handleSelectConversation = (conversation) => {
    const id = conversation?.phone || conversation?.id || conversation?._id;
    if (!id) return;
    setSelectedConversationId(id);
  };

  const handleSendMessage = async () => {
    if (!selectedConversationId || !messageText.trim()) return;

    try {
      setError('');
      await sendWhatsappMessage(selectedConversationId, { body: messageText.trim() });
      setMessageText('');
      await loadConversationDetail(selectedConversationId);
      await loadConversations(search);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to send WhatsApp message', err);
      setError(err?.message || 'Failed to send WhatsApp message');
    }
  };

  const getConversationPhone = () => {
    if (selectedConversation?.phone) return selectedConversation.phone;
    return selectedConversationId;
  };

  const handleDisableAi = async () => {
    const phone = getConversationPhone();
    if (!phone) return;

    try {
      setHeaderActionLoading(true);
      setError('');
      await disableAiForWhatsappConversation(phone);
      await loadConversationDetail(selectedConversationId);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to disable AI for WhatsApp conversation', err);
      setError(err?.message || 'Failed to disable AI for this conversation');
    } finally {
      setHeaderActionLoading(false);
    }
  };

  const handleCloseConversation = async () => {
    const phone = getConversationPhone();
    if (!phone) return;

    try {
      setHeaderActionLoading(true);
      setError('');
      await closeWhatsappConversation(phone);
      await loadConversations(search);
      setSelectedConversationId(null);
      setSelectedConversation(null);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to close WhatsApp conversation', err);
      setError(err?.message || 'Failed to close this conversation');
    } finally {
      setHeaderActionLoading(false);
    }
  };

  const formattedConversations = useMemo(() => {
    return conversations.map((conv) => {
      const id = conv.phone || conv.id || conv._id;
      const customerName = conv.phone || conv.customerName || conv.name || conv.title || 'Customer';
      const jobLabel = conv.assignedAdmin
        ? `Agent: ${conv.assignedAdmin}`
        : conv.jobId
          ? `Job #${conv.jobId}`
          : conv.orderId
            ? `Order #${conv.orderId}`
            : '';
      const lastMessageTimeRaw = conv.escalatedAt || conv.lastMessageAt || conv.updatedAt || conv.createdAt;
      let lastMessageTime = '';
      if (lastMessageTimeRaw) {
        const d = new Date(lastMessageTimeRaw);
        if (!Number.isNaN(d.getTime())) {
          lastMessageTime = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
      }

      const preview =
        typeof conv.aiEnabled === 'boolean'
          ? conv.aiEnabled
            ? 'AI enabled'
            : 'AI disabled'
          : conv.lastMessageSnippet ||
            conv.lastMessagePreview ||
            conv.lastMessage?.body ||
            conv.preview ||
            conv.snippet ||
            '';

      return {
        raw: conv,
        id,
        customerName,
        jobLabel,
        lastMessageTime,
        preview
      };
    });
  }, [conversations]);

  const messages = useMemo(() => {
    if (!selectedConversation) return [];

    if (Array.isArray(selectedConversation.messages)) {
      return selectedConversation.messages;
    }

    if (Array.isArray(selectedConversation.chats)) {
      return selectedConversation.chats;
    }

    return [];
  }, [selectedConversation]);

  const headerTitle =
    selectedConversation?.customerName || selectedConversation?.name || selectedConversation?.phone || 'Conversation';
  const headerSubtitle = selectedConversation?.jobId
    ? `Linked to Job #${selectedConversation.jobId}`
    : selectedConversation?.orderId
      ? `Linked to Order #${selectedConversation.orderId}`
      : '';

  return (
    <Grid container sx={{ width: '100%', flexGrow: 1 }}>
      <Grid item xs={12} sx={{ width: '100%' }}>
        <Typography variant="h5">WhatsApp</Typography>
        <Typography variant="body2" color="text.secondary">
          Internal WhatsApp-style console to review conversations linked to jobs and orders.
        </Typography>
        {error && (
          <Typography variant="caption" color="error.main">
            {error}
          </Typography>
        )}
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
                value={search}
                onChange={(e) => setSearch(e.target.value)}
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
              {conversationsLoading ? (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                  <CircularProgress size={24} />
                </Box>
              ) : (
                <List disablePadding>
                  {formattedConversations.map((conv) => {
                    const isSelected = conv.id && conv.id === selectedConversationId;

                    return (
                      <Box key={conv.id || Math.random()}>
                        <ListItem
                          button
                          alignItems="flex-start"
                          onClick={() => handleSelectConversation(conv.raw)}
                          sx={{
                            bgcolor: isSelected ? 'action.selected' : 'inherit'
                          }}
                        >
                          <ListItemAvatar>
                            <Avatar>{conv.customerName.charAt(0).toUpperCase()}</Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
                                <Typography variant="subtitle2" noWrap>
                                  {conv.customerName}
                                </Typography>
                                {conv.lastMessageTime && (
                                  <Typography variant="caption" color="text.secondary">
                                    {conv.lastMessageTime}
                                  </Typography>
                                )}
                              </Stack>
                            }
                            secondary={
                              <Typography variant="body2" color="text.secondary" noWrap>
                                {conv.preview || conv.jobLabel}
                              </Typography>
                            }
                          />
                        </ListItem>
                        <Divider component="li" />
                      </Box>
                    );
                  })}

                  {!formattedConversations.length && (
                    <Box sx={{ p: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        No conversations found.
                      </Typography>
                    </Box>
                  )}
                </List>
              )}
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
              {conversationLoading && !selectedConversation ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={20} />
                  <Typography variant="body2">Loading conversation…</Typography>
                </Box>
              ) : selectedConversation ? (
                <>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Avatar>{headerTitle.charAt(0).toUpperCase()}</Avatar>
                    <Box>
                      <Typography variant="subtitle1">{headerTitle}</Typography>
                      {headerSubtitle && (
                        <Typography variant="caption" color="text.secondary">
                          {headerSubtitle}
                        </Typography>
                      )}
                    </Box>
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Button
                      size="small"
                      variant="outlined"
                      color="warning"
                      onClick={handleDisableAi}
                      disabled={headerActionLoading}
                    >
                      Disable AI
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      onClick={handleCloseConversation}
                      disabled={headerActionLoading}
                    >
                      Close
                    </Button>
                  </Stack>
                </>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Select a conversation to view messages.
                </Typography>
              )}
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
              {conversationLoading && selectedConversation ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={20} />
                  <Typography variant="body2">Refreshing messages…</Typography>
                </Box>
              ) : selectedConversation ? (
                <Stack spacing={1.5}>
                  {messages.map((msg) => {
                    const key = msg.id || msg._id || `${msg.sentAt}-${Math.random()}`;
                    const direction = typeof msg.direction === 'string' ? msg.direction.toLowerCase() : '';
                    const isOutbound = direction === 'outbound' || direction === 'out' || msg.from === 'business';

                    const timestamp = msg.sentAt || msg.processedDate || msg.receivedDate;
                    const timeLabel = timestamp
                      ? new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : '';

                    return (
                      <Box key={key} sx={{ display: 'flex', justifyContent: isOutbound ? 'flex-end' : 'flex-start' }}>
                        <Box
                          sx={{
                            maxWidth: '100%',
                            px: 1.5,
                            py: 1,
                            borderRadius: 2,
                            bgcolor: isOutbound ? 'success.light' : 'background.paper'
                          }}
                        >
                          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                            {msg.body || ''}
                          </Typography>
                          {timeLabel && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ display: 'block', textAlign: 'right', mt: 0.5 }}
                            >
                              {timeLabel}
                              {msg.aiGenerated ? ' · AI' : ''}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    );
                  })}
                </Stack>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No conversation selected.
                </Typography>
              )}
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
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder={selectedConversation ? 'Type a message' : 'Select a conversation to start messaging'}
                disabled={!selectedConversation}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={handleSendMessage}
                        disabled={!selectedConversation || !messageText.trim()}
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
