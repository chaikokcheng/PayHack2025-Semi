import asyncio
import json
import logging
import random
import time
from collections import defaultdict, deque
from dataclasses import dataclass, asdict
from datetime import datetime, timedelta
from enum import Enum
from typing import Dict, List, Optional, Tuple, Any
import threading
import queue

import gradio as gr
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
import plotly.graph_objects as go
import plotly.express as px


# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class PaymentStatus(Enum):
    SUCCESS = "success"
    FAILED = "failed"
    PENDING = "pending"
    DECLINED = "declined"


class PSPProvider(Enum):
    STRIPE = "stripe"
    PAYPAL = "paypal"
    RAZORPAY = "razorpay"
    SQUARE = "square"
    ADYEN = "adyen"


@dataclass
class Transaction:
    id: str
    amount: float
    currency: str
    country: str
    payment_method: str
    psp: str
    status: PaymentStatus
    timestamp: datetime
    processing_time_ms: int
    cost: float
    fraud_score: float
    merchant_category: str


@dataclass
class PSPMetrics:
    success_rate: float
    avg_cost: float
    avg_latency_ms: int
    fraud_rate: float
    total_volume: float
    total_transactions: int


class FraudDetector:
    """Real-time fraud detection using ML"""
    
    def __init__(self):
        self.model = RandomForestClassifier(n_estimators=50, random_state=42)
        self.label_encoders = {}
        self.is_trained = False
        self._generate_training_data()
    
    def _generate_training_data(self):
        """Generate synthetic training data for fraud detection"""
        np.random.seed(42)
        n_samples = 1000
        
        # Generate features
        amounts = np.random.lognormal(3, 1.5, n_samples)
        countries = np.random.choice(['US', 'UK', 'IN', 'CA', 'DE', 'FR', 'AU'], n_samples)
        payment_methods = np.random.choice(['card', 'wallet', 'bank', 'crypto'], n_samples)
        merchant_cats = np.random.choice(['retail', 'digital', 'food', 'travel', 'finance'], n_samples)
        
        # Generate fraud labels (higher amounts and certain countries more likely to be fraud)
        fraud_prob = (amounts > 1000) * 0.3 + (np.isin(countries, ['IN', 'FR'])) * 0.2
        fraud_labels = np.random.binomial(1, fraud_prob)
        
        # Create DataFrame
        training_data = pd.DataFrame({
            'amount': amounts,
            'country': countries,
            'payment_method': payment_methods,
            'merchant_category': merchant_cats,
            'is_fraud': fraud_labels
        })
        
        # Encode categorical variables
        categorical_cols = ['country', 'payment_method', 'merchant_category']
        X = training_data[['amount']].copy()
        
        for col in categorical_cols:
            le = LabelEncoder()
            X[col] = le.fit_transform(training_data[col])
            self.label_encoders[col] = le
        
        y = training_data['is_fraud']
        
        # Train model
        self.model.fit(X, y)
        self.is_trained = True
        logger.info("Fraud detection model trained successfully")
    
    def predict_fraud_score(self, transaction: Dict) -> float:
        """Predict fraud score for a transaction"""
        if not self.is_trained:
            return random.uniform(0, 0.1)
        
        try:
            # Prepare features
            features = pd.DataFrame({
                'amount': [transaction['amount']],
                'country': [transaction['country']],
                'payment_method': [transaction['payment_method']],
                'merchant_category': [transaction['merchant_category']]
            })
            
            # Encode categorical variables
            for col in ['country', 'payment_method', 'merchant_category']:
                if col in self.label_encoders:
                    try:
                        features[col] = self.label_encoders[col].transform(features[col])
                    except ValueError:
                        # Handle unseen categories
                        features[col] = 0
                else:
                    features[col] = 0
            
            # Predict fraud probability
            fraud_prob = self.model.predict_proba(features)[0][1]
            return min(fraud_prob, 1.0)
        
        except Exception as e:
            logger.error(f"Fraud prediction error: {e}")
            return random.uniform(0, 0.1)


