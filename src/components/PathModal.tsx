import { useState, useEffect } from "react";
import { useStatusData } from "../context/StatusDataContext";
import { PathInputs } from "../type/electron-api";

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
      <button
        onClick={() => setIsOpen(true)}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        disabled={isSaving}
      >
        {isSaving ? "Saving..." : "Set Paths"}
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96">
            <h2 className="text-xl font-bold mb-4">Set File Paths</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Tested Path
                </label>
                <div className="mt-1 flex">
                  <input
                    type="text"
                    value={localPaths.testedPath}
                    readOnly
                    className="flex-1 p-2 border rounded-l"
                  />
                  <button
                    onClick={() => handleFileSelect("testedPath")}
                    className="bg-gray-200 px-4 rounded-r hover:bg-gray-300"
                    disabled={isSaving}
                  >
                    Browse
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Untested Path
                </label>
                <div className="mt-1 flex">
                  <input
                    type="text"
                    value={localPaths.untestedPath}
                    readOnly
                    className="flex-1 p-2 border rounded-l"
                  />
                  <button
                    onClick={() => handleFileSelect("untestedPath")}
                    className="bg-gray-200 px-4 rounded-r hover:bg-gray-300"
                    disabled={isSaving}
                  >
                    Browse
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Plan Path
                </label>
                <div className="mt-1 flex">
                  <input
                    type="text"
                    value={localPaths.planPath}
                    readOnly
                    className="flex-1 p-2 border rounded-l"
                  />
                  <button
                    onClick={() => handleFileSelect("planPath")}
                    className="bg-gray-200 px-4 rounded-r hover:bg-gray-300"
                    disabled={isSaving}
                  >
                    Browse
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={handleCancel}
                className="px-4 py-2 border rounded hover:bg-gray-100"
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
