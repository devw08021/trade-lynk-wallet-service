import { Kafka, Consumer, EachMessagePayload } from 'kafkajs';
import { walletService } from './wallet.service';

const kafka = new Kafka({
  clientId: 'wallet-service',
  brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
});

const consumer: Consumer = kafka.consumer({ groupId: 'wallet-group' });

// Kafka status for health/debug
let kafkaStatus = {
  connected: false,
  lastMessage: null as null | any,
  lastError: null as null | any,
  lastEvent: '',
};

export async function startDepositConsumer() {
  try {
    await consumer.connect();
    kafkaStatus.connected = true;
    kafkaStatus.lastEvent = 'Connected to Kafka';
    console.log('[Kafka] Connected to broker');
    await consumer.subscribe({ topic: 'deposit-events', fromBeginning: false });
    kafkaStatus.lastEvent = 'Subscribed to deposit-events';
    console.log('[Kafka] Subscribed to topic: deposit-events');

    await consumer.run({
      eachMessage: async (payload: EachMessagePayload) => {
        try {
          const { topic, partition, message } = payload;
          const deposit = JSON.parse(message?.value?.toString() || '{}');
          kafkaStatus.lastMessage = { topic, partition, offset: message.offset, deposit };
          kafkaStatus.lastEvent = 'Received deposit event';
          console.log(`[Kafka] Received message:`, kafkaStatus.lastMessage);
          await walletService.handleDeposit(deposit);
          kafkaStatus.lastEvent = 'Processed deposit event';
        } catch (err) {
          kafkaStatus.lastError = err;
          kafkaStatus.lastEvent = 'Error processing deposit event';
          console.error('[Kafka] Error processing deposit event:', err);
        }
      },
    });
  } catch (err) {
    kafkaStatus.lastError = err;
    kafkaStatus.lastEvent = 'Kafka connection/subscription error';
    console.error('[Kafka] Error initializing consumer:', err);
  }
}

export function getKafkaStatus() {
  return kafkaStatus;
} 