import React, { useState, useRef, useEffect } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';

const sampleChats = [
  { id: 1, name: 'Amit Kumar', last: 'Where are the proofs?', time: '11:20' },
  { id: 2, name: 'Priya Singh', last: 'Thanks — looks good', time: '10:12' },
  { id: 3, name: 'Ravi Sharma', last: 'Call me when free', time: 'Yesterday' }
];

const initialMessages = [
  { id: 1, fromMe: false, text: 'Hi, can you confirm the job details?' },
  { id: 2, fromMe: true, text: 'Sure — I will send the spec shortly.' },
  { id: 3, fromMe: false, text: 'Great, thanks!' }
];

const WhatsAppLayout = () => {
  const [selected, setSelected] = useState(sampleChats[0]);
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState('');
  const messagesRef = useRef(null);

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages, selected]);

  const handleSend = () => {
    if (!input.trim()) return;
    const next = { id: Date.now(), fromMe: true, text: input.trim() };
    setMessages((m) => [...m, next]);
    setInput('');
  };

  return (
    <Box sx={{ display: 'flex', height: 'calc(100vh - 80px)' }}>

      {/* Left - Chat list */}
      <Paper square elevation={0} sx={{ width: '32%', borderRight: '1px solid #e0e0e0' }}>
        <Box sx={{ p: 2, borderBottom: '1px solid #eee' }}>
          <Typography variant="h6">WhatsApp</Typography>
          <TextField
            placeholder="Search or start new chat"
            size="small"
            fullWidth
            sx={{ mt: 1 }}
          />
        </Box>

        <List sx={{ maxHeight: 'calc(100vh - 160px)', overflow: 'auto' }}>
          {sampleChats.map((c) => (
            <React.Fragment key={c.id}>
              <ListItem
                button
                onClick={() => {
                  setSelected(c);
                  setMessages(initialMessages);
                }}
                selected={selected && selected.id === c.id}
                alignItems="flex-start"
              >
                <ListItemAvatar>
                  <Avatar>{c.name.charAt(0)}</Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={c.name}
                  secondary={
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {c.last}
                    </Typography>
                  }
                />
                <Box sx={{ ml: 1, color: 'text.secondary', fontSize: 12 }}>{c.time}</Box>
              </ListItem>
              <Divider variant="inset" component="li" />
            </React.Fragment>
          ))}
        </List>
      </Paper>

      {/* Right - Conversation */}
      <Box sx={{ width: '68%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', p: 2, borderBottom: '1px solid #efecec' }}>
          <Avatar sx={{ mr: 2 }}>{selected.name.charAt(0)}</Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1">{selected.name}</Typography>
            <Typography variant="caption" color="text.secondary">
              Online
            </Typography>
          </Box>
          <Box>
            <IconButton size="small">⋯</IconButton>
          </Box>
        </Box>

        {/* Messages area */}
        <Box ref={messagesRef} sx={{ flex: 1, p: 2, overflow: 'auto', background: '#f7f7f7' }}>
          {messages.map((m) => (
            <Box
              key={m.id}
              sx={{ display: 'flex', justifyContent: m.fromMe ? 'flex-end' : 'flex-start', mb: 1 }}
            >
              <Box
                sx={{
                  maxWidth: '70%',
                  bgcolor: m.fromMe ? '#dcf8c6' : '#fff',
                  p: 1.25,
                  borderRadius: 2,
                  boxShadow: '0 1px 0 rgba(0,0,0,0.06)'
                }}
              >
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                  {m.text}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>

        {/* Input area */}
        <Box sx={{ p: 1.5, borderTop: '1px solid #eee', display: 'flex', alignItems: 'center' }}>
          <IconButton size="small">😊</IconButton>
          <TextField
            placeholder="Type a message"
            fullWidth
            size="small"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend();
            }}
            sx={{ mx: 1 }}
          />
          <IconButton color="primary" onClick={handleSend} size="small">
            Send
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
};

export default WhatsAppLayout;