class PaymentRouter:
    """Intelligent payment routing engine with ML-based optimization"""
    
    def __init__(self):
        self.psp_configs = {
            PSPProvider.STRIPE: {'base_cost': 0.029, 'fixed_fee': 0.30, 'success_rate': 0.94},
            PSPProvider.PAYPAL: {'base_cost': 0.034, 'fixed_fee': 0.49, 'success_rate': 0.91},
            PSPProvider.RAZORPAY: {'base_cost': 0.024, 'fixed_fee': 0.25, 'success_rate': 0.89},
            PSPProvider.SQUARE: {'base_cost': 0.026, 'fixed_fee': 0.10, 'success_rate': 0.92},
            PSPProvider.ADYEN: {'base_cost': 0.028, 'fixed_fee': 0.12, 'success_rate': 0.95}
        }
        self.psp_metrics = {psp: PSPMetrics(0.9, 0.03, 150, 0.02, 0.0, 0) 
                           for psp in PSPProvider}
        self.routing_history = deque(maxlen=1000)
        self.fraud_detector = FraudDetector()
    
    def calculate_routing_score(self, psp: PSPProvider, transaction: Dict) -> float:
        """Calculate routing score based on success rate, cost, and other factors"""
        config = self.psp_configs[psp]
        metrics = self.psp_metrics[psp]
        
        # Base score from success rate
        success_score = metrics.success_rate * 0.4
        
        # Cost efficiency score
        total_cost = transaction['amount'] * config['base_cost'] + config['fixed_fee']
        cost_score = max(0, (1 - total_cost / transaction['amount'])) * 0.3
        
        # Latency score (lower latency = higher score)
        latency_score = max(0, (300 - metrics.avg_latency_ms) / 300) * 0.2
        
        # Country/method specific adjustments
        country_bonus = 0.1 if transaction['country'] in ['US', 'UK', 'CA'] else 0
        method_bonus = 0.05 if transaction['payment_method'] == 'card' else 0
        
        total_score = success_score + cost_score + latency_score + country_bonus + method_bonus
        
        # Apply random variation for A/B testing
        total_score += random.uniform(-0.1, 0.1)
        
        return min(total_score, 1.0)
    
    def route_payment(self, transaction: Dict) -> str:
        """Route payment to optimal PSP"""
        scores = {}
        
        for psp in PSPProvider:
            scores[psp] = self.calculate_routing_score(psp, transaction)
        
        # Select PSP with highest score
        selected_psp = max(scores, key=scores.get)
        
        # Log routing decision
        self.routing_history.append({
            'transaction_id': transaction.get('id', 'unknown'),
            'selected_psp': selected_psp.value,
            'scores': {psp.value: score for psp, score in scores.items()},
            'timestamp': datetime.now()
        })
        
        return selected_psp.value
    
    def update_metrics(self, transaction: Transaction):
        """Update PSP metrics based on transaction outcome"""
        psp = PSPProvider(transaction.psp)
        metrics = self.psp_metrics[psp]
        
        # Update metrics using exponential moving average
        alpha = 0.1  # Learning rate
        
        if transaction.status == PaymentStatus.SUCCESS:
            metrics.success_rate = (1 - alpha) * metrics.success_rate + alpha * 1.0
        else:
            metrics.success_rate = (1 - alpha) * metrics.success_rate + alpha * 0.0
        
        metrics.avg_cost = (1 - alpha) * metrics.avg_cost + alpha * transaction.cost
        metrics.avg_latency_ms = int((1 - alpha) * metrics.avg_latency_ms + alpha * transaction.processing_time_ms)
        metrics.fraud_rate = (1 - alpha) * metrics.fraud_rate + alpha * (1 if transaction.fraud_score > 0.5 else 0)
        metrics.total_volume += transaction.amount
        metrics.total_transactions += 1


