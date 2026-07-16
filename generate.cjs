const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

// --- Paths & Directories ---
const projectRoot = __dirname;
const csvPath = path.join(projectRoot, 'emp details', 'Employee ID Card Information Form (Responses) - Sheet1.csv');
const photosDir = path.join(projectRoot, 'emp details');
const outputDir = path.join(projectRoot, 'ID CARDS');
const pdfDir = path.join(outputDir, 'pdf');
const jpegDir = path.join(outputDir, 'jpeg');
const svgDir = path.join(outputDir, 'svg');

// Create output folders if they do not exist
[outputDir, pdfDir, jpegDir, svgDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
});

// --- Mappers & Formatters ---
const formatDob = (dobStr) => {
  if (!dobStr) return '';
  const parts = dobStr.split('/');
  if (parts.length === 3) {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthIndex = parseInt(parts[0], 10) - 1;
    const day = parseInt(parts[1], 10);
    const year = parts[2].trim();
    if (monthIndex >= 0 && monthIndex < 12 && !isNaN(day) && year.length === 4) {
      const dayStr = day < 10 ? `0${day}` : `${day}`;
      return `${dayStr} ${monthNames[monthIndex]} ${year}`;
    }
  }
  return dobStr.trim();
};

const formatBloodGroup = (bgStr) => {
  if (!bgStr) return 'O +ve';
  const clean = bgStr.trim().toUpperCase();
  if (clean.endsWith('+')) {
    return clean.slice(0, -1).trim() + ' +ve';
  }
  if (clean.endsWith('-')) {
    return clean.slice(0, -1).trim() + ' -ve';
  }
  return bgStr.trim();
};

const formatPhone = (phoneStr) => {
  if (!phoneStr) return '';
  const clean = phoneStr.trim();
  if (clean.length === 10) {
    return `+91 ${clean.slice(0, 5)} ${clean.slice(5)}`;
  }
  return clean;
};

// --- Parse CSV File ---
const parseCsv = () => {
  console.log(`Reading CSV file from: ${csvPath}`);
  if (!fs.existsSync(csvPath)) {
    throw new Error(`CSV file not found at ${csvPath}`);
  }
  
  const content = fs.readFileSync(csvPath, 'utf8');
  const lines = content.split(/\r?\n/).filter(line => line.trim() !== '');
  
  const headers = lines[0].split(',');
  console.log(`CSV Headers: ${headers.join(', ')}`);

  const employees = lines.slice(1).map((line, idx) => {
    const values = line.split(',');
    if (values.length < 7) {
      console.warn(`Skipping invalid line ${idx + 2}: ${line}`);
      return null;
    }

    const employeeId = values[0].trim();
    const fullName = values[1].trim();
    const dob = formatDob(values[2]);
    const bloodGroup = formatBloodGroup(values[3]);
    const position = values[4].trim();
    const email = values[5].trim();
    const phone = formatPhone(values[6]);

    return {
      idNumber: employeeId,
      name: fullName,
      dob,
      bloodGroup,
      role: position,
      email,
      phone
    };
  }).filter(Boolean);

  console.log(`Parsed ${employees.length} employees from CSV.`);
  return employees;
};

// --- Helper: Get Photo Base64 ---
const getPhotoBase64 = (name) => {
  const cleanName = name.trim();
  const possiblePaths = [
    path.join(photosDir, `${cleanName}.png`),
    path.join(photosDir, `${cleanName}.jpg`),
    path.join(photosDir, `${cleanName}.jpeg`),
  ];

  for (const photoPath of possiblePaths) {
    if (fs.existsSync(photoPath)) {
      const ext = path.extname(photoPath).toLowerCase().slice(1);
      const mime = ext === 'png' ? 'image/png' : 'image/jpeg';
      const fileBuffer = fs.readFileSync(photoPath);
      return `data:${mime};base64,${fileBuffer.toString('base64')}`;
    }
  }

  console.warn(`⚠️ Photo not found for "${cleanName}". Using empty photo placeholder.`);
  return '';
};

