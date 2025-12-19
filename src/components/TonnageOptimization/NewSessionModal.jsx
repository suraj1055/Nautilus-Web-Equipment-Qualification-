import React, { useState } from "react";

const NewSessionModal = ({ onCreate, onCancel }) => {
  const [name, setName] = useState("");
  const [date, setDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const handleCreate = () => {
    if (!name.trim()) {
      alert("Please enter session name");
      return;
    }

    onCreate({
      name,
      date,
    });
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-box">
        <h3>Tonnage Optimization</h3>
        <p><strong>New Session</strong></p>

        <div className="field">
          <label>Name :</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="field">
          <label>Date :</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        <div className="actions">
          <button className="btn" onClick={handleCreate}>
            Create
          </button>
          <button className="btn cancel" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewSessionModal;
