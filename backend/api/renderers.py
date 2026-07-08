from rest_framework.renderers import JSONRenderer

class CustomJSONRenderer(JSONRenderer):
    """
    Renderer which standardizes all responses to {success, message, data, errors}.
    If the response is already formatted (e.g. from utils.api_response), it leaves it alone.
    """
    def render(self, data, accepted_media_type=None, renderer_context=None):
        status_code = renderer_context['response'].status_code if renderer_context else 200
        
        # If the data is already wrapped (has success key), just render it
        if isinstance(data, dict) and 'success' in data and ('data' in data or 'errors' in data):
            return super().render(data, accepted_media_type, renderer_context)
            
        success = status_code < 400
        
        wrapped_data = {
            "success": success,
            "message": "Success" if success else "Error",
            "data": data if success else {},
            "errors": data if not success else {}
        }
        
        return super().render(wrapped_data, accepted_media_type, renderer_context)
