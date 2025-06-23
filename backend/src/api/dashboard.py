"""
Dashboard API for PinkPay Payment Switch
Provides management and analytics endpoints for the dashboard
"""

from flask import Blueprint, request, jsonify, current_app
from datetime import datetime, timedelta
from src.models.transaction import Transaction
from src.models.user import User
from src.models.plugin_log import PluginLog
from src.models.offline_token import OfflineToken
from src.models.qr_code import QRCode
from src.middleware.rate_limiter import rate_limit
from src.middleware.security import require_api_key

dashboard_bp = Blueprint('dashboard', __name__)

@dashboard_bp.route('/overview', methods=['GET'])
@rate_limit(per_minute=60)
def get_overview():
    """Get dashboard overview with key metrics"""
    try:
        # Transaction statistics
        txn_stats = Transaction.get_transaction_stats()
        
        # Token statistics
        token_stats = OfflineToken.get_token_stats()
        
        # QR code statistics
        qr_stats = QRCode.get_qr_stats()
        
        # Plugin statistics
        plugin_stats = PluginLog.get_plugin_stats()
        
        # Recent activity
        recent_transactions = Transaction.get_recent_transactions(10)
        recent_logs = PluginLog.get_recent_logs(20)
        
        # System health
        system_health = get_system_health()
        
        overview_data = {
            'success': True,
            'timestamp': datetime.utcnow().isoformat(),
            'summary': {
                'total_transactions': txn_stats['total_transactions'],
                'total_volume_myr': txn_stats['total_volume'],
                'success_rate_percent': txn_stats['success_rate'],
                'active_tokens': token_stats['active'],
                'active_qr_codes': qr_stats['active'],
                'enabled_plugins': len([p for p in plugin_stats if p.get('success_rate', 0) > 0])
            },
            'statistics': {
                'transactions': txn_stats,
                'tokens': token_stats,
                'qr_codes': qr_stats,
                'plugins': plugin_stats
            },
            'recent_activity': {
                'transactions': [txn.to_dict() for txn in recent_transactions],
                'plugin_logs': [log.to_dict() for log in recent_logs]
            },
            'system_health': system_health
        }
        
        return jsonify(overview_data), 200
        
    except Exception as e:
        current_app.logger.error(f"Dashboard overview error: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to fetch dashboard overview',
            'message': str(e),
            'timestamp': datetime.utcnow().isoformat()
        }), 500

@dashboard_bp.route('/transactions', methods=['GET'])
@rate_limit(per_minute=100)
def get_transactions():
    """Get transactions with filtering and pagination"""
    try:
        # Query parameters
        page = int(request.args.get('page', 1))
        limit = min(int(request.args.get('limit', 50)), 100)  # Max 100 per page
        status = request.args.get('status')
        payment_rail = request.args.get('payment_rail')
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        # Build query
        query = Transaction.query
        
        if status:
            query = query.filter(Transaction.status == status)
        
        if payment_rail:
            query = query.filter(Transaction.payment_rail == payment_rail)
        
        if start_date:
            start_dt = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
            query = query.filter(Transaction.created_at >= start_dt)
        
        if end_date:
            end_dt = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
            query = query.filter(Transaction.created_at <= end_dt)
        
        # Order and paginate
        query = query.order_by(Transaction.created_at.desc())
        offset = (page - 1) * limit
        transactions = query.offset(offset).limit(limit).all()
        
        # Get total count for pagination
        total_count = query.count()
        total_pages = (total_count + limit - 1) // limit
        
        return jsonify({
            'success': True,
            'transactions': [txn.to_dict() for txn in transactions],
            'pagination': {
                'page': page,
                'limit': limit,
                'total_count': total_count,
                'total_pages': total_pages,
                'has_next': page < total_pages,
                'has_prev': page > 1
            },
            'filters_applied': {
                'status': status,
                'payment_rail': payment_rail,
                'start_date': start_date,
                'end_date': end_date
            },
            'timestamp': datetime.utcnow().isoformat()
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Dashboard transactions error: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to fetch transactions',
            'message': str(e),
            'timestamp': datetime.utcnow().isoformat()
        }), 500

