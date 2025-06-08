# Edge Function Cron Setup Guide

## Automated Product Expiration

The `expire-products` Edge Function has been deployed and is ready for automated execution.

### Setting up Cron Schedule in Supabase Dashboard

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/gmfjjgopnedpvyoekapn
2. Navigate to "Edge Functions" section
3. Find the `expire-products` function
4. Click on "Settings" or "Schedule" 
5. Set up a Cron schedule with this expression for hourly execution:
   ```
   0 * * * *
   ```
   This runs the function at the top of every hour (00:00, 01:00, 02:00, etc.)

### Function Features

- **Safe Expiration**: Excludes products with active bookings to prevent disrupting ongoing calls
- **Multiple Product Types**: Handles both queue-type and fixed-type products
- **Real-time Checks**: Expires products based on current date/time
- **Comprehensive Logging**: Logs all expiration activity for monitoring

### Cost Estimation (Free Tier)

- Hourly execution: 24 times per day = ~720 executions per month
- Supabase Free Tier: 500,000 Edge Function invocations per month
- Usage: ~0.14% of free tier limit

### Monitoring

The function returns detailed JSON responses with:
- Total expired products count
- Breakdown by product type
- Detailed product information
- Error handling and logging

### Manual Testing

You can manually test the function by making a POST request to:
```
https://gmfjjgopnedpvyoekapn.supabase.co/functions/v1/expire-products
```

### Production Deployment

✅ Function deployed successfully  
⏳ Next step: Configure Cron schedule in Dashboard  
⏳ Optional: Set up monitoring alerts for failed executions  