import React from "react";

const ConfirmPopup = ({ message, onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-2xl shadow-xl w-[90%] max-w-sm p-6 animate-fadeIn">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Confirm</h3>
        <p className="text-gray-600 mb-6">{message}</p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm rounded-lg bg-red-500 hover:bg-red-600 text-white transition"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmPopup;
