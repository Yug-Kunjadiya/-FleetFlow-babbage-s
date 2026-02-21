from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
from datetime import datetime, timedelta
import math

app = Flask(__name__)
CORS(app)

# ============================================
# AI FEATURE 1: SMART VEHICLE SUGGESTION ENGINE
# ============================================
@app.route('/api/ai/suggest-vehicle', methods=['POST'])
def suggest_vehicle():
    """
    Score vehicles based on:
    - Fuel efficiency
    - Load capacity match
    - Maintenance history
    - Distance
    Returns best vehicle recommendation
    """
    try:
        data = request.json
        vehicles = data.get('vehicles', [])
        cargo_weight = data.get('cargoWeight', 0)
        distance = data.get('distance', 0)
        
        if not vehicles:
            return jsonify({
                'success': False,
                'message': 'No vehicles provided'
            }), 400
        
        scored_vehicles = []
        
        for vehicle in vehicles:
            score = 0
            reasons = []
            
            # 1. Fuel Efficiency Score (40%)
            fuel_eff = vehicle.get('fuelEfficiency', 0)
            fuel_score = min(fuel_eff * 4, 40)
            score += fuel_score
            reasons.append(f"Fuel efficiency: {fuel_eff} km/l (Score: {fuel_score:.1f}/40)")
            
            # 2. Load Capacity Match (30%)
            max_capacity = vehicle.get('maxLoadCapacity', 1)
            capacity_utilization = (cargo_weight / max_capacity) * 100
            
            if 70 <= capacity_utilization <= 90:
                capacity_score = 30
                reasons.append(f"Optimal capacity usage: {capacity_utilization:.1f}% (Score: 30/30)")
            elif 50 <= capacity_utilization < 70:
                capacity_score = 20
                reasons.append(f"Good capacity usage: {capacity_utilization:.1f}% (Score: 20/30)")
            elif 90 < capacity_utilization <= 100:
                capacity_score = 25
                reasons.append(f"Near max capacity: {capacity_utilization:.1f}% (Score: 25/30)")
            else:
                capacity_score = 10
                reasons.append(f"Low capacity usage: {capacity_utilization:.1f}% (Score: 10/30)")
            
            score += capacity_score
            
            # 3. Maintenance History Score (30%)
            odometer = vehicle.get('odometer', 0)
            maintenance_cost = vehicle.get('totalMaintenanceCost', 0)
            last_service = vehicle.get('lastServiceDate')
            
            # Calculate maintenance cost per km
            maintenance_per_km = maintenance_cost / odometer if odometer > 0 else 0
            
            # Lower cost is better
            if maintenance_per_km < 0.1:
                maintenance_score = 30
            elif maintenance_per_km < 0.2:
                maintenance_score = 20
            else:
                maintenance_score = 10
            
            # Check if service is recent
            if last_service:
                days_since_service = (datetime.now() - datetime.fromisoformat(last_service.replace('Z', '+00:00'))).days
                if days_since_service < 30:
                    maintenance_score = min(maintenance_score + 5, 30)
                    reasons.append(f"Recently serviced ({days_since_service} days ago)")
            
            score += maintenance_score
            reasons.append(f"Maintenance cost: ${maintenance_per_km:.2f}/km (Score: {maintenance_score}/30)")
            
            scored_vehicles.append({
                'vehicleId': vehicle.get('id'),
                'score': round(score, 2),
                'reasons': reasons,
                'estimatedFuelCost': round((distance / fuel_eff) * 1.5 if fuel_eff > 0 else 0, 2),
                'capacityUtilization': round(capacity_utilization, 2)
            })
        
        # Sort by score descending
        scored_vehicles.sort(key=lambda x: x['score'], reverse=True)
        
        return jsonify({
            'success': True,
            'recommendation': scored_vehicles[0],
            'alternatives': scored_vehicles[1:4]
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500


# ============================================
# AI FEATURE 2: PREDICTIVE MAINTENANCE
# ============================================
@app.route('/api/ai/predict-maintenance', methods=['POST'])
def predict_maintenance():
    """
    Predict maintenance needs based on:
    - Odometer
    - Last service date
    - Fuel efficiency drop
    Predicts: "Service likely required in next X days"
    """
    try:
        data = request.json
        odometer = data.get('odometer', 0)
        last_service_date = data.get('lastServiceDate')
        fuel_efficiency = data.get('fuelEfficiency', 0)
        maintenance_history = data.get('maintenanceHistory', [])
        
        prediction = {
            'needsMaintenance': False,
            'daysUntilService': None,
            'confidence': 'medium',
            'reasons': [],
            'recommendedActions': []
        }
        
        score = 0  # Higher score = more urgent maintenance needed
        
        # 1. Analyze odometer
        if maintenance_history:
            last_service_odometer = maintenance_history[0].get('odometerAtService', 0)
            km_since_service = odometer - last_service_odometer
            
            if km_since_service > 15000:
                score += 50
                prediction['reasons'].append(f"Critical: {km_since_service} km since last service")
                prediction['recommendedActions'].append("Schedule immediate comprehensive service")
            elif km_since_service > 10000:
                score += 30
                prediction['reasons'].append(f"{km_since_service} km since last service (approaching limit)")
                prediction['recommendedActions'].append("Schedule service within 2 weeks")
            elif km_since_service > 8000:
                score += 15
                prediction['reasons'].append(f"{km_since_service} km since last service")
                prediction['recommendedActions'].append("Plan service for next month")
        
        # 2. Analyze time since last service
        if last_service_date:
            last_service = datetime.fromisoformat(last_service_date.replace('Z', '+00:00'))
            days_since_service = (datetime.now() - last_service).days
            
            if days_since_service > 180:
                score += 40
                prediction['reasons'].append(f"{days_since_service} days since last service (>6 months)")
                prediction['recommendedActions'].append("Time-based service overdue")
            elif days_since_service > 120:
                score += 20
                prediction['reasons'].append(f"{days_since_service} days since last service (4+ months)")
        
        # 3. Analyze fuel efficiency
        if fuel_efficiency < 8:
            score += 25
            prediction['reasons'].append(f"Low fuel efficiency: {fuel_efficiency} km/l")
            prediction['recommendedActions'].append("Check engine, fuel system, and tire pressure")
        elif fuel_efficiency < 10:
            score += 10
            prediction['reasons'].append(f"Below average fuel efficiency: {fuel_efficiency} km/l")
        
        # 4. Analyze maintenance frequency
        if len(maintenance_history) >= 3:
            recent_services = maintenance_history[:3]
            avg_km_between_services = []
            
            for i in range(len(recent_services) - 1):
                km_diff = recent_services[i].get('odometerAtService', 0) - \
                         recent_services[i+1].get('odometerAtService', 0)
                avg_km_between_services.append(km_diff)
            
            if avg_km_between_services:
                avg_interval = sum(avg_km_between_services) / len(avg_km_between_services)
                if avg_interval < 5000:
                    score += 20
                    prediction['reasons'].append(f"Frequent maintenance pattern detected (avg {int(avg_interval)} km)")
                    prediction['recommendedActions'].append("Investigate root cause of frequent maintenance")
        
        # Determine prediction
        if score >= 50:
            prediction['needsMaintenance'] = True
            prediction['daysUntilService'] = 7
            prediction['confidence'] = 'high'
            prediction['urgency'] = 'critical'
        elif score >= 30:
            prediction['needsMaintenance'] = True
            prediction['daysUntilService'] = 30
            prediction['confidence'] = 'medium'
            prediction['urgency'] = 'moderate'
        elif score >= 15:
            prediction['needsMaintenance'] = True
            prediction['daysUntilService'] = 60
            prediction['confidence'] = 'medium'
            prediction['urgency'] = 'low'
        else:
            prediction['daysUntilService'] = 90
            prediction['confidence'] = 'low'
            prediction['urgency'] = 'none'
            prediction['reasons'].append("Vehicle appears to be in good condition")
        
        prediction['score'] = score
        
        return jsonify({
            'success': True,
            'prediction': prediction
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500


# ============================================
# AI FEATURE 3: DRIVER RISK SCORING
# ============================================
@app.route('/api/ai/driver-risk-score', methods=['POST'])
def driver_risk_score():
    """
    Generate safety score (0-100) based on:
    - Late trips
    - Maintenance incidents
    - Violations
    - Trip completion rate
    """
    try:
        data = request.json
        total_trips = data.get('totalTrips', 0)
        completed_trips = data.get('completedTrips', 0)
        late_trips = data.get('lateTrips', 0)
        violations = data.get('violations', 0)
        maintenance_incidents = data.get('maintenanceIncidents', 0)
        
        # Start with perfect score
        score = 100
        deductions = []
        
        # 1. Completion Rate (weight: 30 points)
        if total_trips > 0:
            completion_rate = (completed_trips / total_trips) * 100
            if completion_rate < 80:
                deduction = (100 - completion_rate) * 0.3
                score -= deduction
                deductions.append(f"Low completion rate: {completion_rate:.1f}% (-{deduction:.1f} points)")
        else:
            deductions.append("No trip history available")
        
        # 2. Late Trip Rate (weight: 25 points)
        if total_trips > 0:
            late_rate = (late_trips / total_trips) * 100
            deduction = late_rate * 0.5
            score -= deduction
            if late_rate > 10:
                deductions.append(f"High late trip rate: {late_rate:.1f}% (-{deduction:.1f} points)")
        
        # 3. Violations (weight: 30 points)
        violation_deduction = violations * 5
        score -= violation_deduction
        if violations > 0:
            deductions.append(f"{violations} violation(s) (-{violation_deduction} points)")
        
        # 4. Maintenance Incidents (weight: 15 points)
        incident_deduction = maintenance_incidents * 3
        score -= incident_deduction
        if maintenance_incidents > 0:
            deductions.append(f"{maintenance_incidents} maintenance incident(s) (-{incident_deduction} points)")
        
        # Ensure score is between 0 and 100
        score = max(0, min(100, score))
        
        # Determine risk level
        if score >= 85:
            risk_level = 'low'
            recommendation = 'Excellent driver - eligible for all assignments'
        elif score >= 70:
            risk_level = 'moderate'
            recommendation = 'Good driver - monitor performance'
        elif score >= 50:
            risk_level = 'high'
            recommendation = 'Requires attention - provide additional training'
        else:
            risk_level = 'critical'
            recommendation = 'Immediate action required - consider suspension'
        
        return jsonify({
            'success': True,
            'safetyScore': round(score),
            'riskLevel': risk_level,
            'recommendation': recommendation,
            'deductions': deductions,
            'metrics': {
                'completionRate': round((completed_trips / total_trips * 100) if total_trips > 0 else 0, 2),
                'lateRate': round((late_trips / total_trips * 100) if total_trips > 0 else 0, 2),
                'violations': violations,
                'maintenanceIncidents': maintenance_incidents
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500


# ============================================
# AI FEATURE 4: FUEL ANOMALY DETECTION
# ============================================
@app.route('/api/ai/detect-fuel-anomaly', methods=['POST'])
def detect_fuel_anomaly():
    """
    Detect fuel anomalies:
    If actual fuel > predicted fuel by 20%, raise alert
    """
    try:
        data = request.json
        actual_fuel = data.get('actualFuel', 0)
        distance = data.get('distance', 0)
        vehicle_type = data.get('vehicleType', 'Truck')
        fuel_efficiency = data.get('fuelEfficiency', 0)
        
        # Base fuel efficiency by vehicle type (km per liter)
        base_efficiency = {
            'Truck': 8,
            'Van': 12,
            'Bike': 35
        }
        
        # Use vehicle's actual efficiency or default
        expected_efficiency = fuel_efficiency if fuel_efficiency > 0 else base_efficiency.get(vehicle_type, 10)
        
        # Calculate expected fuel consumption
        expected_fuel = distance / expected_efficiency if expected_efficiency > 0 else actual_fuel
        
        # Calculate deviation
        deviation = ((actual_fuel - expected_fuel) / expected_fuel * 100) if expected_fuel > 0 else 0
        
        is_anomalous = deviation > 20
        
        result = {
            'isAnomalous': is_anomalous,
            'actualFuel': actual_fuel,
            'expectedFuel': round(expected_fuel, 2),
            'deviation': round(deviation, 2),
            'threshold': 20,
            'reason': None,
            'possibleCauses': []
        }
        
        if is_anomalous:
            result['reason'] = f"Actual fuel consumption ({actual_fuel}L) exceeds expected ({expected_fuel:.2f}L) by {deviation:.1f}%"
            result['possibleCauses'] = [
                "Fuel theft or leakage",
                "Inefficient driving behavior",
                "Vehicle mechanical issues",
                "Incorrect odometer reading",
                "Heavy traffic conditions",
                "Cargo overweight"
            ]
        else:
            result['reason'] = "Fuel consumption within normal range"
        
        return jsonify({
            'success': True,
            **result
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500


# Health check endpoint
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'success': True,
        'message': 'FleetFlow AI Service is running',
        'version': '1.0.0'
    })


if __name__ == '__main__':
    print("🤖 FleetFlow AI Service starting...")
    print("📊 Available AI Features:")
    print("  1. Smart Vehicle Suggestion Engine")
    print("  2. Predictive Maintenance")
    print("  3. Driver Risk Scoring")
    print("  4. Fuel Anomaly Detection")
    app.run(host='0.0.0.0', port=5001, debug=True)
