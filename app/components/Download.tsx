import React from "react";

const DownloadLink = ({ geojsonData, fileName }) => {
  const downloadJson = () => {
    const data = JSON.stringify(geojsonData, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <>
      <hr />
      <button
        onClick={downloadJson}
        className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold w-60 py-2 px-4 rounded inline-flex items-center mt-5"
      >
        <svg
          className="fill-current w-4 h-4 mr-2"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
        >
          <path d="M13 8V2H7v6H2l8 8 8-8h-5zM0 18h20v2H0v-2z" />
        </svg>
        <span>Lae alla GeoJSON</span>
      </button>
    </>
  );
};

export default DownloadLink;
