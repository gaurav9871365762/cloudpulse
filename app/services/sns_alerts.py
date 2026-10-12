import os

import boto3


class SNSAlertService:
    """Small wrapper around the AWS SNS publish API."""

    def __init__(self, topic_arn=None, client=None, region_name=None):
        self.topic_arn = topic_arn or os.getenv("SNS_TOPIC_ARN")
        self.region_name = region_name or os.getenv("AWS_REGION", "us-east-1")
        self.client = client or boto3.client("sns", region_name=self.region_name)

    def send_alert(self, subject, message, **kwargs):
        """Publish a message to the configured SNS topic."""
        if not self.topic_arn:
            raise ValueError("SNS topic ARN is not configured. Set SNS_TOPIC_ARN in your environment.")

        payload = {
            "TopicArn": self.topic_arn,
            "Subject": subject,
            "Message": message,
        }
        payload.update(kwargs)
        return self.client.publish(**payload)

    def send_cost_alert(self, threshold, actual_cost):
        """Convenience method for cost-spike notifications."""
        return self.send_alert(
            subject="CloudPulse Cost Alert",
            message=(
                f"Your estimated cost exceeded the threshold. "
                f"Threshold: ${threshold:.2f} | Actual: ${actual_cost:.2f}"
            ),
        )
