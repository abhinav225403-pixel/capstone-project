const puppeteer = require('./server/node_modules/puppeteer-core');
const path = require('path');
const fs = require('fs');

async function generatePDF() {
  const possiblePaths = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  ];

  let executablePath = '';
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      executablePath = p;
      break;
    }
  }

  if (!executablePath) {
    console.error('No suitable browser found for PDF generation.');
    process.exit(1);
  }

  console.log(`Using browser at: ${executablePath}`);

  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  });

  const page = await browser.newPage();
  const htmlPath = path.resolve(__dirname, 'INTERNSHIP_PROJECT_REPORT.html');
  const fileUrl = `file://${htmlPath.replace(/\\/g, '/')}`;

  console.log(`Loading HTML from: ${fileUrl}`);
  await page.goto(fileUrl, { waitUntil: 'networkidle0' });

  const pdfPath = path.resolve(__dirname, 'ICTAK_Internship_Report_DevPulse.pdf');
  await page.pdf({
    path: pdfPath,
    format: 'A4',
    printBackground: true,
    margin: {
      top: '15mm',
      bottom: '15mm',
      left: '15mm',
      right: '15mm',
    },
  });

  console.log(`✅ PDF successfully generated at: ${pdfPath}`);
  await browser.close();
}

generatePDF().catch((err) => {
  console.error('PDF generation error:', err);
  process.exit(1);
});
