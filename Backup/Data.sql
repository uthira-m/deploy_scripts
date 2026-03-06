--
-- PostgreSQL database dump
--

\restrict BZObq9zICfnjYDex9fniHfefTE1K4fUeoXYOrmHH8ARt4H81iQPRScwjuotuJ2J

-- Dumped from database version 14.20 (Ubuntu 14.20-1.pgdg24.04+1)
-- Dumped by pg_dump version 14.20 (Ubuntu 14.20-1.pgdg24.04+1)

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

--
-- Name: attendance_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.attendance_status AS ENUM (
    'Present',
    'Absent',
    'Leave',
    'Half-Day'
);


--
-- Name: document_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.document_type AS ENUM (
    'payslip',
    'form16'
);


--
-- Name: enum_attendance_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_attendance_status AS ENUM (
    'Present',
    'Absent',
    'Leave',
    'Half-Day'
);


--
-- Name: enum_company_personnel_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_company_personnel_role AS ENUM (
    'Commander',
    'Second-in-Command',
    'Company Sergeant Major',
    'Quartermaster',
    'Signaller',
    'Other'
);


--
-- Name: enum_company_personnel_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_company_personnel_status AS ENUM (
    'Active',
    'Inactive',
    'Transferred',
    'Retired'
);


--
-- Name: enum_documents_document_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_documents_document_type AS ENUM (
    'payslip',
    'form16'
);


--
-- Name: enum_family_details_relationship_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_family_details_relationship_type AS ENUM (
    'father',
    'mother',
    'spouse',
    'child1',
    'child2',
    'child3',
    'child4'
);


--
-- Name: enum_leave_approvals_action; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_leave_approvals_action AS ENUM (
    'approve',
    'reject'
);


--
-- Name: enum_leave_extensions_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_leave_extensions_status AS ENUM (
    'pending',
    'approved',
    'rejected'
);


--
-- Name: enum_leave_requests_leave_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_leave_requests_leave_type AS ENUM (
    'Sick',
    'Casual',
    'Annual',
    'Emergency',
    'Other'
);


--
-- Name: enum_leave_requests_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_leave_requests_status AS ENUM (
    'Pending',
    'Approved',
    'Rejected',
    'Cancelled'
);


--
-- Name: enum_personnel_education_mil_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_personnel_education_mil_status AS ENUM (
    'pass',
    'yet to appear'
);


--
-- Name: enum_personnel_education_mil_title; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_personnel_education_mil_title AS ENUM (
    'MR-I',
    'MR-II'
);


--
-- Name: enum_personnel_education_mr_ii; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_personnel_education_mr_ii AS ENUM (
    'pass',
    'yet to appear'
);


--
-- Name: enum_personnel_education_mri; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_personnel_education_mri AS ENUM (
    'pass',
    'yet to appear'
);


--
-- Name: enum_ranks_category; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_ranks_category AS ENUM (
    'Other Ranks',
    'Junior Commissioned Officers',
    'Officers'
);


--
-- Name: enum_reportees_performance_rating; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_reportees_performance_rating AS ENUM (
    'Outstanding',
    'Excellent',
    'Good',
    'Satisfactory',
    'Needs Improvement'
);


--
-- Name: enum_reportees_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_reportees_status AS ENUM (
    'Active',
    'Inactive'
);


--
-- Name: enum_user_course_mapping_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_user_course_mapping_status AS ENUM (
    'obtained',
    'planned'
);


--
-- Name: leave_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.leave_status AS ENUM (
    'Pending',
    'Approved',
    'Rejected',
    'Cancelled'
);


--
-- Name: leave_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.leave_type AS ENUM (
    'Sick',
    'Casual',
    'Annual',
    'Emergency',
    'Other'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: SequelizeMeta; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."SequelizeMeta" (
    name character varying(255) NOT NULL
);


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
    id integer NOT NULL,
    user_id bigint,
    attendance_date date NOT NULL,
    status character varying(20) DEFAULT 'Present'::public.enum_attendance_status NOT NULL,
    check_in_time time without time zone,
    check_out_time time without time zone,
    remarks text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: attendance_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.attendance_id_seq
    AS integer
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
    id integer NOT NULL,
    company_name character varying(100) NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: companies_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.companies_id_seq
    AS integer
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
    id integer NOT NULL,
    company_id bigint NOT NULL,
    personnel_id bigint NOT NULL,
    role character varying(50) NOT NULL,
    appointment_date date NOT NULL,
    end_date date,
    status character varying(20) DEFAULT 'Active'::public.enum_company_personnel_status NOT NULL,
    remarks text,
    appointed_by bigint,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: company_personnel_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.company_personnel_id_seq
    AS integer
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
    id integer NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    course_code character varying(50),
    course_title character varying(200) NOT NULL,
    remarks text,
    is_active boolean DEFAULT true NOT NULL,
    start_date timestamp without time zone,
    end_date timestamp without time zone
);


--
-- Name: course_master_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.course_master_id_seq
    AS integer
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
    id integer NOT NULL,
    army_no character varying(50) NOT NULL,
    document_type character varying(20) NOT NULL,
    file_name character varying(255) NOT NULL,
    original_name character varying(255) NOT NULL,
    file_path text NOT NULL,
    file_size bigint NOT NULL,
    mime_type character varying(100) NOT NULL,
    uploaded_by bigint,
    uploaded_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: documents_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.documents_id_seq
    AS integer
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
    id integer NOT NULL,
    profile_id bigint NOT NULL,
    unit character varying(100) NOT NULL,
    from_date date NOT NULL,
    to_date date NOT NULL,
    planned_ere character varying(200) NOT NULL,
    remarks text,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: ere_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ere_id_seq
    AS integer
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
    id integer NOT NULL,
    profile_id bigint NOT NULL,
    relationship_type character varying(20) NOT NULL,
    name character varying(100) NOT NULL,
    dob date,
    contact_number character varying(20),
    pan_card character varying(20),
    aadhar_card character varying(20),
    account_number character varying(50),
    blood_group character varying(10),
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: family_details_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.family_details_id_seq
    AS integer
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
    id integer NOT NULL,
    profile_id bigint,
    problem text,
    remarks text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: family_problem_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.family_problem_id_seq
    AS integer
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
    id integer NOT NULL,
    profile_id bigint,
    location character varying(100),
    from_date date,
    to_date date,
    remarks text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: field_service_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.field_service_id_seq
    AS integer
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
    id integer NOT NULL,
    profile_id bigint,
    unit character varying(100),
    from_date date,
    to_date date,
    remarks text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: foreign_posting_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.foreign_posting_id_seq
    AS integer
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
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: grades_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.grades_id_seq
    AS integer
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
    id integer NOT NULL,
    leave_request_id bigint NOT NULL,
    approver_id bigint NOT NULL,
    action public.enum_leave_approvals_action NOT NULL,
    comments text,
    approved_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    status character varying(20) DEFAULT 'approved'::character varying NOT NULL
);


--
-- Name: leave_approvals_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.leave_approvals_id_seq
    AS integer
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
    id integer NOT NULL,
    leave_request_id bigint NOT NULL,
    original_end_date date NOT NULL,
    new_end_date date NOT NULL,
    extension_days bigint NOT NULL,
    extension_reason text NOT NULL,
    extended_by bigint NOT NULL,
    approved_by bigint,
    status character varying(20) DEFAULT 'approved'::public.enum_leave_extensions_status NOT NULL,
    approval_notes text,
    approved_at timestamp without time zone,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: COLUMN leave_extensions.leave_request_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.leave_extensions.leave_request_id IS 'Reference to the original leave request';


--
-- Name: COLUMN leave_extensions.original_end_date; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.leave_extensions.original_end_date IS 'The original end date before extension';


--
-- Name: COLUMN leave_extensions.new_end_date; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.leave_extensions.new_end_date IS 'The new extended end date';


--
-- Name: COLUMN leave_extensions.extension_days; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.leave_extensions.extension_days IS 'Number of days extended';


--
-- Name: COLUMN leave_extensions.extension_reason; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.leave_extensions.extension_reason IS 'Reason for the extension';


--
-- Name: COLUMN leave_extensions.extended_by; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.leave_extensions.extended_by IS 'User who extended the leave (commander/admin)';


--
-- Name: COLUMN leave_extensions.approved_by; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.leave_extensions.approved_by IS 'User who approved the extension (if different from extended_by)';


--
-- Name: COLUMN leave_extensions.status; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.leave_extensions.status IS 'Status of the extension';


--
-- Name: COLUMN leave_extensions.approval_notes; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.leave_extensions.approval_notes IS 'Notes from the approver';


--
-- Name: COLUMN leave_extensions.approved_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.leave_extensions.approved_at IS 'When the extension was approved';


--
-- Name: leave_extensions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.leave_extensions_id_seq
    AS integer
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
    id integer NOT NULL,
    personnel_id bigint NOT NULL,
    leave_type_id bigint,
    supervisor_id bigint,
    start_date date NOT NULL,
    end_date date NOT NULL,
    total_days bigint NOT NULL,
    reason text NOT NULL,
    status character varying(20) DEFAULT 'Pending'::public.enum_leave_requests_status NOT NULL,
    applied_by_admin boolean DEFAULT false NOT NULL,
    admin_id bigint,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    rejection_reason text,
    approved_by bigint,
    approved_at timestamp without time zone
);


--
-- Name: leave_requests_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.leave_requests_id_seq
    AS integer
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
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    max_days bigint DEFAULT 30 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    code character varying(20)
);


--
-- Name: leave_types_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.leave_types_id_seq
    AS integer
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
    id integer NOT NULL,
    profile_id bigint NOT NULL,
    formation text,
    location text,
    attachment text,
    employment text,
    start_date date,
    end_date date,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: out_station_employment_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.out_station_employment_id_seq
    AS integer
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
    id integer NOT NULL,
    personnel_id bigint NOT NULL,
    civ character varying(255),
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    mri character varying(20),
    mr_ii character varying(20),
    civilian_degree character varying(20),
    civilian_specialisation character varying(255)
);


--
-- Name: COLUMN personnel_education.civ; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.personnel_education.civ IS 'Civilian education information';


--
-- Name: COLUMN personnel_education.mri; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.personnel_education.mri IS 'MRI status';


--
-- Name: COLUMN personnel_education.mr_ii; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.personnel_education.mr_ii IS 'MR II status';


--
-- Name: personnel_education_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.personnel_education_id_seq
    AS integer
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
    id integer NOT NULL,
    army_no character varying(50),
    rank character varying(50),
    name character varying(100),
    dob date,
    doe date,
    service character varying(50),
    honors_awards text,
    med_cat character varying(50),
    not_endorsed text,
    special_skill text,
    games_level character varying(100),
    present_employment character varying(100),
    planned_employment character varying(100),
    photo_url text,
    user_id bigint,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    unit character varying(100),
    status character varying(50) DEFAULT 'Active'::character varying,
    rank_id bigint,
    email character varying(100),
    phone character varying(20),
    nok character varying(150),
    account_number character varying(50),
    pan_card character varying(20),
    aadhar_card character varying(20),
    dsp_account character varying(50),
    recat_date date,
    blood_group character varying(10),
    date_of_marriage date,
    medical_category_id bigint,
    diagnose text,
    date_of_medical_board date,
    pc_bc character varying(10),
    restriction_due_to_cat text,
    remarks text,
    natural_category character varying(20),
    platoon_id bigint,
    tradesman_id bigint,
    att_service character varying(50),
    att_specialization character varying(100)
);


--
-- Name: personnel_profile_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.personnel_profile_id_seq
    AS integer
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
    id integer NOT NULL,
    profile_id bigint NOT NULL,
    endorsed boolean,
    offence text,
    date_of_offence date,
    punishment_awarded text,
    remarks text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    section_aa text,
    type_of_entry character varying(50)
);


--
-- Name: punishment_offence_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.punishment_offence_id_seq
    AS integer
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
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    "order" bigint DEFAULT 0 NOT NULL
);


--
-- Name: COLUMN rank_categories.name; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.rank_categories.name IS 'Name of the rank category (e.g., Officer, JCO, OR)';


--
-- Name: COLUMN rank_categories.is_active; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.rank_categories.is_active IS 'Whether the category is active';


--
-- Name: COLUMN rank_categories."order"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.rank_categories."order" IS 'Order for category hierarchy (lower number = higher rank category)';


--
-- Name: rank_categories_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.rank_categories_id_seq
    AS integer
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
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    abbreviation character varying(20),
    category_id bigint,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    "order" bigint DEFAULT 0 NOT NULL
);


--
-- Name: COLUMN ranks."order"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.ranks."order" IS 'Order for rank hierarchy within category (lower number = higher rank)';


--
-- Name: ranks_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ranks_id_seq
    AS integer
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
    id integer NOT NULL,
    profile_id bigint,
    note text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    recommendation_a text,
    recommendation_b text
);


