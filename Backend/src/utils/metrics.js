/**
 * Metrics Registry & Telemetry Collector (Stage 7 - Observability)
 * Tracks HTTP Requests/sec, Latency, Error Rates, DB Latency, Payment Failures, Queue Depth, Cache Hit Rate
 */

class MetricsRegistry {
  constructor() {
    this.requestsTotal = 0;
    this.requestsByRoute = {};
    this.errorsTotal = 0;
    this.errorsByStatus = {};
    this.latencies = [];
    this.dbLatencies = [];
    this.paymentFailuresTotal = 0;
    this.queueDepth = 0;
    this.cacheHits = 0;
    this.cacheMisses = 0;
    this.startTime = Date.now();
  }

  recordRequest(method, route, statusCode, latencyMs) {
    this.requestsTotal += 1;
    const routeKey = `${method} ${route}`;
    this.requestsByRoute[routeKey] = (this.requestsByRoute[routeKey] || 0) + 1;

    // Track latencies (keep last 1000 samples for percentile calculations)
    this.latencies.push(latencyMs);
    if (this.latencies.length > 1000) this.latencies.shift();

    if (statusCode >= 400) {
      this.errorsTotal += 1;
      this.errorsByStatus[statusCode] = (this.errorsByStatus[statusCode] || 0) + 1;
    }
  }

  recordDbQuery(latencyMs) {
    this.dbLatencies.push(latencyMs);
    if (this.dbLatencies.length > 1000) this.dbLatencies.shift();
  }

  recordPaymentFailure() {
    this.paymentFailuresTotal += 1;
  }

  setQueueDepth(depth) {
    this.queueDepth = depth;
  }

  recordCacheHit() {
    this.cacheHits += 1;
  }

  recordCacheMiss() {
    this.cacheMisses += 1;
  }

  getAverageLatency() {
    if (this.latencies.length === 0) return 0;
    const sum = this.latencies.reduce((acc, curr) => acc + curr, 0);
    return (sum / this.latencies.length).toFixed(2);
  }

  getAverageDbLatency() {
    if (this.dbLatencies.length === 0) return 0;
    const sum = this.dbLatencies.reduce((acc, curr) => acc + curr, 0);
    return (sum / this.dbLatencies.length).toFixed(2);
  }

  getCacheHitRate() {
    const total = this.cacheHits + this.cacheMisses;
    if (total === 0) return "100.00%";
    return `${((this.cacheHits / total) * 100).toFixed(2)}%`;
  }

  getMetricsSummary() {
    const uptimeSeconds = Math.floor((Date.now() - this.startTime) / 1000) || 1;
    const rps = (this.requestsTotal / uptimeSeconds).toFixed(2);
    const errorRate = this.requestsTotal > 0 
      ? `${((this.errorsTotal / this.requestsTotal) * 100).toFixed(2)}%` 
      : "0.00%";

    return {
      requestsTotal: this.requestsTotal,
      requestsPerSecond: parseFloat(rps),
      avgLatencyMs: parseFloat(this.getAverageLatency()),
      errorRate,
      errorsTotal: this.errorsTotal,
      avgDbLatencyMs: parseFloat(this.getAverageDbLatency()),
      paymentFailuresTotal: this.paymentFailuresTotal,
      queueDepth: this.queueDepth,
      cacheHitRate: this.getCacheHitRate(),
      cacheHits: this.cacheHits,
      cacheMisses: this.cacheMisses,
      uptimeSeconds,
    };
  }

  /**
   * Returns Prometheus Exposition Format Text
   */
  getPrometheusFormat() {
    const summary = this.getMetricsSummary();
    const lines = [
      `# HELP http_requests_total Total number of HTTP requests processed`,
      `# TYPE http_requests_total counter`,
      `http_requests_total ${summary.requestsTotal}`,
      ``,
      `# HELP http_requests_per_second Current requests per second rate`,
      `# TYPE http_requests_per_second gauge`,
      `http_requests_per_second ${summary.requestsPerSecond}`,
      ``,
      `# HELP http_request_duration_seconds_avg Average HTTP request latency in seconds`,
      `# TYPE http_request_duration_seconds_avg gauge`,
      `http_request_duration_seconds_avg ${(summary.avgLatencyMs / 1000).toFixed(4)}`,
      ``,
      `# HELP http_errors_total Total number of HTTP 4xx/5xx errors`,
      `# TYPE http_errors_total counter`,
      `http_errors_total ${summary.errorsTotal}`,
      ``,
      `# HELP database_latency_seconds_avg Average database query duration in seconds`,
      `# TYPE database_latency_seconds_avg gauge`,
      `database_latency_seconds_avg ${(summary.avgDbLatencyMs / 1000).toFixed(4)}`,
      ``,
      `# HELP payment_failures_total Total failed payment attempts`,
      `# TYPE payment_failures_total counter`,
      `payment_failures_total ${summary.paymentFailuresTotal}`,
      ``,
      `# HELP queue_depth_gauge Current background task queue depth`,
      `# TYPE queue_depth_gauge gauge`,
      `queue_depth_gauge ${summary.queueDepth}`,
      ``,
      `# HELP cache_hits_total Total Redis cache hit count`,
      `# TYPE cache_hits_total counter`,
      `cache_hits_total ${summary.cacheHits}`,
      ``,
      `# HELP cache_misses_total Total Redis cache miss count`,
      `# TYPE cache_misses_total counter`,
      `cache_misses_total ${summary.cacheMisses}`,
    ];

    return lines.join("\n");
  }
}

const metricsRegistry = new MetricsRegistry();
module.exports = metricsRegistry;
