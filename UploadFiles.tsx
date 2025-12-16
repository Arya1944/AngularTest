import React, { useEffect, useMemo, useRef, useState } from "react";
import uploadIcon from "../../assets/images/uploadIcon.png"; //"/assets/images/uploadIcon.png";
import { ADD_DOCUMENT_CONSTANT } from "../../enums/saResources";

interface UploadFilesProps {
  id?: string;
  fileTypes?: string;
  disable?: boolean;
  schemaError?: any;
  title?: string;
  onFilesReady: (files: any) => void;
  onValidateFile: (files: any) => void;
  multiple?: boolean;
  size?: "S" | "M" | "L";
}

const units = ADD_DOCUMENT_CONSTANT.UNITS;
const fileSizeBase = ADD_DOCUMENT_CONSTANT.FILE_SIZE_BASE;
const maxFileSize = ADD_DOCUMENT_CONSTANT.MAX_FILE_SIZE;
const allowTypes = ADD_DOCUMENT_CONSTANT.ALLOW_TYPES;
const fileSizeOverLimitaionError =
  ADD_DOCUMENT_CONSTANT.FILE_SIZE_OVER_LIMITATION_ERROR;
const invalidFileError = ADD_DOCUMENT_CONSTANT.INVALID_FILE_ERROR;
const missXMLError = ADD_DOCUMENT_CONSTANT.MISS_XML_FILE_ERROR;
const missPDFError = ADD_DOCUMENT_CONSTANT.MISS_PDF_FILE_ERROR;
const fileTypePDF = ADD_DOCUMENT_CONSTANT.FILE_TYPE_PDF;
const fileTypeXML = ADD_DOCUMENT_CONSTANT.FILE_TYPE_XML;

