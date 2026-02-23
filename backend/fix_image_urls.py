import requests

response = requests.get('https://api.yogayterapiasarunachala.es/health')
print(response.json())
