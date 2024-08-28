import React from "react";
import PropTypes from "prop-types";

const Image = ({
  src,
  alt,
  width,
  height,
  layout = "responsive",
  className,
  ...props
}) => {
  // Basic validation for props
  if (!src) {
    console.error('The "src" prop is required for the Image component.');
    return null;
  }

  const imageStyles = {
    width: "100%",
    height: "auto",
    display: "block",
    objectFit: "cover",
  };

  // Conditional styles based on layout
  let containerStyles = { position: "relative", width: "100%" };
  if (layout === "intrinsic") {
    containerStyles = { position: "relative", width: width, height: height };
  } else if (layout === "fixed") {
    containerStyles = { position: "relative", width: width, height: height };
  }

  return (
    <div className={className} style={containerStyles}>
      <img
        src={src}
        alt={alt}
        style={imageStyles}
        width={layout === "fixed" || layout === "intrinsic" ? width : undefined}
        height={
          layout === "fixed" || layout === "intrinsic" ? height : undefined
        }
        loading="lazy"
        {...props}
      />
    </div>
  );
};

// Prop types for the component
Image.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string.isRequired,
  width: PropTypes.number,
  height: PropTypes.number,
  layout: PropTypes.oneOf(["fixed", "intrinsic", "responsive"]),
  className: PropTypes.string,
};

export default Image;
