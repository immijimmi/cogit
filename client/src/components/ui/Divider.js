import "./Divider.css";

function Divider(props) {
  return (
    <div className="divider-container">
      <div
        className="divider-corner"
        style={{
          borderTop: "none",
          borderLeft: "none",
        }}
      />
      <div
        className="divider-corner"
        style={{
          borderTop: "none",
          borderRight: "none",
        }}
      />
      <div
        className="divider-corner"
        style={{
          borderBottom: "none",
          borderLeft: "none",
        }}
      />
      <div
        className="divider-corner"
        style={{
          borderBottom: "none",
          borderRight: "none",
        }}
      />
    </div>
  );
}

export default Divider;
