import * as dynamoLib from "../libs/dynamodb-lib.js";
import * as s3Lib from "../libs/s3-lib.js";
import { v4 as uuidv4 } from "uuid";
import parser from "lambda-multipart-parser";


/**
 * Lambda handler to upload file to S3 and store basic file info in DynamoDB
 * Triggers: API GATEWAY endpoint
 */
export const lambdaHandler = async (event) => {
  try {
    console.log("Incoming event:", JSON.stringify(event));

    // Parse multipart/form-data
    const result = await parser.parse(event);

    const { author, expirationDate } = result;
    const file = result.files[0];

    if (!file) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing file in request" }),
      };
    }

    const fileId = uuidv4();
    const fileKey = `${fileId}_${file.filename}`;

    await s3Lib.uploadFile(fileKey, file.content, file.contentType)

    await dynamoLib.insertBasicFileInfo({
      file_id: fileId,
      file_type: file.contentType,
      author: author,
      s3_key: fileKey,
      file_name: file.filename,
      expiration_date: expirationDate,
    })

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "File uploaded successfully",
        file_id: fileId,
      }),
    };
  } catch (err) {
    console.error("Upload failed:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "File upload failed",
        details: err.message,
      }),
    };
  }
};