--
-- Name: recommendation_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.recommendation_id_seq
    AS integer
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
    id integer NOT NULL,
    supervisor_id bigint NOT NULL,
    reportee_id bigint NOT NULL,
    status character varying(20) DEFAULT 'Active'::public.enum_reportees_status,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: reportees_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.reportees_id_seq
    AS integer
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
    id integer NOT NULL,
    profile_id bigint,
    note text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    suitable_for_special_emp_a text,
    suitable_for_special_emp_b text
);


--
-- Name: special_employment_suitability_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.special_employment_suitability_id_seq
    AS integer
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
    id integer NOT NULL,
    profile_id bigint NOT NULL,
    course_id bigint NOT NULL,
    remarks text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    completion_date date,
    grade character varying(20),
    status character varying(20) DEFAULT 'planned'::public.enum_user_course_mapping_status,
    certificate_url character varying(500),
    is_active boolean DEFAULT true NOT NULL,
    start_date date,
    end_date date
);


--
-- Name: user_course_mapping_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.user_course_mapping_id_seq
    AS integer
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
    id integer NOT NULL,
    army_no character varying(100) NOT NULL,
    password character varying(255),
    role character varying(50) DEFAULT 'user'::character varying,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    password_changed boolean DEFAULT false NOT NULL
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    AS integer
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
-- Data for Name: SequelizeMeta; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."SequelizeMeta" (name) FROM stdin;
20251029135500-initial-schema.js
20251029135501-add-password-changed-to-users.js
20251029135502-create-leave-management-tables.js
20251029135503-add-unique-constraint-army-no.js
20251029135504-create-reportee-table.js
20251029135505-remove-performance-fields.js
20251029135506-add-unit-to-personnel-profile.js
20251029135507-add-status-to-personnel-profile.js
20251029135508-add-unique-constraint-reportee.js
20251029135509-create-company-tables.js
20251029135510-create-ranks-table.js
20251029135511-add-rank-id-to-personnel-profile.js
20251029135512-update-course-master-table.js
20251029135513-update-user-course-mapping.js
20251029135514-add-status-unit-email-phone-to-personnel.js
20251029135515-create-personnel-education-table.js
20251029135516-update-personnel-education-fields.js
20251029135517-create-ere-table.js
20251029135518-update-special-employment-recommendation-tables.js
20251029135519-update-course-master-dates.js
20251029135520-update-leave-requests-table.js
20251029135521-make-leave-type-id-nullable.js
20251029135522-update-rank-categories.js
20251029135523-simplify-companies-table.js
20251029135524-create-rank-category-table.js
20251029135525-update-ranks-table-add-category.js
20251029135526-migrate-existing-ranks-to-categories.js
20251029135527-remove-hierarchy-order-description-from-ranks.js
20251029135528-remove-description-hierarchy-order-from-rank-categories.js
20251029135529-create-leave-extensions-table.js
20251122152127-create-grades-table.js
20251122160000-make-course-code-nullable.js
20251126090000-add-start-end-to-user-course-mapping.js
20251127093000-add-personnel-identifiers.js
20251127100000-create-out-station-employment.js
20251201000000-add-code-to-leave-types.js
20250105000000-add-order-to-ranks.js
20250105000000-add-recat-date-to-personnel-profile.js
20250105000001-add-order-to-rank-categories.js
20250105000002-create-documents-table.js
20250105120000-add-personal-fields-and-family-details.js
\.


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

COPY public.companies (id, company_name, created_at, updated_at) FROM stdin;
8	Bravo	2025-10-30 05:52:07.923+00	2025-12-08 14:26:00.708+00
9	Charlie	2025-10-30 05:52:07.923+00	2025-12-08 14:26:00.708+00
10	Delta	2025-10-30 05:52:07.923+00	2025-12-08 14:26:00.708+00
11	Headquarter	2025-10-30 05:52:07.923+00	2025-12-08 14:26:00.708+00
12	Support	2025-10-30 05:52:07.923+00	2025-12-08 14:26:00.708+00
26	Att	2026-02-25 11:22:13.939575+00	2026-02-25 11:22:13.939575+00
28	Alpha	2026-03-03 11:07:00.035832+00	2026-03-03 11:07:00.035832+00
30	Testing purpose	2026-03-05 07:44:08.460781+00	2026-03-05 07:44:08.460781+00
\.


--
-- Data for Name: company_personnel; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.company_personnel (id, company_id, personnel_id, role, appointment_date, end_date, status, remarks, appointed_by, created_at, updated_at) FROM stdin;
4	8	5	Other	2025-11-13	\N	Active	\N	1	2025-11-13 08:36:33.264+00	2025-11-13 08:36:33.264+00
5	9	6	Other	2025-11-13	\N	Active	\N	1	2025-11-13 08:38:00.401+00	2025-11-13 08:38:00.401+00
8	11	9	Other	2025-11-13	\N	Active	\N	1	2025-11-13 08:52:40.867+00	2025-11-13 08:52:40.867+00
10	8	11	Other	2025-11-13	\N	Active	\N	1	2025-11-13 17:32:07.782+00	2025-11-13 17:32:07.782+00
11	9	12	Other	2025-11-13	\N	Active	\N	1	2025-11-13 17:33:30.256+00	2025-11-13 17:33:30.256+00
13	12	14	Other	2025-11-13	\N	Active	\N	1	2025-11-13 17:49:50.91+00	2025-11-13 17:49:50.91+00
14	11	15	Other	2025-11-13	\N	Active	\N	1	2025-11-13 17:51:11.394+00	2025-11-13 17:51:11.394+00
16	10	17	Other	2025-11-13	\N	Active	\N	1	2025-11-13 17:53:34.186+00	2025-11-13 17:53:34.186+00
17	8	18	Other	2025-11-13	\N	Active	\N	1	2025-11-13 17:54:57.608+00	2025-11-13 17:54:57.608+00
18	9	19	Other	2025-11-13	\N	Active	\N	1	2025-11-13 18:01:00.373+00	2025-11-13 18:01:00.373+00
19	12	20	Other	2025-11-13	\N	Active	\N	1	2025-11-13 18:02:03.587+00	2025-11-13 18:02:03.587+00
20	11	21	Other	2025-11-13	\N	Active	\N	1	2025-11-13 18:03:24.17+00	2025-11-13 18:03:24.17+00
22	10	23	Other	2025-11-13	\N	Active	\N	1	2025-11-13 18:05:36.986+00	2025-11-13 18:05:36.986+00
23	8	24	Other	2025-11-13	\N	Active	\N	1	2025-11-13 18:06:59.009+00	2025-11-13 18:06:59.009+00
24	9	25	Other	2025-11-13	\N	Active	\N	1	2025-11-13 18:08:09.959+00	2025-11-13 18:08:09.959+00
25	12	26	Other	2025-11-13	\N	Active	\N	1	2025-11-13 18:09:14.805+00	2025-11-13 18:09:14.805+00
26	11	27	Other	2025-11-13	\N	Active	\N	1	2025-11-13 18:10:40.734+00	2025-11-13 18:10:40.734+00
27	10	28	Other	2025-11-13	\N	Active	\N	1	2025-11-13 18:11:37.724+00	2025-11-13 18:11:37.724+00
29	8	30	Other	2025-11-13	\N	Active	\N	1	2025-11-13 18:13:36.543+00	2025-11-13 18:13:36.543+00
30	9	31	Other	2025-11-13	\N	Active	\N	1	2025-11-13 18:14:33.421+00	2025-11-13 18:14:33.421+00
31	12	32	Other	2025-11-13	\N	Active	\N	1	2025-11-13 18:15:41.394+00	2025-11-13 18:15:41.394+00
32	11	33	Other	2025-11-13	\N	Active	\N	1	2025-11-13 18:16:32.395+00	2025-11-13 18:16:32.395+00
33	8	34	Commander	2025-11-20	\N	Active	\N	1	2025-11-20 04:42:18.488+00	2025-11-20 04:42:28.532+00
7	12	8	Commander	2025-11-21	\N	Active	\N	1	2025-11-13 08:50:48.784+00	2025-11-21 04:42:39.95+00
36	11	39	Other	2025-12-29	\N	Active	\N	1	2025-12-29 04:24:30.998+00	2025-12-29 04:24:30.998+00
37	8	40	Other	2025-12-29	\N	Active	\N	1	2025-12-29 04:57:06.135+00	2025-12-29 04:57:06.135+00
38	8	41	Other	2025-12-30	\N	Active	\N	1	2025-12-30 05:52:13.193+00	2025-12-30 05:52:13.193+00
39	11	1	Other	2025-12-30	\N	Active	\N	1	2025-12-30 06:41:16.35+00	2025-12-30 06:41:16.35+00
40	11	42	Other	2026-01-01	\N	Active	\N	1	2026-01-01 06:18:54.019+00	2026-01-01 06:18:54.019+00
45	28	10	Other	2026-03-03	\N	Active		\N	2026-03-03 11:17:52.235917+00	2026-03-03 11:17:52.235917+00
46	28	16	Other	2026-03-03	\N	Active		\N	2026-03-03 11:19:50.302145+00	2026-03-03 11:19:50.302145+00
47	28	4	Other	2026-03-03	\N	Active		\N	2026-03-03 11:21:58.312089+00	2026-03-03 11:21:58.312089+00
48	28	22	Other	2026-03-03	\N	Active		\N	2026-03-03 11:25:30.934375+00	2026-03-03 11:25:30.934375+00
43	28	3	Commander	2026-03-03	\N	Active		\N	2026-03-03 11:09:25.663694+00	2026-03-03 11:26:01.297768+00
49	28	37	Other	2026-03-03	\N	Active		\N	2026-03-03 11:27:54.552219+00	2026-03-03 11:27:54.552219+00
50	28	45	Other	2026-03-03	\N	Active		\N	2026-03-03 11:29:06.131349+00	2026-03-03 11:29:06.131349+00
12	10	13	Commander	2026-03-04	\N	Active		1	2025-11-13 17:48:30.189+00	2026-03-04 09:42:47.193272+00
6	10	7	Other	2026-03-04	\N	Active		1	2025-11-13 08:43:54.347+00	2026-03-04 09:42:47.198066+00
41	11	43	Commander	2026-03-04	\N	Active		1	2026-01-02 05:43:48.445+00	2026-03-04 09:45:59.979976+00
57	30	58	Commander	2026-03-05	\N	Active		\N	2026-03-05 07:46:19.825976+00	2026-03-05 07:59:37.905723+00
59	9	60	Other	2026-03-05	\N	Active		\N	2026-03-05 08:13:21.598015+00	2026-03-05 08:13:21.598015+00
62	28	63	Other	2026-03-06	\N	Active		\N	2026-03-06 04:30:45.097696+00	2026-03-06 04:30:45.097696+00
\.


