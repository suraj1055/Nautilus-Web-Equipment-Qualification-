import { useEffect, useState, useRef } from "react";
import {
  GridComponent,
  Inject,
  Toolbar,
  ColumnDirective,
  ColumnsDirective,
  ExcelExport,
  Filter,
  Sort,
  Group
} from "@syncfusion/ej2-react-grids";
import { useHistory } from "react-router-dom";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from "reactstrap";

// CSS
import "../../App.css";
import '../database.css'

const MaterialDatabase = ({ materialData }) => {
  const gridRef = useRef(null);

  const history = useHistory();

  const toolbar = ["Search", "ExcelExport"];

  const [SelectRowModal, setSelectRowModal] = useState(false);

  const [selectedRowIndexes, setSelectedRowIndexes] = useState({
    rowIdx: "",
    Material_Id: "",
  });

  const [column] = useState([
    {
      field: "id",
      headerText: "ID",
      visible: false,
      isPrimaryKey: true,
    },
    {
      field: "Material_Id",
      headerText: "Material ID",
      textAlign: "center",
      width: "90",
    },
    {
      field: "Base_Resin",
      headerText: "Resin",
      textAlign: "center",
      width: "90",
    },
    {
      field: "Manufacturer",
      headerText: "Supplier",
      textAlign: "center",
      width: "90",
    },
    {
      field: "Specific_Gravity",
      headerText: "Sp.Gr",
      textAlign: "center",
      width: "90",
    },
    {
      field: "Min_Melt_Temperature",
      headerText: "Min Melt Temp",
      textAlign: "center",
      width: "90",
    },
    {
      field: "Max_Melt_Temperature",
      headerText: "Max Melt Temp",
      textAlign: "center",
      width: "90",
    },
    {
      field: "Avg_Melt_Temperature",
      headerText: "Avg Melt Temp",
      textAlign: "center",
      width: "90",
    },
    {
      field: "Min_Mold_Temperature",
      headerText: "Min Mold Temp",
      textAlign: "center",
      width: "90",
    },
    {
      field: "Max_Mold_Temperature",
      headerText: "Max Mold Temp",
      textAlign: "center",
      width: "90",
    },
    {
      field: "Avg_Mold_Temperature",
      headerText: "Avg Mold Temp",
      textAlign: "center",
      width: "90",
    },
    {
      field: "Drying_Temperature",
      headerText: "Drying Temp",
      textAlign: "center",
      width: "90",
    },
    {
      field: "Drying_Time_Min",
      headerText: "Drying Temp Min",
      textAlign: "center",
      width: "90",
    },
    {
      field: "Drying_Time_Max",
      headerText: "Drying Temp Max",
      textAlign: "center",
      width: "90",
    },
    {
      field: "Max_Residence_Time",
      headerText: "Max Res Time",
      textAlign: "center",
      width: "90",
    },
  ]);

  const pathN = () => {
    history.push("/database/Options/MaterialNew");
  };

  const pathE = () => {
    if (selectedRowIndexes.Material_Id) {
      const RowId = btoa(selectedRowIndexes.Material_Id);
      history.push(`/database/Options/${RowId}/MaterialEdit`);
    } else {
      setSelectRowModal(!SelectRowModal);
    }
  };

  const pathV = () => {
    if (selectedRowIndexes.Material_Id) {
      const RowId = btoa(selectedRowIndexes.Material_Id);
      history.push(`/database/Options/${RowId}/MaterialView`);
    } else {
      setSelectRowModal(!SelectRowModal);
    }
  };

  const pathD = () => {
    if (selectedRowIndexes.Material_Id) {
      const RowId = btoa(selectedRowIndexes.Material_Id);
      history.push(`/database/Options/${RowId}/MaterialDuplicate`);
    } else {
      setSelectRowModal(!SelectRowModal);
    }
  };

  const [AllMaterialData, setAllMaterialData] = useState([]);

  const selectionSettings = { type: "Single" };

  const rowSelected = (args) => {
    const grid = gridRef.current;
    if (grid) {
      setSelectedRowIndexes({
        rowIdx: grid.getSelectedRowIndexes(),
        Material_Id: grid.getSelectedRecords()[0]?.id,
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
    if (selectedRowIndexes.Material_Id) {
      setDeleteConfirm(!DeleteConfirm);

      const material = AllMaterialData.find(
        (value) => value.id === selectedRowIndexes.Material_Id
      );
      setDeleteConfirmHeader(material?.Material_Id || "Unknown");
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
          const gridObj = document.getElementById("MaterialGrid").ej2_instances[0];
          gridObj.search(args.target.value);
        });
    }
  }

  const OnDelete = () => {
    if (selectedRowIndexes.Material_Id) {
      const updatedRows = [...AllMaterialData].filter((value) => {
        return value.id !== selectedRowIndexes.Material_Id;
      });

      setAllMaterialData(updatedRows);
      sessionStorage.setItem("MaterialData", JSON.stringify(updatedRows));

      // Reset selection after delete
      setSelectedRowIndexes({
        rowIdx: "",
        Material_Id: "",
      });

      ToggleDeleteConfirm();
    } else {
      setSelectRowModal(!SelectRowModal);
    }
  };

  // Load data from sessionStorage on mount
  useEffect(() => {
    const storedData = JSON.parse(sessionStorage.getItem("MaterialData")) || [];

    // If no stored data, add sample data
    if (storedData.length === 0) {
      const sampleData = [
        {
          id: 1,
          Material_Id: "ABS-001",
          Base_Resin: "ABS",
          Manufacturer: "SABIC",
          Specific_Gravity: 1.05,
          Min_Melt_Temperature: 220,
          Max_Melt_Temperature: 260,
          Avg_Melt_Temperature: 240,
          Min_Mold_Temperature: 40,
          Max_Mold_Temperature: 80,
          Avg_Mold_Temperature: 60,
          Drying_Temperature: 80,
          Drying_Time_Min: 2,
          Drying_Time_Max: 4,
          Max_Residence_Time: 10,
        },
        {
          id: 2,
          Material_Id: "PP-001",
          Base_Resin: "Polypropylene",
          Manufacturer: "LyondellBasell",
          Specific_Gravity: 0.91,
          Min_Melt_Temperature: 200,
          Max_Melt_Temperature: 240,
          Avg_Melt_Temperature: 220,
          Min_Mold_Temperature: 20,
          Max_Mold_Temperature: 50,
          Avg_Mold_Temperature: 35,
          Drying_Temperature: 0,
          Drying_Time_Min: 0,
          Drying_Time_Max: 0,
          Max_Residence_Time: 15,
        },
      ];
      sessionStorage.setItem("MaterialData", JSON.stringify(sampleData));
      setAllMaterialData(sampleData);
    } else {
      setAllMaterialData(storedData);
    }

    if (materialData) {
      materialData.current.GridColumn = column;
      materialData.current.GridData = storedData.length > 0 ? storedData : [];
    }
  }, []);

  // Update materialData ref when data changes
  useEffect(() => {
    if (materialData) {
      materialData.current.GridData = AllMaterialData;
    }
  }, [AllMaterialData]);

  const calculateGridWidth = (columns) => `${columns.length * 160}px`;


  const toolbarClick = (args) => {
    const grid = gridRef.current;
    if (grid && args.item.id === 'MaterialGrid_excelexport') {
      grid.showSpinner();
      grid.excelExport({ fileName: 'Material Database Excel.xlsx' });
    }
  };

  const excelExportComplete = () => {
    const grid = gridRef.current;
    if (grid) {
      grid.hideSpinner();
    }
  };

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

      <Modal isOpen={DeleteConfirm} centered={true} style={{ width: "300px" }}>
        <ModalHeader>
          Confirm Material Deletion
        </ModalHeader>
        <ModalBody>
          Do you want to delete Material Id <strong> {DeleteConfirmHeader} </strong> ?
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

      <div className="card p-3 ml-2" style={{ background: "#e4eae1" }}>
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

        <div className="table-responsive">
          <table className="table">
            <tbody>
              <tr>
                <td id="DBTable">
                  <GridComponent
                    ref={gridRef}
                    id="MaterialGrid"
                    toolbar={toolbar}
                    dataSource={AllMaterialData}
                    width={calculateGridWidth(column)}
                    height={"400px"}
                    selectionSettings={selectionSettings}
                    created={created.bind(this)}
                    rowSelected={rowSelected}
                    rowSelecting={rowSelecting}
                    excelExportComplete={excelExportComplete}
                    allowExcelExport={true}
                    toolbarClick={toolbarClick}
                    filterSettings={filterSettings}
                    allowSorting={true}
                    allowGrouping={true}
                    allowFiltering={true}
                  >
                    <Inject services={[Toolbar, Filter, Sort, Group, ExcelExport]} />

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
                  </GridComponent>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div >
    </>
  );
};

export default MaterialDatabase;