@dashboard_bp.route('/transactions/stats', methods=['GET'])
@rate_limit(per_minute=30)
def get_transaction_stats():
    """Get detailed transaction statistics"""
    try:
        # Time range filter
        days = int(request.args.get('days', 7))
        start_date = datetime.utcnow() - timedelta(days=days)
        
        # Base statistics
        stats = Transaction.get_transaction_stats()
        
        # Time-series data (daily breakdown)
        daily_stats = get_daily_transaction_stats(start_date)
        
        # Payment rail breakdown
        rail_stats = get_payment_rail_stats()
        
        # Amount distribution
        amount_distribution = get_amount_distribution()
        
        return jsonify({
            'success': True,
            'period_days': days,
            'overall_stats': stats,
            'daily_breakdown': daily_stats,
            'payment_rails': rail_stats,
            'amount_distribution': amount_distribution,
            'timestamp': datetime.utcnow().isoformat()
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Transaction stats error: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to fetch transaction statistics',
            'message': str(e),
            'timestamp': datetime.utcnow().isoformat()
        }), 500

@dashboard_bp.route('/logs', methods=['GET'])
@rate_limit(per_minute=100)
def get_plugin_logs():
    """Get plugin execution logs"""
    try:
        # Query parameters
        page = int(request.args.get('page', 1))
        limit = min(int(request.args.get('limit', 50)), 100)
        plugin_name = request.args.get('plugin')
        status = request.args.get('status')  # success, error, warning
        
        # Build query
        query = PluginLog.query
        
        if plugin_name:
            query = query.filter(PluginLog.plugin_name == plugin_name)
        
        if status:
            query = query.filter(PluginLog.status == status)
        
        # Order and paginate
        query = query.order_by(PluginLog.created_at.desc())
        offset = (page - 1) * limit
        logs = query.offset(offset).limit(limit).all()
        
        # Get total count
        total_count = query.count()
        total_pages = (total_count + limit - 1) // limit
        
        return jsonify({
            'success': True,
            'logs': [log.to_dict() for log in logs],
            'pagination': {
                'page': page,
                'limit': limit,
                'total_count': total_count,
                'total_pages': total_pages,
                'has_next': page < total_pages,
                'has_prev': page > 1
            },
            'filters_applied': {
                'plugin': plugin_name,
                'status': status
            },
            'timestamp': datetime.utcnow().isoformat()
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Plugin logs error: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to fetch plugin logs',
            'message': str(e),
            'timestamp': datetime.utcnow().isoformat()
        }), 500

@dashboard_bp.route('/plugins', methods=['GET'])
@rate_limit(per_minute=60)
def get_plugins_status():
    """Get plugins status and configuration"""
    try:
        from src.plugins.plugin_manager import PluginManager
        
        plugin_manager = PluginManager()
        
        # Get plugin information
        plugins_info = plugin_manager.get_all_plugins_info()
        
        # Get plugin statistics
        plugin_stats = plugin_manager.get_plugin_stats()
        
        # Get recent errors
        error_logs = PluginLog.get_error_logs(10)
        
        return jsonify({
            'success': True,
            'plugins': plugins_info,
            'statistics': plugin_stats,
            'recent_errors': [log.to_dict() for log in error_logs],
            'timestamp': datetime.utcnow().isoformat()
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Plugins status error: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to fetch plugins status',
            'message': str(e),
            'timestamp': datetime.utcnow().isoformat()
        }), 500

