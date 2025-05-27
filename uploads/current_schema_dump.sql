--
-- PostgreSQL database dump
--

-- Dumped from database version 16.9
-- Dumped by pg_dump version 16.5

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
-- Name: compliance_status; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public.compliance_status AS ENUM (
    'yes',
    'no',
    'na',
    'partial'
);


ALTER TYPE public.compliance_status OWNER TO neondb_owner;

--
-- Name: hazard_severity; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public.hazard_severity AS ENUM (
    'low',
    'medium',
    'high',
    'critical'
);


ALTER TYPE public.hazard_severity OWNER TO neondb_owner;

--
-- Name: hazard_status; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public.hazard_status AS ENUM (
    'open',
    'assigned',
    'in_progress',
    'resolved',
    'closed'
);


ALTER TYPE public.hazard_status OWNER TO neondb_owner;

--
-- Name: incident_severity; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public.incident_severity AS ENUM (
    'minor',
    'moderate',
    'major',
    'critical'
);


ALTER TYPE public.incident_severity OWNER TO neondb_owner;

--
-- Name: incident_status; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public.incident_status AS ENUM (
    'reported',
    'investigating',
    'resolved',
    'closed'
);


ALTER TYPE public.incident_status OWNER TO neondb_owner;

--
-- Name: inspection_item_type; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public.inspection_item_type AS ENUM (
    'yes_no',
    'multiple_choice',
    'checkbox',
    'numeric',
    'text'
);


ALTER TYPE public.inspection_item_type OWNER TO neondb_owner;

--
-- Name: inspection_status; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public.inspection_status AS ENUM (
    'pending',
    'in_progress',
    'completed'
);


ALTER TYPE public.inspection_status OWNER TO neondb_owner;

--
-- Name: permit_status; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public.permit_status AS ENUM (
    'requested',
    'approved',
    'denied',
    'expired'
);


ALTER TYPE public.permit_status OWNER TO neondb_owner;

--
-- Name: site_role; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public.site_role AS ENUM (
    'site_manager',
    'safety_coordinator',
    'foreman',
    'worker',
    'subcontractor',
    'visitor'
);


ALTER TYPE public.site_role OWNER TO neondb_owner;

--
-- Name: subscription_plan; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public.subscription_plan AS ENUM (
    'basic',
    'standard',
    'premium',
    'enterprise'
);


ALTER TYPE public.subscription_plan OWNER TO neondb_owner;

--
-- Name: user_role; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public.user_role AS ENUM (
    'super_admin',
    'safety_officer',
    'supervisor',
    'subcontractor',
    'employee'
);


ALTER TYPE public.user_role OWNER TO neondb_owner;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: email_templates; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.email_templates (
    id integer NOT NULL,
    tenant_id integer,
    name text NOT NULL,
    subject text NOT NULL,
    body text NOT NULL,
    is_default boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    is_active boolean DEFAULT true NOT NULL
);


ALTER TABLE public.email_templates OWNER TO neondb_owner;

--
-- Name: email_templates_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.email_templates_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.email_templates_id_seq OWNER TO neondb_owner;

--
-- Name: email_templates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.email_templates_id_seq OWNED BY public.email_templates.id;


--
-- Name: hazard_assignments; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.hazard_assignments (
    id integer NOT NULL,
    hazard_id integer NOT NULL,
    assigned_by_id integer NOT NULL,
    assigned_to_user_id integer,
    assigned_to_subcontractor_id integer,
    assigned_at timestamp without time zone DEFAULT now() NOT NULL,
    due_date timestamp without time zone,
    status public.hazard_status DEFAULT 'assigned'::public.hazard_status NOT NULL,
    notes text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    is_active boolean DEFAULT true NOT NULL
);


ALTER TABLE public.hazard_assignments OWNER TO neondb_owner;

--
-- Name: hazard_assignments_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.hazard_assignments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.hazard_assignments_id_seq OWNER TO neondb_owner;

--
-- Name: hazard_assignments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.hazard_assignments_id_seq OWNED BY public.hazard_assignments.id;


--
-- Name: hazard_comments; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.hazard_comments (
    id integer NOT NULL,
    hazard_id integer NOT NULL,
    user_id integer NOT NULL,
    comment text NOT NULL,
    attachment_urls jsonb,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    is_active boolean DEFAULT true NOT NULL
);


ALTER TABLE public.hazard_comments OWNER TO neondb_owner;

--
-- Name: hazard_comments_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.hazard_comments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.hazard_comments_id_seq OWNER TO neondb_owner;

--
-- Name: hazard_comments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.hazard_comments_id_seq OWNED BY public.hazard_comments.id;


--
-- Name: hazard_reports; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.hazard_reports (
    id integer NOT NULL,
    tenant_id integer NOT NULL,
    site_id integer NOT NULL,
    reported_by_id integer NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    location text NOT NULL,
    gps_coordinates text,
    hazard_type text NOT NULL,
    severity public.hazard_severity NOT NULL,
    status public.hazard_status DEFAULT 'open'::public.hazard_status NOT NULL,
    recommended_action text,
    photo_urls jsonb,
    video_ids jsonb,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    resolved_at timestamp without time zone,
    is_active boolean DEFAULT true NOT NULL,
    weather_conditions character varying(100)
);


ALTER TABLE public.hazard_reports OWNER TO neondb_owner;

