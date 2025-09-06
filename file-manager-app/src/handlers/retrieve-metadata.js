
import * as dynamoLib from "../libs/dynamodb-lib.js";

/**
 * Lambda handler to retrieve file metadata from DynamoDB
 * Triggers: API GATEWAY endpoint
 */
export const lambdaHandler = async (event) => {
  try {
    console.log("Incoming event:", JSON.stringify(event));

    const fileId = event.pathParameters?.file_id;
    if (!fileId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing file_id in path" }),
      };
    }

    const metadata = await dynamoLib.getFileMetadata(fileId)

     if (!metadata) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "File metadata not found" }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify(metadata),
    };
  } catch (err) {
    console.error("Error retrieving metadata:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal server error" }),
    };
  }
};
