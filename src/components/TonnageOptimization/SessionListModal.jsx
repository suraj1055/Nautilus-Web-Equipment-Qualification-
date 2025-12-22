import React, { useState, useEffect } from "react";

const SessionListModal = ({ onSelect, onCancel }) => {
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    const allSessions = JSON.parse(
      localStorage.getItem("tonnageSessions") || "[]"
    );

    const sorted = [...allSessions].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );

    setSessions(sorted);
  }, []);

  const handleDelete = (sessionId, e) => {
    e.stopPropagation();

    if (!window.confirm("Are you sure you want to delete this session?")) return;

    const updated = sessions.filter((s) => s.id !== sessionId);
    setSessions(updated);
    localStorage.setItem("tonnageSessions", JSON.stringify(updated));
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-box" style={{ width: "520px", padding: 0 }}>
        {/* ===== HEADER ===== */}
        <div className="modal-header">
          <span>Tonnage Optimization</span>
        </div>

        {/* ===== BODY ===== */}
        <div className="modal-body">
          <div className="modal-section-title">Select Session</div>

          {sessions.length === 0 ? (
            <div
              style={{
                padding: "20px",
                textAlign: "center",
                color: "#666",
                fontSize: "13px",
              }}
            >
              No sessions found. Create a new session to get started.
            </div>
          ) : (
            <div className="session-list">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="session-item"
                  onClick={() => onSelect(session)}
                >
                  <div className="session-info">
                    <div className="session-name">{session.name}</div>
                    <div className="session-date">
                      {new Date(session.date).toLocaleDateString()}
                    </div>
                  </div>

                  <button
                    className="btn-delete"
                    title="Delete Session"
                    onClick={(e) => handleDelete(session.id, e)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ===== FOOTER ===== */}
        <div className="modal-footer">
          <button className="btn cancel" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionListModal;