--
-- Name: hazard_reports_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.hazard_reports_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.hazard_reports_id_seq OWNER TO neondb_owner;

--
-- Name: hazard_reports_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.hazard_reports_id_seq OWNED BY public.hazard_reports.id;


--
-- Name: incident_reports; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.incident_reports (
    id integer NOT NULL,
    tenant_id integer NOT NULL,
    site_id integer NOT NULL,
    reported_by_id integer NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    incident_date timestamp without time zone NOT NULL,
    location text NOT NULL,
    incident_type text NOT NULL,
    severity public.incident_severity NOT NULL,
    injury_occurred boolean DEFAULT false NOT NULL,
    injury_details text,
    witnesses jsonb,
    root_cause text,
    corrective_actions text,
    preventative_measures text,
    photo_urls jsonb,
    video_ids jsonb,
    document_urls jsonb,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    status public.incident_status DEFAULT 'reported'::public.incident_status NOT NULL
);


ALTER TABLE public.incident_reports OWNER TO neondb_owner;

--
-- Name: incident_reports_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.incident_reports_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.incident_reports_id_seq OWNER TO neondb_owner;

--
-- Name: incident_reports_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.incident_reports_id_seq OWNED BY public.incident_reports.id;


--
-- Name: inspection_checklist_items; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.inspection_checklist_items (
    id integer NOT NULL,
    template_id integer NOT NULL,
    category text,
    question text NOT NULL,
    description text,
    expected_answer text DEFAULT 'yes'::text,
    is_critical boolean DEFAULT false,
    sort_order integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    is_active boolean DEFAULT true NOT NULL
);


ALTER TABLE public.inspection_checklist_items OWNER TO neondb_owner;

--
-- Name: inspection_checklist_items_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.inspection_checklist_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.inspection_checklist_items_id_seq OWNER TO neondb_owner;

--
-- Name: inspection_checklist_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.inspection_checklist_items_id_seq OWNED BY public.inspection_checklist_items.id;


