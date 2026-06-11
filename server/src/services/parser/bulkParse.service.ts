import * as XLSX from 'xlsx';

const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/i;

const cleanName = (rawName: string): string => {
  let cleaned = rawName.replace(/[<>[\](),;:|_-]/g, ' ').trim();
  // Strip leading numbers and standard separators (dot, dash, slash, parenthesis, space)
  cleaned = cleaned.replace(/^\d+[\s\.\-\/\)]*/, '');
  // Clean multiple spaces
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  return cleaned;
};

export async function parsePdfBuffer(buffer: Buffer): Promise<{ name: string; email: string }[]> {
  try {
    const { getDocumentProxy } = await import('unpdf');
    const pdf = await getDocumentProxy(new Uint8Array(buffer));
    
    let text = '';
    
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      let lastY: number | null = null;
      let pageText = '';
      
      // Sort items by Y descending, then by X ascending
      const items = [...textContent.items] as any[];
      items.sort((a, b) => {
        const yA = a.transform[5];
        const yB = b.transform[5];
        const xA = a.transform[4];
        const xB = b.transform[4];
        
        if (Math.abs(yA - yB) > 2) {
          return yB - yA;
        }
        return xA - xB;
      });

      for (let item of items) {
        const currentY = item.transform[5];
        if (lastY === null) {
          pageText += item.str;
        } else if (Math.abs(currentY - lastY) <= 2) {
          pageText += ' ' + item.str;
        } else {
          pageText += '\n' + item.str;
        }
        lastY = currentY;
      }
      
      text += pageText + '\n';
    }

    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    const results: { name: string; email: string }[] = [];
    const seenEmails = new Set<string>();

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const match = line.match(emailRegex);
      if (match) {
        const email = match[0].toLowerCase().trim();
        if (seenEmails.has(email)) continue;
        seenEmails.add(email);

        // Look for name in same line (excluding email)
        const nameCandidate = line.replace(match[0], '').trim();
        let name = cleanName(nameCandidate);
        
        // If empty/short, try checking the previous line
        if ((!name || name.length < 2) && i > 0) {
          const prevLine = lines[i - 1];
          if (!emailRegex.test(prevLine)) {
            name = cleanName(prevLine);
          }
        }

        if (!name || name.length < 2) {
          // Fallback username format
          const username = email.split('@')[0];
          name = cleanName(username.split(/[._-]/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '));
        }

        if (!name || name.length < 2) {
          name = "Representative";
        }

        results.push({ name, email });
      }
    }

    return results;
  } catch (error: any) {
    throw new Error(`Failed to parse PDF: ${error.message}`);
  }
}

export function parseExcelBuffer(buffer: Buffer): { name: string; email: string }[] {
  try {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
    const results: { name: string; email: string }[] = [];
    const seenEmails = new Set<string>();

    for (const row of rows) {
      if (!Array.isArray(row)) continue;
      let email = '';
      let name = '';

      for (const cell of row) {
        if (cell !== null && cell !== undefined) {
          const cellStr = String(cell).trim();
          const match = cellStr.match(emailRegex);
          if (match) {
            email = match[0].toLowerCase();
            break;
          }
        }
      }

      if (email) {
        if (seenEmails.has(email)) continue;
        seenEmails.add(email);

        for (const cell of row) {
          if (cell !== null && cell !== undefined) {
            const cellStr = String(cell).trim();
            if (!cellStr.match(emailRegex)) {
              const cleaned = cleanName(cellStr);
              const words = cleaned.split(/\s+/);
              if (cleaned.length > 2 && words.length >= 1 && words.length <= 4) {
                name = cleaned;
                break;
              }
            }
          }
        }

        if (!name) {
          const username = email.split('@')[0];
          name = cleanName(username.split(/[._-]/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '));
        }

        if (!name || name.length < 2) {
          name = "Representative";
        }

        results.push({ name, email });
      }
    }

    return results;
  } catch (error: any) {
    throw new Error(`Failed to parse spreadsheet: ${error.message}`);
  }
}
