import PropTypes from "prop-types";
function Placeholder() {
  return (
    <div className="flex h-full min-h-64 w-full min-w-72 items-center justify-center">
      <div className="rounded bg-white px-4 py-2">This has dot background</div>
    </div>
  );
}

function Dot({
  color = "#cacaca",
  size = 1,
  spacing = 10,
  children,
  className,
}) {
  return (
    <div
      style={{
        backgroundColor: "white",
        backgroundImage: `radial-gradient(${color} ${size}px, transparent ${size}px)`,
        backgroundSize: `calc(${spacing} * ${size}px) calc(${spacing} * ${size}px)`,
      }}
      className={className}
    >
      {children ?? <Placeholder />}
    </div>
  );
}

Dot.propTypes = {
  color: PropTypes.string,
  size: PropTypes.number,
  spacing: PropTypes.number,
  children: PropTypes.node,
  className: PropTypes.string,
};

export default Dot;
