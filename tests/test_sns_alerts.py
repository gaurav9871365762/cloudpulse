from app.services.sns_alerts import SNSAlertService


def test_sns_alert_service_publish():
    captured = {}

    class FakeSNSClient:
        def publish(self, **kwargs):
            captured.update(kwargs)
            return {"MessageId": "abc-123"}

    service = SNSAlertService(topic_arn="arn:aws:sns:us-east-1:123456789012:cloudpulse", client=FakeSNSClient())
    result = service.send_alert("CPU High", "CPU is above 90% for 10 minutes.")

    assert result["MessageId"] == "abc-123"
    assert captured["TopicArn"] == "arn:aws:sns:us-east-1:123456789012:cloudpulse"
    assert captured["Subject"] == "CPU High"
    assert "CPU is above 90%" in captured["Message"]
