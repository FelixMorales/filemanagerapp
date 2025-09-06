
import { parse } from "csv-parse/sync";
import pdf from 'pdf-parse/lib/pdf-parse.js';

/**
 * Extracts metadata from a given fileBuffer based on the fileType
 * For PDFs -> Extracts number of pages
 * For CSVs -> Extract number of rows and column names
 * 
 * @param {Buffer} fileBuffer 
 * @param {String} fileType 
 * 
 * @typedef {Object} Metadata
 * @property {number} file_size
 * @property {number} [pages]
 * @property {number} [csv_rows]
 * @property {string} [csv_columns]
 * 
 * @returns {Promise<Metadata>}
 */
export async function extractMetadataFromFileBuffer(fileBuffer, fileType) {

    console.log(`Extracting metadata from file | fileType: ${fileType}`)

    const file_size = fileBuffer.length

    let pages, csvRows, csvColumns;

    // PDF metadata
    if (fileType === "application/pdf") {
        const pdfData = await pdf(fileBuffer);
        pages = pdfData.numpages;
    }

    // CSV metadata
    if (fileType === "text/csv") {
        const csvText = fileBuffer.toString("utf-8");
        const records = parse(csvText, { skip_empty_lines: true });
        csvRows = records.length;
        csvColumns = records[0]?.join(",") || "";
    }

    return {
        file_size: file_size,
        pages: pages,
        csv_rows: csvRows,
        csv_columns: csvColumns,
    }
}