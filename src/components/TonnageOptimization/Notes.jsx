import React, { useRef, useEffect } from "react";
import "./tonnage.css";

const Notes = ({ sessionId }) => {
  const editorRef = useRef(null);
  const storageKey = sessionId ? `notesData_${sessionId}` : "notesData";

  // Load saved notes on mount
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved && editorRef.current) {
      editorRef.current.innerHTML = saved;
    }
  }, [storageKey]);

  // Save notes when content changes
  const handleContentChange = () => {
    if (editorRef.current) {
      localStorage.setItem(storageKey, editorRef.current.innerHTML);
    }
  };

  const exec = (command, value = null) => {
    editorRef.current.focus();
    document.execCommand(command, false, value);
  };

  const printNotes = () => {
    const content = editorRef.current.innerHTML;
    const win = window.open("", "", "width=900,height=600");
    win.document.write(`<html><body>${content}</body></html>`);
    win.document.close();
    win.print();
  };

  return (
    <div className="notes-container">
      {/* Toolbar */}
      <div className="notes-toolbar">
        <div className="toolbar-group">
          <button onClick={() => exec("undo")}>Undo</button>
          <button onClick={() => exec("redo")}>Redo</button>
        </div>

        <div className="toolbar-group">
          <button onClick={() => exec("cut")}>Cut</button>
          <button onClick={() => exec("copy")}>Copy</button>
          <button onClick={() => exec("paste")}>Paste</button>
        </div>

        <div className="toolbar-group">
          <button onClick={() => exec("bold")}><b>B</b></button>
          <button onClick={() => exec("italic")}><i>I</i></button>
          <button onClick={() => exec("underline")}><u>U</u></button>
        </div>

        <div className="toolbar-group">
          <button onClick={() => exec("justifyLeft")} title="Align Left">Left</button>
          <button onClick={() => exec("justifyCenter")} title="Align Center">Center</button>
          <button onClick={() => exec("justifyRight")} title="Align Right">Right</button>
          <button onClick={() => exec("justifyFull")} title="Justify">Justify</button>
        </div>

        <div className="toolbar-group">
          <select onChange={e => exec("fontName", e.target.value)} defaultValue="Arial">
            <option value="Arial">Arial</option>
            <option value="Helvetica">Helvetica</option>
            <option value="Times New Roman">Times New Roman</option>
            <option value="Courier New">Courier New</option>
            <option value="Georgia">Georgia</option>
            <option value="Verdana">Verdana</option>
            <option value="Calibri">Calibri</option>
            <option value="Comic Sans MS">Comic Sans MS</option>
            <option value="Impact">Impact</option>
            <option value="Trebuchet MS">Trebuchet MS</option>
            <option value="Tahoma">Tahoma</option>
          </select>

          <select onChange={e => exec("fontSize", e.target.value)} defaultValue="3">
            <option value="1">8pt</option>
            <option value="2">10pt</option>
            <option value="3">12pt</option>
            <option value="4">14pt</option>
            <option value="5">18pt</option>
            <option value="6">24pt</option>
            <option value="7">36pt</option>
          </select>
        </div>

        <div className="toolbar-group">
          <button onClick={printNotes}>Print</button>
        </div>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        className="notes-editor"
        contentEditable
        suppressContentEditableWarning
        onInput={handleContentChange}
      >
      </div>

      {/* Footer */}
      <div className="notes-footer">
        <button 
          className="primary"
          onClick={() => {
            handleContentChange();
            alert("Notes saved successfully");
          }}
        >
          Save
        </button>
        <button>Close</button>
      </div>
    </div>
  );
};

export default Notes;
