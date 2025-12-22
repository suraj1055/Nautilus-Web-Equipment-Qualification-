import React, { useState, useRef, useEffect } from "react";
import "../EquipmentQualification/Grid.css"; // Import EQ Grid CSS

const StudyWeightGrid = ({ getData, data, setData, setRowToBeDeleted }) => {
    const StudyWeightTableRef = useRef(null);
    const table = StudyWeightTableRef.current;

    // State declarations must come before useEffects that use them
    const [isSelecting, setIsSelecting] = useState(false);
    const [selectionRange, setSelectionRange] = useState({ startRow: null, startCol: null, endRow: null, endCol: null });

    useEffect(() => {
        // Focus the first cell (Row 0, Column 0) when the component mounts
        const firstCell = document.querySelector(`[data-row="0"][data-col="0"]`);
        if (firstCell) {
            firstCell.focus();
        }
    }, [table]);

    // Update selection highlighting when selectionRange changes
    useEffect(() => {
        if (!table) return;
        
        // Remove all selections first
        table.querySelectorAll(".selected").forEach((cell) => {
            cell.classList.remove("selected");
        });
        
        // Apply selection to cells in range
        const { startRow, startCol, endRow, endCol } = selectionRange;
        if (startRow !== null && startCol !== null && endRow !== null && endCol !== null) {
            const minRow = Math.min(startRow, endRow);
            const maxRow = Math.max(startRow, endRow);
            const minCol = Math.min(startCol, endCol);
            const maxCol = Math.max(startCol, endCol);
            
            for (let row = minRow; row <= maxRow; row++) {
                for (let col = minCol; col <= maxCol; col++) {
                    if (![4, 5, 6].includes(col)) { // Only select editable columns
                        const cell = table.querySelector(`[data-row='${row}'][data-col='${col}']`);
                        if (cell) {
                            cell.classList.add("selected");
                        }
                    }
                }
            }
        }
    }, [selectionRange, table]);

    // Handle Mouse Down (Start Selection)
    const handleMouseDown = (rowIndex, colIndex, event) => {
        if ([4, 5, 6].includes(colIndex)) return; // Prevent selecting non-editable columns (avg, inc, perc)

        event.preventDefault();
        setIsSelecting(true);
        setSelectionRange({ startRow: rowIndex, startCol: colIndex, endRow: rowIndex, endCol: colIndex });
        
        // Clear previous selection
        if (table) {
            table.querySelectorAll(".selected").forEach((cell) => {
                cell.classList.remove("selected");
            });
        }
    };

    // Handle Mouse Move (Continue Selection)
    const handleMouseMove = (rowIndex, colIndex) => {
        if (!isSelecting) return;
        if ([4, 5, 6].includes(colIndex)) return; // Ignore non-editable cells

        setSelectionRange((prev) => ({
            ...prev,
            endRow: rowIndex,
            endCol: colIndex
        }));
    };

    // Handle Mouse Up (Stop Selection)
    const handleMouseUp = () => {
        setIsSelecting(false);
    };

    const isCellSelected = (rowIndex, colIndex) => {
        const { startRow, startCol, endRow, endCol } = selectionRange;

        if (startRow === null || startCol === null || endRow === null || endCol === null) return false;

        const minRow = Math.min(startRow, endRow);
        const maxRow = Math.max(startRow, endRow);
        const minCol = Math.min(startCol, endCol);
        const maxCol = Math.max(startCol, endCol);

        return rowIndex >= minRow && rowIndex <= maxRow && colIndex >= minCol && colIndex <= maxCol;
    };

    const handlePaste = (event) => {
        event.preventDefault();
        const clipboardData = event.clipboardData.getData("text");

        const selectedCell = document.activeElement;
        
        // Check: Ensure focus is on a valid grid cell
        if (
            !selectedCell ||
            !selectedCell.dataset ||
            selectedCell.dataset.row === undefined ||
            selectedCell.dataset.col === undefined
        ) {
            return; // Ignore paste if not focused in grid
        }

        // Convert clipboard data into rows and columns
        const rows = clipboardData.trim().split("\n").map(row => row.split("\t"));

        // Find the first selected cell
        const startRow = parseInt(selectedCell.dataset.row, 10);
        const startCol = parseInt(selectedCell.dataset.col, 10);

        setData((prevData) => {
            let newData = [...prevData];

            // **Check if more rows are needed**
            const totalRowsNeeded = startRow + rows.length;
            if (totalRowsNeeded > newData.length) {
                const rowsToAdd = totalRowsNeeded - newData.length;
                for (let i = 0; i < rowsToAdd; i++) {
                    newData.push(Array(newData[0].length).fill("")); // Add empty rows
                }
            }

            // **Insert Pasted Data**
            rows.forEach((row, rowIndex) => {
                row.forEach((cell, colIndex) => {
                    const targetRow = startRow + rowIndex;
                    const targetCol = startCol + colIndex;

                    // Skip non-editable columns (avg, inc, perc -> indexes 4, 5, 6)
                    if (targetCol >= newData[0].length || [4, 5, 6].includes(targetCol)) {
                        return;
                    }

                    // **Sanitize the pasted data**
                    let sanitizedValue = cell.replace(/[^0-9.]/g, ""); // Remove non-numeric characters except '.'

                    // Prevent multiple decimal points (e.g., "1..1" -> "1.1")
                    const decimalCount = (sanitizedValue.match(/\./g) || []).length;
                    if (decimalCount > 1) {
                        sanitizedValue = sanitizedValue.split(".")[0] + "." + sanitizedValue.split(".").slice(1).join("");
                    }

                    // Prevent "." at the start (".123" -> "0.123")
                    if (sanitizedValue.startsWith(".")) {
                        sanitizedValue = "0" + sanitizedValue;
                    }

                    newData[targetRow][targetCol] = sanitizedValue; // Update with cleaned value

                    // **Move Cursor to End of Text**
                    setTimeout(() => {
                        const cellElement = table?.querySelector(`[data-row='${targetRow}'][data-col='${targetCol}']`);
                        if (cellElement) {
                            const range = document.createRange();
                            const selection = window.getSelection();
                            range.selectNodeContents(cellElement);
                            range.collapse(false); // Move cursor to end
                            selection.removeAllRanges();
                            selection.addRange(range);
                        }
                    }, 0);
                });
            });

            return newData;
        });
        
        // Trigger getData after paste to recalculate
        setTimeout(() => {
            if (getData) {
                getData();
            }
        }, 100);
    };

    // Handle copying data from table
    const handleCopy = (event) => {
        event.preventDefault();

        const selectedCells = Array.from(table?.querySelectorAll(".selected"));

        if (selectedCells.length === 0) return;

        let copiedData = {};

        selectedCells.forEach((cell) => {
            const row = parseInt(cell.dataset.row, 10);
            const col = parseInt(cell.dataset.col, 10);

            if (!copiedData[row]) copiedData[row] = {};
            copiedData[row][col] = cell.innerText.trim();
        });

        let clipboardText = Object.keys(copiedData)
            .sort((a, b) => a - b)
            .map((rowIndex) => {
                const rowCells = copiedData[rowIndex];
                const cols = Object.keys(rowCells)
                    .map(Number)
                    .sort((a, b) => a - b);
                return cols.map((col) => rowCells[col] || "").join("\t");
            })
            .join("\n");

        event.clipboardData.setData("text/plain", clipboardText);
    };

    // Helper function to find next editable cell
    const findNextEditableCell = (startRow, startCol, direction) => {
        const nonEditableCols = [4, 5, 6]; // Columns that are not editable
        const totalCols = data[0]?.length || 7;
        
        if (direction === 'right') {
            // Move right, skipping non-editable columns
            for (let col = startCol + 1; col < totalCols; col++) {
                if (!nonEditableCols.includes(col)) {
                    return { row: startRow, col };
                }
            }
            // If at end of row, move to next row's first editable column
            if (startRow < data.length - 1) {
                for (let col = 0; col < totalCols; col++) {
                    if (!nonEditableCols.includes(col)) {
                        return { row: startRow + 1, col };
                    }
                }
            }
        } else if (direction === 'left') {
            // Move left, skipping non-editable columns
            for (let col = startCol - 1; col >= 0; col--) {
                if (!nonEditableCols.includes(col)) {
                    return { row: startRow, col };
                }
            }
            // If at start of row, move to previous row's last editable column
            if (startRow > 0) {
                for (let col = totalCols - 1; col >= 0; col--) {
                    if (!nonEditableCols.includes(col)) {
                        return { row: startRow - 1, col };
                    }
                }
            }
        }
        return null;
    };

    const clearAllSelections = () => {
  if (!table) return;
  table.querySelectorAll(".selected").forEach(cell => {
    cell.classList.remove("selected");
  });
};


    // Handle keyboard navigation
    const handleKeyDown = (event, rowIndex, colIndex) => {
        // **Handle Tab Key (Move to Next Editable Cell)**
       if (event.key === "Tab") {
  event.preventDefault();

  const direction = event.shiftKey ? "left" : "right";
  const next = findNextEditableCell(rowIndex, colIndex, direction);

  if (next) {
    const nextCell = table?.querySelector(
      `[data-row='${next.row}'][data-col='${next.col}']`
    );

    if (nextCell) {
      // 🔴 CLEAR old highlight
      clearAllSelections();

      // 🔵 UPDATE selection state
      setSelectionRange({
        startRow: next.row,
        startCol: next.col,
        endRow: next.row,
        endCol: next.col
      });

      // 🔵 APPLY highlight
      nextCell.classList.add("selected");

      // 🔵 MOVE focus
      nextCell.focus();
    }
  }

  return;
}


        // **Handle Enter Key (Move to Next Row)**
      if (event.key === "Enter") {
  event.preventDefault(); // Prevent newline in contentEditable

  const nextRow = rowIndex + 1;

  if (nextRow < data.length) {
    const cellEl = table?.querySelector(
      `[data-row='${nextRow}'][data-col='${colIndex}']`
    );

    if (cellEl && cellEl.contentEditable !== "false") {
      // 🔴 CLEAR previous selection
      clearAllSelections();

      // 🔵 SET new single-cell selection
      setSelectionRange({
        startRow: nextRow,
        startCol: colIndex,
        endRow: nextRow,
        endCol: colIndex
      });

      // 🔵 APPLY visual highlight
      cellEl.classList.add("selected");

      // 🔵 MOVE focus
      cellEl.focus();
    }
  }

  return;
}

        // Get the current cell element
        const cell = event.target;
        const selection = window.getSelection();
        const cursorPos = selection.focusOffset;
        const textLength = cell.innerText.length;
        const nonEditableCols = [4, 5, 6];

        // Handle Arrow Right (Move within text, then jump to next editable cell)
       if (event.key === "ArrowRight") {
  const nextPos = findNextEditableCell(rowIndex, colIndex, "right");

  if (nextPos) {
    const cellEl = table?.querySelector(
      `[data-row='${nextPos.row}'][data-col='${nextPos.col}']`
    );

    if (cellEl) {
      clearAllSelections();

      setSelectionRange({
        startRow: nextPos.row,
        startCol: nextPos.col,
        endRow: nextPos.row,
        endCol: nextPos.col
      });

      cellEl.classList.add("selected");
      cellEl.focus();
    }
  }

  event.preventDefault();
  return;
}


        // Handle Arrow Left (Move within text, then jump to previous editable cell)
       if (event.key === "ArrowLeft") {
  const prevPos = findNextEditableCell(rowIndex, colIndex, "left");

  if (prevPos) {
    const cellEl = table?.querySelector(
      `[data-row='${prevPos.row}'][data-col='${prevPos.col}']`
    );

    if (cellEl) {
      clearAllSelections();

      setSelectionRange({
        startRow: prevPos.row,
        startCol: prevPos.col,
        endRow: prevPos.row,
        endCol: prevPos.col
      });

      cellEl.classList.add("selected");
      cellEl.focus();
    }
  }

  event.preventDefault();
  return;
}

        // Handle Arrow Down (Move to the cell below, skip if non-editable)
     if (event.key === "ArrowDown") {
  const nextRow = rowIndex + 1;

  if (nextRow < data.length) {
    const cellEl = table?.querySelector(
      `[data-row='${nextRow}'][data-col='${colIndex}']`
    );

    if (cellEl && cellEl.contentEditable !== "false") {
      clearAllSelections();

      setSelectionRange({
        startRow: nextRow,
        startCol: colIndex,
        endRow: nextRow,
        endCol: colIndex
      });

      cellEl.classList.add("selected");
      cellEl.focus();
    }
  }

  event.preventDefault();
  return;
}


        // Handle Arrow Up (Move to the cell above, skip if non-editable)
       if (event.key === "ArrowUp") {
  const prevRow = rowIndex - 1;

  if (prevRow >= 0) {
    const cellEl = table?.querySelector(
      `[data-row='${prevRow}'][data-col='${colIndex}']`
    );

    if (cellEl && cellEl.contentEditable !== "false") {
      clearAllSelections();

      setSelectionRange({
        startRow: prevRow,
        startCol: colIndex,
        endRow: prevRow,
        endCol: colIndex
      });

      cellEl.classList.add("selected");
      cellEl.focus();
    }
  }

  event.preventDefault();
  return;
}


        // **Restrict input to numbers and one decimal**
        if (!/[0-9.]/.test(event.key) &&
            !["Backspace", "Delete", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Tab", "Enter"].includes(event.key) &&
            !(event.ctrlKey || event.metaKey)) {
            event.preventDefault();
        }

        // Prevent multiple decimals
        if (event.key === "." && event.target.innerText.includes(".")) {
            event.preventDefault();
        }

        // Auto-add row when typing in last row
        if ((data.length - 1 === rowIndex) && /[0-9.]/.test(event.key)) {
            const newRow = new Array(data[0].length).fill(""); // Create a new empty row
            setData(prevData => [...prevData, newRow]); // Append the new row
        }
    };

    // Handle cell selection for copying
  const handleCellClick = (rowIndex, colIndex, event) => {
    if (!event.target) return;

    // ✅ CLEAR range selection when clicking a single cell
    setSelectionRange({
        startRow: rowIndex,
        startCol: colIndex,
        endRow: rowIndex,
        endCol: colIndex,
    });

    // Remove all previous selections
    if (table) {
        table.querySelectorAll(".selected").forEach((cell) => {
            cell.classList.remove("selected");
        });
    }

    // Mark only the clicked cell
    event.target.classList.add("selected");

    // ✅ CRITICAL: move keyboard focus
    event.target.focus()
    setRowToBeDeleted(rowIndex);
};


    const handleOnInput = (event) => {
        // Save cursor position before modifying text
        const selection = window.getSelection();
        const range = document.createRange();
        const cursorPosition = selection.focusOffset;

        // Restore cursor position to prevent text reversal
        range.setStart(event.target.childNodes[0] || event.target, cursorPosition);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
    };

   const [columnWidths, setColumnWidths] = useState([
  90,   // Tonnage
  90,   // Sample 1
  90,   // Sample 2
  90,   // Sample 3
  120,  // Average Weight
  120,  // Actual Increase
  100   // % Increase
]);

    const ResizeColumnWidth = (event, colIndex) => {
        event.preventDefault();

        let startX = event.clientX;
        let startWidth = columnWidths[colIndex];

        const handleMouseMove = (moveEvent) => {
            const newWidth = Math.max(50, startWidth + (moveEvent.clientX - startX)); // Prevent shrinking too much
            setColumnWidths((prevWidths) => {
                const updatedWidths = [...prevWidths];
                updatedWidths[colIndex] = newWidth;
                return updatedWidths;
            });

            document.querySelector("table").style.width = "auto"; // Allow table expansion
        };

        const handleMouseUp = () => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
        };

        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
    };

    return (
        <div id="StudyWeight_Grid">
            <div className="table-container"><div
  className="table-scroll-wrapper"
  style={{
    maxHeight: "260px",   // ⬅ table HEIGHT
    overflowY: "auto",    // ⬅ vertical scroll
    overflowX: "auto",    // ⬅ horizontal scroll
  }}
>

                    <table
                        ref={StudyWeightTableRef}
                        id="StudyWeight_Sheet"
                        className="excel-table"
                        onPaste={handlePaste}
                        onCopy={handleCopy}
                        onMouseUp={handleMouseUp}
                         style={{
    tableLayout: "fixed", // ⬅ CRITICAL
    width: "55%",
    minWidth: "200px"     // ⬅ prevents over-expansion
  }}
                    >
                        <thead>
                            <tr>
                                {[
                                    "Tonnage", "Sample 1", "Sample 2", "Sample 3", 
                                    "Average Weight", "Actual Increase", "% Increase"
                                ].map((colName, colIndex) => (
                                    <th key={colIndex} style={{
                                        width: `${columnWidths[colIndex]}px`,
                                    }}>
                                        {colName}
                                        <div
                                            className="column-resizer"
                                            onMouseDown={(event) => ResizeColumnWidth(event, colIndex)}
                                        />
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((row, rowIndex) => (
                                <tr key={rowIndex}>
                                    {row.map((cell, colIndex) => (
                                        <td
                                            key={colIndex}
                                            contentEditable={colIndex < 4}
                                            data-row={rowIndex}
                                            data-col={colIndex}
                                            onInput={colIndex < 4 ? handleOnInput : undefined}
                                            onBlur={colIndex < 4 ? getData : undefined}
                                            onClick={(e) => handleCellClick(rowIndex, colIndex, e)}
                                            onKeyDown={colIndex < 4 ? (e) => handleKeyDown(e, rowIndex, colIndex) : undefined}
                                            className={isCellSelected(rowIndex, colIndex) ? "selected e-cell" : "e-cell"}
                                            onMouseDown={(e) => handleMouseDown(rowIndex, colIndex, e)}
                                            onMouseMove={() => handleMouseMove(rowIndex, colIndex)}
                                            suppressContentEditableWarning={true}
                                        >
                                            {cell || ""}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default StudyWeightGrid;

