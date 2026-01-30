import React, { useEffect, useState, useRef } from "react";
import {
  GridComponent,
  Inject,
  Toolbar,
  ColumnsDirective,
  ColumnDirective,
  Sort,
  Group,
  Filter,
  ExcelExport,
} from "@syncfusion/ej2-react-grids";
import { useHistory } from "react-router-dom";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from "reactstrap";

// CSS
import "../../App.css";

const MoldDatabase = ({ moldData }) => {
  const gridRef = useRef(null);
  const history = useHistory();

  const toolbar = ["Search", "ExcelExport"];

  const toolbarClick = (args) => {
    const grid = gridRef.current;
    if (grid && args.item.id === 'MoldGrid_excelexport') {
      grid.showSpinner();
      grid.excelExport({ fileName: 'Mold Database Excel.xlsx' });
    }
  };

  const excelExportComplete = () => {
    const grid = gridRef.current;
    if (grid) {
      grid.hideSpinner();
    }
  };

  const pathN = () => {
    history.push("/database/Options/MoldNew");
  };

  const pathE = () => {
    if (selectedRowIndexes.Mold_Id) {
      const RowId = btoa(selectedRowIndexes.Mold_Id);
      history.push(`/database/Options/${RowId}/MoldEdit`);
    } else {
      setSelectRowModal(!SelectRowModal);
    }
  };

  const pathV = () => {
    if (selectedRowIndexes.Mold_Id) {
      const RowId = btoa(selectedRowIndexes.Mold_Id);
      history.push(`/database/Options/${RowId}/MoldView`);
    } else {
      setSelectRowModal(!SelectRowModal);
    }
  };

  const pathD = () => {
    if (selectedRowIndexes.Mold_Id) {
      const RowId = btoa(selectedRowIndexes.Mold_Id);
      history.push(`/database/Options/${RowId}/MoldDuplicate`);
    } else {
      setSelectRowModal(!SelectRowModal);
    }
  };

  const [selectedRowIndexes, setSelectedRowIndexes] = useState({
    rowIdx: "",
    Mold_Id: "",
  });

  const [AllmoldData, setAllmoldData] = useState([]);

  const [SelectRowModal, setSelectRowModal] = useState(false);

  const selectionSettings = { type: "Single" };

  const rowSelected = (args) => {
    const grid = gridRef.current;
    if (grid) {
      setSelectedRowIndexes({
        rowIdx: grid.getSelectedRowIndexes(),
        Mold_Id: grid.getSelectedRecords()[0]?.id,
      });

      const targetRow = grid.getRowByIndex(args.rowIndex);
      if (targetRow) {
        targetRow.querySelectorAll('td').forEach(cell => {
          cell.style.backgroundColor = 'lightblue';
        });
      }
    }
  };

  const rowSelecting = (args) => {
    const grid = gridRef.current;
    if (grid) {
      const PreviousRow = grid.getRowByIndex(args.previousRowIndex);
      if (PreviousRow) {
        PreviousRow.querySelectorAll('td').forEach(cell => {
          cell.style.backgroundColor = '#e4eae1';
        });
      }
    }
  };

  const [column] = useState([
    {
      field: "id",
      headerText: "ID",
      visible: false,
      isPrimaryKey: true,
    },
    {
      field: "Mold_No",
      headerText: "Mold No",
      width: "90",
      textAlign: "left",
    },
    {
      field: "Material_Id",
      headerText: "Material ID",
      width: "90",
      textAlign: "left",
    },
    {
      field: "Platen_Orientation",
      headerText: "Orientation",
      width: "90",
      textAlign: "left",
    },
    {
      field: "Number_of_Bases",
      headerText: "No.of Bases",
      width: "90",
      textAlign: "left",
    },
    {
      field: "Is_Family_Mold",
      headerText: "Family Mold",
      width: "100",
      textAlign: "left",
    },
    {
      field: "Number_of_Parts",
      headerText: "No. of Parts",
      width: "90",
      textAlign: "left",
    },
    {
      field: "Cycle_Time",
      headerText: "Cycle Time",
      width: "90",
      textAlign: "left",
    },
    {
      field: "Mold_Stack_Height",
      headerText: "Stack Ht",
      width: "90",
      textAlign: "left",
    },
    {
      field: "Mold_Vertical_Height",
      headerText: "Vertical Ht",
      width: "90",
      textAlign: "left",
    },
    {
      field: "Mold_Width",
      headerText: "Width",
      width: "90",
      textAlign: "left",
    },
    {
      field: "Number_of_Core_Pulls",
      headerText: "No. of Core Pulls",
      width: "90",
      textAlign: "left",
    },
    {
      field: "Hot_Runner_Volume",
      headerText: "HR Vol",
      width: "90",
      textAlign: "left",
    },
    {
      field: "Req_Mold_Open_Stroke",
      headerText: "Req Mold Open Stroke",
      width: "120",
      textAlign: "left",
    },
  ]);

  const [DeleteConfirm, setDeleteConfirm] = useState(false);

  const [DeleteConfirmHeader, setDeleteConfirmHeader] = useState("");

  const ToggleDeleteConfirm = () => {
    if (selectedRowIndexes.Mold_Id) {
      setDeleteConfirm(!DeleteConfirm);

      const mold = AllmoldData.find(
        (value) => value.id === selectedRowIndexes.Mold_Id
      );
      setDeleteConfirmHeader(mold?.Mold_No || "Unknown");
    } else {
      setSelectRowModal(!SelectRowModal);
    }
  };

  function created(args) {
    const grid = gridRef.current;
    if (grid) {
      document
        .getElementById(grid.element.id + "_searchbar")
        .addEventListener("keyup", (args) => {
          var gridObj = document.getElementById("MoldGrid").ej2_instances[0];
          gridObj.search(args.target.value);
        });
    }
  }

  const OnDelete = () => {
    if (selectedRowIndexes.Mold_Id) {
      const updatedRows = [...AllmoldData].filter((value) => {
        return value.id !== selectedRowIndexes.Mold_Id;
      });

      setAllmoldData(updatedRows);
      sessionStorage.setItem("MoldData", JSON.stringify(updatedRows));

      // Reset selection after delete
      setSelectedRowIndexes({
        rowIdx: "",
        Mold_Id: "",
      });

      if (gridRef.current) {
        gridRef.current.clearSelection();
      }

      ToggleDeleteConfirm();
    } else {
      setSelectRowModal(!SelectRowModal);
    }
  };

  // Load data from sessionStorage on mount
  useEffect(() => {
    const storedData = JSON.parse(sessionStorage.getItem("MoldData")) || [];

    // If no stored data, add sample data
    if (storedData.length === 0) {
      const sampleData = [
        {
          id: 1,
          Mold_No: "MOLD-001",
          Material_Name: "ABS-001",
          Platen_Orientation: "Horizontal",
          Number_of_Bases: 1,
          Cycle_Time: 30,
          Mold_Stack_Height: 450,
          Mold_Vertical_Height: 400,
          Mold_Width: 350,
          Number_of_Core_Pulls: 0,
          Hot_Runner_Volume: 25,
          Req_Mold_Open_Stroke: 300,
        },
        {
          id: 2,
          Mold_No: "MOLD-002",
          Material_Name: "PP-001",
          Platen_Orientation: "Horizontal",
          Number_of_Bases: 2,
          Cycle_Time: 25,
          Mold_Stack_Height: 500,
          Mold_Vertical_Height: 450,
          Mold_Width: 400,
          Number_of_Core_Pulls: 2,
          Hot_Runner_Volume: 35,
          Req_Mold_Open_Stroke: 350,
        },
      ];
      sessionStorage.setItem("MoldData", JSON.stringify(sampleData));
      setAllmoldData(sampleData);
    } else {
      setAllmoldData(storedData);
    }

    if (moldData) {
      moldData.current.GridColumn = column;
      moldData.current.GridData = storedData.length > 0 ? storedData : [];
    }
  }, []);

  // Update moldData ref when data changes
  useEffect(() => {
    if (moldData) {
      moldData.current.GridData = AllmoldData;
    }
  }, [AllmoldData]);

  const calculateGridWidth = (columns) => `${columns.length * 160}px`;


  const filterSettings = { type: 'Excel' };

  return (
    <>
      <Modal isOpen={SelectRowModal} centered={true} style={{ width: "300px" }}>
        <ModalHeader>
          Selection Required
        </ModalHeader>
        <ModalBody>
          Please click on a row to select.
        </ModalBody>
        <ModalFooter>
          <Button
            color="primary"
            onClick={() => setSelectRowModal(!SelectRowModal)}
          >
            Close
          </Button>
        </ModalFooter>
      </Modal>

      <Modal isOpen={DeleteConfirm} centered={true} style={{ width: "400px" }}>
        <ModalHeader>
          Confirm Mold Id Deletion
        </ModalHeader>
        <ModalBody>
          Deleting this mold will delete all the studies associated with it.
          Do you want to continue deleting Mold No <strong> {DeleteConfirmHeader} </strong> ?
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={OnDelete}>
            Delete
          </Button>
          <Button color="primary" onClick={ToggleDeleteConfirm}>
            Close
          </Button>
        </ModalFooter>
      </Modal>

      <div className="card p-3 ml-2" style={{ backgroundColor: "#e4eae1" }} >
        <div className="d-flex col-md-16">
          <div className="pt-2 pb-2 text-left">
            <button className="btn btn-info btn-air-info mr-2" onClick={pathN}>
              New
            </button>
          </div>

          <div className="pt-2 pb-2">
            <button
              className="btn btn-secondary btn-air-secondary mr-2"
              onClick={pathE}
            >
              Edit
            </button>
          </div>

          <div className="pt-2 pb-2 text-left">
            <button
              className="btn btn-primary btn-air-primary mr-2"
              onClick={pathV}
            >
              View
            </button>
          </div>

          <div className="pt-2 pb-2 text-left">
            <button
              className="btn btn-primary btn-air-primary mr-2"
              onClick={pathD}
            >
              Duplicate
            </button>
          </div>

          <div className="pt-2 pb-2 text-left">
            <button
              className="btn btn-warning btn-air-warning mr-2"
              onClick={ToggleDeleteConfirm}
            >
              Delete
            </button>
          </div>

        </div>

        <div className="table-responsive" id="DBTable">
          <table className="table">
            <tbody>
              <tr>
                <td>
                  <GridComponent
                    id="MoldGrid"
                    ref={gridRef}
                    toolbar={toolbar}
                    dataSource={AllmoldData}
                    width={calculateGridWidth(column)}
                    height={"400px"}
                    selectionSettings={selectionSettings}
                    created={created.bind(this)}
                    rowSelected={rowSelected}
                    rowSelecting={rowSelecting}
                    filterSettings={filterSettings}
                    allowSorting={true}
                    allowGrouping={true}
                    allowFiltering={true}
                    allowExcelExport={true}
                    toolbarClick={toolbarClick}
                    excelExportComplete={excelExportComplete}
                  >
                    <ColumnsDirective>
                      {column.map((col, index) => {
                        const estimatedCharWidth = 10;
                        const basePadding = 20;
                        const calculatedWidth = Math.max((col.headerText || "").length * estimatedCharWidth + basePadding, 100);

                        return (
                          <ColumnDirective
                            key={index}
                            field={col.field}
                            headerText={col.headerText}
                            textAlign="left"
                            width={calculatedWidth}
                            visible={col.visible !== false}
                            isPrimaryKey={col.isPrimaryKey || false}
                          />
                        );
                      })}
                    </ColumnsDirective>
                    <Inject services={[Toolbar, Sort, Group, Filter, ExcelExport]} />
                  </GridComponent>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default MoldDatabase;