@dashboard_bp.route('/plugins/<plugin_name>/toggle', methods=['POST'])
@rate_limit(per_minute=10)
def toggle_plugin(plugin_name):
    """Enable or disable a plugin"""
    try:
        from src.plugins.plugin_manager import PluginManager
        
        data = request.get_json()
        enable = data.get('enable', True)
        
        plugin_manager = PluginManager()
        
        if enable:
            success = plugin_manager.enable_plugin(plugin_name)
            action = 'enabled'
        else:
            success = plugin_manager.disable_plugin(plugin_name)
            action = 'disabled'
        
        if success:
            return jsonify({
                'success': True,
                'plugin': plugin_name,
                'action': action,
                'message': f'Plugin {plugin_name} {action} successfully',
                'timestamp': datetime.utcnow().isoformat()
            }), 200
        else:
            return jsonify({
                'success': False,
                'error': f'Failed to {action.replace("d", "")} plugin {plugin_name}',
                'timestamp': datetime.utcnow().isoformat()
            }), 400
        
    except Exception as e:
        current_app.logger.error(f"Plugin toggle error: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to toggle plugin',
            'message': str(e),
            'timestamp': datetime.utcnow().isoformat()
        }), 500

@dashboard_bp.route('/tokens', methods=['GET'])
@rate_limit(per_minute=60)
def get_tokens():
    """Get offline tokens"""
    try:
        # Query parameters
        status = request.args.get('status')
        user_id = request.args.get('user_id')
        
        # Get tokens
        if user_id:
            tokens = OfflineToken.get_user_tokens(user_id, status)
        else:
            query = OfflineToken.query
            if status:
                query = query.filter(OfflineToken.status == status)
            tokens = query.order_by(OfflineToken.created_at.desc()).limit(100).all()
        
        return jsonify({
            'success': True,
            'tokens': [token.to_dict() for token in tokens],
            'filters_applied': {
                'status': status,
                'user_id': user_id
            },
            'timestamp': datetime.utcnow().isoformat()
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Tokens fetch error: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to fetch tokens',
            'message': str(e),
            'timestamp': datetime.utcnow().isoformat()
        }), 500

@dashboard_bp.route('/tokens/cleanup', methods=['POST'])
@rate_limit(per_minute=5)
def cleanup_expired_tokens():
    """Cleanup expired tokens"""
    try:
        # Cleanup expired tokens
        cleaned_count = OfflineToken.cleanup_expired_tokens()
        
        # Also cleanup expired QR codes
        qr_cleaned_count = QRCode.cleanup_expired_qrs()
        
        return jsonify({
            'success': True,
            'tokens_cleaned': cleaned_count,
            'qr_codes_cleaned': qr_cleaned_count,
            'message': f'Cleaned up {cleaned_count} expired tokens and {qr_cleaned_count} expired QR codes',
            'timestamp': datetime.utcnow().isoformat()
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Token cleanup error: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to cleanup expired tokens',
            'message': str(e),
            'timestamp': datetime.utcnow().isoformat()
        }), 500

@dashboard_bp.route('/users', methods=['GET'])
@rate_limit(per_minute=60)
def get_users():
    """Get users with transaction counts"""
    try:
        # Query parameters
        page = int(request.args.get('page', 1))
        limit = min(int(request.args.get('limit', 50)), 100)
        
        # Get users with pagination
        offset = (page - 1) * limit
        users = User.query.order_by(User.created_at.desc()).offset(offset).limit(limit).all()
        
        # Get total count
        total_count = User.query.count()
        total_pages = (total_count + limit - 1) // limit
        
        # Enhance user data with transaction counts
        user_data = []
        for user in users:
            user_dict = user.to_dict()
            user_dict['transaction_count'] = user.transactions.count()
            user_dict['active_transactions'] = len(user.get_active_transactions())
            user_dict['daily_amount'] = user.calculate_daily_amount()
            user_data.append(user_dict)
        
        return jsonify({
            'success': True,
            'users': user_data,
            'pagination': {
                'page': page,
                'limit': limit,
                'total_count': total_count,
                'total_pages': total_pages,
                'has_next': page < total_pages,
                'has_prev': page > 1
            },
            'timestamp': datetime.utcnow().isoformat()
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Users fetch error: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to fetch users',
            'message': str(e),
            'timestamp': datetime.utcnow().isoformat()
        }), 500

