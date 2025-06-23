"""
Logging utility for PinkPay Payment Switch
"""

import os
import logging
from logging.handlers import RotatingFileHandler
from flask import Flask

def setup_logger(app: Flask):
    """Setup application logging"""
    
    # Create logs directory if it doesn't exist
    if not os.path.exists('logs'):
        os.makedirs('logs')
    
    # Configure log level
    log_level = getattr(logging, app.config.get('LOG_LEVEL', 'INFO').upper())
    
    # Configure formatter
    formatter = logging.Formatter(
        '[%(asctime)s] %(levelname)s in %(module)s: %(message)s'
    )
    
    # File handler
    file_handler = RotatingFileHandler(
        app.config.get('LOG_FILE', 'logs/pinkpay.log'),
        maxBytes=10240000,  # 10MB
        backupCount=10
    )
    file_handler.setFormatter(formatter)
    file_handler.setLevel(log_level)
    
    # Console handler
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(formatter)
    console_handler.setLevel(log_level)
    
    # Configure app logger
    app.logger.setLevel(log_level)
    app.logger.addHandler(file_handler)
    app.logger.addHandler(console_handler)
    
    # Configure werkzeug logger
    werkzeug_logger = logging.getLogger('werkzeug')
    werkzeug_logger.setLevel(logging.WARNING)
    
    app.logger.info(f"Logging configured - Level: {app.config.get('LOG_LEVEL', 'INFO')}")

def get_logger(name: str):
    """Get a logger instance"""
    return logging.getLogger(name) 
Logging utility for PinkPay Payment Switch
"""

import os
import logging
from logging.handlers import RotatingFileHandler
from flask import Flask

def setup_logger(app: Flask):
    """Setup application logging"""
    
    # Create logs directory if it doesn't exist
    if not os.path.exists('logs'):
        os.makedirs('logs')
    
    # Configure log level
    log_level = getattr(logging, app.config.get('LOG_LEVEL', 'INFO').upper())
    
    # Configure formatter
    formatter = logging.Formatter(
        '[%(asctime)s] %(levelname)s in %(module)s: %(message)s'
    )
    
    # File handler
    file_handler = RotatingFileHandler(
        app.config.get('LOG_FILE', 'logs/pinkpay.log'),
        maxBytes=10240000,  # 10MB
        backupCount=10
    )
    file_handler.setFormatter(formatter)
    file_handler.setLevel(log_level)
    
    # Console handler
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(formatter)
    console_handler.setLevel(log_level)
    
    # Configure app logger
    app.logger.setLevel(log_level)
    app.logger.addHandler(file_handler)
    app.logger.addHandler(console_handler)
    
    # Configure werkzeug logger
    werkzeug_logger = logging.getLogger('werkzeug')
    werkzeug_logger.setLevel(logging.WARNING)
    
    app.logger.info(f"Logging configured - Level: {app.config.get('LOG_LEVEL', 'INFO')}")

def get_logger(name: str):
    """Get a logger instance"""
    return logging.getLogger(name) 