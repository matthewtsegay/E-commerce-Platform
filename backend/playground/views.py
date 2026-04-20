from django.core.cache import cache
from django.shortcuts import render
import requests
from requests.exceptions import Timeout, RequestException
from json.decoder import JSONDecodeError

def say_hello(request):
    key = 'httpbin_result'

    if cache.get(key) is None:
        try:
            response = requests.get('https://httpbin.org/delay/2', timeout=5)
            try:
                data = response.json()
            except JSONDecodeError:
                data = {'status': 'error', 'message': 'Invalid JSON'}

            cache.set(key, data, timeout=300)

        except Timeout:
            data = {'status': 'error', 'message': 'Request timed out'}
        except RequestException as e:
            data = {'status': 'error', 'message': str(e)}

    return render(request, 'playground/hello.html', {'name': "matyos"})

          












