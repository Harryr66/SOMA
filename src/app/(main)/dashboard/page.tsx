
'use client';

import React, { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, LabelList, Line, LineChart, Pie, PieChart, Cell, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DollarSign, Users, Activity, TrendingUp, Search, ShieldAlert, UserX, MoreHorizontal, Image as ImageIcon } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Image from 'next/image';
import { Label } from '@/components/ui/label';
import { AdminLoginForm } from '@/components/admin/admin-login-form';
import { type Report, type Post, type Artwork, type Discussion, type Reply } from '@/lib/types';



const revenueData: { month: string, revenue: number }[] = [];
const userGrowthData: { month: string, users: number }[] = [];
const salesByRevenueData: { type: string, revenue: number, fill: string }[] = [];
const topArtistsData: { id: string, name: string, avatarUrl: string, imageAiHint: string, totalSales: number }[] = [];
const initialReportedBugsData: { id: string; description: string; reportedBy: string; hasAttachment: boolean; }[] = [];

const platformChartConfig = {
    revenue: {
        label: "Revenue",
        color: "hsl(var(--chart-1))",
    },
    users: {
        label: "Users",
        color: "hsl(var(--chart-2))",
    },
    digital: {
        label: "Digital",
        color: "hsl(var(--chart-1))"
    },
    physical: {
        label: "Physical",
        color: "hsl(var(--chart-2))"
    },
    auction: {
        label: "Auction",
        color: "hsl(var(--chart-3))"
    }
} satisfies ChartConfig;


const mockReportedUsers = [
    { id: 'artist-1', name: 'Elena Vance', handle: '@elena_art', avatarUrl: 'https://placehold.co/96x96.png', imageAiHint: "artist portrait", status: 'Active' },
    { id: 'artist-2', name: 'Liam Kenji', handle: '@liam_kenji', avatarUrl: 'https://placehold.co/96x96.png', imageAiHint: "artist portrait", status: 'Active' },
    { id: 'artist-3', name: 'Aria Chen', handle: '@aria_draws', avatarUrl: 'https://placehold.co/96x96.png', imageAiHint: "artist portrait", status: 'Active' },
];

