export default function Placeholder() {
  let platformName = "Unknown";

  // Prefer modern API if available
  if (navigator.userAgentData && navigator.userAgentData.platform) {
    const platform = navigator.userAgentData.platform.toLowerCase();
    if (platform.includes("win")) platformName = "Windows";
    else if (platform.includes("mac")) platformName = "macOS";
  } else if (navigator.platform) {
    // Fallback for older browsers
    const platform = navigator.platform.toLowerCase();
    if (platform.includes("win")) platformName = "Windows";
    else if (platform.includes("mac")) platformName = "macOS";
  }
  return (
    <div
      className="sticky top-0 h-screen flex flex-col justify-center items-center"
      style={{ background: "#f7f5f3" }}
    >
      {/* <!-- whatsapp computer image --> */}
      <img className="w-[180px]" src="./whatsapp_placeholder.png" alt="" />
      {/* <!-- heading line --> */}
      <h1 className="mt-[30px] text-4xl" style={{ fontWeight: 300 }}>
        Download WhatsApp for {platformName}
      </h1>
      <p className="mt-[15px]">
        Make calls and get a faster experience when you download the app.
      </p>
      {/* <!-- button line --> */}
      <button
        className="bg-green-500 rounded-full text-sm mt-[25px] pl-[25px] pr-[25px] pt-[9px] pb-[9px]"
        style={{ color: "#FFF", fontWeight: 500 }}
      >
        Download
      </button>
    </div>
  );
}
