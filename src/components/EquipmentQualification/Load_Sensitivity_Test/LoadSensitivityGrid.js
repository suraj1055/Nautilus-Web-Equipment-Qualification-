import React, { useState, useRef, useEffect } from "react";
import "../Grid.css"; // Import CSS

const LoadSensitivityGrid = ({ GetDataFromSheet, data, setData, setRowToBeDeleted, Pressure_Units, LoadGridData }) => {

    const LoadSensitivityTableRef = useRef(null);

    const table = LoadSensitivityTableRef.current;

    useEffect(() => {
        // Focus the first cell (Row 0, Column 0) when the component mounts
        const firstCell = document.querySelector(`[data-row="0"][data-col="0"]`);
        if (firstCell) {
            firstCell.focus();
        }
    }, [table]);

    const [isSelecting, setIsSelecting] = useState(false);
    const [selectionRange, setSelectionRange] = useState({ startRow: null, startCol: null, endRow: null, endCol: null });

    // Handle Mouse Down (Start Selection)
    const handleMouseDown = (rowIndex, colIndex) => {
        if ([5].includes(colIndex)) return; // Prevent selecting non-editable columns

        setIsSelecting(true);
        setSelectionRange({ startRow: rowIndex, startCol: colIndex, endRow: rowIndex, endCol: colIndex });
    };

    // Handle Mouse Move (Continue Selection)
    const handleMouseMove = (rowIndex, colIndex) => {
        if (!isSelecting) return;
        if ([5].includes(colIndex)) return; // Ignore non-editable cells

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

                    if (targetCol >= newData[0].length || [5].includes(targetCol)) {
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

            // console.log(newData)

            return newData;
        });

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
        })

        // console.log(copiedData)

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


    // Handle enter key to move to the next row
    const handleKeyDown = (event, rowIndex, colIndex) => {

        let nextRow = rowIndex;

        // **Handle Enter Key (Move to Next Row)**
        if (event.key === "Enter") {
            event.preventDefault(); // Prevent line break in contentEditable

            nextRow = rowIndex + 1; // Move to next row
            if (nextRow < data.length) {
                const nextCell = table?.querySelector(`[data-row='${nextRow}'][data-col='${colIndex}']`);
                if (nextCell) {

                    // console.log(nextCell, rowIndex, colIndex)

                    nextCell.focus();
                    return; // Stop further processing so arrow keys don’t interfere
                }
                event.preventDefault();
            }
        }

        // Get the current cell element
        const cell = event.target;
        const selection = window.getSelection();

        // Get cursor position (offset)
        const cursorPos = selection.focusOffset;

        // Get the text inside the cell
        const textLength = cell.innerText.length;

        // Handle Arrow Right (Move within text, then jump to next cell)
        if (event.key === "ArrowRight") {
            if (cursorPos < textLength) {
                return; // Allow cursor to move within text
            }
            // If at the end of text, move to the next cell
            const nextCell = table?.querySelector(`[data-row='${rowIndex}'][data-col='${colIndex + 1}']`);
            if (nextCell) {
                nextCell.focus();
            }
            event.preventDefault();
        }

        // Handle Arrow Left (Move within text, then jump to previous cell)
        if (event.key === "ArrowLeft") {
            if (cursorPos > 0) {
                return; // Allow cursor to move within text
            }
            // If at the beginning of text, move to the previous cell
            const prevCell = table?.querySelector(`[data-row='${rowIndex}'][data-col='${colIndex - 1}']`);
            if (prevCell) {
                prevCell.focus();
            }
            event.preventDefault();
        }

        // Handle Arrow Down (Move to the cell below)
        if (event.key === "ArrowDown") {
            const nextRowCell = table?.querySelector(`[data-row='${rowIndex + 1}'][data-col='${colIndex}']`);
            if (nextRowCell) {
                nextRowCell.focus();
            }
            event.preventDefault();
        }

        // Handle Arrow Up (Move to the cell above)
        if (event.key === "ArrowUp") {
            const prevRowCell = table?.querySelector(`[data-row='${rowIndex - 1}'][data-col='${colIndex}']`);
            if (prevRowCell) {
                prevRowCell.focus();
            }
            event.preventDefault();
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

        if ((data.length - 1 === rowIndex) && /[0-9.]/.test(event.key)) {
            const newRow = new Array(data[0].length).fill(""); // Create a new empty row
            setData(prevData => [...prevData, newRow]); // Append the new row
        }

    }

    // Handle cell selection for copying
    const handleCellClick = (rowIndex, colIndex, event) => {
        if (event.ctrlKey || event.metaKey) {
            event.target.classList.toggle("selected");
        } else {
            // eslint-disable-next-line no-unused-expressions
            table?.querySelectorAll(".selected").forEach((cell) => {
                cell.classList.remove("selected");
            });
            event.target.classList.add("selected");
        }

        setRowToBeDeleted(rowIndex)
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
    }

    const [columnWidths, setColumnWidths] = useState(Array(6).fill(200)); // Default column width (200px)

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
    }

    return (
        <div id="Load_Sensitivity_Grid">
            <div className="table-container"
            // onFocus={
            //     GetDataFromSheet
            // }
            >
                <div className="table-scroll-wrapper">
                    <table
                        ref={LoadSensitivityTableRef}
                        id="Load_Sensitivity_Sheet"
                        className="excel-table"
                        onPaste={handlePaste}
                        onCopy={handleCopy}
                        onMouseUp={handleMouseUp}
                    >
                        <thead>
                            <tr>

                                {[
                                    "Injection Speed",
                                    "Fill Time - In Mold (sec)",
                                    "Peak Press at Transfer - In Mold",
                                    "Fill Time - Air Shot (sec)",
                                    "Peak Press at Transfer - Air Shot",
                                    "Load Sensitivity"
                                ].map((colName, colIndex) => {
                                    const isLastCol = colIndex === 5;

                                    // Determine the unit only if it's the last column
                                    const unit =
                                        Pressure_Units === null ||
                                            Pressure_Units === "psi" ||
                                            Pressure_Units === "ppsi (Plastic Pressure)"
                                            ? "Kpsi"
                                            : Pressure_Units;

                                    return (
                                        <th
                                            key={colIndex}
                                            style={{ width: `${columnWidths[colIndex]}px` }}
                                        >
                                            {colName}{" "}
                                            {isLastCol && unit ? `(%/${unit})` : ""}
                                            <div
                                                className="column-resizer"
                                                onMouseDown={(event) => ResizeColumnWidth(event, colIndex)}
                                            />
                                        </th>
                                    );
                                })}
                            </tr>

                        </thead>
                        <tbody>
                            {data.map((row, rowIndex) => (
                                <tr key={rowIndex}>
                                    {row.map((cell, colIndex) => {
                                        const isCol5 = colIndex === 5;
                                        const isInfinite =
                                            isCol5 && (cell === Infinity || cell === -Infinity || cell === "Infinity" || cell === "-Infinity");

                                        return (
                                            <td
                                                key={colIndex}
                                                contentEditable={colIndex < 5}
                                                data-row={rowIndex}
                                                data-col={colIndex}
                                                onInput={handleOnInput}
                                                onBlur={GetDataFromSheet}
                                                onClick={(e) => handleCellClick(rowIndex, colIndex, e)}
                                                onKeyDown={(e) => handleKeyDown(e, rowIndex, colIndex)}
                                                className={isCellSelected(rowIndex, colIndex) ? "selected e-cell" : "e-cell"}
                                                onMouseDown={() => handleMouseDown(rowIndex, colIndex)}
                                                onMouseMove={() => handleMouseMove(rowIndex, colIndex)}
                                                suppressContentEditableWarning={true}
                                            >
                                                {isInfinite ? "" : cell}
                                            </td>
                                        );
                                    })}
                                </tr>

                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default LoadSensitivityGrid