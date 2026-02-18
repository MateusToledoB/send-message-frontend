import { useState } from 'react';
import './index.css';

function IndexPage() {
  const [template, setTemplate] = useState('boas-vindas');
  const [fileName, setFileName] = useState('');

  const handleFileChange = (event) => {
    const [file] = event.target.files;
    setFileName(file ? file.name : '');
  };

  const handleSubmit = (event) => {
    event.preventDefault();
  };

  return (
    <div className="dashboard-page">
      <aside className="dashboard-sidebar">
        <h1 className="sidebar-title">Send Message</h1>
        <nav className="sidebar-menu">
          <button type="button">Historico</button>
          <button type="button">Ajuda</button>
          <button type="button">Sair</button>
        </nav>
      </aside>

      <main className="dashboard-main">
        <div className="dashboard-topbar" aria-hidden="true" />

        <form className="dashboard-form" onSubmit={handleSubmit}>
          <label htmlFor="template" className="field-title">
            Qual template deseja enviar?
          </label>

          <select
            id="template"
            value={template}
            onChange={(event) => setTemplate(event.target.value)}
          >
            <option value="boas-vindas">Boas-vindas</option>
            <option value="follow-up">Follow-up</option>
            <option value="cobranca">Cobranca</option>
          </select>

          <label htmlFor="xlsx-file" className="file-button">
            Escolher arquivo .xlsx
          </label>
          <input
            id="xlsx-file"
            className="file-input-hidden"
            type="file"
            accept=".xlsx"
            onChange={handleFileChange}
            aria-label="Upload de arquivo xlsx"
          />

          <button type="submit">Enviar</button>

          {fileName && <p className="file-name">Arquivo selecionado: {fileName}</p>}
        </form>

        <footer className="dashboard-footer">© 2026 • Desenvolvido por Time de Inovação e Projetos (TIP)</footer>
      </main>
    </div>
  );
}

export default IndexPage;