--
-- Data for Name: course_master; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.course_master (id, created_at, updated_at, course_code, course_title, remarks, is_active, start_date, end_date) FROM stdin;
2	2025-11-20 05:30:46.648+00	2025-11-20 05:30:46.648+00	002	MOR		t	\N	\N
5	2025-11-20 05:42:25.237+00	2025-11-20 05:42:25.237+00	005	LICO		t	\N	\N
3	2025-11-20 05:31:09.035+00	2025-11-20 05:42:54.65+00	003	NTSC		f	\N	\N
6	2025-11-20 05:43:31.506+00	2025-11-20 05:43:31.506+00	006	SEC CDR		t	\N	\N
1	2025-11-20 05:21:35.728+00	2025-11-21 04:00:40.036+00	001	ADP JN		f	2025-02-20 00:00:00	2025-04-04 00:00:00
8	2025-12-15 07:06:43.325+00	2025-12-29 03:59:52.034+00	\N	TESTING	\N	f	\N	\N
10	2026-02-17 06:59:45.810336+00	2026-03-04 07:26:31.108747+00		Testing process1	Just for Testing purpose\n	f	\N	\N
11	2026-03-04 07:27:14.31646+00	2026-03-04 07:28:10.057231+00		Testing Demo	Testing Purpose Only\n	f	\N	\N
7	2025-11-21 04:01:19.493+00	2026-03-05 09:30:22.591879+00	009	ITCA JN		t	\N	\N
4	2025-11-20 05:31:29.683+00	2026-03-05 09:30:32.318506+00	004	JLC		t	\N	\N
12	2026-03-04 07:28:41.838597+00	2026-03-05 09:30:36.982408+00		Testing Demo		f	\N	\N
9	2026-02-13 11:12:41.017327+00	2026-03-05 15:05:51.516052+00		TESTING	test	t	\N	\N
14	2026-03-05 05:56:10.038321+00	2026-03-05 05:59:35.177826+00		testing 1	The expected behavior is straightforward: when a user clicks on Admin and then selects Edit Profile, the system should load the corresponding profile management page. This page typically contains fields such as name, email address, contact information, role assignments, and other relevant account details. Administrators rely on this functionality to update user information, manage permissions, and ensure that records remain accurate and up to date.\n\nHowever, the current behavior deviates from this expectation. Instead of opening the profile editing interface, the system redirects to the Personnel table view. The Personnel table generally displays a list of employees or users in a tabular format, including columns such as employee ID, name, department, designation, and status. While this page serves its own purpose within the application, it is unrelated to the action of editing an individual profile from the Admin section.\n\nThis misdirection suggests there may be a routing or navigation configuration issue within the system. It is possible that the Edit Profile menu option has been incorrectly linked to the Personnel table route. Another potential cause could be a misconfigured controller action or an incorrect URL mapping in the backend. In some cases, role-based access controls or permission settings may also inadvertently redirect users to a default page, such as the Personnel table, instead of the intended Edit Profile page.\n\nFrom a usability perspective, this issue can create confusion for administrators. Users may assume that the Edit Profile feature is unavailable, broken, or restricted. It can also slow down administrative tasks, as users must manually navigate back and attempt alternative methods to locate the correct page. Repeated redirections to the wrong module may negatively impact user confidence in the system’s reliability.\n\nTo resolve this issue, the navigation path for the Edit Profile option should be reviewed and corrected. Developers should verify the route configuration, ensure the correct view is associated with the Edit Profile action, and confirm that appropriate permissions are applied. Additionally, thorough testing should be conducted after implementing the fix to ensure that clicking on Admin → Edit Profile consistently opens the correct profile editing page without redirecting to the Personnel table.\n\nAddressing this issue promptly will improve the overall user experience and ensure that administrators can efficiently manage user profiles as intended.	f	\N	\N
13	2026-03-05 05:55:46.834524+00	2026-03-05 05:59:39.33493+00		Testing course	The expected behavior is straightforward: when a user clicks on Admin and then selects Edit Profile, the system should load the corresponding profile management page. This page typically contains fields such as name, email address, contact information, role assignments, and other relevant account details. Administrators rely on this functionality to update user information, manage permissions, and ensure that records remain accurate and up to date.\n\nHowever, the current behavior deviates from this expectation. Instead of opening the profile editing interface, the system redirects to the Personnel table view. The Personnel table generally displays a list of employees or users in a tabular format, including columns such as employee ID, name, department, designation, and status. While this page serves its own purpose within the application, it is unrelated to the action of editing an individual profile from the Admin section.\n\nThis misdirection suggests there may be a routing or navigation configuration issue within the system. It is possible that the Edit Profile menu option has been incorrectly linked to the Personnel table route. Another potential cause could be a misconfigured controller action or an incorrect URL mapping in the backend. In some cases, role-based access controls or permission settings may also inadvertently redirect users to a default page, such as the Personnel table, instead of the intended Edit Profile page.\n\nFrom a usability perspective, this issue can create confusion for administrators. Users may assume that the Edit Profile feature is unavailable, broken, or restricted. It can also slow down administrative tasks, as users must manually navigate back and attempt alternative methods to locate the correct page. Repeated redirections to the wrong module may negatively impact user confidence in the system’s reliability.\n\nTo resolve this issue, the navigation path for the Edit Profile option should be reviewed and corrected. Developers should verify the route configuration, ensure the correct view is associated with the Edit Profile action, and confirm that appropriate permissions are applied. Additionally, thorough testing should be conducted after implementing the fix to ensure that clicking on Admin → Edit Profile consistently opens the correct profile editing page without redirecting to the Personnel table.\n\nAddressing this issue promptly will improve the overall user experience and ensure that administrators can efficiently manage user profiles as intended.	f	\N	\N
17	2026-03-05 05:59:07.029291+00	2026-03-05 05:59:17.565883+00		rest		f	\N	\N
16	2026-03-05 05:56:29.121863+00	2026-03-05 05:59:23.120324+00		testing 3	       test	f	\N	\N
15	2026-03-05 05:56:20.269141+00	2026-03-05 05:59:31.745779+00		testing 2	The expected behavior is straightforward: when a user clicks on Admin and then selects Edit Profile, the system should load the corresponding profile management page. This page typically contains fields such as name, email address, contact information, role assignments, and other relevant account details. Administrators rely on this functionality to update user information, manage permissions, and ensure that records remain accurate and up to date.\n\nHowever, the current behavior deviates from this expectation. Instead of opening the profile editing interface, the system redirects to the Personnel table view. The Personnel table generally displays a list of employees or users in a tabular format, including columns such as employee ID, name, department, designation, and status. While this page serves its own purpose within the application, it is unrelated to the action of editing an individual profile from the Admin section.\n\nThis misdirection suggests there may be a routing or navigation configuration issue within the system. It is possible that the Edit Profile menu option has been incorrectly linked to the Personnel table route. Another potential cause could be a misconfigured controller action or an incorrect URL mapping in the backend. In some cases, role-based access controls or permission settings may also inadvertently redirect users to a default page, such as the Personnel table, instead of the intended Edit Profile page.\n\nFrom a usability perspective, this issue can create confusion for administrators. Users may assume that the Edit Profile feature is unavailable, broken, or restricted. It can also slow down administrative tasks, as users must manually navigate back and attempt alternative methods to locate the correct page. Repeated redirections to the wrong module may negatively impact user confidence in the system’s reliability.\n\nTo resolve this issue, the navigation path for the Edit Profile option should be reviewed and corrected. Developers should verify the route configuration, ensure the correct view is associated with the Edit Profile action, and confirm that appropriate permissions are applied. Additionally, thorough testing should be conducted after implementing the fix to ensure that clicking on Admin → Edit Profile consistently opens the correct profile editing page without redirecting to the Personnel table.\n\nAddressing this issue promptly will improve the overall user experience and ensure that administrators can efficiently manage user profiles as intended.	f	\N	\N
18	2026-03-05 06:20:07.503707+00	2026-03-05 06:21:02.276952+00		test	 manage permissions, and ensure that records remain accurate and up to date.	f	\N	\N
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
1	Switch UAV	2026-02-25 10:50:38.977578+00	2026-02-25 10:50:38.977578+00
2	Q5	2026-02-25 10:50:40.058186+00	2026-02-25 10:50:40.058186+00
3	Q6	2026-02-25 10:50:40.955939+00	2026-02-25 10:50:40.955939+00
4	TRINETRA	2026-02-25 10:50:41.343756+00	2026-02-25 10:50:41.343756+00
5	SPECTRE 2M	2026-02-25 10:50:41.733774+00	2026-02-25 10:50:41.733774+00
6	SUDARSHAN DRONE	2026-02-25 10:50:42.184665+00	2026-02-25 10:50:42.184665+00
7	DJI MAVIC AIR 2	2026-02-25 10:50:43.00012+00	2026-02-25 10:50:43.00012+00
8	DJI NEO 2	2026-02-25 10:50:43.634688+00	2026-02-25 10:50:43.634688+00
9	DJI AVATA 2	2026-02-25 10:50:44.43756+00	2026-02-25 10:50:44.43756+00
10	I2I SPECTRUM	2026-02-25 10:50:44.84749+00	2026-02-25 10:50:44.84749+00
11	LOITERING MUNITION NAGASTRA	2026-02-25 10:50:45.522648+00	2026-02-25 10:50:45.522648+00
12	CUAS PRABHAL	2026-02-25 10:50:46.692408+00	2026-02-25 10:50:46.692408+00
\.


--
-- Data for Name: ere; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.ere (id, profile_id, unit, from_date, to_date, planned_ere, remarks, created_at, updated_at) FROM stdin;
1	33	3 RIF	2025-11-01	2027-02-16	DEHRADUN	\N	2025-11-21 03:51:13.034+00	2025-11-21 03:51:13.034+00
\.


--
-- Data for Name: family_details; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.family_details (id, profile_id, relationship_type, name, dob, contact_number, pan_card, aadhar_card, account_number, blood_group, created_at, updated_at) FROM stdin;
1	14	father	AYUSH	\N	7894561232	\N	\N	\N	\N	2026-01-10 08:07:59.366+00	2026-01-10 08:07:59.366+00
2	14	spouse	Priya	1980-03-12	9867363344	ADXOK5874L	232323232323	3434343434	A+	2026-01-12 11:24:38.297+00	2026-01-12 11:24:38.297+00
3	44	father	Test	\N						2026-03-04 10:38:34.123172+00	2026-03-04 10:38:34.123172+00
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
1	33	JAMMU	2025-10-07	2025-12-24	Field visit	2025-12-09 04:15:08.803+00	2025-12-09 04:15:08.803+00
3	40	US	2026-02-24	2026-02-26	testtesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttest	2026-03-05 05:30:52.001553+00	2026-03-05 05:30:52.001553+00
\.


--
-- Data for Name: foreign_posting; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.foreign_posting (id, profile_id, unit, from_date, to_date, remarks, created_at, updated_at) FROM stdin;
1	33	UK	2025-05-01	2026-01-11	Abroad	2025-12-09 04:15:39.467+00	2025-12-09 04:15:39.467+00
2	39	UK	2026-03-06	2026-03-12		2026-03-05 05:25:37.5102+00	2026-03-05 05:25:37.5102+00
\.


--
-- Data for Name: formations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.formations (id, name, parent_id, sort_order, created_at, updated_at) FROM stdin;
1	Guards and Duties	\N	1	2026-02-25 10:50:47.973659+00	2026-02-25 10:50:47.973659+00
2	AMN GD JASSAI	1	1	2026-02-25 10:50:49.581224+00	2026-02-25 10:50:49.581224+00
3	MAIN GATE GD JASSAI	1	2	2026-02-25 10:50:50.755251+00	2026-02-25 10:50:50.755251+00
4	11 COMPO	1	3	2026-02-25 10:50:51.336906+00	2026-02-25 10:50:51.336906+00
5	41 ASC SUPPLY	1	4	2026-02-25 10:50:51.72434+00	2026-02-25 10:50:51.72434+00
6	BHAVNAGAR	1	5	2026-02-25 10:50:52.044612+00	2026-02-25 10:50:52.044612+00
7	SOMNATH TEMPLE	1	6	2026-02-25 10:50:52.42557+00	2026-02-25 10:50:52.42557+00
8	MCO	1	7	2026-02-25 10:50:53.448937+00	2026-02-25 10:50:53.448937+00
9	GMP	1	8	2026-02-25 10:50:54.139369+00	2026-02-25 10:50:54.139369+00
10	BDE HQ	1	9	2026-02-25 10:50:54.573482+00	2026-02-25 10:50:54.573482+00
11	DIV HQ	1	10	2026-02-25 10:50:54.938463+00	2026-02-25 10:50:54.938463+00
12	CORP HQ	1	11	2026-02-25 10:50:55.280947+00	2026-02-25 10:50:55.280947+00
13	COMD HQ	1	12	2026-02-25 10:50:55.774068+00	2026-02-25 10:50:55.774068+00
14	MES IB	1	13	2026-02-25 10:50:56.430305+00	2026-02-25 10:50:56.430305+00
15	SOMNATH GATE	1	14	2026-02-25 10:50:56.827651+00	2026-02-25 10:50:56.827651+00
16	STN HQ	1	15	2026-02-25 10:50:57.174682+00	2026-02-25 10:50:57.174682+00
17	FTS	\N	2	2026-02-25 10:50:58.159249+00	2026-02-25 10:50:58.159249+00
18	IN STN DUTIES	\N	3	2026-02-25 10:50:58.876684+00	2026-02-25 10:50:58.876684+00
19	SDC	18	1	2026-02-25 10:50:59.387917+00	2026-02-25 10:50:59.387917+00
20	WAR MEMORIAL	18	2	2026-02-25 10:51:00.215838+00	2026-02-25 10:51:00.215838+00
21	DOAT	18	3	2026-02-25 10:51:01.349292+00	2026-02-25 10:51:01.349292+00
22	SHREEDHARA STADIUM	18	4	2026-02-25 10:51:01.763905+00	2026-02-25 10:51:01.763905+00
23	FWC	18	5	2026-02-25 10:51:02.10276+00	2026-02-25 10:51:02.10276+00
24	MES COMPLAINT CELL	18	6	2026-02-25 10:51:02.549862+00	2026-02-25 10:51:02.549862+00
25	MES DVR	18	7	2026-02-25 10:51:03.391081+00	2026-02-25 10:51:03.391081+00
26	TRAILBLAZING AREA	18	8	2026-02-25 10:51:04.064211+00	2026-02-25 10:51:04.064211+00
27	WOI	18	9	2026-02-25 10:51:05.224343+00	2026-02-25 10:51:05.224343+00
28	BDE URC	18	10	2026-02-25 10:51:05.838905+00	2026-02-25 10:51:05.838905+00
29	ATT GRRC	\N	4	2026-02-25 10:51:06.249103+00	2026-02-25 10:51:06.249103+00
30	ATT OTHER UNITS	\N	5	2026-02-25 10:51:06.636184+00	2026-02-25 10:51:06.636184+00
31	TD	\N	6	2026-02-25 10:51:06.915843+00	2026-02-25 10:51:06.915843+00
\.