// --- Saver Helpers ---
const saveSvg = (dataUrl, filePath) => {
  let content = '';
  if (dataUrl.includes(';base64,')) {
    content = Buffer.from(dataUrl.split(';base64,')[1], 'base64').toString('utf8');
  } else {
    content = decodeURIComponent(dataUrl.split(',')[1]);
  }
  fs.writeFileSync(filePath, content, 'utf8');
};

const saveBinary = (dataUrl, filePath) => {
  const base64Part = dataUrl.split(';base64,')[1];
  fs.writeFileSync(filePath, Buffer.from(base64Part, 'base64'));
};

// --- Main Automation Process ---
const main = async () => {
  let browser;
  try {
    const employees = parseCsv();
    
    console.log('Launching headless browser...');
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    const localUrl = 'http://localhost:3000/';
    console.log(`Navigating to ${localUrl}...`);
    await page.goto(localUrl, { waitUntil: 'networkidle2' });

    console.log('Waiting for React application to mount...');
    await page.waitForFunction('typeof window.setEmployeeData === "function"', { timeout: 10000 });

    for (let i = 0; i < employees.length; i++) {
      const emp = employees[i];
      const filenameBase = emp.idNumber.toLowerCase();
      console.log(`\n[${i + 1}/${employees.length}] Generating card files for ${emp.name} (${emp.idNumber})...`);

      const photoBase64 = getPhotoBase64(emp.name);
      
      const employeePayload = {
        ...emp,
        photo: photoBase64
      };

      await page.evaluate((payload) => {
        window.setEmployeeData(payload);
      }, employeePayload);

      await new Promise(resolve => setTimeout(resolve, 800));

      const frontSvgData = await page.evaluate(async () => await window.getFrontSvg());
      const backSvgData = await page.evaluate(async () => await window.getBackSvg());
      const frontJpegData = await page.evaluate(async () => await window.getFrontJpeg());
      const backJpegData = await page.evaluate(async () => await window.getBackJpeg());
      const doublePdfData = await page.evaluate(async () => await window.getDoubleSidedPdf());

      if (frontSvgData && backSvgData) {
        saveSvg(frontSvgData, path.join(svgDir, `${filenameBase}_front.svg`));
        saveSvg(backSvgData, path.join(svgDir, `${filenameBase}_back.svg`));
        console.log(`  ✓ Saved SVGs: ${filenameBase}_front.svg, ${filenameBase}_back.svg`);
      } else {
        console.error(`  ✗ Error: Failed to retrieve SVGs for ${emp.name}`);
      }

      if (frontJpegData && backJpegData) {
        saveBinary(frontJpegData, path.join(jpegDir, `${filenameBase}_front.jpeg`));
        saveBinary(backJpegData, path.join(jpegDir, `${filenameBase}_back.jpeg`));
        console.log(`  ✓ Saved JPEGs: ${filenameBase}_front.jpeg, ${filenameBase}_back.jpeg`);
      } else {
        console.error(`  ✗ Error: Failed to retrieve JPEGs for ${emp.name}`);
      }

      if (doublePdfData) {
        saveBinary(doublePdfData, path.join(pdfDir, `${filenameBase}.pdf`));
        console.log(`  ✓ Saved PDF: ${filenameBase}.pdf (2-pages double-sided)`);
      } else {
        console.error(`  ✗ Error: Failed to retrieve PDF for ${emp.name}`);
      }
    }

    console.log('\n======================================');
    console.log(`Bulk generation completed successfully!`);
    console.log(`All files saved in directory: ${outputDir}`);
    console.log(`- PDFs saved: ${fs.readdirSync(pdfDir).length}`);
    console.log(`- JPEGs saved: ${fs.readdirSync(jpegDir).length}`);
    console.log(`- SVGs saved: ${fs.readdirSync(svgDir).length}`);
    console.log('======================================\n');

  } catch (err) {
    console.error('Error during bulk generator run:', err);
  } finally {
    if (browser) {
      await browser.close();
      console.log('Browser closed.');
    }
  }
};

main();
