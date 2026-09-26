import google.generativeai as genai
from django.conf import settings
import logging
from .models import ChatMessage

logger = logging.getLogger(__name__)

def get_gemini_response(prompt: str, history: list = None):
    """
    Simulates a call to the Gemini API.
    Replace this with actual API call logic.

    Args:
        prompt (str): The user's input.
        history (list): A list of previous messages in the format expected by Gemini API
                        (e.g., [{'role': 'user', 'parts': ["Hello."]},
                                {'role': 'model', 'parts': ["Hi there! How can I help?"]}] )

    Returns:
        str: The response from Gemini API.
        None: If an error occurs.
    """
    if not settings.GEMINI_API_KEY:
        logger.error("GEMINI_API_KEY not configured in settings.")
        return "Error: Gemini API key not configured."

    genai.configure(api_key=settings.GEMINI_API_KEY)

    # For simplicity, using a basic model. Choose the one that fits your needs.
    # model = genai.GenerativeModel('gemini-pro')
    # For chat, use start_chat
    model = genai.GenerativeModel('gemini-3.1-flash-lite') # Or 'gemini-pro'

    try:
        if history:
            chat = model.start_chat(history=history)
            response = chat.send_message(prompt)
        else:
            response = model.generate_content(prompt)
        
        # Assuming response.text contains the model's reply
        # The actual response object structure might vary, check the SDK documentation.
        # For chat.send_message, response.parts[0].text or similar
        # For generate_content, response.text
        if hasattr(response, 'text'):
            return response.text
        elif hasattr(response, 'parts') and response.parts:
            return response.parts[0].text
        else:
            logger.error(f"Unexpected Gemini API response structure: {response}")
            return "Error: Could not parse Gemini response."

    except Exception as e:
        logger.error(f"Error calling Gemini API: {e}")
        # In a real app, you might want to return a more specific error or raise an exception
        return f"Error communicating with Gemini: {str(e)}"

def format_history_for_gemini(chat_messages: list[ChatMessage]) -> list[dict]:
    """
    Formats ChatMessage objects into the structure expected by the Gemini API's chat history.
    """
    history = []
    for msg in chat_messages:
        history.append({
            "role": msg.role, # 'user' or 'model'
            "parts": [msg.content]
        })
    return history