const UploadFiles: React.FC<UploadFilesProps> = ({
  id = "fileupload",
  fileTypes = ".pdf,.xml",
  disable = false,
  schemaError = "",
  title = ADD_DOCUMENT_CONSTANT.UPLOAD_FILE_TEXT,
  onFilesReady,
  onValidateFile,
  multiple = true,
  size = "S",
}) => {
  const [files, setFiles] = useState<FileList | null>(null);
  const [displayFilesDetail, setDisplayFilesDetail] = useState<string[]>([]);
  const [validationErrorMessage, setValidationErrorMessage] =
    useState<string>("");

  const [schemaErrorMessage, setSchemaErrorMessage] = useState<string>();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileDetails: string[] = [];

  const isXmlOnlyMode = useMemo(() => fileTypes?.trim().toLowerCase() === ".xml", [fileTypes]);
  const acceptValue = useMemo(
    () => (isXmlOnlyMode ? ".xml,application/xml,text/xml" : fileTypes),
    [fileTypes, isXmlOnlyMode]
  );

  const getFileExtension = (fileName: string) => {
    const parts = fileName.split(".");
    return (parts.length > 1 ? parts.pop() : "")?.toLowerCase() || "";
  };

  const isXmlFile = (file: File) => {
    const ext = getFileExtension(file.name);
    return (
      ext === "xml" ||
      file.type === fileTypeXML ||
      file.type === "text/xml" ||
      file.type === "application/xml"
    );
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let uploadFiles = event.target.files;
    if (!uploadFiles || uploadFiles.length === 0) {
      return;
    }

    // New logic: single XML upload mode
    if (isXmlOnlyMode) {
      if (uploadFiles.length > 1) {
        setFiles(null);
        setDisplayFilesDetail([]);
        setValidationErrorMessage("Please upload a single XML file (only one file allowed).");
        return;
      }

      const file = uploadFiles[0];
      if (!isXmlFile(file)) {
        setFiles(null);
        setDisplayFilesDetail([]);
        setValidationErrorMessage("Invalid file type. Please upload an XML file.");
        return;
      }

      const fileList = getFileList(uploadFiles);
      setFiles(fileList);
      setDisplayFilesDetail([getFileDetail(file.name, file.size)]);
      setValidationErrorMessage("");
      setSchemaErrorMessage("");
      return;
    }

    // Existing logic: enforce single file when multiple is false
    if (multiple === false && uploadFiles.length > 1) {
      setValidationErrorMessage("You can only upload one file.");
      return;
    }

    if (uploadFiles && uploadFiles.length > 0) {
      if (multiple === false) {
        // Replace with the latest selected file
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(uploadFiles[0]);
        const fileList = dataTransfer.files;
        setFiles(fileList);
        setDisplayFilesDetail([getFileDetail(uploadFiles[0].name, uploadFiles[0].size)]);
        setSchemaErrorMessage("");
        return;
      }

      if (files && files.length > 0) {
        const combineFiles = combineFileList(files, uploadFiles);
        setFiles(combineFiles);
        uploadFiles = combineFiles;
      } else {
        const fileList = getFileList(uploadFiles);
        setFiles(fileList);
      }
      for (const uploadFile of uploadFiles) {
        const fileDetail = getFileDetail(uploadFile.name, uploadFile.size);
        fileDetails.push(fileDetail);
      }
      setDisplayFilesDetail(fileDetails);
      setSchemaErrorMessage("");
    }
  };

  const getFileDetail = (fileName: string, fileSize: number) => {
    const fileSizeWithDigitals = fileSize.toString().length;
    let formatFileSize = "";
    switch (true) {
      case fileSizeWithDigitals <= 2:
        formatFileSize = "(" + fileSize + " " + units[0] + ")";
        break;
      case fileSizeWithDigitals >= 3 && fileSizeWithDigitals < 6:
        formatFileSize =
          "(" +
          Math.ceil((fileSize / fileSizeBase) * 10) / 10 +
          " " +
          units[1] +
          ")";
        break;
      case fileSizeWithDigitals >= 6 && fileSizeWithDigitals < 9:
        formatFileSize =
          "(" +
          Math.ceil((fileSize / fileSizeBase / fileSizeBase) * 10) / 10 +
          " " +
          units[2] +
          ")";
        break;
      case fileSizeWithDigitals >= 9:
        formatFileSize =
          "(" +
          Math.ceil(
            (fileSize / fileSizeBase / fileSizeBase / fileSizeBase) * 10
          ) /
            10 +
          " " +
          units[3] +
          ")";
        break;
    }
    const fileDetail = fileName + " " + formatFileSize;
    return fileDetail;
  };

  const combineFileList = (
    firstFileList: FileList,
    secondFileList: FileList
  ) => {
    const firstFile = Array.from(firstFileList);
    const secondFile = Array.from(secondFileList);
    const combinedFiles = [...firstFile, ...secondFile];

    const dataTransfer = new DataTransfer();
    combinedFiles.forEach((file) => {
      dataTransfer.items.add(file);
    });
    return dataTransfer.files;
  };

  const latestFileList = (fileList: FileList, index: number) => {
    const fileListArray = Array.from(fileList);
    fileListArray.splice(index, 1);
    const dataTransfer = new DataTransfer();
    fileListArray.forEach((file) => {
      dataTransfer.items.add(file);
    });
    return dataTransfer.files;
  };

  const handleFileClick = () => {
    // allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getFileList = (fileList: FileList) => {
    const fileListArray = Array.from(fileList);
    const dataTransfer = new DataTransfer();
    fileListArray.forEach((file) => {
      dataTransfer.items.add(file);
    });
    return dataTransfer.files;
  };

  const isInvalidFile = (index: number) => {
    if (files) {
      const file = files[index];
      const largerThanMaxSize =
        file.size / fileSizeBase / fileSizeBase > maxFileSize;
      const invalidFileType = isXmlOnlyMode
        ? !isXmlFile(file)
        : !allowTypes.includes(file.type);
      return largerThanMaxSize || invalidFileType;
    }
    return false;
  };

  const removeFile = (index: number) => {
    if (files) {
      const latestFiles = latestFileList(files, index);
      setFiles(latestFiles);
      for (const latestFile of latestFiles) {
        const fileDetail = getFileDetail(latestFile.name, latestFile.size);
        fileDetails.push(fileDetail);
      }
      validationUploadFiles();
      setDisplayFilesDetail(fileDetails);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    let dropFiles = e.dataTransfer.files;
    if (dropFiles && dropFiles.length > 0) {
      // New logic: single XML upload mode
      if (isXmlOnlyMode) {
        if (dropFiles.length > 1) {
          setFiles(null);
          setDisplayFilesDetail([]);
          setValidationErrorMessage("Please upload a single XML file (only one file allowed).");
          return;
        }

        const file = dropFiles[0];
        if (!isXmlFile(file)) {
          setFiles(null);
          setDisplayFilesDetail([]);
          setValidationErrorMessage("Invalid file type. Please upload an XML file.");
          return;
        }

        const fileList = getFileList(dropFiles);
        setFiles(fileList);
        setDisplayFilesDetail([getFileDetail(file.name, file.size)]);
        setValidationErrorMessage("");
        setSchemaErrorMessage("");
        return;
      }

      if (multiple === false && dropFiles.length > 1) {
        setValidationErrorMessage("You can only upload one file.");
        return;
      }

      if (multiple === false) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(dropFiles[0]);
        const fileList = dataTransfer.files;
        setFiles(fileList);
        setDisplayFilesDetail([getFileDetail(dropFiles[0].name, dropFiles[0].size)]);
        setSchemaErrorMessage("");
        return;
      }

      if (files && files.length > 0) {
        const combineFiles = combineFileList(files, dropFiles);
        setFiles(combineFiles);
        dropFiles = combineFiles;
      } else {
        const fileList = getFileList(dropFiles);
        setFiles(fileList);
      }
      for (const dropFile of dropFiles) {
        const fileDetail = getFileDetail(dropFile.name, dropFile.size);
        fileDetails.push(fileDetail);
      }
      setDisplayFilesDetail(fileDetails);
    }
  };

  useEffect(() => {
    validationUploadFiles();
  }, [files]);

  useEffect(() => {
    setSchemaErrorMessage(schemaError);
  }, [schemaError]);

  const validationUploadFiles = () => {
    onValidateFile(true);
    if (files) {
      // New logic: single XML upload mode
      if (isXmlOnlyMode) {
        if (files.length === 0) {
          setValidationErrorMessage("");
          return;
        }
        if (files.length > 1) {
          setValidationErrorMessage("Please upload a single XML file (only one file allowed).");
          return;
        }

        const xmlFile = files[0];
        const hasOverSizeFile =
          xmlFile.size >= maxFileSize * fileSizeBase * fileSizeBase;

        if (hasOverSizeFile) {
          setValidationErrorMessage(fileSizeOverLimitaionError);
          return;
        }

        if (!isXmlFile(xmlFile)) {
          setValidationErrorMessage(invalidFileError);
          return;
        }

        setValidationErrorMessage("");
        onValidateFile(false);
        onFilesReady([xmlFile]);
        return;
      }

      switch (files.length) {
        case 0:
          setValidationErrorMessage("");
          // setValidationError(true);
          break;
        case 1:
          switch (files[0].type) {
            case fileTypePDF:
              setValidationErrorMessage(missXMLError);
              break;
            case fileTypeXML:
              setValidationErrorMessage(missPDFError);
              break;
            default:
              setValidationErrorMessage(invalidFileError);
              break;
          }
          break;
        case 2:
          validateFiles(files);
          break;
        default:
          setValidationErrorMessage(invalidFileError);
          // setValidationError(true);
          break;
      }
    }
  };

  const validateFiles = (files: FileList) => {
    const filesArray = Array.from(files);
    const PDFFile = filesArray.filter((file) => file.type === fileTypePDF);
    const XMLFile = filesArray.filter((file) => file.type === fileTypeXML);
    const hasOverSizeFile = filesArray.some(
      (file) => file.size >= maxFileSize * fileSizeBase * fileSizeBase
    );

    if (hasOverSizeFile) {
      setValidationErrorMessage(fileSizeOverLimitaionError);
    } else {
      if (PDFFile.length === 1 && XMLFile.length === 1) {
        setValidationErrorMessage("");
        onValidateFile(false);
        onFilesReady(filesArray);
      } else {
        setValidationErrorMessage(invalidFileError);
      }
    }
  };

  return (
    <div className="h-[40%]">
      {" "}
      <div
        className={`mb-2 ${
          size === "S" ? "h-70" : size === "M" ? "h-200" : "h-[300px]"
        } border border-dashed border-[#e0e0e0] rounded-md p-10 `}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="ml-7 mr-5">
          <input
            disabled={disable}
            name="file"
            id={id}
            ref={fileInputRef}
            type="file"
            accept={acceptValue}
            multiple={multiple}
            onChange={handleFileChange}
            onClick={handleFileClick}
            className="sr-only"
          />
          <label
            htmlFor={id}
            className="relative flex min-h-[50px] items-center justify-center  text-center p-100"
          >
            <div className="justify-center">
              <div className="flex items-center justify-center">
                <img src={uploadIcon} alt="" className="content-center" />
              </div>
              <span className="mb-2 block text-sm my-2">
                {title || ADD_DOCUMENT_CONSTANT.UPLOAD_FILE_TEXT}
              </span>
              <span className="inline-flex rounded border border-[#e0e0e0] py-2 px-7 text-base font-medium text-btn-gray-color bg-lightYellow-background">
                {ADD_DOCUMENT_CONSTANT.SELECT_FILES}
              </span>
            </div>
          </label>
          <div className="flex flex-wrap mb-5 mt-0">
            {displayFilesDetail.map((displayContent, index) => (
              <div className="flex my-2" key={index}>
                <p
                  className={`border-2 border-solid border-black border-opacity-30  px-5 py-2 rounded-md text-sm ${
                    isInvalidFile(index) &&
                    "border-invalid-file bg-invalid-file-background border-4"
                  }`}
                >
                  {displayContent}
                </p>
                <a
                  className="relative top-[-12px] left-[-13px] cursor-pointer"
                  onClick={() => removeFile(index)}
                >
                  <svg
                    className="h-6 w-6 text-white bg-black text-lg border-3 border-solid border-black rounded-full "
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M6 18L18 6M6 6l12 12" stroke="white" />
                  </svg>
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
      {validationErrorMessage && validationErrorMessage.length > 0 && (
        <div className="flex items-center mr-auto text-sm text-error-message-red">
          {validationErrorMessage}
        </div>
      )}
      {schemaErrorMessage && schemaErrorMessage.length > 0 && (
        <div className="flex items-center mr-auto text-sm text-error-message-red">
          {schemaErrorMessage}
        </div>
      )}
    </div>
  );
};

export default UploadFiles;
