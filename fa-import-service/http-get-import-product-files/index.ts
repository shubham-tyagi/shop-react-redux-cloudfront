import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import {
  BlobServiceClient,
  generateBlobSASQueryParameters,
  BlobSASPermissions,
  StorageSharedKeyCredential,
} from "@azure/storage-blob";

const SA_CONNECTION_STRING = process.env.AzureWebJobsStorage;

const containerName = "uploaded";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  const { name } = req.query;
  context.log("checking current");
  if (!name) {
    context.res = {
      status: 400,
      body: { message: "name param should be provided" },
    };

    return;
  }

  const blobServiceClient =
    BlobServiceClient.fromConnectionString(SA_CONNECTION_STRING);

  const containerClient = blobServiceClient.getContainerClient(containerName);
  const blobClient = containerClient.getBlobClient(name);
  const permissions = BlobSASPermissions.parse("w");

  const expiryTime = new Date();
  expiryTime.setHours(expiryTime.getHours() + 1);

  const sasToken = generateBlobSASQueryParameters(
    {
      blobName: name,
      containerName,
      permissions,
      startsOn: new Date(),
      expiresOn: expiryTime,
    },
    blobServiceClient.credential as StorageSharedKeyCredential
  ).toString();

  context.res = {
    body: `${blobClient.url}?${sasToken}`,
  };
};

export default httpTrigger;
