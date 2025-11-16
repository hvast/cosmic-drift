-- Add contour_data column to creatures table for particle outline feature

ALTER TABLE creatures
ADD COLUMN contour_data JSON NULL COMMENT 'Extracted contour points for particle visualization';

-- Add index for better query performance
CREATE INDEX idx_creatures_contour ON creatures((CAST(contour_data AS CHAR(1))));
