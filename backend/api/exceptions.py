from rest_framework.views import exception_handler
from rest_framework.response import Response

def custom_exception_handler(exc, context):
    """
    Custom exception handler to standardize all DRF exceptions 
    into the {success, message, errors} format.
    """
    response = exception_handler(exc, context)

    if response is not None:
        custom_data = {
            "success": False,
            "message": "An error occurred.",
            "errors": {}
        }

        if hasattr(exc, 'detail'):
            if isinstance(exc.detail, dict):
                custom_data["errors"] = exc.detail
                custom_data["message"] = "Validation Error"
            else:
                custom_data["message"] = str(exc.detail)
        else:
            custom_data["message"] = str(exc)
        
        response.data = custom_data

    return response
