import { useState } from "react";
import JSZip from "jszip";
import styled from "styled-components";

const Container = styled.div`
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
`;

const Title = styled.h1`
  color: #333;
  text-align: center;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const FileInput = styled.input`
  margin: 20px 0;
`;

const Button = styled.button`
  background-color: #4caf50;
  border: none;
  color: white;
  padding: 15px 32px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
  margin: 4px 2px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #45a049;
  }

  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

const StatusMessage = styled.p`
  text-align: center;
  color: ${(props) => (props.error ? "#f44336" : "#4CAF50")};
`;

export default function Home() {
  const [file, setFile] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [status, setStatus] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setStatus("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    setProcessing(true);
    setStatus("Processing...");

    const zip = new JSZip();
    const newZip = new JSZip();

    try {
      const content = await zip.loadAsync(file);

      // Renomear a pasta 'public' para 'img'
      for (const [path, file] of Object.entries(content.files)) {
        if (path.startsWith("public/")) {
          const newPath = path.replace("public/", "img/");
          if (file.dir) {
            newZip.folder(newPath);
          } else {
            const content = await file.async("uint8array");
            newZip.file(newPath, content);
          }
        } else {
          if (file.dir) {
            newZip.folder(path);
          } else {
            const content = await file.async("uint8array");
            newZip.file(path, content);
          }
        }
      }

      // Processar arquivos HTML e CSS
      for (const [path, file] of Object.entries(newZip.files)) {
        if (path.endsWith(".html") || path.endsWith(".css")) {
          let content = await file.async("string");
          content = content.replace(/public\//g, "img/");
          newZip.file(path, content);
        }
      }

      // Adicionar novos arquivos
      newZip.file(
        "LLWebServerExtended.js",
        'console.log("LLWebServerExtended");',
      );
      newZip.file("scriptcustom.js", 'console.log("scriptcustom");');
      newZip.file("ew-log-viewer.js", 'console.log("ew-log-viewer");');

      // Gerar e baixar o novo ZIP
      const blob = await newZip.generateAsync({ type: "blob" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "modified.zip";
      a.click();
      window.URL.revokeObjectURL(url);

      setStatus("ZIP file processed and downloaded successfully!");
    } catch (error) {
      console.error("Error processing ZIP:", error);
      setStatus("Error processing ZIP file. Please try again.");
    }

    setProcessing(false);
  };

  return (
    <Container>
      <Title>ZIP File Processor</Title>
      <Form onSubmit={handleSubmit}>
        <FileInput type="file" accept=".zip" onChange={handleFileChange} />
        <Button type="submit" disabled={!file || processing}>
          {processing ? "Processing..." : "Process ZIP"}
        </Button>
      </Form>
      {status && (
        <StatusMessage error={status.includes("Error")}>{status}</StatusMessage>
      )}
    </Container>
  );
}
