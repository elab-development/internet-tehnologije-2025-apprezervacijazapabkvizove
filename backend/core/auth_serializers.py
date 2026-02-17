from django.contrib.auth import authenticate, get_user_model
from rest_framework import serializers

User = get_user_model()

class RegisterSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True, allow_blank=False)
    password = serializers.CharField(write_only=True, min_length=6,error_messages={
        "min_length": "Lozinka mora imati najmanje 6 karaktera."})
    password2 = serializers.CharField(write_only=True, min_length=6,error_messages={
        "min_length": "Lozinka mora imati najmanje 6 karaktera."})

    def validate(self, attrs):
        email = attrs["email"].strip().lower()

        if attrs["password"] != attrs["password2"]:
            raise serializers.ValidationError({"password2": "Lozinke se ne poklapaju."})

        # pošto ćemo username = email, mora biti unikatan
        if User.objects.filter(username=email).exists() or User.objects.filter(email=email).exists():
            raise serializers.ValidationError({"email": "Email je već u upotrebi."})

        attrs["email"] = email
        return attrs

    def create(self, validated_data):
        email = validated_data["email"]
        password = validated_data["password"]

        user = User.objects.create_user(
            username=email,   # <-- TRIK: username postaje email
            email=email,
            password=password,
        )
        return user


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        user = authenticate(username=attrs["username"], password=attrs["password"])
        if not user:
            raise serializers.ValidationError({"detail": "Invalid credentials."})
        attrs["user"] = user
        return attrs
