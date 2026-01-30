import React, { useEffect, useState, useRef } from "react";
import {
  GridComponent,
  Inject,
  Toolbar,
  ColumnsDirective,
  ColumnDirective,
  Filter,
  Sort,
  Group,
  ExcelExport,
} from "@syncfusion/ej2-react-grids";
import { useHistory } from "react-router-dom";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from "reactstrap";

// CSS
import "../../App.css";
import '../database.css'

const MachineDatabase = ({ machineData }) => {
  const gridRef = useRef(null);
  const history = useHistory();

  const toolbar = ["Search", "ExcelExport"];

  const toolbarClick = (args) => {
    const grid = gridRef.current;
    if (grid && args.item.id === 'MachineGrid_excelexport') {
      grid.showSpinner();
      grid.excelExport({ fileName: 'Machine Database Excel.xlsx' });
    }
  };

  const excelExportComplete = () => {
    const grid = gridRef.current;
    if (grid) {
      grid.hideSpinner();
    }
  };

  const [SelectRowModal, setSelectRowModal] = useState(false);

  const [column] = useState([
    {
      field: "id",
      headerText: "ID",
      visible: false,
      isPrimaryKey: true,
    },
    {
      field: "Machine_Number",
      headerText: "Mach No",
      textAlign: "left",
      width: "120",
    },
    {
      field: "Make",
      headerText: "Make",
      textAlign: "left",
      width: "90",
    },
    {
      field: "Type(Platen_Orientation)",
      headerText: "Type",
      textAlign: "left",
      width: "90",
    },
    {
      field: "Tonnage",
      headerText: "Tonnage",
      textAlign: "left",
      width: "90",
    },
    {
      field: "Screw_Diameter",
      headerText: "Screw Dia",
      textAlign: "left",
      width: "90",
    },
    {
      field: "Max_Screw_Rotation_Speed",
      headerText: "Max Screw Rotation Speed",
      textAlign: "left",
      width: "90",
    },
    {
      field: "Max_Screw_Rotation_Linear_Speed",
      headerText: "Max Screw Rotation Linear Speed",
      textAlign: "left",
      width: "120",
    },
    {
      field: "Max_Machine_Pressure",
      headerText: "Max Hydraulic Pressure",
      textAlign: "left",
      width: "90",
    },
    {
      field: "Intensification_Ratio",
      headerText: "IR",
      textAlign: "left",
      width: "90",
    },
    {
      field: "Max_Plastic_Pressure",
      headerText: "Max PL Press",
      textAlign: "left",
      width: "90",
    },
    {
      field: "Max_shot_Capacity(Wt)",
      headerText: "Short Size(Wt)",
      textAlign: "left",
      width: "90",
    },
    {
      field: "Max_Melt_Temperature",
      headerText: "Max Melt Temp",
      textAlign: "left",
      width: "90",
    },
    {
      field: "Min_allowable_Mold_Stack_Height",
      headerText: "Min Stack HT",
      textAlign: "left",
      width: "90",
    },
    {
      field: "Max_allowable_Mold_Stack_Height",
      headerText: "Max Stack HT",
      textAlign: "left",
      width: "90"
    },
    {
      field: "Max_Mold_Open_Daylight",
      headerText: "Max Mold Open Daylight",
      textAlign: "left",
      width: "90",
    },
    {
      field: "Tiebar_Clearance-Width",
      headerText: "Tiebar Clearance-Width**",
      textAlign: "left",
      width: "90",
    },
    {
      field: "Max_Mold_Vertical_Height",
      headerText: "Max Mold Vertical Ht",
      textAlign: "left",
      width: "90",
    },
    {
      field: "Max_Mold_Width",
      headerText: "Max Mold Width",
      textAlign: "left",
      width: "90",
    },
    {
      field: "Number_of_Core_Pulls",
      headerText: "Number of Core Pulls",
      textAlign: "left",
      width: "120",
    },
  ]);

  const pathN = () => {
    history.push("/database/Options/MachineNew");
  };

  const pathE = () => {
    if (selectedRowIndexes.Machine_Id) {
      const RowId = btoa(selectedRowIndexes.Machine_Id);
      history.push(`/database/Options/${RowId}/MachineEdit`);
    } else {
      setSelectRowModal(!SelectRowModal);
    }
  };

  const pathV = () => {
    if (selectedRowIndexes.Machine_Id) {
      const RowId = btoa(selectedRowIndexes.Machine_Id);
      history.push(`/database/Options/${RowId}/MachineView`);
    } else {
      setSelectRowModal(!SelectRowModal);
    }
  };

  const pathD = () => {
    if (selectedRowIndexes.Machine_Id) {
      const RowId = btoa(selectedRowIndexes.Machine_Id);
      history.push(`/database/Options/${RowId}/MachineDuplicate`);
    } else {
      setSelectRowModal(!SelectRowModal);
    }
  };

  const [selectedRowIndexes, setSelectedRowIndexes] = useState({
    rowIdx: "",
    Machine_Id: "",
  });

  const [AllMachineData, setAllMachineData] = useState([]);

  const selectionSettings = { type: "Single" };

  const rowSelected = (args) => {
    const grid = gridRef.current;
    if (grid) {
      setSelectedRowIndexes({
        rowIdx: grid.getSelectedRowIndexes(),
        Machine_Id: grid.getSelectedRecords()[0]?.id,
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

  const [DeleteConfirm, setDeleteConfirm] = useState(false);

  const [DeleteConfirmHeader, setDeleteConfirmHeader] = useState("");

  const ToggleDeleteConfirm = () => {
    if (selectedRowIndexes.Machine_Id) {
      setDeleteConfirm(!DeleteConfirm);

      const machine = AllMachineData.find((value) => value.id === selectedRowIndexes.Machine_Id);
      setDeleteConfirmHeader(machine?.Machine_Number || "Unknown");
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
          var gridObj = document.getElementById("MachineGrid").ej2_instances[0];
          gridObj.search(args.target.value);
        });
    }
  }

  const OnDelete = () => {
    if (selectedRowIndexes.Machine_Id) {
      const updatedRows = [...AllMachineData].filter((value) => {
        return value.id !== selectedRowIndexes.Machine_Id;
      });

      setAllMachineData(updatedRows);
      sessionStorage.setItem("MachineData", JSON.stringify(updatedRows));

      // Reset selection after delete
      setSelectedRowIndexes({
        rowIdx: "",
        Machine_Id: "",
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
    const storedData = JSON.parse(sessionStorage.getItem("MachineData")) || [];

    // If no stored data, add sample data
    if (storedData.length === 0) {
      const sampleData = [
        {
          id: 1,
          Machine_Number: "M-001",
          Make: "Engel",
          "Type(Platen_Orientation)": "Horizontal",
          Tonnage: 200,
          Screw_Diameter: 45,
          Max_Screw_Rotation_Speed: 350,
          Max_Screw_Rotation_Linear_Speed: 0.82,
          Max_Machine_Pressure: 2500,
          Intensification_Ratio: 10,
          Max_Plastic_Pressure: 25000,
          "Max_shot_Capacity(Wt)": 350,
          Max_Melt_Temperature: 400,
          Min_allowable_Mold_Stack_Height: 200,
          Max_allowable_Mold_Stack_Height: 650,
          Max_Mold_Open_Daylight: 800,
          "Tiebar_Clearance-Width": 560,
          Max_Mold_Vertical_Height: 560,
          Max_Mold_Width: 560,
          Number_of_Core_Pulls: 4,
        },
        {
          id: 2,
          Machine_Number: "M-002",
          Make: "Arburg",
          "Type(Platen_Orientation)": "Horizontal",
          Tonnage: 350,
          Screw_Diameter: 55,
          Max_Screw_Rotation_Speed: 400,
          Max_Screw_Rotation_Linear_Speed: 1.15,
          Max_Machine_Pressure: 2800,
          Intensification_Ratio: 11,
          Max_Plastic_Pressure: 30800,
          "Max_shot_Capacity(Wt)": 580,
          Max_Melt_Temperature: 420,
          Min_allowable_Mold_Stack_Height: 250,
          Max_allowable_Mold_Stack_Height: 750,
          Max_Mold_Open_Daylight: 950,
          "Tiebar_Clearance-Width": 650,
          Max_Mold_Vertical_Height: 650,
          Max_Mold_Width: 650,
          Number_of_Core_Pulls: 4,
        },
      ];
      sessionStorage.setItem("MachineData", JSON.stringify(sampleData));
      setAllMachineData(sampleData);
    } else {
      setAllMachineData(storedData);
    }

    if (machineData) {
      machineData.current.GridColumn = column;
      machineData.current.GridData = storedData.length > 0 ? storedData : [];
    }
  }, []);

  // Update machineData ref when data changes
  useEffect(() => {
    if (machineData) {
      machineData.current.GridData = AllMachineData;
    }
  }, [AllMachineData]);


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
          Confirm Machine Number Deletion
        </ModalHeader>
        <ModalBody>
          Do you want to delete Machine Number <strong> "{DeleteConfirmHeader}" </strong> ?
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
            <button
              className="btn btn-info btn-air-info mr-2"
              onClick={pathN}
            >
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
        <div style={{ overflow: 'auto' }}>
          <div className="table-responsive">
            <table className="table">
              <tbody>
                <tr>
                  <td id="DBTable">
                    <GridComponent
                      ref={gridRef}
                      id="MachineGrid"
                      toolbar={toolbar}
                      dataSource={AllMachineData}
                      selectionSettings={selectionSettings}
                      created={created.bind(this)}
                      height={"400px"}
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
                      <Inject services={[Toolbar, Filter, Sort, Group, ExcelExport]} />
                    </GridComponent>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default MachineDatabase;
