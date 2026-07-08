from rest_framework.response import Response

def api_response(data=None, message="Action completed successfully", success=True, status_code=200, errors=None):
    """
    Standardized JSON Response format for the ProjectHub API.
    """
    if success:
        payload = {
            "success": True,
            "message": message,
            "data": data if data is not None else {}
        }
    else:
        payload = {
            "success": False,
            "message": message,
            "errors": errors if errors is not None else {}
        }
        
    return Response(payload, status=status_code)
