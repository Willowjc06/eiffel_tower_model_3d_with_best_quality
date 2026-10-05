# Static HTTP Server for 3D Eiffel Tower Website
$port = 8080
if ($args.Count -gt 0) {
    $port = [int]$args[0]
}

$listener = New-Object System.Net.HttpListener
$prefix = "http://localhost:$port/"

try {
    $listener.Prefixes.Add($prefix)
    $listener.Start()
    Write-Host "==========================================================" -ForegroundColor Cyan
    Write-Host "  Mystical Eiffel Tower 3D Interactive Web Experience" -ForegroundColor Yellow
    Write-Host "  Server started at: $prefix" -ForegroundColor Green
    Write-Host "  Press Ctrl+C to stop the server" -ForegroundColor Gray
    Write-Host "==========================================================" -ForegroundColor Cyan
} catch {
    $port = 8081
    $prefix = "http://localhost:$port/"
    $listener = New-Object System.Net.HttpListener
    $listener.Prefixes.Add($prefix)
    $listener.Start()
    Write-Host "Server started at: $prefix" -ForegroundColor Green
}

$mimeTypes = @{
    ".html" = "text/html; charset=utf-8"
    ".css"  = "text/css; charset=utf-8"
    ".js"   = "application/javascript; charset=utf-8"
    ".json" = "application/json"
    ".gltf" = "model/gltf+json"
    ".bin"  = "application/octet-stream"
    ".svg"  = "image/svg+xml"
    ".png"  = "image/png"
    ".jpg"  = "image/jpeg"
    ".jpeg" = "image/jpeg"
    ".ico"  = "image/x-icon"
    ".woff" = "font/woff"
    ".woff2"= "font/woff2"
    ".txt"  = "text/plain; charset=utf-8"
}

$baseDir = $PSScriptRoot

while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        $response.AddHeader("Access-Control-Allow-Origin", "*")
        $response.AddHeader("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS")
        $response.AddHeader("Access-Control-Allow-Headers", "*")

        if ($request.HttpMethod -eq "OPTIONS") {
            $response.StatusCode = 204
            $response.Close()
            continue
        }

        $rawUrl = $request.Url.LocalPath.TrimStart('/')
        if ([string]::IsNullOrWhiteSpace($rawUrl)) {
            $rawUrl = "index.html"
        }
        $rawUrl = [System.Uri]::UnescapeDataString($rawUrl)
        $filePath = Join-Path $baseDir $rawUrl

        if (-not (Test-Path -Path $filePath -PathType Leaf)) {
            $response.StatusCode = 404
            $msg = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found: $rawUrl")
            $response.ContentType = "text/plain"
            if ($request.HttpMethod -ne "HEAD") {
                $response.OutputStream.Write($msg, 0, $msg.Length)
            }
            $response.Close()
            continue
        }

        $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
        if ($mimeTypes.ContainsKey($ext)) {
            $response.ContentType = $mimeTypes[$ext]
        } else {
            $response.ContentType = "application/octet-stream"
        }

        $fileInfo = New-Object System.IO.FileInfo($filePath)
        $response.ContentLength64 = $fileInfo.Length

        if ($request.HttpMethod -eq "HEAD") {
            $response.StatusCode = 200
            $response.Close()
            continue
        }

        $fileStream = [System.IO.File]::OpenRead($filePath)
        $buffer = New-Object byte[] 65536
        $bytesRead = 0
        while (($bytesRead = $fileStream.Read($buffer, 0, $buffer.Length)) -gt 0) {
            $response.OutputStream.Write($buffer, 0, $bytesRead)
        }
        $fileStream.Close()
        $response.Close()
    } catch {
        # continue on connection reset / client disconnect
    }
}