--
-- Data for Name: grades; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.grades (id, name, description, is_active, created_at, updated_at) FROM stdin;
1	AI	\N	t	2025-12-08 14:40:39.541+00	2025-12-08 14:40:39.541+00
2	A	\N	t	2025-12-08 14:40:39.541+00	2025-12-08 14:40:39.541+00
3	BI	\N	t	2025-12-08 14:40:39.541+00	2025-12-08 14:40:39.541+00
4	B	\N	t	2025-12-08 14:40:39.541+00	2025-12-08 14:40:39.541+00
5	C	\N	t	2025-12-08 14:40:39.541+00	2025-12-08 14:40:39.541+00
6	D	\N	t	2025-12-08 14:40:39.541+00	2025-12-08 14:40:39.541+00
7	F	\N	t	2025-12-08 14:40:39.541+00	2025-12-08 14:40:39.541+00
8	Q	\N	t	2025-12-08 14:40:39.541+00	2025-12-08 14:40:39.541+00
9	QI	\N	t	2025-12-08 14:40:39.541+00	2025-12-08 14:40:39.541+00
10	AXI	\N	t	2025-12-08 14:40:39.541+00	2025-12-08 14:40:39.541+00
11	AY	\N	t	2025-12-08 14:40:39.541+00	2025-12-08 14:40:39.541+00
12	BX	\N	t	2025-12-08 14:40:39.541+00	2025-12-08 14:40:39.541+00
13	BY	\N	t	2025-12-08 14:40:39.541+00	2025-12-08 14:40:39.541+00
14	CX	\N	t	2025-12-08 14:40:39.541+00	2025-12-08 14:40:39.541+00
15	CY	\N	t	2025-12-08 14:40:39.541+00	2025-12-08 14:40:39.541+00
16	best student	\N	t	2025-12-08 14:40:39.541+00	2025-12-08 14:40:39.541+00
17	second best student	\N	t	2025-12-08 14:40:39.541+00	2025-12-08 14:40:39.541+00
\.