const mockReports: Report[] = [
  { 
    id: 'report-1',
    contentId: 'art-9',
    contentType: 'Post',
    content: 'Fading Memories',
    reportedBy: '@liam_kenji',
    offenderId: 'artist-2',
    offenderHandle: '@aria_draws',
    reason: 'Inappropriate Content',
    details: 'The artwork contains imagery that violates the community guidelines regarding sensitive themes. It made me uncomfortable.',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'report-2',
    contentId: 'discussion-2',
    contentType: 'Discussion',
    content: 'Discussion for \'City at Dusk\'',
    reportedBy: '@elena_art',
    offenderId: 'artist-1',
    offenderHandle: '@liam_kenji',
    reason: 'Spam or Misleading',
    details: 'The user is promoting their own products in the discussion thread, which is not relevant to the topic.',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
];


export default function DashboardPage() {
    const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
    const { toast } = useToast();
    // Using mock data instead of useContent
  const posts: any[] = [];
  const artworks: any[] = [];
  const discussions: any[] = []; // Mock data - replace with actual data if needed
    
    const [users, setUsers] = React.useState<{id: string, name: string, handle: string, avatarUrl: string, imageAiHint: string, status: string}[]>([]);
    const [reportedContent, setReportedContent] = React.useState<Report[]>([]);
    const [reportedBugs, setReportedBugs] = React.useState(initialReportedBugsData);
    
    const [selectedBug, setSelectedBug] = React.useState<(typeof initialReportedBugsData)[0] | null>(null);
    const [isBugDetailOpen, setIsBugDetailOpen] = React.useState(false);
    
    const [selectedReport, setSelectedReport] = React.useState<Report | null>(null);
    const [isTakeActionOpen, setIsTakeActionOpen] = React.useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            if (sessionStorage.getItem('isAdmin') === 'true') {
                setIsAdminAuthenticated(true);
            }

            const storedUsers = localStorage.getItem('soma-reported-users');
            setUsers(storedUsers ? JSON.parse(storedUsers) : mockReportedUsers);

            const storedReports = localStorage.getItem('soma-reports');
            setReportedContent(storedReports ? JSON.parse(storedReports) : mockReports);
        }
    }, []);

    const updateUserStatus = (userId: string, status: string) => {
        const updatedUsers = users.map(u => u.id === userId ? { ...u, status } : u);
        setUsers(updatedUsers);
        localStorage.setItem('soma-reported-users', JSON.stringify(updatedUsers));
    };
    
    const removeReport = (reportId: string) => {
        const updatedReports = reportedContent.filter(r => r.id !== reportId);
        setReportedContent(updatedReports);
        localStorage.setItem('soma-reports', JSON.stringify(updatedReports));
    };

    const handleSuspend = (userId: string, duration: string) => {
        updateUserStatus(userId, 'Suspended');
        toast({
            title: "User Suspended",
            description: `The user has been suspended for ${duration}.`
        });
        if(selectedReport) removeReport(selectedReport.id);
        setIsTakeActionOpen(false);
    };

    const handleBan = (userId: string) => {
        updateUserStatus(userId, 'Banned');
        toast({
            title: "User Banned",
            description: "The user has been permanently banned.",
            variant: 'destructive'
        });
        if(selectedReport) removeReport(selectedReport.id);
        setIsTakeActionOpen(false);
    };
    
     const handleIgnoreReport = (reportId: string) => {
        removeReport(reportId);
        toast({
            title: "Report Ignored",
            description: "The report has been removed from the queue."
        });
    };

    const handleTakeAction = (reportId: string) => {
        const report = reportedContent.find((r) => r.id === reportId);
        if (report) {
            setSelectedReport(report);
            setIsTakeActionOpen(true);
        }
    };
    
    const handleRemoveContent = (reportId: string) => {
        removeReport(reportId);
        toast({
            title: 'Content Removed',
            description: 'The reported content has been successfully removed.',
        });
        setIsTakeActionOpen(false);
    };

    const handleResolveBug = (bugId: string) => {
        setReportedBugs(reportedBugs.filter(bug => bug.id !== bugId));
        toast({
            title: "Bug Resolved",
            description: "The bug has been marked as resolved and removed from the queue."
        });
    };
    
    const handleViewBugDetails = (bugId: string) => {
        const bug = reportedBugs.find((b) => b.id === bugId);
        if (bug) {
            setSelectedBug(bug);
            setIsBugDetailOpen(true);
        }
    };

    const renderReportedContent = () => {
        if (!selectedReport) return null;
    
        if (selectedReport.contentType === 'Post') {
            const contentItem = posts.find(p => p.id === selectedReport.contentId);
            if (!contentItem) return <div className="mt-1 border rounded-lg p-3 bg-muted text-center"><p className="text-sm text-muted-foreground">Content not found or has been deleted.</p></div>;
            return (
                <div className="mt-1 border rounded-lg p-3 space-y-2">
                    <div className="relative aspect-square w-full rounded-md overflow-hidden bg-muted">
                        <Image src={contentItem.imageUrl} alt={contentItem.caption} fill style={{objectFit: "contain"}} data-ai-hint={contentItem.imageAiHint || 'image'} />
                    </div>
                    <p className="font-semibold">{selectedReport.content}</p>
                    <p className="text-sm text-muted-foreground">{contentItem.caption}</p>
                </div>
            );
        }
    
        if (selectedReport.contentType === 'Artwork') {
            const contentItem = artworks.find(a => a.id === selectedReport.contentId);
            if (!contentItem) return <div className="mt-1 border rounded-lg p-3 bg-muted text-center"><p className="text-sm text-muted-foreground">Content not found or has been deleted.</p></div>;
            return (
                 <div className="mt-1 border rounded-lg p-3 space-y-2">
                    <div className="relative aspect-square w-full rounded-md overflow-hidden bg-muted">
                        <Image src={contentItem.imageUrl} alt={contentItem.title} fill style={{objectFit: "contain"}} data-ai-hint={contentItem.imageAiHint || 'image'} />
                    </div>
                    <p className="font-semibold">{contentItem.title}</p>
                </div>
            )
        }
    
        if (selectedReport.contentType === 'Discussion') {
            const contentItem = discussions.find(d => d.id === selectedReport.contentId);
            if (!contentItem) return <div className="mt-1 border rounded-lg p-3 bg-muted text-center"><p className="text-sm text-muted-foreground">Content not found or has been deleted.</p></div>;
            return (
                <div className="mt-1 border rounded-lg p-3 space-y-2 bg-muted">
                    <p className="font-semibold">{contentItem.title}</p>
                    <p className="text-sm text-muted-foreground">{contentItem.content}</p>
                </div>
            );
        }
    
        if (selectedReport.contentType === 'Reply') {
            const findReplyInTree = (replies: Reply[], replyId: string): Reply | undefined => {
                for (const reply of replies) {
                    if (reply.id === replyId) return reply;
                    if (reply.replies) {
                        const found = findReplyInTree(reply.replies, replyId);
                        if (found) return found;
                    }
                }
                return undefined;
            };
    
            let contentItem: Reply | undefined;
            for (const discussion of discussions) {
                if (discussion.replies) {
                    contentItem = findReplyInTree(discussion.replies, selectedReport.contentId);
                    if (contentItem) break;
                }
            }
            if (!contentItem) return <div className="mt-1 border rounded-lg p-3 bg-muted text-center"><p className="text-sm text-muted-foreground">Content not found or has been deleted.</p></div>;
            return (
                <div className="mt-1 border rounded-lg p-3 space-y-2 bg-muted">
                    <p className="text-sm text-muted-foreground">{contentItem.content}</p>
                </div>
            );
        }
        
        return <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md mt-1">{selectedReport.content}</p>;
    };

  if (!isAdminAuthenticated) {
    return <AdminLoginForm onSuccess={() => setIsAdminAuthenticated(true)} />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="font-headline text-4xl md:text-5xl font-semibold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground text-lg">Platform-wide analytics and performance metrics.</p>
      </header>

       <Tabs defaultValue="moderation" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="moderation">Moderation</TabsTrigger>
                <TabsTrigger value="analytics">Platform Analytics</TabsTrigger>
            </TabsList>
            <TabsContent value="moderation" className="mt-6">
                 <div className="grid gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Reported Content Queue</CardTitle>
                            <CardDescription>Review content reported by the community for guideline violations.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Offender</TableHead>
                                        <TableHead>Content</TableHead>
                                        <TableHead>Reason</TableHead>
                                        <TableHead>Reported By</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {reportedContent.length > 0 ? (
                                        reportedContent.map((report) => (
                                            <TableRow key={report.id}>
                                                <TableCell className="font-medium">{report.offenderHandle}</TableCell>
                                                <TableCell className="font-medium truncate max-w-xs">{report.content}</TableCell>
                                                <TableCell>{report.reason}</TableCell>
                                                <TableCell>{report.reportedBy}</TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button variant="outline" size="sm" onClick={() => handleIgnoreReport(report.id)}>Ignore</Button>
                                                        <Button variant="secondary" size="sm" onClick={() => handleTakeAction(report.id)}>Review</Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={5} className="h-24 text-center">
                                                No reported content. The queue is clear!
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>User Management</CardTitle>
                            <CardDescription>Search for users to view their status or take moderation actions.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="mb-6">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input placeholder="Search by username or email..." className="pl-10" />
                                </div>
                            </div>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>User</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {users.length > 0 ? (
                                        users.map((user) => (
                                            <TableRow key={user.id}>
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <Avatar>
                                                            <AvatarImage src={user.avatarUrl} alt={user.name} data-ai-hint={user.imageAiHint} />
                                                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <p className="font-medium">{user.name}</p>
                                                            <p className="text-sm text-muted-foreground">{user.handle}</p>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={user.status === 'Active' ? 'secondary' : 'destructive'}>{user.status}</Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                                <span className="sr-only">User Actions</span>
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuLabel>Manual Action</DropdownMenuLabel>
                                                            <DropdownMenuSeparator />
                                                            {user.status === 'Suspended' ? (
                                                                <DropdownMenuItem onClick={() => updateUserStatus(user.id, 'Active')}>
                                                                    Lift Suspension
                                                                </DropdownMenuItem>
                                                            ) : user.status === 'Active' ? (
                                                                <>
                                                                    <DropdownMenuItem onClick={() => handleSuspend(user.id, '1 week')}>Suspend for 1 week</DropdownMenuItem>
                                                                </>
                                                            ) : null}
                                                            {user.status !== 'Banned' && (
                                                                <DropdownMenuItem 
                                                                    className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                                                                    onClick={() => handleBan(user.id)}
                                                                >
                                                                    Ban Permanently
                                                                </DropdownMenuItem>
                                                            )}
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={3} className="h-24 text-center">
                                                Search for a user to manage them.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Reported Bugs</CardTitle>
                            <CardDescription>Review bug reports submitted by users to improve platform stability.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Reported By</TableHead>
                                        <TableHead>Attachment</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {reportedBugs.length > 0 ? (
                                        reportedBugs.map((bug) => (
                                            <TableRow key={bug.id}>
                                                <TableCell className="font-medium max-w-sm truncate">{bug.description}</TableCell>
                                                <TableCell>{bug.reportedBy}</TableCell>
                                                <TableCell>
                                                    {bug.hasAttachment ? <ImageIcon className="h-5 w-5 text-muted-foreground" /> : '-'}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button variant="outline" size="sm" onClick={() => handleResolveBug(bug.id)}>Mark as Resolved</Button>
                                                        <Button variant="secondary" size="sm" onClick={() => handleViewBugDetails(bug.id)}>View Details</Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={4} className="h-24 text-center">
                                                No reported bugs.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </TabsContent>
            <TabsContent value="analytics" className="mt-6">
                <div className="grid gap-6">
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">$0.00</div>
                                    <p className="text-xs text-muted-foreground">No sales yet</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Monthly Active Users</CardTitle>
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">0</div>
                                    <p className="text-xs text-muted-foreground">No active users yet</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Avg. Daily Users</CardTitle>
                                    <Activity className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">0</div>
                                    <p className="text-xs text-muted-foreground">Not enough data</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Projected Growth</CardTitle>
                                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">--%</div>
                                    <p className="text-xs text-muted-foreground">Not enough data</p>
                                </CardContent>
                            </Card>
                        </div>
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Revenue Over Time</CardTitle>
                                    <CardDescription>Monthly revenue over the last 6 months.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {revenueData.length > 0 ? (
                                        <ChartContainer config={platformChartConfig} className="h-[300px] w-full">
                                            <BarChart data={revenueData} margin={{ top: 20, left: -20, right: 10 }}>
                                                <CartesianGrid vertical={false} />
                                                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                                                <YAxis tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(value) => `$${(value / 1000)}k`} />
                                                <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                                                <Bar dataKey="revenue" fill="var(--color-revenue)" radius={4}>
                                                    <LabelList position="top" offset={10} className="fill-foreground" fontSize={12} formatter={(value: number) => `$${value.toLocaleString()}`} />
                                                </Bar>
                                            </BarChart>
                                        </ChartContainer>
                                    ) : (
                                        <div className="flex h-[300px] w-full items-center justify-center rounded-lg border border-dashed">
                                            <p className="text-sm text-muted-foreground">No revenue data available yet.</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle>User Growth</CardTitle>
                                    <CardDescription>Total users over the last 6 months.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {userGrowthData.length > 0 ? (
                                        <ChartContainer config={platformChartConfig} className="h-[300px] w-full">
                                            <LineChart data={userGrowthData} margin={{ left: -20, right: 20, top: 10, bottom: 10 }}>
                                                <CartesianGrid vertical={false} />
                                                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                                                <YAxis tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(value) => value.toLocaleString()} />
                                                <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                                                <ChartLegend content={<ChartLegendContent />} />
                                                <Line dataKey="users" type="monotone" stroke="var(--color-users)" strokeWidth={2} dot={{ r: 4 }} />
                                            </LineChart>
                                        </ChartContainer>
                                    ) : (
                                        <div className="flex h-[300px] w-full items-center justify-center rounded-lg border border-dashed">
                                            <p className="text-sm text-muted-foreground">No user growth data available yet.</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                            <Card className="lg:col-span-2">
                                <CardHeader>
                                    <CardTitle>Top Selling Artists</CardTitle>
                                    <CardDescription>
                                        Artists with the highest sales volume in the last 30 days.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-[80px]">Artist</TableHead>
                                                <TableHead>Name</TableHead>
                                                <TableHead className="text-right">Total Sales (USD)</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {topArtistsData.length > 0 ? (
                                                topArtistsData.map((artist) => (
                                                    <TableRow key={artist.id}>
                                                        <TableCell>
                                                            <Avatar>
                                                                <AvatarImage src={artist.avatarUrl} alt={artist.name} data-ai-hint={artist.imageAiHint} />
                                                                <AvatarFallback>{artist.name.charAt(0)}</AvatarFallback>
                                                            </Avatar>
                                                        </TableCell>
                                                        <TableCell className="font-medium">{artist.name}</TableCell>
                                                        <TableCell className="text-right">${artist.totalSales.toLocaleString()}</TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={3} className="h-24 text-center">
                                                        No top selling artists yet.
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Revenue by Type</CardTitle>
                                    <CardDescription>Breakdown of revenue by listing type.</CardDescription>
                                </CardHeader>
                                <CardContent className="flex-1 pb-0">
                                    {salesByRevenueData.length > 0 ? (
                                        <ChartContainer
                                            config={platformChartConfig}
                                            className="mx-auto aspect-square h-[250px]"
                                        >
                                            <PieChart>
                                                <ChartTooltip content={<ChartTooltipContent nameKey="revenue" formatter={(value: any) => `$${Number(value).toLocaleString()}`} hideLabel />} />
                                                <Pie
                                                    data={salesByRevenueData}
                                                    dataKey="revenue"
                                                    nameKey="type"
                                                    innerRadius={60}
                                                    strokeWidth={5}
                                                >
                                                    {salesByRevenueData.map((entry) => (
                                                        <Cell key={`cell-${entry.type}`} fill={entry.fill} />
                                                    ))}
                                                </Pie>
                                                <ChartLegend
                                                    content={<ChartLegendContent nameKey="type" />}
                                                    className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/3 [&>*]:justify-center"
                                                />
                                            </PieChart>
                                        </ChartContainer>
                                    ) : (
                                        <div className="flex h-[250px] w-full items-center justify-center rounded-lg border border-dashed">
                                            <p className="text-sm text-muted-foreground text-center">No sales data available yet.</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                    </div>
                </div>
            </TabsContent>
       </Tabs>
        
        {/* Bug Details Dialog */}
        {selectedBug && (
            <Dialog open={isBugDetailOpen} onOpenChange={setIsBugDetailOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Bug Details</DialogTitle>
                        <DialogDescription>Reported by: {selectedBug.reportedBy}</DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <div>
                            <Label className="font-semibold">Description</Label>
                            <p className="text-sm text-muted-foreground mt-1">{selectedBug.description}</p>
                        </div>
                        {selectedBug.hasAttachment && (
                            <div>
                                <Label className="font-semibold">Attachment</Label>
                                <div className="mt-2 rounded-lg border overflow-hidden">
                                    <Image src="https://placehold.co/600x400.png" alt="Attachment" width={600} height={400} className="w-full object-cover" data-ai-hint="screenshot" />
                                </div>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button onClick={() => setIsBugDetailOpen(false)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        )}

        {/* Take Action Dialog */}
        {selectedReport && (
            <Dialog open={isTakeActionOpen} onOpenChange={setIsTakeActionOpen}>
                <DialogContent className="sm:max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Review Report</DialogTitle>
                        <DialogDescription>
                            Reported by: {selectedReport.reportedBy} for "{selectedReport.reason}"
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid md:grid-cols-2 gap-6 py-4 max-h-[70vh] overflow-y-auto">
                        <div className="space-y-2">
                            <Label className="font-semibold">Reported Content Preview</Label>
                            {renderReportedContent()}
                        </div>
                         <div className="space-y-4">
                            <div>
                                <Label className="font-semibold">Offending User</Label>
                                <p className="text-sm text-muted-foreground">{selectedReport.offenderHandle}</p>
                            </div>
                            <div>
                                <Label className="font-semibold">Reporter's Details</Label>
                                <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md mt-1">{selectedReport.details || 'No additional details provided.'}</p>
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="flex-col-reverse sm:flex-row sm:justify-between items-center">
                        <Button variant="outline" onClick={() => setIsTakeActionOpen(false)}>Cancel</Button>
                        <div className="flex gap-2">
                            <Button variant="destructive" onClick={() => handleRemoveContent(selectedReport.id)}>Remove Content</Button>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="secondary">Take User Action</Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Suspend User</DropdownMenuLabel>
                                    <DropdownMenuItem onClick={() => handleSuspend(selectedReport.offenderId, '1 week')}>For 1 week</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleSuspend(selectedReport.offenderId, '1 month')}>For 1 month</DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="text-destructive focus:bg-destructive/10 focus:text-destructive" onClick={() => handleBan(selectedReport.offenderId)}>
                                        Ban Permanently
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        )}
    </div>
  );
}
