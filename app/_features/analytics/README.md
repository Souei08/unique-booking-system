# Analytics Features

This directory contains analytics functionality for the booking system.

## Features

### Overview Analytics

- Total revenue tracking
- Revenue by product
- Revenue by tour
- Revenue over time (weekly, monthly, yearly)
- Revenue distribution charts

### Promo Code Analytics

- Total promo codes and active codes
- Total promo revenue and discounts given
- Average discount value
- Top promo codes by bookings
- Revenue by promo code
- Discount type distribution (percentage vs fixed amount)
- Promo code usage timeline
- Detailed promo code table with usage statistics

## Database Functions

### get_promo_code_analytics()

Returns comprehensive analytics for all promo codes including:

- Usage statistics (total bookings, slots, revenue)
- First and last usage dates
- Discount information

## Components

### AnalyticsDashboard

Main analytics dashboard with tabbed interface:

- Overview tab: General business analytics
- Promo Codes tab: Detailed promo code analytics

### PromoCodeAnalytics

Dedicated component for promo code analytics with:

- Summary statistics cards
- Interactive charts and graphs
- Detailed data table

## Usage

The analytics are automatically loaded when visiting the analytics page. The data is fetched from Supabase using the `getAnalyticsData()` function which calls the database functions and processes the results.

## Data Sources

- `total_revenue_all_tours` - Total revenue view
- `revenue_per_product` - Revenue breakdown by product
- `revenue_per_tour` - Revenue breakdown by tour
- `revenue_by_timeframe` - Time-based revenue data
- `get_promo_code_analytics()` - Promo code analytics function
- `promo_codes` - Promo codes table
