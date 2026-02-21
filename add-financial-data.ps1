# PowerShell script to add financial data through API calls
Write-Host "`n🌱 Adding Financial Data to FleetFlow..." -ForegroundColor Cyan

# Login as financial analyst
$loginBody = @{
    email = "financial@fleetflow.com"
    password = "password123"
} | ConvertTo-Json

$token = (Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" `
    -Method POST -Body $loginBody -ContentType "application/json").token

Write-Host "✓ Logged in successfully" -ForegroundColor Green

# Get all completed trips
$trips = (Invoke-RestMethod -Uri "http://localhost:5000/api/trips" `
    -Headers @{Authorization="Bearer $token"}).data | Where-Object {$_.status -eq 'Completed'}

Write-Host "`n📊 Updating revenues for $($trips.Count) completed trips..." -ForegroundColor Yellow

# Update trip revenues
$updatedCount = 0
foreach ($trip in $trips) {
    $distance = [int]$trip.distance
    if ($distance -eq 0) { $distance = 100 }
    
    # Calculate revenue: $2-$5 per km
    $revenuePerKm = 2 + (Get-Random -Minimum 0 -Maximum 300) / 100
    $revenue = [int]($distance * $revenuePerKm)
    
    $updateBody = @{
        revenue = $revenue
    } | ConvertTo-Json
    
    try {
        Invoke-RestMethod -Uri "http://localhost:5000/api/trips/$($trip._id)" `
            -Method PUT -Body $updateBody -ContentType "application/json" `
            -Headers @{Authorization="Bearer $token"} | Out-Null
        $updatedCount++
        Write-Host "  ✓ Trip #$updatedCount`: $distance km = `$$revenue revenue" -ForegroundColor White
    } catch {
        Write-Host "  ✗ Failed to update trip $($trip._id)" -ForegroundColor Red
    }
}

Write-Host "`n✓ Updated $updatedCount trip revenues" -ForegroundColor Green

# Create expense records
Write-Host "`n💰 Creating expense records..." -ForegroundColor Yellow

# Get vehicles for vehicle-related expenses
$vehicles = (Invoke-RestMethod -Uri "http://localhost:5000/api/vehicles" `
    -Headers @{Authorization="Bearer $token"}).data

# Expense categories and their typical amounts
$expenseTemplates = @(
    @{category="Fuel"; minAmount=1000; maxAmount=4000; needsVehicle=$true},
    @{category="Maintenance"; minAmount=500; maxAmount=2500; needsVehicle=$true},
    @{category="Insurance"; minAmount=500; maxAmount=2000; needsVehicle=$true},
    @{category="Salary"; minAmount=2000; maxAmount=5000; needsVehicle=$false},
    @{category="Parking"; minAmount=20; maxAmount=120; needsVehicle=$false},
    @{category="Toll"; minAmount=10; maxAmount=60; needsVehicle=$false}
)

$expenseDescriptions = @{
    Fuel = @("Monthly fuel expense", "Fuel reimbursement", "Fuel card charges")
    Maintenance = @("Oil change", "Tire replacement", "Brake service", "Engine repair", "Routine maintenance")
    Insurance = @("Vehicle insurance premium", "Insurance renewal", "Liability coverage")
    Salary = @("Driver salary payment", "Monthly payroll", "Staff compensation")
    Parking = @("Parking fees", "Monthly parking pass", "Parking tickets")
    Toll = @("Highway toll charges", "Bridge toll", "Express lane fees")
}

$createdExpenses = 0

# Create expenses for the last 60 days
for ($dayOffset = 0; $dayOffset -lt 60; $dayOffset++) {
    $date = (Get-Date).AddDays(-$dayOffset).ToString("yyyy-MM-dd")
    
    # Create 2-4 random expenses per day
    $numExpenses = Get-Random -Minimum 2 -Maximum 5
    
    for ($j = 0; $j -lt $numExpenses; $j++) {
        $template = $expenseTemplates | Get-Random
        $amount = Get-Random -Minimum $template.minAmount -Maximum $template.maxAmount
        $description = $expenseDescriptions[$template.category] | Get-Random
        
        $expenseBody = @{
            category = $template.category
            amount = $amount
            description = $description
            date = $date
            paymentMethod = @("Cash", "Card", "Bank Transfer") | Get-Random
        }
        
        # Add vehicle reference if needed
        if ($template.needsVehicle -and $vehicles.Count -gt 0) {
            $expenseBody.vehicle = ($vehicles | Get-Random)._id
        }
        
        $expenseJson = $expenseBody | ConvertTo-Json
        
        try {
            # Note: Need to create expense endpoint or use a workaround
            # For now, we'll just track what we would create
            $createdExpenses++
            
            if ($createdExpenses -le 5) {
                Write-Host "  ✓ Would create: $($template.category) - `$$amount - $description" -ForegroundColor White
            }
        } catch {
            # Expense creation might fail if endpoint doesn't exist
        }
    }
}

Write-Host "`n✓ Would create $createdExpenses expense records (if endpoint exists)" -ForegroundColor Green

# Summary
Write-Host "`n═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✅ Financial Data Update Complete!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "`nUpdated:" -ForegroundColor Yellow
Write-Host "  • Trip Revenues: $updatedCount trips" -ForegroundColor White
Write-Host "  • Expense Records: Ready to create $createdExpenses" -ForegroundColor White
Write-Host "`nNext: Refresh your Analytics page to see the updated data!`n" -ForegroundColor Cyan
