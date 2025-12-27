-- Migration: Add detailed application form fields to applications table
-- Date: 2025-12-22

ALTER TABLE applications
ADD COLUMN why_join TEXT NOT NULL AFTER status,
ADD COLUMN previous_club VARCHAR(255) NULL AFTER why_join,
ADD COLUMN goals_in_club TEXT NOT NULL AFTER previous_club,
ADD COLUMN phone_number VARCHAR(20) NOT NULL AFTER goals_in_club,
ADD COLUMN skills TEXT NULL AFTER phone_number,
ADD COLUMN expectations TEXT NULL AFTER skills,
ADD COLUMN availability VARCHAR(100) NULL AFTER expectations,
ADD COLUMN additional_comments TEXT NULL AFTER availability,
ADD COLUMN is_member_of_other_club BOOLEAN DEFAULT FALSE AFTER additional_comments;

-- Rename existing 'response' column to 'admin_response' for clarity
ALTER TABLE applications
CHANGE COLUMN response admin_response TEXT NULL;

-- Add index for faster queries on status
CREATE INDEX idx_applications_status ON applications(status);

-- Add index for club applications lookup
CREATE INDEX idx_applications_membership_id ON applications(membership_id);
