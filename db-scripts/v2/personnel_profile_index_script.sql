-- Index script for personnel_profile table to speed up search and filter queries
-- Run with: psql -U postgres -d ipmas_db -f personnel_profile_index_script.sql

-- 1. active_status - used in almost every personnel query
CREATE INDEX IF NOT EXISTS idx_personnel_profile_active_status
  ON personnel_profile(active_status);

-- 2. Composite index for common list query: active personnel ordered by rank
CREATE INDEX IF NOT EXISTS idx_personnel_profile_active_status_rank_id
  ON personnel_profile(active_status, rank_id);

-- 3. user_id - lookups by user (already has gorm index, but explicit for clarity)
CREATE INDEX IF NOT EXISTS idx_personnel_profile_user_id
  ON personnel_profile(user_id)
  WHERE user_id IS NOT NULL;

-- 4. rank_id - filter by rank (already has gorm index)
CREATE INDEX IF NOT EXISTS idx_personnel_profile_rank_id
  ON personnel_profile(rank_id)
  WHERE rank_id IS NOT NULL;

-- 5. medical_category_id - filter by medical category
CREATE INDEX IF NOT EXISTS idx_personnel_profile_medical_category_id
  ON personnel_profile(medical_category_id)
  WHERE medical_category_id IS NOT NULL;

-- 6. unit - filter by unit (LOWER(unit) LIKE)
CREATE INDEX IF NOT EXISTS idx_personnel_profile_unit_lower
  ON personnel_profile(LOWER(unit));

-- 7. name - for search (LOWER(name) LIKE)
CREATE INDEX IF NOT EXISTS idx_personnel_profile_name_lower
  ON personnel_profile(LOWER(name));

-- 8. army_no - prefix/exact search (unique index already exists, this helps LIKE 'X%')
CREATE INDEX IF NOT EXISTS idx_personnel_profile_army_no_lower
  ON personnel_profile(LOWER(army_no));

-- 9. email - filter and search
CREATE INDEX IF NOT EXISTS idx_personnel_profile_email_lower
  ON personnel_profile(LOWER(email))
  WHERE email IS NOT NULL AND email != '';

-- 10. service - filter by service
CREATE INDEX IF NOT EXISTS idx_personnel_profile_service_lower
  ON personnel_profile(LOWER(service))
  WHERE service IS NOT NULL AND service != '';

-- 11. natural_category - filter
CREATE INDEX IF NOT EXISTS idx_personnel_profile_natural_category_lower
  ON personnel_profile(LOWER(TRIM(natural_category)))
  WHERE natural_category IS NOT NULL AND natural_category != '';

-- 12. dob, doe - date filters
CREATE INDEX IF NOT EXISTS idx_personnel_profile_dob
  ON personnel_profile(dob)
  WHERE dob IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_personnel_profile_doe
  ON personnel_profile(doe)
  WHERE doe IS NOT NULL;

-- 13. platoon_id, tradesman_id - filter by platoon/tradesman
CREATE INDEX IF NOT EXISTS idx_personnel_profile_platoon_id
  ON personnel_profile(platoon_id)
  WHERE platoon_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_personnel_profile_tradesman_id
  ON personnel_profile(tradesman_id)
  WHERE tradesman_id IS NOT NULL;

-- 14. Optional: pg_trgm for fast ILIKE '%pattern%' search (requires extension)
-- Uncomment if you need faster substring search on name, army_no, unit, email:
/*
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS idx_personnel_profile_name_trgm
  ON personnel_profile USING gin (name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_personnel_profile_army_no_trgm
  ON personnel_profile USING gin (army_no gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_personnel_profile_unit_trgm
  ON personnel_profile USING gin (unit gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_personnel_profile_email_trgm
  ON personnel_profile USING gin (email gin_trgm_ops);
*/
