# Update driver statistics based on trips
Write-Host "`nUpdating Driver Statistics..." -ForegroundColor Cyan

# Login
$token = (Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST `
    -Body (@{email="manager@fleetflow.com"; password="password123"} | ConvertTo-Json) `
    -ContentType "application/json").token

# Get all trips
$trips = (Invoke-RestMethod -Uri "http://localhost:5000/api/trips" `
    -Headers @{Authorization="Bearer $token"}).data

# Get all drivers
$drivers = (Invoke-RestMethod -Uri "http://localhost:5000/api/drivers" `
    -Headers @{Authorization="Bearer $token"}).data

Write-Host "Found $($drivers.Count) drivers and $($trips.Count) trips`n"

$updatedCount = 0
foreach ($driver in $drivers) {
    # Count trips for this driver
    $driverTrips = $trips | Where-Object { $_.driver._id -eq $driver._id -or $_.driver -eq $driver._id }
    $totalTrips = $driverTrips.Count
    $completedTrips = ($driverTrips | Where-Object { $_.status -eq 'Completed' }).Count
    
    # Only update if driver has trips
    if ($totalTrips -gt 0) {
        $body = @{
            totalTrips = $totalTrips
            completedTrips = $completedTrips
        } | ConvertTo-Json
        
        try {
            Invoke-RestMethod -Uri "http://localhost:5000/api/drivers/$($driver._id)" `
                -Method PUT -Body $body -ContentType "application/json" `
                -Headers @{Authorization="Bearer $token"} | Out-Null
            $updatedCount++
            Write-Host "$($driver.name): $totalTrips trips ($completedTrips completed)" -ForegroundColor Green
        } catch {
            Write-Host "Failed to update $($driver.name)" -ForegroundColor Red
        }
    }
}

Write-Host "`nUpdated $updatedCount drivers!" -ForegroundColor Cyan
