-- Add 'claimed' status to submission_status enum
-- This allows children to "claim" a mission before completing it
ALTER TYPE submission_status
ADD VALUE 'claimed' BEFORE 'pending';