--
-- Data for Name: hospitalisation; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.hospitalisation (id, profile_id, date_of_admission, date_of_discharge, diagnosis, medical_category, remarks, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: leave_approvals; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.leave_approvals (id, leave_request_id, approver_id, action, comments, approved_at, created_at, updated_at, status) FROM stdin;
1	2	1	approve	Bulk uploaded and approved by admin	2025-12-19 12:23:21.799+00	2025-12-19 12:23:21.801+00	2025-12-19 12:23:21.801+00	approved
2	4	1	approve	Bulk uploaded and approved by admin	2025-12-19 12:23:21.847+00	2025-12-19 12:23:21.848+00	2025-12-19 12:23:21.848+00	approved
3	3	1	approve	\N	2025-12-29 04:23:08.756+00	2025-12-29 04:23:08.756+00	2025-12-29 04:23:08.756+00	approved
4	6	1	approve	Bulk uploaded and approved by admin	2025-12-29 04:50:43.759+00	2025-12-29 04:50:43.759+00	2025-12-29 04:50:43.759+00	approved
5	1	1	approve	\N	2025-12-29 04:51:01.492+00	2025-12-29 04:51:01.493+00	2025-12-29 04:51:01.493+00	approved
6	7	1	approve	Bulk uploaded and approved by admin	2025-12-29 04:52:29.229+00	2025-12-29 04:52:29.23+00	2025-12-29 04:52:29.23+00	approved
7	8	1	approve	\N	2026-01-10 08:07:16.843+00	2026-01-10 08:07:16.845+00	2026-01-10 08:07:16.845+00	approved
\.


--
-- Data for Name: leave_extensions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.leave_extensions (id, leave_request_id, original_end_date, new_end_date, extension_days, extension_reason, extended_by, approved_by, status, approval_notes, approved_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: leave_requests; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.leave_requests (id, personnel_id, leave_type_id, supervisor_id, start_date, end_date, total_days, reason, status, applied_by_admin, admin_id, created_at, updated_at, rejection_reason, approved_by, approved_at) FROM stdin;
2	33	7	\N	2024-01-01	2024-01-05	5	Sample reason	Approved	t	1	2025-12-19 12:23:21.753+00	2025-12-19 12:23:21.753+00	\N	1	2025-12-19 12:23:21.746
4	30	11	\N	2024-02-01	2024-02-03	3	sick	Approved	t	1	2025-12-19 12:23:21.826+00	2025-12-19 12:23:21.826+00	\N	1	2025-12-19 12:23:21.825
3	31	8	\N	2023-02-01	2023-02-28	28	Another sample reason	Approved	t	1	2025-12-19 12:23:21.814+00	2025-12-29 04:23:08.75+00	\N	1	2025-12-29 04:23:08.75
6	3	7	\N	2024-01-01	2024-01-05	5	Sample reason	Approved	t	1	2025-12-29 04:50:43.746+00	2025-12-29 04:50:43.746+00	\N	1	2025-12-29 04:50:43.745
1	32	7	8	2025-11-21	2025-11-30	10	vacation	Approved	f	\N	2025-11-21 04:43:03.349+00	2025-12-29 04:51:01.48+00	\N	1	2025-12-29 04:51:01.479
7	3	7	\N	2024-01-01	2024-01-05	5	Sample reason	Approved	t	1	2025-12-29 04:52:29.201+00	2025-12-29 04:52:29.201+00	\N	1	2025-12-29 04:52:29.199
8	43	9	\N	2026-01-02	2026-01-03	2	Emergency	Approved	t	1	2026-01-02 06:28:33.925+00	2026-01-10 08:07:16.829+00	\N	1	2026-01-10 08:07:16.828
9	23	7	\N	2026-03-03	2026-04-30	59	AL	Pending	t	1	2026-03-03 11:34:57.952392+00	2026-03-03 11:34:57.952392+00		\N	\N
11	45	8	3	2026-03-05	2026-03-06	2	testing purpose	Approved	f	\N	2026-03-05 07:11:11.405116+00	2026-03-05 07:12:37.324899+00		3	2026-03-05 07:12:37.324603
10	3	8	3	2026-03-06	2026-03-09	4	For testing purpose	Rejected	f	\N	2026-03-05 05:52:12.142253+00	2026-03-05 10:19:28.591224+00	For testing 	1	2026-03-05 10:19:28.590511
\.


--
-- Data for Name: leave_types; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.leave_types (id, name, description, max_days, is_active, created_at, updated_at, code) FROM stdin;
7	Annual Leave	Regular annual leave for personnel	30	t	2025-10-30 05:52:07.923+00	2026-02-25 10:49:49.614925+00	LT001
8	Casual Leave	Short-term casual leave for personal matters	10	t	2025-10-30 05:52:07.923+00	2026-02-25 10:49:50.166812+00	LT002
9	Sick Leave	Medical leave for illness or health issues	15	t	2025-10-30 05:52:07.923+00	2026-02-25 10:49:50.579605+00	LT003
10	Paternity Leave	Leave for new fathers	7	t	2025-10-30 05:52:07.923+00	2026-02-25 10:49:51.063199+00	LT004
11	Study Leave	Leave for educational purposes and training	45	t	2025-10-30 05:52:07.923+00	2026-02-25 10:49:51.723923+00	LT005
12	Furlough	Extended leave for rest and recreation	60	t	2025-10-30 05:52:07.923+00	2026-02-25 10:49:52.073992+00	LT006
\.


--
-- Data for Name: licensing; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.licensing (id, license_key, os, updated_at, created_at, deleted_at) FROM stdin;
1	FtvbeAYAn0Et1SyN5FwjiNGc		2026-02-26 10:49:35.853552+00	2026-02-25 10:17:28.067866+00	\N
\.


--
-- Data for Name: medical_categories; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.medical_categories (id, name, is_active, created_at, updated_at) FROM stdin;
1	S2	t	2026-02-25 10:49:56.003984+00	2026-02-25 10:49:56.003984+00
2	S2(T-24)	t	2026-02-25 10:49:56.598059+00	2026-02-25 10:49:56.598059+00
3	S2(P)	t	2026-02-25 10:49:57.026831+00	2026-02-25 10:49:57.026831+00
4	S3	t	2026-02-25 10:49:57.621601+00	2026-02-25 10:49:57.621601+00
5	S3(T-24)	t	2026-02-25 10:49:58.22635+00	2026-02-25 10:49:58.22635+00
6	S3(P)	t	2026-02-25 10:49:58.973544+00	2026-02-25 10:49:58.973544+00
7	H2	t	2026-02-25 10:49:59.382042+00	2026-02-25 10:49:59.382042+00
8	H2(T-24)	t	2026-02-25 10:49:59.894344+00	2026-02-25 10:49:59.894344+00
9	H2(P)	t	2026-02-25 10:50:00.533024+00	2026-02-25 10:50:00.533024+00
10	H3	t	2026-02-25 10:50:01.123074+00	2026-02-25 10:50:01.123074+00
11	H3(T-24)	t	2026-02-25 10:50:01.531591+00	2026-02-25 10:50:01.531591+00
12	H3(P)	t	2026-02-25 10:50:02.044623+00	2026-02-25 10:50:02.044623+00
13	A2	t	2026-02-25 10:50:02.856907+00	2026-02-25 10:50:02.856907+00
14	A2(T-24)	t	2026-02-25 10:50:03.678063+00	2026-02-25 10:50:03.678063+00
15	A2(P)	t	2026-02-25 10:50:04.086114+00	2026-02-25 10:50:04.086114+00
16	A3	t	2026-02-25 10:50:04.421826+00	2026-02-25 10:50:04.421826+00
17	A3(T-24)	t	2026-02-25 10:50:04.911068+00	2026-02-25 10:50:04.911068+00
18	A3(P)	t	2026-02-25 10:50:05.692771+00	2026-02-25 10:50:05.692771+00
19	P2	t	2026-02-25 10:50:06.242714+00	2026-02-25 10:50:06.242714+00
20	P2(T-24)	t	2026-02-25 10:50:06.857233+00	2026-02-25 10:50:06.857233+00
21	P2(P)	t	2026-02-25 10:50:07.483155+00	2026-02-25 10:50:07.483155+00
22	P3	t	2026-02-25 10:50:07.882954+00	2026-02-25 10:50:07.882954+00
23	P3(T-24)	t	2026-02-25 10:50:08.290808+00	2026-02-25 10:50:08.290808+00
24	P3(P)	t	2026-02-25 10:50:09.003099+00	2026-02-25 10:50:09.003099+00
25	E2	t	2026-02-25 10:50:09.377464+00	2026-02-25 10:50:09.377464+00
26	E2(T-24)	t	2026-02-25 10:50:09.725259+00	2026-02-25 10:50:09.725259+00
27	E2(P)	t	2026-02-25 10:50:10.115159+00	2026-02-25 10:50:10.115159+00
28	E3	t	2026-02-25 10:50:10.543457+00	2026-02-25 10:50:10.543457+00
29	E3(T-24)	t	2026-02-25 10:50:10.90327+00	2026-02-25 10:50:10.90327+00
30	E3(P)	t	2026-02-25 10:50:11.226554+00	2026-02-25 10:50:11.226554+00
\.


--
-- Data for Name: out_station_employment; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.out_station_employment (id, profile_id, formation, location, attachment, employment, start_date, end_date, created_at, updated_at) FROM stdin;
1	31	UNIT1	JAMMU	TEST	TESTING	2025-12-09	2025-12-16	2025-12-09 05:43:59.516+00	2025-12-09 05:43:59.516+00
2	30	TEST1	JAMMU	\N	BUDDY	2025-12-09	2025-12-16	2025-12-09 07:01:37.328+00	2025-12-09 07:01:37.328+00
\.


--
-- Data for Name: personnel_education; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.personnel_education (id, personnel_id, civ, is_active, created_at, updated_at, mri, mr_ii, civilian_degree, civilian_specialisation) FROM stdin;
1	33	NA	t	2025-12-09 04:14:00.321+00	2025-12-09 04:14:00.321+00	pass	yet to appear	\N	\N
2	39	\N	t	2025-12-29 04:24:59.067+00	2025-12-29 04:24:59.067+00	pass	pass	\N	\N
\.


--
-- Data for Name: personnel_profile; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.personnel_profile (id, army_no, rank, name, dob, doe, service, honors_awards, med_cat, not_endorsed, special_skill, games_level, present_employment, planned_employment, photo_url, user_id, created_at, updated_at, unit, status, rank_id, email, phone, nok, account_number, pan_card, aadhar_card, dsp_account, recat_date, blood_group, date_of_marriage, medical_category_id, diagnose, date_of_medical_board, pc_bc, restriction_due_to_cat, remarks, natural_category, platoon_id, tradesman_id, att_service, att_specialization) FROM stdin;
32	4201384L	Havaldar	RITESH CHAMOLI	1980-11-11	2000-01-11	\N	\N	\N	\N	\N	\N	\N	\N	\N	32	2025-11-13 18:15:41.231+00	2026-01-06 12:24:38.841+00	\N	Active	72	\N	9817700812	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
11	4201439L 	Havaldar	VIPIN GURUNG	1980-12-12	2000-07-05	\N	\N	\N	\N	\N	\N	\N	\N	\N	11	2025-11-13 17:32:07.619+00	2026-01-06 12:24:38.843+00	\N	Active	72	\N	9812345771	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
34	83933	Major	RAHUL	1994-03-20	2016-07-16	\N	\N	\N	\N	\N	\N	\N	\N	\N	34	2025-11-20 04:42:18.325+00	2026-01-06 12:24:27.418+00	\N	Active	78	\N	7667678778	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
1	ADMIN001	Captain	System Administrator	1980-01-01	2000-01-01	Army	\N	\N	\N	\N	\N	\N	\N	/uploads/photos/profile_1_1765798730182.jpg	1	2025-10-30 05:52:00.99+00	2026-01-06 12:24:27.426+00	\N	Active	77	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
39	4096890Y	Naik	SURAJ SINGH	1900-01-01	2014-01-01	\N	\N	\N	\N	\N	\N	\N	\N	\N	39	2025-12-29 04:24:30.778+00	2026-01-06 12:24:38.819+00	\N	Active	70	\N	9412966180	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
19	4201283E	Havaldar	AJAY RATHORE	1981-08-28	2001-09-15	\N	\N	\N	\N	\N	\N	\N	\N	\N	19	2025-11-13 18:01:00.208+00	2026-01-06 12:24:38.827+00	\N	Active	72	\N	9810299144	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
43	4105869U	Naik	PIYUSH	2026-01-06	2018-09-02	\N	\N	\N	\N	\N	\N	\N	\N	\N	43	2026-01-02 05:43:48.21+00	2026-01-06 12:24:38.832+00	\N	Active	70	\N	9988552464	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
28	4202198P	Havaldar	HEMANT BISHT	1980-04-04	2000-05-27	\N	\N	\N	\N	\N	\N	\N	\N	/uploads/photos/profile_28_1765860678337.webp	28	2025-11-13 18:11:37.558+00	2026-01-06 12:24:38.845+00	\N	Active	72	\N	9822274411	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
8	4202241X	Naik	DEEPAK SINGH	1987-07-21	2006-01-13	\N	\N	\N	\N	\N	\N	\N	\N	\N	8	2025-11-13 08:50:48.62+00	2026-01-06 12:24:38.846+00	\N	Active	70	\N	9874421365	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
6	4203094P	Havaldar	MANISH BISHT	1980-04-10	2000-11-20	\N	\N	\N	\N	\N	\N	\N	\N	\N	6	2025-11-13 08:38:00.238+00	2026-01-06 12:24:38.849+00	\N	Active	72	\N	9822845012	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
40	4203253N	Rifleman	SHUBHAM KALA	2000-09-30	2018-09-30	\N	\N	\N	\N	\N	\N	\N	\N	\N	40	2025-12-29 04:57:05.897+00	2026-01-06 12:24:38.851+00	\N	Active	68	\N	8755204913	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
17	4203349N	Havaldar	NISHANT PANWAR	1980-09-19	2000-04-10	\N	\N	\N	\N	\N	\N	\N	\N	\N	17	2025-11-13 17:53:34.024+00	2026-01-06 12:24:38.853+00	\N	Active	72	\N	9832210044	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
42	4203739y	Rifleman	himanshu	2026-01-01	2018-09-28	\N	\N	\N	\N	\N	\N	\N	\N	\N	42	2026-01-01 06:18:53.784+00	2026-01-06 12:24:38.854+00	\N	Active	68	\N	9925756482	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
26	4203771Y	Rifleman	BALWANT MEHRA	1993-10-13	2012-03-19	\N	\N	\N	\N	\N	\N	\N	\N	\N	26	2025-11-13 18:09:14.643+00	2026-01-06 12:24:38.858+00	\N	Active	68	\N	9812044011	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
5	4204523H	Naik	AMIT RAWAT	1986-02-02	2005-08-09	\N	\N	\N	\N	\N	\N	\N	\N	\N	5	2025-11-13 08:36:33.099+00	2026-01-06 12:24:38.86+00	\N	Active	70	\N	9890233641	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
20	4204572D	Rifleman	VINEET JOSHI	1996-07-10	2014-11-11	\N	\N	\N	\N	\N	\N	\N	\N	\N	20	2025-11-13 18:02:03.424+00	2026-01-06 12:24:38.864+00	\N	Active	68	\N	9898055212	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
31	4204681A	Naik	PRAVEEN KUMAR	1987-02-01	2006-04-18	\N	\N	\N	\N	\N	\N	\N	\N	/uploads/photos/profile_31_1765797081642.webp	31	2025-11-13 18:14:33.259+00	2026-01-06 12:24:38.87+00	\N	Active	70	\N	9844033001	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
24	4205108V	Naik	LALIT FARSWAN	1986-12-15	2005-07-07	\N	\N	\N	\N	\N	\N	\N	\N	\N	24	2025-11-13 18:06:58.847+00	2026-01-06 12:24:38.875+00	\N	Active	70	\N	9877566212	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
15	4205631R	Naik	SURAJ THAPA	1986-01-16	2005-07-21	\N	\N	\N	\N	\N	\N	\N	\N	\N	15	2025-11-13 17:51:11.231+00	2026-01-06 12:24:38.877+00	\N	Active	70	\N	9845522319	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
9	4205983M	Havaldar	PRADEEP RANA	1981-09-08	2001-06-27	\N	\N	\N	\N	\N	\N	\N	\N	\N	9	2025-11-13 08:52:40.704+00	2026-01-06 12:24:38.878+00	\N	Active	72	\N	9899165014	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
21	4206164U	Naik	RAJU BOHRA	1987-02-07	2006-05-03	\N	\N	\N	\N	\N	\N	\N	\N	\N	21	2025-11-13 18:03:24+00	2026-01-06 12:24:38.879+00	\N	Active	70	\N	9818112790	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
30	4207912J	Havaldar	MANOJ GUSAIN	1981-06-06	2001-09-30	\N	\N	\N	\N	\N	\N	\N	\N	\N	30	2025-11-13 18:13:36.375+00	2026-01-06 12:24:38.888+00	\N	Active	72	\N	9820588210	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
13	4208124J	Rifleman	JITENDRA DOVAL	1993-05-25	2012-10-03	\N	\N	\N	\N	\N	\N	\N	\N	\N	13	2025-11-13 17:48:30.025+00	2026-01-06 12:24:38.89+00	\N	Active	68	\N	9820176344	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
27	4208465K	Naik	CHANDAN RAWAT	1986-01-09	2004-10-06	\N	\N	\N	\N	\N	\N	\N	\N	\N	27	2025-11-13 18:10:40.573+00	2026-01-06 12:24:38.892+00	\N	Active	70	\N	9898155429	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
18	4209016W	Naik	RAJKUMAR BHANDARI	1986-03-02	2004-06-18	\N	\N	\N	\N	\N	\N	\N	\N	\N	18	2025-11-13 17:54:57.444+00	2026-01-06 12:24:38.893+00	\N	Active	70	\N	9876640012	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
12	4209356F	Naik	MOHIT CHAUHAN	1987-09-07	2006-04-29	\N	\N	\N	\N	\N	\N	\N	\N	\N	12	2025-11-13 17:33:30.09+00	2026-01-06 12:24:38.898+00	\N	Active	70	\N	9876099812	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
41	4415236	Rifleman	CHANDU	0066-05-06	2025-12-29	\N	\N	\N	\N	\N	\N	\N	\N	\N	41	2025-12-30 05:52:12.963+00	2026-01-06 12:24:38.9+00	\N	Active	68	\N	5585887766	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
14	4200447C	Havaldar	ANKIT NAUTIYAL	1981-03-22	2001-12-17	\N	\N	\N	\N	\N	\N	\N	\N	\N	14	2025-11-13 17:49:50.748+00	2026-02-11 09:05:23.755+00	\N	Active	72	\N	9867111288	\N	\N	\N	\N	\N	2026-02-19	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
7	4206678A	Rifleman	ROHAN NEGI	1994-10-18	2013-05-04	\N	\N	\N	\N	\N	\N	\N	\N	\N	7	2025-11-13 08:43:54.18+00	2026-01-06 12:24:38.881+00	\N	Active	68	\N	9817794452	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
25	4206942Z	Havaldar	AMITESH NEGI	1981-05-05	2001-01-22	\N	\N	\N	\N	\N	\N	\N	\N	\N	25	2025-11-13 18:08:09.794+00	2026-01-06 12:24:38.882+00	\N	Active	72	\N	9880611527	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
33	4209257F	Rifleman	DEVENDER CHAUHAN	1995-08-22	2014-06-04		Best Leader	A!	Not	Communication	National	Leader test	testing dev		33	2025-11-13 18:16:32.232+00	2026-03-03 07:48:05.879411+00		Active	68		9794466110	IPW23498	9776655645456	GQRE67S267	987645671234	UI112BH	\N		\N	\N		\N					\N	\N		
16	4207820T	Rifleman	HARISH RAWAL	1994-08-14	2013-02-25	\N	\N	\N	\N	\N	\N	\N	\N	\N	16	2025-11-13 17:52:20.195+00	2026-03-03 11:19:48.359924+00	\N	Active	68	\N	9820355761	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
4	4201187K	Havaldar	SURESH KUMAR	1981-06-15	2001-03-12	\N	\N	\N	\N	\N	\N	\N	\N	\N	4	2025-11-13 08:33:39.298+00	2026-03-03 11:21:54.413995+00	\N	Active	72	\N	9876144231	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
22	4207325Q	Havaldar	GAURAV KHATRI	1980-10-03	2000-02-09	\N	\N	\N	\N	\N	\N	\N	\N	\N	22	2025-11-13 18:04:27.979+00	2026-03-03 11:25:26.995516+00	\N	Active	72	\N	9822444591	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
10	4207712B	Rifleman	KIRAN PAL	1995-11-04	2014-02-16				\N						10	2025-11-13 17:31:13.213+00	2026-03-05 05:28:48.013684+00		Active	68		9798321250						\N		\N	\N		\N					\N	\N		
37	4685552A	Subedar	BALBIR 	2008-02-01	2036-09-05	\N	\N	\N	\N	\N	\N	\N	\N	\N	37	2025-12-29 04:04:23.594+00	2026-03-03 11:27:49.842951+00	\N	Active	74	\N	9655778844	\N	\N	\N	\N	\N	2026-02-05	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
45	19565995695	Naib Subedar	KISHAN	2007-11-28	\N				\N						45	2026-03-03 11:29:05.070342+00	2026-03-03 11:29:05.884328+00		Active	73								\N		\N	\N		\N					\N	\N		
49	Army00123		TestingDemo	\N	\N				\N						49	2026-03-04 10:19:30.673672+00	2026-03-04 10:19:30.762146+00		Active	\N								\N		\N	\N		\N					\N	\N		
47	ARMY@1234		Testing 	\N	\N				\N						47	2026-03-04 10:06:00.598336+00	2026-03-04 10:06:00.690208+00		Active	\N								\N		\N	\N		\N					\N	\N		
48	test		test	\N	\N				\N						48	2026-03-04 10:11:44.976062+00	2026-03-04 10:11:45.062025+00		Active	\N		0000000000						\N		\N	\N		\N					\N	\N		
44	ADMIN002	General	support	1980-01-01	2005-01-27				\N						44	2026-02-27 10:10:09.801911+00	2026-03-05 11:05:10.376167+00		Active	\N								\N		\N	\N		\N					\N	\N		
51	67471436		TestDemo	\N	\N				\N						51	2026-03-04 11:08:31.801894+00	2026-03-04 11:08:31.891346+00		Active	\N								\N		\N	\N		\N					\N	\N		
53	test11		test	\N	\N				\N						53	2026-03-04 11:27:53.730351+00	2026-03-04 11:27:53.816076+00		Active	\N								\N		\N	\N		\N					\N	\N		
3	ARMY001	Captain	Rohit	1981-01-01	2008-01-01				\N						3	2025-10-30 08:58:59.66+00	2026-03-05 05:27:52.002218+00		Active	77		9008522866						\N		\N	\N		\N					\N	\N		
60	65346	Colonel	Testing purpose 	2008-03-04	2026-03-03				\N						60	2026-03-05 08:13:21.511605+00	2026-03-05 08:13:21.59629+00		Active	80								\N		\N	\N		\N					\N	\N		
58	2678456	Rifleman	Testing demo	2008-03-04	2026-03-05				\N						58	2026-03-05 07:46:19.730242+00	2026-03-05 10:48:55.972+00		Active	68		9864556768						\N		\N	\N		\N					\N	\N		
23	4202845S	Rifleman	TARUN SINGH	1994-11-20	2013-04-13	\N	\N	\N	\N	\N	\N	\N	\N	\N	23	2025-11-13 18:05:36.823+00	2026-03-05 10:50:12.255023+00	\N	Active	68	\N	9835599102	\N	\N	\N	\N	\N	\N	A+	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
63	234	Major	test	2008-03-04	2026-03-05				\N						63	2026-03-06 04:30:45.010153+00	2026-03-06 04:30:45.095019+00		Active	78								\N		\N	\N		\N					\N	\N		
\.


--
-- Data for Name: personnel_sports; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.personnel_sports (id, personnel_id, name_of_event, level, year_of_participation, achievements, is_active, created_at, updated_at) FROM stdin;
1	58	Kabbadi	State	2026-03-01	tetsing	t	2026-03-05 10:48:56.106754+00	2026-03-05 10:48:56.106754+00
2	23	Kabbadi	state	2026-03-02	testing deemo	t	2026-03-05 10:50:12.38528+00	2026-03-05 10:50:12.38528+00
\.


--
-- Data for Name: platoons; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.platoons (id, platoon_name, company_id, created_at, updated_at) FROM stdin;
7	Platoon 4	8	2026-02-25 10:50:14.962753+00	2026-02-25 10:50:14.962753+00
8	Platoon 5	8	2026-02-25 10:50:15.729693+00	2026-02-25 10:50:15.729693+00
9	Platoon 6	8	2026-02-25 10:50:16.072522+00	2026-02-25 10:50:16.072522+00
10	Coy HQ	8	2026-02-25 10:50:16.482551+00	2026-02-25 10:50:16.482551+00
11	MMG Sec	8	2026-02-25 10:50:16.934447+00	2026-02-25 10:50:16.934447+00
12	AGS Sec	8	2026-02-25 10:50:17.901662+00	2026-02-25 10:50:17.901662+00
13	Platoon 7	9	2026-02-25 10:50:18.325543+00	2026-02-25 10:50:18.325543+00
14	Platoon 8	9	2026-02-25 10:50:18.696087+00	2026-02-25 10:50:18.696087+00
15	Platoon 9	9	2026-02-25 10:50:19.116052+00	2026-02-25 10:50:19.116052+00
16	Coy HQ	9	2026-02-25 10:50:19.573546+00	2026-02-25 10:50:19.573546+00
17	MMG Sec	9	2026-02-25 10:50:19.916581+00	2026-02-25 10:50:19.916581+00
18	AGS Sec	9	2026-02-25 10:50:20.24485+00	2026-02-25 10:50:20.24485+00
19	Platoon 10	10	2026-02-25 10:50:21.09204+00	2026-02-25 10:50:21.09204+00
20	Platoon 11	10	2026-02-25 10:50:21.501284+00	2026-02-25 10:50:21.501284+00
21	Platoon 12	10	2026-02-25 10:50:21.805718+00	2026-02-25 10:50:21.805718+00
22	Coy HQ	10	2026-02-25 10:50:22.395655+00	2026-02-25 10:50:22.395655+00
23	MMG Sec	10	2026-02-25 10:50:23.409205+00	2026-02-25 10:50:23.409205+00
24	AGS Sec	10	2026-02-25 10:50:24.012771+00	2026-02-25 10:50:24.012771+00
25	Battalion HQ	11	2026-02-25 10:50:24.5716+00	2026-02-25 10:50:24.5716+00
26	Transport Platoon	11	2026-02-25 10:50:25.289352+00	2026-02-25 10:50:25.289352+00
27	Administration Platoon	11	2026-02-25 10:50:25.788665+00	2026-02-25 10:50:25.788665+00
28	Ashni Platoon	11	2026-02-25 10:50:26.52006+00	2026-02-25 10:50:26.52006+00
29	Ghatak Platoon	12	2026-02-25 10:50:27.169335+00	2026-02-25 10:50:27.169335+00
30	Assault Platoon	12	2026-02-25 10:50:28.053609+00	2026-02-25 10:50:28.053609+00
31	Mortar Platoon	12	2026-02-25 10:50:28.504912+00	2026-02-25 10:50:28.504912+00
32	Anti-Tank Platoon	12	2026-02-25 10:50:29.021294+00	2026-02-25 10:50:29.021294+00
33	Signals Platoon	12	2026-02-25 10:50:29.348176+00	2026-02-25 10:50:29.348176+00
34	Recce & Surveillance Platoon	12	2026-02-25 10:50:29.790516+00	2026-02-25 10:50:29.790516+00
35	Platoon 1	28	2026-03-03 11:45:00.607061+00	2026-03-03 11:45:00.607061+00
36	Platoon 2	28	2026-03-03 11:45:00.607061+00	2026-03-03 11:45:00.607061+00
37	Platoon 3	28	2026-03-03 11:45:00.607061+00	2026-03-03 11:45:00.607061+00
38	Coy HQ	28	2026-03-03 11:45:00.607061+00	2026-03-03 11:45:00.607061+00
39	HMG Sec	28	2026-03-03 11:45:00.607061+00	2026-03-03 11:45:00.607061+00
40	AGS Sec	28	2026-03-03 11:45:00.607061+00	2026-03-03 11:45:00.607061+00
\.


--
-- Data for Name: proficiency; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.proficiency (id, profile_id, proficiency_type, drone_equipment_id, proficiency_level, flying_hours, trg_cadre, level, duration, location, created_at, updated_at) FROM stdin;
1	37	Drone	9	medium	3.00		brigade	2026-01-26 to 2026-01-26	Test IT	2026-02-25 11:00:24.0272+00	2026-02-25 11:00:24.0272+00
2	37	Others	\N		\N	Test Trg Carde	division	2026-01-28 to 2026-01-29	dev test	2026-02-25 11:01:01.810998+00	2026-02-25 11:01:01.810998+00
3	33	Drone	7	high	10000.00		brigade	2025-01-26 to 2026-02-26		2026-02-26 12:57:31.115432+00	2026-03-03 07:16:18.013105+00
\.


--
-- Data for Name: punishment_offence; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.punishment_offence (id, profile_id, endorsed, offence, date_of_offence, punishment_awarded, remarks, created_at, updated_at, section_aa, type_of_entry) FROM stdin;
1	10	t	utryueyutu	2026-03-05	y		2026-03-05 09:11:14.900305+00	2026-03-05 09:11:27.856+00	aa	black ink
\.


--
-- Data for Name: rank_categories; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.rank_categories (id, name, is_active, created_at, updated_at, "order") FROM stdin;
1	Officers	t	2025-10-30 05:52:01.09+00	2026-02-25 10:49:37.554892+00	1
2	Junior Commissioned Officers (JCO)	t	2025-10-30 05:52:01.09+00	2026-02-25 10:49:38.655486+00	2
3	Other Ranks (OR)	t	2025-10-30 05:52:01.09+00	2026-02-25 10:49:39.436867+00	3
\.


--
-- Data for Name: ranks; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.ranks (id, name, abbreviation, category_id, is_active, created_at, updated_at, "order") FROM stdin;
82	AV	\N	3	f	2026-01-02 05:54:51.301+00	2026-01-02 05:55:01.029+00	0
72	Havaldar	\N	3	t	2025-12-08 14:43:04.581+00	2026-02-25 10:49:40.437712+00	1
71	Lance Havaldar	\N	3	t	2025-12-08 14:43:04.581+00	2026-02-25 10:49:41.343841+00	2
70	Naik	\N	3	t	2025-12-08 14:43:04.581+00	2026-02-25 10:49:41.723301+00	3
69	Lance Naik	\N	3	t	2025-12-08 14:43:04.581+00	2026-02-25 10:49:42.038007+00	4
68	Rifleman	\N	3	t	2025-12-08 14:43:04.581+00	2026-02-25 10:49:43.475992+00	5
88	Agniveer	\N	3	t	2026-01-06 12:20:47.299+00	2026-02-25 10:49:43.976759+00	6
75	Subedar Major	\N	2	t	2025-12-08 14:43:04.581+00	2026-02-25 10:49:44.283162+00	1
74	Subedar	\N	2	t	2025-12-08 14:43:04.581+00	2026-02-25 10:49:45.059925+00	2
73	Naib Subedar	\N	2	t	2025-12-08 14:43:04.581+00	2026-02-25 10:49:45.864789+00	3
80	Colonel	\N	1	t	2025-12-08 14:43:04.581+00	2026-02-25 10:49:46.348816+00	1
79	Lieutenant Colonel	\N	1	t	2025-12-08 14:43:04.581+00	2026-02-25 10:49:46.887887+00	2
78	Major	\N	1	t	2025-12-08 14:43:04.581+00	2026-02-25 10:49:47.708342+00	3
77	Captain	\N	1	t	2025-12-08 14:43:04.581+00	2026-02-25 10:49:48.111897+00	4
76	Lieutenant	\N	1	t	2025-12-08 14:43:04.581+00	2026-02-25 10:49:48.493982+00	5
\.


--
-- Data for Name: recommendation; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.recommendation (id, profile_id, note, created_at, updated_at, recommendation_a, recommendation_b) FROM stdin;
\.


--
-- Data for Name: reportees; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.reportees (id, supervisor_id, reportee_id, status, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: special_employment_suitability; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.special_employment_suitability (id, profile_id, note, created_at, updated_at, suitable_for_special_emp_a, suitable_for_special_emp_b) FROM stdin;
\.


--
-- Data for Name: tradesmen; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.tradesmen (id, trade_name, created_at, updated_at) FROM stdin;
1	Clk (SD)	2026-02-25 10:50:31.005954+00	2026-02-25 10:50:31.005954+00
2	Community Chef	2026-02-25 10:50:31.532545+00	2026-02-25 10:50:31.532545+00
3	Tailor	2026-02-25 10:50:32.252203+00	2026-02-25 10:50:32.252203+00
4	ER	2026-02-25 10:50:32.709907+00	2026-02-25 10:50:32.709907+00
5	Housekeeper	2026-02-25 10:50:33.731138+00	2026-02-25 10:50:33.731138+00
6	Dresser	2026-02-25 10:50:34.433076+00	2026-02-25 10:50:34.433076+00
7	Steward	2026-02-25 10:50:34.991307+00	2026-02-25 10:50:34.991307+00
8	Artisan	2026-02-25 10:50:35.836342+00	2026-02-25 10:50:35.836342+00
9	Painter	2026-02-25 10:50:36.452457+00	2026-02-25 10:50:36.452457+00
10	Washerman	2026-02-25 10:50:36.774413+00	2026-02-25 10:50:36.774413+00
11	Mess Keeper	2026-02-25 10:50:37.271664+00	2026-02-25 10:50:37.271664+00
12	Mess Chef	2026-02-25 10:50:38.153217+00	2026-02-25 10:50:38.153217+00
\.


--
-- Data for Name: user_course_mapping; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_course_mapping (id, profile_id, course_id, remarks, created_at, updated_at, completion_date, grade, status, certificate_url, is_active, start_date, end_date) FROM stdin;
2	34	2	\N	2025-11-26 06:25:02.907+00	2025-11-26 06:25:02.907+00	\N	\N	planned	\N	t	\N	\N
1	34	6	\N	2025-11-26 06:24:53.08+00	2025-11-26 06:24:53.08+00	2025-11-04	AI	obtained	\N	t	2025-11-04	2025-11-04
3	33	5	Planning	2025-12-09 04:14:30.489+00	2025-12-09 04:14:30.489+00	2025-12-30	\N	planned	\N	t	2025-12-01	2025-12-30
4	32	5	\N	2025-12-09 04:40:31.041+00	2025-12-09 04:40:31.041+00	2025-12-16	\N	planned	\N	t	2025-12-09	2025-12-16
8	39	6	\N	2025-12-30 06:48:20.569+00	2025-12-30 06:48:20.569+00	2026-02-28	\N	planned	\N	t	2025-12-31	2026-02-28
9	41	5	\N	2025-12-30 06:54:26.813+00	2025-12-30 06:54:26.813+00	2026-01-10	\N	planned	\N	t	2025-12-25	2026-01-10
7	40	7		2025-12-30 06:47:14.285+00	2026-03-05 06:12:19.409949+00	2025-06-30	AI	obtained	\N	t	2025-01-30	2025-06-30
17	63	6		2026-03-06 04:31:31.185887+00	2026-03-06 04:31:31.185887+00	\N		obtained		t	2026-03-06	2026-03-07
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, army_no, password, role, created_at, updated_at, password_changed) FROM stdin;
4	4201187K	$2a$10$/RMVNDbLfqfaW9IuKP32ZeyzsKOTLTsukVdgvkQWBVdiBAc6GCnhW	personnel	2025-11-13 08:33:39.388+00	2025-11-13 08:33:39.388+00	f
5	4204523H	$2a$10$zkfYdhbsWlgsPwqE8PUNmOkPMGyx4Yb71vNY0VWnjzqFzQsHTW4jW	personnel	2025-11-13 08:36:33.181+00	2025-11-13 08:36:33.181+00	f
6	4203094P	$2a$10$v/aIa3/0rrCuLB1j97nTLuTQyJWAnASwz95lECYShAgoL0P3qIxQ.	personnel	2025-11-13 08:38:00.319+00	2025-11-13 08:38:00.319+00	f
9	4205983M	$2a$10$oHqStBbZ/QkufbxbJ4VbVuAd4GbZv1YtHTcSr6KC6wyGIBbhPXOZC	personnel	2025-11-13 08:52:40.784+00	2025-11-13 08:52:40.784+00	f
10	4207712B	$2a$10$SvLlehIAss2ptk8.Gy11YO7XScVeg/6tvpBs6OP7w7zO8hC2GbOKa	personnel	2025-11-13 17:31:13.297+00	2025-11-13 17:31:13.297+00	f
11	4201439L 	$2a$10$iqCsrZk2sCDnYqHBrMH93.fEWDUa/bCorydE6St167hRzCDwzk92O	personnel	2025-11-13 17:32:07.7+00	2025-11-13 17:32:07.7+00	f
12	4209356F	$2a$10$ibeKMW.eS9n6.m4GByOsIuICMlxb8CQ17jB2xCM4RfxVwqRLPxEja	personnel	2025-11-13 17:33:30.173+00	2025-11-13 17:33:30.173+00	f
14	4200447C	$2a$10$Fnw7wg3JgPlYNn9R4MYN.ucdrwjM.TWtav1tYa/B6C.oH79b7vy8y	personnel	2025-11-13 17:49:50.828+00	2025-11-13 17:49:50.828+00	f
15	4205631R	$2a$10$0IgCb76uvIggQYy1PB4nz.CRhXaE7aiKBu3QogGDEclhJwCnZZ3WW	personnel	2025-11-13 17:51:11.312+00	2025-11-13 17:51:11.312+00	f
16	4207820T	$2a$10$uw34sV7oo1oqnC.gKiiTPejIJshdKQNd73DFmM/s1MLMzb8RfxLYW	personnel	2025-11-13 17:52:20.276+00	2025-11-13 17:52:20.276+00	f
17	4203349N	$2a$10$WIv7DZR.DnSVoC9WyHUev.6.OrOwsLoeRMX1eMIR3oHc3dbmDDFPe	personnel	2025-11-13 17:53:34.105+00	2025-11-13 17:53:34.105+00	f
18	4209016W	$2a$10$pEjNlIUCGRXM4QzczGkNVOY5zVdoR8qRP9jRlSxFp7fwzlTjBQUbW	personnel	2025-11-13 17:54:57.525+00	2025-11-13 17:54:57.525+00	f
19	4201283E	$2a$10$j5K3yRXLGmKs6izrIbDUrORjpZi9CdlTnhbkEI7s.OYJqMYgBsTjG	personnel	2025-11-13 18:01:00.29+00	2025-11-13 18:01:00.29+00	f
20	4204572D	$2a$10$gUVrRJtH4/7i.5CLffWiLudBp2BIXpGjwquEqGcpaOo5y/DckOL8u	personnel	2025-11-13 18:02:03.504+00	2025-11-13 18:02:03.504+00	f
21	4206164U	$2a$10$kUZl7Px8zAedc5Z.u38x1.3hdfUEcYJSkZLr94HaAii9/gF8Fhq06	personnel	2025-11-13 18:03:24.081+00	2025-11-13 18:03:24.081+00	f
22	4207325Q	$2a$10$xAQJSaDvgqvCUmS21TRjDOzWV/pvRZ0A1z2z3x.Br4Mr9CtgNx8y6	personnel	2025-11-13 18:04:28.06+00	2025-11-13 18:04:28.06+00	f
24	4205108V	$2a$10$9337J2f4K8qdr2csQsFzmu7iJBd0jX6gAUJ026fsW1t8OxBUcA1aK	personnel	2025-11-13 18:06:58.928+00	2025-11-13 18:06:58.928+00	f
25	4206942Z	$2a$10$uSQYNXkDJiCLXjyic3O2CeksdhWO79gNYM4yKTMYK1Zqd2tzLNCNy	personnel	2025-11-13 18:08:09.875+00	2025-11-13 18:08:09.875+00	f
26	4203771Y	$2a$10$4F2Hzgiwq9IR0TlZ7TereeIFN.p/YiVJ4j1wnQcFpu54CQTF66wY6	personnel	2025-11-13 18:09:14.723+00	2025-11-13 18:09:14.723+00	f
27	4208465K	$2a$10$.yn7ra32wjRECeB3/Om0V.srLpyKzMRPBQi1PDhsB1TFWf5isicXG	personnel	2025-11-13 18:10:40.653+00	2025-11-13 18:10:40.653+00	f
28	4202198P	$2a$10$c8oksSF02CWNzDiOJQ20l.rJiW4nkVw87rVUkZo.lBJoziwTuXZgm	personnel	2025-11-13 18:11:37.642+00	2025-11-13 18:11:37.642+00	f
31	4204681A	$2a$10$irlJE0WmNjCRBBnM9k2X1ubbSIdXGvfmieFyD0C4iboJniMQuavKq	personnel	2025-11-13 18:14:33.339+00	2025-11-13 18:14:33.339+00	f
30	4207912J	$2a$10$NNo8uNKGLp1ufH3uJe9IL.9st5wYLGEwoq8YXYGPW0l9CaVvSXcN2	personnel	2025-11-13 18:13:36.461+00	2025-11-13 18:17:44.442+00	t
34	83933	$2a$10$UivPxV1yxY9PCDtBaehKNu83chHVH5ZMw4Bt6GW7.CtUpJg81cxyW	commander	2025-11-20 04:42:18.406+00	2025-11-20 05:12:23.509+00	t
32	4201384L	$2a$10$i9GQuvORxLhwqWG60Ql1yOhCnH5Y4rcbwVHfQiADjtHJ3qWnTsOdy	personnel	2025-11-13 18:15:41.312+00	2025-11-21 04:36:55.706+00	t
8	4202241X	$2a$10$Fg5k4OBUTsLY7ZJcDtz0FOrkxTuh3GzN1IzYzs4kXD6q/vT159XH6	commander	2025-11-13 08:50:48.702+00	2025-11-21 04:48:59.43+00	t
33	4209257F	$2a$10$/24xeeNY8qOyaaom3gybZ.q5YD6xYvnkpeAErRYdRMiSeBpulqN/2	personnel	2025-11-13 18:16:32.312+00	2025-12-09 04:20:37.837+00	t
39	4096890Y	$2a$10$m655p7WNg37692477YmrcOJU1QvIB3QJSyR9EaJVP/7FE944uhjDm	personnel	2025-12-29 04:24:30.887+00	2025-12-29 04:24:30.887+00	f
40	4203253N	$2a$10$wEh8XOxgMS.BMJgdT8jQJ.FYqP.hfs8g0IBYegSyfF8OyMgPJG6dm	personnel	2025-12-29 04:57:06.028+00	2025-12-29 04:57:06.028+00	f
41	4415236	$2a$10$qtMt3/ocYrgGheoYIN0Pnu0qXooiypfESk6vLhyCBWqr/J1urW7A6	personnel	2025-12-30 05:52:13.074+00	2025-12-30 05:52:13.074+00	f
42	4203739y	$2a$10$/BmWRc/NvxIXvlX0hEw0ne8AZvL7pxdng9uWT7cjpG46Sidyta2HK	personnel	2026-01-01 06:18:53.899+00	2026-01-01 06:18:53.899+00	f
1	ADMIN001	$2a$10$s1LX9o0p.YxADcOZFIY24OQa4D2jPseuehB5jtokPaHlJTZ9C5sKW	admin	2025-10-30 05:52:00.99+00	2025-10-30 05:52:00.99+00	f
44	ADMIN002	$2a$10$Symy2PP6Si34kdGDbCcbY./7S//332JnV6LMbigPRrMnEbGSxeD9e	admin	2026-02-27 10:10:09.901598+00	2026-02-27 10:10:09.901598+00	f
37	4685552A	$2a$10$OwXzRxj1JN9h00tpVM7YmucnWp9hLzJV9Z0NVSGA5qHBApFE1MuIu	personnel	2025-12-29 04:04:23.723+00	2026-03-05 07:31:06.829407+00	t
7	4206678A	$2a$10$9E8HWECTFxXbDH7Bekmabe7.w/MoPLum70fQs1Ulk.P1cnj31oaVa	personnel	2025-11-13 08:43:54.263+00	2026-03-04 09:42:47.200326+00	f
51	67471436	$2a$10$r7DRKrLzzy2g3NsS1/YhwuDW25vNr8FzcbmcHIZ./lJ5T8bbBSNsu	personnel	2026-03-04 11:08:31.889737+00	2026-03-04 11:08:31.889737+00	f
13	4208124J	$2a$10$v6XvS/fUNgdYCLUB6PVJwO8aBzOGHMzDwdb6nxNT9EswpNOau9ksS	commander	2025-11-13 17:48:30.106+00	2026-03-04 09:43:38.883159+00	t
43	4105869U	$2a$10$wrW2tryhBilyhg.5G0cmJeNiZGO6du3iBNS0JcopO7a1GRWF6bT76	commander	2026-01-02 05:43:48.325+00	2026-03-04 09:47:05.005053+00	t
47	ARMY@1234	$2a$10$vDGc9mNJ6fEoRtRyU8246O9Jy6fgOFaiCwYbIAgRvze8ggHSEuMVW	personnel	2026-03-04 10:06:00.688578+00	2026-03-04 10:06:00.688578+00	f
48	test	$2a$10$Z7oI3XeDDqZqttVKFcduOOkP36MItUxcImv.OCevnZvzN6vm7zaCq	personnel	2026-03-04 10:11:45.060542+00	2026-03-04 10:11:45.060542+00	f
49	Army00123	$2a$10$rCt/qTFKibDo/TXvf0k7sulQB13iy4HsgL8rjbHQMWPOjOlib8iDm	personnel	2026-03-04 10:19:30.760807+00	2026-03-04 10:19:30.760807+00	f
53	test11	$2a$10$PRAF0eN6f/9GA3M6T4C3s.tZRivdrzGuJcIYQneeJlmap2K1.hMyC	personnel	2026-03-04 11:27:53.814482+00	2026-03-04 11:27:53.814482+00	f
3	ARMY001	$2a$10$cD94nyQEgVtevmy4d5Mxf.2SziVt4mMlk.EeWTk6Vc1Mk2qGZnH1i	commander	2025-10-30 08:58:59.744+00	2026-03-04 12:19:31.440806+00	t
45	19565995695	$2a$10$y1wcSbuCN0Pvs0O5frK/luTLTi3ZDmV8YYmyewCthQq9F3ZsChkcy	personnel	2026-03-03 11:29:05.492342+00	2026-03-05 07:09:14.754663+00	t
58	2678456	$2a$10$JdtUAZn7sPVBwvdelYVoJuDC/antYTGIw/5T5BAP9C1lg6DYqyxAG	commander	2026-03-05 07:46:19.821201+00	2026-03-05 07:59:37.910585+00	t
60	65346	$2a$10$gvAKT3U6xiJ8gmdsnnmQkuDIL.kDTlk8eLORW.ZZ/S4X.qKJ7nK/u	personnel	2026-03-05 08:13:21.594791+00	2026-03-05 08:13:21.594791+00	f
23	4202845S	$2a$10$5tTXD6HJxIA7BltLr/khke3TuY0TYXp9CvOK9uZ3jtS35WkLHtT8W	personnel	2025-11-13 18:05:36.904+00	2026-03-05 10:32:33.041033+00	t
63	234	$2a$10$0u4JI8Lb5YdAVYuc47fKSuVKDe6hHY4v2cPRc9wtbG7Wl7t/a9gGa	personnel	2026-03-06 04:30:45.092985+00	2026-03-06 04:30:45.092985+00	f
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

SELECT pg_catalog.setval('public.companies_id_seq', 30, true);


--
-- Name: company_personnel_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.company_personnel_id_seq', 62, true);


--
-- Name: course_master_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.course_master_id_seq', 18, true);


--
-- Name: documents_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.documents_id_seq', 3, true);


--
-- Name: drone_equipment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.drone_equipment_id_seq', 12, true);


--
-- Name: ere_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.ere_id_seq', 9, true);


--
-- Name: family_details_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.family_details_id_seq', 4, true);


--
-- Name: family_problem_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.family_problem_id_seq', 3, true);


--
-- Name: field_service_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.field_service_id_seq', 4, true);


--
-- Name: foreign_posting_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.foreign_posting_id_seq', 5, true);


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

SELECT pg_catalog.setval('public.hospitalisation_id_seq', 1, true);


--
-- Name: leave_approvals_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.leave_approvals_id_seq', 7, true);


--
-- Name: leave_extensions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.leave_extensions_id_seq', 1, false);


--
-- Name: leave_requests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.leave_requests_id_seq', 11, true);


--
-- Name: leave_types_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.leave_types_id_seq', 24, true);


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

SELECT pg_catalog.setval('public.out_station_employment_id_seq', 4, true);


--
-- Name: personnel_education_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.personnel_education_id_seq', 3, true);


--
-- Name: personnel_profile_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.personnel_profile_id_seq', 63, true);


--
-- Name: personnel_sports_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.personnel_sports_id_seq', 2, true);


--
-- Name: platoons_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.platoons_id_seq', 40, true);


--
-- Name: proficiency_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.proficiency_id_seq', 6, true);


--
-- Name: punishment_offence_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.punishment_offence_id_seq', 1, true);


--
-- Name: rank_categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.rank_categories_id_seq', 12, true);


--
-- Name: ranks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.ranks_id_seq', 171, true);


--
-- Name: recommendation_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.recommendation_id_seq', 1, true);


--
-- Name: reportees_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.reportees_id_seq', 1, false);


--
-- Name: special_employment_suitability_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.special_employment_suitability_id_seq', 1, true);


--
-- Name: tradesmen_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.tradesmen_id_seq', 12, true);


--
-- Name: user_course_mapping_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.user_course_mapping_id_seq', 17, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.users_id_seq', 63, true);


--
-- Name: SequelizeMeta SequelizeMeta_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SequelizeMeta"
    ADD CONSTRAINT "SequelizeMeta_pkey" PRIMARY KEY (name);


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
-- Name: companies companies_company_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_company_name_key UNIQUE (company_name);


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
-- Name: grades grades_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.grades
    ADD CONSTRAINT grades_name_key UNIQUE (name);


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
-- Name: leave_types idx_leave_types_name; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leave_types
    ADD CONSTRAINT idx_leave_types_name UNIQUE (name);


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
-- Name: leave_types leave_types_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leave_types
    ADD CONSTRAINT leave_types_code_key UNIQUE (code);


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
-- Name: rank_categories rank_categories_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rank_categories
    ADD CONSTRAINT rank_categories_name_key UNIQUE (name);


--
-- Name: rank_categories rank_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rank_categories
    ADD CONSTRAINT rank_categories_pkey PRIMARY KEY (id);


--
-- Name: ranks ranks_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ranks
    ADD CONSTRAINT ranks_name_key UNIQUE (name);


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
-- Name: personnel_profile uk_personnel_profile_army_no; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personnel_profile
    ADD CONSTRAINT uk_personnel_profile_army_no UNIQUE (army_no);


--
-- Name: reportees unique_supervisor_reportee; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reportees
    ADD CONSTRAINT unique_supervisor_reportee UNIQUE (supervisor_id, reportee_id);


--
-- Name: user_course_mapping user_course_mapping_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_course_mapping
    ADD CONSTRAINT user_course_mapping_pkey PRIMARY KEY (id);


--
-- Name: users users_army_no_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_army_no_key UNIQUE (army_no);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: companies_company_name; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX companies_company_name ON public.companies USING btree (company_name);


--
-- Name: companies_company_name_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX companies_company_name_unique ON public.companies USING btree (company_name);


--
-- Name: company_personnel_appointment_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX company_personnel_appointment_date ON public.company_personnel USING btree (appointment_date);


--
-- Name: company_personnel_role; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX company_personnel_role ON public.company_personnel USING btree (role);


--
-- Name: company_personnel_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX company_personnel_status ON public.company_personnel USING btree (status);


--
-- Name: documents_army_no; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX documents_army_no ON public.documents USING btree (army_no);


--
-- Name: documents_document_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX documents_document_type ON public.documents USING btree (document_type);


--
-- Name: documents_uploaded_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX documents_uploaded_at ON public.documents USING btree (uploaded_at);


--
-- Name: documents_uploaded_by; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX documents_uploaded_by ON public.documents USING btree (uploaded_by);


--
-- Name: family_details_profile_id_relationship_type; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX family_details_profile_id_relationship_type ON public.family_details USING btree (profile_id, relationship_type);


--
-- Name: grades_is_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX grades_is_active ON public.grades USING btree (is_active);


--
-- Name: grades_name; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX grades_name ON public.grades USING btree (name);


--
-- Name: idx_app_settings_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_app_settings_deleted_at ON public.app_settings USING btree (deleted_at);


--
-- Name: idx_app_settings_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_app_settings_key ON public.app_settings USING btree (key);


--
-- Name: idx_attendance_user_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_attendance_user_date ON public.attendance USING btree (user_id, attendance_date);


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
-- Name: idx_leave_extensions_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_leave_extensions_created_at ON public.leave_extensions USING btree (created_at);


--
-- Name: idx_leave_extensions_extended_by; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_leave_extensions_extended_by ON public.leave_extensions USING btree (extended_by);


--
-- Name: idx_leave_extensions_leave_request_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_leave_extensions_leave_request_id ON public.leave_extensions USING btree (leave_request_id);


--
-- Name: idx_leave_extensions_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_leave_extensions_status ON public.leave_extensions USING btree (status);


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
-- Name: idx_rank_categories_is_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_rank_categories_is_active ON public.rank_categories USING btree (is_active);


--
-- Name: idx_rank_categories_name; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_rank_categories_name ON public.rank_categories USING btree (name);


--
-- Name: idx_ranks_category_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ranks_category_id ON public.ranks USING btree (category_id);


--
-- Name: idx_ranks_is_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ranks_is_active ON public.ranks USING btree (is_active);


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

CREATE INDEX idx_users_army_no ON public.users USING btree (army_no);


--
-- Name: leave_approvals_approver_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX leave_approvals_approver_id ON public.leave_approvals USING btree (approver_id);


--
-- Name: leave_approvals_leave_request_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX leave_approvals_leave_request_id ON public.leave_approvals USING btree (leave_request_id);


--
-- Name: leave_extensions_approved_by; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX leave_extensions_approved_by ON public.leave_extensions USING btree (approved_by);


--
-- Name: leave_extensions_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX leave_extensions_created_at ON public.leave_extensions USING btree (created_at);


--
-- Name: leave_extensions_extended_by; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX leave_extensions_extended_by ON public.leave_extensions USING btree (extended_by);


--
-- Name: leave_extensions_leave_request_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX leave_extensions_leave_request_id ON public.leave_extensions USING btree (leave_request_id);


--
-- Name: leave_extensions_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX leave_extensions_status ON public.leave_extensions USING btree (status);


--
-- Name: leave_requests_personnel_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX leave_requests_personnel_id ON public.leave_requests USING btree (personnel_id);


--
-- Name: leave_requests_start_date_end_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX leave_requests_start_date_end_date ON public.leave_requests USING btree (start_date, end_date);


--
-- Name: leave_requests_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX leave_requests_status ON public.leave_requests USING btree (status);


--
-- Name: leave_requests_supervisor_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX leave_requests_supervisor_id ON public.leave_requests USING btree (supervisor_id);


--
-- Name: personnel_education_is_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX personnel_education_is_active ON public.personnel_education USING btree (is_active);


--
-- Name: personnel_education_personnel_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX personnel_education_personnel_id ON public.personnel_education USING btree (personnel_id);


--
-- Name: personnel_profile_rank_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX personnel_profile_rank_id ON public.personnel_profile USING btree (rank_id);


--
-- Name: rank_categories_is_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX rank_categories_is_active ON public.rank_categories USING btree (is_active);


--
-- Name: rank_categories_name; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX rank_categories_name ON public.rank_categories USING btree (name);


--
-- Name: rank_categories_order; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX rank_categories_order ON public.rank_categories USING btree ("order");


--
-- Name: ranks_category_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ranks_category_id ON public.ranks USING btree (category_id);


--
-- Name: ranks_is_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ranks_is_active ON public.ranks USING btree (is_active);


--
-- Name: ranks_name; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX ranks_name ON public.ranks USING btree (name);


--
-- Name: ranks_order; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ranks_order ON public.ranks USING btree ("order");


--
-- Name: reportees_reportee_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX reportees_reportee_id ON public.reportees USING btree (reportee_id);


--
-- Name: reportees_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX reportees_status ON public.reportees USING btree (status);


--
-- Name: reportees_supervisor_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX reportees_supervisor_id ON public.reportees USING btree (supervisor_id);


--
-- Name: unique_company_personnel; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX unique_company_personnel ON public.company_personnel USING btree (company_id, personnel_id);


--
-- Name: unique_profile_relationship; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX unique_profile_relationship ON public.family_details USING btree (profile_id, relationship_type);


--
-- Name: attendance attendance_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT attendance_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: company_personnel company_personnel_appointed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company_personnel
    ADD CONSTRAINT company_personnel_appointed_by_fkey FOREIGN KEY (appointed_by) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: company_personnel company_personnel_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company_personnel
    ADD CONSTRAINT company_personnel_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: company_personnel company_personnel_personnel_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company_personnel
    ADD CONSTRAINT company_personnel_personnel_id_fkey FOREIGN KEY (personnel_id) REFERENCES public.personnel_profile(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: documents documents_uploaded_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: ere ere_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ere
    ADD CONSTRAINT ere_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.personnel_profile(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: family_details family_details_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.family_details
    ADD CONSTRAINT family_details_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.personnel_profile(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: family_problem family_problem_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.family_problem
    ADD CONSTRAINT family_problem_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.personnel_profile(id) ON DELETE CASCADE;


--
-- Name: field_service field_service_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.field_service
    ADD CONSTRAINT field_service_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.personnel_profile(id) ON DELETE CASCADE;


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
-- Name: foreign_posting foreign_posting_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.foreign_posting
    ADD CONSTRAINT foreign_posting_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.personnel_profile(id) ON DELETE CASCADE;


--
-- Name: leave_approvals leave_approvals_approver_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leave_approvals
    ADD CONSTRAINT leave_approvals_approver_id_fkey FOREIGN KEY (approver_id) REFERENCES public.personnel_profile(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: leave_approvals leave_approvals_leave_request_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leave_approvals
    ADD CONSTRAINT leave_approvals_leave_request_id_fkey FOREIGN KEY (leave_request_id) REFERENCES public.leave_requests(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: leave_extensions leave_extensions_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leave_extensions
    ADD CONSTRAINT leave_extensions_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: leave_extensions leave_extensions_extended_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leave_extensions
    ADD CONSTRAINT leave_extensions_extended_by_fkey FOREIGN KEY (extended_by) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: leave_extensions leave_extensions_leave_request_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leave_extensions
    ADD CONSTRAINT leave_extensions_leave_request_id_fkey FOREIGN KEY (leave_request_id) REFERENCES public.leave_requests(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: leave_requests leave_requests_admin_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leave_requests
    ADD CONSTRAINT leave_requests_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: leave_requests leave_requests_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leave_requests
    ADD CONSTRAINT leave_requests_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.personnel_profile(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: leave_requests leave_requests_leave_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leave_requests
    ADD CONSTRAINT leave_requests_leave_type_id_fkey FOREIGN KEY (leave_type_id) REFERENCES public.leave_types(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: leave_requests leave_requests_leave_type_id_fkey1; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leave_requests
    ADD CONSTRAINT leave_requests_leave_type_id_fkey1 FOREIGN KEY (leave_type_id) REFERENCES public.leave_types(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: leave_requests leave_requests_personnel_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leave_requests
    ADD CONSTRAINT leave_requests_personnel_id_fkey FOREIGN KEY (personnel_id) REFERENCES public.personnel_profile(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: leave_requests leave_requests_supervisor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leave_requests
    ADD CONSTRAINT leave_requests_supervisor_id_fkey FOREIGN KEY (supervisor_id) REFERENCES public.personnel_profile(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: out_station_employment out_station_employment_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.out_station_employment
    ADD CONSTRAINT out_station_employment_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.personnel_profile(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: personnel_education personnel_education_personnel_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personnel_education
    ADD CONSTRAINT personnel_education_personnel_id_fkey FOREIGN KEY (personnel_id) REFERENCES public.personnel_profile(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: personnel_profile personnel_profile_rank_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personnel_profile
    ADD CONSTRAINT personnel_profile_rank_id_fkey FOREIGN KEY (rank_id) REFERENCES public.ranks(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: personnel_profile personnel_profile_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personnel_profile
    ADD CONSTRAINT personnel_profile_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: punishment_offence punishment_offence_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.punishment_offence
    ADD CONSTRAINT punishment_offence_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.personnel_profile(id) ON DELETE CASCADE;


--
-- Name: recommendation recommendation_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recommendation
    ADD CONSTRAINT recommendation_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.personnel_profile(id) ON DELETE CASCADE;


--
-- Name: reportees reportees_reportee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reportees
    ADD CONSTRAINT reportees_reportee_id_fkey FOREIGN KEY (reportee_id) REFERENCES public.personnel_profile(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: reportees reportees_supervisor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reportees
    ADD CONSTRAINT reportees_supervisor_id_fkey FOREIGN KEY (supervisor_id) REFERENCES public.personnel_profile(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: special_employment_suitability special_employment_suitability_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.special_employment_suitability
    ADD CONSTRAINT special_employment_suitability_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.personnel_profile(id) ON DELETE CASCADE;


--
-- Name: user_course_mapping user_course_mapping_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_course_mapping
    ADD CONSTRAINT user_course_mapping_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.course_master(id) ON DELETE CASCADE;


--
-- Name: user_course_mapping user_course_mapping_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_course_mapping
    ADD CONSTRAINT user_course_mapping_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.personnel_profile(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict BZObq9zICfnjYDex9fniHfefTE1K4fUeoXYOrmHH8ARt4H81iQPRScwjuotuJ2J

