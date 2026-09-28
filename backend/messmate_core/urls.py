from django.contrib import admin
from django.urls import path, include
from django.http import HttpResponse

def root_landing_view(request):
    html = """<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta http-equiv="refresh" content="0; url=http://localhost:5173/">
    <title>MessMate System</title>
    <style>
        body { font-family: system-ui, -apple-system, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #f8fafc; color: #1e293b; }
        .card { background: white; padding: 2.5rem; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); max-width: 480px; text-align: center; }
        h1 { color: #059669; font-size: 1.75rem; margin-bottom: 0.5rem; }
        p { color: #64748b; margin-bottom: 1.5rem; line-height: 1.5; }
        .btn { display: inline-block; padding: 0.75rem 1.5rem; background: #059669; color: white; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 0.35rem; }
        .btn-outline { background: transparent; color: #059669; border: 1px solid #059669; }
    </style>
</head>
<body>
    <div class="card">
        <h1>MessMate System</h1>
        <p>Redirecting to the MessMate Web App... If not redirected automatically, click below:</p>
        <a href="http://localhost:5173/" class="btn">Open Web App (localhost:5173)</a>
        <br><br>
        <a href="/admin/" class="btn btn-outline">Django Admin</a>
        <a href="/api/" class="btn btn-outline">API Root</a>
    </div>
</body>
</html>"""
    return HttpResponse(html)

urlpatterns = [
    path('', root_landing_view, name='root-landing'),
    path('admin/', admin.site.urls),
    path('api/', include('mess.urls')),
]
