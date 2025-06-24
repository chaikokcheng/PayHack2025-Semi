"""
Health check API for PinkPay Payment Switch
"""

import psutil
import time
from datetime import datetime
from flask import Blueprint, jsonify, current_app
from src.database.connection import db, test_supabase_connection
from src.middleware.rate_limiter import rate_limit

health_bp = Blueprint('health', __name__)

@health_bp.route('/', methods=['GET'])
@health_bp.route('/status', methods=['GET'])
@rate_limit(per_minute=120)
def health_check():
    """Basic health check endpoint"""
    try:
        start_time = time.time()
        
        # Basic health status
        health_status = {
            'status': 'healthy',
            'timestamp': datetime.utcnow().isoformat(),
            'service': 'PinkPay Payment Switch',
            'version': '1.0.0'
        }
        
        # Test database connection
        try:
            db.engine.execute('SELECT 1')
            health_status['database'] = 'connected'
        except Exception as e:
            health_status['database'] = 'error'
            health_status['database_error'] = str(e)
            health_status['status'] = 'unhealthy'
        
        # Test Supabase connection
        try:
            supabase_status = test_supabase_connection()
            health_status['supabase'] = 'connected' if supabase_status else 'error'
        except Exception as e:
            health_status['supabase'] = 'error'
            health_status['supabase_error'] = str(e)
        
        # Response time
        response_time = round((time.time() - start_time) * 1000, 2)
        health_status['response_time_ms'] = response_time
        
        status_code = 200 if health_status['status'] == 'healthy' else 503
        
        return jsonify(health_status), status_code
        
    except Exception as e:
        current_app.logger.error(f"Health check error: {str(e)}")
        return jsonify({
            'status': 'error',
            'error': str(e),
            'timestamp': datetime.utcnow().isoformat()
        }), 500

@health_bp.route('/detailed', methods=['GET'])
@rate_limit(per_minute=60)
def detailed_health_check():
    """Detailed health check with system metrics"""
    try:
        start_time = time.time()
        
        # Basic health info
        health_data = {
            'status': 'healthy',
            'timestamp': datetime.utcnow().isoformat(),
            'service': 'PinkPay Payment Switch',
            'version': '1.0.0',
            'uptime_seconds': time.time() - psutil.boot_time(),
            'checks': {}
        }
        
        # Database connectivity
        try:
            db.engine.execute('SELECT 1')
            health_data['checks']['database'] = {
                'status': 'healthy',
                'message': 'Database connection successful'
            }
        except Exception as e:
            health_data['checks']['database'] = {
                'status': 'error',
                'message': str(e)
            }
            health_data['status'] = 'unhealthy'
        
        # Supabase connectivity
        try:
            supabase_healthy = test_supabase_connection()
            health_data['checks']['supabase'] = {
                'status': 'healthy' if supabase_healthy else 'error',
                'message': 'Supabase connection successful' if supabase_healthy else 'Supabase connection failed'
            }
        except Exception as e:
            health_data['checks']['supabase'] = {
                'status': 'error',
                'message': str(e)
            }
        
        # System metrics
        try:
            cpu_percent = psutil.cpu_percent(interval=1)
            memory = psutil.virtual_memory()
            disk = psutil.disk_usage('/')
            
            health_data['system_metrics'] = {
                'cpu_usage_percent': cpu_percent,
                'memory_usage_percent': memory.percent,
                'memory_available_mb': round(memory.available / 1024 / 1024, 2),
                'disk_usage_percent': disk.percent,
                'disk_free_gb': round(disk.free / 1024 / 1024 / 1024, 2)
            }
            
            # Set warnings for high resource usage
            if cpu_percent > 80:
                health_data['warnings'] = health_data.get('warnings', [])
                health_data['warnings'].append('High CPU usage detected')
            
            if memory.percent > 85:
                health_data['warnings'] = health_data.get('warnings', [])
                health_data['warnings'].append('High memory usage detected')
            
            if disk.percent > 90:
                health_data['warnings'] = health_data.get('warnings', [])
                health_data['warnings'].append('Low disk space detected')
                
        except Exception as e:
            health_data['checks']['system_metrics'] = {
                'status': 'error',
                'message': f'Failed to collect system metrics: {str(e)}'
            }
        
        # Application-specific checks
        try:
            from src.models.transaction import Transaction
            from src.models.user import User
            
            # Check if we can query models
            recent_txn_count = Transaction.query.count()
            user_count = User.query.count()
            
            health_data['checks']['application'] = {
                'status': 'healthy',
                'message': 'Application models accessible',
                'metrics': {
                    'total_transactions': recent_txn_count,
                    'total_users': user_count
                }
            }
            
        except Exception as e:
            health_data['checks']['application'] = {
                'status': 'error',
                'message': f'Application check failed: {str(e)}'
            }
            health_data['status'] = 'unhealthy'
        
        # Response time
        health_data['response_time_ms'] = round((time.time() - start_time) * 1000, 2)
        
        # Overall status
        failed_checks = [check for check in health_data['checks'].values() 
                        if check.get('status') != 'healthy']
        
        if failed_checks:
            health_data['status'] = 'unhealthy'
            health_data['failed_checks_count'] = len(failed_checks)
        
        status_code = 200 if health_data['status'] == 'healthy' else 503
        
        return jsonify(health_data), status_code
        
    except Exception as e:
        current_app.logger.error(f"Detailed health check error: {str(e)}")
        return jsonify({
            'status': 'error',
            'error': str(e),
            'timestamp': datetime.utcnow().isoformat()
        }), 500

@health_bp.route('/ready', methods=['GET'])
@rate_limit(per_minute=120)
def readiness_check():
    """Kubernetes-style readiness check"""
    try:
        # Check if application is ready to serve traffic
        ready = True
        checks = {}
        
        # Database readiness
        try:
            db.engine.execute('SELECT 1')
            checks['database'] = True
        except:
            checks['database'] = False
            ready = False
        
        # Check critical models can be imported
        try:
            from src.models.transaction import Transaction
            from src.models.user import User
            checks['models'] = True
        except:
            checks['models'] = False
            ready = False
        
        return jsonify({
            'ready': ready,
            'checks': checks,
            'timestamp': datetime.utcnow().isoformat()
        }), 200 if ready else 503
        
    except Exception as e:
        return jsonify({
            'ready': False,
            'error': str(e),
            'timestamp': datetime.utcnow().isoformat()
        }), 503 