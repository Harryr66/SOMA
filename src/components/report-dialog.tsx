
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/providers/auth-provider';
import type { Report } from '@/lib/types';

const reportReasons = [
  'Hate Speech or Symbols',
  'Harassment or Bullying',
  'Spam or Misleading',
  'Nudity or Sexual Content',
  'Violence or Dangerous Content',
  'Intellectual Property Violation',
  'Something Else',
] as const;

const reportFormSchema = z.object({
  reason: z.enum(reportReasons, { required_error: 'You must select a reason for the report.' }),
  details: z.string().optional(),
});

interface ReportDialogProps {
  contentId: string;
  contentType: Report['contentType'];
  contentTitle: string;
  offenderId: string;
  offenderHandle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export function ReportDialog({
  contentId,
  contentType,
  contentTitle,
  offenderId,
  offenderHandle,
  open,
  onOpenChange,
  children
}: ReportDialogProps) {
  const { toast } = useToast();
  const { user } = useAuth();

  const form = useForm<z.infer<typeof reportFormSchema>>({
    resolver: zodResolver(reportFormSchema),
  });

  function onSubmit(data: z.infer<typeof reportFormSchema>) {
    if (!user) {
      toast({ variant: 'destructive', title: 'You must be logged in to report content.' });
      return;
    }
    const reporterHandle = JSON.parse(localStorage.getItem(`userProfile-${user.uid}`) || '{}').handle || user.email?.split('@')[0] || 'anonymous';

    const newReport: Report = {
      id: `report-${Date.now()}`,
      contentId,
      contentType,
      content: contentTitle,
      reportedBy: reporterHandle,
      offenderId,
      offenderHandle,
      reason: data.reason,
      details: data.details,
      timestamp: new Date().toISOString(),
    };

    const reports = JSON.parse(localStorage.getItem('soma-reports') || '[]');
    reports.push(newReport);
    localStorage.setItem('soma-reports', JSON.stringify(reports));

    toast({
      title: 'Report Submitted',
      description: 'Thank you for your feedback. Our moderation team will review it shortly.',
    });
    onOpenChange(false);
    form.reset();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report Content</DialogTitle>
          <DialogDescription>
            Help us understand the problem. What's going on with this {contentType.toLowerCase()}?
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Reason</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      {reportReasons.map(reason => (
                         <FormItem key={reason} className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value={reason} />
                            </FormControl>
                            <FormLabel className="font-normal">{reason}</FormLabel>
                          </FormItem>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="details"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Details (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Provide any additional information that might be helpful."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
                <Button type="submit">Submit Report</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
