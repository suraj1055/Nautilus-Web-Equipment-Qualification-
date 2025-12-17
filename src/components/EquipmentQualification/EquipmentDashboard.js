import React, { useState, useRef, useEffect } from "react";
// Tab view component from syncfusion to navigate through six steps study
import {
  TabComponent,
  TabItemDirective,
  TabItemsDirective,
} from "@syncfusion/ej2-react-navigations";
import { connect } from "react-redux";
import { setHeaderTitle } from "../../actions/header";
import { ToastContainer, toast } from "react-toastify";
import InjSpeed from "./Inj_Speed_Linearity/InjSpeed";
import ShotRepeatability from "./Shot_Repeatability_Study/ShotRepeatability";
import LoadSensitivity from "./Load_Sensitivity_Test/LoadSensitivity";

import { Button } from "reactstrap";

import EquipQualReport from "./Report/EquipQualReport";

import { Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";

const EquipmentDashboard = ({ setHeaderTitle }) => {

  useEffect(() => {
    setHeaderTitle("Equipment Qualification");
  }, [setHeaderTitle]);

  const [MoldId, setMoldId] = useState("1");
  const [MoldName, setMoldName] = useState("Sample Mold");
  const [Session_Name, setSession_Name] = useState("Default Session");
  const [Session_Id, setSession_Id] = useState("1");

  // Declare the names of the tab's
  let headertext = [
    { text: "Inj Speed Linearity" },
    { text: "Shot Repeatability Study" },
    { text: "Load Sensitivity Test" },
  ];

  // eslint-disable-next-line
  const showAlert = useRef(false);

  // Boolean variable to switch between the save and update button
  const ToSaveInjSpeedData = useRef(true);
  const ToSaveShotData = useRef(true);
  const ToSaveLoadData = useRef(true);

  const InjSpeedData = useRef([]);
  const ShotData = useRef([]);
  const LoadData = useRef([]);

  // This function will be called when the user clicks on the save button of the study
  const SavedModal = () => {
    saveData().then(() => {
      const saveddialogBox = document.getElementById("SaveddialogBox");
      saveddialogBox.classList.remove("hidden");
    });
  };

  // Event to close the dialog which will be shown after saving
  const closeSavedDialog = () => {
    const saveddialogBox = document.getElementById("SaveddialogBox");
    saveddialogBox.classList.add("hidden");
  };

  // Event to save data locally (no backend API calls)
  const saveData = () => {
    return new Promise((resolve) => {
      // Store data in sessionStorage for persistence during the session
      if (InjSpeedData.current) {
        sessionStorage.setItem("InjSpeedData", JSON.stringify(InjSpeedData.current));
        ToSaveInjSpeedData.current = false;
        showAlert.current = false;
      }

      if (ShotData.current) {
        sessionStorage.setItem("ShotData", JSON.stringify(ShotData.current));
        ToSaveShotData.current = false;
        showAlert.current = false;
      }

      if (LoadData.current) {
        sessionStorage.setItem("LoadData", JSON.stringify(LoadData.current));
        ToSaveLoadData.current = false;
        showAlert.current = false;
      }

      toast.success("Data saved locally!", { autoClose: 2000 });
      resolve();
    });
  };

  useEffect(() => {
    sessionStorage.removeItem("SelectedMoldData");
  }, []);

  const [ShowPrintPart, setShowPrintPart] = useState(false);

  // These are the event's which will get called when clicked on the respective step's tab
  function content0() {
    return (
      <div>
        <InjSpeed
          setSession_Id={setSession_Id}
          setSession_Name={setSession_Name}
          setMoldId={setMoldId}
          setMoldName={setMoldName}
          showAlert={showAlert}
          ToSaveInjSpeedData={ToSaveInjSpeedData}
          InjSpeedData={InjSpeedData}
        />
      </div>
    );
  }

  function content1() {
    return (
      <div className="mt-4">
        <ShotRepeatability
          showAlert={showAlert}
          ShotData={ShotData}
          ToSaveShotData={ToSaveShotData}
        />
      </div>
    );
  }

  function content2() {
    return (
      <div>
        <LoadSensitivity
          showAlert={showAlert}
          ToSaveLoadData={ToSaveLoadData}
          LoadData={LoadData}
        />
      </div>
    );
  }

  const [showPrintPopup, setShowPrintPopup] = useState(false);

  // Which sections are selected for printing
  const [selectedPrintSections, setSelectedPrintSections] = useState({
    InjSpeed: false,
    ShotRepeatability: false,
    LoadSensitivity: false
  });

  // Check/uncheck all
  const toggleSelectAll = (checked) => {
    setSelectedPrintSections({
      InjSpeed: checked,
      ShotRepeatability: checked,
      LoadSensitivity: checked
    });
  };

  const handlePrintViewer = () => {
    saveData().then(() => {
      setShowPrintPopup(true);
    });
  };

  const handlePrintConfirmed = () => {
    saveData().then(() => {
      setShowPrintPopup(false);
      setShowPrintPart(true);
    });
  };

  return (
    <>
      <Modal isOpen={showPrintPopup} toggle={() => setShowPrintPopup(false)}>
        <ModalHeader toggle={() => setShowPrintPopup(false)}>
          Select Report
        </ModalHeader>

        <ModalBody>
          <div className="mb-2">
            <label>
              <input
                type="checkbox"
                checked={
                  selectedPrintSections.InjSpeed &&
                  selectedPrintSections.ShotRepeatability &&
                  selectedPrintSections.LoadSensitivity
                }
                onChange={(e) => toggleSelectAll(e.target.checked)}
              />
              &nbsp; <strong>Select / Deselect All</strong>
            </label>
          </div>

          {/* List of checkboxes */}
          <div className="print-options d-flex flex-column">
            <label>
              <input
                type="checkbox"
                checked={selectedPrintSections.InjSpeed}
                onChange={(e) =>
                  setSelectedPrintSections((p) => ({
                    ...p, InjSpeed: e.target.checked
                  }))
                }
              />
              &nbsp; 1 - Inj Speed Linearity
            </label>

            <label>
              <input
                type="checkbox"
                checked={selectedPrintSections.ShotRepeatability}
                onChange={(e) =>
                  setSelectedPrintSections((p) => ({
                    ...p, ShotRepeatability: e.target.checked
                  }))
                }
              />
              &nbsp; 2 - Shot Repeatability Study
            </label>

            <label>
              <input
                type="checkbox"
                checked={selectedPrintSections.LoadSensitivity}
                onChange={(e) =>
                  setSelectedPrintSections((p) => ({
                    ...p, LoadSensitivity: e.target.checked
                  }))
                }
              />
              &nbsp; 3 - Load Sensitivity Test
            </label>
          </div>
        </ModalBody>

        <ModalFooter>
          <Button color="primary" onClick={handlePrintConfirmed}>OK</Button>
          <Button color="secondary" onClick={() => setShowPrintPopup(false)}>Cancel</Button>
        </ModalFooter>
      </Modal>

      {/* To show when data is saved, when clicked on saved button */}
      <div id="SaveddialogBox" className="hidden">
        <h5> Saved Successfully. </h5>
        <hr></hr>
        <div className="dialog-content">
          <Button
            className="mr-1"
            id="closeDialogBtn"
            onClick={closeSavedDialog}
          >
            Close
          </Button>
        </div>
      </div>

      <div className="container-fluid">
        <div className="d-flex justify-content-between ml-3 pt-3 pb-3">
          <div className="d-flex">
            <div>
              <span style={{ fontSize: "14px", fontWeight: "bold" }}>
                Equipment Qualification
              </span>
            </div>
          </div>

          <div className="d-flex mr-4" style={{ border: "1px solid #808080" }}>
            <div className="pl-1 pr-1">
              <span>
                Session Name:
                <span style={{ fontSize: "15px", fontWeight: "bold", color: "#3f5e55" }}> {Session_Name} </span>
              </span>
            </div>
          </div>
        </div>

        <div className="d-flex">
          <div className={ShowPrintPart ? "col-md-12" : "col-md-10"}>
            {/* This is Syncfusion Tab control */}
            {!ShowPrintPart ? (
              <TabComponent heightAdjustMode="Auto" id="defaultTab">
                <TabItemsDirective>
                  <TabItemDirective header={headertext[0]} content={content0} />
                  <TabItemDirective header={headertext[1]} content={content1} />
                  <TabItemDirective header={headertext[2]} content={content2} />
                </TabItemsDirective>
              </TabComponent>
            ) : (
              <EquipQualReport
                setSession_Id={setSession_Id}
                setSession_Name={setSession_Name}
                setMoldId={setMoldId}
                setMoldName={setMoldName}
                MoldName={MoldName}
                SessionName={Session_Name}
                selectedPrintSections={selectedPrintSections}
                onClose={() => setShowPrintPart(false)}
              />
            )}
          </div>
          {!ShowPrintPart && (
            <div className="col-md-2 text-right">
              <button
                className="btn btn-secondary btn-air-secondary m-0"
                type="button"
                onClick={SavedModal}
              >
                Save
              </button>

              <button
                className="btn btn-secondary btn-air-secondary mr-2 ml-2"
                type="button"
                onClick={handlePrintViewer}
              >
                Print
              </button>
            </div>
          )}
        </div>

        <ToastContainer />
      </div>
    </>
  );
};

export default connect(null, { setHeaderTitle })(EquipmentDashboard);