class TransactionSimulator:
    """Simulates realistic payment transactions"""
    
    def __init__(self, payment_router: PaymentRouter):
        self.router = payment_router
        self.transaction_id = 0
        self.countries = ['US', 'UK', 'IN', 'CA', 'DE', 'FR', 'AU', 'SG', 'JP', 'BR']
        self.payment_methods = ['card', 'wallet', 'bank', 'crypto']
        self.currencies = ['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD', 'SGD', 'JPY', 'BRL']
        self.merchant_categories = ['retail', 'digital', 'food', 'travel', 'finance', 'gaming']
    
    def generate_transaction(self) -> Dict:
        """Generate a realistic transaction"""
        self.transaction_id += 1
        
        # Generate transaction parameters
        amount = round(random.lognormvariate(3, 1.5), 2)
        country = random.choice(self.countries)
        payment_method = random.choice(self.payment_methods)
        currency = random.choice(self.currencies)
        merchant_category = random.choice(self.merchant_categories)
        
        return {
            'id': f"txn_{self.transaction_id:06d}",
            'amount': amount,
            'currency': currency,
            'country': country,
            'payment_method': payment_method,
            'merchant_category': merchant_category,
            'timestamp': datetime.now()
        }
    
    def process_transaction(self, txn_data: Dict) -> Transaction:
        """Process transaction through the payment router"""
        # Route to optimal PSP
        selected_psp = self.router.route_payment(txn_data)
        
        # Predict fraud score
        fraud_score = self.router.fraud_detector.predict_fraud_score(txn_data)
        
        # Simulate processing
        processing_time = random.randint(50, 500)
        
        # Calculate cost
        psp_config = self.router.psp_configs[PSPProvider(selected_psp)]
        cost = txn_data['amount'] * psp_config['base_cost'] + psp_config['fixed_fee']
        
        # Determine status based on various factors
        base_success_rate = psp_config['success_rate']
        fraud_penalty = fraud_score * 0.3
        amount_penalty = min(txn_data['amount'] / 10000, 0.1)  # Higher amounts slightly more likely to fail
        
        success_probability = base_success_rate - fraud_penalty - amount_penalty
        
        if fraud_score > 0.8:
            status = PaymentStatus.DECLINED
        elif random.random() < success_probability:
            status = PaymentStatus.SUCCESS
        else:
            status = PaymentStatus.FAILED
        
        # Create transaction object
        transaction = Transaction(
            id=txn_data['id'],
            amount=txn_data['amount'],
            currency=txn_data['currency'],
            country=txn_data['country'],
            payment_method=txn_data['payment_method'],
            psp=selected_psp,
            status=status,
            timestamp=txn_data['timestamp'],
            processing_time_ms=processing_time,
            cost=cost,
            fraud_score=fraud_score,
            merchant_category=txn_data['merchant_category']
        )
        
        # Update router metrics
        self.router.update_metrics(transaction)
        
        return transaction


class MCPServer:
    """Model Context Protocol server for AI integration"""
    
    def __init__(self, analytics_engine):
        self.analytics = analytics_engine
        self.tools = {
            'get_payment_analytics': self.get_payment_analytics,
            'get_psp_comparison': self.get_psp_comparison,
            'get_fraud_alerts': self.get_fraud_alerts,
            'get_routing_insights': self.get_routing_insights
        }
    
    def get_payment_analytics(self, params: Dict = None) -> Dict:
        """Get comprehensive payment analytics"""
        return {
            'total_transactions': len(self.analytics.transactions),
            'total_volume': sum(t.amount for t in self.analytics.transactions),
            'success_rate': self.analytics.calculate_overall_success_rate(),
            'avg_processing_time': self.analytics.calculate_avg_processing_time(),
            'fraud_rate': self.analytics.calculate_fraud_rate(),
            'top_countries': self.analytics.get_top_countries(),
            'psp_distribution': self.analytics.get_psp_distribution()
        }
    
    def get_psp_comparison(self, params: Dict = None) -> Dict:
        """Compare PSP performance"""
        comparison = {}
        for psp in PSPProvider:
            psp_transactions = [t for t in self.analytics.transactions if t.psp == psp.value]
            if psp_transactions:
                comparison[psp.value] = {
                    'success_rate': len([t for t in psp_transactions if t.status == PaymentStatus.SUCCESS]) / len(psp_transactions),
                    'avg_cost': sum(t.cost for t in psp_transactions) / len(psp_transactions),
                    'avg_latency': sum(t.processing_time_ms for t in psp_transactions) / len(psp_transactions),
                    'volume': sum(t.amount for t in psp_transactions),
                    'transaction_count': len(psp_transactions)
                }
        return comparison
    
    def get_fraud_alerts(self, params: Dict = None) -> Dict:
        """Get high-risk transactions and fraud alerts"""
        threshold = params.get('threshold', 0.7) if params else 0.7
        high_risk = [
            {
                'id': t.id,
                'amount': t.amount,
                'country': t.country,
                'fraud_score': t.fraud_score,
                'status': t.status.value
            }
            for t in self.analytics.transactions
            if t.fraud_score > threshold
        ]
        return {
            'high_risk_transactions': high_risk[-10:],  # Last 10
            'fraud_rate': self.analytics.calculate_fraud_rate(),
            'total_flagged': len(high_risk)
        }
    
    def get_routing_insights(self, params: Dict = None) -> Dict:
        """Get insights about routing decisions"""
        routing_data = list(self.analytics.payment_router.routing_history)
        if not routing_data:
            return {'message': 'No routing data available'}
        
        psp_counts = defaultdict(int)
        for decision in routing_data:
            psp_counts[decision['selected_psp']] += 1
        
        return {
            'routing_distribution': dict(psp_counts),
            'total_routing_decisions': len(routing_data),
            'recent_decisions': routing_data[-5:]  # Last 5 decisions
        }


