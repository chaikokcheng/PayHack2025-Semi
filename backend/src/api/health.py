"""
Health check API for PinkPay Payment Switch
"""

from flask import Blueprint, jsonify
from datetime import datetime
import psutil
import os

health_bp = Blueprint('health', __name__)

@health_bp.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    try:
        # Basic health data
        health_data = {
            'success': True,
            'status': 'healthy',
            'service': 'PinkPay Payment Switch',
            'version': '1.0.0',
            'timestamp': datetime.utcnow().isoformat(),
            'uptime_seconds': get_uptime(),
            'environment': os.getenv('FLASK_ENV', 'development')
        }
        
        # System metrics
        try:
            health_data['system'] = {
                'cpu_percent': psutil.cpu_percent(),
                'memory_percent': psutil.virtual_memory().percent,
                'disk_usage_percent': psutil.disk_usage('/').percent
            }
        except:
            health_data['system'] = {'status': 'metrics_unavailable'}
        
        # Database health
        health_data['database'] = check_database_health()
        
        # Plugin health
        health_data['plugins'] = check_plugins_health()
        
        return jsonify(health_data), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'status': 'unhealthy',
            'error': str(e),
            'timestamp': datetime.utcnow().isoformat()
        }), 500

@health_bp.route('/health/detailed', methods=['GET'])
def detailed_health_check():
    """Detailed health check with more metrics"""
    try:
        from src.database.connection import test_supabase_connection
        from src.plugins.plugin_manager import PluginManager
        
        health_data = {
            'success': True,
            'status': 'healthy',
            'timestamp': datetime.utcnow().isoformat(),
            'checks': {
                'database': {
                    'status': 'healthy' if test_supabase_connection() else 'unhealthy',
                    'response_time_ms': 50  # Mock response time
                },
                'plugins': check_detailed_plugin_health(),
                'memory': {
                    'status': 'healthy',
                    'usage_mb': round(psutil.virtual_memory().used / 1024 / 1024, 2),
                    'available_mb': round(psutil.virtual_memory().available / 1024 / 1024, 2)
                },
                'disk': {
                    'status': 'healthy',
                    'free_gb': round(psutil.disk_usage('/').free / 1024 / 1024 / 1024, 2)
                }
            }
        }
        
        return jsonify(health_data), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'status': 'unhealthy',
            'error': str(e),
            'timestamp': datetime.utcnow().isoformat()
        }), 500

def get_uptime():
    """Get application uptime in seconds"""
    try:
        return int(psutil.Process(os.getpid()).create_time())
    except:
        return 0

def check_database_health():
    """Check database connectivity"""
    try:
        from src.database.connection import test_supabase_connection
        
        if test_supabase_connection():
            return {
                'status': 'healthy',
                'provider': 'supabase',
                'connection': 'active'
            }
        else:
            return {
                'status': 'unhealthy',
                'provider': 'supabase',
                'connection': 'failed'
            }
    except Exception as e:
        return {
            'status': 'error',
            'error': str(e)
        }

def check_plugins_health():
    """Check plugins health"""
    try:
        from src.plugins.plugin_manager import PluginManager
        
        plugin_manager = PluginManager()
        plugins_info = plugin_manager.get_all_plugins_info()
        
        healthy_count = sum(1 for p in plugins_info.values() if p['enabled'])
        total_count = len(plugins_info)
        
        return {
            'status': 'healthy' if healthy_count > 0 else 'warning',
            'enabled_plugins': healthy_count,
            'total_plugins': total_count,
            'plugins': {name: info['enabled'] for name, info in plugins_info.items()}
        }
    except Exception as e:
        return {
            'status': 'error',
            'error': str(e)
        }

def check_detailed_plugin_health():
    """Detailed plugin health check"""
    try:
        from src.plugins.plugin_manager import PluginManager
        
        plugin_manager = PluginManager()
        plugins_info = plugin_manager.get_all_plugins_info()
        
        plugin_health = {}
        for name, info in plugins_info.items():
            plugin_health[name] = {
                'status': 'healthy' if info['enabled'] else 'disabled',
                'version': info['version'],
                'enabled': info['enabled']
            }
        
        return plugin_health
    except Exception as e:
        return {'error': str(e)} 
