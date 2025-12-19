import React, { useState, useEffect } from "react";
import NewSessionModal from "./NewSessionModal";
import SessionListModal from "./SessionListModal";
import Tabs from "./Tabs";
import "./tonnage.css";

const TonnageOptimization = () => {
  const [showNewModal, setShowNewModal] = useState(false);
  const [showSessionList, setShowSessionList] = useState(false);
  const [session, setSession] = useState(null);

  // Load session from localStorage on mount if exists
  useEffect(() => {
    const savedSessionId = localStorage.getItem("currentTonnageSessionId");
    if (savedSessionId) {
      const allSessions = JSON.parse(localStorage.getItem("tonnageSessions") || "[]");
      const foundSession = allSessions.find(s => s.id === savedSessionId);
      if (foundSession) {
        setSession(foundSession);
      }
    }
  }, []);

  const openNewSession = () => {
    setShowNewModal(true);
  };

  const openSessionList = () => {
    setShowSessionList(true);
  };

  const handleCreateSession = (data) => {
    // Create session with unique ID
    const newSession = {
      id: Date.now().toString(),
      name: data.name,
      date: data.date,
      createdAt: new Date().toISOString()
    };

    // Save to localStorage
    const allSessions = JSON.parse(localStorage.getItem("tonnageSessions") || "[]");
    allSessions.push(newSession);
    localStorage.setItem("tonnageSessions", JSON.stringify(allSessions));
    localStorage.setItem("currentTonnageSessionId", newSession.id);

    setSession(newSession);
    setShowNewModal(false);
  };

  const handleSelectSession = (selectedSession) => {
    localStorage.setItem("currentTonnageSessionId", selectedSession.id);
    setSession(selectedSession);
    setShowSessionList(false);
  };

  const handleCloseSession = () => {
    localStorage.removeItem("currentTonnageSessionId");
    setSession(null);
  };

  return (
    <div className="tonnage-root">
      {/* HEADER */}
      <div className="tonnage-header">
        <h2>Tonnage Optimization</h2>

        {session ? (
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "14px", color: "#333" }}>
              Session: {session.name}
            </span>
            <button className="btn" onClick={handleCloseSession}>
              Close Session
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", gap: "10px" }}>
            <button className="btn" onClick={openSessionList}>
              View Sessions
            </button>
            <button className="btn primary" onClick={openNewSession}>
              New Session
            </button>
          </div>
        )}
      </div>

      {/* NEW SESSION MODAL */}
      {showNewModal && (
        <NewSessionModal
          onCreate={handleCreateSession}
          onCancel={() => setShowNewModal(false)}
        />
      )}

      {/* SESSION LIST MODAL */}
      {showSessionList && (
        <SessionListModal
          onSelect={handleSelectSession}
          onCancel={() => setShowSessionList(false)}
        />
      )}

      {/* WORKSPACE */}
      {session && <Tabs session={session} />}
    </div>
  );
};

export default TonnageOptimization;
