import React, { useCallback, useMemo, useRef, useState } from "react";

type UploadSingleXmlProps = {
  /** Called when user clicks Upload. Return a promise to show loading state. */
  onUpload: (file: File) => Promise<void> | void;

  /** Optional: max size in bytes (default 10MB) */
  maxBytes?: number;

  /** Optional UI text */
  label?: string;
  /** Optional id for hidden input */
  id?: string;
  /** Optional disable whole control */
  disable?: boolean;
  /** Optional external schema error to display */
  schemaError?: any;
};

export function UploadSingleXml({
  onUpload,
  maxBytes = 10 * 1024 * 1024,
  label = "Upload XML",
  id = "fileupload-xml",
  disable = false,
  schemaError = "",
}: UploadSingleXmlProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const accept = useMemo(() => ".xml,application/xml,text/xml", []);

  const validate = useCallback(
    (f: File): string => {
      const name = f.name || "";
      const lower = name.toLowerCase();

      if (!lower.endsWith(".xml")) return "Only .xml files are allowed.";
      if (f.size > maxBytes)
        return `File is too large. Max ${(maxBytes / (1024 * 1024)).toFixed(
          0
        )}MB.`;

      return "";
    },
    [maxBytes]
  );

  const pickSingleXml = useCallback(
    (files: FileList | File[] | null | undefined) => {
      setError("");

      const list: File[] = files ? Array.from(files as any) : [];
      if (list.length === 0) return;

      if (list.length > 1) {
        setFile(null);
        setError("Please upload a single XML file (only one file allowed).");
        return;
      }

      const f = list[0];
      const err = validate(f);
      if (err) {
        setFile(null);
        setError(err);
        return;
      }

      setFile(f);
    },
    [validate]
  );

  const onInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      pickSingleXml(e.target.files);
      // allow selecting the same file again
      e.target.value = "";
    },
    [pickSingleXml]
  );

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      pickSingleXml(e.dataTransfer.files);
    },
    [pickSingleXml]
  );

  const openFileDialog = useCallback(() => {
    if (disable || isUploading) return;
    inputRef.current?.click();
  }, [disable, isUploading]);

  const clear = useCallback(() => {
    setFile(null);
    setError("");
  }, []);

  const upload = useCallback(async () => {
    if (disable) return;
    if (!file) {
      setError("Select one XML file first.");
      return;
    }

    const err = validate(file);
    if (err) {
      setError(err);
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
  }, [disable, file, validate, onUpload, clear]);

  return (
    <div style={{ maxWidth: 520 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
        }}
      >
        <h3 style={{ margin: 0 }}>{label}</h3>
        {file ? (
          <button type="button" onClick={clear} disabled={disable || isUploading}>
            Remove
          </button>
        ) : null}
      </div>

      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={accept}
        multiple={false}
        disabled={disable}
        onChange={onInputChange}
        style={{ display: "none" }}
      />

      <div
        onClick={openFileDialog}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disable && !isUploading) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        role="button"
        tabIndex={0}
        onKeyDown={(e) =>
          e.key === "Enter" || e.key === " " ? openFileDialog() : null
        }
        style={{
          marginTop: 12,
          padding: 16,
          border: "2px dashed #999",
          borderRadius: 10,
          cursor: disable ? "not-allowed" : "pointer",
          opacity: disable ? 0.6 : 1,
          background: isDragging ? "#f3f6ff" : "#fff",
        }}
      >
        {!file ? (
          <div>
            <div style={{ fontWeight: 600 }}>
              Drag & drop a single .xml file here
            </div>
            <div style={{ color: "#666", marginTop: 4 }}>or click to browse</div>
          </div>
        ) : (
          <div>
            <div style={{ fontWeight: 600 }} title={file.name}>
              {file.name}
            </div>
            <div style={{ color: "#666", marginTop: 4 }}>
              {(file.size / 1024).toFixed(1)} KB
            </div>
          </div>
        )}
      </div>

      {error ? (
        <div style={{ marginTop: 10, color: "#b00020" }}>{error}</div>
      ) : null}
      {schemaError ? (
        <div style={{ marginTop: 10, color: "#b00020" }}>{schemaError}</div>
      ) : null}

      <div style={{ marginTop: 12, display: "flex", gap: 10 }}>
        <button
          type="button"
          onClick={openFileDialog}
          disabled={disable || isUploading}
        >
          Choose XML
        </button>
        <button
          type="button"
          onClick={upload}
          disabled={disable || !file || isUploading}
        >
          {isUploading ? "Uploading..." : "Upload"}
        </button>
      </div>
    </div>
  );
}
