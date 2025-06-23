"""
Plugin Manager for PinkPay Payment Switch
Manages and orchestrates plugin execution
"""

import time
import logging
import importlib
from typing import Dict, List, Any, Optional
from src.models.plugin_log import PluginLog

class PluginManager:
    """Plugin Manager for handling plugin execution"""
    
    def __init__(self):
        self.plugins = {}
        self.enabled_plugins = []
        self.plugin_order = ['fx_converter', 'risk_checker', 'token_handler']
        self.logger = logging.getLogger(__name__)
        self._load_plugins()
    
    def _load_plugins(self):
        """Load all available plugins"""
        try:
            # Import and register plugins
            from .fx_converter import FXConverterPlugin
            from .risk_checker import RiskCheckerPlugin  
            from .token_handler import TokenHandlerPlugin
            
            # Register plugins
            self.plugins['fx_converter'] = FXConverterPlugin()
            self.plugins['risk_checker'] = RiskCheckerPlugin()
            self.plugins['token_handler'] = TokenHandlerPlugin()
            
            # Set enabled plugins from config
            from src.config.settings import Config
            enabled = getattr(Config, 'PLUGINS_ENABLED', [])
            
            self.enabled_plugins = [p for p in enabled if p in self.plugins]
            
            self.logger.info(f"Loaded {len(self.plugins)} plugins, {len(self.enabled_plugins)} enabled")
            
        except Exception as e:
            self.logger.error(f"Failed to load plugins: {str(e)}")
    
    def is_plugin_enabled(self, plugin_name: str) -> bool:
        """Check if a plugin is enabled"""
        return plugin_name in self.enabled_plugins
    
    def get_plugin(self, plugin_name: str):
        """Get a specific plugin"""
        return self.plugins.get(plugin_name)
    
    def get_all_plugins_info(self) -> Dict[str, Dict]:
        """Get information about all plugins"""
        info = {}
        for name, plugin in self.plugins.items():
            info[name] = {
                'name': plugin.name,
                'version': plugin.version,
                'description': plugin.description,
                'enabled': self.is_plugin_enabled(name),
                'config': getattr(plugin, 'config', {})
            }
        return info
    
    async def execute_plugins(self, transaction_data: Dict[str, Any], transaction_id: str) -> Dict[str, Any]:
        """Execute all enabled plugins in order"""
        result = {
            'success': True,
            'data': transaction_data.copy(),
            'plugin_results': {},
            'errors': []
        }
        
        for plugin_name in self.plugin_order:
            if not self.is_plugin_enabled(plugin_name):
                continue
                
            plugin = self.get_plugin(plugin_name)
            if not plugin:
                continue
            
            try:
                start_time = time.time()
                
                # Execute plugin
                plugin_result = await plugin.execute(result['data'])
                
                execution_time = int((time.time() - start_time) * 1000)
                
                # Log plugin execution
                PluginLog.log_plugin_execution(
                    transaction_id=transaction_id,
                    plugin_name=plugin.name,
                    plugin_version=plugin.version,
                    input_data=result['data'],
                    output_data=plugin_result,
                    execution_time_ms=execution_time
                )
                
                # Update result
                if plugin_result.get('success', True):
                    result['data'].update(plugin_result.get('data', {}))
                    result['plugin_results'][plugin_name] = plugin_result
                else:
                    # Plugin failed
                    error_msg = plugin_result.get('error', 'Plugin execution failed')
                    result['errors'].append({
                        'plugin': plugin_name,
                        'error': error_msg
                    })
                    
                    # Log error
                    PluginLog.log_plugin_execution(
                        transaction_id=transaction_id,
                        plugin_name=plugin.name,
                        plugin_version=plugin.version,
                        input_data=result['data'],
                        execution_time_ms=execution_time,
                        error_message=error_msg
                    )
                    
                    # Check if plugin is critical
                    if plugin_result.get('critical', False):
                        result['success'] = False
                        break
                
            except Exception as e:
                error_msg = f"Plugin {plugin_name} execution failed: {str(e)}"
                self.logger.error(error_msg)
                
                result['errors'].append({
                    'plugin': plugin_name,
                    'error': error_msg
                })
                
                # Log error
                PluginLog.log_plugin_execution(
                    transaction_id=transaction_id,
                    plugin_name=plugin.name,
                    plugin_version=plugin.version,
                    input_data=result['data'],
                    error_message=error_msg
                )
                
                # Check if this is a critical plugin
                if getattr(plugin, 'critical', False):
                    result['success'] = False
                    break
        
        return result
    
    def enable_plugin(self, plugin_name: str) -> bool:
        """Enable a plugin"""
        if plugin_name in self.plugins and plugin_name not in self.enabled_plugins:
            self.enabled_plugins.append(plugin_name)
            self.logger.info(f"Enabled plugin: {plugin_name}")
            return True
        return False
    
    def disable_plugin(self, plugin_name: str) -> bool:
        """Disable a plugin"""
        if plugin_name in self.enabled_plugins:
            self.enabled_plugins.remove(plugin_name)
            self.logger.info(f"Disabled plugin: {plugin_name}")
            return True
        return False
    
    def get_plugin_stats(self) -> List[Dict]:
        """Get plugin execution statistics"""
        return PluginLog.get_plugin_stats()

