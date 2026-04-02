import React from 'react';
import { Avatar, ButtonUnique, StatusBadge } from '@/components/ui';
import { formatCurrency } from '@/lib/currency';

interface ApplicationCardProps {
  worker: {
    firstName: string;
    lastName: string;
    avatarUrl?: string;
    reliabilityScore: number;
    averageRating: number | null;
    totalShiftsCompleted: number;
    workerStatus: string;
  };
  shift: {
    title: string;
    date: string;
    time: string;
    payRate: number;
    location: string;
    slotsConfirmed?: number;
    slotsNeeded?: number;
  };
  status: string;
  appliedAt: string;
  onConfirm?: () => void;
  onReject?: () => void;
  onMessage?: () => void;