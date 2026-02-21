# Simple script to update trip revenues
Write-Host "`nUpdating Trip Revenues..." -ForegroundColor Cyan

# Login
$token = (Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST `
    -Body (@{email="manager@fleetflow.com"; password="password123"} | ConvertTo-Json) `
    -ContentType "application/json").token

# Get completed trips
$trips = (Invoke-RestMethod -Uri "http://localhost:5000/api/trips" `
    -Headers @{Authorization="Bearer $token"}).data | Where-Object {$_.status -eq 'Completed'}

Write-Host "Found $($trips.Count) completed trips`n"

$count = 0
foreach ($trip in $trips) {
    $distance = [int]$trip.distance
    if ($distance -eq 0) { $distance = 100 }
    
    # Revenue: $2-$5 per km
    $revenue = [int]($distance * (2 + (Get-Random -Minimum 0 -Maximum 300) / 100))
    
    $body = @{ revenue = $revenue } | ConvertTo-Json
    
    try {
        Invoke-RestMethod -Uri "http://localhost:5000/api/trips/$($trip._id)" `
            -Method PUT -Body $body -ContentType "application/json" `
            -Headers @{Authorization="Bearer $token"} | Out-Null
        $count++
        Write-Host "Trip $count $distance km revenue $revenue" -ForegroundColor Green
    } catch {
        Write-Host "Failed trip $($trip._id)" -ForegroundColor Red
    }
}

Write-Host "`nUpdated $count trips!" -ForegroundColor Cyan
