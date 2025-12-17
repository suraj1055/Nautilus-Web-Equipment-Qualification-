import { useState, useEffect } from "react";
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
  Tooltip,
} from "@syncfusion/ej2-react-charts";
import AddRow from "./AddRow";
import {
  HtmlEditor,
  RichTextEditorComponent,
  Toolbar,
} from "@syncfusion/ej2-react-richtexteditor";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import { Button } from "reactstrap";
import LoadSensitivityGrid from "./LoadSensitivityGrid";

const LoadSensitivity = ({ showAlert, ToSaveLoadData, LoadData }) => {

  // To store the session Id
  const [SessionId, setSessionId] = useState("1");

  const [Pressure_Units, setPressure_Units] = useState("psi");

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

  const [LoadGridData, setLoadGridData] = useState([]);

  const [rowCount, setRowCount] = useState(10);

  const [rowToBeDeleted, setRowToBeDeleted] = useState();

  // Boolean variable to switch between the save and update button
  const [showSave, setShowSave] = useState(true);

  // As the user enter's the number of row's it get's set in this variable.
  const [row, setRow] = useState(5);

  // Set's the visibility of the modal which we use to get the number of row's to be generated
  const [LoadRowAddModal, setLoadRowAddModal] = useState();

  const ToggleAddRowModal = () => {
    setLoadRowAddModal(!LoadRowAddModal);
  };

  let [data, setData] = useState(
    Array.from({ length: 10 }, () => Array(6).fill(""))
  )

  // This is the event to do the above said thing.
  const addRow = (e) => {
    e.preventDefault();

    // Storing the number entered
    setRow(e.target.value);
  };

  // This is the event which gets called as the user click's ok in the add row modal and increases the row count.
  const increaseRow = () => {
    // Updating the total rows variable
    setRowCount(parseInt(rowCount) + parseInt(row));

    setAlert(true);

    setRow(null);
  };

  // This is the event which deletes the row
  const deleteRow2 = (id) => {
    if (LoadGridData.length !== 1) {

      const newData = [...data];

      newData.splice(rowToBeDeleted, 1);

      setData(newData);

      LoadGridData.splice(rowToBeDeleted, 1);

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

  const handlePressureUnits = (e) => {
    e.preventDefault();

    if (e.target.value) {
      setPressure_Units(e.target.value);
    } else {
      setPressure_Units("%Kpsi");
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
    min: null,
    max: null,
    step: null,
  });

  const [LoadNiceNumbers, setLoadNiceNumbers] = useState({
    min: null,
    max: null,
    step: null,
  });

  // Event to set the Min, Max and Interval of graph i.e scalling the graph
  const scaleGraph = () => {
    if (LoadGridData && LoadGridData.length > 0) {

      setData(prevData => {
        const validRows = prevData.filter(row => row[0] !== "" && !isNaN(parseFloat(row[0])));
        const emptyFirstColumnRows = prevData.filter(row => row[0] === "" || isNaN(parseFloat(row[0])));

        const sortedValidRows = validRows.sort((a, b) => parseFloat(a[0]) - parseFloat(b[0]));

        return [...sortedValidRows, ...emptyFirstColumnRows];
      });

      let InjectionArray = [],
        LoadArray = [];

      const CompareInjectionSpeed = (a, b) => {
        return a["Injection Speed"] - b["Injection Speed"];
      };

      const CompareLoad = (a, b) => {
        return (
          parseFloat(a["Load Sensitivity"]) - parseFloat(b["Load Sensitivity"])
        );
      };

      for (let i = 0; i < LoadGridData.length; i++) {
        if (LoadGridData[i]["Injection Speed"]) {
          InjectionArray.push(LoadGridData[i]);
          LoadArray.push(LoadGridData[i]);
        }
      }

      InjectionArray.sort(CompareInjectionSpeed);
      LoadArray.sort(CompareLoad);

      let FiniteLoadArray = LoadArray.filter((val) => {
        return isFinite(val["Load Sensitivity"])
      })

      let InjectionFiniteArray = InjectionArray.filter((val) => {
        return isFinite(val["Load Sensitivity"])
      })

      setInjSpeedArray(InjectionFiniteArray);

      if (InjectionArray?.length > 0 && InjectionArray[0]["Injection Speed"] !== undefined) {
        let Xmargin =
          ((InjectionArray[InjectionArray.length - 1]["Injection Speed"] -
            InjectionArray[0]["Injection Speed"]) /
            100) *
          5;

        if (
          InjectionArray[0]["Injection Speed"] !==
          InjectionArray[InjectionArray.length - 1]["Injection Speed"]
        ) {
          setInjectionNiceNumbers(
            calculateNiceNumbers(
              InjectionArray[0]["Injection Speed"] - Xmargin,
              InjectionArray[InjectionArray.length - 1]["Injection Speed"] + Xmargin,
              5
            )
          );
        }
      }
    }
  };

  const [ToPlotChart, setToPlotChart] = useState(true);

  useEffect(() => {
    if (ToPlotChart) scaleGraph();

    // eslint-disable-next-line
  }, [LoadGridData]);

  useEffect(() => {
    const data = {
      session: SessionId,
      LoadGridData: [LoadGridData, Pressure_Units],
      Comment: Comment ? Comment : "N/A",
      PrintData: {
        LoadGridData: [LoadGridData, Pressure_Units],
        Comment: Comment ? Comment : "N/A",
        InjectionniceNumbers: InjectionniceNumbers,
        LoadNiceNumbers: LoadNiceNumbers,
        Pressure_Units: Pressure_Units,
        InjSpeedArray: InjSpeedArray,
      }
    };

    showAlert.current = true;

    LoadData.current = data;

    // eslint-disable-next-line
  }, [LoadGridData, Comment, Pressure_Units, LoadNiceNumbers]);

  const fixedColumnOrder = [
    "Injection Speed", "Fill Time - In Mold (sec)", "Peak Press at Transfer - In Mold", "Fill Time - Air Shot (sec)", "Peak Press at Transfer - Air Shot", "Load Sensitivity"
  ]

  // Load data from sessionStorage on mount
  useEffect(() => {
    const savedData = sessionStorage.getItem("LoadData");
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        if (parsedData.LoadGridData && parsedData.LoadGridData[0]) {
          setLoadGridData(parsedData.LoadGridData[0]);
          ToSaveLoadData.current = false;
          setShowSave(false);

          if (parsedData.LoadGridData[0].length > 0) {
            const formattedData = parsedData.LoadGridData[0].map(row =>
              fixedColumnOrder.map(key => row[key] ?? "")
            );
            setData(formattedData);
          }
        }
        if (parsedData.LoadGridData && parsedData.LoadGridData[1]) {
          setPressure_Units(parsedData.LoadGridData[1]);
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

      let TempArray = []

      const tdElements = document.querySelectorAll('#Load_Sensitivity_Sheet .e-cell');

      tdElements.forEach(td => {

        const cellValue = td.textContent;

        if (cellValue) {
          TempArray.push(cellValue);
        } else {
          TempArray.push('');
        }

      });

      resolve(TempArray)

    })

  }

  const ConvertToJson = (DataArray) => {

    return new Promise((resolve, reject) => {

      let TempArray = [];

      let NumberOfRow = 0;

      for (let i = 0; i < Math.ceil(DataArray.length / 6); i++) {

        TempArray.push({

          "Injection Speed": DataArray[0 + NumberOfRow] ? parseFloat(DataArray[0 + NumberOfRow]) : '',
          "Fill Time - In Mold (sec)": DataArray[1 + NumberOfRow] ? parseFloat(DataArray[1 + NumberOfRow]) : '',
          "Peak Press at Transfer - In Mold": DataArray[2 + NumberOfRow] ? parseFloat(DataArray[2 + NumberOfRow]) : '',
          "Fill Time - Air Shot (sec)": DataArray[3 + NumberOfRow] ? parseFloat(DataArray[3 + NumberOfRow]) : '',
          "Peak Press at Transfer - Air Shot": DataArray[4 + NumberOfRow] ? parseFloat(DataArray[4 + NumberOfRow]) : '',
          "Load Sensitivity": '',

        })

        NumberOfRow = NumberOfRow + 6

      }

      resolve(TempArray)

    })

  }

  const PerformCalcs = (TabelObjData) => {

    return new Promise((resolve, reject) => {

      let TempArray = [];

      for (let i = 0; i < TabelObjData.length; i++) {

        TempArray.push({

          "Injection Speed": TabelObjData[i]["Injection Speed"] ? TabelObjData[i]["Injection Speed"] : '',

          "Fill Time - In Mold (sec)": TabelObjData[i]["Fill Time - In Mold (sec)"] ? TabelObjData[i]["Fill Time - In Mold (sec)"] : '',

          "Peak Press at Transfer - In Mold": TabelObjData[i]["Peak Press at Transfer - In Mold"] ? TabelObjData[i]["Peak Press at Transfer - In Mold"] : '',

          "Fill Time - Air Shot (sec)": TabelObjData[i]["Fill Time - Air Shot (sec)"] ? TabelObjData[i]["Fill Time - Air Shot (sec)"] : '',

          "Peak Press at Transfer - Air Shot": TabelObjData[i]["Peak Press at Transfer - Air Shot"] ? TabelObjData[i]["Peak Press at Transfer - Air Shot"] : '',

          "Load Sensitivity": isNaN((TabelObjData[i]["Fill Time - In Mold (sec)"] - TabelObjData[i]["Fill Time - Air Shot (sec)"]) / TabelObjData[i]["Fill Time - In Mold (sec)"] * 100) / ((TabelObjData[i]["Peak Press at Transfer - In Mold"] - TabelObjData[i]["Peak Press at Transfer - Air Shot"]) / 1000) ?
            '-'
            :
            parseFloat(Number(((TabelObjData[i]["Fill Time - In Mold (sec)"] - TabelObjData[i]["Fill Time - Air Shot (sec)"])
              /
              TabelObjData[i]["Fill Time - In Mold (sec)"] * 100) / ((TabelObjData[i]["Peak Press at Transfer - In Mold"] - TabelObjData[i]["Peak Press at Transfer - Air Shot"]) / 1000)).toFixed(5)),

        })

      }

      resolve(TempArray)

    })

  }

  const ConvertUnits = (CalcData) => {

    return new Promise((resolve, reject) => {

      for (let i = 0; i < CalcData.length; i++) {

        if (Pressure_Units === "ppsi (Plastic Pressure)") {

          CalcData[i]["Load Sensitivity"] = isNaN(parseFloat(Number(10 * parseFloat(CalcData[i]["Load Sensitivity"])).toFixed(6))) ? '-' : parseFloat(Number(10 * parseFloat(CalcData[i]["Load Sensitivity"])).toFixed(4))

        }
        else if (Pressure_Units === "Bar") {

          CalcData[i]["Load Sensitivity"] = isNaN(parseFloat(Number(parseFloat(CalcData[i]["Load Sensitivity"])).toFixed(6))) ? '-' : parseFloat(Number(parseFloat(CalcData[i]["Load Sensitivity"]) / 1000).toFixed(4))

        }
        else if (Pressure_Units === "Mpa") {

          CalcData[i]["Load Sensitivity"] = isNaN(parseFloat(Number(parseFloat(CalcData[i]["Load Sensitivity"])).toFixed(6))) ? '-' : parseFloat(Number(parseFloat(CalcData[i]["Load Sensitivity"]) / 1000).toFixed(4))

        }
        else {

          CalcData[i]["Load Sensitivity"] = isNaN(parseFloat(CalcData[i]["Load Sensitivity"])) ? '-' : parseFloat(CalcData[i]["Load Sensitivity"])

        }

      }

      resolve(CalcData)

    })

  }

  const StoreData = (ConvertedData) => {

    const isValidData = ConvertedData.some(row =>
      Object.values(row).some(value => value !== "" && value !== null)
    );

    if (ConvertedData.length > 0 && isValidData) {

      const formattedData = ConvertedData.map(row =>
        fixedColumnOrder.map(key => row[key] ?? "")
      );

      setData(formattedData);

    }

  }

  const GetDataFromSheet = () => {

    return new Promise((resolve, reject) => {

      GetValues().then((DataArray) => {

        ConvertToJson(DataArray).then((TabelObjData) => {

          PerformCalcs(TabelObjData).then((CalcData) => {

            ConvertUnits(CalcData).then((ConvertedData) => {

              setLoadGridData(ConvertedData)

              StoreData(ConvertedData)

              showAlert.current = true

              resolve()

            })

          })

        })

      })

    })

  }

  const PlotChart = () => {

    GetDataFromSheet().then(() => {

      scaleGraph()

    })

  }

  return (
    <div className="card equipmentDash p-3 ml-2 mt-4" style={{ backgroundColor: "#e4eae1" }}>
      <section className="b-primary b-r-4 mb-2">
        <div className="m-1">
          <div className="pt-2 pb-2 pr-2 pl-1">

            <div className="d-flex col-md-12 mb-2">

              <div className="m-0 d-flex col-md-9">
                <button
                  className="btn btn-warning btn-air-warning mr-2"
                  type="button"
                  onClick={deleteRow2}
                >
                  Delete Row
                </button>
                <AddRow
                  ToggleAddRowModal={ToggleAddRowModal}
                  LoadRowAddModal={LoadRowAddModal}
                  addRow={addRow}
                  increaseRow={increaseRow}
                />

                <div>
                  <label htmlFor="Temp_Units" className="lbl_design mt-1">
                    Pressure Units:
                  </label>
                </div>
                <div>
                  <select
                    className="ml-2 form-control mr-2"
                    style={{ width: "150px" }}
                    onChange={handlePressureUnits}
                    name="Back_Press_Units"
                    value={Pressure_Units}
                  >
                    <option> psi </option>
                    <option> Bar </option>
                    <option> Mpa </option>
                  </select>
                </div>

                <div>
                  <button
                    className="btn btn-primary btn-air-primary mr-2"
                    type="button"
                    onClick={handleShow}
                  >
                    Comment
                  </button>
                </div>

              </div>

              <div className="d-flex justify-content-end col-md-3">


                <button
                  className="btn btn-primary btn-air-primary mr-2"
                  onClick={PlotChart}
                >
                  Show Graph
                </button>

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

          <div>
            <div className="m-2 col-md-12">
              <div onClick={() => setToPlotChart(false)}>
                <LoadSensitivityGrid data={data} setData={setData} GetDataFromSheet={GetDataFromSheet} setRowToBeDeleted={setRowToBeDeleted} Pressure_Units={Pressure_Units} LoadGridData={LoadGridData} />

              </div>

              <div className="mt-1">
                <ChartComponent
                  id="charts"
                  className="equipmentChartGrid mt-3"
                  width="100%"
                  border={{ width: 1, color: "darkblue" }}
                  tooltip={{ enable: true }}
                  height="250"
                  primaryXAxis={{
                    title: `Injection Speed`,
                    minimum: InjectionniceNumbers.min,
                    maximum: InjectionniceNumbers.max,
                    interval: InjectionniceNumbers.step,
                    lineStyle: { color: "black" },
                    labelStyle: { color: "#000" },
                  }}
                  primaryYAxis={{
                    title: `Load Sensitivity`,
                    minimum: LoadNiceNumbers.min,
                    maximum: LoadNiceNumbers.max,
                    interval: LoadNiceNumbers.step,
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
                      Tooltip,
                    ]}
                  />

                  <SeriesCollectionDirective>
                    <SeriesDirective
                      dataSource={InjSpeedArray}
                      type="Line"
                      xName="Injection Speed"
                      yName="Load Sensitivity"
                      marker={{ visible: true }}
                      fill="orange"
                      width={2.5}
                    ></SeriesDirective>
                  </SeriesCollectionDirective>
                </ChartComponent>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LoadSensitivity;
