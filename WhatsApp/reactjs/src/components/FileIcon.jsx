import React from "react";

const FileIcon = ({ extension, title, size, bgColor = "#3b82f6" }) => {
  if (
    extension.toUpperCase() === "XLS" ||
    extension.toUpperCase() === "XLSX" ||
    extension.toUpperCase() === "CSV"
  ) {
    bgColor = "#099250";
  } else if (
    extension.toUpperCase() === "PDF" ||
    extension.toUpperCase() === "JPG" ||
    extension.toUpperCase() === "JPEG" ||
    extension.toUpperCase() === "PNG"
  ) {
    bgColor = "#D92D20";
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        width: "fit-content",
      }}
    >
      {/* File Icon with background image */}
      <div
        style={{
          position: "relative",
          width: "32px",
          height: "40px",
          backgroundImage: "url('/assets/fileIcon2.png')",
          backgroundSize: "contain",
          backgroundPosition: "center",
        }}
      >
        {/* Extension Label */}
        <span
          style={{
            position: "absolute",
            bottom: 6,
            left: -8,
            right: 0,
            fontSize: "9px",
            fontWeight: 700,
            color: "#fff",
            textAlign: "center",
            padding: "2px 2px",
            borderRadius: "3px",
            width: "32px",
            backgroundColor: bgColor,
          }}
        >
          {extension.toUpperCase()}
        </span>
      </div>

      {/* File Info */}
      <div style={{ display: "flex", flexDirection: "column" }}>
        <span
          style={{
            fontSize: "14px",
            fontWeight: 500,
            color: "#1f2937",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            maxWidth: "200px",
          }}
          title={title}
        >
          {title}
        </span>
        <span style={{ fontSize: "12px", color: "#6b7280", marginTop: 5 }}>
          {size}
        </span>
      </div>
    </div>
  );
};

export default FileIcon;
