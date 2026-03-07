--
-- PostgreSQL database dump
--

\restrict JYwupmlyqcykNl9qtYDHuhv1YjA3BHqpH0KcVj9Nme7VBAzDwaeGxOrc6ZkHI1G

-- Dumped from database version 14.20 (Homebrew)
-- Dumped by pg_dump version 14.20 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: app_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.app_settings (
    id bigint NOT NULL,
    key character varying(100) NOT NULL,
    value text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    deleted_at timestamp with time zone
);


--
-- Name: app_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.app_settings_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: app_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.app_settings_id_seq OWNED BY public.app_settings.id;


--
-- Name: attendance; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.attendance (
    id bigint NOT NULL,
    user_id bigint,
    attendance_date date NOT NULL,
    status character varying(20) DEFAULT 'Present'::character varying NOT NULL,
    check_in_time timestamp with time zone,
    check_out_time timestamp with time zone,
    remarks text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


--
-- Name: attendance_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.attendance_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: attendance_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.attendance_id_seq OWNED BY public.attendance.id;


--
-- Name: companies; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.companies (
    id bigint NOT NULL,
    company_name character varying(100) NOT NULL,
    active_status bigint DEFAULT 1 NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


--
-- Name: companies_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.companies_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: companies_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.companies_id_seq OWNED BY public.companies.id;


--
-- Name: company_personnel; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.company_personnel (
    id bigint NOT NULL,
    company_id bigint NOT NULL,
    personnel_id bigint NOT NULL,
    role character varying(50) NOT NULL,
    appointment_date date NOT NULL,
    end_date date,
    status character varying(20) DEFAULT 'Active'::character varying NOT NULL,
    remarks text,
    appointed_by bigint,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


--
-- Name: company_personnel_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.company_personnel_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: company_personnel_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.company_personnel_id_seq OWNED BY public.company_personnel.id;


--
-- Name: course_master; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.course_master (
    id bigint NOT NULL,
    course_code character varying(50),
    course_title character varying(200) NOT NULL,
    start_date timestamp without time zone,
    end_date timestamp without time zone,
    remarks text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


--
-- Name: course_master_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.course_master_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: course_master_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.course_master_id_seq OWNED BY public.course_master.id;


--
-- Name: documents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.documents (
    id bigint NOT NULL,
    army_no character varying(50) NOT NULL,
    document_type character varying(20) NOT NULL,
    file_name character varying(255) NOT NULL,
    original_name character varying(255) NOT NULL,
    file_path text NOT NULL,
    file_size bigint NOT NULL,
    mime_type character varying(100) NOT NULL,
    uploaded_by bigint,
    uploaded_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


--
-- Name: documents_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.documents_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: documents_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.documents_id_seq OWNED BY public.documents.id;


--
-- Name: drone_equipment; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.drone_equipment (
    id bigint NOT NULL,
    equipment_name character varying(100) NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


--
-- Name: drone_equipment_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.drone_equipment_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: drone_equipment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.drone_equipment_id_seq OWNED BY public.drone_equipment.id;


--
-- Name: ere; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ere (
    id bigint NOT NULL,
    profile_id bigint NOT NULL,
    unit character varying(100) NOT NULL,
    from_date date NOT NULL,
    to_date date NOT NULL,
    planned_ere character varying(200) NOT NULL,
    remarks text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


--
-- Name: ere_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ere_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ere_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.ere_id_seq OWNED BY public.ere.id;


--
-- Name: family_details; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.family_details (
    id bigint NOT NULL,
    profile_id bigint NOT NULL,
    relationship_type character varying(20) NOT NULL,
    name character varying(100) NOT NULL,
    dob date,
    contact_number character varying(20),
    pan_card character varying(20),
    aadhar_card character varying(20),
    account_number character varying(50),
    blood_group character varying(10),
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


--
-- Name: family_details_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.family_details_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: family_details_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.family_details_id_seq OWNED BY public.family_details.id;


--
-- Name: family_problem; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.family_problem (
    id bigint NOT NULL,
    profile_id bigint,
    problem text,
    remarks text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


--
-- Name: family_problem_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.family_problem_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: family_problem_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.family_problem_id_seq OWNED BY public.family_problem.id;


--
-- Name: field_service; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.field_service (
    id bigint NOT NULL,
    profile_id bigint,
    location character varying(100),
    from_date date,
    to_date date,
    remarks text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


--
-- Name: field_service_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.field_service_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: field_service_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.field_service_id_seq OWNED BY public.field_service.id;


--
-- Name: foreign_posting; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.foreign_posting (
    id bigint NOT NULL,
    profile_id bigint,
    unit character varying(100),
    from_date date,
    to_date date,
    remarks text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


--
-- Name: foreign_posting_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.foreign_posting_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: foreign_posting_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.foreign_posting_id_seq OWNED BY public.foreign_posting.id;


--
-- Name: formations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.formations (
    id bigint NOT NULL,
    name character varying(200) NOT NULL,
    parent_id bigint,
    sort_order bigint DEFAULT 0,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


--
-- Name: formations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.formations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: formations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.formations_id_seq OWNED BY public.formations.id;


--
-- Name: grades; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.grades (
    id bigint NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


--
-- Name: grades_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.grades_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: grades_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.grades_id_seq OWNED BY public.grades.id;


--
-- Name: hospitalisation; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.hospitalisation (
    id bigint NOT NULL,
    profile_id bigint NOT NULL,
    date_of_admission date,
    date_of_discharge date,
    diagnosis text,
    medical_category text,
    remarks text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


--
-- Name: hospitalisation_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.hospitalisation_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: hospitalisation_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.hospitalisation_id_seq OWNED BY public.hospitalisation.id;


--
-- Name: leave_approvals; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.leave_approvals (
    id bigint NOT NULL,
    leave_request_id bigint NOT NULL,
    approver_id bigint NOT NULL,
    status character varying(20) DEFAULT 'approved'::character varying NOT NULL,
    comments text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


--
-- Name: leave_approvals_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.leave_approvals_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: leave_approvals_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.leave_approvals_id_seq OWNED BY public.leave_approvals.id;


--
-- Name: leave_extensions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.leave_extensions (
    id bigint NOT NULL,
    leave_request_id bigint NOT NULL,
    original_end_date date NOT NULL,
    new_end_date date NOT NULL,
    extension_days bigint NOT NULL,
    extension_reason text NOT NULL,
    extended_by bigint NOT NULL,
    approved_by bigint,
    status character varying(20) DEFAULT 'approved'::character varying NOT NULL,
    approval_notes text,
    approved_at timestamp without time zone,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


--
-- Name: leave_extensions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.leave_extensions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: leave_extensions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.leave_extensions_id_seq OWNED BY public.leave_extensions.id;


--
-- Name: leave_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.leave_requests (
    id bigint NOT NULL,
    personnel_id bigint NOT NULL,
    leave_type_id bigint,
    supervisor_id bigint,
    start_date date NOT NULL,
    end_date date NOT NULL,
    total_days bigint NOT NULL,
    reason text NOT NULL,
    status character varying(20) DEFAULT 'Pending'::character varying NOT NULL,
    rejection_reason text,
    applied_by_admin boolean DEFAULT false NOT NULL,
    admin_id bigint,
    approved_by bigint,
    approved_at timestamp without time zone,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


--
-- Name: leave_requests_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.leave_requests_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: leave_requests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.leave_requests_id_seq OWNED BY public.leave_requests.id;


--
-- Name: leave_types; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.leave_types (
    id bigint NOT NULL,
    code character varying(20),
    name character varying(100) NOT NULL,
    description text,
    max_days bigint DEFAULT 30 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


--
-- Name: leave_types_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.leave_types_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: leave_types_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.leave_types_id_seq OWNED BY public.leave_types.id;


--
-- Name: licensing; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.licensing (
    id bigint NOT NULL,
    license_key text,
    os character varying(20) DEFAULT ''::character varying,
    updated_at timestamp with time zone,
    created_at timestamp with time zone,
    deleted_at timestamp with time zone
);


--
-- Name: licensing_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.licensing_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: licensing_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.licensing_id_seq OWNED BY public.licensing.id;


--
-- Name: medical_categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.medical_categories (
    id bigint NOT NULL,
    name character varying(50) NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


--
-- Name: medical_categories_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.medical_categories_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: medical_categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.medical_categories_id_seq OWNED BY public.medical_categories.id;


--
-- Name: out_station_employment; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.out_station_employment (
    id bigint NOT NULL,
    profile_id bigint NOT NULL,
    formation text,
    location text,
    attachment text,
    employment text,
    start_date date,
    end_date date,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


--
-- Name: out_station_employment_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.out_station_employment_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: out_station_employment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.out_station_employment_id_seq OWNED BY public.out_station_employment.id;


--
-- Name: personnel_education; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.personnel_education (
    id bigint NOT NULL,
    personnel_id bigint NOT NULL,
    civ character varying(255),
    civilian_degree character varying(20),
    civilian_specialisation character varying(255),
    mri character varying(20),
    mr_ii character varying(20),
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


--
-- Name: personnel_education_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.personnel_education_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: personnel_education_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.personnel_education_id_seq OWNED BY public.personnel_education.id;


--
-- Name: personnel_profile; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.personnel_profile (
    id bigint NOT NULL,
    army_no character varying(50),
    rank character varying(50),
    name character varying(100),
    dob date,
    doe date,
    service character varying(50),
    honors_awards text,
    med_cat character varying(50),
    recat_date date,
    medical_category_id bigint,
    diagnose text,
    date_of_medical_board date,
    pc_bc character varying(10),
    restriction_due_to_cat text,
    remarks text,
    natural_category character varying(20),
    special_skill text,
    games_level character varying(100),
    present_employment character varying(100),
    planned_employment character varying(100),
    status character varying(50) DEFAULT 'Active'::character varying,
    unit character varying(100),
    nok character varying(150),
    account_number character varying(50),
    pan_card character varying(20),
    aadhar_card character varying(20),
    dsp_account character varying(50),
    email character varying(100),
    phone character varying(20),
    blood_group character varying(10),
    date_of_marriage date,
    photo_url text,
    user_id bigint,
    rank_id bigint,
    platoon_id bigint,
    tradesman_id bigint,
    att_service character varying(50),
    att_specialization character varying(100),
    active_status bigint DEFAULT 1 NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


--
-- Name: personnel_profile_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.personnel_profile_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: personnel_profile_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.personnel_profile_id_seq OWNED BY public.personnel_profile.id;


--
-- Name: personnel_sports; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.personnel_sports (
    id bigint NOT NULL,
    personnel_id bigint NOT NULL,
    name_of_event character varying(255),
    level character varying(100),
    year_of_participation date,
    achievements text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


--
-- Name: personnel_sports_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.personnel_sports_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: personnel_sports_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.personnel_sports_id_seq OWNED BY public.personnel_sports.id;


--
-- Name: platoons; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.platoons (
    id bigint NOT NULL,
    platoon_name character varying(100) NOT NULL,
    company_id bigint NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


--
-- Name: platoons_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.platoons_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: platoons_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.platoons_id_seq OWNED BY public.platoons.id;


--
-- Name: proficiency; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.proficiency (
    id bigint NOT NULL,
    profile_id bigint NOT NULL,
    proficiency_type character varying(20) NOT NULL,
    drone_equipment_id bigint,
    proficiency_level character varying(20),
    flying_hours numeric(10,2),
    trg_cadre character varying(200),
    level character varying(20) NOT NULL,
    duration character varying(100),
    location character varying(200),
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


--
-- Name: proficiency_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.proficiency_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: proficiency_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.proficiency_id_seq OWNED BY public.proficiency.id;


--
-- Name: punishment_offence; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.punishment_offence (
    id bigint NOT NULL,
    profile_id bigint NOT NULL,
    offence text,
    date_of_offence date,
    punishment_awarded text,
    remarks text,
    endorsed boolean,
    section_aa text,
    type_of_entry character varying(50),
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


--
-- Name: punishment_offence_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.punishment_offence_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: punishment_offence_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.punishment_offence_id_seq OWNED BY public.punishment_offence.id;


--
-- Name: rank_categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.rank_categories (
    id bigint NOT NULL,
    name character varying(100) NOT NULL,
    "order" bigint DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


--
-- Name: rank_categories_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.rank_categories_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: rank_categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.rank_categories_id_seq OWNED BY public.rank_categories.id;


--
-- Name: ranks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ranks (
    id bigint NOT NULL,
    name character varying(100) NOT NULL,
    category_id bigint,
    "order" bigint DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


--
-- Name: ranks_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ranks_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ranks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.ranks_id_seq OWNED BY public.ranks.id;


--
-- Name: recommendation; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.recommendation (
    id bigint NOT NULL,
    profile_id bigint,
    recommendation_a text,
    recommendation_b text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


--
-- Name: recommendation_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.recommendation_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: recommendation_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.recommendation_id_seq OWNED BY public.recommendation.id;


--
-- Name: reportees; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reportees (
    id bigint NOT NULL,
    supervisor_id bigint NOT NULL,
    reportee_id bigint NOT NULL,
    status character varying(20) DEFAULT 'Active'::character varying,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


--
-- Name: reportees_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.reportees_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: reportees_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.reportees_id_seq OWNED BY public.reportees.id;


--
-- Name: special_employment_suitability; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.special_employment_suitability (
    id bigint NOT NULL,
    profile_id bigint,
    suitable_for_special_emp_a text,
    suitable_for_special_emp_b text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


--
-- Name: special_employment_suitability_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.special_employment_suitability_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: special_employment_suitability_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.special_employment_suitability_id_seq OWNED BY public.special_employment_suitability.id;


--
-- Name: tradesmen; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tradesmen (
    id bigint NOT NULL,
    trade_name character varying(100) NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


--
-- Name: tradesmen_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.tradesmen_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tradesmen_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.tradesmen_id_seq OWNED BY public.tradesmen.id;


--
-- Name: user_course_mapping; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_course_mapping (
    id bigint NOT NULL,
    profile_id bigint NOT NULL,
    course_id bigint NOT NULL,
    start_date date,
    end_date date,
    completion_date date,
    grade character varying(20),
    remarks text,
    status character varying(20) DEFAULT 'planned'::character varying,
    is_active boolean DEFAULT true,
    certificate_url character varying(500),
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


--
-- Name: user_course_mapping_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.user_course_mapping_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: user_course_mapping_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.user_course_mapping_id_seq OWNED BY public.user_course_mapping.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id bigint NOT NULL,
    army_no character varying(100) NOT NULL,
    password character varying(255),
    role character varying(50) DEFAULT 'user'::character varying,
    password_changed boolean DEFAULT false NOT NULL,
    active_status bigint DEFAULT 1 NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: app_settings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_settings ALTER COLUMN id SET DEFAULT nextval('public.app_settings_id_seq'::regclass);


--
-- Name: attendance id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendance ALTER COLUMN id SET DEFAULT nextval('public.attendance_id_seq'::regclass);


--
-- Name: companies id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.companies ALTER COLUMN id SET DEFAULT nextval('public.companies_id_seq'::regclass);


--
-- Name: company_personnel id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company_personnel ALTER COLUMN id SET DEFAULT nextval('public.company_personnel_id_seq'::regclass);


--
-- Name: course_master id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_master ALTER COLUMN id SET DEFAULT nextval('public.course_master_id_seq'::regclass);


--
-- Name: documents id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documents ALTER COLUMN id SET DEFAULT nextval('public.documents_id_seq'::regclass);


--
-- Name: drone_equipment id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.drone_equipment ALTER COLUMN id SET DEFAULT nextval('public.drone_equipment_id_seq'::regclass);


--
-- Name: ere id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ere ALTER COLUMN id SET DEFAULT nextval('public.ere_id_seq'::regclass);


--
-- Name: family_details id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.family_details ALTER COLUMN id SET DEFAULT nextval('public.family_details_id_seq'::regclass);


--
-- Name: family_problem id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.family_problem ALTER COLUMN id SET DEFAULT nextval('public.family_problem_id_seq'::regclass);


--
-- Name: field_service id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.field_service ALTER COLUMN id SET DEFAULT nextval('public.field_service_id_seq'::regclass);


--
-- Name: foreign_posting id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.foreign_posting ALTER COLUMN id SET DEFAULT nextval('public.foreign_posting_id_seq'::regclass);


--
-- Name: formations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.formations ALTER COLUMN id SET DEFAULT nextval('public.formations_id_seq'::regclass);


--
-- Name: grades id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.grades ALTER COLUMN id SET DEFAULT nextval('public.grades_id_seq'::regclass);


--
-- Name: hospitalisation id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hospitalisation ALTER COLUMN id SET DEFAULT nextval('public.hospitalisation_id_seq'::regclass);


--
-- Name: leave_approvals id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leave_approvals ALTER COLUMN id SET DEFAULT nextval('public.leave_approvals_id_seq'::regclass);


--
-- Name: leave_extensions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leave_extensions ALTER COLUMN id SET DEFAULT nextval('public.leave_extensions_id_seq'::regclass);


--
-- Name: leave_requests id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leave_requests ALTER COLUMN id SET DEFAULT nextval('public.leave_requests_id_seq'::regclass);


--
-- Name: leave_types id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leave_types ALTER COLUMN id SET DEFAULT nextval('public.leave_types_id_seq'::regclass);


--
-- Name: licensing id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.licensing ALTER COLUMN id SET DEFAULT nextval('public.licensing_id_seq'::regclass);


--
-- Name: medical_categories id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.medical_categories ALTER COLUMN id SET DEFAULT nextval('public.medical_categories_id_seq'::regclass);


--
-- Name: out_station_employment id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.out_station_employment ALTER COLUMN id SET DEFAULT nextval('public.out_station_employment_id_seq'::regclass);


--
-- Name: personnel_education id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personnel_education ALTER COLUMN id SET DEFAULT nextval('public.personnel_education_id_seq'::regclass);


--
-- Name: personnel_profile id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personnel_profile ALTER COLUMN id SET DEFAULT nextval('public.personnel_profile_id_seq'::regclass);


--
-- Name: personnel_sports id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personnel_sports ALTER COLUMN id SET DEFAULT nextval('public.personnel_sports_id_seq'::regclass);


--
-- Name: platoons id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.platoons ALTER COLUMN id SET DEFAULT nextval('public.platoons_id_seq'::regclass);


--
-- Name: proficiency id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.proficiency ALTER COLUMN id SET DEFAULT nextval('public.proficiency_id_seq'::regclass);


--
-- Name: punishment_offence id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.punishment_offence ALTER COLUMN id SET DEFAULT nextval('public.punishment_offence_id_seq'::regclass);


--
-- Name: rank_categories id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rank_categories ALTER COLUMN id SET DEFAULT nextval('public.rank_categories_id_seq'::regclass);


--
-- Name: ranks id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ranks ALTER COLUMN id SET DEFAULT nextval('public.ranks_id_seq'::regclass);


--
-- Name: recommendation id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recommendation ALTER COLUMN id SET DEFAULT nextval('public.recommendation_id_seq'::regclass);


--
-- Name: reportees id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reportees ALTER COLUMN id SET DEFAULT nextval('public.reportees_id_seq'::regclass);


--
-- Name: special_employment_suitability id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.special_employment_suitability ALTER COLUMN id SET DEFAULT nextval('public.special_employment_suitability_id_seq'::regclass);


--
-- Name: tradesmen id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tradesmen ALTER COLUMN id SET DEFAULT nextval('public.tradesmen_id_seq'::regclass);


--
-- Name: user_course_mapping id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_course_mapping ALTER COLUMN id SET DEFAULT nextval('public.user_course_mapping_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: app_settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.app_settings (id, key, value, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: attendance; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.attendance (id, user_id, attendance_date, status, check_in_time, check_out_time, remarks, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: companies; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.companies (id, company_name, active_status, created_at, updated_at) FROM stdin;
1	Alpha	1	2026-03-07 18:52:05.260012+05:30	2026-03-07 18:52:05.260012+05:30
2	Bravo	1	2026-03-07 18:52:05.261361+05:30	2026-03-07 18:52:05.261361+05:30
3	Charlie	1	2026-03-07 18:52:05.262023+05:30	2026-03-07 18:52:05.262023+05:30
4	Delta	1	2026-03-07 18:52:05.262641+05:30	2026-03-07 18:52:05.262641+05:30
5	Headquarter	1	2026-03-07 18:52:05.263248+05:30	2026-03-07 18:52:05.263248+05:30
6	Support	1	2026-03-07 18:52:05.263908+05:30	2026-03-07 18:52:05.263908+05:30
\.


--
-- Data for Name: company_personnel; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.company_personnel (id, company_id, personnel_id, role, appointment_date, end_date, status, remarks, appointed_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: course_master; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.course_master (id, course_code, course_title, start_date, end_date, remarks, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: documents; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.documents (id, army_no, document_type, file_name, original_name, file_path, file_size, mime_type, uploaded_by, uploaded_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: drone_equipment; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.drone_equipment (id, equipment_name, created_at, updated_at) FROM stdin;
1	Switch UAV	2026-03-07 18:52:05.324609+05:30	2026-03-07 18:52:05.324609+05:30
2	Q5	2026-03-07 18:52:05.325834+05:30	2026-03-07 18:52:05.325834+05:30
3	Q6	2026-03-07 18:52:05.326441+05:30	2026-03-07 18:52:05.326441+05:30
4	TRINETRA	2026-03-07 18:52:05.327048+05:30	2026-03-07 18:52:05.327048+05:30
5	SPECTRE 2M	2026-03-07 18:52:05.327714+05:30	2026-03-07 18:52:05.327714+05:30
6	SUDARSHAN DRONE	2026-03-07 18:52:05.328513+05:30	2026-03-07 18:52:05.328513+05:30
7	DJI MAVIC AIR 2	2026-03-07 18:52:05.329099+05:30	2026-03-07 18:52:05.329099+05:30
8	DJI NEO 2	2026-03-07 18:52:05.329705+05:30	2026-03-07 18:52:05.329705+05:30
9	DJI AVATA 2	2026-03-07 18:52:05.330329+05:30	2026-03-07 18:52:05.330329+05:30
10	I2I SPECTRUM	2026-03-07 18:52:05.330857+05:30	2026-03-07 18:52:05.330857+05:30
11	LOITERING MUNITION NAGASTRA	2026-03-07 18:52:05.331398+05:30	2026-03-07 18:52:05.331398+05:30
12	CUAS PRABHAL	2026-03-07 18:52:05.33193+05:30	2026-03-07 18:52:05.33193+05:30
\.


--
-- Data for Name: ere; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.ere (id, profile_id, unit, from_date, to_date, planned_ere, remarks, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: family_details; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.family_details (id, profile_id, relationship_type, name, dob, contact_number, pan_card, aadhar_card, account_number, blood_group, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: family_problem; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.family_problem (id, profile_id, problem, remarks, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: field_service; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.field_service (id, profile_id, location, from_date, to_date, remarks, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: foreign_posting; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.foreign_posting (id, profile_id, unit, from_date, to_date, remarks, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: formations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.formations (id, name, parent_id, sort_order, created_at, updated_at) FROM stdin;
1	Guards and Duties	\N	1	2026-03-07 18:52:05.333316+05:30	2026-03-07 18:52:05.333316+05:30
2	AMN GD JASSAI	1	1	2026-03-07 18:52:05.334726+05:30	2026-03-07 18:52:05.334726+05:30
3	MAIN GATE GD JASSAI	1	2	2026-03-07 18:52:05.335461+05:30	2026-03-07 18:52:05.335461+05:30
4	11 COMPO	1	3	2026-03-07 18:52:05.336126+05:30	2026-03-07 18:52:05.336126+05:30
5	41 ASC SUPPLY	1	4	2026-03-07 18:52:05.336904+05:30	2026-03-07 18:52:05.336904+05:30
6	BHAVNAGAR	1	5	2026-03-07 18:52:05.33787+05:30	2026-03-07 18:52:05.33787+05:30
7	SOMNATH TEMPLE	1	6	2026-03-07 18:52:05.338699+05:30	2026-03-07 18:52:05.338699+05:30
8	MCO	1	7	2026-03-07 18:52:05.339408+05:30	2026-03-07 18:52:05.339408+05:30
9	GMP	1	8	2026-03-07 18:52:05.340035+05:30	2026-03-07 18:52:05.340035+05:30
10	BDE HQ	1	9	2026-03-07 18:52:05.340635+05:30	2026-03-07 18:52:05.340635+05:30
11	DIV HQ	1	10	2026-03-07 18:52:05.341235+05:30	2026-03-07 18:52:05.341235+05:30
12	CORP HQ	1	11	2026-03-07 18:52:05.341829+05:30	2026-03-07 18:52:05.341829+05:30
13	COMD HQ	1	12	2026-03-07 18:52:05.34239+05:30	2026-03-07 18:52:05.34239+05:30
14	MES IB	1	13	2026-03-07 18:52:05.342996+05:30	2026-03-07 18:52:05.342996+05:30
15	SOMNATH GATE	1	14	2026-03-07 18:52:05.343567+05:30	2026-03-07 18:52:05.343567+05:30
16	STN HQ	1	15	2026-03-07 18:52:05.344109+05:30	2026-03-07 18:52:05.344109+05:30
17	FTS	\N	2	2026-03-07 18:52:05.344707+05:30	2026-03-07 18:52:05.344707+05:30
18	IN STN DUTIES	\N	3	2026-03-07 18:52:05.345274+05:30	2026-03-07 18:52:05.345274+05:30
19	SDC	18	1	2026-03-07 18:52:05.345764+05:30	2026-03-07 18:52:05.345764+05:30
20	WAR MEMORIAL	18	2	2026-03-07 18:52:05.346286+05:30	2026-03-07 18:52:05.346286+05:30
21	DOAT	18	3	2026-03-07 18:52:05.346858+05:30	2026-03-07 18:52:05.346858+05:30
22	SHREEDHARA STADIUM	18	4	2026-03-07 18:52:05.347427+05:30	2026-03-07 18:52:05.347427+05:30
23	FWC	18	5	2026-03-07 18:52:05.348028+05:30	2026-03-07 18:52:05.348028+05:30
24	MES COMPLAINT CELL	18	6	2026-03-07 18:52:05.348612+05:30	2026-03-07 18:52:05.348612+05:30
25	MES DVR	18	7	2026-03-07 18:52:05.349177+05:30	2026-03-07 18:52:05.349177+05:30
26	TRAILBLAZING AREA	18	8	2026-03-07 18:52:05.349761+05:30	2026-03-07 18:52:05.349761+05:30
27	WOI	18	9	2026-03-07 18:52:05.350385+05:30	2026-03-07 18:52:05.350385+05:30
28	BDE URC	18	10	2026-03-07 18:52:05.350957+05:30	2026-03-07 18:52:05.350957+05:30
29	ATT GRRC	\N	4	2026-03-07 18:52:05.351568+05:30	2026-03-07 18:52:05.351568+05:30
30	ATT OTHER UNITS	\N	5	2026-03-07 18:52:05.352164+05:30	2026-03-07 18:52:05.352164+05:30
31	TD	\N	6	2026-03-07 18:52:05.352746+05:30	2026-03-07 18:52:05.352746+05:30
\.


--
-- Data for Name: grades; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.grades (id, name, description, is_active, created_at, updated_at) FROM stdin;
1	AI		t	2026-03-07 18:52:05.265596+05:30	2026-03-07 18:52:05.265596+05:30
2	A		t	2026-03-07 18:52:05.267472+05:30	2026-03-07 18:52:05.267472+05:30
3	BI		t	2026-03-07 18:52:05.268141+05:30	2026-03-07 18:52:05.268141+05:30
4	B		t	2026-03-07 18:52:05.268823+05:30	2026-03-07 18:52:05.268823+05:30
5	C		t	2026-03-07 18:52:05.269503+05:30	2026-03-07 18:52:05.269503+05:30
6	D		t	2026-03-07 18:52:05.270164+05:30	2026-03-07 18:52:05.270164+05:30
7	F		t	2026-03-07 18:52:05.270775+05:30	2026-03-07 18:52:05.270775+05:30
8	Q		t	2026-03-07 18:52:05.271335+05:30	2026-03-07 18:52:05.271335+05:30
9	QI		t	2026-03-07 18:52:05.271876+05:30	2026-03-07 18:52:05.271876+05:30
10	AXI		t	2026-03-07 18:52:05.272408+05:30	2026-03-07 18:52:05.272408+05:30
11	AY		t	2026-03-07 18:52:05.272933+05:30	2026-03-07 18:52:05.272933+05:30
12	BX		t	2026-03-07 18:52:05.273504+05:30	2026-03-07 18:52:05.273504+05:30
13	BY		t	2026-03-07 18:52:05.274041+05:30	2026-03-07 18:52:05.274041+05:30
14	CX		t	2026-03-07 18:52:05.274568+05:30	2026-03-07 18:52:05.274568+05:30
15	CY		t	2026-03-07 18:52:05.275117+05:30	2026-03-07 18:52:05.275117+05:30
16	best student		t	2026-03-07 18:52:05.275676+05:30	2026-03-07 18:52:05.275676+05:30
17	second best student		t	2026-03-07 18:52:05.276197+05:30	2026-03-07 18:52:05.276197+05:30
\.


--
-- Data for Name: hospitalisation; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.hospitalisation (id, profile_id, date_of_admission, date_of_discharge, diagnosis, medical_category, remarks, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: leave_approvals; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.leave_approvals (id, leave_request_id, approver_id, status, comments, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: leave_extensions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.leave_extensions (id, leave_request_id, original_end_date, new_end_date, extension_days, extension_reason, extended_by, approved_by, status, approval_notes, approved_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: leave_requests; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.leave_requests (id, personnel_id, leave_type_id, supervisor_id, start_date, end_date, total_days, reason, status, rejection_reason, applied_by_admin, admin_id, approved_by, approved_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: leave_types; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.leave_types (id, code, name, description, max_days, is_active, created_at, updated_at) FROM stdin;
1	LT001	Annual Leave	Regular annual leave for personnel	30	t	2026-03-07 18:52:05.254325+05:30	2026-03-07 18:52:05.254325+05:30
2	LT002	Casual Leave	Short-term casual leave for personal matters	10	t	2026-03-07 18:52:05.256117+05:30	2026-03-07 18:52:05.256117+05:30
3	LT003	Sick Leave	Medical leave for illness or health issues	15	t	2026-03-07 18:52:05.256799+05:30	2026-03-07 18:52:05.256799+05:30
4	LT004	Paternity Leave	Leave for new fathers	7	t	2026-03-07 18:52:05.257424+05:30	2026-03-07 18:52:05.257424+05:30
5	LT005	Study Leave	Leave for educational purposes and training	45	t	2026-03-07 18:52:05.258082+05:30	2026-03-07 18:52:05.258082+05:30
6	LT006	Furlough	Extended leave for rest and recreation	60	t	2026-03-07 18:52:05.258842+05:30	2026-03-07 18:52:05.258842+05:30
\.


--
-- Data for Name: licensing; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.licensing (id, license_key, os, updated_at, created_at, deleted_at) FROM stdin;
1	FtvbeAYAn0Et1SyN5FwjiNGc		2026-03-07 18:50:56.149015+05:30	2026-03-07 18:50:36.255064+05:30	\N
\.


--
-- Data for Name: medical_categories; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.medical_categories (id, name, is_active, created_at, updated_at) FROM stdin;
1	S2	t	2026-03-07 18:52:05.277116+05:30	2026-03-07 18:52:05.277116+05:30
2	S2(T-24)	t	2026-03-07 18:52:05.27844+05:30	2026-03-07 18:52:05.27844+05:30
3	S2(P)	t	2026-03-07 18:52:05.279052+05:30	2026-03-07 18:52:05.279052+05:30
4	S3	t	2026-03-07 18:52:05.279717+05:30	2026-03-07 18:52:05.279717+05:30
5	S3(T-24)	t	2026-03-07 18:52:05.280349+05:30	2026-03-07 18:52:05.280349+05:30
6	S3(P)	t	2026-03-07 18:52:05.28097+05:30	2026-03-07 18:52:05.28097+05:30
7	H2	t	2026-03-07 18:52:05.281541+05:30	2026-03-07 18:52:05.281541+05:30
8	H2(T-24)	t	2026-03-07 18:52:05.282107+05:30	2026-03-07 18:52:05.282107+05:30
9	H2(P)	t	2026-03-07 18:52:05.282729+05:30	2026-03-07 18:52:05.282729+05:30
10	H3	t	2026-03-07 18:52:05.283297+05:30	2026-03-07 18:52:05.283297+05:30
11	H3(T-24)	t	2026-03-07 18:52:05.283814+05:30	2026-03-07 18:52:05.283814+05:30
12	H3(P)	t	2026-03-07 18:52:05.284428+05:30	2026-03-07 18:52:05.284428+05:30
13	A2	t	2026-03-07 18:52:05.284945+05:30	2026-03-07 18:52:05.284945+05:30
14	A2(T-24)	t	2026-03-07 18:52:05.285477+05:30	2026-03-07 18:52:05.285477+05:30
15	A2(P)	t	2026-03-07 18:52:05.286118+05:30	2026-03-07 18:52:05.286118+05:30
16	A3	t	2026-03-07 18:52:05.286735+05:30	2026-03-07 18:52:05.286735+05:30
17	A3(T-24)	t	2026-03-07 18:52:05.287367+05:30	2026-03-07 18:52:05.287367+05:30
18	A3(P)	t	2026-03-07 18:52:05.287996+05:30	2026-03-07 18:52:05.287996+05:30
19	P2	t	2026-03-07 18:52:05.288569+05:30	2026-03-07 18:52:05.288569+05:30
20	P2(T-24)	t	2026-03-07 18:52:05.289166+05:30	2026-03-07 18:52:05.289166+05:30
21	P2(P)	t	2026-03-07 18:52:05.289748+05:30	2026-03-07 18:52:05.289748+05:30
22	P3	t	2026-03-07 18:52:05.290289+05:30	2026-03-07 18:52:05.290289+05:30
23	P3(T-24)	t	2026-03-07 18:52:05.290849+05:30	2026-03-07 18:52:05.290849+05:30
24	P3(P)	t	2026-03-07 18:52:05.291391+05:30	2026-03-07 18:52:05.291391+05:30
25	E2	t	2026-03-07 18:52:05.29194+05:30	2026-03-07 18:52:05.29194+05:30
26	E2(T-24)	t	2026-03-07 18:52:05.292458+05:30	2026-03-07 18:52:05.292458+05:30
27	E2(P)	t	2026-03-07 18:52:05.292976+05:30	2026-03-07 18:52:05.292976+05:30
28	E3	t	2026-03-07 18:52:05.293495+05:30	2026-03-07 18:52:05.293495+05:30
29	E3(T-24)	t	2026-03-07 18:52:05.294017+05:30	2026-03-07 18:52:05.294017+05:30
30	E3(P)	t	2026-03-07 18:52:05.294526+05:30	2026-03-07 18:52:05.294526+05:30
\.


--
-- Data for Name: out_station_employment; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.out_station_employment (id, profile_id, formation, location, attachment, employment, start_date, end_date, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: personnel_education; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.personnel_education (id, personnel_id, civ, civilian_degree, civilian_specialisation, mri, mr_ii, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: personnel_profile; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.personnel_profile (id, army_no, rank, name, dob, doe, service, honors_awards, med_cat, recat_date, medical_category_id, diagnose, date_of_medical_board, pc_bc, restriction_due_to_cat, remarks, natural_category, special_skill, games_level, present_employment, planned_employment, status, unit, nok, account_number, pan_card, aadhar_card, dsp_account, email, phone, blood_group, date_of_marriage, photo_url, user_id, rank_id, platoon_id, tradesman_id, att_service, att_specialization, active_status, created_at, updated_at) FROM stdin;
1	ADMIN	General	Super Admin	1980-01-01	2000-02-02				\N	\N		\N									Active								1111111111		\N		1	\N	\N	\N			1	2026-03-07 18:48:41.875479+05:30	2026-03-07 18:48:41.950512+05:30
\.


--
-- Data for Name: personnel_sports; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.personnel_sports (id, personnel_id, name_of_event, level, year_of_participation, achievements, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: platoons; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.platoons (id, platoon_name, company_id, created_at, updated_at) FROM stdin;
1	Platoon 1	1	2026-03-07 18:52:05.296406+05:30	2026-03-07 18:52:05.296406+05:30
2	Platoon 2	1	2026-03-07 18:52:05.297478+05:30	2026-03-07 18:52:05.297478+05:30
3	Platoon 3	1	2026-03-07 18:52:05.298135+05:30	2026-03-07 18:52:05.298135+05:30
4	Coy HQ	1	2026-03-07 18:52:05.29884+05:30	2026-03-07 18:52:05.29884+05:30
5	MMG Sec	1	2026-03-07 18:52:05.299515+05:30	2026-03-07 18:52:05.299515+05:30
6	AGS Sec	1	2026-03-07 18:52:05.300234+05:30	2026-03-07 18:52:05.300234+05:30
7	Platoon 4	2	2026-03-07 18:52:05.300876+05:30	2026-03-07 18:52:05.300876+05:30
8	Platoon 5	2	2026-03-07 18:52:05.301445+05:30	2026-03-07 18:52:05.301445+05:30
9	Platoon 6	2	2026-03-07 18:52:05.302013+05:30	2026-03-07 18:52:05.302013+05:30
10	Coy HQ	2	2026-03-07 18:52:05.302557+05:30	2026-03-07 18:52:05.302557+05:30
11	MMG Sec	2	2026-03-07 18:52:05.303134+05:30	2026-03-07 18:52:05.303134+05:30
12	AGS Sec	2	2026-03-07 18:52:05.303668+05:30	2026-03-07 18:52:05.303668+05:30
13	Platoon 7	3	2026-03-07 18:52:05.304192+05:30	2026-03-07 18:52:05.304192+05:30
14	Platoon 8	3	2026-03-07 18:52:05.304724+05:30	2026-03-07 18:52:05.304724+05:30
15	Platoon 9	3	2026-03-07 18:52:05.30528+05:30	2026-03-07 18:52:05.30528+05:30
16	Coy HQ	3	2026-03-07 18:52:05.305805+05:30	2026-03-07 18:52:05.305805+05:30
17	MMG Sec	3	2026-03-07 18:52:05.306311+05:30	2026-03-07 18:52:05.306311+05:30
18	AGS Sec	3	2026-03-07 18:52:05.306822+05:30	2026-03-07 18:52:05.306822+05:30
19	Platoon 10	4	2026-03-07 18:52:05.307348+05:30	2026-03-07 18:52:05.307348+05:30
20	Platoon 11	4	2026-03-07 18:52:05.307897+05:30	2026-03-07 18:52:05.307897+05:30
21	Platoon 12	4	2026-03-07 18:52:05.308418+05:30	2026-03-07 18:52:05.308418+05:30
22	Coy HQ	4	2026-03-07 18:52:05.308943+05:30	2026-03-07 18:52:05.308943+05:30
23	MMG Sec	4	2026-03-07 18:52:05.309452+05:30	2026-03-07 18:52:05.309452+05:30
24	AGS Sec	4	2026-03-07 18:52:05.309978+05:30	2026-03-07 18:52:05.309978+05:30
25	Battalion HQ	5	2026-03-07 18:52:05.310484+05:30	2026-03-07 18:52:05.310484+05:30
26	Transport Platoon	5	2026-03-07 18:52:05.311011+05:30	2026-03-07 18:52:05.311011+05:30
27	Administration Platoon	5	2026-03-07 18:52:05.31151+05:30	2026-03-07 18:52:05.31151+05:30
28	Ashni Platoon	5	2026-03-07 18:52:05.312011+05:30	2026-03-07 18:52:05.312011+05:30
29	Ghatak Platoon	6	2026-03-07 18:52:05.312497+05:30	2026-03-07 18:52:05.312497+05:30
30	Assault Platoon	6	2026-03-07 18:52:05.31307+05:30	2026-03-07 18:52:05.31307+05:30
31	Mortar Platoon	6	2026-03-07 18:52:05.313626+05:30	2026-03-07 18:52:05.313626+05:30
32	Anti-Tank Platoon	6	2026-03-07 18:52:05.314131+05:30	2026-03-07 18:52:05.314131+05:30
33	Signals Platoon	6	2026-03-07 18:52:05.314684+05:30	2026-03-07 18:52:05.314684+05:30
34	Recce & Surveillance Platoon	6	2026-03-07 18:52:05.315209+05:30	2026-03-07 18:52:05.315209+05:30
\.


--
-- Data for Name: proficiency; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.proficiency (id, profile_id, proficiency_type, drone_equipment_id, proficiency_level, flying_hours, trg_cadre, level, duration, location, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: punishment_offence; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.punishment_offence (id, profile_id, offence, date_of_offence, punishment_awarded, remarks, endorsed, section_aa, type_of_entry, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: rank_categories; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.rank_categories (id, name, "order", is_active, created_at, updated_at) FROM stdin;
1	Officers	1	t	2026-03-07 18:52:05.237518+05:30	2026-03-07 18:52:05.237518+05:30
2	Junior Commissioned Officers (JCO)	2	t	2026-03-07 18:52:05.240718+05:30	2026-03-07 18:52:05.240718+05:30
3	Other Ranks (OR)	3	t	2026-03-07 18:52:05.241468+05:30	2026-03-07 18:52:05.241468+05:30
\.


--
-- Data for Name: ranks; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.ranks (id, name, category_id, "order", is_active, created_at, updated_at) FROM stdin;
1	Havaldar	3	1	t	2026-03-07 18:52:05.243369+05:30	2026-03-07 18:52:05.243369+05:30
2	Lance Havaldar	3	2	t	2026-03-07 18:52:05.244696+05:30	2026-03-07 18:52:05.244696+05:30
3	Naik	3	3	t	2026-03-07 18:52:05.245527+05:30	2026-03-07 18:52:05.245527+05:30
4	Lance Naik	3	4	t	2026-03-07 18:52:05.246231+05:30	2026-03-07 18:52:05.246231+05:30
5	Rifleman	3	5	t	2026-03-07 18:52:05.246913+05:30	2026-03-07 18:52:05.246913+05:30
6	Agniveer	3	6	t	2026-03-07 18:52:05.247656+05:30	2026-03-07 18:52:05.247656+05:30
7	Subedar Major	2	1	t	2026-03-07 18:52:05.248516+05:30	2026-03-07 18:52:05.248516+05:30
8	Subedar	2	2	t	2026-03-07 18:52:05.249199+05:30	2026-03-07 18:52:05.249199+05:30
9	Naib Subedar	2	3	t	2026-03-07 18:52:05.24987+05:30	2026-03-07 18:52:05.24987+05:30
10	Colonel	1	1	t	2026-03-07 18:52:05.250491+05:30	2026-03-07 18:52:05.250491+05:30
11	Lieutenant Colonel	1	2	t	2026-03-07 18:52:05.251106+05:30	2026-03-07 18:52:05.251106+05:30
12	Major	1	3	t	2026-03-07 18:52:05.251692+05:30	2026-03-07 18:52:05.251692+05:30
13	Captain	1	4	t	2026-03-07 18:52:05.252305+05:30	2026-03-07 18:52:05.252305+05:30
14	Lieutenant	1	5	t	2026-03-07 18:52:05.252928+05:30	2026-03-07 18:52:05.252928+05:30
\.


--
-- Data for Name: recommendation; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.recommendation (id, profile_id, recommendation_a, recommendation_b, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: reportees; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.reportees (id, supervisor_id, reportee_id, status, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: special_employment_suitability; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.special_employment_suitability (id, profile_id, suitable_for_special_emp_a, suitable_for_special_emp_b, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: tradesmen; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.tradesmen (id, trade_name, created_at, updated_at) FROM stdin;
1	Clk (SD)	2026-03-07 18:52:05.316328+05:30	2026-03-07 18:52:05.316328+05:30
2	Community Chef	2026-03-07 18:52:05.317507+05:30	2026-03-07 18:52:05.317507+05:30
3	Tailor	2026-03-07 18:52:05.318133+05:30	2026-03-07 18:52:05.318133+05:30
4	ER	2026-03-07 18:52:05.318737+05:30	2026-03-07 18:52:05.318737+05:30
5	Housekeeper	2026-03-07 18:52:05.319471+05:30	2026-03-07 18:52:05.319471+05:30
6	Dresser	2026-03-07 18:52:05.320096+05:30	2026-03-07 18:52:05.320096+05:30
7	Steward	2026-03-07 18:52:05.320639+05:30	2026-03-07 18:52:05.320639+05:30
8	Artisan	2026-03-07 18:52:05.321154+05:30	2026-03-07 18:52:05.321154+05:30
9	Painter	2026-03-07 18:52:05.321727+05:30	2026-03-07 18:52:05.321727+05:30
10	Washerman	2026-03-07 18:52:05.322278+05:30	2026-03-07 18:52:05.322278+05:30
11	Mess Keeper	2026-03-07 18:52:05.32283+05:30	2026-03-07 18:52:05.32283+05:30
12	Mess Chef	2026-03-07 18:52:05.323431+05:30	2026-03-07 18:52:05.323431+05:30
\.


--
-- Data for Name: user_course_mapping; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_course_mapping (id, profile_id, course_id, start_date, end_date, completion_date, grade, remarks, status, is_active, certificate_url, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, army_no, password, role, password_changed, active_status, created_at, updated_at) FROM stdin;
1	ADMIN	$2a$10$nQhgFp676DQKFnpj/4TPE.nYHFJ90MazAwY3/s/DReS4.PlcnoiKi	admin	f	1	2026-03-07 18:48:41.94955+05:30	2026-03-07 18:48:41.94955+05:30
\.


--
-- Name: app_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.app_settings_id_seq', 1, false);


--
-- Name: attendance_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.attendance_id_seq', 1, false);


--
-- Name: companies_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.companies_id_seq', 6, true);


--
-- Name: company_personnel_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.company_personnel_id_seq', 1, false);


--
-- Name: course_master_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.course_master_id_seq', 1, false);


--
-- Name: documents_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.documents_id_seq', 1, false);


--
-- Name: drone_equipment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.drone_equipment_id_seq', 12, true);


--
-- Name: ere_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.ere_id_seq', 1, false);


--
-- Name: family_details_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.family_details_id_seq', 1, false);


--
-- Name: family_problem_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.family_problem_id_seq', 1, false);


--
-- Name: field_service_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.field_service_id_seq', 1, false);


--
-- Name: foreign_posting_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.foreign_posting_id_seq', 1, false);


--
-- Name: formations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.formations_id_seq', 31, true);


--
-- Name: grades_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.grades_id_seq', 17, true);


--
-- Name: hospitalisation_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.hospitalisation_id_seq', 1, false);


--
-- Name: leave_approvals_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.leave_approvals_id_seq', 1, false);


--
-- Name: leave_extensions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.leave_extensions_id_seq', 1, false);


--
-- Name: leave_requests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.leave_requests_id_seq', 1, false);


--
-- Name: leave_types_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.leave_types_id_seq', 6, true);


--
-- Name: licensing_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.licensing_id_seq', 1, true);


--
-- Name: medical_categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.medical_categories_id_seq', 30, true);


--
-- Name: out_station_employment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.out_station_employment_id_seq', 1, false);


--
-- Name: personnel_education_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.personnel_education_id_seq', 1, false);


--
-- Name: personnel_profile_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.personnel_profile_id_seq', 1, true);


--
-- Name: personnel_sports_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.personnel_sports_id_seq', 1, false);


--
-- Name: platoons_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.platoons_id_seq', 34, true);


--
-- Name: proficiency_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.proficiency_id_seq', 1, false);


--
-- Name: punishment_offence_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.punishment_offence_id_seq', 1, false);


--
-- Name: rank_categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.rank_categories_id_seq', 3, true);


--
-- Name: ranks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.ranks_id_seq', 14, true);


--
-- Name: recommendation_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.recommendation_id_seq', 1, false);


--
-- Name: reportees_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.reportees_id_seq', 1, false);


--
-- Name: special_employment_suitability_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.special_employment_suitability_id_seq', 1, false);


--
-- Name: tradesmen_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.tradesmen_id_seq', 12, true);


--
-- Name: user_course_mapping_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.user_course_mapping_id_seq', 1, false);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.users_id_seq', 1, true);


--
-- Name: app_settings app_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_settings
    ADD CONSTRAINT app_settings_pkey PRIMARY KEY (id);


--
-- Name: attendance attendance_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT attendance_pkey PRIMARY KEY (id);


--
-- Name: companies companies_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_pkey PRIMARY KEY (id);


--
-- Name: company_personnel company_personnel_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company_personnel
    ADD CONSTRAINT company_personnel_pkey PRIMARY KEY (id);


--
-- Name: course_master course_master_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_master
    ADD CONSTRAINT course_master_pkey PRIMARY KEY (id);


--
-- Name: documents documents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_pkey PRIMARY KEY (id);


--
-- Name: drone_equipment drone_equipment_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.drone_equipment
    ADD CONSTRAINT drone_equipment_pkey PRIMARY KEY (id);


--
-- Name: ere ere_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ere
    ADD CONSTRAINT ere_pkey PRIMARY KEY (id);


--
-- Name: family_details family_details_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.family_details
    ADD CONSTRAINT family_details_pkey PRIMARY KEY (id);


--
-- Name: family_problem family_problem_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.family_problem
    ADD CONSTRAINT family_problem_pkey PRIMARY KEY (id);


--
-- Name: field_service field_service_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.field_service
    ADD CONSTRAINT field_service_pkey PRIMARY KEY (id);


--
-- Name: foreign_posting foreign_posting_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.foreign_posting
    ADD CONSTRAINT foreign_posting_pkey PRIMARY KEY (id);


--
-- Name: formations formations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.formations
    ADD CONSTRAINT formations_pkey PRIMARY KEY (id);


--
-- Name: grades grades_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.grades
    ADD CONSTRAINT grades_pkey PRIMARY KEY (id);


--
-- Name: hospitalisation hospitalisation_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hospitalisation
    ADD CONSTRAINT hospitalisation_pkey PRIMARY KEY (id);


--
-- Name: leave_approvals leave_approvals_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leave_approvals
    ADD CONSTRAINT leave_approvals_pkey PRIMARY KEY (id);


--
-- Name: leave_extensions leave_extensions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leave_extensions
    ADD CONSTRAINT leave_extensions_pkey PRIMARY KEY (id);


--
-- Name: leave_requests leave_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leave_requests
    ADD CONSTRAINT leave_requests_pkey PRIMARY KEY (id);


--
-- Name: leave_types leave_types_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leave_types
    ADD CONSTRAINT leave_types_pkey PRIMARY KEY (id);


--
-- Name: licensing licensing_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.licensing
    ADD CONSTRAINT licensing_pkey PRIMARY KEY (id);


--
-- Name: medical_categories medical_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.medical_categories
    ADD CONSTRAINT medical_categories_pkey PRIMARY KEY (id);


--
-- Name: out_station_employment out_station_employment_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.out_station_employment
    ADD CONSTRAINT out_station_employment_pkey PRIMARY KEY (id);


--
-- Name: personnel_education personnel_education_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personnel_education
    ADD CONSTRAINT personnel_education_pkey PRIMARY KEY (id);


--
-- Name: personnel_profile personnel_profile_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personnel_profile
    ADD CONSTRAINT personnel_profile_pkey PRIMARY KEY (id);


--
-- Name: personnel_sports personnel_sports_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personnel_sports
    ADD CONSTRAINT personnel_sports_pkey PRIMARY KEY (id);


--
-- Name: platoons platoons_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.platoons
    ADD CONSTRAINT platoons_pkey PRIMARY KEY (id);


--
-- Name: proficiency proficiency_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.proficiency
    ADD CONSTRAINT proficiency_pkey PRIMARY KEY (id);


--
-- Name: punishment_offence punishment_offence_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.punishment_offence
    ADD CONSTRAINT punishment_offence_pkey PRIMARY KEY (id);


--
-- Name: rank_categories rank_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rank_categories
    ADD CONSTRAINT rank_categories_pkey PRIMARY KEY (id);


--
-- Name: ranks ranks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ranks
    ADD CONSTRAINT ranks_pkey PRIMARY KEY (id);


--
-- Name: recommendation recommendation_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recommendation
    ADD CONSTRAINT recommendation_pkey PRIMARY KEY (id);


--
-- Name: reportees reportees_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reportees
    ADD CONSTRAINT reportees_pkey PRIMARY KEY (id);


--
-- Name: special_employment_suitability special_employment_suitability_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.special_employment_suitability
    ADD CONSTRAINT special_employment_suitability_pkey PRIMARY KEY (id);


--
-- Name: tradesmen tradesmen_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tradesmen
    ADD CONSTRAINT tradesmen_pkey PRIMARY KEY (id);


--
-- Name: user_course_mapping user_course_mapping_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_course_mapping
    ADD CONSTRAINT user_course_mapping_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: idx_app_settings_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_app_settings_deleted_at ON public.app_settings USING btree (deleted_at);


--
-- Name: idx_app_settings_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_app_settings_key ON public.app_settings USING btree (key);


--
-- Name: idx_attendance_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_attendance_user_id ON public.attendance USING btree (user_id);


--
-- Name: idx_companies_company_name; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_companies_company_name ON public.companies USING btree (company_name);


--
-- Name: idx_company_personnel_appointed_by; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_company_personnel_appointed_by ON public.company_personnel USING btree (appointed_by);


--
-- Name: idx_company_personnel_company_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_company_personnel_company_id ON public.company_personnel USING btree (company_id);


--
-- Name: idx_company_personnel_personnel_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_company_personnel_personnel_id ON public.company_personnel USING btree (personnel_id);


--
-- Name: idx_documents_army_no; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_documents_army_no ON public.documents USING btree (army_no);


--
-- Name: idx_documents_uploaded_by; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_documents_uploaded_by ON public.documents USING btree (uploaded_by);


--
-- Name: idx_drone_equipment_equipment_name; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_drone_equipment_equipment_name ON public.drone_equipment USING btree (equipment_name);


--
-- Name: idx_ere_profile_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ere_profile_id ON public.ere USING btree (profile_id);


--
-- Name: idx_family_details_profile_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_family_details_profile_id ON public.family_details USING btree (profile_id);


--
-- Name: idx_family_problem_profile_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_family_problem_profile_id ON public.family_problem USING btree (profile_id);


--
-- Name: idx_field_service_profile_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_field_service_profile_id ON public.field_service USING btree (profile_id);


--
-- Name: idx_foreign_posting_profile_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_foreign_posting_profile_id ON public.foreign_posting USING btree (profile_id);


--
-- Name: idx_formations_parent_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_formations_parent_id ON public.formations USING btree (parent_id);


--
-- Name: idx_grades_name; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_grades_name ON public.grades USING btree (name);


--
-- Name: idx_hospitalisation_profile_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_hospitalisation_profile_id ON public.hospitalisation USING btree (profile_id);


--
-- Name: idx_leave_approvals_approver_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_leave_approvals_approver_id ON public.leave_approvals USING btree (approver_id);


--
-- Name: idx_leave_approvals_leave_request_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_leave_approvals_leave_request_id ON public.leave_approvals USING btree (leave_request_id);


--
-- Name: idx_leave_extensions_approved_by; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_leave_extensions_approved_by ON public.leave_extensions USING btree (approved_by);


--
-- Name: idx_leave_extensions_extended_by; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_leave_extensions_extended_by ON public.leave_extensions USING btree (extended_by);


--
-- Name: idx_leave_extensions_leave_request_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_leave_extensions_leave_request_id ON public.leave_extensions USING btree (leave_request_id);


--
-- Name: idx_leave_requests_admin_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_leave_requests_admin_id ON public.leave_requests USING btree (admin_id);


--
-- Name: idx_leave_requests_approved_by; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_leave_requests_approved_by ON public.leave_requests USING btree (approved_by);


--
-- Name: idx_leave_requests_leave_type_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_leave_requests_leave_type_id ON public.leave_requests USING btree (leave_type_id);


--
-- Name: idx_leave_requests_personnel_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_leave_requests_personnel_id ON public.leave_requests USING btree (personnel_id);


--
-- Name: idx_leave_requests_supervisor_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_leave_requests_supervisor_id ON public.leave_requests USING btree (supervisor_id);


--
-- Name: idx_leave_types_code; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_leave_types_code ON public.leave_types USING btree (code);


--
-- Name: idx_leave_types_name; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_leave_types_name ON public.leave_types USING btree (name);


--
-- Name: idx_licensing_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_licensing_deleted_at ON public.licensing USING btree (deleted_at);


--
-- Name: idx_medical_categories_name; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_medical_categories_name ON public.medical_categories USING btree (name);


--
-- Name: idx_out_station_employment_profile_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_out_station_employment_profile_id ON public.out_station_employment USING btree (profile_id);


--
-- Name: idx_personnel_education_personnel_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_personnel_education_personnel_id ON public.personnel_education USING btree (personnel_id);


--
-- Name: idx_personnel_profile_army_no; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_personnel_profile_army_no ON public.personnel_profile USING btree (army_no);


--
-- Name: idx_personnel_profile_medical_category_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_personnel_profile_medical_category_id ON public.personnel_profile USING btree (medical_category_id);


--
-- Name: idx_personnel_profile_platoon_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_personnel_profile_platoon_id ON public.personnel_profile USING btree (platoon_id);


--
-- Name: idx_personnel_profile_rank_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_personnel_profile_rank_id ON public.personnel_profile USING btree (rank_id);


--
-- Name: idx_personnel_profile_tradesman_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_personnel_profile_tradesman_id ON public.personnel_profile USING btree (tradesman_id);


--
-- Name: idx_personnel_profile_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_personnel_profile_user_id ON public.personnel_profile USING btree (user_id);


--
-- Name: idx_personnel_sports_personnel_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_personnel_sports_personnel_id ON public.personnel_sports USING btree (personnel_id);


--
-- Name: idx_platoons_company_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_platoons_company_id ON public.platoons USING btree (company_id);


--
-- Name: idx_proficiency_drone_equipment_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_proficiency_drone_equipment_id ON public.proficiency USING btree (drone_equipment_id);


--
-- Name: idx_proficiency_profile_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_proficiency_profile_id ON public.proficiency USING btree (profile_id);


--
-- Name: idx_punishment_offence_profile_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_punishment_offence_profile_id ON public.punishment_offence USING btree (profile_id);


--
-- Name: idx_rank_categories_name; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_rank_categories_name ON public.rank_categories USING btree (name);


--
-- Name: idx_ranks_category_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ranks_category_id ON public.ranks USING btree (category_id);


--
-- Name: idx_ranks_name; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_ranks_name ON public.ranks USING btree (name);


--
-- Name: idx_recommendation_profile_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_recommendation_profile_id ON public.recommendation USING btree (profile_id);


--
-- Name: idx_reportees_reportee_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reportees_reportee_id ON public.reportees USING btree (reportee_id);


--
-- Name: idx_reportees_supervisor_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reportees_supervisor_id ON public.reportees USING btree (supervisor_id);


--
-- Name: idx_special_employment_suitability_profile_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_special_employment_suitability_profile_id ON public.special_employment_suitability USING btree (profile_id);


--
-- Name: idx_tradesmen_trade_name; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_tradesmen_trade_name ON public.tradesmen USING btree (trade_name);


--
-- Name: idx_user_course_mapping_course_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_course_mapping_course_id ON public.user_course_mapping USING btree (course_id);


--
-- Name: idx_user_course_mapping_profile_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_course_mapping_profile_id ON public.user_course_mapping USING btree (profile_id);


--
-- Name: idx_users_army_no; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_users_army_no ON public.users USING btree (army_no);


--
-- Name: attendance fk_attendance_user; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT fk_attendance_user FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: company_personnel fk_companies_company_personnel; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company_personnel
    ADD CONSTRAINT fk_companies_company_personnel FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: company_personnel fk_company_personnel_appointed_by_user; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company_personnel
    ADD CONSTRAINT fk_company_personnel_appointed_by_user FOREIGN KEY (appointed_by) REFERENCES public.users(id);


--
-- Name: documents fk_documents_uploader; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT fk_documents_uploader FOREIGN KEY (uploaded_by) REFERENCES public.users(id);


--
-- Name: family_details fk_family_details_profile; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.family_details
    ADD CONSTRAINT fk_family_details_profile FOREIGN KEY (profile_id) REFERENCES public.personnel_profile(id);


--
-- Name: formations fk_formations_sub_formations; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.formations
    ADD CONSTRAINT fk_formations_sub_formations FOREIGN KEY (parent_id) REFERENCES public.formations(id);


--
-- Name: hospitalisation fk_hospitalisation_profile; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hospitalisation
    ADD CONSTRAINT fk_hospitalisation_profile FOREIGN KEY (profile_id) REFERENCES public.personnel_profile(id) ON DELETE CASCADE;


--
-- Name: leave_approvals fk_leave_approvals_approver; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leave_approvals
    ADD CONSTRAINT fk_leave_approvals_approver FOREIGN KEY (approver_id) REFERENCES public.personnel_profile(id);


--
-- Name: leave_approvals fk_leave_approvals_leave_request; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leave_approvals
    ADD CONSTRAINT fk_leave_approvals_leave_request FOREIGN KEY (leave_request_id) REFERENCES public.leave_requests(id);


--
-- Name: leave_extensions fk_leave_extensions_approved_by_user; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leave_extensions
    ADD CONSTRAINT fk_leave_extensions_approved_by_user FOREIGN KEY (approved_by) REFERENCES public.users(id);


--
-- Name: leave_extensions fk_leave_extensions_extended_by_user; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leave_extensions
    ADD CONSTRAINT fk_leave_extensions_extended_by_user FOREIGN KEY (extended_by) REFERENCES public.users(id);


--
-- Name: leave_requests fk_leave_requests_admin; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leave_requests
    ADD CONSTRAINT fk_leave_requests_admin FOREIGN KEY (admin_id) REFERENCES public.users(id);


--
-- Name: leave_requests fk_leave_requests_approved_by_profile; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leave_requests
    ADD CONSTRAINT fk_leave_requests_approved_by_profile FOREIGN KEY (approved_by) REFERENCES public.personnel_profile(id);


--
-- Name: leave_extensions fk_leave_requests_extensions; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leave_extensions
    ADD CONSTRAINT fk_leave_requests_extensions FOREIGN KEY (leave_request_id) REFERENCES public.leave_requests(id);


--
-- Name: leave_requests fk_leave_requests_leave_type; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leave_requests
    ADD CONSTRAINT fk_leave_requests_leave_type FOREIGN KEY (leave_type_id) REFERENCES public.leave_types(id);


--
-- Name: leave_requests fk_leave_requests_personnel; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leave_requests
    ADD CONSTRAINT fk_leave_requests_personnel FOREIGN KEY (personnel_id) REFERENCES public.personnel_profile(id);


--
-- Name: leave_requests fk_leave_requests_supervisor; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leave_requests
    ADD CONSTRAINT fk_leave_requests_supervisor FOREIGN KEY (supervisor_id) REFERENCES public.personnel_profile(id);


--
-- Name: personnel_profile fk_medical_categories_personnel_profiles; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personnel_profile
    ADD CONSTRAINT fk_medical_categories_personnel_profiles FOREIGN KEY (medical_category_id) REFERENCES public.medical_categories(id);


--
-- Name: out_station_employment fk_out_station_employment_profile; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.out_station_employment
    ADD CONSTRAINT fk_out_station_employment_profile FOREIGN KEY (profile_id) REFERENCES public.personnel_profile(id) ON DELETE CASCADE;


--
-- Name: company_personnel fk_personnel_profile_company_personnel; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company_personnel
    ADD CONSTRAINT fk_personnel_profile_company_personnel FOREIGN KEY (personnel_id) REFERENCES public.personnel_profile(id);


--
-- Name: ere fk_personnel_profile_e_res; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ere
    ADD CONSTRAINT fk_personnel_profile_e_res FOREIGN KEY (profile_id) REFERENCES public.personnel_profile(id);


--
-- Name: personnel_education fk_personnel_profile_education; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personnel_education
    ADD CONSTRAINT fk_personnel_profile_education FOREIGN KEY (personnel_id) REFERENCES public.personnel_profile(id);


--
-- Name: family_problem fk_personnel_profile_family_problems; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.family_problem
    ADD CONSTRAINT fk_personnel_profile_family_problems FOREIGN KEY (profile_id) REFERENCES public.personnel_profile(id);


--
-- Name: field_service fk_personnel_profile_field_services; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.field_service
    ADD CONSTRAINT fk_personnel_profile_field_services FOREIGN KEY (profile_id) REFERENCES public.personnel_profile(id);


--
-- Name: foreign_posting fk_personnel_profile_foreign_postings; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.foreign_posting
    ADD CONSTRAINT fk_personnel_profile_foreign_postings FOREIGN KEY (profile_id) REFERENCES public.personnel_profile(id);


--
-- Name: personnel_profile fk_personnel_profile_platoon; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personnel_profile
    ADD CONSTRAINT fk_personnel_profile_platoon FOREIGN KEY (platoon_id) REFERENCES public.platoons(id);


--
-- Name: punishment_offence fk_personnel_profile_punishment_offences; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.punishment_offence
    ADD CONSTRAINT fk_personnel_profile_punishment_offences FOREIGN KEY (profile_id) REFERENCES public.personnel_profile(id);


--
-- Name: personnel_profile fk_personnel_profile_rank_info; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personnel_profile
    ADD CONSTRAINT fk_personnel_profile_rank_info FOREIGN KEY (rank_id) REFERENCES public.ranks(id);


--
-- Name: personnel_profile fk_personnel_profile_tradesman; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personnel_profile
    ADD CONSTRAINT fk_personnel_profile_tradesman FOREIGN KEY (tradesman_id) REFERENCES public.tradesmen(id);


--
-- Name: personnel_sports fk_personnel_sports_personnel; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personnel_sports
    ADD CONSTRAINT fk_personnel_sports_personnel FOREIGN KEY (personnel_id) REFERENCES public.personnel_profile(id);


--
-- Name: platoons fk_platoons_company; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.platoons
    ADD CONSTRAINT fk_platoons_company FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: proficiency fk_proficiency_drone_equipment; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.proficiency
    ADD CONSTRAINT fk_proficiency_drone_equipment FOREIGN KEY (drone_equipment_id) REFERENCES public.drone_equipment(id);


--
-- Name: proficiency fk_proficiency_profile; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.proficiency
    ADD CONSTRAINT fk_proficiency_profile FOREIGN KEY (profile_id) REFERENCES public.personnel_profile(id);


--
-- Name: ranks fk_rank_categories_ranks; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ranks
    ADD CONSTRAINT fk_rank_categories_ranks FOREIGN KEY (category_id) REFERENCES public.rank_categories(id);


--
-- Name: recommendation fk_recommendation_profile; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recommendation
    ADD CONSTRAINT fk_recommendation_profile FOREIGN KEY (profile_id) REFERENCES public.personnel_profile(id);


--
-- Name: reportees fk_reportees_reportee_profile; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reportees
    ADD CONSTRAINT fk_reportees_reportee_profile FOREIGN KEY (reportee_id) REFERENCES public.personnel_profile(id);


--
-- Name: reportees fk_reportees_supervisor; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reportees
    ADD CONSTRAINT fk_reportees_supervisor FOREIGN KEY (supervisor_id) REFERENCES public.personnel_profile(id);


--
-- Name: special_employment_suitability fk_special_employment_suitability_profile; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.special_employment_suitability
    ADD CONSTRAINT fk_special_employment_suitability_profile FOREIGN KEY (profile_id) REFERENCES public.personnel_profile(id);


--
-- Name: user_course_mapping fk_user_course_mapping_course; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_course_mapping
    ADD CONSTRAINT fk_user_course_mapping_course FOREIGN KEY (course_id) REFERENCES public.course_master(id);


--
-- Name: user_course_mapping fk_user_course_mapping_profile; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_course_mapping
    ADD CONSTRAINT fk_user_course_mapping_profile FOREIGN KEY (profile_id) REFERENCES public.personnel_profile(id);


--
-- Name: personnel_profile fk_users_profile; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personnel_profile
    ADD CONSTRAINT fk_users_profile FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- PostgreSQL database dump complete
--

\unrestrict JYwupmlyqcykNl9qtYDHuhv1YjA3BHqpH0KcVj9Nme7VBAzDwaeGxOrc6ZkHI1G