class AnalyticsEngine:
    """Real-time analytics engine"""
    
    def __init__(self, payment_router: PaymentRouter):
        self.transactions: List[Transaction] = []
        self.payment_router = payment_router
        self.mcp_server = MCPServer(self)
    
    def add_transaction(self, transaction: Transaction):
        """Add transaction to analytics"""
        self.transactions.append(transaction)
        
        # Keep only last 1000 transactions for performance
        if len(self.transactions) > 1000:
            self.transactions = self.transactions[-1000:]
    
    def calculate_overall_success_rate(self) -> float:
        """Calculate overall success rate"""
        if not self.transactions:
            return 0.0
        successful = len([t for t in self.transactions if t.status == PaymentStatus.SUCCESS])
        return successful / len(self.transactions)
    
    def calculate_avg_processing_time(self) -> float:
        """Calculate average processing time"""
        if not self.transactions:
            return 0.0
        return sum(t.processing_time_ms for t in self.transactions) / len(self.transactions)
    
    def calculate_fraud_rate(self) -> float:
        """Calculate fraud rate"""
        if not self.transactions:
            return 0.0
        high_risk = len([t for t in self.transactions if t.fraud_score > 0.5])
        return high_risk / len(self.transactions)
    
    def get_top_countries(self, limit: int = 5) -> List[Tuple[str, int]]:
        """Get top countries by transaction volume"""
        country_counts = defaultdict(int)
        for t in self.transactions:
            country_counts[t.country] += 1
        return sorted(country_counts.items(), key=lambda x: x[1], reverse=True)[:limit]
    
    def get_psp_distribution(self) -> Dict[str, int]:
        """Get PSP distribution"""
        psp_counts = defaultdict(int)
        for t in self.transactions:
            psp_counts[t.psp] += 1
        return dict(psp_counts)
    
    def get_recent_transactions(self, limit: int = 10) -> List[Dict]:
        """Get recent transactions for display"""
        recent = self.transactions[-limit:] if self.transactions else []
        return [
            {
                'ID': t.id,
                'Amount': f"${t.amount:.2f}",
                'PSP': t.psp.upper(),
                'Status': t.status.value.upper(),
                'Country': t.country,
                'Fraud Score': f"{t.fraud_score:.3f}",
                'Time': t.timestamp.strftime('%H:%M:%S')
            }
            for t in recent
        ]
    
    def create_success_rate_chart(self):
        """Create success rate chart by PSP"""
        if not self.transactions:
            return go.Figure()
        
        psp_stats = defaultdict(lambda: {'success': 0, 'total': 0})
        
        for t in self.transactions:
            psp_stats[t.psp]['total'] += 1
            if t.status == PaymentStatus.SUCCESS:
                psp_stats[t.psp]['success'] += 1
        
        psps = list(psp_stats.keys())
        success_rates = [psp_stats[psp]['success'] / psp_stats[psp]['total'] * 100 
                        for psp in psps]
        
        fig = go.Figure(data=[
            go.Bar(x=psps, y=success_rates, marker_color='lightblue')
        ])
        fig.update_layout(
            title='Success Rate by PSP',
            xaxis_title='Payment Service Provider',
            yaxis_title='Success Rate (%)',
            height=400
        )
        return fig
    
    def create_volume_chart(self):
        """Create transaction volume over time"""
        if not self.transactions:
            return go.Figure()
        
        # Group by hour
        hourly_volume = defaultdict(float)
        for t in self.transactions:
            hour_key = t.timestamp.strftime('%H:00')
            hourly_volume[hour_key] += t.amount
        
        hours = sorted(hourly_volume.keys())
        volumes = [hourly_volume[hour] for hour in hours]
        
        fig = go.Figure(data=[
            go.Scatter(x=hours, y=volumes, mode='lines+markers', line=dict(color='green'))
        ])
        fig.update_layout(
            title='Transaction Volume Over Time',
            xaxis_title='Hour',
            yaxis_title='Volume ($)',
            height=400
        )
        return fig
    
    def create_fraud_distribution_chart(self):
        """Create fraud score distribution"""
        if not self.transactions:
            return go.Figure()
        
        fraud_scores = [t.fraud_score for t in self.transactions]
        
        fig = go.Figure(data=[
            go.Histogram(x=fraud_scores, nbinsx=20, marker_color='red', opacity=0.7)
        ])
        fig.update_layout(
            title='Fraud Score Distribution',
            xaxis_title='Fraud Score',
            yaxis_title='Count',
            height=400
        )
        return fig


