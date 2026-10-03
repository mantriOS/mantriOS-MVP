# AWS Lambda Email Poller (EventBridge + IMAP)

This replaces Zapier by automatically polling your inbox for new emails and forwarding them to your FastAPI `/process-email` endpoint.

---

## Architecture

- **AWS EventBridge (Cron)**: Fires every 1 minute (`rate(1 minute)`).
- **AWS Lambda (Python 3.12, `ap-south-1`)**:
  - Connects to your email inbox via SSL IMAP.
  - Queries for `UNSEEN` (unread) messages.
  - Parses subject, body (plain text or stripped HTML), and headers.
  - Posts JSON to `https://<YOUR_API_DOMAIN>/api/v1/zapier/process-email`.
  - Marks email as `\Seen` (Read) only upon HTTP 200 success from your API.
  - Leaves unread if an error occurs to ensure zero data loss.
- **Zero Third-Party Dependencies**: Uses standard Python libraries (`imaplib`, `email`, `urllib.request`), requiring no zip layers or package builds.

---

## Cost Analysis

- **AWS Lambda**:
  - 1 run per minute = ~43,920 invocations per month.
  - Free Tier provides **1,000,000 requests/month** and 3.2M compute seconds.
  - Monthly cost: **$0.00**.
- **Amazon EventBridge**:
  - Scheduled rule triggers are free.
  - Monthly cost: **$0.00**.
- **Total Ongoing Cost**: **$0.00 / month**.

---

## 1. Preparing Your Mailbox (e.g. Gmail / Google Workspace)

If using **Gmail** or **Google Workspace**:
1. Enable **2-Step Verification** in your Google Account security settings.
2. Go to **Google Account** > **Security** > **App passwords** (or search "App passwords").
3. Create a new App Password named `AWS-Email-Poller`.
4. Copy the generated 16-character password (e.g., `abcd efgh ijkl mnop`).

---

## 2. Local Testing (Optional)

You can test the poller locally on your machine before deploying to AWS:

```bash
export IMAP_SERVER="imap.gmail.com"
export IMAP_PORT="993"
export IMAP_USER="your-email@gmail.com"
export IMAP_PASSWORD="your-app-password"
export API_ENDPOINT="http://127.0.0.1:8000/api/v1/zapier/process-email"

python backend/lambda_email_poller/test_local.py
```

---

## 3. Deploying to AWS (AWS Console)

### Step 3.1: Create the Lambda Function
1. Open the [AWS Lambda Console](https://console.aws.amazon.com/lambda) in region **`ap-south-1` (Mumbai)**.
2. Click **Create function**.
3. Choose **Author from scratch**:
   - **Function name**: `mantrios-email-poller`
   - **Runtime**: `Python 3.12` (or `Python 3.11`)
   - **Architecture**: `arm64` or `x86_64`
4. Click **Create function**.

### Step 3.2: Add Code and Environment Variables
1. Under the **Code** tab, open `lambda_function.py`, paste the code from [`backend/lambda_email_poller/lambda_function.py`](file:///home/adithyan/Desktop/MantriOSProduction/mantriOS-MVP/backend/lambda_email_poller/lambda_function.py), and click **Deploy**.
2. Go to **Configuration** > **General configuration** > **Edit**:
   - Set **Timeout** to `1 min 0 sec` (giving ample time for multiple emails).
   - Set **Memory** to `128 MB` (minimum cost).
   - Click **Save**.
3. Go to **Configuration** > **Environment variables** > **Edit**, and add:
   - `IMAP_SERVER`: `imap.gmail.com`
   - `IMAP_PORT`: `993`
   - `IMAP_USER`: `<YOUR_EMAIL_ADDRESS>`
   - `IMAP_PASSWORD`: `<YOUR_APP_PASSWORD>`
   - `IMAP_FOLDER`: `INBOX`
   - `API_ENDPOINT`: `https://<YOUR_API_DOMAIN>/api/v1/zapier/process-email`
   - `API_AUTH_TOKEN`: *(optional if your endpoint requires authentication)*
4. Click **Save**.

### Step 3.3: Add EventBridge Schedule Trigger
1. In the Lambda Function overview, click **Add trigger**.
2. Select **EventBridge (CloudWatch Events)**.
3. Choose **Create a new rule**:
   - **Rule name**: `mantrios-email-poller-1min`
   - **Rule type**: `Schedule expression`
   - **Schedule expression**: `rate(1 minute)`
4. Click **Add**.

---

## 4. Resource Cleanup / Pausing Instructions

To stop the poller and prevent any Lambda executions:
- Go to the **EventBridge** console or the Lambda trigger section and click **Disable** on the trigger.
- To permanently delete: Delete the Lambda function `mantrios-email-poller` and the EventBridge rule `mantrios-email-poller-1min`.
