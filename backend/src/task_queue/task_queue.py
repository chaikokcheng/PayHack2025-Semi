"""
Task Queue System for PinkPay Payment Switch
Handles async processing of transactions and background tasks
"""

import asyncio
import logging
from datetime import datetime
from typing import Dict, Any, List
from collections import deque
import threading
import time

logger = logging.getLogger(__name__)

class TaskQueue:
    """Simple in-memory task queue for async processing"""
    
    def __init__(self):
        self.app = None
        self.tasks = deque()
        self.processing = {}
        self.completed = deque(maxlen=1000)  # Keep last 1000 completed tasks
        self.failed = deque(maxlen=500)      # Keep last 500 failed tasks
        self.worker_active = False
        self.worker_thread = None
        self.lock = threading.Lock()
    
    def add_task(self, task_type: str, task_data: Dict[str, Any], priority: int = 0) -> str:
        """Add a task to the queue"""
        task_id = f"{task_type}_{int(time.time())}_{len(self.tasks)}"
        
        task = {
            'id': task_id,
            'type': task_type,
            'data': task_data,
            'priority': priority,
            'created_at': datetime.utcnow().isoformat(),
            'status': 'pending',
            'retries': 0,
            'max_retries': 3
        }
        
        with self.lock:
            # Insert based on priority (higher priority first)
            inserted = False
            for i, existing_task in enumerate(self.tasks):
                if priority > existing_task['priority']:
                    self.tasks.insert(i, task)
                    inserted = True
                    break
            
            if not inserted:
                self.tasks.append(task)
        
        logger.info(f"Added task {task_id} to queue (type: {task_type}, priority: {priority})")
        return task_id
    
    def get_next_task(self) -> Dict[str, Any]:
        """Get next task from queue"""
        with self.lock:
            if self.tasks:
                return self.tasks.popleft()
            return None
    
    def mark_processing(self, task: Dict[str, Any]):
        """Mark task as processing"""
        task['status'] = 'processing'
        task['processing_started'] = datetime.utcnow().isoformat()
        self.processing[task['id']] = task
    
    def mark_completed(self, task: Dict[str, Any], result: Any = None):
        """Mark task as completed"""
        task['status'] = 'completed'
        task['completed_at'] = datetime.utcnow().isoformat()
        task['result'] = result
        
        if task['id'] in self.processing:
            del self.processing[task['id']]
        
        self.completed.append(task)
        logger.info(f"Task {task['id']} completed successfully")
    
    def mark_failed(self, task: Dict[str, Any], error: str):
        """Mark task as failed"""
        task['status'] = 'failed'
        task['failed_at'] = datetime.utcnow().isoformat()
        task['error'] = error
        task['retries'] += 1
        
        if task['id'] in self.processing:
            del self.processing[task['id']]
        
        # Retry if under max retries
        if task['retries'] < task['max_retries']:
            task['status'] = 'pending'
            with self.lock:
                self.tasks.appendleft(task)  # Add back to front for retry
            logger.warning(f"Task {task['id']} failed, retrying ({task['retries']}/{task['max_retries']})")
        else:
            self.failed.append(task)
            logger.error(f"Task {task['id']} failed permanently: {error}")
    
    def get_stats(self) -> Dict[str, Any]:
        """Get queue statistics"""
        with self.lock:
            return {
                'pending_tasks': len(self.tasks),
                'processing_tasks': len(self.processing),
                'completed_tasks': len(self.completed),
                'failed_tasks': len(self.failed),
                'worker_active': self.worker_active,
                'timestamp': datetime.utcnow().isoformat()
            }
    
    def get_task_status(self, task_id: str) -> Dict[str, Any]:
        """Get status of a specific task"""
        # Check processing
        if task_id in self.processing:
            return self.processing[task_id]
        
        # Check completed
        for task in self.completed:
            if task['id'] == task_id:
                return task
        
        # Check failed
        for task in self.failed:
            if task['id'] == task_id:
                return task
        
        # Check pending
        with self.lock:
            for task in self.tasks:
                if task['id'] == task_id:
                    return task
        
        return None
    
    def start_worker(self):
        """Start background worker thread"""
        if not self.worker_active:
            self.worker_active = True
            self.worker_thread = threading.Thread(target=self._worker_loop, daemon=True)
            self.worker_thread.start()
            logger.info("Task queue worker started")
    
    def stop_worker(self):
        """Stop background worker thread"""
        self.worker_active = False
        if self.worker_thread and self.worker_thread.is_alive():
            self.worker_thread.join(timeout=5)
        logger.info("Task queue worker stopped")
    
    def _worker_loop(self):
        """Background worker loop"""
        while self.worker_active:
            try:
                task = self.get_next_task()
                if task:
                    self.mark_processing(task)
                    try:
                        if self.app:
                            with self.app.app_context():
                                result = self._process_task(task)
                        else:
                            result = self._process_task(task)
                        self.mark_completed(task, result)
                    except Exception as e:
                        self.mark_failed(task, str(e))
                else:
                    time.sleep(0.1)  # Short sleep when no tasks
            except Exception as e:
                logger.error(f"Worker loop error: {str(e)}")
                time.sleep(1)
    
    def _process_task(self, task: Dict[str, Any]) -> Any:
        """Process a task based on its type"""
        task_type = task['type']
        task_data = task['data']
        
        if task_type == 'transaction_processing':
            return self._process_transaction(task_data)
        elif task_type == 'plugin_execution':
            return self._execute_plugins(task_data)
        elif task_type == 'token_cleanup':
            return self._cleanup_tokens(task_data)
        elif task_type == 'qr_cleanup':
            return self._cleanup_qr_codes(task_data)
        elif task_type == 'notification':
            return self._send_notification(task_data)
        else:
            raise ValueError(f"Unknown task type: {task_type}")
    
    def _process_transaction(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Process a transaction"""
        # Simulate transaction processing
        time.sleep(1)  # Simulate processing time
        
        return {
            'transaction_id': data.get('transaction_id'),
            'status': 'completed',
            'processed_at': datetime.utcnow().isoformat()
        }
    
    def _execute_plugins(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Execute plugins for a transaction"""
        # Simulate plugin execution
        time.sleep(0.5)
        
        return {
            'transaction_id': data.get('transaction_id'),
            'plugins_executed': ['fx_converter', 'risk_checker', 'token_handler'],
            'execution_time_ms': 500
        }
    
    def _cleanup_tokens(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Cleanup expired tokens"""
        from src.models.offline_token import OfflineToken
        
        try:
            cleaned_count = OfflineToken.cleanup_expired_tokens()
            return {
                'cleaned_tokens': cleaned_count,
                'cleanup_time': datetime.utcnow().isoformat()
            }
        except Exception as e:
            return {
                'error': str(e),
                'cleanup_time': datetime.utcnow().isoformat()
            }
    
    def _cleanup_qr_codes(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Cleanup expired QR codes"""
        from src.models.qr_code import QRCode
        
        try:
            cleaned_count = QRCode.cleanup_expired_qrs()
            return {
                'cleaned_qr_codes': cleaned_count,
                'cleanup_time': datetime.utcnow().isoformat()
            }
        except Exception as e:
            return {
                'error': str(e),
                'cleanup_time': datetime.utcnow().isoformat()
            }
    
    def _send_notification(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Send notification (mock implementation)"""
        # Mock notification sending
        time.sleep(0.2)
        
        return {
            'notification_type': data.get('type'),
            'recipient': data.get('recipient'),
            'sent_at': datetime.utcnow().isoformat(),
            'status': 'sent'
        }

# Global task queue instance
task_queue = TaskQueue()

def init_celery(app):
    """Initialize task queue (Celery replacement for demo)"""
    # In production, this would initialize Celery
    # For demo, we use our simple task queue
    
    app.task_queue = task_queue
    task_queue.app = app
    task_queue.start_worker()
    
    # Schedule periodic tasks after a delay to ensure app is ready
    def schedule_periodic_tasks():
        """Schedule periodic background tasks"""
        # Schedule token cleanup every hour
        task_queue.add_task('token_cleanup', {}, priority=1)
        
        # Schedule QR cleanup every 30 minutes  
        task_queue.add_task('qr_cleanup', {}, priority=1)
        
        logger.info("Periodic tasks scheduled")
    
    import threading
    def delayed_schedule():
        import time
        time.sleep(5)  # Wait 5 seconds
        schedule_periodic_tasks()
    
    threading.Thread(target=delayed_schedule, daemon=True).start()
    app.logger.info("Task queue initialized")

def add_transaction_task(transaction_id: str, transaction_data: Dict[str, Any]):
    """Add transaction processing task"""
    return task_queue.add_task(
        'transaction_processing',
        {
            'transaction_id': transaction_id,
            'transaction_data': transaction_data
        },
        priority=5
    )

def add_plugin_task(transaction_id: str, plugin_data: Dict[str, Any]):
    """Add plugin execution task"""
    return task_queue.add_task(
        'plugin_execution',
        {
            'transaction_id': transaction_id,
            'plugin_data': plugin_data
        },
        priority=7
    )

def add_notification_task(notification_type: str, recipient: str, data: Dict[str, Any]):
    """Add notification task"""
    return task_queue.add_task(
        'notification',
        {
            'type': notification_type,
            'recipient': recipient,
            'data': data
        },
        priority=3
    )

def get_queue_status():
    """Get current queue status"""
    return task_queue.get_stats()

def get_task_status(task_id: str):
    """Get status of a specific task"""
    return task_queue.get_task_status(task_id) 