def get_system_health():
    """Get system health metrics"""
    try:
        import psutil
        
        return {
            'status': 'healthy',
            'cpu_percent': psutil.cpu_percent(),
            'memory_percent': psutil.virtual_memory().percent,
            'disk_percent': psutil.disk_usage('/').percent,
            'uptime_hours': psutil.boot_time(),
            'active_connections': len(psutil.net_connections()),
            'database_status': 'connected'  # Simplified for demo
        }
    except:
        return {
            'status': 'unknown',
            'error': 'Unable to fetch system metrics'
        }

def get_daily_transaction_stats(start_date):
    """Get daily transaction statistics"""
    # This would typically use database aggregation
    # For demo, return mock data
    daily_stats = []
    current_date = start_date
    
    while current_date <= datetime.utcnow():
        daily_stats.append({
            'date': current_date.strftime('%Y-%m-%d'),
            'total_transactions': 45,  # Mock data
            'completed_transactions': 42,
            'failed_transactions': 3,
            'total_volume': 15420.50,
            'average_amount': 342.68
        })
        current_date += timedelta(days=1)
    
    return daily_stats

def get_payment_rail_stats():
    """Get payment rail statistics"""
    # Mock data for demo
    return {
        'duitnow': {'count': 245, 'volume': 45620.30, 'avg_time_ms': 2100},
        'paynow': {'count': 156, 'volume': 28340.50, 'avg_time_ms': 2800},
        'boost': {'count': 189, 'volume': 12450.75, 'avg_time_ms': 1200},
        'tng': {'count': 203, 'volume': 18750.25, 'avg_time_ms': 1500},
        'cross_wallet_routing': {'count': 45, 'volume': 8950.40, 'avg_time_ms': 3200}
    }

def get_amount_distribution():
    """Get transaction amount distribution"""
    # Mock data for demo
    return {
        'ranges': [
            {'range': '0-50', 'count': 456, 'percentage': 45.6},
            {'range': '51-200', 'count': 289, 'percentage': 28.9},
            {'range': '201-500', 'count': 145, 'percentage': 14.5},
            {'range': '501-1000', 'count': 78, 'percentage': 7.8},
            {'range': '1000+', 'count': 32, 'percentage': 3.2}
        ],
        'average_amount': 245.67,
        'median_amount': 125.50,
        'total_volume': 245670.89
    } 
