import React, { useState } from "react";

const CURRENT_VERSION = "1.0.0";
const UPDATE_URL =
  "https://raw.githubusercontent.com/h23johal/Updater/main/version.json";

type UpdateInfo = {
  version: string;
  download_url: string;
};

const UpdaterComponent: React.FC = () => {
  const [latestVersion, setLatestVersion] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState(
    "Ingen uppdateringskontroll utförd än."
  );
  const [loading, setLoading] = useState(false);

  const checkForUpdates = async () => {
    setModalOpen(true);
    setStatusMessage("Letar efter uppdateringar...");
    setLoading(true);

    try {
      const res = await fetch(UPDATE_URL);
      const data: UpdateInfo = await res.json();

      if (data.version !== CURRENT_VERSION) {
        setLatestVersion(data.version);
        setDownloadUrl(data.download_url);
        setStatusMessage(`Ny version tillgänglig: ${data.version}`);
      } else {
        setStatusMessage("Du har redan den senaste versionen.");
      }
    } catch (error) {
      setStatusMessage("Kunde inte kontrollera uppdatering.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (downloadUrl) {
      window.open(downloadUrl, "_blank");
    }
  };

  return (
    <>
      <button
        onClick={checkForUpdates}
        className={`px-4 py-2 rounded ${
          latestVersion
            ? "bg-green-600 hover:bg-green-700"
            : "bg-blue-600 hover:bg-blue-700"
        } text-white`}
      >
        {latestVersion ? "Finns uppdatering" : "Leta efter uppdatering"}
      </button>

      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md relative">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-2 right-3 text-gray-500 hover:text-black text-xl"
            >
              ✕
            </button>
            <h2 className="text-xl font-semibold mb-4">Uppdatering</h2>
            <p className="mb-4">{statusMessage}</p>

            {latestVersion && !loading && (
              <button
                onClick={handleDownload}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
              >
                Ladda ner version {latestVersion}
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default UpdaterComponent;
