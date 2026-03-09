-- 1. Create mental_well_being table (safe for existing DB)
CREATE TABLE IF NOT EXISTS mental_well_being (
  id BIGSERIAL PRIMARY KEY,
  person_id BIGINT NOT NULL,

  last_assessment_date DATE NOT NULL,
  assessment_conducted_by VARCHAR(150) NOT NULL,

  mental_status VARCHAR(10) NOT NULL
    CHECK (mental_status IN ('Green', 'Yellow', 'Orange', 'Red')),

  overall_stress_level VARCHAR(10) NOT NULL
    CHECK (overall_stress_level IN ('Low', 'Moderate', 'High')),

  primary_stress_factors TEXT,
  sleep_quality VARCHAR(100),
  fatigue_level VARCHAR(100),

  counseling_required BOOLEAN NOT NULL DEFAULT FALSE,
  counseling_conducted BOOLEAN NOT NULL DEFAULT FALSE,
  counseling_date DATE,

  behavioral_observations TEXT,
  welfare_interaction_date DATE,
  follow_up_required BOOLEAN NOT NULL DEFAULT FALSE,

  operational_readiness_recommendation TEXT,
  next_review_date DATE,
  remarks TEXT,

  deployment_duration_days INTEGER
    CHECK (deployment_duration_days IS NULL OR deployment_duration_days >= 0),

  leave_gap_days INTEGER
    CHECK (leave_gap_days IS NULL OR leave_gap_days >= 0),

  stress_risk_alert VARCHAR(50) NOT NULL DEFAULT 'Normal',
  medical_officer_remarks TEXT,

  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_mental_well_being_person
    FOREIGN KEY (person_id) REFERENCES personnel(id)
    ON DELETE CASCADE
);

-- 2. Indexes for performance / lookups
CREATE INDEX IF NOT EXISTS idx_mental_well_being_person_id
  ON mental_well_being(person_id);

CREATE INDEX IF NOT EXISTS idx_mental_well_being_next_review_date
  ON mental_well_being(next_review_date);