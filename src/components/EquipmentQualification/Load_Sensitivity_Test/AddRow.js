import React from "react";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";

const AddRow = ({
  ToggleAddRowModal,
  LoadRowAddModal,
  addRow,
  increaseRow,
}) => {
  const handleSubmit = () => {
    increaseRow();
    ToggleAddRowModal();
  };

  return (
    <div className="btn-showcase">
      <Modal
        isOpen={LoadRowAddModal}
        toggle={ToggleAddRowModal}
        centered={true}
        backdrop="static"
        keyboard={false}
      >
        <ModalHeader toggle={ToggleAddRowModal}>Add Row</ModalHeader>
        <ModalBody>
          <form autoComplete="off">
            <div className="row">
              <div className="col-md-12">
                <div className="row">
                  <div className="col-md-4">
                    <div className="form-group">
                      <label htmlFor="add-column" className="lbl_style">
                        Enter Number Of Rows:{" "}
                      </label>
                    </div>
                  </div>
                  <div className="col-md-8">
                    <input
                      className="form-control"
                      onKeyPress={(event) => {
                        if (!/[0-9]/.test(event.key)) {
                          event.preventDefault();
                        }
                      }}
                      onPaste={(e) => {
                        e.preventDefault();
                        return false;
                      }}
                      type="text"
                      placeholder="Enter Number Of Rows"
                      name="rows"
                      onChange={addRow}
                    />
                  </div>
                </div>
              </div>
            </div>
          </form>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={handleSubmit}>
            {" "}
            Add{" "}
          </Button>
          <Button color="fourth" onClick={ToggleAddRowModal}>
            {" "}
            Cancel{" "}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default AddRow;
