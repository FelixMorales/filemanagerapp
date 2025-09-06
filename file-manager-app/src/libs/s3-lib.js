import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { buffer } from 'node:stream/consumers';

const s3 = new S3Client({});

/**
 * Download a file from S3
 * @param {string} key - S3 object key
 * @returns {Promise<ArrayBufferLike>} - file content as Buffer
 */
export async function getFile(key) {
  console.log(`Getting file buffer from key: ${key}`);

  const data = await s3.send(
    new GetObjectCommand({ Bucket: process.env.BUCKET_NAME, Key: key })
  );

  const fileBuffer = await buffer(data.Body);

  return fileBuffer;
}

/**
 * Upload a file to S3
 * @param {string} key - S3 object key
 * @param {Buffer} body - file content (Buffer)
 * @param {string} contentType - MIME type of the file
 * @returns {Promise<AWS.S3.PutObjectOutput>}
 */
export async function uploadFile(key, body, contentType) {
  console.log(`Uploading file: ${key}`);

  return s3.send(
      new PutObjectCommand({
        Bucket: process.env.BUCKET_NAME,
        Key: key,
        Body: body,
        ContentType: contentType,
      })
    )
}
