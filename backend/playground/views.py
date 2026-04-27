from django.core.cache import cache
from django.shortcuts import render
import requests
from requests.exceptions import Timeout, RequestException
from json.decoder import JSONDecodeError

def say_hello(request):
    """
    Simplified for performance testing.
    """
    return render(request, 'playground/hello.html', {'name': "matyos"})

          












