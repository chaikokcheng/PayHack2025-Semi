const EventEmitter = require('events');
const logger = require('../utils/logger');

class PaymentQueue extends EventEmitter {
  constructor() {
    super();
    this.queue = [];
    this.processing = false;
    this.processingJobId = null;
    this.maxConcurrency = 5;
    this.activeJobs = new Map();
    
    // Queue statistics
    this.stats = {
      totalJobsProcessed: 0,
      totalJobsFailed: 0,
      averageProcessingTime: 0,
      lastProcessedAt: null
    };

    // Auto-start processing
    this.startProcessing();
    
    logger.info('Payment Queue initialized', { 
      maxConcurrency: this.maxConcurrency 
    });
  }

  /**
   * Add job to queue
   */
  addJob(jobType, jobData, priority = 0) {
    const job = {
      id: this.generateJobId(),
      type: jobType,
      data: jobData,
      priority,
      status: 'queued',
      createdAt: new Date(),
      attempts: 0,
      maxAttempts: 3,
      errors: []
    };

    // Insert job based on priority (higher priority first)
    const insertIndex = this.queue.findIndex(queuedJob => queuedJob.priority < priority);
    if (insertIndex === -1) {
      this.queue.push(job);
    } else {
      this.queue.splice(insertIndex, 0, job);
    }

    logger.info('Job added to queue', { 
      jobId: job.id, 
      type: jobType, 
      priority,
      queueLength: this.queue.length 
    });

    this.emit('jobQueued', job);
    
    // Trigger processing if not already running
    if (!this.processing) {
      this.processNext();
    }

    return job.id;
  }

  /**
   * Start queue processing
   */
  startProcessing() {
    if (this.processing) {
      return;
    }

    this.processing = true;
    logger.info('Payment queue processing started');
    
    // Process jobs continuously
    this.processNext();
  }

  /**
   * Stop queue processing
   */
  stopProcessing() {
    this.processing = false;
    logger.info('Payment queue processing stopped');
  }

  /**
   * Process next job in queue
   */
  async processNext() {
    if (!this.processing || this.activeJobs.size >= this.maxConcurrency) {
      return;
    }

    const job = this.queue.shift();
    if (!job) {
      // No jobs to process, wait a bit and check again
      setTimeout(() => {
        if (this.processing && this.queue.length > 0) {
          this.processNext();
        }
      }, 1000);
      return;
    }

    // Process job
    this.processJob(job);

    // Start processing next job if queue has more and we're under concurrency limit
    if (this.queue.length > 0 && this.activeJobs.size < this.maxConcurrency) {
      setImmediate(() => this.processNext());
    }
  }

  /**
   * Process individual job
   */
  async processJob(job) {
    const startTime = Date.now();
    
    try {
      job.status = 'processing';
      job.startedAt = new Date();
      job.attempts += 1;
      
      // Add to active jobs
      this.activeJobs.set(job.id, job);

      logger.info(`Processing job ${job.id}`, { 
        type: job.type, 
        attempt: job.attempts,
        activeJobs: this.activeJobs.size 
      });

      this.emit('jobStarted', job);

      // Process based on job type
      let result;
      switch (job.type) {
        case 'processPayment':
          result = await this.processPaymentJob(job);
          break;
        case 'processOfflinePayment':
          result = await this.processOfflinePaymentJob(job);
          break;
        case 'refundPayment':
          result = await this.processRefundJob(job);
          break;
        case 'cleanupTokens':
          result = await this.processCleanupJob(job);
          break;
        default:
          throw new Error(`Unknown job type: ${job.type}`);
      }

      // Job completed successfully
      job.status = 'completed';
      job.completedAt = new Date();
      job.result = result;
      job.processingTime = Date.now() - startTime;

      // Update statistics
      this.updateStats(job, true);

      logger.info(`Job ${job.id} completed successfully`, { 
        type: job.type,
        processingTime: job.processingTime 
      });

      this.emit('jobCompleted', job);

    } catch (error) {
      // Job failed
      job.errors.push({
        message: error.message,
        stack: error.stack,
        timestamp: new Date()
      });

      logger.logError(error, { 
        action: 'processJob', 
        jobId: job.id, 
        type: job.type,
        attempt: job.attempts 
      });

      // Check if we should retry
      if (job.attempts < job.maxAttempts) {
        job.status = 'retrying';
        
        // Add back to queue with delay
        setTimeout(() => {
          this.queue.unshift(job);
          if (this.processing) {
            this.processNext();
          }
        }, this.getRetryDelay(job.attempts));

        logger.info(`Job ${job.id} will be retried`, { 
          attempt: job.attempts, 
          maxAttempts: job.maxAttempts 
        });
      } else {
        // Max attempts reached, mark as failed
        job.status = 'failed';
        job.completedAt = new Date();
        job.processingTime = Date.now() - startTime;

        this.updateStats(job, false);

        logger.error(`Job ${job.id} failed permanently`, { 
          type: job.type,
          attempts: job.attempts,
          errors: job.errors.length 
        });

        this.emit('jobFailed', job);
      }
    } finally {
      // Remove from active jobs
      this.activeJobs.delete(job.id);

      // Continue processing if queue is active
      if (this.processing && this.queue.length > 0) {
        setImmediate(() => this.processNext());
      }
    }
  }