class GradioApp:
    """Gradio dashboard for real-time analytics"""
    
    def __init__(self):
        self.payment_router = PaymentRouter()
        self.transaction_simulator = TransactionSimulator(self.payment_router)
        self.analytics = AnalyticsEngine(self.payment_router)
        self.is_running = False
        self.simulation_thread = None
        self.transaction_queue = queue.Queue()
    
    def start_simulation(self):
        """Start transaction simulation"""
        if self.is_running:
            return "Simulation already running!"
        
        self.is_running = True
        self.simulation_thread = threading.Thread(target=self._simulation_loop, daemon=True)
        self.simulation_thread.start()
        return "Simulation started! Generating transactions..."
    
    def stop_simulation(self):
        """Stop transaction simulation"""
        self.is_running = False
        return "Simulation stopped."
    
    def _simulation_loop(self):
        """Background simulation loop"""
        while self.is_running:
            try:
                # Generate and process transaction
                txn_data = self.transaction_simulator.generate_transaction()
                transaction = self.transaction_simulator.process_transaction(txn_data)
                self.analytics.add_transaction(transaction)
                
                # Add some randomness to timing
                time.sleep(random.uniform(0.1, 1.0))
                
            except Exception as e:
                logger.error(f"Simulation error: {e}")
                time.sleep(1)
    
    def get_dashboard_data(self):
        """Get current dashboard data"""
        if not self.analytics.transactions:
            return {
                'total_transactions': 0,
                'success_rate': 0,
                'total_volume': 0,
                'fraud_rate': 0,
                'avg_processing_time': 0
            }
        
        return {
            'total_transactions': len(self.analytics.transactions),
            'success_rate': self.analytics.calculate_overall_success_rate() * 100,
            'total_volume': sum(t.amount for t in self.analytics.transactions),
            'fraud_rate': self.analytics.calculate_fraud_rate() * 100,
            'avg_processing_time': self.analytics.calculate_avg_processing_time()
        }
    
    def query_mcp(self, tool_name: str, params: str = "{}"):
        """Query MCP server"""
        try:
            params_dict = json.loads(params) if params.strip() else {}
            if tool_name in self.analytics.mcp_server.tools:
                result = self.analytics.mcp_server.tools[tool_name](params_dict)
                return json.dumps(result, indent=2, default=str)
            else:
                return f"Unknown tool: {tool_name}. Available tools: {list(self.analytics.mcp_server.tools.keys())}"
        except Exception as e:
            return f"Error: {str(e)}"
    
    def create_interface(self):
        """Create Gradio interface"""
        with gr.Blocks(title="Intelligent Payment Router - Real-time Analytics", theme=gr.themes.Soft()) as interface:
            gr.Markdown("# 🚀 Intelligent Payment Router with Real-time Analytics")
            gr.Markdown("Production-ready MCP Gradio Server for payment optimization and fraud detection")
            
            with gr.Tabs():
                # Dashboard Tab
                with gr.TabItem("📊 Live Dashboard"):
                    with gr.Row():
                        start_btn = gr.Button("▶️ Start Simulation", variant="primary")
                        stop_btn = gr.Button("⏹️ Stop Simulation", variant="secondary")
                    
                    status_output = gr.Textbox(label="Status", interactive=False)
                    
                    with gr.Row():
                        with gr.Column():
                            total_txns = gr.Number(label="Total Transactions", interactive=False)
                            success_rate = gr.Number(label="Success Rate (%)", interactive=False)
                        with gr.Column():
                            total_volume = gr.Number(label="Total Volume ($)", interactive=False)
                            fraud_rate = gr.Number(label="Fraud Rate (%)", interactive=False)
                        with gr.Column():
                            avg_time = gr.Number(label="Avg Processing Time (ms)", interactive=False)
                    
                    with gr.Row():
                        with gr.Column():
                            success_chart = gr.Plot(label="Success Rate by PSP")
                        with gr.Column():
                            volume_chart = gr.Plot(label="Transaction Volume")
                    
                    fraud_chart = gr.Plot(label="Fraud Score Distribution")
                    
                    recent_transactions = gr.Dataframe(
                        label="Recent Transactions",
                        headers=['ID', 'Amount', 'PSP', 'Status', 'Country', 'Fraud Score', 'Time']
                    )
                
                # MCP Interface Tab
                with gr.TabItem("🤖 MCP Interface"):
                    gr.Markdown("### Model Context Protocol - AI Assistant Integration")
                    
                    with gr.Row():
                        tool_dropdown = gr.Dropdown(
                            choices=['get_payment_analytics', 'get_psp_comparison', 'get_fraud_alerts', 'get_routing_insights'],
                            label="Select MCP Tool",
                            value='get_payment_analytics'
                        )
                        params_input = gr.Textbox(
                            label="Parameters (JSON)",
                            placeholder='{"threshold": 0.7}',
                            value="{}"
                        )
                    
                    query_btn = gr.Button("🔍 Query MCP Server", variant="primary")
                    mcp_output = gr.Code(label="MCP Response", language="json")
                
                # Analytics Tab
                with gr.TabItem("📈 Advanced Analytics"):
                    gr.Markdown("### Payment Router Intelligence")
                    
                    with gr.Row():
                        with gr.Column():
                            gr.Markdown("#### PSP Performance Metrics")
                            psp_metrics = gr.JSON(label="Current PSP Metrics", value={})
                        
                        with gr.Column():
                            gr.Markdown("#### Routing Decisions")
                            routing_history = gr.JSON(label="Recent Routing Decisions", value={})
                    
                    refresh_analytics_btn = gr.Button("🔄 Refresh Analytics")
            
            # Event handlers
            start_btn.click(
                fn=self.start_simulation,
                outputs=status_output
            )
            
            stop_btn.click(
                fn=self.stop_simulation,
                outputs=status_output
            )
            
            query_btn.click(
                fn=self.query_mcp,
                inputs=[tool_dropdown, params_input],
                outputs=mcp_output
            )
            
            def update_dashboard():
                data = self.get_dashboard_data()
                charts = [
                    self.analytics.create_success_rate_chart(),
                    self.analytics.create_volume_chart(),
                    self.analytics.create_fraud_distribution_chart()
                ]
                transactions_df = self.analytics.get_recent_transactions()
                
                return [
                    data['total_transactions'],
                    round(data['success_rate'], 2),
                    round(data['total_volume'], 2),
                    round(data['fraud_rate'], 2),
                    round(data['avg_processing_time'], 1),
                    charts[0],
                    charts[1],
                    charts[2],
                    transactions_df
                ]
            
            def update_analytics():
                psp_data = {}
                for psp, metrics in self.payment_router.psp_metrics.items():
                    psp_data[psp.value] = asdict(metrics)
                
                routing_data = list(self.payment_router.routing_history)[-5:]  # Last 5
                
                return psp_data, routing_data
            
            refresh_analytics_btn.click(
                fn=update_analytics,
                outputs=[psp_metrics, routing_history]
            )
            
            # Auto-refresh dashboard every 2 seconds
            timer = gr.Timer(value=2)
            timer.tick(
                fn=update_dashboard,
                outputs=[
                    total_txns, success_rate, total_volume, fraud_rate, avg_time,
                    success_chart, volume_chart, fraud_chart, recent_transactions
                ]
            )
        
        return interface


