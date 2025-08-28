from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .utils import predict_with_explainability

@api_view(['POST', 'GET'])
def predict_view(request):
    if request.method == 'POST':
        input_data = request.data

        try:
            result = predict_with_explainability(input_data)
            return Response(result)
        except Exception as e:
            return Response(
                {"error": f"Prediction failed: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    return Response(
        {"message": "Use POST to submit data for churn prediction."},
        status=status.HTTP_200_OK
    )
