
import asyncio
import json

from app.services.bedrock import canonicalize_petition


async def main():
    subject = "Test Petition – Delay in Scholarship Disbursement"

    body = """
    I am a second-year B.Tech student at ABC Government
    Engineering College. I applied for the state merit scholarship
    for academic year 2025-2026 in July 2025.

    My application reference number is SCH-TEST-2025-1042.
    Although my application status shows approved, the scholarship
    amount of Rs. 25,000 has not been credited to my bank account.

    I contacted the college scholarship office on 10 September 2026
    and 25 September 2026 but have not received a clear explanation.

    I request the Higher Education Department to examine the delay,
    verify the payment status, and take necessary action to ensure
    that the approved scholarship is disbursed.
    """

    headers = {
        "from": "test-applicant@example.com",
        "language": "English",
        "test": True,
    }

    print("\nCalling Gemma for petition canonicalization...\n")

    canonical = await canonicalize_petition(
        subject=subject,
        body=body,
        headers=headers,
        attachments=None,
    )

    print("=" * 70)
    print("GEMMA CANONICAL PETITION OUTPUT")
    print("=" * 70)
    print(json.dumps(canonical, indent=2, ensure_ascii=False))
    print("=" * 70)
    print("Canonicalization completed successfully.")


if __name__ == "__main__":
    asyncio.run(main())
