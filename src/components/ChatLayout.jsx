const ChatLayout = () => {
  return (
    <div style={{ display: "flex", height: "100vh" }}>

      {/* Left Side - Chat List */}
      <div style={{ width: "30%", background: "#f0f2f5", padding: 10 }}>
        <h3>Chat List</h3>
      </div>

      {/* Right Side - Chat Window */}
      <div style={{ width: "70%", display: "flex", flexDirection: "column", padding: 20 }}>
        <h3>Chat Window</h3>
      </div>

    </div>
  );
};

export default ChatLayout;