import React, { useState, useEffect } from "react";
import Button from "./Button";

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

  const checkForUpdates = async (showModal = true) => {
    if (showModal) {
      setModalOpen(true);
    }
    setStatusMessage("Letar efter uppdateringar...");
    setLoading(true);

    try {
      const res = await fetch(UPDATE_URL);
      const data: UpdateInfo = await res.json();

      if (data.version !== CURRENT_VERSION) {
        setLatestVersion(data.version);
        setDownloadUrl(data.download_url);
        setStatusMessage(`Ny version tillgänglig: ${data.version}`);
        if (!showModal) setModalOpen(true); // öppna modal automatiskt vid start
      } else {
        setStatusMessage("Du har redan den senaste versionen.");
      }
    } catch (error) {
      setStatusMessage("Kunde inte kontrollera uppdatering.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // körs automatiskt vid appstart
    checkForUpdates(false);
  }, []);

  const handleDownload = () => {
    if (downloadUrl) {
      window.open(downloadUrl, "_blank");
    }
  };

  return (
    <>
      <Button
        onClick={() => checkForUpdates(true)}
        variant={latestVersion ? "success" : "primary"}
        className="btn-overlay transition-all duration-200 ease-in-out border transition-colors"
      >
        {latestVersion ? "Finns uppdatering" : "Leta efter uppdatering"}
      </Button>

      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 dark:bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md relative border border-gray-200 dark:border-gray-600">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-2 right-3 text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white text-xl transition-colors duration-200 hover:scale-110"
            >
              ✕
            </button>
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
              Uppdatering
            </h2>
            <p className="mb-4 text-gray-700 dark:text-gray-300">
              {statusMessage}
            </p>

            {latestVersion && !loading && (
              <Button onClick={handleDownload} variant="primary">
                Ladda ner version {latestVersion}
              </Button>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default UpdaterComponent;
