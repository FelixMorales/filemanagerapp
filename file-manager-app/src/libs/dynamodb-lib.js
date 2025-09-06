import { DynamoDBClient, PutItemCommand, UpdateItemCommand, GetItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";

const dynamodb = new DynamoDBClient({});

/**
 * Insert file basic metadata into DynamoDB
 * @typedef {Object} BasicFileInfo
 * @property {string} file_id
 * @property {string} file_type
 * @property {string} s3_key
 * @property {string} file_name
 * @property {string} [author]
 * @property {string} [expiration_date]
 * @param {BasicFileInfo} fileInfo 
 */
export async function insertBasicFileInfo(fileInfo) {
  console.log(`Inserting file info | fileId: ${fileInfo.file_id}`);

  await dynamodb.send(
    new PutItemCommand({
      TableName: process.env.TABLE_NAME,
      Item: {
        file_id: { S: fileInfo.file_id },
        file_type: { S: fileInfo.file_type },
        s3_key: { S: fileInfo.s3_key },
        file_name: { S: fileInfo.file_name },
        author: { S: fileInfo.author || "unknown" },
        expiration_date: { S: fileInfo.expiration_date },
      },
    })
  );
}


/**
 * Update metadata for a file in DynamoDB (update command to avoid overriding existing fields)
 * @typedef {Object} BasicMetadata
 * @property {number} file_size
 * @property {string} uploaded_at
 * @property {number} [pages]
 * @property {number} [csv_rows]
 * @property {string} [csv_columns]
 * @param {Metadata} metadata 
 * @param {string} fileId 
 */
export async function updateMetadata(fileId, metadata) {
  console.log(`Updating file metadata | fileId: ${fileId} | metadata: ${JSON.stringify(metadata)}`);

  const { file_size, pages, csv_rows, csv_columns, uploaded_at } = metadata;

  const updateExpressions = ["file_size = :file_size", "uploaded_at = :uploaded_at"];

  const expressionValues = {
    ":file_size": file_size,
    ":uploaded_at": uploaded_at
  };

  if (pages !== undefined) {
    expressionValues[":pages"] = pages;
    updateExpressions.push("pages = :pages");
  }

  if (csv_rows !== undefined) {
    expressionValues[":csv_rows"] = csv_rows;
    updateExpressions.push("csv_rows = :csv_rows");
  }

  if (csv_columns !== undefined) {
    expressionValues[":csv_columns"] = csv_columns;
    updateExpressions.push("csv_columns = :csv_columns");
  }

  const params = {
    TableName: process.env.TABLE_NAME,
    Key: marshall({ file_id: fileId }),
    UpdateExpression: "SET " + updateExpressions.join(", "),
    ExpressionAttributeValues: marshall(expressionValues, { removeUndefinedValues: true })
  };

  await dynamodb.send(new UpdateItemCommand(params));
}

/**
 * Retrieve file metadata from DynamoDB by file_id
 * @param {string} fileId
 * 
 * @typedef {Object} FullMetadata
 * @property {string} file_id
 * @property {string} file_type
 * @property {string} s3_key
 * @property {string} file_name
 * @property {number} [file_size]
 * @property {string} [author]
 * @property {string} [expiration_date]
 * @property {number} [pages]
 * @property {number} [csv_rows]
 * @property {string} [csv_columns]
 * @property {string} [uploaded_at]
 * @param {FullMetadata} metadata 
 * 
 * @returns {Promise<FullMetadata|null>} Returns object with metadata or null if not found
 */
export async function getFileMetadata(fileId) {
  
  console.log(`Getting file metadata | fileId: ${fileId}`)

  const params = {
    TableName: process.env.TABLE_NAME,
    Key: {
      file_id: { S: fileId }
    }
  };

  const result = await dynamodb.send(new GetItemCommand(params));

  if (!result.Item) return null;

  return {
    file_id: result.Item.file_id.S,
    file_type: result.Item.file_type?.S,
    s3_key: result.Item.s3_key?.S,
    file_name: result.Item.file_name?.S,
    author: result.Item.author?.S,
    expiration_date: result.Item.expiration_date?.S,
    file_size: result.Item.file_size?.N ? Number(result.Item.file_size.N) : undefined,
    pages: result.Item.pages?.N ? Number(result.Item.pages.N) : undefined,
    csv_rows: result.Item.csv_rows?.N ? Number(result.Item.csv_rows.N) : undefined,
    csv_columns: result.Item.csv_columns?.S,
    uploaded_at: result.Item.uploaded_at?.S
  };
}
