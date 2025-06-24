"""
Plugin Manager for PinkPay Payment Switch
Manages plugin loading, execution, and orchestration
"""

import asyncio
import importlib
import time
from typing import Dict, List, Any, Optional
from src.models.plugin_log import PluginLog

class PluginManager:
    """Plugin Manager for orchestrating payment processing plugins"""
    
    def __init__(self):
        self.plugins = {}
        self.enabled_plugins = []
        self.load_plugins()
    
    def load_plugins(self):
        """Load and initialize all plugins"""
        # Plugin configurations
        plugin_configs = {
            'fx_converter': {
                'module': 'src.plugins.fx_converter',
                'class': 'FXConverterPlugin',
                'version': '1.0.0',
                'enabled': True
            },
            'risk_checker': {
                'module': 'src.plugins.risk_checker',
                'class': 'RiskCheckerPlugin',
                'version': '1.0.0',
                'enabled': True
            },
            'token_handler': {
                'module': 'src.plugins.token_handler',
                'class': 'TokenHandlerPlugin',
                'version': '1.0.0',
                'enabled': True
            }
        }
        
        for name, config in plugin_configs.items():
            try:
                # Import plugin module
                module = importlib.import_module(config['module'])
                plugin_class = getattr(module, config['class'])
                
                # Initialize plugin
                plugin_instance = plugin_class()
                
                self.plugins[name] = {
                    'instance': plugin_instance,
                    'config': config,
                    'enabled': config['enabled']
                }
                
                if config['enabled']:
                    self.enabled_plugins.append(name)
                    
            except Exception as e:
                print(f"Failed to load plugin {name}: {str(e)}")
                self.plugins[name] = {
                    'instance': None,
                    'config': config,
                    'enabled': False,
                    'error': str(e)
                }
    
    async def execute_plugins(self, transaction_data: Dict[str, Any], transaction_id: str) -> Dict[str, Any]:
        """Execute all enabled plugins in sequence"""
        start_time = time.time()
        results = {
            'success': True,
            'data': transaction_data.copy(),
            'plugin_results': {},
            'errors': [],
            'execution_time_ms': 0
        }
        
        for plugin_name in self.enabled_plugins:
            plugin_info = self.plugins.get(plugin_name)
            if not plugin_info or not plugin_info['enabled']:
                continue
                
            plugin_instance = plugin_info['instance']
            if not plugin_instance:
                continue
            
            try:
                plugin_start_time = time.time()
                
                # Execute plugin
                plugin_result = await self._execute_single_plugin(
                    plugin_instance, 
                    plugin_name, 
                    results['data']
                )
                
                plugin_execution_time = int((time.time() - plugin_start_time) * 1000)
                
                # Update results with plugin output
                if plugin_result.get('success', False):
                    results['data'].update(plugin_result.get('data', {}))
                    results['plugin_results'][plugin_name] = {
                        'status': 'success',
                        'data': plugin_result.get('data', {}),
                        'execution_time_ms': plugin_execution_time
                    }
                else:
                    results['errors'].append({
                        'plugin': plugin_name,
                        'error': plugin_result.get('error', 'Unknown error')
                    })
                    results['plugin_results'][plugin_name] = {
                        'status': 'error',
                        'error': plugin_result.get('error'),
                        'execution_time_ms': plugin_execution_time
                    }
                
                # Log plugin execution
                PluginLog.log_plugin_execution(
                    transaction_id=transaction_id,
                    plugin_name=plugin_name,
                    plugin_version=plugin_info['config']['version'],
                    input_data=transaction_data,
                    output_data=plugin_result.get('data'),
                    execution_time_ms=plugin_execution_time,
                    error_message=plugin_result.get('error') if not plugin_result.get('success') else None
                )
                
            except Exception as e:
                error_msg = f"Plugin execution failed: {str(e)}"
                results['errors'].append({
                    'plugin': plugin_name,
                    'error': error_msg
                })
                results['plugin_results'][plugin_name] = {
                    'status': 'error',
                    'error': error_msg
                }
                
                # Log the error
                PluginLog.log_plugin_execution(
                    transaction_id=transaction_id,
                    plugin_name=plugin_name,
                    plugin_version=plugin_info['config']['version'],
                    input_data=transaction_data,
                    error_message=error_msg
                )
        
        # Set overall success status
        if results['errors']:
            results['success'] = False
        
        # Calculate total execution time
        results['execution_time_ms'] = int((time.time() - start_time) * 1000)
        
        return results
    
    async def _execute_single_plugin(self, plugin_instance, plugin_name: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Execute a single plugin safely"""
        try:
            # Check if plugin has async execute method
            if hasattr(plugin_instance, 'execute_async'):
                return await plugin_instance.execute_async(data)
            elif hasattr(plugin_instance, 'execute'):
                # Run sync method in executor to avoid blocking
                loop = asyncio.get_event_loop()
                return await loop.run_in_executor(None, plugin_instance.execute, data)
            else:
                return {
                    'success': False,
                    'error': f'Plugin {plugin_name} has no execute method'
                }
        except Exception as e:
            return {
                'success': False,
                'error': f'Plugin execution error: {str(e)}'
            }
    
    def get_plugin_info(self, plugin_name: str) -> Optional[Dict[str, Any]]:
        """Get information about a specific plugin"""
        plugin = self.plugins.get(plugin_name)
        if not plugin:
            return None
        
        return {
            'name': plugin_name,
            'version': plugin['config']['version'],
            'enabled': plugin['enabled'],
            'has_error': 'error' in plugin,
            'error': plugin.get('error')
        }
    
    def get_all_plugins_info(self) -> Dict[str, Dict[str, Any]]:
        """Get information about all plugins"""
        plugins_info = {}
        for name in self.plugins:
            plugins_info[name] = self.get_plugin_info(name)
        return plugins_info
    
    def enable_plugin(self, plugin_name: str) -> bool:
        """Enable a plugin"""
        if plugin_name not in self.plugins:
            return False
        
        self.plugins[plugin_name]['enabled'] = True
        if plugin_name not in self.enabled_plugins:
            self.enabled_plugins.append(plugin_name)
        
        return True
    
    def disable_plugin(self, plugin_name: str) -> bool:
        """Disable a plugin"""
        if plugin_name not in self.plugins:
            return False
        
        self.plugins[plugin_name]['enabled'] = False
        if plugin_name in self.enabled_plugins:
            self.enabled_plugins.remove(plugin_name)
        
        return True
    
    def get_plugin_stats(self) -> List[Dict[str, Any]]:
        """Get plugin execution statistics"""
        stats = []
        for plugin_name in self.plugins:
            plugin_logs = PluginLog.get_logs_by_plugin(plugin_name, limit=100)
            
            total_executions = len(plugin_logs)
            successful = len([log for log in plugin_logs if log.status == 'success'])
            failed = len([log for log in plugin_logs if log.status == 'error'])
            
            if total_executions > 0:
                success_rate = (successful / total_executions) * 100
                avg_execution_time = sum(
                    log.execution_time_ms for log in plugin_logs 
                    if log.execution_time_ms
                ) / len([log for log in plugin_logs if log.execution_time_ms])
            else:
                success_rate = 0
                avg_execution_time = 0
            
            stats.append({
                'plugin_name': plugin_name,
                'enabled': self.plugins[plugin_name]['enabled'],
                'total_executions': total_executions,
                'successful': successful,
                'failed': failed,
                'success_rate': round(success_rate, 2),
                'avg_execution_time_ms': round(avg_execution_time, 2)
            })
        
        return stats