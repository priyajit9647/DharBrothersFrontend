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

import { SearchOutlined, SendOutlined, MoreOutlined, PaperClipOutlined } from '@ant-design/icons';

import MainCard from 'components/MainCard';
import { useAuth } from 'hooks/useAuth';
import { fetchWhatsappAttachmentBlob, fetchWhatsappConversations, fetchWhatsappConversationById, sendWhatsappMessage } from 'api/whatsapp';

// ==============================|| BMS - WHATSAPP (WEB-STYLE VIEW) ||============================== //

const getMessageTimestamp = (message) => {
  const rawTimestamp = message?.receivedDate || message?.processedDate || message?.sentAt || message?.createdAt;

  if (!rawTimestamp) {
    return null;
  }

  const timestamp = new Date(rawTimestamp);
  return Number.isNaN(timestamp.getTime()) ? null : timestamp;
};

const formatMessageDateTime = (timestamp) => {
  if (!timestamp) {
    return '';
  }

  return timestamp.toLocaleString([], {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getConversationPhone = (conversation) => {
  const directPhone =
    conversation?.phone ||
    conversation?.mobileNo ||
    conversation?.mobile ||
    conversation?.customerPhone ||
    conversation?.whatsappNo ||
    conversation?.whatsapp ||
    conversation?.contactPhone;

  if (directPhone) {
    return String(directPhone);
  }

  const direction = typeof conversation?.direction === 'string' ? conversation.direction.toLowerCase() : '';

  if (direction === 'outgoing' || direction === 'outbound' || direction === 'out') {
    return conversation?.toPhone ? String(conversation.toPhone) : null;
  }

  if (direction === 'incoming' || direction === 'inbound' || direction === 'in') {
    return conversation?.fromPhone ? String(conversation.fromPhone) : null;
  }

  return conversation?.toPhone || conversation?.fromPhone ? String(conversation?.toPhone || conversation?.fromPhone) : null;
};

const getConversationDisplayName = (conversation) => {
  return conversation?.customerName || conversation?.name || conversation?.title || getConversationPhone(conversation) || 'Customer';
};

const getConversationTimestamp = (conversation) => {
  return (
    conversation?.escalatedAt ||
    conversation?.lastMessageAt ||
    conversation?.updatedAt ||
    conversation?.createdAt ||
    conversation?.processedDate ||
    conversation?.receivedDate ||
    conversation?.sentAt
  );
};

const isIncomingMessage = (message) => {
  const direction = typeof message?.direction === 'string' ? message.direction.toUpperCase() : '';
  return direction === 'INCOMING' || direction === 'INBOUND' || direction === 'IN';
};

const getMessageAttachments = (message) => {
  if (!message?.attachments || typeof message.attachments !== 'object') {
    return [];
  }

  return Object.entries(message.attachments).map(([attachmentId, attachmentValue]) => {
    const fallbackName = message?.messageType === 'document' ? 'Document' : 'Attachment';
    const keyLooksLikeUrl = /^https?:\/\//i.test(attachmentId);
    const valueLooksLikeUrl = typeof attachmentValue === 'string' && /^https?:\/\//i.test(attachmentValue);

    return {
      id: attachmentId,
      filename: valueLooksLikeUrl ? fallbackName : attachmentValue || fallbackName,
      href: valueLooksLikeUrl ? attachmentValue : keyLooksLikeUrl ? attachmentId : null
    };
  });
};

export default function Whatsapp() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [conversationsLoading, setConversationsLoading] = useState(false);
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [conversationLoading, setConversationLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [messageText, setMessageText] = useState('');
  const [error, setError] = useState('');

  const loadConversations = useCallback(
    async (searchValue = '') => {
      try {
        setConversationsLoading(true);
        setError('');

        const data = await fetchWhatsappConversations({
          search: searchValue || undefined
        });

        const items = Array.isArray(data) ? data : data?.items || data?.data || [];
        setConversations(items);

        // Auto-select the first conversation when none is selected yet.
        if (!selectedConversationId && items.length > 0) {
          const first = items[0];
          const firstId = getConversationPhone(first);
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
      const messageItems = Array.isArray(data) ? data : data?.items || data?.data || data?.messages || data?.chats || [];
      const selectedRecord = conversations.find((conversation) => getConversationPhone(conversation) === conversationId);

      setSelectedConversation({
        ...selectedRecord,
        phone: conversationId,
        customerName: getConversationDisplayName(selectedRecord),
        messages: messageItems
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to load WhatsApp conversation', err);
      setError(err?.message || 'Failed to load WhatsApp conversation');
    } finally {
      setConversationLoading(false);
    }
  }, [conversations]);

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
    const id = getConversationPhone(conversation);
    if (!id) return;
    setSelectedConversationId(id);
  };

  const handleSendMessage = async () => {
    if (!selectedConversationId || !messageText.trim()) return;

    const adminUsername = user?.userName || user?.username || user?.email || '';

    try {
      setError('');

      if (!adminUsername) {
        setError('Unable to identify the logged-in admin user. Please log in again.');
        return;
      }

      await sendWhatsappMessage(selectedConversationId, {
        adminUsername,
        message: messageText.trim()
      });
      setMessageText('');
      await loadConversationDetail(selectedConversationId);
      await loadConversations(search);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to send WhatsApp message', err);
      setError(err?.message || 'Failed to send WhatsApp message');
    }
  };

  const handleOpenAttachment = (attachment) => {
    if (attachment?.href) {
      window.open(attachment.href, '_blank', 'noopener,noreferrer');
      return;
    }
  };

  const handleDownloadAttachment = async (attachment) => {
    if (!attachment) {
      return;
    }

    if (attachment.href) {
      handleOpenAttachment(attachment);
      return;
    }

    try {
      const blob = await fetchWhatsappAttachmentBlob(attachment.id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = attachment.filename || 'attachment';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (downloadError) {
      // eslint-disable-next-line no-console
      console.error('Failed to download WhatsApp attachment', downloadError);
      setError(downloadError?.message || 'Failed to download WhatsApp attachment');
    }
  };

  const formattedConversations = useMemo(() => {
    return conversations.map((conv) => {
      const id = getConversationPhone(conv);
      const customerName = getConversationDisplayName(conv);
      const jobLabel = conv.assignedAdmin
        ? `Agent: ${conv.assignedAdmin}`
        : conv.jobId
          ? `Job #${conv.jobId}`
          : conv.orderId
            ? `Order #${conv.orderId}`
            : '';
      const lastMessageTimeRaw = getConversationTimestamp(conv);
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
          : conv.body ||
            conv.lastMessageSnippet ||
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

    const rawMessages = Array.isArray(selectedConversation.messages)
      ? selectedConversation.messages
      : Array.isArray(selectedConversation.chats)
        ? selectedConversation.chats
        : [];

    return [...rawMessages].sort((leftMessage, rightMessage) => {
      const leftTimestamp = getMessageTimestamp(leftMessage);
      const rightTimestamp = getMessageTimestamp(rightMessage);

      if (!leftTimestamp && !rightTimestamp) {
        return 0;
      }

      if (!leftTimestamp) {
        return 1;
      }

      if (!rightTimestamp) {
        return -1;
      }

      return leftTimestamp.getTime() - rightTimestamp.getTime();
    });
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
                  {/* Header action buttons (Disable AI / Close) have been removed as per latest requirements. */}
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
                    const key = msg.id || msg._id || `${msg.waMessageId || msg.sentAt || msg.processedDate || msg.receivedDate}-${msg.body || ''}`;
                    const isIncoming = isIncomingMessage(msg);
                    const attachments = getMessageAttachments(msg);
                    const shouldHideBody = msg.messageType === 'document' && attachments.length > 0;

                    const timestamp = getMessageTimestamp(msg);
                    const timeLabel = formatMessageDateTime(timestamp);

                    return (
                      <Box key={key} sx={{ display: 'flex', justifyContent: isIncoming ? 'flex-start' : 'flex-end' }}>
                        <Box
                          sx={{
                            maxWidth: '75%',
                            p: 1.25,
                            borderRadius: 1.5,
                            bgcolor: isIncoming ? 'background.paper' : 'primary.light'
                          }}
                        >
                          <Typography variant="caption" color="text.secondary">
                            {isIncoming ? 'From' : 'To'} {isIncoming ? msg.fromPhone : msg.toPhone}
                            {timeLabel ? ` · ${timeLabel}` : ''}
                          </Typography>

                          {!shouldHideBody && (
                            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', mt: 0.5 }}>
                              {msg.body || ''}
                            </Typography>
                          )}

                          {attachments.length > 0 && (
                            <Stack direction="row" spacing={1} sx={{ mt: shouldHideBody ? 0.75 : 1 }}>
                              <PaperClipOutlined style={{ fontSize: 16 }} />
                              <Stack spacing={0.5}>
                                {attachments.map((attachment) => (
                                  <Button
                                    key={`${key}-${attachment.id}`}
                                    size="small"
                                    variant="text"
                                    sx={{ justifyContent: 'flex-start', p: 0, minWidth: 0, textTransform: 'none' }}
                                    onClick={() => handleDownloadAttachment(attachment)}
                                  >
                                    <Typography variant="body2" color="primary">
                                      {attachment.filename}
                                    </Typography>
                                  </Button>
                                ))}
                              </Stack>
                            </Stack>
                          )}

                          {(timeLabel || msg.aiGenerated) && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ display: 'block', textAlign: 'right', mt: 0.75 }}
                            >
                              {msg.aiGenerated ? 'AI' : ''}
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
