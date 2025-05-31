# Wallet Service – API & Kafka Testing Guide

## 1. Prerequisites

- MongoDB, Redis, and Kafka running locally (or update `.env` for remote services).
- `.env` file configured with all required variables.
- Service running:
  ```sh
  bun run src/index.ts
  ```
- Tools:
  - [curl](https://curl.se/) or [httpie](https://httpie.io/) for API testing
  - [kcat](https://github.com/edenhill/kcat) or [kafka-console-producer.sh](https://kafka.apache.org/documentation/#console-tools) for Kafka testing
  - Or use Postman/Insomnia for API

---

## 2. API Endpoints

### Health Check
```sh
curl http://localhost:3001/health
```
**Expected:**
```json
{ "status": "ok" }
```

---

### Kafka Status/Debug
```sh
curl http://localhost:3001/kafka-status
```
**Expected:**
JSON with Kafka connection status, last event, last message, and last error (if any).

---

### Create Wallet Addresses
```sh
curl -X POST http://localhost:3001/api/v1/wallets/create-address \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json"
```
**Expected:**
Returns EVM and NON_EVM wallet info for the user.

---

### Withdraw Request
```sh
curl -X POST http://localhost:3001/api/v1/wallets/withdraw \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"currency":"BTC","amount":0.01}'
```
**Expected:**
Returns a pending withdrawal transaction if balance and currency checks pass.

---

### Admin Withdraw Accept/Reject
```sh
curl -X POST http://localhost:3001/api/v1/admin/withdraw/accept \
  -H "Authorization: Bearer <ADMIN_JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"txId":"<transaction_id>","approve":true,"userId":"<user_id>","symbol":"BTC","amount":0.01,"address":"<btc_address>"}'
```
Or to reject:
```sh
-d '{"txId":"<transaction_id>","approve":false,"reason":"Not enough KYC"}'
```

---

## 3. Testing Kafka Deposit Events

### Send a Deposit Event to Kafka

**With kcat:**
```sh
echo '{"userId":"<user_id>","currency":"BTC","amount":0.02,"txHash":"testhash123"}' | \
kcat -b localhost:9092 -t deposit-events -P
```

**With kafka-console-producer.sh:**
```sh
kafka-console-producer.sh --broker-list localhost:9092 --topic deposit-events
>{"userId":"<user_id>","currency":"BTC","amount":0.02,"txHash":"testhash123"}
```

**Expected:**
- The service logs the event (see `/kafka-status` or console output).
- If the deposit meets or exceeds the min deposit, the user's wallet balance is updated and a transaction is created.

---

## 4. Debugging & Logs

- **Check Kafka status:**
  `curl http://localhost:3001/kafka-status`
- **Check logs:**
  Console output will show all Kafka events, errors, and API activity.
- **Check MongoDB/Redis:**
  Use MongoDB Compass or `mongo` shell to inspect wallet, transaction, and deposit hash collections.

---

## 5. JWT Authentication

- All user endpoints require a valid JWT in the `Authorization` header.
- Admin endpoints require a JWT with `role: admin`.

### Example JWT Payloads

- **User:**
  ```json
  { "sub": "user123", "role": "user" }
  ```
- **Admin:**
  ```json
  { "sub": "admin123", "role": "admin" }
  ```

### Example JWTs (HS256, secret: `your_jwt_secret`)

- **User JWT:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyMTIzIiwicm9sZSI6InVzZXIiLCJpYXQiOjE2ODU1MDAwMDB9.2QwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQw
```
- **Admin JWT:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbjEyMyIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTY4NTUwMDAwMH0.2QwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQw
```
> **Note:** Replace with real JWTs generated using your `JWT_SECRET`.

---

## 6. Troubleshooting

- If `/health` or `/kafka-status` do not respond, check service logs and ensure all dependencies are running.
- If Kafka events are not processed, check the Kafka broker address in `.env` and the topic name.

--- 