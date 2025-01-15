import { useState } from "react";
import JSZip from "jszip";
import styled from "styled-components";

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px;
`;

const Header = styled.header`
  text-align: center;
  margin-bottom: 40px;
`;

const Title = styled.h1`
  color: ${(props) => props.theme.colors.primary};
  font-size: 2.5em;
`;

const Subtitle = styled.p`
  color: ${(props) => props.theme.colors.secondary};
  font-size: 1.2em;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #2a2a2a;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const FileInput = styled.input`
  margin: 20px 0;
`;

const Button = styled.button`
  background-color: ${(props) => props.theme.colors.primary};
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
  border-radius: 4px;

  &:hover {
    background-color: ${(props) => props.theme.colors.secondary};
  }

  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

const StatusMessage = styled.p`
  text-align: center;
  color: ${(props) => (props.error ? "#f44336" : props.theme.colors.primary)};
  font-weight: bold;
`;

const ImageContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 40px;
`;

const Image = styled.img`
  max-width: 100%;
  height: auto;
  border-radius: 8px;
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

      // Adicionar novos arquivos do repositório GitHub
      const addLocalFileToZip = (zip, fileContent, fileName) => {
        return new Promise((resolve, reject) => {
          zip.file(fileName, fileContent);
          resolve();
        });
      };

      const filesToAdd = [
        { url: "https://github.com/williamfolle/teleportconvert/blob/870f545678d13bd978cecc27f9f972ce84153343/LLWebServerExtended.js", name: "LLWebServerExtended.js" },
        { url: "https://github.com/williamfolle/teleportconvert/blob/870f545678d13bd978cecc27f9f972ce84153343/scriptcustom.js", name: "scriptcustom.js" },
        { url: "https://github.com/williamfolle/teleportconvert/blob/870f545678d13bd978cecc27f9f972ce84153343/ew-log-viewer.js", name: "ew-log-viewer.js" },
      ];

      for (const file of filesToAdd) {
        const response = await fetch(file.url);
        const blob = await response.blob();
        await addLocalFileToZip(newZip, blob, file.name);
      }

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
      <Header>
        <ImageContainer>
          <Image
            src="/foto.png"
            alt="Descrição da minha imagem"
            width={800}
            height={300}
          />
        </ImageContainer>
        <Subtitle>
          Upload, process, and download modified ZIP files with ease
        </Subtitle>
      </Header>
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