class BasePlugin:
    """Base class for all plugins"""
    
    def __init__(self):
        self.name = "Base Plugin"
        self.version = "1.0.0"
        self.description = "Base plugin class"
        self.critical = False  # Whether failure should stop processing
        self.config = {}
    
    async def execute(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Execute the plugin logic"""
        raise NotImplementedError("Plugin must implement execute method")
    
    def validate_input(self, data: Dict[str, Any]) -> bool:
        """Validate input data"""
        return True
    
    def get_config(self) -> Dict[str, Any]:
        """Get plugin configuration"""
        return self.config 
Plugin Manager for PinkPay Payment Switch
Manages and orchestrates plugin execution
"""

import time
import logging
import importlib
from typing import Dict, List, Any, Optional
from src.models.plugin_log import PluginLog

class PluginManager:
    """Plugin Manager for handling plugin execution"""
    
    def __init__(self):
        self.plugins = {}
        self.enabled_plugins = []
        self.plugin_order = ['fx_converter', 'risk_checker', 'token_handler']
        self.logger = logging.getLogger(__name__)
        self._load_plugins()
    
    def _load_plugins(self):
        """Load all available plugins"""
        try:
            # Import and register plugins
            from .fx_converter import FXConverterPlugin
            from .risk_checker import RiskCheckerPlugin  
            from .token_handler import TokenHandlerPlugin
            
            # Register plugins
            self.plugins['fx_converter'] = FXConverterPlugin()
            self.plugins['risk_checker'] = RiskCheckerPlugin()
            self.plugins['token_handler'] = TokenHandlerPlugin()
            
            # Set enabled plugins from config
            from src.config.settings import Config
            enabled = getattr(Config, 'PLUGINS_ENABLED', [])
            
            self.enabled_plugins = [p for p in enabled if p in self.plugins]
            
            self.logger.info(f"Loaded {len(self.plugins)} plugins, {len(self.enabled_plugins)} enabled")
            
        except Exception as e:
            self.logger.error(f"Failed to load plugins: {str(e)}")
    
    def is_plugin_enabled(self, plugin_name: str) -> bool:
        """Check if a plugin is enabled"""
        return plugin_name in self.enabled_plugins
    
    def get_plugin(self, plugin_name: str):
        """Get a specific plugin"""
        return self.plugins.get(plugin_name)
    
    def get_all_plugins_info(self) -> Dict[str, Dict]:
        """Get information about all plugins"""
        info = {}
        for name, plugin in self.plugins.items():
            info[name] = {
                'name': plugin.name,
                'version': plugin.version,
                'description': plugin.description,
                'enabled': self.is_plugin_enabled(name),
                'config': getattr(plugin, 'config', {})
            }
        return info
    
    async def execute_plugins(self, transaction_data: Dict[str, Any], transaction_id: str) -> Dict[str, Any]:
        """Execute all enabled plugins in order"""
        result = {
            'success': True,
            'data': transaction_data.copy(),
            'plugin_results': {},
            'errors': []
        }
        
        for plugin_name in self.plugin_order:
            if not self.is_plugin_enabled(plugin_name):
                continue
                
            plugin = self.get_plugin(plugin_name)
            if not plugin:
                continue
            
            try:
                start_time = time.time()
                
                # Execute plugin
                plugin_result = await plugin.execute(result['data'])
                
                execution_time = int((time.time() - start_time) * 1000)
                
                # Log plugin execution
                PluginLog.log_plugin_execution(
                    transaction_id=transaction_id,
                    plugin_name=plugin.name,
                    plugin_version=plugin.version,
                    input_data=result['data'],
                    output_data=plugin_result,
                    execution_time_ms=execution_time
                )
                
                # Update result
                if plugin_result.get('success', True):
                    result['data'].update(plugin_result.get('data', {}))
                    result['plugin_results'][plugin_name] = plugin_result
                else:
                    # Plugin failed
                    error_msg = plugin_result.get('error', 'Plugin execution failed')
                    result['errors'].append({
                        'plugin': plugin_name,
                        'error': error_msg
                    })
                    
                    # Log error
                    PluginLog.log_plugin_execution(
                        transaction_id=transaction_id,
                        plugin_name=plugin.name,
                        plugin_version=plugin.version,
                        input_data=result['data'],
                        execution_time_ms=execution_time,
                        error_message=error_msg
                    )
                    
                    # Check if plugin is critical
                    if plugin_result.get('critical', False):
                        result['success'] = False
                        break
                
            except Exception as e:
                error_msg = f"Plugin {plugin_name} execution failed: {str(e)}"
                self.logger.error(error_msg)
                
                result['errors'].append({
                    'plugin': plugin_name,
                    'error': error_msg
                })
                
                # Log error
                PluginLog.log_plugin_execution(
                    transaction_id=transaction_id,
                    plugin_name=plugin.name,
                    plugin_version=plugin.version,
                    input_data=result['data'],
                    error_message=error_msg
                )
                
                # Check if this is a critical plugin
                if getattr(plugin, 'critical', False):
                    result['success'] = False
                    break
        
        return result
    
    def enable_plugin(self, plugin_name: str) -> bool:
        """Enable a plugin"""
        if plugin_name in self.plugins and plugin_name not in self.enabled_plugins:
            self.enabled_plugins.append(plugin_name)
            self.logger.info(f"Enabled plugin: {plugin_name}")
            return True
        return False
    
    def disable_plugin(self, plugin_name: str) -> bool:
        """Disable a plugin"""
        if plugin_name in self.enabled_plugins:
            self.enabled_plugins.remove(plugin_name)
            self.logger.info(f"Disabled plugin: {plugin_name}")
            return True
        return False
    
    def get_plugin_stats(self) -> List[Dict]:
        """Get plugin execution statistics"""
        return PluginLog.get_plugin_stats()

class BasePlugin:
    """Base class for all plugins"""
    
    def __init__(self):
        self.name = "Base Plugin"
        self.version = "1.0.0"
        self.description = "Base plugin class"
        self.critical = False  # Whether failure should stop processing
        self.config = {}
    
    async def execute(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Execute the plugin logic"""
        raise NotImplementedError("Plugin must implement execute method")
    
    def validate_input(self, data: Dict[str, Any]) -> bool:
        """Validate input data"""
        return True
    
    def get_config(self) -> Dict[str, Any]:
        """Get plugin configuration"""
        return self.config 