import React, { useState, useEffect } from "react";

const CallScreen = ({
  title = "Incoming Call",
  callerName = "",
  callerImage = "",
  onAccept = null,
  onReject = null,
  acceptText = "Accept",
  rejectText = "Reject",
}) => {
  // State to track if the screen is a mobile size (e.g., less than 768px)
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 768px)");
    const handleResize = (e) => setIsMobile(e.matches);

    // Initial check
    setIsMobile(mediaQuery.matches);

    // Listen for changes
    mediaQuery.addEventListener("change", handleResize);

    // Cleanup listener on component unmount
    return () => mediaQuery.removeEventListener("change", handleResize);
  }, []);

  // Inline style objects for the component
  const styles = {
    fixed: {
      position: "fixed",
      width: "100%",
      height: "100%",
      top: "0px",
    },
    container: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "100vh",
      width: "100%",
      backgroundColor: "#1c1c1e", // Dark background
      color: "#fff",
      textAlign: "center",
    },
    callerInfo: {
      marginBottom: isMobile ? "80px" : "100px",
    },
    callerImage: {
      display: " inline-block",
      width: isMobile ? "120px" : "180px",
      height: isMobile ? "120px" : "180px",
      borderRadius: "50%",
      objectFit: "cover",
      marginBottom: "20px",
    },
    callerName: {
      fontSize: isMobile ? "2rem" : "3rem",
      fontWeight: "600",
      margin: "0",
    },
    actions: {
      display: "flex",
      gap: isMobile ? "60px" : "100px",
    },
    button: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      cursor: "pointer",
    },
    buttonIcon: {
      width: isMobile ? "60px" : "80px",
      height: isMobile ? "60px" : "80px",
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: "8px",
    },
    acceptIcon: {
      backgroundColor: "#34c759", // Green
    },
    rejectIcon: {
      backgroundColor: "#ff3b30", // Red
    },
    iconSvg: {
      width: isMobile ? "30px" : "40px",
      height: isMobile ? "30px" : "40px",
      fill: "white",
    },
    buttonText: {
      fontSize: isMobile ? "1rem" : "1.2rem",
      fontWeight: "500",
    },
  };

  // Define the icon SVGs as strings for use in the component
  const acceptSvg = (
    <svg style={styles.iconSvg} viewBox="0 0 24 24">
      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
    </svg>
  );
  const rejectSvg = (
    <svg style={styles.iconSvg} viewBox="0 0 24 24">
      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
    </svg>
  );

  return (
    <div style={styles.fixed}>
      <div style={styles.container}>
        <div style={styles.callerInfo}>
          <img src={callerImage} alt={callerName} style={styles.callerImage} />
          <h1 style={styles.callerName}>{callerName}</h1>
          <h2>{title}</h2>
        </div>
        <div style={styles.actions}>
          {onReject && (
            <div style={styles.button} onClick={onReject}>
              <div style={{ ...styles.buttonIcon, ...styles.rejectIcon }}>
                {rejectSvg}
              </div>
              <p style={styles.buttonText}>{rejectText}</p>
            </div>
          )}
          {onAccept && (
            <div style={styles.button} onClick={onAccept}>
              <div style={{ ...styles.buttonIcon, ...styles.acceptIcon }}>
                {acceptSvg}
              </div>
              <p style={styles.buttonText}>{acceptText}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CallScreen;
