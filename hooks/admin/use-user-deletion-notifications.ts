'use client';

import { useEffect, useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { userDeletionKeys } from './user-deletion';

// Hook for managing real-time notifications about user deletions
export function useUserDeletionNotifications() {
    const [notifications, setNotifications] = useState<Array<{
        id: string;
        type: 'deletion' | 'restoration' | 'scheduled' | 'cancelled';
        userId: string;
        userName: string;
        message: string;
        timestamp: Date;
        read: boolean;
    }>>([]);

    const addNotification = useCallback((notification: Omit<typeof notifications[0], 'id' | 'timestamp' | 'read'>) => {
        const newNotification = {
            ...notification,
            id: crypto.randomUUID(),
            timestamp: new Date(),
            read: false,
        };
        
        setNotifications(prev => [newNotification, ...prev.slice(0, 49)]); // Keep last 50 notifications
        
        // Show toast notification
        const toastMessage = `${notification.userName}: ${notification.message}`;
        switch (notification.type) {
            case 'deletion':
                toast.error(toastMessage);
                break;
            case 'restoration':
                toast.success(toastMessage);
                break;
            case 'scheduled':
                toast.warning(toastMessage);
                break;
            case 'cancelled':
                toast.info(toastMessage);
                break;
        }
    }, []);

    const markAsRead = useCallback((notificationId: string) => {
        setNotifications(prev => 
            prev.map(notification => 
                notification.id === notificationId 
                    ? { ...notification, read: true }
                    : notification
            )
        );
    }, []);

    const markAllAsRead = useCallback(() => {
        setNotifications(prev => 
            prev.map(notification => ({ ...notification, read: true }))
        );
    }, []);

    const clearNotifications = useCallback(() => {
        setNotifications([]);
    }, []);

    const unreadCount = notifications.filter(n => !n.read).length;

    return {
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearNotifications,
    };
}

// Hook for monitoring scheduled deletions and sending reminders
export function useScheduledDeletionMonitor() {
    const [upcomingDeletions, setUpcomingDeletions] = useState<Array<{
        userId: string;
        userName: string;
        scheduledDate: Date;
        hoursRemaining: number;
    }>>([]);

    const checkUpcomingDeletions = useCallback(() => {
        // This would typically fetch from the server
        // For now, we'll simulate checking upcoming deletions
        const now = new Date();
        const twentyFourHoursFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

        // Filter deletions scheduled within the next 24 hours
        const upcoming = upcomingDeletions.filter(deletion => {
            const scheduledDate = new Date(deletion.scheduledDate);
            return scheduledDate <= twentyFourHoursFromNow && scheduledDate > now;
        });

        return upcoming;
    }, [upcomingDeletions]);

    const sendDeletionReminders = useCallback(() => {
        const upcoming = checkUpcomingDeletions();
        
        upcoming.forEach(deletion => {
            if (deletion.hoursRemaining <= 24 && deletion.hoursRemaining > 0) {
                toast.warning(
                    `Reminder: ${deletion.userName}'s account is scheduled for deletion in ${deletion.hoursRemaining} hours`,
                    { duration: 10000 }
                );
            }
        });
    }, [checkUpcomingDeletions]);

    // Check for upcoming deletions every hour
    useEffect(() => {
        const interval = setInterval(() => {
            sendDeletionReminders();
        }, 60 * 60 * 1000); // 1 hour

        return () => clearInterval(interval);
    }, [sendDeletionReminders]);

    return {
        upcomingDeletions,
        checkUpcomingDeletions,
        sendDeletionReminders,
    };
}

// Hook for managing deletion audit trail and compliance
export function useUserDeletionAudit() {
    const [auditLog, setAuditLog] = useState<Array<{
        id: string;
        action: 'delete' | 'restore' | 'schedule' | 'cancel';
        userId: string;
        userName: string;
        adminId: string;
        adminName: string;
        reason: string;
        timestamp: Date;
        ipAddress?: string;
        userAgent?: string;
    }>>([]);

    const logAction = useCallback((action: {
        action: 'delete' | 'restore' | 'schedule' | 'cancel';
        userId: string;
        userName: string;
        adminId: string;
        adminName: string;
        reason: string;
        ipAddress?: string;
        userAgent?: string;
    }) => {
        const auditEntry = {
            ...action,
            id: crypto.randomUUID(),
            timestamp: new Date(),
        };
        
        setAuditLog(prev => [auditEntry, ...prev]);
        
        // In a real implementation, this would also send to the server
        console.log('Audit log entry:', auditEntry);
    }, []);

    const exportAuditLog = useCallback((startDate?: Date, endDate?: Date) => {
        let filteredLog = auditLog;
        
        if (startDate || endDate) {
            filteredLog = auditLog.filter(entry => {
                const entryDate = entry.timestamp;
                if (startDate && entryDate < startDate) return false;
                if (endDate && entryDate > endDate) return false;
                return true;
            });
        }

        // Convert to CSV format
        const headers = ['Timestamp', 'Action', 'User', 'Admin', 'Reason', 'IP Address'];
        const csvContent = [
            headers.join(','),
            ...filteredLog.map(entry => [
                entry.timestamp.toISOString(),
                entry.action,
                entry.userName,
                entry.adminName,
                `"${entry.reason.replace(/"/g, '""')}"`, // Escape quotes in reason
                entry.ipAddress || 'N/A'
            ].join(','))
        ].join('\n');

        // Create and download file
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `user-deletion-audit-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }, [auditLog]);

    return {
        auditLog,
        logAction,
        exportAuditLog,
    };
}

// Hook for managing deletion statistics and analytics
export function useUserDeletionAnalytics() {
    const [analytics, setAnalytics] = useState({
        totalDeletions: 0,
        deletionsThisMonth: 0,
        deletionsThisWeek: 0,
        restorations: 0,
        scheduledDeletions: 0,
        averageDeletionsPerDay: 0,
        topDeletionReasons: [] as Array<{ reason: string; count: number }>,
        deletionsByAdmin: [] as Array<{ adminName: string; count: number }>,
    });

    const updateAnalytics = useCallback((data: Partial<typeof analytics>) => {
        setAnalytics(prev => ({ ...prev, ...data }));
    }, []);

    const calculateTrends = useCallback(() => {
        const now = new Date();
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        // This would typically fetch from the server
        // For now, we'll return mock trend data
        return {
            monthlyTrend: analytics.deletionsThisMonth > 0 ? '+15%' : '0%',
            weeklyTrend: analytics.deletionsThisWeek > 0 ? '+5%' : '0%',
            restorationRate: analytics.totalDeletions > 0 
                ? `${Math.round((analytics.restorations / analytics.totalDeletions) * 100)}%`
                : '0%',
        };
    }, [analytics]);

    const generateReport = useCallback(() => {
        const trends = calculateTrends();
        
        return {
            summary: {
                ...analytics,
                ...trends,
                generatedAt: new Date(),
            },
            recommendations: [
                analytics.deletionsThisWeek > 10 && 'High deletion activity this week - consider reviewing deletion policies',
                analytics.restorations / analytics.totalDeletions > 0.3 && 'High restoration rate - consider improving user onboarding',
                analytics.scheduledDeletions > 5 && 'Multiple scheduled deletions - ensure proper follow-up',
            ].filter(Boolean),
        };
    }, [analytics, calculateTrends]);

    return {
        analytics,
        updateAnalytics,
        calculateTrends,
        generateReport,
    };
}

// Hook for managing deletion permissions and role-based access
export function useUserDeletionPermissions(userRole: string) {
    const permissions = {
        canDelete: ['admin', 'super_admin'].includes(userRole),
        canRestore: ['super_admin'].includes(userRole),
        canViewHistory: ['admin', 'super_admin'].includes(userRole),
        canSchedule: ['admin', 'super_admin'].includes(userRole),
        canBulkDelete: ['super_admin'].includes(userRole),
        canExportAudit: ['admin', 'super_admin'].includes(userRole),
        canViewAnalytics: ['admin', 'super_admin'].includes(userRole),
    };

    const checkPermission = useCallback((action: keyof typeof permissions) => {
        return permissions[action];
    }, [permissions]);

    const requirePermission = useCallback((action: keyof typeof permissions) => {
        if (!permissions[action]) {
            throw new Error(`Insufficient permissions for action: ${action}`);
        }
    }, [permissions]);

    return {
        permissions,
        checkPermission,
        requirePermission,
    };
}