def main():
    """Main application entry point"""
    print("🚀 Starting Intelligent Payment Router - MCP Gradio Server")
    print("=" * 60)
    
    try:
        # Initialize application
        app = GradioApp()
        interface = app.create_interface()
        
        print("✅ Application initialized successfully!")
        print("📊 Features enabled:")
        print("   • Intelligent payment routing with ML")
        print("   • Real-time fraud detection")
        print("   • Live analytics dashboard")
        print("   • MCP server for AI integration")
        print("   • Multi-PSP transaction simulation")
        print()
        print("🌐 Access the dashboard at: http://localhost:7860")
        print("🤖 MCP tools available for AI assistants:")
        print("   • get_payment_analytics - Comprehensive payment metrics")
        print("   • get_psp_comparison - PSP performance comparison")
        print("   • get_fraud_alerts - High-risk transaction alerts")
        print("   • get_routing_insights - Routing decision analysis")
        print()
        print("🔧 Built for Gradio MCP Hackathon - Production-ready fintech solution!")
        print("=" * 60)
        
        # Launch the application
        interface.launch(
            server_name="0.0.0.0",
            server_port=7860,
            share=False,
            show_error=True,
            quiet=False
        )
        
    except Exception as e:
        logger.error(f"Failed to start application: {e}")
        print(f"❌ Error: {e}")
        return 1
    
    return 0


if __name__ == "__main__":
    exit(main())