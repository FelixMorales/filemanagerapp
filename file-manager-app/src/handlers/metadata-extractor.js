
import * as dynamoLib from "../libs/dynamodb-lib.js";
import * as s3Lib from "../libs/s3-lib.js";
import * as metadataLib from "../libs/metadata-lib.js";

/**
 * Lambda handler to extract file metadata and store it in DynamoDB
 * Triggers: S3 object created
 */
export const lambdaHandler = async (event) => {
  try {
    console.log("Incoming event:", JSON.stringify(event));

    // S3 object info from event
    const record = event.Records[0];
    const bucket = record.s3.bucket.name;
    const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, " "));
    const fileId = key.split("_")[0];

    if(!fileId) {
      console.error(`missing fileId from S3ObjectKey | s3Key: ${key}`)
      return
    }

    const fileBuffer = await s3Lib.getFile(key);
    const currentFileMetadata = await dynamoLib.getFileMetadata(fileId);
    const metadata = await metadataLib.extractMetadataFromFileBuffer(fileBuffer, currentFileMetadata.file_type)

    await dynamoLib.updateMetadata(fileId, {
      file_size: metadata.file_size,
      pages: metadata.pages,
      csv_rows: metadata.csv_rows,
      csv_columns: metadata.csv_columns,
      uploaded_at: new Date().toISOString(),
    });
    
    console.log(`metadata-extractor lambda executed successfully | fileId: ${fileId}`)

  } catch (err) {
    console.error("Error extracting metadata: ", err);
    throw err
  }
};
