import React from "react";

const ButtonSection = ({ SubmitData, history, SamePage, setSamePage, Page }) => {
  return (
    <div>
      <div className="d-flex col-md-12">
        <div className="pt-2 pb-2">
          <button
            className="btn btn-secondary btn-air-secondary mr-2"
            onClick={SubmitData}
          >
            {Page === "Edit" ? "Update" : Page === "Duplicate" ? "Create" : "Save"}
          </button>
        </div>

        <div className="pt-2 pb-2 text-left">
          <button
            className="btn btn-warning btn-air-warning mr-2"
            onClick={() => history.push("/database/Database")}
          >
            Cancel
          </button>
        </div>
        <div className="pt-2 pb-2 text-left ml-3">
          <div className="form-group m-t-8 m-checkbox-inline mb-0 custom-check-ml pt-2">
            {/* <div className="checkbox-primary"> */}
            <input
              id="checkbox-primary-1"
              className="checkbox checkbox-primary"
              type="checkbox"
              onClick={() => setSamePage(!SamePage)}
            />
            <label className="mb-0 mt-1 ml-1" htmlFor="checkbox-primary-1">
              <span className="digits"> {"Stay on same page"}</span>
            </label>
            {/* </div> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ButtonSection;
