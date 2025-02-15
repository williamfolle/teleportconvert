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

      const processFiles = async () => {
        for (const [path, file] of Object.entries(content.files)) {
          let newPath = path.includes('public/') ? path.replace('public/', 'img/') : path;
          
          if (file.dir) {
            newZip.folder(newPath);
          } else {
            // Check if the file is a text file
            if (path.endsWith('.html') || path.endsWith('.css') || path.endsWith('.js')) {
              // Process text files as string and replace paths
              let fileContent = await file.async("string");
              fileContent = fileContent.replace(/public\//g, 'img/');
              fileContent = fileContent.replace(/public%2F/g, 'img%2F');
              newZip.file(newPath, fileContent);
            } else {
              // Handle binary files (images) with uint8array
              const fileContent = await file.async("uint8array");
              newZip.file(newPath, fileContent);
            }
          }
        }
      };

      await processFiles();

      // Add GitHub files
      const filesToAdd = [
        { 
          url: "https://raw.githubusercontent.com/williamfolle/teleportconvert/a49f2eac33fee94ce0bc2d2b22af8d9e73e8f773/LLWebServerExtended.js", 
          name: "LLWebServerExtended.js" 
        },
        { 
          url: "https://raw.githubusercontent.com/williamfolle/teleportconvert/a49f2eac33fee94ce0bc2d2b22af8d9e73e8f773/scriptcustom.js", 
          name: "scriptcustom.js" 
        },
        { 
          url: "https://raw.githubusercontent.com/williamfolle/teleportconvert/a49f2eac33fee94ce0bc2d2b22af8d9e73e8f773/ew-log-viewer.js", 
          name: "ew-log-viewer.js" 
        }
      ];

      for (const file of filesToAdd) {
        try {
          const response = await fetch(file.url);
          if (!response.ok) {
            throw new Error(`Failed to fetch ${file.name}`);
          }
          const content = await response.text();
          newZip.file(file.name, content);
        } catch (error) {
          console.error("Error fetching file:", error);
          setStatus(`Error fetching ${file.name}`);
          setProcessing(false);
          return;
        }
      }

      // Generate and download ZIP
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