import React, { useCallback, useState } from "react";
import UploadFiles from "./UploadFiles";

type UploadSingleXmlProps = {
  /** Called when user clicks Upload. Return a promise to show loading state. */
  onUpload: (file: File) => Promise<void> | void;

  /** Optional: max size in bytes (default 10MB) */
  maxBytes?: number;

  /** Optional UI text */
  label?: string;

  /** Optional passthrough props to UploadFiles */
  id?: string;
  disable?: boolean;
  schemaError?: any;
  size?: "S" | "M" | "L";
};

export function UploadSingleXml({
  onUpload,
  maxBytes = 10 * 1024 * 1024,
  label = "Upload XML",
  id = "fileupload-xml",
  disable = false,
  schemaError = "",
  size = "S",
}: UploadSingleXmlProps) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);

  const clear = useCallback(() => {
    setFile(null);
    setError("");
  }, []);

  const handleFilesReady = useCallback((files: any) => {
    // UploadFiles sends an array in xml-only mode: onFilesReady([xmlFile])
    const first = Array.isArray(files) ? files[0] : files;
    setFile(first instanceof File ? first : null);
    setError("");
  }, []);

  const upload = useCallback(async () => {
    if (!file) {
      setError("Select one XML file first.");
      return;
    }

    if (file.size > maxBytes) {
      setError(
        `File is too large. Max ${(maxBytes / (1024 * 1024)).toFixed(0)}MB.`
      );
      return;
    }

    setError("");
    setIsUploading(true);
    try {
      await onUpload(file);
      clear();
    } catch (e: any) {
      setError(e?.message ?? "Upload failed.");
    } finally {
      setIsUploading(false);
    }
  }, [file, onUpload, clear]);

  return (
    <div>
      <UploadFiles
        id={id}
        disable={disable}
        schemaError={schemaError}
        title={label}
        size={size}
        fileTypes=".xml"
        multiple={false}
        onFilesReady={handleFilesReady}
        // UploadFiles expects (files:any)=>void and uses false to mean "valid"
        onValidateFile={() => undefined}
      />

      {error ? (
        <div className="flex items-center mr-auto text-sm text-error-message-red">
          {error}
        </div>
      ) : null}

      <div className="mt-3 flex gap-2">
        {file ? (
          <button type="button" onClick={clear} disabled={isUploading}>
            Remove
          </button>
        ) : null}
        <button type="button" onClick={upload} disabled={!file || isUploading}>
          {isUploading ? "Uploading..." : "Upload"}
        </button>
      </div>
    </div>
  );
}
