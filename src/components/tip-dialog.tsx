'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { Gift, Heart } from 'lucide-react';

interface TipDialogProps {
  artistId: string;
  artistName: string;
  onClose: () => void;
}

const PRESET_AMOUNTS = [5, 10, 25, 50, 100];

export function TipDialog({ artistId, artistName, onClose }: TipDialogProps) {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handlePresetClick = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    setSelectedAmount(null);
  };

  const getFinalAmount = () => {
    if (selectedAmount) return selectedAmount;
    if (customAmount) return parseFloat(customAmount);
    return 0;
  };

  const handleTip = async () => {
    const amount = getFinalAmount();
    if (amount <= 0) return;

    setIsLoading(true);
    try {
      // TODO: Implement tip processing logic
      console.log(`Tipping ${artistName} (${artistId}) $${amount}`);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Close dialog on success
      onClose();
    } catch (error) {
      console.error('Tip failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Tip {artistName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="text-center">
            <p className="text-muted-foreground">
              Show your appreciation for {artistName}'s work
            </p>
          </div>

          {/* Preset Amounts */}
          <div className="space-y-3">
            <Label>Choose an amount</Label>
            <div className="grid grid-cols-3 gap-2">
              {PRESET_AMOUNTS.map((amount) => (
                <Button
                  key={amount}
                  variant={selectedAmount === amount ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePresetClick(amount)}
                  className="h-12"
                >
                  ${amount}
                </Button>
              ))}
            </div>
          </div>

          {/* Custom Amount */}
          <div className="space-y-2">
            <Label htmlFor="custom-amount">Or enter custom amount</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                $
              </span>
              <Input
                id="custom-amount"
                type="number"
                placeholder="0.00"
                value={customAmount}
                onChange={(e) => handleCustomAmountChange(e.target.value)}
                className="pl-8"
                min="0.01"
                step="0.01"
              />
            </div>
          </div>

          {/* Selected Amount Display */}
          {getFinalAmount() > 0 && (
            <Card className="p-4 bg-muted/50">
              <div className="flex items-center justify-between">
                <span className="font-medium">Total Tip:</span>
                <span className="text-2xl font-bold text-primary">
                  ${getFinalAmount().toFixed(2)}
                </span>
              </div>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleTip}
              disabled={getFinalAmount() <= 0 || isLoading}
              className="flex-1"
            >
              {isLoading ? (
                'Processing...'
              ) : (
                <>
                  <Heart className="h-4 w-4 mr-2" />
                  Send Tip
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
