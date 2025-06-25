import React, { useState, useEffect } from "react";
import { useStatusData } from "../context/StatusDataContext";
import { PathInputs } from "../type/electron-api";
import Button from "./Button";

const defaultPaths = {
  testedPath: "",
  untestedPath: "",
  planPath: "",
};

export const PathModal = () => {
  const { paths, setPaths, reloadData } = useStatusData();
  const [isOpen, setIsOpen] = useState(false);
  const [localPaths, setLocalPaths] = useState<PathInputs>(paths);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    console.log("PathModal: paths updated from context:", paths);
    setLocalPaths(paths);
  }, [paths]);

  const handleSave = async () => {
    console.log("PathModal: handleSave called with paths:", localPaths);
    setIsSaving(true);
    try {
      await setPaths(localPaths);
      console.log("PathModal: setPaths completed");
      setIsOpen(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    console.log("PathModal: handleCancel called, resetting to:", paths);
    setLocalPaths(paths);
    setIsOpen(false);
  };

  const handleFileSelect = async (type: keyof PathInputs) => {
    console.log("PathModal: handleFileSelect called for type:", type);
    const result = await window.electronAPI.pickFile({
      properties: ["openFile"],
    });
    if (result) {
      console.log("PathModal: new path selected:", result);
      setLocalPaths((prev) => ({ ...prev, [type]: result }));
    }
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant="primary"
        disabled={isSaving}
        className="btn-overlay transition-all duration-200 ease-in-out border transition-colors"
      >
        {isSaving ? "Saving..." : "Set Paths"}
      </Button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-96 border border-gray-200 dark:border-gray-600">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">
              Set File Paths
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Tested Path
                </label>
                <div className="mt-1 flex">
                  <input
                    type="text"
                    value={localPaths.testedPath}
                    readOnly
                    className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-l bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                  <button
                    onClick={() => handleFileSelect("testedPath")}
                    className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-4 rounded-r transition-all duration-200 ease-in-out shadow-md hover:shadow-lg"
                    disabled={isSaving}
                  >
                    Browse
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Untested Path
                </label>
                <div className="mt-1 flex">
                  <input
                    type="text"
                    value={localPaths.untestedPath}
                    readOnly
                    className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-l bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                  <button
                    onClick={() => handleFileSelect("untestedPath")}
                    className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-4 rounded-r transition-all duration-200 ease-in-out shadow-md hover:shadow-lg"
                    disabled={isSaving}
                  >
                    Browse
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Plan Path
                </label>
                <div className="mt-1 flex">
                  <input
                    type="text"
                    value={localPaths.planPath}
                    readOnly
                    className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-l bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                  <button
                    onClick={() => handleFileSelect("planPath")}
                    className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-4 rounded-r transition-all duration-200 ease-in-out shadow-md hover:shadow-lg"
                    disabled={isSaving}
                  >
                    Browse
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={handleCancel}
                className="px-4 py-2 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all duration-200 shadow-sm hover:shadow-md"
                disabled={isSaving}
              >
                Cancel
              </button>
              <Button
                onClick={handleSave}
                variant="success"
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
