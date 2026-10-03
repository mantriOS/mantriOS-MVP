import asyncio
import json
import sys
from pathlib import Path

# Add backend directory to sys.path so app modules can be imported
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.services.bedrock import analyze_email


async def main():
    print("=" * 60)
    print("Testing AWS Bedrock Gemma 3 27B Model Integration")
    print("=" * 60)

    # Sample citizen petition
    subject = "Urgent: College Merit Scholarship Disbursement Pending for 6 Months"
    body = (
        "Respected Sir,\n\n"
        "I am a final-year B.Tech student at Government Engineering College, Barton Hill. "
        "My state merit scholarship application was approved in October, but the fund disbursement "
        "has been pending for over six months. Due to this delay, I am facing severe financial "
        "difficulties in paying my semester examination fees.\n\n"
        "Kindly look into this matter and expedite the release of the scholarship amount.\n\n"
        "Sincerely,\n"
        "Adarsh Kumar\n"
        "Reg No: 2022-GECB-042"
    )
    headers = {
        "From": "adarsh.kumar@example.com",
        "To": "minister.he@kerala.gov.in",
        "Date": "Sat, 04 Oct 2026 10:00:00 +0530",
        "Subject": subject,
    }

    print("\nSending sample petition to Bedrock service...")
    print(f"Subject: {subject}")

    try:
        result = await analyze_email(subject=subject, body=body, headers=headers)
        print("\n" + "=" * 60)
        print("✅ SUCCESS: Bedrock Gemma 3 27B responded successfully!")
        print("=" * 60)
        print(json.dumps(result, indent=2))
    except Exception as e:
        print("\n" + "!" * 60)
        print("❌ Bedrock Call Failed with Error:")
        print("!" * 60)
        print(f"{type(e).__name__}: {e}")
        print("\nTroubleshooting Guidance:")
        if "Operation not allowed" in str(e) or "Model Access Error" in str(e):
            print("-> Model access has not been activated in the AWS Bedrock Console yet.")
            print("-> Go to AWS Console > Amazon Bedrock (ap-south-1) > Model access.")
            print("-> Request access for 'Google Gemma 3 27B IT' (free to request).")
        else:
            print("-> Check your AWS credentials and region settings in backend/.env.")


if __name__ == "__main__":
    asyncio.run(main())