  /**
   * Process payment job
   */
  async processPaymentJob(job) {
    const { transactionId, context } = job.data;
    
    // Import here to avoid circular dependencies
    const paymentController = require('../controllers/PaymentController');
    
    return await paymentController.processTransactionAsync(transactionId, context);
  }

  /**
   * Process offline payment job
   */
  async processOfflinePaymentJob(job) {
    const { operation, transactionId, context } = job.data;
    
    const paymentController = require('../controllers/PaymentController');
    
    return await paymentController.processOfflinePaymentAsync(operation, transactionId, context);
  }

  /**
   * Process refund job
   */
  async processRefundJob(job) {
    const { transactionId, refundAmount, reason } = job.data;
    
    const paymentController = require('../controllers/PaymentController');
    
    return await paymentController.processRefundAsync(transactionId, refundAmount, reason);
  }

  /**
   * Process cleanup job
   */
  async processCleanupJob(job) {
    const { type } = job.data;
    
    if (type === 'expiredTokens') {
      const TokenHandler = require('../plugins/token-handler');
      const tokenHandler = new TokenHandler();
      return await tokenHandler.cleanupExpiredTokens();
    }
    
    throw new Error(`Unknown cleanup type: ${type}`);
  }

  /**
   * Generate unique job ID
   */
  generateJobId() {
    return `job_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  }

  /**
   * Get retry delay based on attempt number (exponential backoff)
   */
  getRetryDelay(attemptNumber) {
    return Math.min(1000 * Math.pow(2, attemptNumber - 1), 30000); // Max 30 seconds
  }

  /**
   * Update queue statistics
   */
  updateStats(job, success) {
    if (success) {
      this.stats.totalJobsProcessed += 1;
      
      // Update average processing time
      if (this.stats.averageProcessingTime === 0) {
        this.stats.averageProcessingTime = job.processingTime;
      } else {
        this.stats.averageProcessingTime = Math.round(
          (this.stats.averageProcessingTime + job.processingTime) / 2
        );
      }
    } else {
      this.stats.totalJobsFailed += 1;
    }

    this.stats.lastProcessedAt = new Date();
  }

  /**
   * Get queue status
   */
  getStatus() {
    return {
      processing: this.processing,
      queueLength: this.queue.length,
      activeJobs: this.activeJobs.size,
      maxConcurrency: this.maxConcurrency,
      stats: { ...this.stats },
      upcomingJobs: this.queue.slice(0, 5).map(job => ({
        id: job.id,
        type: job.type,
        priority: job.priority,
        attempts: job.attempts,
        createdAt: job.createdAt
      }))
    };
  }

  /**
   * Get job by ID
   */
  getJob(jobId) {
    // Check active jobs first
    if (this.activeJobs.has(jobId)) {
      return this.activeJobs.get(jobId);
    }

    // Check queued jobs
    return this.queue.find(job => job.id === jobId);
  }

  /**
   * Cancel job
   */
  cancelJob(jobId) {
    const queueIndex = this.queue.findIndex(job => job.id === jobId);
    if (queueIndex !== -1) {
      const job = this.queue.splice(queueIndex, 1)[0];
      job.status = 'cancelled';
      job.cancelledAt = new Date();
      
      logger.info(`Job ${jobId} cancelled`);
      this.emit('jobCancelled', job);
      
      return true;
    }

    // Cannot cancel active jobs
    return false;
  }

  /**
   * Clear all queued jobs
   */
  clearQueue() {
    const clearedCount = this.queue.length;
    this.queue = [];
    
    logger.info(`Cleared ${clearedCount} jobs from queue`);
    
    return clearedCount;
  }

  /**
   * Set max concurrency
   */
  setMaxConcurrency(maxConcurrency) {
    this.maxConcurrency = maxConcurrency;
    logger.info(`Max concurrency set to ${maxConcurrency}`);
    
    // Start processing more jobs if we increased concurrency
    if (this.processing && this.queue.length > 0) {
      this.processNext();
    }
  }
}

// Export singleton instance
module.exports = new PaymentQueue(); 