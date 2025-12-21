import React, { useState, useEffect, useRef } from "react";
import {
  HtmlEditor,
  RichTextEditorComponent,
  Toolbar,
  Inject,
} from "@syncfusion/ej2-react-richtexteditor";

const Notes = ({ sessionId }) => {
  const storageKey = sessionId ? `notesData_${sessionId}` : "notesData";
  const rteRef = useRef(null);

  /* ================= STATE ================= */

  const [comment, setComment] = useState(() => {
    return localStorage.getItem(storageKey) || "";
  });

  /* ================= HANDLERS ================= */

  // Editor change
  const getComment = (e) => {
    const value = e?.value ?? "";
    setComment(value);
    localStorage.setItem(storageKey, value);
  };

  // Save
  const handleSave = () => {
    localStorage.setItem(storageKey, comment);
    alert("Notes saved successfully");
  };

  // Print
  const handlePrint = () => {
    const printWindow = window.open("", "", "width=900,height=600");
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Notes</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
            }
          </style>
        </head>
        <body>
          ${comment || "No notes available"}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.print();
  };

  // Close (kept consistent with other tabs)
  const handleClose = () => {
    console.log("Notes closed");
  };

  /* ================= TOOLBAR ================= */

  const toolbarSettings = {
    items: [
      "Bold",
      "Italic",
      "Underline",
      "|",
      "FontSize",
      "FontColor",
      "BackgroundColor",
      "|",
      "Alignments",
      "OrderedList",
      "UnorderedList",
      "|",
      "Undo",
      "Redo",
    ],
  };

  /* ================= UI ================= */

  return (
    <div
      className="card equipmentDash p-3 ml-2"
      style={{
        backgroundColor: "#e4eae1",
        height: "calc(100vh - 210px)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* HEADER */}
      <div className="mb-2">
        <h6 className="mb-0">Notes</h6>
      </div>

      {/* EDITOR (SCROLLABLE AREA) */}
      <div style={{ flex: 1, overflow: "hidden" }}>
        <RichTextEditorComponent
          ref={rteRef}
          value={comment}
          change={getComment}
          toolbarSettings={toolbarSettings}
          height="100%"
        >
          <Inject services={[Toolbar, HtmlEditor]} />
        </RichTextEditorComponent>
      </div>

      {/* FOOTER BUTTONS (ALWAYS VISIBLE) */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-start",
          gap: "10px",
          marginTop: "10px",
          paddingTop: "10px",
          borderTop: "1px solid #c3c3c3",
        }}
      >
        <button
          className="btn btn-secondary btn-air-secondary"
          onClick={handlePrint}
        >
          Print
        </button>

        <button
          className="btn btn-primary btn-air-primary"
          onClick={handleSave}
        >
          Save
        </button>

        <button
          className="btn btn-secondary btn-air-secondary"
          onClick={handleClose}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default Notes;
