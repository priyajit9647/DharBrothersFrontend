const EmailLayout = () => {
  return (
    <div style={{ display: "flex", height: "100vh" }}>
      
      {/* Left Side - Email List */}
      <div style={{ width: "30%", borderRight: "1px solid #ddd", padding: 10 }}>
        <h3>Email List</h3>
      </div>

      {/* Right Side - Email Conversation */}
      <div style={{ width: "70%", padding: 20 }}>
        <h3>Email Conversation</h3>
      </div>

    </div>
  );
};

export default EmailLayout;