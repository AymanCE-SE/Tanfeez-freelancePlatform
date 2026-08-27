from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import PageNumberPagination
from .services import get_gemini_response, format_history_for_gemini # Already imported above
from .models import Conversation, ChatMessage
from .serializers import UserPromptSerializer, ConversationSerializer, ChatMessageSerializer

class ChatView(APIView):
    """
    API View to handle chat interactions.
    Requires authentication.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        """
        Handles a new chat message from the user.
        Expects:
        {
            "prompt": "Your message to Gemini",
            "conversation_id": 123 (optional, to continue a conversation)
        }
        """
        serializer = UserPromptSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        user_prompt = serializer.validated_data['prompt']
        conversation_id = serializer.validated_data.get('conversation_id')
        user = request.user

        conversation_history_for_gemini = []
        conversation = None

        if conversation_id:
            try:
                conversation = Conversation.objects.get(id=conversation_id, user=user)
                # Fetch previous messages for context
                past_messages = ChatMessage.objects.filter(conversation=conversation).order_by('timestamp')
                conversation_history_for_gemini = format_history_for_gemini(past_messages)
            except Conversation.DoesNotExist:
                return Response({"error": "Conversation not found or access denied."}, status=status.HTTP_404_NOT_FOUND)
        else:
            # Create a new conversation
            conversation = Conversation.objects.create(user=user, title=user_prompt[:60]) # Use first 60 chars of prompt as title

        # Save user's message
        user_message = ChatMessage.objects.create(
            conversation=conversation,
            role='user',
            content=user_prompt
        )

        # Add current user message to history for Gemini
        conversation_history_for_gemini.append({"role": "user", "parts": [user_prompt]})

        # Get response from Gemini (actual API call)
        gemini_reply_content = get_gemini_response(user_prompt, history=conversation_history_for_gemini)

        if gemini_reply_content is None or "Error:" in gemini_reply_content:
             # Save an error message if Gemini call failed
            model_message = ChatMessage.objects.create(
                conversation=conversation,
                role='model',
                content=gemini_reply_content or "Failed to get response from the model."
            )
            # Return a server error or a specific error message
            return Response(
                {"error": "Failed to get response from Gemini.", "details": gemini_reply_content},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        # Save Gemini's response
        model_message = ChatMessage.objects.create(
            conversation=conversation,
            role='model',
            content=gemini_reply_content
        )

        # Prepare response data
        response_data = {
            "conversation_id": conversation.id,
            "user_message": ChatMessageSerializer(user_message).data,
            "model_response": ChatMessageSerializer(model_message).data,
            "new_conversation_created": not bool(conversation_id) # True if a new conversation was started
        }
        return Response(response_data, status=status.HTTP_201_CREATED)

class ConversationHistoryView(APIView):
    """
    API View to retrieve a specific conversation or list all conversations for a user.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, conversation_id=None, *args, **kwargs):
        user = request.user
        if conversation_id:
            try:
                conversation = Conversation.objects.prefetch_related('messages').get(id=conversation_id, user=user)
                serializer = ConversationSerializer(conversation)
                return Response(serializer.data, status=status.HTTP_200_OK)
            except Conversation.DoesNotExist:
                return Response({"error": "Conversation not found or access denied."}, status=status.HTTP_404_NOT_FOUND)
        else:
            # List all conversations for the user
            conversations = Conversation.objects.filter(user=user).order_by('-updated_at')
            paginator = PageNumberPagination()
            page = paginator.paginate_queryset(conversations, request)
            serializer = ConversationSerializer(page, many=True)
            return paginator.get_paginated_response(serializer.data)
