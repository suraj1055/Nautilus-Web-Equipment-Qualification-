import React, { useState, useEffect } from "react";

const SessionListModal = ({ onSelect, onCancel }) => {
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    // Load all sessions from localStorage
    const allSessions = JSON.parse(localStorage.getItem("tonnageSessions") || "[]");
    // Sort by date (newest first)
    const sorted = allSessions.sort((a, b) => new Date(b.date) - new Date(a.date));
    setSessions(sorted);
  }, []);

  const handleSelect = (session) => {
    onSelect(session);
  };

  const handleDelete = (sessionId, e) => {
    e.stopPropagation(); // Prevent selecting when deleting
    if (window.confirm("Are you sure you want to delete this session?")) {
      const updated = sessions.filter(s => s.id !== sessionId);
      setSessions(updated);
      localStorage.setItem("tonnageSessions", JSON.stringify(updated));
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-box" style={{ width: "600px", maxHeight: "80vh", overflow: "auto" }}>
        <h3>Tonnage Optimization</h3>
        <p><strong>Select Session</strong></p>

        {sessions.length === 0 ? (
          <div style={{ padding: "20px", textAlign: "center", color: "#666" }}>
            No sessions found. Create a new session to get started.
          </div>
        ) : (
          <div className="session-list">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="session-item"
                onClick={() => handleSelect(session)}
              >
                <div className="session-info">
                  <div className="session-name">{session.name}</div>
                  <div className="session-date">
                    {new Date(session.date).toLocaleDateString()}
                  </div>
                </div>
                <button
                  className="btn-delete"
                  onClick={(e) => handleDelete(session.id, e)}
                  title="Delete Session"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="actions" style={{ marginTop: "20px" }}>
          <button className="btn cancel" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionListModal;


