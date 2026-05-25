const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

async function parseResume(file) {
  const { mimetype, buffer } = file;

  if (mimetype === 'application/pdf') {
    const data = await pdfParse(buffer);
    return data.text;
  }

  if (
    mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    mimetype === 'application/msword'
  ) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  throw new Error('Unsupported file type. Upload PDF or DOCX.');
}

module.exports = parseResume;