Health check API for PinkPay Payment Switch
"""

from flask import Blueprint, jsonify
from datetime import datetime
import psutil
import os

health_bp = Blueprint('health', __name__)

@health_bp.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    try:
        # Basic health data
        health_data = {
            'success': True,
            'status': 'healthy',
            'service': 'PinkPay Payment Switch',
            'version': '1.0.0',
            'timestamp': datetime.utcnow().isoformat(),
            'uptime_seconds': get_uptime(),
            'environment': os.getenv('FLASK_ENV', 'development')
        }
        
        # System metrics
        try:
            health_data['system'] = {
                'cpu_percent': psutil.cpu_percent(),
                'memory_percent': psutil.virtual_memory().percent,
                'disk_usage_percent': psutil.disk_usage('/').percent
            }
        except:
            health_data['system'] = {'status': 'metrics_unavailable'}
        
        # Database health
        health_data['database'] = check_database_health()
        
        # Plugin health
        health_data['plugins'] = check_plugins_health()
        
        return jsonify(health_data), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'status': 'unhealthy',
            'error': str(e),
            'timestamp': datetime.utcnow().isoformat()
        }), 500

@health_bp.route('/health/detailed', methods=['GET'])
def detailed_health_check():
    """Detailed health check with more metrics"""
    try:
        from src.database.connection import test_supabase_connection
        from src.plugins.plugin_manager import PluginManager
        
        health_data = {
            'success': True,
            'status': 'healthy',
            'timestamp': datetime.utcnow().isoformat(),
            'checks': {
                'database': {
                    'status': 'healthy' if test_supabase_connection() else 'unhealthy',
                    'response_time_ms': 50  # Mock response time
                },
                'plugins': check_detailed_plugin_health(),
                'memory': {
                    'status': 'healthy',
                    'usage_mb': round(psutil.virtual_memory().used / 1024 / 1024, 2),
                    'available_mb': round(psutil.virtual_memory().available / 1024 / 1024, 2)
                },
                'disk': {
                    'status': 'healthy',
                    'free_gb': round(psutil.disk_usage('/').free / 1024 / 1024 / 1024, 2)
                }
            }
        }
        
        return jsonify(health_data), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'status': 'unhealthy',
            'error': str(e),
            'timestamp': datetime.utcnow().isoformat()
        }), 500

def get_uptime():
    """Get application uptime in seconds"""
    try:
        return int(psutil.Process(os.getpid()).create_time())
    except:
        return 0

def check_database_health():
    """Check database connectivity"""
    try:
        from src.database.connection import test_supabase_connection
        
        if test_supabase_connection():
            return {
                'status': 'healthy',
                'provider': 'supabase',
                'connection': 'active'
            }
        else:
            return {
                'status': 'unhealthy',
                'provider': 'supabase',
                'connection': 'failed'
            }
    except Exception as e:
        return {
            'status': 'error',
            'error': str(e)
        }

def check_plugins_health():
    """Check plugins health"""
    try:
        from src.plugins.plugin_manager import PluginManager
        
        plugin_manager = PluginManager()
        plugins_info = plugin_manager.get_all_plugins_info()
        
        healthy_count = sum(1 for p in plugins_info.values() if p['enabled'])
        total_count = len(plugins_info)
        
        return {
            'status': 'healthy' if healthy_count > 0 else 'warning',
            'enabled_plugins': healthy_count,
            'total_plugins': total_count,
            'plugins': {name: info['enabled'] for name, info in plugins_info.items()}
        }
    except Exception as e:
        return {
            'status': 'error',
            'error': str(e)
        }

def check_detailed_plugin_health():
    """Detailed plugin health check"""
    try:
        from src.plugins.plugin_manager import PluginManager
        
        plugin_manager = PluginManager()
        plugins_info = plugin_manager.get_all_plugins_info()
        
        plugin_health = {}
        for name, info in plugins_info.items():
            plugin_health[name] = {
                'status': 'healthy' if info['enabled'] else 'disabled',
                'version': info['version'],
                'enabled': info['enabled']
            }
        
        return plugin_health
    except Exception as e:
        return {'error': str(e)} 