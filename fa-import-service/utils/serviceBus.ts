import { ServiceBusClient } from "@azure/service-bus";

const serviceBusConnectionString = process.env.ServiceBusConnectionString;
const queueName = "products-queue";

export const sendProductToQueue = async (product: any) => {
  const serviceBusClient = new ServiceBusClient(serviceBusConnectionString);
  const sender = serviceBusClient.createSender(queueName);

  const message = { body: { product } };

  try {
    await sender.sendMessages(message);
  } catch (error) {
    throw error;
  } finally {
    await sender.close();
    await serviceBusClient.close();
  }
};
