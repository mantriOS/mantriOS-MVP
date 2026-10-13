import os
import boto3
import base64
import logging
from botocore.exceptions import ClientError

from pathlib import Path
from dotenv import load_dotenv

backend_dir = Path(__file__).resolve().parent.parent.parent
env_file = backend_dir / ".env"
load_dotenv(dotenv_path=env_file)
load_dotenv()

logger = logging.getLogger(__name__)

S3_BUCKET_NAME = os.getenv("S3_BUCKET_NAME", "mantrios-attachments-936854376330")
AWS_REGION = os.getenv("AWS_REGION", "ap-south-1")

def get_s3_client():
    access_key = os.getenv("AWS_ACCESS_KEY_ID")
    secret_key = os.getenv("AWS_SECRET_ACCESS_KEY")
    profile = os.getenv("AWS_PROFILE")

    if access_key and secret_key:
        return boto3.client(
            "s3",
            aws_access_key_id=access_key,
            aws_secret_access_key=secret_key,
            region_name=AWS_REGION,
        )
    elif profile:
        try:
            session = boto3.Session(profile_name=profile, region_name=AWS_REGION)
            return session.client("s3")
        except Exception as e:
            logger.warning("Failed to initialize S3 with profile %s: %s", profile, e)
    return boto3.client("s3", region_name=AWS_REGION)


async def upload_attachment_to_s3(petition_id: int, filename: str, content_type: str, data_base64: str) -> str:
    """
    Decodes base64 data and uploads it to S3 under petitions/{petition_id}/{filename}.
    Returns the S3 URL.
    """
    try:
        s3 = get_s3_client()
        raw_bytes = base64.b64decode(data_base64)
        object_key = f"petitions/{petition_id}/{filename}"
        
        s3.put_object(
            Bucket=S3_BUCKET_NAME,
            Key=object_key,
            Body=raw_bytes,
            ContentType=content_type,
        )
        s3_url = f"https://{S3_BUCKET_NAME}.s3.{AWS_REGION}.amazonaws.com/{object_key}"
        logger.info("Uploaded attachment to S3: %s", s3_url)
        return s3_url
    except Exception as e:
        logger.error("Failed to upload to S3: %s", str(e))
        raise

async def upload_branding_asset_to_s3(category: str, filename: str, content_type: str, data_bytes: bytes) -> str:
    """
    Uploads email branding asset (header, footer, signature) to S3.
    category: 'header', 'footer', or 'signatures'
    Returns the public/accessible S3 URL.
    """
    try:
        s3 = get_s3_client()
        object_key = f"email-branding/{category}/{filename}"
        
        s3.put_object(
            Bucket=S3_BUCKET_NAME,
            Key=object_key,
            Body=data_bytes,
            ContentType=content_type,
        )
        s3_url = f"https://{S3_BUCKET_NAME}.s3.{AWS_REGION}.amazonaws.com/{object_key}"
        logger.info("Uploaded branding asset to S3: %s", s3_url)
        return s3_url
    except Exception as e:
        logger.error("Failed to upload branding asset to S3: %s", str(e))
        raise

