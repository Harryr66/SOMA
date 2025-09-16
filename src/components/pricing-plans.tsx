'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';

interface PricingPlan {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  isPopular?: boolean;
  currency: string;
}

const pricingPlans: PricingPlan[] = [
  {
    name: 'Monthly Membership',
    price: '24.99',
    period: 'per month',
    description: 'Perfect for artists getting started',
    currency: 'AUD',
    features: [
      'Upload unlimited artwork',
      'Create and manage communities',
      'Access to all marketplace features',
      'Priority customer support',
      'Analytics dashboard',
      'Story uploads (24h duration)'
    ]
  },
  {
    name: 'Annual Plan',
    price: '199',
    period: 'per year',
    description: 'Best value for professional artists',
    currency: 'AUD',
    isPopular: true,
    features: [
      'Everything in Monthly Membership',
      'Save over $100 per year',
      'Exclusive artist tools',
      'Advanced analytics',
      'Priority listing in marketplace',
      'Custom community branding',
      'Video uploads (up to 30 minutes)',
      'Early access to new features'
    ]
  }
];

export function PricingPlans() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-4">Choose Your Plan</h2>
        <p className="text-muted-foreground text-lg">
          Unlock the full potential of SOMA with our flexible pricing options
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {pricingPlans.map((plan) => (
          <Card 
            key={plan.name} 
            className={`relative ${plan.isPopular ? 'border-primary shadow-lg scale-105' : ''}`}
          >
            {plan.isPopular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground px-4 py-1">
                  Most Popular
                </Badge>
              </div>
            )}
            
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              <CardDescription className="text-base">{plan.description}</CardDescription>
              
              <div className="mt-4">
                <div className="flex items-baseline justify-center">
                  <span className="text-4xl font-bold">${plan.price}</span>
                  <span className="text-muted-foreground ml-2">{plan.period}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Billed in {plan.currency}
                </p>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <ul className="space-y-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button 
                className={`w-full ${plan.isPopular ? 'bg-primary hover:bg-primary/90' : ''}`}
                variant={plan.isPopular ? 'default' : 'outline'}
              >
                {plan.name === 'Annual Plan' ? 'Get Annual Plan' : 'Get Monthly Plan'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center mt-8">
        <p className="text-sm text-muted-foreground">
          All plans include a 14-day free trial. Cancel anytime.
        </p>
      </div>
    </div>
  );
}
