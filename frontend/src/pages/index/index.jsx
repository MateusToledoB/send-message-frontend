import { useState } from 'react';
import { sendFolhaPontoAtivos } from '../../services/api';
import './index.css';

let xlsxModulePromise;

function loadXlsxModule() {
  if (!xlsxModulePromise) {
    xlsxModulePromise = import(/* @vite-ignore */ 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/+esm');
  }

  return xlsxModulePromise;
}

function IndexPage() {
  const TEMPLATE_FOLHA = 'folha-de-ponto';
  const [template, setTemplate] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [columns, setColumns] = useState([]);
  const [nameColumn, setNameColumn] = useState('');
  const [competencyColumn, setCompetencyColumn] = useState('');
  const [phoneColumn, setPhoneColumn] = useState('');
  const [fileError, setFileError] = useState('');
  const [submitMessage, setSubmitMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const resetFolhaFields = () => {
    setUploadedFile(null);
    setFileName('');
    setColumns([]);
    setNameColumn('');
    setCompetencyColumn('');
    setPhoneColumn('');
    setFileError('');
    setSubmitMessage('');
    setSubmitting(false);
  };

  const handleTemplateChange = (event) => {
    const nextTemplate = event.target.value;
    setTemplate(nextTemplate);

    if (nextTemplate !== TEMPLATE_FOLHA) {
      resetFolhaFields();
    }
  };

  const handleFileChange = async (event) => {
    const [file] = event.target.files;

    if (!file) {
      resetFolhaFields();
      return;
    }

    setUploadedFile(file);
    setFileName(file.name);
    setFileError('');
    setSubmitMessage('');

    try {
      const xlsx = await loadXlsxModule();
      const buffer = await file.arrayBuffer();
      const workbook = xlsx.read(buffer, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];

      if (!firstSheetName) {
        throw new Error('Arquivo sem planilha.');
      }

      const firstSheet = workbook.Sheets[firstSheetName];
      const rows = xlsx.utils.sheet_to_json(firstSheet, { header: 1, blankrows: false });
      const [headerRow = []] = rows;
      const parsedColumns = headerRow.map((value) => String(value).trim()).filter(Boolean);

      if (parsedColumns.length === 0) {
        throw new Error('Nao foi possivel identificar colunas no cabecalho.');
      }

      setColumns(parsedColumns);
      setNameColumn((currentValue) => (parsedColumns.includes(currentValue) ? currentValue : ''));
      setCompetencyColumn((currentValue) =>
        parsedColumns.includes(currentValue) ? currentValue : '',
      );
      setPhoneColumn((currentValue) => (parsedColumns.includes(currentValue) ? currentValue : ''));
    } catch {
      setUploadedFile(null);
      setColumns([]);
      setNameColumn('');
      setCompetencyColumn('');
      setPhoneColumn('');
      setFileError(
        'Nao foi possivel ler o arquivo. Verifique conexao e se o .xlsx possui cabecalho na primeira linha.',
      );
    }
  };

  const isFolhaReady =
    Boolean(uploadedFile) &&
    Boolean(nameColumn) &&
    Boolean(competencyColumn) &&
    Boolean(phoneColumn) &&
    !fileError;

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (template !== TEMPLATE_FOLHA) {
      return;
    }

    if (!isFolhaReady) {
      setSubmitMessage('Preencha todos os campos obrigatorios antes de enviar.');
      return;
    }

    setSubmitting(true);
    setSubmitMessage('');

    try {
      const response = await sendFolhaPontoAtivos({
        file: uploadedFile,
        columnName: nameColumn,
        columnMonth: competencyColumn,
        columnContact: phoneColumn,
      });

      const publishedMessages = response?.published_messages;

      if (publishedMessages == null || publishedMessages === 0) {
        setSubmitMessage('Nao tem mensagens para serem enviadas.');
      } else if (publishedMessages > 0) {
        setSubmitMessage(`As mensagens vao ser enviadas (${publishedMessages}).`);
      } else {
        setSubmitMessage('Folha de ponto enviada com sucesso.');
      }
    } catch {
      setSubmitMessage('Erro ao enviar folha de ponto.');
    } finally {
      setSubmitting(false);
    }
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
        <p className="sidebar-tip-signature">TIP - Time de Inovacao e Projetos</p>
      </aside>

      <main className="dashboard-main">
        <form className="dashboard-form" onSubmit={handleSubmit}>
          <label htmlFor="template" className="field-title">
            Qual template deseja enviar?
          </label>

          <select id="template" value={template} onChange={handleTemplateChange}>
            <option value="" disabled>
              Selecione uma opcao
            </option>
            <option value={TEMPLATE_FOLHA}>Folha de ponto ativos</option>
            <option value="boas-vindas">Folha de ponto inativos</option>
            <option value="follow-up">Folha de ponto ativos torre</option>
            <option value="cobranca">Vagas</option>
          </select>

          {template === TEMPLATE_FOLHA && (
            <>
              <label htmlFor="xlsx-file" className="file-button">
                Upload file
              </label>
              <input
                id="xlsx-file"
                className="file-input-hidden"
                type="file"
                accept=".xlsx"
                onChange={handleFileChange}
                aria-label="Upload de arquivo xlsx"
              />

              {fileName && <p className="file-name">Arquivo selecionado: {fileName}</p>}
              {fileError && <p className="file-error">{fileError}</p>}

              <div className="message-box">
                <p>
                  Ola,{' '}
                  <select
                    className="inline-select"
                    value={nameColumn}
                    onChange={(event) => setNameColumn(event.target.value)}
                    disabled={columns.length === 0}
                  >
                    <option value="">Selecione a coluna de nome</option>
                    {columns.map((column) => (
                      <option key={`name-${column}`} value={column}>
                        {column}
                      </option>
                    ))}
                  </select>
                  .
                </p>
                <p>
                  Comunicado administrativo: registro de folha de ponto referente a{' '}
                  <select
                    className="inline-select"
                    value={competencyColumn}
                    onChange={(event) => setCompetencyColumn(event.target.value)}
                    disabled={columns.length === 0}
                  >
                    <option value="">Selecione a coluna de competencia</option>
                    {columns.map((column) => (
                      <option key={`competency-${column}`} value={column}>
                        {column}
                      </option>
                    ))}
                  </select>{' '}
                  disponivel no GPSVC para assinatura.
                </p>
                <p>Em caso de duvidas, contate seu supervisor.</p>
              </div>

              <label htmlFor="phone-column" className="field-title">
                Coluna com os numeros para envio
              </label>
              <select
                id="phone-column"
                value={phoneColumn}
                onChange={(event) => setPhoneColumn(event.target.value)}
                disabled={columns.length === 0}
              >
                <option value="">Selecione a coluna de numeros</option>
                {columns.map((column) => (
                  <option key={`phone-${column}`} value={column}>
                    {column}
                  </option>
                ))}
              </select>

              {submitMessage && <p className="file-name">{submitMessage}</p>}

              <button type="submit" disabled={!isFolhaReady || submitting}>
                {submitting ? 'Enviando...' : 'Enviar'}
              </button>
            </>
          )}
        </form>

      </main>
    </div>
  );
}

export default IndexPage;
