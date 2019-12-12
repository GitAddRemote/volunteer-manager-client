import React from "react";

const table = props => {
  const volunteers = props.volunteers;
  console.log(volunteers);
  return volunteers.map(volunteer => (
    <div className="row" key={volunteer.key}>
      <div className="col">
        <div>{volunteer.fullName}</div>
        <div>{volunteer.username}</div>
      </div>
      <div className="col">
        <button
          onClick={() => props.removeHandler(volunteer)}
          className="btn btn-link"
        >
          Delete
        </button>
      </div>
      <div className="col">
        <button
          onClick={() => props.editHandler(volunteer)}
          className="btn btn-link"
        >
          Edit
        </button>
      </div>
    </div>
  ));
};

export default table;
