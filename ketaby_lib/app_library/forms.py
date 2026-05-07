from django import forms
from django.contrib.auth import authenticate
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User


class SignUpForm(UserCreationForm):
    email = forms.EmailField(required=True, widget=forms.EmailInput(attrs={"placeholder": "example@gmail.com"}))

    class Meta:
        model = User
        fields = ("username", "email", "password1", "password2")

    def clean_email(self):
        email = self.cleaned_data["email"].strip().lower()
        if not email.endswith("@gmail.com"):
            raise forms.ValidationError("Please use a valid Gmail address.")
        if User.objects.filter(email__iexact=email).exists():
            raise forms.ValidationError("This Gmail is already registered.")
        return email

    def save(self, commit=True):
        user = super().save(commit=False)
        user.email = self.cleaned_data["email"].strip().lower()
        if commit:
            user.save()
        return user


class EmailOrUsernameAuthenticationForm(forms.Form):
    login = forms.CharField(label="Email or Username")
    password = forms.CharField(label="Password", widget=forms.PasswordInput)

    error_messages = {
        "invalid_login": "Invalid login credentials.",
        "inactive": "This account is inactive.",
    }

    def __init__(self, request=None, *args, **kwargs):
        self.request = request
        self.user_cache = None
        super().__init__(*args, **kwargs)

    def clean(self):
        login_value = self.cleaned_data.get("login", "").strip()
        password = self.cleaned_data.get("password")

        if login_value and password:
            username = login_value
            if "@" in login_value:
                try:
                    username = User.objects.get(email__iexact=login_value).username
                except User.DoesNotExist:
                    raise forms.ValidationError(self.error_messages["invalid_login"])

            self.user_cache = authenticate(
                self.request,
                username=username,
                password=password,
            )

            if self.user_cache is None:
                raise forms.ValidationError(self.error_messages["invalid_login"])
            if not self.user_cache.is_active:
                raise forms.ValidationError(self.error_messages["inactive"])
        return self.cleaned_data

    def get_user(self):
        return self.user_cache