--
-- Name: inspection_findings; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.inspection_findings (
    id integer NOT NULL,
    inspection_id integer NOT NULL,
    description text NOT NULL,
    recommended_action text,
    severity text NOT NULL,
    priority text NOT NULL,
    due_date timestamp without time zone,
    status text DEFAULT 'open'::text NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    photo_urls jsonb DEFAULT '[]'::jsonb,
    assigned_to_id integer,
    created_by_id integer NOT NULL,
    resolved_by_id integer,
    resolved_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.inspection_findings OWNER TO neondb_owner;

--
-- Name: inspection_findings_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.inspection_findings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.inspection_findings_id_seq OWNER TO neondb_owner;

--
-- Name: inspection_findings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.inspection_findings_id_seq OWNED BY public.inspection_findings.id;


--
-- Name: inspection_items; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.inspection_items (
    id integer NOT NULL,
    section_id integer NOT NULL,
    question text NOT NULL,
    type public.inspection_item_type DEFAULT 'yes_no'::public.inspection_item_type NOT NULL,
    description text,
    required boolean DEFAULT true NOT NULL,
    category text,
    options jsonb,
    "order" integer DEFAULT 0 NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.inspection_items OWNER TO neondb_owner;

--
-- Name: inspection_items_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.inspection_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.inspection_items_id_seq OWNER TO neondb_owner;

--
-- Name: inspection_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.inspection_items_id_seq OWNED BY public.inspection_items.id;


--
-- Name: inspection_questions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.inspection_questions (
    id integer NOT NULL,
    template_id integer,
    question_text text NOT NULL,
    question_type character varying(50) NOT NULL,
    options text[],
    is_required boolean DEFAULT false,
    order_index integer DEFAULT 0
);


ALTER TABLE public.inspection_questions OWNER TO neondb_owner;

--
-- Name: inspection_questions_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.inspection_questions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.inspection_questions_id_seq OWNER TO neondb_owner;

--
-- Name: inspection_questions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.inspection_questions_id_seq OWNED BY public.inspection_questions.id;


--
-- Name: inspection_responses; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.inspection_responses (
    id integer NOT NULL,
    inspection_id integer NOT NULL,
    checklist_item_id integer,
    response text,
    photo_urls jsonb DEFAULT '[]'::jsonb,
    is_compliant boolean,
    notes text,
    created_by_id integer,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.inspection_responses OWNER TO neondb_owner;

--
-- Name: inspection_responses_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.inspection_responses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.inspection_responses_id_seq OWNER TO neondb_owner;

--
-- Name: inspection_responses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.inspection_responses_id_seq OWNED BY public.inspection_responses.id;


--
-- Name: inspection_sections; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.inspection_sections (
    id integer NOT NULL,
    template_id integer NOT NULL,
    name text NOT NULL,
    description text,
    "order" integer DEFAULT 0 NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.inspection_sections OWNER TO neondb_owner;

--
-- Name: inspection_sections_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.inspection_sections_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.inspection_sections_id_seq OWNER TO neondb_owner;

--
-- Name: inspection_sections_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.inspection_sections_id_seq OWNED BY public.inspection_sections.id;


--
-- Name: inspection_templates; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.inspection_templates (
    id integer NOT NULL,
    tenant_id integer NOT NULL,
    name text NOT NULL,
    description text,
    category text NOT NULL,
    version text DEFAULT '1.0'::text,
    is_default boolean DEFAULT false,
    created_by_id integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    is_active boolean DEFAULT true NOT NULL
);


ALTER TABLE public.inspection_templates OWNER TO neondb_owner;

--
-- Name: inspection_templates_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.inspection_templates_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.inspection_templates_id_seq OWNER TO neondb_owner;

--
-- Name: inspection_templates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.inspection_templates_id_seq OWNED BY public.inspection_templates.id;


--
-- Name: inspections; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.inspections (
    id integer NOT NULL,
    tenant_id integer NOT NULL,
    site_id integer NOT NULL,
    inspector_id integer NOT NULL,
    inspection_type text NOT NULL,
    title text NOT NULL,
    description text,
    scheduled_date timestamp without time zone NOT NULL,
    completed_date timestamp without time zone,
    status public.inspection_status DEFAULT 'pending'::public.inspection_status NOT NULL,
    result text,
    findings jsonb,
    photo_urls jsonb,
    video_ids jsonb,
    document_urls jsonb,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    template_id integer,
    due_date timestamp without time zone,
    started_at timestamp without time zone,
    assigned_to_id integer
);


ALTER TABLE public.inspections OWNER TO neondb_owner;

--
-- Name: inspections_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.inspections_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.inspections_id_seq OWNER TO neondb_owner;

--
-- Name: inspections_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.inspections_id_seq OWNED BY public.inspections.id;


--
-- Name: migration_history; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.migration_history (
    id integer NOT NULL,
    migration_name character varying(255) NOT NULL,
    applied_at timestamp without time zone DEFAULT now(),
    checksum character varying(64)
);


ALTER TABLE public.migration_history OWNER TO neondb_owner;

--
-- Name: migration_history_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.migration_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.migration_history_id_seq OWNER TO neondb_owner;

--
-- Name: migration_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.migration_history_id_seq OWNED BY public.migration_history.id;


--
-- Name: permit_requests; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.permit_requests (
    id integer NOT NULL,
    tenant_id integer NOT NULL,
    site_id integer NOT NULL,
    requester_id integer NOT NULL,
    approver_id integer,
    permit_type text NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    location text NOT NULL,
    start_date timestamp without time zone NOT NULL,
    end_date timestamp without time zone NOT NULL,
    status public.permit_status DEFAULT 'requested'::public.permit_status NOT NULL,
    approval_date timestamp without time zone,
    denial_reason text,
    attachment_urls jsonb,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    is_active boolean DEFAULT true NOT NULL
);


ALTER TABLE public.permit_requests OWNER TO neondb_owner;

--
-- Name: permit_requests_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.permit_requests_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.permit_requests_id_seq OWNER TO neondb_owner;

--
-- Name: permit_requests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.permit_requests_id_seq OWNED BY public.permit_requests.id;


--
-- Name: report_history; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.report_history (
    id integer NOT NULL,
    tenant_id integer NOT NULL,
    user_id integer NOT NULL,
    site_id integer NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    report_name text NOT NULL,
    report_url text,
    status text DEFAULT 'generated'::text NOT NULL
);


ALTER TABLE public.report_history OWNER TO neondb_owner;

--
-- Name: report_history_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.report_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.report_history_id_seq OWNER TO neondb_owner;

--
-- Name: report_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.report_history_id_seq OWNED BY public.report_history.id;


--
-- Name: role_permissions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.role_permissions (
    id integer NOT NULL,
    tenant_id integer NOT NULL,
    role public.user_role NOT NULL,
    resource text NOT NULL,
    action text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    is_active boolean DEFAULT true NOT NULL
);


ALTER TABLE public.role_permissions OWNER TO neondb_owner;

--
-- Name: role_permissions_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.role_permissions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.role_permissions_id_seq OWNER TO neondb_owner;

--
-- Name: role_permissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.role_permissions_id_seq OWNED BY public.role_permissions.id;


--
-- Name: site_personnel; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.site_personnel (
    id integer NOT NULL,
    site_id integer NOT NULL,
    user_id integer NOT NULL,
    tenant_id integer NOT NULL,
    site_role text DEFAULT 'worker'::text NOT NULL,
    assigned_by_id integer NOT NULL,
    start_date date,
    end_date date,
    permissions jsonb,
    team_id integer,
    notes text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    CONSTRAINT site_personnel_site_role_check CHECK ((site_role = ANY (ARRAY['site_manager'::text, 'safety_coordinator'::text, 'foreman'::text, 'worker'::text, 'subcontractor'::text, 'visitor'::text])))
);


ALTER TABLE public.site_personnel OWNER TO neondb_owner;

--
-- Name: site_personnel_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.site_personnel_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.site_personnel_id_seq OWNER TO neondb_owner;

--
-- Name: site_personnel_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.site_personnel_id_seq OWNED BY public.site_personnel.id;


--
-- Name: sites; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.sites (
    id integer NOT NULL,
    tenant_id integer NOT NULL,
    name text NOT NULL,
    address text NOT NULL,
    city text NOT NULL,
    state text NOT NULL,
    zip_code text NOT NULL,
    country text NOT NULL,
    gps_coordinates text,
    contact_name text,
    contact_phone text,
    contact_email text,
    start_date date,
    end_date date,
    status text DEFAULT 'active'::text NOT NULL,
    description text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    is_active boolean DEFAULT true NOT NULL
);


ALTER TABLE public.sites OWNER TO neondb_owner;

--
-- Name: sites_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.sites_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sites_id_seq OWNER TO neondb_owner;

--
-- Name: sites_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.sites_id_seq OWNED BY public.sites.id;


--
-- Name: subcontractors; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.subcontractors (
    id integer NOT NULL,
    tenant_id integer NOT NULL,
    name text NOT NULL,
    contact_person text NOT NULL,
    email text NOT NULL,
    phone text NOT NULL,
    address text,
    city text,
    state text,
    zip_code text,
    country text,
    contract_number text,
    contract_start_date date,
    contract_end_date date,
    services_provided text,
    status text DEFAULT 'active'::text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    is_active boolean DEFAULT true NOT NULL
);


ALTER TABLE public.subcontractors OWNER TO neondb_owner;

--
-- Name: subcontractors_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.subcontractors_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.subcontractors_id_seq OWNER TO neondb_owner;

--
-- Name: subcontractors_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.subcontractors_id_seq OWNED BY public.subcontractors.id;


--
-- Name: system_logs; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.system_logs (
    id integer NOT NULL,
    tenant_id integer,
    user_id integer,
    action text NOT NULL,
    entity_type text,
    entity_id text,
    details jsonb,
    ip_address text,
    user_agent text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.system_logs OWNER TO neondb_owner;

--
-- Name: system_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.system_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.system_logs_id_seq OWNER TO neondb_owner;

--
-- Name: system_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.system_logs_id_seq OWNED BY public.system_logs.id;


--
-- Name: team_members; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.team_members (
    id integer NOT NULL,
    team_id integer,
    user_id integer,
    site_role public.site_role DEFAULT 'worker'::public.site_role,
    joined_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.team_members OWNER TO neondb_owner;

--
-- Name: team_members_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.team_members_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.team_members_id_seq OWNER TO neondb_owner;

--
-- Name: team_members_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.team_members_id_seq OWNED BY public.team_members.id;


--
-- Name: teams; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.teams (
    id integer NOT NULL,
    tenant_id integer NOT NULL,
    site_id integer NOT NULL,
    name text NOT NULL,
    description text,
    leader_id integer,
    color text,
    specialties jsonb,
    created_by_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    is_active boolean DEFAULT true NOT NULL
);


ALTER TABLE public.teams OWNER TO neondb_owner;

--
-- Name: teams_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.teams_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.teams_id_seq OWNER TO neondb_owner;

--
-- Name: teams_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.teams_id_seq OWNED BY public.teams.id;


--
-- Name: tenants; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.tenants (
    id integer NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    phone text,
    address text,
    city text,
    state text,
    zip_code text,
    country text,
    logo text,
    subscription_plan public.subscription_plan DEFAULT 'basic'::public.subscription_plan NOT NULL,
    subscription_status text DEFAULT 'active'::text NOT NULL,
    subscription_end_date timestamp without time zone,
    active_users integer DEFAULT 0 NOT NULL,
    max_users integer DEFAULT 5 NOT NULL,
    active_sites integer DEFAULT 0 NOT NULL,
    max_sites integer DEFAULT 1 NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    stripe_customer_id text,
    settings jsonb,
    is_active boolean DEFAULT true NOT NULL
);


ALTER TABLE public.tenants OWNER TO neondb_owner;

--
-- Name: tenants_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.tenants_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tenants_id_seq OWNER TO neondb_owner;

--
-- Name: tenants_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.tenants_id_seq OWNED BY public.tenants.id;


--
-- Name: training_content; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.training_content (
    id integer NOT NULL,
    tenant_id integer,
    title text NOT NULL,
    description text NOT NULL,
    content_type text NOT NULL,
    video_id text,
    document_url text,
    language text DEFAULT 'en'::text NOT NULL,
    duration integer,
    is_common boolean DEFAULT false NOT NULL,
    created_by_id integer,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    is_active boolean DEFAULT true NOT NULL
);


ALTER TABLE public.training_content OWNER TO neondb_owner;

--
-- Name: training_content_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.training_content_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.training_content_id_seq OWNER TO neondb_owner;

--
-- Name: training_content_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.training_content_id_seq OWNED BY public.training_content.id;


--
-- Name: training_courses; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.training_courses (
    id integer NOT NULL,
    tenant_id integer NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    passing_score integer DEFAULT 70 NOT NULL,
    is_required boolean DEFAULT false NOT NULL,
    assigned_roles jsonb,
    assigned_site_ids jsonb,
    assigned_subcontractor_ids jsonb,
    content_ids jsonb,
    created_by_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    is_active boolean DEFAULT true NOT NULL
);


ALTER TABLE public.training_courses OWNER TO neondb_owner;

--
-- Name: training_courses_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.training_courses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.training_courses_id_seq OWNER TO neondb_owner;

--
-- Name: training_courses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.training_courses_id_seq OWNED BY public.training_courses.id;


--
-- Name: training_records; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.training_records (
    id integer NOT NULL,
    tenant_id integer NOT NULL,
    user_id integer NOT NULL,
    course_id integer NOT NULL,
    start_date timestamp without time zone DEFAULT now() NOT NULL,
    completion_date timestamp without time zone,
    score integer,
    passed boolean,
    certificate_url text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    is_active boolean DEFAULT true NOT NULL
);


ALTER TABLE public.training_records OWNER TO neondb_owner;

--
-- Name: training_records_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.training_records_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.training_records_id_seq OWNER TO neondb_owner;

--
-- Name: training_records_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.training_records_id_seq OWNED BY public.training_records.id;


--
-- Name: user_sessions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.user_sessions (
    sid character varying NOT NULL,
    sess json NOT NULL,
    expire timestamp(6) without time zone NOT NULL
);


ALTER TABLE public.user_sessions OWNER TO neondb_owner;

--
-- Name: users; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.users (
    id integer NOT NULL,
    tenant_id integer,
    username text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    role public.user_role DEFAULT 'employee'::public.user_role NOT NULL,
    phone text,
    job_title text,
    department text,
    profile_image_url text,
    permissions jsonb,
    is_active boolean DEFAULT true NOT NULL,
    last_login timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    emergency_contact character varying(255),
    safety_certification_expiry date
);


ALTER TABLE public.users OWNER TO neondb_owner;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO neondb_owner;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: email_templates id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.email_templates ALTER COLUMN id SET DEFAULT nextval('public.email_templates_id_seq'::regclass);


--
-- Name: hazard_assignments id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.hazard_assignments ALTER COLUMN id SET DEFAULT nextval('public.hazard_assignments_id_seq'::regclass);


--
-- Name: hazard_comments id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.hazard_comments ALTER COLUMN id SET DEFAULT nextval('public.hazard_comments_id_seq'::regclass);


--
-- Name: hazard_reports id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.hazard_reports ALTER COLUMN id SET DEFAULT nextval('public.hazard_reports_id_seq'::regclass);


--
-- Name: incident_reports id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.incident_reports ALTER COLUMN id SET DEFAULT nextval('public.incident_reports_id_seq'::regclass);


--
-- Name: inspection_checklist_items id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.inspection_checklist_items ALTER COLUMN id SET DEFAULT nextval('public.inspection_checklist_items_id_seq'::regclass);


--
-- Name: inspection_findings id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.inspection_findings ALTER COLUMN id SET DEFAULT nextval('public.inspection_findings_id_seq'::regclass);


--
-- Name: inspection_items id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.inspection_items ALTER COLUMN id SET DEFAULT nextval('public.inspection_items_id_seq'::regclass);


--
-- Name: inspection_questions id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.inspection_questions ALTER COLUMN id SET DEFAULT nextval('public.inspection_questions_id_seq'::regclass);


--
-- Name: inspection_responses id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.inspection_responses ALTER COLUMN id SET DEFAULT nextval('public.inspection_responses_id_seq'::regclass);


--
-- Name: inspection_sections id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.inspection_sections ALTER COLUMN id SET DEFAULT nextval('public.inspection_sections_id_seq'::regclass);


--
-- Name: inspection_templates id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.inspection_templates ALTER COLUMN id SET DEFAULT nextval('public.inspection_templates_id_seq'::regclass);


--
-- Name: inspections id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.inspections ALTER COLUMN id SET DEFAULT nextval('public.inspections_id_seq'::regclass);


--
-- Name: migration_history id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.migration_history ALTER COLUMN id SET DEFAULT nextval('public.migration_history_id_seq'::regclass);


--
-- Name: permit_requests id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.permit_requests ALTER COLUMN id SET DEFAULT nextval('public.permit_requests_id_seq'::regclass);


--
-- Name: report_history id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.report_history ALTER COLUMN id SET DEFAULT nextval('public.report_history_id_seq'::regclass);


--
-- Name: role_permissions id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.role_permissions ALTER COLUMN id SET DEFAULT nextval('public.role_permissions_id_seq'::regclass);


--
-- Name: site_personnel id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.site_personnel ALTER COLUMN id SET DEFAULT nextval('public.site_personnel_id_seq'::regclass);


--
-- Name: sites id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.sites ALTER COLUMN id SET DEFAULT nextval('public.sites_id_seq'::regclass);


--
-- Name: subcontractors id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.subcontractors ALTER COLUMN id SET DEFAULT nextval('public.subcontractors_id_seq'::regclass);


--
-- Name: system_logs id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.system_logs ALTER COLUMN id SET DEFAULT nextval('public.system_logs_id_seq'::regclass);


--
-- Name: team_members id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.team_members ALTER COLUMN id SET DEFAULT nextval('public.team_members_id_seq'::regclass);


--
-- Name: teams id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.teams ALTER COLUMN id SET DEFAULT nextval('public.teams_id_seq'::regclass);


--
-- Name: tenants id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.tenants ALTER COLUMN id SET DEFAULT nextval('public.tenants_id_seq'::regclass);


--
-- Name: training_content id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.training_content ALTER COLUMN id SET DEFAULT nextval('public.training_content_id_seq'::regclass);


--
-- Name: training_courses id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.training_courses ALTER COLUMN id SET DEFAULT nextval('public.training_courses_id_seq'::regclass);


--
-- Name: training_records id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.training_records ALTER COLUMN id SET DEFAULT nextval('public.training_records_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: email_templates email_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.email_templates
    ADD CONSTRAINT email_templates_pkey PRIMARY KEY (id);


--
-- Name: hazard_assignments hazard_assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.hazard_assignments
    ADD CONSTRAINT hazard_assignments_pkey PRIMARY KEY (id);


--
-- Name: hazard_comments hazard_comments_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.hazard_comments
    ADD CONSTRAINT hazard_comments_pkey PRIMARY KEY (id);


--
-- Name: hazard_reports hazard_reports_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.hazard_reports
    ADD CONSTRAINT hazard_reports_pkey PRIMARY KEY (id);


--
-- Name: incident_reports incident_reports_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.incident_reports
    ADD CONSTRAINT incident_reports_pkey PRIMARY KEY (id);


--
-- Name: inspection_checklist_items inspection_checklist_items_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.inspection_checklist_items
    ADD CONSTRAINT inspection_checklist_items_pkey PRIMARY KEY (id);


--
-- Name: inspection_findings inspection_findings_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.inspection_findings
    ADD CONSTRAINT inspection_findings_pkey PRIMARY KEY (id);


--
-- Name: inspection_items inspection_items_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.inspection_items
    ADD CONSTRAINT inspection_items_pkey PRIMARY KEY (id);


--
-- Name: inspection_questions inspection_questions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.inspection_questions
    ADD CONSTRAINT inspection_questions_pkey PRIMARY KEY (id);


--
-- Name: inspection_responses inspection_responses_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.inspection_responses
    ADD CONSTRAINT inspection_responses_pkey PRIMARY KEY (id);


--
-- Name: inspection_sections inspection_sections_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.inspection_sections
    ADD CONSTRAINT inspection_sections_pkey PRIMARY KEY (id);


--
-- Name: inspection_templates inspection_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.inspection_templates
    ADD CONSTRAINT inspection_templates_pkey PRIMARY KEY (id);


--
-- Name: inspections inspections_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.inspections
    ADD CONSTRAINT inspections_pkey PRIMARY KEY (id);


--
-- Name: migration_history migration_history_migration_name_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.migration_history
    ADD CONSTRAINT migration_history_migration_name_key UNIQUE (migration_name);


--
-- Name: migration_history migration_history_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.migration_history
    ADD CONSTRAINT migration_history_pkey PRIMARY KEY (id);


--
-- Name: permit_requests permit_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.permit_requests
    ADD CONSTRAINT permit_requests_pkey PRIMARY KEY (id);


--
-- Name: report_history report_history_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.report_history
    ADD CONSTRAINT report_history_pkey PRIMARY KEY (id);


--
-- Name: role_permissions role_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_pkey PRIMARY KEY (id);


--
-- Name: user_sessions session_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_sessions
    ADD CONSTRAINT session_pkey PRIMARY KEY (sid);


--
-- Name: site_personnel site_personnel_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.site_personnel
    ADD CONSTRAINT site_personnel_pkey PRIMARY KEY (id);


--
-- Name: sites sites_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.sites
    ADD CONSTRAINT sites_pkey PRIMARY KEY (id);


--
-- Name: subcontractors subcontractors_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.subcontractors
    ADD CONSTRAINT subcontractors_pkey PRIMARY KEY (id);


--
-- Name: system_logs system_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.system_logs
    ADD CONSTRAINT system_logs_pkey PRIMARY KEY (id);


--
-- Name: team_members team_members_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.team_members
    ADD CONSTRAINT team_members_pkey PRIMARY KEY (id);


--
-- Name: team_members team_members_team_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.team_members
    ADD CONSTRAINT team_members_team_id_user_id_key UNIQUE (team_id, user_id);


--
-- Name: teams teams_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.teams
    ADD CONSTRAINT teams_pkey PRIMARY KEY (id);


--
-- Name: tenants tenants_email_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.tenants
    ADD CONSTRAINT tenants_email_unique UNIQUE (email);


--
-- Name: tenants tenants_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.tenants
    ADD CONSTRAINT tenants_pkey PRIMARY KEY (id);


--
-- Name: training_content training_content_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.training_content
    ADD CONSTRAINT training_content_pkey PRIMARY KEY (id);


--
-- Name: training_courses training_courses_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.training_courses
    ADD CONSTRAINT training_courses_pkey PRIMARY KEY (id);


--
-- Name: training_records training_records_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.training_records
    ADD CONSTRAINT training_records_pkey PRIMARY KEY (id);


--
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: IDX_session_expire; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "IDX_session_expire" ON public.user_sessions USING btree (expire);


--
-- Name: idx_email_templates_tenant; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_email_templates_tenant ON public.email_templates USING btree (tenant_id);


--
-- Name: idx_hazard_reports_status; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_hazard_reports_status ON public.hazard_reports USING btree (status);


--
-- Name: idx_hazard_reports_tenant_site; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_hazard_reports_tenant_site ON public.hazard_reports USING btree (tenant_id, site_id);


--
-- Name: idx_incident_reports_tenant_site; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_incident_reports_tenant_site ON public.incident_reports USING btree (tenant_id, site_id);


--
-- Name: idx_inspection_questions_template; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_inspection_questions_template ON public.inspection_questions USING btree (template_id);


--
-- Name: idx_inspections_tenant_site; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_inspections_tenant_site ON public.inspections USING btree (tenant_id, site_id);


--
-- Name: idx_permit_requests_tenant_site; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_permit_requests_tenant_site ON public.permit_requests USING btree (tenant_id, site_id);


--
-- Name: idx_role_permissions_tenant_role; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_role_permissions_tenant_role ON public.role_permissions USING btree (tenant_id, role);


--
-- Name: idx_sites_tenant_id; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_sites_tenant_id ON public.sites USING btree (tenant_id);


--
-- Name: idx_system_logs_created_at; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_system_logs_created_at ON public.system_logs USING btree (created_at);


--
-- Name: idx_system_logs_tenant_user; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_system_logs_tenant_user ON public.system_logs USING btree (tenant_id, user_id);


--
-- Name: idx_team_members_team_user; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_team_members_team_user ON public.team_members USING btree (team_id, user_id);


--
-- Name: idx_training_records_user; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_training_records_user ON public.training_records USING btree (user_id);


--
-- Name: idx_users_certification_expiry; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_users_certification_expiry ON public.users USING btree (safety_certification_expiry) WHERE (safety_certification_expiry IS NOT NULL);


--
-- Name: idx_users_tenant_id; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_users_tenant_id ON public.users USING btree (tenant_id);


--
-- Name: email_templates email_templates_tenant_id_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.email_templates
    ADD CONSTRAINT email_templates_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- Name: hazard_assignments hazard_assignments_assigned_by_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.hazard_assignments
    ADD CONSTRAINT hazard_assignments_assigned_by_id_users_id_fk FOREIGN KEY (assigned_by_id) REFERENCES public.users(id);


--
-- Name: hazard_assignments hazard_assignments_assigned_to_subcontractor_id_subcontractors_; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.hazard_assignments
    ADD CONSTRAINT hazard_assignments_assigned_to_subcontractor_id_subcontractors_ FOREIGN KEY (assigned_to_subcontractor_id) REFERENCES public.subcontractors(id);


--
-- Name: hazard_assignments hazard_assignments_assigned_to_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.hazard_assignments
    ADD CONSTRAINT hazard_assignments_assigned_to_user_id_users_id_fk FOREIGN KEY (assigned_to_user_id) REFERENCES public.users(id);


--
-- Name: hazard_assignments hazard_assignments_hazard_id_hazard_reports_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.hazard_assignments
    ADD CONSTRAINT hazard_assignments_hazard_id_hazard_reports_id_fk FOREIGN KEY (hazard_id) REFERENCES public.hazard_reports(id) ON DELETE CASCADE;


--
-- Name: hazard_comments hazard_comments_hazard_id_hazard_reports_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.hazard_comments
    ADD CONSTRAINT hazard_comments_hazard_id_hazard_reports_id_fk FOREIGN KEY (hazard_id) REFERENCES public.hazard_reports(id) ON DELETE CASCADE;


--
-- Name: hazard_comments hazard_comments_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.hazard_comments
    ADD CONSTRAINT hazard_comments_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: hazard_reports hazard_reports_reported_by_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.hazard_reports
    ADD CONSTRAINT hazard_reports_reported_by_id_users_id_fk FOREIGN KEY (reported_by_id) REFERENCES public.users(id);


--
-- Name: hazard_reports hazard_reports_site_id_sites_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.hazard_reports
    ADD CONSTRAINT hazard_reports_site_id_sites_id_fk FOREIGN KEY (site_id) REFERENCES public.sites(id) ON DELETE CASCADE;


--
-- Name: hazard_reports hazard_reports_tenant_id_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.hazard_reports
    ADD CONSTRAINT hazard_reports_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: incident_reports incident_reports_reported_by_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.incident_reports
    ADD CONSTRAINT incident_reports_reported_by_id_users_id_fk FOREIGN KEY (reported_by_id) REFERENCES public.users(id);


--
-- Name: incident_reports incident_reports_site_id_sites_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.incident_reports
    ADD CONSTRAINT incident_reports_site_id_sites_id_fk FOREIGN KEY (site_id) REFERENCES public.sites(id) ON DELETE CASCADE;


--
-- Name: incident_reports incident_reports_tenant_id_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.incident_reports
    ADD CONSTRAINT incident_reports_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: inspection_checklist_items inspection_checklist_items_template_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.inspection_checklist_items
    ADD CONSTRAINT inspection_checklist_items_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.inspection_templates(id) ON DELETE CASCADE;


--
-- Name: inspection_findings inspection_findings_assigned_to_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.inspection_findings
    ADD CONSTRAINT inspection_findings_assigned_to_id_fkey FOREIGN KEY (assigned_to_id) REFERENCES public.users(id);


--
-- Name: inspection_findings inspection_findings_created_by_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.inspection_findings
    ADD CONSTRAINT inspection_findings_created_by_id_fkey FOREIGN KEY (created_by_id) REFERENCES public.users(id);


--
-- Name: inspection_findings inspection_findings_inspection_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.inspection_findings
    ADD CONSTRAINT inspection_findings_inspection_id_fkey FOREIGN KEY (inspection_id) REFERENCES public.inspections(id);


--
-- Name: inspection_findings inspection_findings_resolved_by_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.inspection_findings
    ADD CONSTRAINT inspection_findings_resolved_by_id_fkey FOREIGN KEY (resolved_by_id) REFERENCES public.users(id);


--
-- Name: inspection_items inspection_items_section_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.inspection_items
    ADD CONSTRAINT inspection_items_section_id_fkey FOREIGN KEY (section_id) REFERENCES public.inspection_sections(id) ON DELETE CASCADE;


--
-- Name: inspection_questions inspection_questions_template_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.inspection_questions
    ADD CONSTRAINT inspection_questions_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.inspection_templates(id) ON DELETE CASCADE;


--
-- Name: inspection_responses inspection_responses_created_by_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.inspection_responses
    ADD CONSTRAINT inspection_responses_created_by_id_fkey FOREIGN KEY (created_by_id) REFERENCES public.users(id);


--
-- Name: inspection_responses inspection_responses_inspection_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.inspection_responses
    ADD CONSTRAINT inspection_responses_inspection_id_fkey FOREIGN KEY (inspection_id) REFERENCES public.inspections(id);


--
-- Name: inspection_sections inspection_sections_template_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.inspection_sections
    ADD CONSTRAINT inspection_sections_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.inspection_templates(id) ON DELETE CASCADE;


--
-- Name: inspection_templates inspection_templates_created_by_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.inspection_templates
    ADD CONSTRAINT inspection_templates_created_by_id_fkey FOREIGN KEY (created_by_id) REFERENCES public.users(id);


--
-- Name: inspection_templates inspection_templates_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.inspection_templates
    ADD CONSTRAINT inspection_templates_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: inspections inspections_inspector_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.inspections
    ADD CONSTRAINT inspections_inspector_id_users_id_fk FOREIGN KEY (inspector_id) REFERENCES public.users(id);


--
-- Name: inspections inspections_site_id_sites_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.inspections
    ADD CONSTRAINT inspections_site_id_sites_id_fk FOREIGN KEY (site_id) REFERENCES public.sites(id) ON DELETE CASCADE;


--
-- Name: inspections inspections_template_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.inspections
    ADD CONSTRAINT inspections_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.inspection_templates(id);


--
-- Name: inspections inspections_tenant_id_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.inspections
    ADD CONSTRAINT inspections_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: permit_requests permit_requests_approver_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.permit_requests
    ADD CONSTRAINT permit_requests_approver_id_users_id_fk FOREIGN KEY (approver_id) REFERENCES public.users(id);


--
-- Name: permit_requests permit_requests_requester_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.permit_requests
    ADD CONSTRAINT permit_requests_requester_id_users_id_fk FOREIGN KEY (requester_id) REFERENCES public.users(id);


--
-- Name: permit_requests permit_requests_site_id_sites_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.permit_requests
    ADD CONSTRAINT permit_requests_site_id_sites_id_fk FOREIGN KEY (site_id) REFERENCES public.sites(id) ON DELETE CASCADE;


--
-- Name: permit_requests permit_requests_tenant_id_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.permit_requests
    ADD CONSTRAINT permit_requests_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: role_permissions role_permissions_tenant_id_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: site_personnel site_personnel_assigned_by_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.site_personnel
    ADD CONSTRAINT site_personnel_assigned_by_id_fkey FOREIGN KEY (assigned_by_id) REFERENCES public.users(id);


--
-- Name: site_personnel site_personnel_site_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.site_personnel
    ADD CONSTRAINT site_personnel_site_id_fkey FOREIGN KEY (site_id) REFERENCES public.sites(id) ON DELETE CASCADE;


--
-- Name: site_personnel site_personnel_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.site_personnel
    ADD CONSTRAINT site_personnel_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: site_personnel site_personnel_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.site_personnel
    ADD CONSTRAINT site_personnel_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: sites sites_tenant_id_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.sites
    ADD CONSTRAINT sites_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: subcontractors subcontractors_tenant_id_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.subcontractors
    ADD CONSTRAINT subcontractors_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: system_logs system_logs_tenant_id_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.system_logs
    ADD CONSTRAINT system_logs_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- Name: system_logs system_logs_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.system_logs
    ADD CONSTRAINT system_logs_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: team_members team_members_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.team_members
    ADD CONSTRAINT team_members_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id) ON DELETE CASCADE;


--
-- Name: team_members team_members_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.team_members
    ADD CONSTRAINT team_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: teams teams_created_by_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.teams
    ADD CONSTRAINT teams_created_by_id_fkey FOREIGN KEY (created_by_id) REFERENCES public.users(id);


--
-- Name: teams teams_leader_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.teams
    ADD CONSTRAINT teams_leader_id_fkey FOREIGN KEY (leader_id) REFERENCES public.users(id);


--
-- Name: teams teams_site_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.teams
    ADD CONSTRAINT teams_site_id_fkey FOREIGN KEY (site_id) REFERENCES public.sites(id) ON DELETE CASCADE;


--
-- Name: teams teams_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.teams
    ADD CONSTRAINT teams_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: training_content training_content_created_by_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.training_content
    ADD CONSTRAINT training_content_created_by_id_users_id_fk FOREIGN KEY (created_by_id) REFERENCES public.users(id);


--
-- Name: training_content training_content_tenant_id_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.training_content
    ADD CONSTRAINT training_content_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- Name: training_courses training_courses_created_by_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.training_courses
    ADD CONSTRAINT training_courses_created_by_id_users_id_fk FOREIGN KEY (created_by_id) REFERENCES public.users(id);


--
-- Name: training_courses training_courses_tenant_id_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.training_courses
    ADD CONSTRAINT training_courses_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: training_records training_records_course_id_training_courses_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.training_records
    ADD CONSTRAINT training_records_course_id_training_courses_id_fk FOREIGN KEY (course_id) REFERENCES public.training_courses(id) ON DELETE CASCADE;


--
-- Name: training_records training_records_tenant_id_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.training_records
    ADD CONSTRAINT training_records_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: training_records training_records_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.training_records
    ADD CONSTRAINT training_records_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: users users_tenant_id_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO neon_superuser WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON TABLES TO neon_superuser WITH GRANT OPTION;


--
-- PostgreSQL database dump complete
--

