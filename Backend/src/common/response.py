from datetime import datetime, timezone

class Response:
    success :bool = True
    status :int = 200
    message :str
    data :dict
    timestamp :datetime = datetime.now(timezone.utc).isoformat()


def send_response(status_code: int, message: str, data:dict | list =None):
    return {
        "success": True,
        "status": status_code,
        "message": message,
        "data": data,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }