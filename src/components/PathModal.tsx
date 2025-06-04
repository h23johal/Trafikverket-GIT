import { useState, useEffect } from 'react';

const defaultPaths = {
  testedPath: '',
  untestedPath: '',
  planPath: '',
};

export default function PathModal() {
  const [open, setOpen] = useState(false);
  const [paths, setPaths] = useState(defaultPaths);

  useEffect(() => {
    const cached = localStorage.getItem('cachedPaths');
    if (cached) setPaths(JSON.parse(cached));
  }, []);

  const pickFile = async (key: keyof typeof paths) => {
    const path = await window.electronAPI.pickFile({ properties: ['openFile'] });
    if (path) {
      setPaths((prev) => ({ ...prev, [key]: path }));
    }
  };

  const save = () => {
    localStorage.setItem('cachedPaths', JSON.stringify(paths));
    setOpen(false);
  };

  return (
    <>
      <button onClick={() => setOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded shadow">
        Set Paths
      </button>

      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Select Paths</h2>

            {(['testedPath', 'untestedPath', 'planPath'] as const).map((key) => (
              <div key={key} className="mb-3">
                <label className="block text-sm mb-1">{key}</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={paths[key]}
                    onChange={(e) => setPaths((p) => ({ ...p, [key]: e.target.value }))}
                    className="flex-grow border px-2 py-1 rounded"
                  />
                  <button
                    onClick={() => pickFile(key)}
                    className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300 text-sm"
                  >
                    Browse
                  </button>
                </div>
              </div>
            ))}

            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setOpen(false)} className="px-4 py-2 text-sm bg-gray-200 rounded hover:bg-gray-300">
                Cancel
              </button>
              <button onClick={save} className="px-4 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700">
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
