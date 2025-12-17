import React, { useState, useRef, useEffect } from "react";
import InjGrid from "./InjGrid";
// Syncfusion chart control
import {
  ChartComponent,
  LineSeries,
  Inject,
  SeriesCollectionDirective,
  SeriesDirective,
  Category,
  DataLabel,
  StripLine,
  Legend,
  Tooltip,
} from "@syncfusion/ej2-react-charts";
import AddRow from "./AddRow";
import {
  HtmlEditor,
  RichTextEditorComponent,
  Toolbar,
} from "@syncfusion/ej2-react-richtexteditor";
import { Modal, ModalHeader, ModalBody, ModalFooter, Table } from "reactstrap";
import { Button } from "reactstrap";
import InjSpeedGrid from "./InjSpeedGrid";

const InjSpeed = ({
  setSession_Id,
  setSession_Name,
  setMoldId,
  setMoldName,
  showAlert,
  ToSaveInjSpeedData,
  InjSpeedData,
}) => {

  // To store the session Id
  const [SessionId, setSessionId] = useState("1");

  const [Shot_Size, setShot_Size] = useState(null);
  const [Suck_Back, setSuck_Back] = useState(null);
  const [TransferPosition, setTransferPosition] = useState(null);
  const [Acceptable_variation, setAcceptable_variation] = useState(10);
  const [Average_Percent_variation, setAverage_Percent_variation] =
    useState(null);
  const [Actual_Range, setActual_Range] = useState(null);

  // State and Event for the comment modal
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);

  const handleShow = () => setShow(true);

  let toolbarSettings = {
    items: [
      "Bold",
      "Italic",
      "Underline",
      "FontSize",
      "FontColor",
      "BackgroundColor",
      "Alignments",
      "OrderedList",
      "UnorderedList",
      "Undo",
      "Redo",
    ],
  };

  // A state variable to store and set the value of textarea
  const [Comment, setComment] = useState("");

  const [Alert, setAlert] = useState(false);

  const [InjSpeedGridData, setInjSpeedGridData] = useState([]);

  const [rowCount, setRowCount] = useState(10);

  const [rowToBeDeleted, setRowToBeDeleted] = useState();

  // Boolean variable to switch between the save and update button
  const [showSave, setShowSave] = useState(true);

  // As the user enter's the number of row's it get's set in this variable.
  const [row, setRow] = useState(5);

  // Set's the visibility of the modal which we use to get the number of row's to be generated which is imported in Viscosity Grid.
  const [InjSpeedAddRowModal, setInjSpeedAddRowModal] = useState();

  const ToggleAddRowModal = () => {
    setInjSpeedAddRowModal(!InjSpeedAddRowModal);
  };

  const [ShotSizeAlert, setShotSizeAlert] = useState(true);

  const ToggleShotAlert = () => {
    setShotSizeAlert(!ShotSizeAlert);
  };

  const [data, setData] = useState(
    Array.from({ length: 10 }, () => Array(5).fill(""))
  );

  // This is the event to do the above said thing.
  const addRow = (e) => {
    e.preventDefault();

    // Storing the number entered
    setRow(e.target.value);
  };

  // This is the event which gets called as the user click's ok in the add row modal.
  const increaseRow = () => {
    // Updating the total rows variable
    setRowCount(parseInt(rowCount) + parseInt(row));

    setAlert(true);

    setRow(null);
  };

  // This is the event which deletes the row as clicked on the delete icon
  const DeleteGridRow = (id) => {
    if (InjSpeedGridData.length !== 1) {

      const newData = [...data];

      newData.splice(rowToBeDeleted, 1);

      setData(newData);

      InjSpeedGridData.splice(rowToBeDeleted, 1);

      setAlert(true);
    }
  };

  // Event to set the data entered in the textarea
  const getComment = (e) => {
    if (e.target) {
      setComment(e.target.value);
    } else {
      setComment(e.value);
      setAlert(true);
    }
  };

  const [InjSpeedArray, setInjSpeedArray] = useState([]);

  function calculateNiceNumbers(min, max, numTicks) {
    const range = max - min;
    const roughStep = range / numTicks;
    const magnitude = Math.floor(Math.log10(roughStep));
    const magnitudePow = Math.pow(10, magnitude);
    const mantissa = roughStep / magnitudePow;
    let niceStep;

    if (mantissa <= 1.0) {
      niceStep = 1 * magnitudePow;
    } else if (mantissa <= 2.0) {
      niceStep = 2 * magnitudePow;
    } else if (mantissa <= 5.0) {
      niceStep = 5 * magnitudePow;
    } else {
      niceStep = 10 * magnitudePow;
    }

    const niceMin = Math.floor(min / niceStep) * niceStep;
    const niceMax = Math.ceil(max / niceStep) * niceStep;

    const numNiceTicks = Math.floor((niceMax - niceMin) / niceStep) + 1;
    const niceTicks = Array.from(
      { length: numNiceTicks },
      (_, i) => niceMin + i * niceStep
    );

    return {
      min: niceMin,
      max: niceMax,
      step: niceStep,
      ticks: niceTicks,
    };
  }

  const [InjectionniceNumbers, setInjectionNiceNumbers] = useState({
    min: 0,
    max: 0,
    step: 0,
  });

  const [FillTimeNiceNumbers, setFillTimeNiceNumbers] = useState({
    min: 0,
    max: 0,
    step: 0,
  });

  const [ActualSpeedNiceNumbers, setActualSpeedNiceNumbers] = useState({
    min: 0,
    max: 0,
    step: 0,
  });

  // Event to set the Min, Max and Interval of graph i.e scalling the graph
  const scaleGraph = () => {
    if (InjSpeedGridData.length > 0) {

      setData(prevData => {
        const validRows = prevData.filter(row => row[0] !== "" && !isNaN(parseFloat(row[0])));
        const emptyFirstColumnRows = prevData.filter(row => row[0] === "" || isNaN(parseFloat(row[0])));

        const sortedValidRows = validRows.sort((a, b) => parseFloat(a[0]) - parseFloat(b[0]));

        return [...sortedValidRows, ...emptyFirstColumnRows];
      });

      let InjectionArray = [],
        FillTimeArray = [],
        ExpectedFillTimeArray = [],
        ActualSpeedArray = [],
        VariationActualSpeedArray = [];

      const CompareInjectionSpeed = (a, b) => {
        return (
          a["Injection Speed (units/sec)"] - b["Injection Speed (units/sec)"]
        );
      };

      const CompareDisplayedFillTime = (a, b) => {
        return a["Displayed Fill Time (sec)"] - b["Displayed Fill Time (sec)"];
      };

      const CompareExpectedFillTime = (a, b) => {
        return (
          a["Expected Calculated Fill Time (sec)"] -
          b["Expected Calculated Fill Time (sec)"]
        );
      };

      const CompareActualSpeed = (a, b) => {
        return (
          a["Actual Calculated Speed (units/sec)"] -
          b["Actual Calculated Speed (units/sec)"]
        );
      };

      const CompareVariationActualSpeed = (a, b) => {
        return (
          a["Variation in actual Speed from set Speed (%)"] -
          b["Variation in actual Speed from set Speed (%)"]
        );
      };

      for (let i = 0; i < InjSpeedGridData.length; i++) {
        if (InjSpeedGridData[i]["Injection Speed (units/sec)"]) {
          InjectionArray.push(InjSpeedGridData[i]);
          FillTimeArray.push(InjSpeedGridData[i]);
          ExpectedFillTimeArray.push(InjSpeedGridData[i]);
          ActualSpeedArray.push(InjSpeedGridData[i]);
          VariationActualSpeedArray.push(InjSpeedGridData[i]);
        }
      }

      if (
        Shot_Size != null &&
        Suck_Back != null &&
        TransferPosition != null &&
        Acceptable_variation != null &&
        InjectionArray.length > 0
      ) {
        InjectionArray.sort(CompareInjectionSpeed);
        FillTimeArray.sort(CompareDisplayedFillTime);
        ExpectedFillTimeArray.sort(CompareExpectedFillTime);
        ActualSpeedArray.sort(CompareActualSpeed);
        VariationActualSpeedArray.sort(CompareVariationActualSpeed);

        const VariationValues = VariationActualSpeedArray.map(
          (item) => item["Variation in actual Speed from set Speed (%)"]
        )

        const sum = VariationValues.reduce((acc, value) => acc + value, 0);

        const average = Number(sum / VariationValues.length).toFixed(3);

        setActual_Range(
          (Math.max(...VariationValues) - Math.min(...VariationValues)).toFixed(3)
        );

        setAverage_Percent_variation(average);

        setInjSpeedArray(InjectionArray);

        setInjectionNiceNumbers(
          calculateNiceNumbers(
            InjectionArray[0]["Injection Speed (units/sec)"],
            InjectionArray[InjectionArray.length - 1][
            "Injection Speed (units/sec)"
            ],
            5
          )
        );

        if (
          FillTimeArray[0]["Displayed Fill Time (sec)"] >
          ExpectedFillTimeArray[0]["Expected Calculated Fill Time (sec)"]
        ) {
          setFillTimeNiceNumbers(
            calculateNiceNumbers(
              ExpectedFillTimeArray[0]["Expected Calculated Fill Time (sec)"],
              FillTimeArray[FillTimeArray.length - 1][
              "Displayed Fill Time (sec)"
              ],
              5
            )
          );
        } else {
          setFillTimeNiceNumbers(
            calculateNiceNumbers(
              FillTimeArray[0]["Displayed Fill Time (sec)"],
              FillTimeArray[FillTimeArray.length - 1][
              "Displayed Fill Time (sec)"
              ],
              5
            )
          );
        }

        let YMin = Math.min(
          ActualSpeedArray[0]["Actual Calculated Speed (units/sec)"],
          InjectionArray[0]["Injection Speed (units/sec)"]
        );

        let YMax = Math.max(
          ActualSpeedArray[ActualSpeedArray.length - 1][
          "Actual Calculated Speed (units/sec)"
          ],
          InjectionArray[InjectionArray.length - 1][
          "Injection Speed (units/sec)"
          ]
        );

        setActualSpeedNiceNumbers(calculateNiceNumbers(YMin, YMax, 5));

      } else {
        ToggleShotAlert();
      }
    }
  };

  const [ToPlotChart, setToPlotChart] = useState(true);

  useEffect(() => {

    const hasValidData = InjSpeedGridData && InjSpeedGridData.length > 0 &&
      InjSpeedGridData.some((value) => 
        value["Injection Speed (units/sec)"] && 
        value["Injection Speed (units/sec)"] !== '' &&
        !isNaN(parseFloat(value["Injection Speed (units/sec)"]))
      );

    const hasRequiredInputs = Shot_Size && Suck_Back && TransferPosition && Acceptable_variation;

    if (ToPlotChart && hasValidData && hasRequiredInputs) {
      scaleGraph();
    }

    // eslint-disable-next-line
  }, [InjSpeedGridData, Shot_Size, Suck_Back, TransferPosition, Acceptable_variation]);

  useEffect(() => {

    const data = {
      session: SessionId,
      Shot_Size: Shot_Size,
      Suck_Back: Suck_Back,
      TransferPosition: TransferPosition,
      Acceptable_variation: Acceptable_variation,
      InjSpeedGridData: InjSpeedGridData,
      Comment: Comment ? Comment : "N/A",
      PrintData: {
        InjectionniceNumbers: InjectionniceNumbers,
        FillTimeNiceNumbers: FillTimeNiceNumbers,
        ActualSpeedNiceNumbers: ActualSpeedNiceNumbers,
        InjSpeedArray: InjSpeedArray,
        Shot_Size: Shot_Size,
        Suck_Back: Suck_Back,
        TransferPosition: TransferPosition,
        Acceptable_variation: Acceptable_variation,
        InjSpeedGridData: InjSpeedGridData,
        Comment: Comment ? Comment : "N/A",
      }
    };

    showAlert.current = true;

    InjSpeedData.current = data;

    // eslint-disable-next-line
  }, [
    Shot_Size,
    Suck_Back,
    TransferPosition,
    Acceptable_variation,
    InjSpeedGridData,
    Comment,
    InjectionniceNumbers
  ]);

  const fixedColumnOrder = [
    "Injection Speed (units/sec)", "Displayed Fill Time (sec)", "Actual Calculated Speed (units/sec)", "Expected Calculated Fill Time (sec)", "Variation in actual Speed from set Speed (%)"
  ]

  // Load data from sessionStorage on mount
  useEffect(() => {
    // Set default session info
    setSession_Id("1");
    setSession_Name("Default Session");
    setMoldId("1");
    setMoldName("Sample Mold");

    // Try to load saved data from sessionStorage
    const savedData = sessionStorage.getItem("InjSpeedData");
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        if (parsedData.Shot_Size) setShot_Size(parsedData.Shot_Size);
        if (parsedData.Suck_Back) setSuck_Back(parsedData.Suck_Back);
        if (parsedData.TransferPosition) setTransferPosition(parsedData.TransferPosition);
        if (parsedData.Acceptable_variation) setAcceptable_variation(parsedData.Acceptable_variation);
        if (parsedData.InjSpeedGridData && parsedData.InjSpeedGridData.length > 0) {
          setInjSpeedGridData(parsedData.InjSpeedGridData);
          ToSaveInjSpeedData.current = false;
          setShowSave(false);
          setRowCount(parsedData.InjSpeedGridData.length);

          const formattedData = parsedData.InjSpeedGridData.map(row =>
            fixedColumnOrder.map(key => row[key] ?? "")
          );
          setData(formattedData);
        }
        if (parsedData.Comment) setComment(parsedData.Comment);
      } catch (e) {
        console.log("Error loading saved data:", e);
      }
    }
    // eslint-disable-next-line
  }, []);

  const GetValues = () => {
    return new Promise((resolve, reject) => {
      let TempArray = [];

      const gridElement = document.querySelector("#Inj_Speed_Sheet");
      if (!gridElement) {
        resolve([]);
        return;
      }

      const computedStyle = window.getComputedStyle(gridElement);
      const isVisible = computedStyle.display !== 'none' && 
                       computedStyle.visibility !== 'hidden' &&
                       gridElement.offsetParent !== null;

      if (!isVisible) {
        resolve([]);
        return;
      }

      const tdElements = document.querySelectorAll("#Inj_Speed_Sheet .e-cell");

      if (tdElements.length === 0) {
        resolve([]);
        return;
      }

      tdElements.forEach((td) => {
        const cellValue = td.textContent;

        if (cellValue) {
          TempArray.push(cellValue);
        } else {
          TempArray.push(null);
        }
      });

      resolve(TempArray);
    });
  };

  const ConvertToJson = (DataArray) => {
    return new Promise((resolve, reject) => {
      let TempArray = [];

      let NumberOfRow = 0;

      for (let i = 0; i < Math.ceil(DataArray.length / 5); i++) {
        TempArray.push({
          "Injection Speed (units/sec)": DataArray[0 + NumberOfRow]
            ? DataArray[0 + NumberOfRow]
            : "",
          "Displayed Fill Time (sec)": DataArray[1 + NumberOfRow]
            ? DataArray[1 + NumberOfRow]
            : "",
          "Actual Calculated Speed (units/sec)": "",
          "Expected Calculated Fill Time (sec)": "",
          "Variation in actual Speed from set Speed (%)": null,
        });

        NumberOfRow = NumberOfRow + 5;
      }

      resolve(TempArray);
    });
  };

  const PerformCalcs = (TabelObjData) => {
    return new Promise((resolve, reject) => {
      let TempArray = [];

      for (let i = 0; i < TabelObjData.length; i++) {
        TempArray.push({
          "Injection Speed (units/sec)": TabelObjData[i][
            "Injection Speed (units/sec)"
          ]
            ? parseFloat(TabelObjData[i]["Injection Speed (units/sec)"])
            : "",

          "Displayed Fill Time (sec)": TabelObjData[i][
            "Displayed Fill Time (sec)"
          ]
            ? parseFloat(TabelObjData[i]["Displayed Fill Time (sec)"])
            : "",

          "Actual Calculated Speed (units/sec)": TabelObjData[i][
            "Displayed Fill Time (sec)"
          ]
            ? parseFloat(
              Number(
                (parseFloat(Shot_Size) +
                  parseFloat(Suck_Back) -
                  parseFloat(TransferPosition)) /
                parseFloat(TabelObjData[i]["Displayed Fill Time (sec)"])
              ).toFixed(4)
            )
            : "",

          "Expected Calculated Fill Time (sec)": TabelObjData[i][
            "Injection Speed (units/sec)"
          ]
            ? parseFloat(
              Number(
                (parseFloat(Shot_Size) +
                  parseFloat(Suck_Back) -
                  parseFloat(TransferPosition)) /
                parseFloat(TabelObjData[i]["Injection Speed (units/sec)"])
              ).toFixed(4)
            )
            : "",

          "Variation in actual Speed from set Speed (%)":
            TabelObjData[i]["Injection Speed (units/sec)"] &&
              TabelObjData[i]["Displayed Fill Time (sec)"]
              ? parseFloat(
                Number(
                  ((parseFloat(
                    TabelObjData[i]["Injection Speed (units/sec)"]
                  ) -
                    parseFloat(
                      Number(
                        (parseFloat(Shot_Size) +
                          parseFloat(Suck_Back) -
                          parseFloat(TransferPosition)) /
                        parseFloat(
                          TabelObjData[i]["Displayed Fill Time (sec)"]
                        )
                      ).toFixed(4)
                    )) /
                    parseFloat(
                      TabelObjData[i]["Injection Speed (units/sec)"]
                    )) *
                  100
                ).toFixed(2)
              )
              : null,
        });
      }

      resolve(TempArray);
    });
  };

  const StoreData = (CalcData) => {

    const isValidData = CalcData.some(row =>
      Object.values(row).some(value => value !== "" && value !== null)
    );

    if (CalcData.length > 0 && isValidData) {

      const formattedData = CalcData.map(row =>
        fixedColumnOrder.map(key => row[key] ?? "")
      );

      setData(formattedData);
    }

  }

  const getData = () => {

    GetValues().then((DataArray) => {
      if (!DataArray || DataArray.length === 0) {
        return;
      }

      const hasValidData = DataArray.some(val => val !== null && val !== undefined && val !== '');
      if (!hasValidData) {
        return;
      }

      ConvertToJson(DataArray).then((TabelObjData) => {
        PerformCalcs(TabelObjData).then((CalcData) => {

          if (CalcData && CalcData.length > 0) {
            const hasValidRows = CalcData.some(row => 
              row["Injection Speed (units/sec)"] && 
              row["Injection Speed (units/sec)"] !== "" &&
              row["Injection Speed (units/sec)"] !== null &&
              !isNaN(parseFloat(row["Injection Speed (units/sec)"]))
            );

            if (hasValidRows) {
              setInjSpeedGridData(CalcData)
              StoreData(CalcData)
              showAlert.current = true
            }
          }
        });
      });
    }).catch(() => {
    });
  };

  const GetInputData = (e) => {

    const { name, value } = e.target

    if (name === "Shot_Size") {
      setShot_Size(value)
      getData()
    }
    if (name === "Suck_Back") {
      setSuck_Back(value)
      getData()
    }
    if (name === "Transfer_Position") {
      setTransferPosition(value)
      getData()
    }
    if (name === "Acceptable_variation") {
      setAcceptable_variation(value)
      getData()
    }

  }

  useEffect(() => {
    getData();
  }, [Shot_Size, Suck_Back, TransferPosition, Acceptable_variation]);

  return (
    <div className="card equipmentDash p-3 ml-2" style={{ backgroundColor: "#e4eae1" }}>
      <Modal isOpen={!ShotSizeAlert} centered={true}>
        <ModalHeader toggle={ToggleShotAlert}>
          Please fill in all required fields before generating graph.
        </ModalHeader>

        <ModalBody>
          <span>
            Please fill in all required fields before generating graph.
          </span>
        </ModalBody>
        <ModalFooter>
          <Button color="dark" onClick={ToggleShotAlert}>
            Close
          </Button>
        </ModalFooter>
      </Modal>
      <div className="b-primary b-r-4 mb-2">
        <section className="m-1">
          <div className="pt-2 pb-2 pr-2 pl-1">
            <div className="d-flex col-md-12 mb-2">
              <div className="col-md-9 d-flex">
                <button
                  className="btn btn-warning btn-air-warning mr-2"
                  type="button"
                  onClick={DeleteGridRow}
                >
                  Delete Row
                </button>
                <AddRow
                  ToggleAddRowModal={ToggleAddRowModal}
                  InjSpeedAddRowModal={InjSpeedAddRowModal}
                  addRow={addRow}
                  increaseRow={increaseRow}
                />
                <button
                  className="btn btn-primary btn-air-primary mr-2"
                  type="button"
                  onClick={handleShow}
                >
                  Comment
                </button>


              </div>

              <div className="d-flex justify-content-end col-md-3">
                <div>
                  <button
                    className="btn btn-primary btn-air-primary mr-2"
                    onClick={scaleGraph}
                  >
                    Show Graph
                  </button>
                </div>
                <Modal isOpen={show} centered>
                  <ModalHeader toggle={handleClose}>Add Comment</ModalHeader>
                  <ModalBody>
                    <RichTextEditorComponent
                      change={getComment}
                      value={Comment}
                      saveInterval="1"
                      toolbarSettings={toolbarSettings}
                      height={250}
                    >
                      <Inject services={[Toolbar, HtmlEditor]} />
                    </RichTextEditorComponent>
                  </ModalBody>
                  <ModalFooter>
                    <Button color="dark" onClick={handleClose}>
                      Save & Close
                    </Button>
                  </ModalFooter>
                </Modal>
              </div>
            </div>
          </div>

          <div className="d-flex">
            <div
              className="mt-2 mb-2 ml-2 mr-0 col-md-6"
              style={{ width: "50%" }}
            >
              <div>
                <div onClick={() => setToPlotChart(false)}>
                  <InjSpeedGrid data={data} setData={setData} getData={getData} setRowToBeDeleted={setRowToBeDeleted} />
                </div>
                <div className="mt-4 mb-2">
                  <ChartComponent
                    className="equipmentChart"
                    width="100%"
                    height="300"
                    border={{ width: 1, color: "darkblue" }}
                    tooltip={{ enable: true }}
                    primaryXAxis={{
                      title: `Injection Speed (units/sec)`,
                      minimum: InjectionniceNumbers.min,
                      maximum: InjectionniceNumbers.max,
                      interval: InjectionniceNumbers.step,
                      lineStyle: { color: "black" },
                      labelStyle: { color: "#000" },
                    }}
                    primaryYAxis={{
                      minimum: FillTimeNiceNumbers.min,
                      maximum: FillTimeNiceNumbers.max,
                      interval: FillTimeNiceNumbers.step,
                      lineStyle: { color: "black" },
                      labelStyle: { color: "#000" },
                    }}
                  >
                    <Inject
                      services={[
                        LineSeries,
                        Category,
                        DataLabel,
                        StripLine,
                        Legend,
                        Tooltip,
                      ]}
                    />

                    <SeriesCollectionDirective>
                      <SeriesDirective
                        dataSource={InjSpeedArray}
                        type="Line"
                        xName="Injection Speed (units/sec)"
                        yName="Expected Calculated Fill Time (sec)"
                        marker={{ visible: true }}
                        fill="orange"
                        width={2.5}
                        name="Expected Calculated Fill Time (sec)"
                      ></SeriesDirective>

                      <SeriesDirective
                        dataSource={InjSpeedArray}
                        type="Line"
                        xName="Injection Speed (units/sec)"
                        yName="Displayed Fill Time (sec)"
                        marker={{ visible: true }}
                        fill="blue"
                        width={2.5}
                        name="Displayed Fill Time (sec)"
                      ></SeriesDirective>
                    </SeriesCollectionDirective>
                  </ChartComponent>
                </div>
              </div>
            </div>

            <div className="mt-2 mb-2 col-md-6" style={{ width: "50%" }}>
              <div
                className="col-md-12 b-primary"
                style={{ paddingLeft: 0, backgroundColor: "#f3fbef", height:"35vh" }}
              >
                <Table
                  className="table table-responsive table-borderless"
                >
                  <tbody>
                  <tr>
                    <td
                      style={{
                        padding: 9,
                        verticalAlign: "top",
                        backgroundColor: "#f3fbef",
                      }}
                    >
                      Shot Size*:
                    </td>
                    <td
                      style={{
                        padding: 9,
                        verticalAlign: "top",
                        backgroundColor: "#f3fbef",
                      }}
                    >
                      <input
                        className="form-control"
                        onChange={GetInputData}
                        name="Shot_Size"
                        defaultValue={Shot_Size}
                        onPaste={(event) => {
                          const pastedData = event.clipboardData.getData("text");
                          if (/[a-zA-Z]/.test(pastedData)) {
                            event.preventDefault();
                          }
                        }}
                        onKeyPress={(event) => {
                          if (!/[-0.0-9.0]/.test(event.key)) {
                            event.preventDefault();
                          }
                        }}
                        type="text"
                      />
                    </td>
                  </tr>

                  <tr>
                    <td
                      style={{
                        padding: 9,
                        verticalAlign: "top",
                        backgroundColor: "#f3fbef",
                      }}
                    >
                      Suck Back*:
                    </td>
                    <td
                      style={{
                        padding: 9,
                        verticalAlign: "top",
                        backgroundColor: "#f3fbef",
                      }}
                    >
                      <input
                        className="form-control"
                        onChange={GetInputData}
                        name="Suck_Back"
                        defaultValue={Suck_Back}
                        onPaste={(event) => {
                          const pastedData = event.clipboardData.getData("text");
                          if (/[a-zA-Z]/.test(pastedData)) {
                            event.preventDefault();
                          }
                        }}
                        onKeyPress={(event) => {
                          if (!/[-0.0-9.0]/.test(event.key)) {
                            event.preventDefault();
                          }
                        }}
                        type="text"
                      />
                    </td>
                  </tr>

                  <tr>
                    <td
                      style={{
                        padding: 9,
                        verticalAlign: "top",
                        backgroundColor: "#f3fbef",
                      }}
                    >
                      Transfer Position*:
                    </td>
                    <td
                      style={{
                        padding: 9,
                        verticalAlign: "top",
                        backgroundColor: "#f3fbef",
                      }}
                    >
                      <input
                        className="form-control"
                        onChange={GetInputData}
                        name="Transfer_Position"
                        defaultValue={TransferPosition}
                        onPaste={(event) => {
                          const pastedData = event.clipboardData.getData("text");
                          if (/[a-zA-Z]/.test(pastedData)) {
                            event.preventDefault();
                          }
                        }}
                        type="text"
                        onKeyPress={(event) => {
                          if (!/[0.0-9.0]/.test(event.key)) {
                            event.preventDefault();
                          }
                        }}
                      />
                    </td>
                  </tr>

                  <tr>
                    <td
                      style={{
                        padding: 9,
                        verticalAlign: "top",
                        backgroundColor: "#f3fbef",
                      }}
                    >
                      Acceptable Variation in Injection Speed (%)*:
                    </td>
                    <td
                      style={{
                        padding: 9,
                        verticalAlign: "top",
                        backgroundColor: "#f3fbef",
                      }}
                    >
                      <input
                        className="form-control"
                        onChange={GetInputData}
                        name="Acceptable_variation"
                        defaultValue={Acceptable_variation}
                        onPaste={(event) => {
                          const pastedData = event.clipboardData.getData("text");
                          if (/[a-zA-Z]/.test(pastedData)) {
                            event.preventDefault();
                          }
                        }}
                        onKeyPress={(event) => {
                          if (!/[0-9]/.test(event.key)) {
                            event.preventDefault();
                          }
                        }}
                        type="text"
                      />
                    </td>
                  </tr>

                  <tr>
                    <td
                      style={{
                        padding: 9,
                        verticalAlign: "top",
                        backgroundColor: "#f3fbef",
                      }}
                    >
                      Average Percentage Difference*:
                    </td>
                    <td
                      style={{
                        padding: 9,
                        verticalAlign: "top",
                        backgroundColor: "#f3fbef",
                      }}
                    >
                      <input
                        style={{
                          backgroundColor:
                            Average_Percent_variation === null
                              ? "white"
                              : parseFloat(Average_Percent_variation) <= 5
                                ? "lightgreen"
                                : parseFloat(Average_Percent_variation) >= 5 &&
                                  parseFloat(Average_Percent_variation) <= 10
                                  ? "yellow"
                                  : "red",
                        }}
                        className="form-control"
                        defaultValue={Average_Percent_variation}
                        onKeyPress={(event) => {
                          if (!/[-0.0-9.0]/.test(event.key)) {
                            event.preventDefault();
                          }
                        }}
                        type="text"
                        readOnly
                      />
                    </td>
                  </tr>

                  <tr>
                    <td
                      style={{
                        padding: 11,
                        verticalAlign: "top",
                        backgroundColor: "#f3fbef",
                      }}
                    >
                      Actual Range of Linearity*:
                    </td>
                    <td
                      style={{
                        padding: 11,
                        verticalAlign: "top",
                        backgroundColor: "#f3fbef",
                      }}
                    >
                      <input
                        className="form-control"
                        defaultValue={Actual_Range}
                        onKeyPress={(event) => {
                          if (!/[-0.0-9.0]/.test(event.key)) {
                            event.preventDefault();
                          }
                        }}
                        type="text"
                        readOnly
                      />
                    </td>
                  </tr>
                  </tbody>
                </Table>


              </div>

              <div>
                <div className="mt-4 mb-2 ">
                  <ChartComponent
                    className="equipmentChart"
                    width="100%"
                    height="300"
                    border={{ width: 1, color: "darkblue" }}
                    tooltip={{ enable: true }}
                    title="Actual Vs. Set Velocities"
                    primaryXAxis={{
                      title: `Injection Velocity Setpoint`,
                      minimum: InjectionniceNumbers.min,
                      maximum: InjectionniceNumbers.max,
                      interval: InjectionniceNumbers.step,
                      lineStyle: { color: "black" },
                      labelStyle: { color: "#000" },
                    }}
                    primaryYAxis={{
                      title: "Actual Velocity",
                      minimum: ActualSpeedNiceNumbers.min,
                      maximum: ActualSpeedNiceNumbers.max,
                      interval: ActualSpeedNiceNumbers.step,
                      lineStyle: { color: "black" },
                      labelStyle: { color: "#000" },
                    }}
                  >
                    <Inject
                      services={[
                        LineSeries,
                        Category,
                        DataLabel,
                        StripLine,
                        Legend,
                        Tooltip,
                      ]}
                    />

                    <SeriesCollectionDirective>
                      <SeriesDirective
                        dataSource={InjSpeedArray}
                        type="Line"
                        xName="Injection Speed (units/sec)"
                        yName="Actual Calculated Speed (units/sec)"
                        marker={{ visible: true }}
                        fill="blue"
                        width={2.5}
                        name="Actual Calculated Speed (units/sec)"
                      ></SeriesDirective>

                      <SeriesDirective
                        dataSource={InjSpeedArray}
                        type="Line"
                        xName="Injection Speed (units/sec)"
                        yName="Injection Speed (units/sec)"
                        marker={{ visible: true }}
                        fill="orange"
                        width={2.5}
                        name="Injection Speed (units/sec)"
                      ></SeriesDirective>
                    </SeriesCollectionDirective>
                  </ChartComponent>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default InjSpeed;
