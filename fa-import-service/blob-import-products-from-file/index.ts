import { AzureFunction, Context } from "@azure/functions";
import { BlobServiceClient } from "@azure/storage-blob";
import parseCsv from "../utils/parseCsv";

const SA_CONNECTION_STRING = process.env.AzureWebJobsStorage;

const blobTrigger: AzureFunction = async function (
  context: Context,
  blob: Buffer
): Promise<void> {

  const products = await parseCsv(blob);
  // Import placeholder
  context.log(products);

  const blobServiceClient =
    BlobServiceClient.fromConnectionString(SA_CONNECTION_STRING);
  const uploadedContainerName = "uploaded";
  const parsedContainerName = "parsed";
  const uploadedContainerClient = blobServiceClient.getContainerClient(
    uploadedContainerName
  );
  const parsedContainerClient =
    blobServiceClient.getContainerClient(parsedContainerName);
  const sourceBlobClient = uploadedContainerClient.getBlobClient(
    context.bindingData.name
  );

  const targetBlobClient = parsedContainerClient.getBlobClient(
    context.bindingData.name
  );

  await targetBlobClient.beginCopyFromURL(sourceBlobClient.url);

  sourceBlobClient.delete();
};

export default blobTrigger;