Dashboard API for PinkPay Payment Switch
Provides management and analytics endpoints for the dashboard
"""

from flask import Blueprint, request, jsonify, current_app
from datetime import datetime, timedelta
from src.models.transaction import Transaction
from src.models.user import User
from src.models.plugin_log import PluginLog
from src.models.offline_token import OfflineToken
from src.models.qr_code import QRCode
from src.middleware.rate_limiter import rate_limit
from src.middleware.security import require_api_key

dashboard_bp = Blueprint('dashboard', __name__)

@dashboard_bp.route('/overview', methods=['GET'])
@rate_limit(per_minute=60)
def get_overview():
    """Get dashboard overview with key metrics"""
    try:
        # Transaction statistics
        txn_stats = Transaction.get_transaction_stats()
        
        # Token statistics
        token_stats = OfflineToken.get_token_stats()
        
        # QR code statistics
        qr_stats = QRCode.get_qr_stats()
        
        # Plugin statistics
        plugin_stats = PluginLog.get_plugin_stats()
        
        # Recent activity
        recent_transactions = Transaction.get_recent_transactions(10)
        recent_logs = PluginLog.get_recent_logs(20)
        
        # System health
        system_health = get_system_health()
        
        overview_data = {
            'success': True,
            'timestamp': datetime.utcnow().isoformat(),
            'summary': {
                'total_transactions': txn_stats['total_transactions'],
                'total_volume_myr': txn_stats['total_volume'],
                'success_rate_percent': txn_stats['success_rate'],
                'active_tokens': token_stats['active'],
                'active_qr_codes': qr_stats['active'],
                'enabled_plugins': len([p for p in plugin_stats if p.get('success_rate', 0) > 0])
            },
            'statistics': {
                'transactions': txn_stats,
                'tokens': token_stats,
                'qr_codes': qr_stats,
                'plugins': plugin_stats
            },
            'recent_activity': {
                'transactions': [txn.to_dict() for txn in recent_transactions],
                'plugin_logs': [log.to_dict() for log in recent_logs]
            },
            'system_health': system_health
        }
        
        return jsonify(overview_data), 200
        
    except Exception as e:
        current_app.logger.error(f"Dashboard overview error: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to fetch dashboard overview',
            'message': str(e),
            'timestamp': datetime.utcnow().isoformat()
        }), 500

@dashboard_bp.route('/transactions', methods=['GET'])
@rate_limit(per_minute=100)
def get_transactions():
    """Get transactions with filtering and pagination"""
    try:
        # Query parameters
        page = int(request.args.get('page', 1))
        limit = min(int(request.args.get('limit', 50)), 100)  # Max 100 per page
        status = request.args.get('status')
        payment_rail = request.args.get('payment_rail')
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        # Build query
        query = Transaction.query
        
        if status:
            query = query.filter(Transaction.status == status)
        
        if payment_rail:
            query = query.filter(Transaction.payment_rail == payment_rail)
        
        if start_date:
            start_dt = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
            query = query.filter(Transaction.created_at >= start_dt)
        
        if end_date:
            end_dt = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
            query = query.filter(Transaction.created_at <= end_dt)
        
        # Order and paginate
        query = query.order_by(Transaction.created_at.desc())
        offset = (page - 1) * limit
        transactions = query.offset(offset).limit(limit).all()
        
        # Get total count for pagination
        total_count = query.count()
        total_pages = (total_count + limit - 1) // limit
        
        return jsonify({
            'success': True,
            'transactions': [txn.to_dict() for txn in transactions],
            'pagination': {
                'page': page,
                'limit': limit,
                'total_count': total_count,
                'total_pages': total_pages,
                'has_next': page < total_pages,
                'has_prev': page > 1
            },
            'filters_applied': {
                'status': status,
                'payment_rail': payment_rail,
                'start_date': start_date,
                'end_date': end_date
            },
            'timestamp': datetime.utcnow().isoformat()
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Dashboard transactions error: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to fetch transactions',
            'message': str(e),
            'timestamp': datetime.utcnow().isoformat()
        }), 500

@dashboard_bp.route('/transactions/stats', methods=['GET'])
@rate_limit(per_minute=30)
def get_transaction_stats():
    """Get detailed transaction statistics"""
    try:
        # Time range filter
        days = int(request.args.get('days', 7))
        start_date = datetime.utcnow() - timedelta(days=days)
        
        # Base statistics
        stats = Transaction.get_transaction_stats()
        
        # Time-series data (daily breakdown)
        daily_stats = get_daily_transaction_stats(start_date)
        
        # Payment rail breakdown
        rail_stats = get_payment_rail_stats()
        
        # Amount distribution
        amount_distribution = get_amount_distribution()
        
        return jsonify({
            'success': True,
            'period_days': days,
            'overall_stats': stats,
            'daily_breakdown': daily_stats,
            'payment_rails': rail_stats,
            'amount_distribution': amount_distribution,
            'timestamp': datetime.utcnow().isoformat()
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Transaction stats error: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to fetch transaction statistics',
            'message': str(e),
            'timestamp': datetime.utcnow().isoformat()
        }), 500

@dashboard_bp.route('/logs', methods=['GET'])
@rate_limit(per_minute=100)
def get_plugin_logs():
    """Get plugin execution logs"""
    try:
        # Query parameters
        page = int(request.args.get('page', 1))
        limit = min(int(request.args.get('limit', 50)), 100)
        plugin_name = request.args.get('plugin')
        status = request.args.get('status')  # success, error, warning
        
        # Build query
        query = PluginLog.query
        
        if plugin_name:
            query = query.filter(PluginLog.plugin_name == plugin_name)
        
        if status:
            query = query.filter(PluginLog.status == status)
        
        # Order and paginate
        query = query.order_by(PluginLog.created_at.desc())
        offset = (page - 1) * limit
        logs = query.offset(offset).limit(limit).all()
        
        # Get total count
        total_count = query.count()
        total_pages = (total_count + limit - 1) // limit
        
        return jsonify({
            'success': True,
            'logs': [log.to_dict() for log in logs],
            'pagination': {
                'page': page,
                'limit': limit,
                'total_count': total_count,
                'total_pages': total_pages,
                'has_next': page < total_pages,
                'has_prev': page > 1
            },
            'filters_applied': {
                'plugin': plugin_name,
                'status': status
            },
            'timestamp': datetime.utcnow().isoformat()
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Plugin logs error: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to fetch plugin logs',
            'message': str(e),
            'timestamp': datetime.utcnow().isoformat()
        }), 500

@dashboard_bp.route('/plugins', methods=['GET'])
@rate_limit(per_minute=60)
def get_plugins_status():
    """Get plugins status and configuration"""
    try:
        from src.plugins.plugin_manager import PluginManager
        
        plugin_manager = PluginManager()
        
        # Get plugin information
        plugins_info = plugin_manager.get_all_plugins_info()
        
        # Get plugin statistics
        plugin_stats = plugin_manager.get_plugin_stats()
        
        # Get recent errors
        error_logs = PluginLog.get_error_logs(10)
        
        return jsonify({
            'success': True,
            'plugins': plugins_info,
            'statistics': plugin_stats,
            'recent_errors': [log.to_dict() for log in error_logs],
            'timestamp': datetime.utcnow().isoformat()
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Plugins status error: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to fetch plugins status',
            'message': str(e),
            'timestamp': datetime.utcnow().isoformat()
        }), 500

@dashboard_bp.route('/plugins/<plugin_name>/toggle', methods=['POST'])
@rate_limit(per_minute=10)
def toggle_plugin(plugin_name):
    """Enable or disable a plugin"""
    try:
        from src.plugins.plugin_manager import PluginManager
        
        data = request.get_json()
        enable = data.get('enable', True)
        
        plugin_manager = PluginManager()
        
        if enable:
            success = plugin_manager.enable_plugin(plugin_name)
            action = 'enabled'
        else:
            success = plugin_manager.disable_plugin(plugin_name)
            action = 'disabled'
        
        if success:
            return jsonify({
                'success': True,
                'plugin': plugin_name,
                'action': action,
                'message': f'Plugin {plugin_name} {action} successfully',
                'timestamp': datetime.utcnow().isoformat()
            }), 200
        else:
            return jsonify({
                'success': False,
                'error': f'Failed to {action.replace("d", "")} plugin {plugin_name}',
                'timestamp': datetime.utcnow().isoformat()
            }), 400
        
    except Exception as e:
        current_app.logger.error(f"Plugin toggle error: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to toggle plugin',
            'message': str(e),
            'timestamp': datetime.utcnow().isoformat()
        }), 500

@dashboard_bp.route('/tokens', methods=['GET'])
@rate_limit(per_minute=60)
def get_tokens():
    """Get offline tokens"""
    try:
        # Query parameters
        status = request.args.get('status')
        user_id = request.args.get('user_id')
        
        # Get tokens
        if user_id:
            tokens = OfflineToken.get_user_tokens(user_id, status)
        else:
            query = OfflineToken.query
            if status:
                query = query.filter(OfflineToken.status == status)
            tokens = query.order_by(OfflineToken.created_at.desc()).limit(100).all()
        
        return jsonify({
            'success': True,
            'tokens': [token.to_dict() for token in tokens],
            'filters_applied': {
                'status': status,
                'user_id': user_id
            },
            'timestamp': datetime.utcnow().isoformat()
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Tokens fetch error: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to fetch tokens',
            'message': str(e),
            'timestamp': datetime.utcnow().isoformat()
        }), 500

@dashboard_bp.route('/tokens/cleanup', methods=['POST'])
@rate_limit(per_minute=5)
def cleanup_expired_tokens():
    """Cleanup expired tokens"""
    try:
        # Cleanup expired tokens
        cleaned_count = OfflineToken.cleanup_expired_tokens()
        
        # Also cleanup expired QR codes
        qr_cleaned_count = QRCode.cleanup_expired_qrs()
        
        return jsonify({
            'success': True,
            'tokens_cleaned': cleaned_count,
            'qr_codes_cleaned': qr_cleaned_count,
            'message': f'Cleaned up {cleaned_count} expired tokens and {qr_cleaned_count} expired QR codes',
            'timestamp': datetime.utcnow().isoformat()
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Token cleanup error: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to cleanup expired tokens',
            'message': str(e),
            'timestamp': datetime.utcnow().isoformat()
        }), 500

@dashboard_bp.route('/users', methods=['GET'])
@rate_limit(per_minute=60)
def get_users():
    """Get users with transaction counts"""
    try:
        # Query parameters
        page = int(request.args.get('page', 1))
        limit = min(int(request.args.get('limit', 50)), 100)
        
        # Get users with pagination
        offset = (page - 1) * limit
        users = User.query.order_by(User.created_at.desc()).offset(offset).limit(limit).all()
        
        # Get total count
        total_count = User.query.count()
        total_pages = (total_count + limit - 1) // limit
        
        # Enhance user data with transaction counts
        user_data = []
        for user in users:
            user_dict = user.to_dict()
            user_dict['transaction_count'] = user.transactions.count()
            user_dict['active_transactions'] = len(user.get_active_transactions())
            user_dict['daily_amount'] = user.calculate_daily_amount()
            user_data.append(user_dict)
        
        return jsonify({
            'success': True,
            'users': user_data,
            'pagination': {
                'page': page,
                'limit': limit,
                'total_count': total_count,
                'total_pages': total_pages,
                'has_next': page < total_pages,
                'has_prev': page > 1
            },
            'timestamp': datetime.utcnow().isoformat()
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Users fetch error: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to fetch users',
            'message': str(e),
            'timestamp': datetime.utcnow().isoformat()
        }), 500

def get_system_health():
    """Get system health metrics"""
    try:
        import psutil
        
        return {
            'status': 'healthy',
            'cpu_percent': psutil.cpu_percent(),
            'memory_percent': psutil.virtual_memory().percent,
            'disk_percent': psutil.disk_usage('/').percent,
            'uptime_hours': psutil.boot_time(),
            'active_connections': len(psutil.net_connections()),
            'database_status': 'connected'  # Simplified for demo
        }
    except:
        return {
            'status': 'unknown',
            'error': 'Unable to fetch system metrics'
        }

def get_daily_transaction_stats(start_date):
    """Get daily transaction statistics"""
    # This would typically use database aggregation
    # For demo, return mock data
    daily_stats = []
    current_date = start_date
    
    while current_date <= datetime.utcnow():
        daily_stats.append({
            'date': current_date.strftime('%Y-%m-%d'),
            'total_transactions': 45,  # Mock data
            'completed_transactions': 42,
            'failed_transactions': 3,
            'total_volume': 15420.50,
            'average_amount': 342.68
        })
        current_date += timedelta(days=1)
    
    return daily_stats

def get_payment_rail_stats():
    """Get payment rail statistics"""
    # Mock data for demo
    return {
        'duitnow': {'count': 245, 'volume': 45620.30, 'avg_time_ms': 2100},
        'paynow': {'count': 156, 'volume': 28340.50, 'avg_time_ms': 2800},
        'boost': {'count': 189, 'volume': 12450.75, 'avg_time_ms': 1200},
        'tng': {'count': 203, 'volume': 18750.25, 'avg_time_ms': 1500},
        'cross_wallet_routing': {'count': 45, 'volume': 8950.40, 'avg_time_ms': 3200}
    }

def get_amount_distribution():
    """Get transaction amount distribution"""
    # Mock data for demo
    return {
        'ranges': [
            {'range': '0-50', 'count': 456, 'percentage': 45.6},
            {'range': '51-200', 'count': 289, 'percentage': 28.9},
            {'range': '201-500', 'count': 145, 'percentage': 14.5},
            {'range': '501-1000', 'count': 78, 'percentage': 7.8},
            {'range': '1000+', 'count': 32, 'percentage': 3.2}
        ],
        'average_amount': 245.67,
        'median_amount': 125.50,
        'total_volume': 245670.89
    } 