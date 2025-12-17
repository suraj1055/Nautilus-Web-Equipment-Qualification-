import React from "react";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";

const EditColumnHeader = ({
  EditHeaderModal,
  toggleEditHeaderModal,
  setHeader1,
  setHeader2,
  setHeader3,
  Header1,
  Header2,
  Header3,
  RenderHeaders,
  EmptyHeaderError,
}) => {
  return (
    <div className="btn-showcase">
      <Modal isOpen={EditHeaderModal} centered={true} style={{width:"300px"}}>
        <ModalHeader toggle={toggleEditHeaderModal}>
          {"Edit Header's Value"}
        </ModalHeader>

        <ModalBody>
          {EmptyHeaderError === true ? (
            <div className="alert alert-danger" role="alert">
              All headers are mandatory
            </div>
          ) : null}
          <div className="col-md-12">
            <div className="row">
              <div className="col-md-1">
                <div className="form-group">
                  <label className="lbl_style">1:</label>
                </div>
              </div>
              <div className="col-md-10">
                <input
                  className="form-control"
                  type="text"
                  placeholder="Enter new header"
                  value={Header1}
                  onChange={(e) => setHeader1(e.target.value)}
                  onBlur={RenderHeaders}
                />
              </div>
            </div>
            <div className="row">
              <div className="col-md-1">
                <div className="form-group">
                  <label className="lbl_style">2:</label>
                </div>
              </div>
              <div className="col-md-10">
                <input
                  className="form-control"
                  type="text"
                  placeholder="Enter new header"
                  value={Header2}
                  onChange={(e) => setHeader2(e.target.value)}
                />
              </div>
            </div>
            <div className="row">
              <div className="col-md-1">
                <div className="form-group">
                  <label className="lbl_style">3:</label>
                </div>
              </div>
              <div className="col-md-10">
                <input
                  className="form-control"
                  type="text"
                  placeholder="Enter new header"
                  value={Header3}
                  onChange={(e) => setHeader3(e.target.value)}
                />
              </div>
            </div>
          </div>
        </ModalBody>

        <ModalFooter>
          <Button color="fourth" onClick={toggleEditHeaderModal}>
            {" "}
            Update & Close{" "}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default EditColumnHeader;
