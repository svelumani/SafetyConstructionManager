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
-- Data for Name: email_templates; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.email_templates (id, tenant_id, name, subject, body, is_default, created_at, updated_at, is_active) FROM stdin;
\.


--
-- Data for Name: hazard_assignments; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.hazard_assignments (id, hazard_id, assigned_by_id, assigned_to_user_id, assigned_to_subcontractor_id, assigned_at, due_date, status, notes, created_at, updated_at, is_active) FROM stdin;
1	3	4	13	\N	2025-05-20 08:06:41.472976	2025-05-25 08:06:41.472976	assigned	Please inspect and report back ASAP	2025-05-20 08:06:41.472976	2025-05-20 08:06:41.472976	t
2	4	4	16	\N	2025-05-18 08:06:53.847915	2025-05-23 08:06:53.847915	in_progress	Requires immediate specialist assessment	2025-05-18 08:06:53.847915	2025-05-19 08:06:53.847915	t
3	5	4	10	\N	2025-05-17 08:06:53.847915	2025-05-20 08:06:53.847915	resolved	Install proper warning signs	2025-05-17 08:06:53.847915	2025-05-20 08:06:53.847915	t
4	6	4	11	\N	2025-05-16 08:06:53.847915	2025-05-17 08:06:53.847915	closed	Clear pathway immediately	2025-05-16 08:06:53.847915	2025-05-17 08:06:53.847915	t
5	8	4	14	\N	2025-05-19 08:06:53.847915	2025-05-24 08:06:53.847915	assigned	Follow proper chemical storage protocols	2025-05-19 08:06:53.847915	2025-05-19 08:06:53.847915	t
6	9	4	15	\N	2025-05-18 08:06:53.847915	2025-05-23 08:06:53.847915	in_progress	Remove trip hazard and install proper outlets	2025-05-18 08:06:53.847915	2025-05-19 08:06:53.847915	t
\.


--
-- Data for Name: hazard_comments; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.hazard_comments (id, hazard_id, user_id, comment, attachment_urls, created_at, updated_at, is_active) FROM stdin;
1	3	13	I have inspected the scaffolding and confirmed several loose connections. We need replacement parts before anyone can access it.	[]	2025-05-21 08:07:15.161791	2025-05-21 08:07:15.161791	t
2	4	16	I have contacted the testing lab. They will be on site tomorrow to take samples for analysis. Area has been cordoned off.	[]	2025-05-20 08:07:15.161791	2025-05-20 08:07:15.161791	t
3	4	4	Thank you for the quick response. Please keep us updated on the lab results as soon as they arrive.	[]	2025-05-20 08:07:15.161791	2025-05-20 08:07:15.161791	t
4	5	10	Warning signs have been placed and the area has been treated with anti-slip solution. Safe to use now.	["https://placehold.co/400x300?text=Warning+Signs"]	2025-05-19 08:07:15.161791	2025-05-19 08:07:15.161791	t
5	5	4	Good job on the quick fix. Please make sure the maintenance team is notified to use proper procedures in the future.	[]	2025-05-19 08:07:15.161791	2025-05-19 08:07:15.161791	t
6	6	11	All materials have been cleared from the exit pathway. Exit is now fully accessible.	["https://placehold.co/400x300?text=Cleared+Exit"]	2025-05-17 08:07:15.161791	2025-05-17 08:07:15.161791	t
7	6	4	Confirmed compliance with fire code. This issue is now resolved.	[]	2025-05-18 08:07:15.161791	2025-05-18 08:07:15.161791	t
8	8	14	I have begun reorganizing the chemicals according to the compatibility chart. Expect completion by tomorrow.	[]	2025-05-20 08:07:15.161791	2025-05-20 08:07:15.161791	t
9	9	15	Temporary solution: cords have been secured and covered with cord protectors. Working with facilities to install permanent outlets next week.	["https://placehold.co/400x300?text=Cord+Protectors"]	2025-05-20 08:07:15.161791	2025-05-20 08:07:15.161791	t
10	9	4	Thanks for the update. Please ensure the permanent solution is implemented as scheduled.	[]	2025-05-21 08:07:15.161791	2025-05-21 08:07:15.161791	t
\.


--
-- Data for Name: hazard_reports; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.hazard_reports (id, tenant_id, site_id, reported_by_id, title, description, location, gps_coordinates, hazard_type, severity, status, recommended_action, photo_urls, video_ids, created_at, updated_at, resolved_at, is_active, weather_conditions) FROM stdin;
2	1	1	5	Leaking Roof	Water leaking through ceiling in computer lab during rain	IT Building, Room 203	\N	structural	high	open	Temporary containment and schedule roof inspection	["https://placehold.co/400x300?text=Roof+Leak"]	\N	2025-05-21 08:05:23.076812	2025-05-22 08:05:23.076812	\N	t	\N
3	1	1	6	Damaged Scaffolding	Scaffold on east wing construction has loose connections	East Wing Construction Site	\N	fall	high	assigned	Replace damaged components before allowing access	["https://placehold.co/400x300?text=Damaged+Scaffold"]	\N	2025-05-20 08:05:23.076812	2025-05-22 08:05:23.076812	\N	t	\N
4	1	1	7	Asbestos Suspected	During renovation, workers found suspicious material that may contain asbestos	Science Building Basement	\N	chemical	critical	in_progress	Cease work, isolate area, arrange testing	["https://placehold.co/400x300?text=Potential+Asbestos"]	\N	2025-05-18 08:05:23.076812	2025-05-22 08:05:23.076812	\N	t	\N
5	1	1	8	Slippery Floor	Recently waxed floor without warning signs	Student Center Main Entrance	\N	slip_trip_fall	medium	resolved	Place warning signs and use anti-slip treatments	["https://placehold.co/400x300?text=Slippery+Floor"]	\N	2025-05-17 08:05:23.076812	2025-05-22 08:05:23.076812	\N	t	\N
6	1	1	9	Blocked Fire Exit	Construction materials blocking emergency exit	Library South Wing	\N	fire	high	closed	Immediately clear pathway to comply with fire code	["https://placehold.co/400x300?text=Blocked+Exit"]	\N	2025-05-16 08:05:23.076812	2025-05-22 08:05:23.076812	\N	t	\N
7	1	1	10	Missing Machine Guard	Table saw in workshop missing safety guard	Engineering Building Workshop	\N	mechanical	high	open	Install proper guard before equipment use is permitted	["https://placehold.co/400x300?text=Missing+Guard"]	\N	2025-05-21 08:05:23.076812	2025-05-22 08:05:23.076812	\N	t	\N
8	1	1	13	Improper Chemical Storage	Incompatible chemicals stored together in lab cabinet	Chemistry Lab, Room 105	\N	chemical	medium	assigned	Separate chemicals according to compatibility chart	["https://placehold.co/400x300?text=Chemical+Storage"]	\N	2025-05-19 08:05:23.076812	2025-05-22 08:05:23.076812	\N	t	\N
9	1	1	16	Extension Cord Hazard	Multiple extension cords daisy-chained across walkway	Administration Building Lobby	\N	electrical	medium	in_progress	Install proper outlets and remove trip hazard	["https://placehold.co/400x300?text=Extension+Cords"]	\N	2025-05-18 08:05:23.076812	2025-05-22 08:05:23.076812	\N	t	\N
10	1	1	4	Unstable Excavation	Construction trench showing signs of instability with no shoring	New Dormitory Foundation Site	\N	excavation	critical	open	Install proper shoring immediately and restrict access	["https://placehold.co/400x300?text=Unstable+Trench"]	\N	2025-05-22 08:05:23.076812	2025-05-22 08:05:23.076812	\N	t	\N
1	1	1	4	Exposed Electrical Wiring	Multiple exposed wires found in the main hallway ceiling	Building A, 2nd Floor Hallway	\N	electrical	critical	in_progress	Immediate isolation and repair by licensed electrician	["https://placehold.co/400x300?text=Exposed+Wires"]	\N	2025-05-22 08:05:23.076812	2025-05-22 08:56:39.366	\N	t	\N
\.


--
-- Data for Name: incident_reports; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.incident_reports (id, tenant_id, site_id, reported_by_id, title, description, incident_date, location, incident_type, severity, injury_occurred, injury_details, witnesses, root_cause, corrective_actions, preventative_measures, photo_urls, video_ids, document_urls, created_at, updated_at, is_active, status) FROM stdin;
3	1	1	4	Worker Fall from Scaffold	A worker fell approximately 6 feet from scaffold while installing drywall. The scaffold was missing proper guardrails.	2025-05-10 09:30:00	Building A, 3rd Floor East Wing	Fall	major	t	Worker sustained a sprained ankle and bruised shoulder. Treated at St. Mary's Hospital and released the same day with 3 days of restricted duty.	["John Smith (Foreman)", "Maria Garcia (Safety Officer)"]	Improper scaffold assembly and missing guardrails. Pre-shift inspection was not conducted properly.	All scaffolds on site have been inspected and deficiencies corrected. Refresher training on scaffold safety conducted for all workers.	Implemented additional scaffold inspection checkpoints. Updated pre-shift inspection form with scaffold-specific items.	["https://source.unsplash.com/random/800x600?construction,fall"]	\N	\N	2025-05-22 11:36:56.258475	2025-05-22 11:36:56.258475	t	investigating
4	1	1	4	Electrical Shock Incident	Electrician received mild shock while working on a junction box that was incorrectly labeled as de-energized.	2025-05-15 14:45:00	Building B, Electrical Room	Electrical	moderate	t	Mild electrical shock to right hand. Worker was evaluated on-site by first aid team, no further medical treatment required.	["Robert Johnson (Lead Electrician)"]	\N	\N	\N	["https://source.unsplash.com/random/800x600?electrical,construction"]	\N	\N	2025-05-22 11:36:56.258475	2025-05-22 11:36:56.258475	t	reported
5	1	1	4	Near Miss - Falling Object	A hammer fell from the second floor, narrowly missing a worker below. No barricades were in place to prevent access to the area below overhead work.	2025-05-18 11:15:00	Building A, Near South Entrance	Falling Object	critical	f	\N	["David Lee (Carpenter)", "Sarah Williams (Project Manager)"]	\N	Immediate stop-work called to secure all tools. Area below overhead work properly barricaded.	\N	["https://source.unsplash.com/random/800x600?construction,safety"]	\N	\N	2025-05-22 11:36:56.258475	2025-05-22 11:36:56.258475	t	investigating
6	1	1	4	Chemical Spill in Storage Area	A 5-gallon container of concrete sealer was knocked over during inventory movement, resulting in a spill in the chemical storage area.	2025-05-21 16:30:00	Main Storage Building, Chemical Section	Chemical Spill	minor	f	\N	\N	Improper storage of chemical containers. Containers were stacked too high without proper securing mechanism.	Spill contained and cleaned up according to SDS procedures. Storage racks reorganized with proper securing mechanisms.	Updated chemical storage procedures. Conducted training on proper handling and storage of chemicals.	["https://source.unsplash.com/random/800x600?chemical,spill"]	\N	\N	2025-05-22 11:36:56.258475	2025-05-22 11:36:56.258475	t	resolved
7	1	1	4	Equipment Malfunction - Tower Crane	Tower crane experienced unexpected alarm and automatic shutdown during lifting operation. Load was safely lowered prior to shutdown.	2025-05-22 10:00:00	Main Construction Area	Equipment Failure	major	f	\N	\N	Sensor malfunction in the crane's overload protection system triggered a false alarm.	Crane inspection conducted by certified technician. Faulty sensor replaced and system recalibrated.	Additional pre-operational checks added to daily crane inspection.	["https://source.unsplash.com/random/800x600?crane,construction"]	\N	\N	2025-05-22 11:36:56.258475	2025-05-22 11:36:56.258475	t	closed
9	1	1	13	Struck By incident at Harvard university campus 1	Vehicle backed into scaffold structure causing partial collapse. No injuries but equipment damage occurred.	2025-03-05 22:08:33.479	South entrance	Struck By	moderate	f	\N	\N	\N	\N	\N	\N	\N	\N	2025-05-22 11:58:28.458605	2025-05-22 11:58:28.458605	t	reported
10	1	1	7	Environmental incident at Harvard university campus 1	Chemical spill occurred in storage area. Approximately 2 gallons of paint thinner spilled. Area was contained and cleaned according to protocol.	2025-04-18 02:57:11.894	Electrical room	Environmental	critical	f	\N	\N	Investigation determined that the incident was caused by equipment failure	Actions taken: Procedures updated	To prevent recurrence: Daily equipment inspections	\N	\N	\N	2025-05-22 11:58:28.458605	2025-05-22 11:58:28.458605	t	resolved
11	1	1	8	Fall incident at Harvard university campus 1	Worker slipped on wet floor where caution sign was not placed after mopping.	2025-02-26 21:25:02.3	North wing, 3rd floor	Fall	minor	f	\N	\N	\N	\N	\N	\N	\N	\N	2025-05-22 11:58:28.458605	2025-05-22 11:58:28.458605	t	investigating
12	1	1	14	Equipment Failure incident at Harvard university campus 1	Electrical short in temporary wiring caused small fire. Fire was extinguished with nearby extinguisher. No structural damage.	2025-04-14 14:41:34.903	North wing, 3rd floor	Equipment Failure	minor	t	Worker received minor injury requiring first aid.	\N	Investigation determined that the incident was caused by equipment failure	Actions taken: Additional training implemented	To prevent recurrence: Improved signage installed	\N	\N	\N	2025-05-22 11:58:28.458605	2025-05-22 11:58:28.458605	t	resolved
13	1	1	8	Slip/Trip incident at Harvard university campus 1	Heavy equipment operator reported near-miss with pedestrian worker who entered operational zone without authorization.	2025-03-22 12:23:35.581	West loading dock	Slip/Trip	minor	t	Worker received minor injury requiring first aid.	\N	\N	\N	\N	\N	\N	\N	2025-05-22 11:58:28.458605	2025-05-22 11:58:28.458605	t	reported
14	1	1	6	Electrical incident at Harvard university campus 1	Excavation wall partially collapsed during heavy rain. No workers were in the trench at the time.	2025-03-18 16:44:59.756	Equipment yard	Electrical	moderate	f	\N	\N	Investigation determined that the incident was caused by environmental factors	Actions taken: Environmental controls improved	To prevent recurrence: Improved signage installed	\N	\N	\N	2025-05-22 11:58:28.458605	2025-05-22 11:58:28.458605	t	resolved
15	1	1	14	Fall incident at Harvard university campus 1	Vehicle backed into scaffold structure causing partial collapse. No injuries but equipment damage occurred.	2025-04-29 07:41:40.14	South entrance	Fall	moderate	f	\N	\N	Investigation determined that the incident was caused by equipment failure	Actions taken: Equipment replaced	To prevent recurrence: Daily equipment inspections	\N	\N	\N	2025-05-22 11:58:28.458605	2025-05-22 11:58:28.458605	t	resolved
16	1	1	7	Other incident at Harvard university campus 1	Heavy equipment operator reported near-miss with pedestrian worker who entered operational zone without authorization.	2025-02-23 08:48:28.459	East stairwell	Other	minor	f	\N	\N	Investigation determined that the incident was caused by environmental factors	Actions taken: Environmental controls improved	To prevent recurrence: Enhanced monitoring process	\N	\N	\N	2025-05-22 11:58:28.458605	2025-05-22 11:58:28.458605	t	closed
17	1	1	13	Other incident at Harvard university campus 1	Vehicle backed into scaffold structure causing partial collapse. No injuries but equipment damage occurred.	2025-05-11 21:51:56.055	Basement level	Other	major	t	Worker received minor injury requiring first aid.	\N	\N	\N	\N	\N	\N	\N	2025-05-22 11:58:28.458605	2025-05-22 11:58:28.458605	t	investigating
18	1	1	8	Fall incident at Harvard university campus 1	Worker received minor cut on hand while using box cutter. First aid was administered on site.	2025-05-20 01:10:49.883	West loading dock	Fall	moderate	f	\N	\N	\N	\N	\N	\N	\N	\N	2025-05-22 11:58:28.458605	2025-05-22 11:58:28.458605	t	reported
19	1	1	7	Electrical incident at Harvard university campus 1	Water pipe burst causing flooding in basement level. Electrical equipment was exposed to water.	2025-04-05 12:33:03.908	South entrance	Electrical	moderate	f	\N	\N	\N	\N	\N	\N	\N	\N	2025-05-22 11:58:28.458605	2025-05-22 11:58:28.458605	t	reported
20	1	1	16	Equipment Failure incident at Harvard university campus 1	Excavation wall partially collapsed during heavy rain. No workers were in the trench at the time.	2025-02-25 20:40:53.799	Storage room B	Equipment Failure	moderate	t	Worker received minor injury requiring first aid.	\N	\N	\N	\N	\N	\N	\N	2025-05-22 11:58:28.458605	2025-05-22 11:58:28.458605	t	investigating
21	1	1	13	Other incident at Harvard university campus 1	Water pipe burst causing flooding in basement level. Electrical equipment was exposed to water.	2025-03-10 22:09:45.527	Elevator shaft	Other	moderate	f	\N	\N	\N	\N	\N	\N	\N	\N	2025-05-22 11:58:28.458605	2025-05-22 11:58:28.458605	t	investigating
22	1	1	4	Fire/Explosion incident at Harvard university campus 1	Subcontractor was not wearing proper PPE while operating cutting tool.	2025-04-21 12:23:34.467	North wing, 3rd floor	Fire/Explosion	critical	t	Worker received minor injury requiring first aid.	\N	\N	\N	\N	\N	\N	\N	2025-05-22 11:58:28.458605	2025-05-22 11:58:28.458605	t	investigating
23	1	1	13	Chemical Spill incident at Harvard university campus 1	Water pipe burst causing flooding in basement level. Electrical equipment was exposed to water.	2025-03-22 08:14:46.586	Main hallway	Chemical Spill	moderate	f	\N	\N	\N	\N	\N	\N	\N	\N	2025-05-22 11:58:28.458605	2025-05-22 11:58:28.458605	t	investigating
24	1	1	6	Fall incident at Harvard university campus 1	Water pipe burst causing flooding in basement level. Electrical equipment was exposed to water.	2025-04-26 08:14:54.17	Main hallway	Fall	critical	f	\N	\N	Investigation determined that the incident was caused by inadequate training	Actions taken: Additional training implemented	To prevent recurrence: Regular safety training scheduled	\N	\N	\N	2025-05-22 11:58:28.458605	2025-05-22 11:58:28.458605	t	resolved
25	1	1	4	Electrical incident at Harvard university campus 1	Electrical short in temporary wiring caused small fire. Fire was extinguished with nearby extinguisher. No structural damage.	2025-03-30 00:06:25.985	Storage room B	Electrical	minor	t	Worker received minor injury requiring first aid.	\N	\N	\N	\N	\N	\N	\N	2025-05-22 11:58:28.458605	2025-05-22 11:58:28.458605	t	investigating
26	1	1	14	Slip/Trip incident at Harvard university campus 1	Excavation wall partially collapsed during heavy rain. No workers were in the trench at the time.	2025-04-01 19:30:56.617	East stairwell	Slip/Trip	critical	f	\N	\N	Investigation determined that the incident was caused by inadequate training	Actions taken: Equipment replaced	To prevent recurrence: Improved signage installed	\N	\N	\N	2025-05-22 11:58:28.458605	2025-05-22 11:58:28.458605	t	resolved
27	1	1	4	Caught In/Between incident at Harvard university campus 1	Worker slipped on wet floor where caution sign was not placed after mopping.	2025-04-25 09:58:38.965	Storage room B	Caught In/Between	critical	f	\N	\N	Investigation determined that the incident was caused by environmental factors	Actions taken: Additional training implemented	To prevent recurrence: Daily equipment inspections	\N	\N	\N	2025-05-22 11:58:28.458605	2025-05-22 11:58:28.458605	t	closed
28	1	1	14	Vehicle Accident incident at Harvard university campus 1	Vehicle backed into scaffold structure causing partial collapse. No injuries but equipment damage occurred.	2025-03-23 09:05:56.492	Scaffolding on north face	Vehicle Accident	major	t	Worker received minor injury requiring first aid.	\N	Investigation determined that the incident was caused by inadequate training	Actions taken: Environmental controls improved	To prevent recurrence: Regular safety training scheduled	\N	\N	\N	2025-05-22 11:58:28.458605	2025-05-22 11:58:28.458605	t	resolved
29	1	1	7	Equipment Failure incident at Harvard university campus 1	Water pipe burst causing flooding in basement level. Electrical equipment was exposed to water.	2025-03-31 13:36:56.173	Elevator shaft	Equipment Failure	minor	f	\N	\N	Investigation determined that the incident was caused by equipment failure	Actions taken: Procedures updated	To prevent recurrence: Daily equipment inspections	\N	\N	\N	2025-05-22 11:58:28.458605	2025-05-22 11:58:28.458605	t	closed
30	1	1	13	Environmental incident at Harvard university campus 1	Vehicle backed into scaffold structure causing partial collapse. No injuries but equipment damage occurred.	2025-03-08 00:40:04.397	North wing, 3rd floor	Environmental	moderate	f	\N	\N	Investigation determined that the incident was caused by inadequate training	Actions taken: Additional training implemented	To prevent recurrence: Enhanced monitoring process	\N	\N	\N	2025-05-22 11:58:28.458605	2025-05-22 11:58:28.458605	t	closed
31	1	1	6	Caught In/Between incident at Harvard university campus 1	Excavation wall partially collapsed during heavy rain. No workers were in the trench at the time.	2025-05-22 01:39:16.27	Scaffolding on north face	Caught In/Between	minor	t	Worker received minor injury requiring first aid.	\N	\N	\N	\N	\N	\N	\N	2025-05-22 11:58:28.458605	2025-05-22 11:58:28.458605	t	reported
32	1	1	6	Security incident at Harvard university campus 1	Chemical spill occurred in storage area. Approximately 2 gallons of paint thinner spilled. Area was contained and cleaned according to protocol.	2025-03-12 00:25:42.047	South entrance	Security	minor	f	\N	\N	\N	\N	\N	\N	\N	\N	2025-05-22 11:58:28.458605	2025-05-22 11:58:28.458605	t	investigating
33	1	1	13	Other incident at Harvard university campus 1	Electrical short in temporary wiring caused small fire. Fire was extinguished with nearby extinguisher. No structural damage.	2025-02-26 19:45:52.826	East stairwell	Other	minor	f	\N	\N	\N	\N	\N	\N	\N	\N	2025-05-22 11:58:28.458605	2025-05-22 11:58:28.458605	t	investigating
\.


--
-- Data for Name: inspection_checklist_items; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.inspection_checklist_items (id, template_id, category, question, description, expected_answer, is_critical, sort_order, created_at, updated_at, is_active) FROM stdin;
\.


--
-- Data for Name: inspection_findings; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.inspection_findings (id, inspection_id, description, recommended_action, severity, priority, due_date, status, is_active, photo_urls, assigned_to_id, created_by_id, resolved_by_id, resolved_at, created_at, updated_at) FROM stdin;
2	2	tst	\N	low	medium	\N	open	t	[]	\N	4	\N	\N	2025-05-22 06:59:44.364823	2025-05-22 06:59:44.364823
3	2	Testing 	\N	low	medium	2025-05-29 00:00:00	open	t	[]	\N	4	\N	\N	2025-05-22 07:06:29.002337	2025-05-22 07:06:29.002337
4	1	trwst	\N	low	medium	2025-06-05 00:00:00	open	t	[]	\N	4	\N	\N	2025-05-22 07:09:59.983413	2025-05-22 07:09:59.983413
5	2	tst 4	\N	low	medium	2025-05-23 00:00:00	open	t	[]	\N	4	\N	\N	2025-05-22 07:14:42.298128	2025-05-22 07:14:42.298128
6	19	I  noticed an anamoly	\N	low	medium	2025-06-30 00:00:00	open	t	[]	\N	4	\N	\N	2025-05-22 14:26:03.160758	2025-05-22 14:26:03.160758
\.


--
-- Data for Name: inspection_items; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.inspection_items (id, section_id, question, type, description, required, category, options, "order", created_at, updated_at) FROM stdin;
1	2	foree exting on?	yes_no	fiure edtingsd	t	\N	\N	0	2025-05-22 04:33:27.187	2025-05-22 04:33:27.187
2	3	Process orientation	yes_no	New process orientation 	t	\N	\N	0	2025-05-22 04:50:22.429	2025-05-22 04:50:22.429
3	4	Are all electrical tools properly grounded?	yes_no	Check for proper grounding on all electrical tools	t	\N	\N	0	2025-05-22 09:46:33.103499	2025-05-22 09:46:33.103499
4	4	Are extension cords in good condition?	yes_no	Inspect cords for cuts, frays, or damage	t	\N	\N	1	2025-05-22 09:46:33.103499	2025-05-22 09:46:33.103499
5	4	Are GFCIs used in wet locations?	yes_no	Verify GFCI protection in damp or wet areas	t	\N	\N	2	2025-05-22 09:46:33.103499	2025-05-22 09:46:33.103499
6	5	Are temporary electrical panels properly labeled?	yes_no	Check for clear labeling of circuit breakers	t	\N	\N	0	2025-05-22 09:46:33.103499	2025-05-22 09:46:33.103499
7	5	Are electrical installations protected from damage?	yes_no	Verify physical protection of wiring	t	\N	\N	1	2025-05-22 09:46:33.103499	2025-05-22 09:46:33.103499
8	5	Rate overall wiring condition	multiple_choice	Assess general condition of electrical wiring	t	\N	["Poor", "Fair", "Good", "Excellent"]	2	2025-05-22 09:46:33.103499	2025-05-22 09:46:33.103499
9	6	Are lockout/tagout procedures posted?	yes_no	Check for visible LOTO procedures	t	\N	\N	0	2025-05-22 09:46:33.103499	2025-05-22 09:46:33.103499
10	6	Is lockout/tagout equipment available?	yes_no	Verify availability of locks and tags	t	\N	\N	1	2025-05-22 09:46:33.103499	2025-05-22 09:46:33.103499
11	6	Have workers been trained on LOTO procedures?	yes_no	Confirm worker training on lockout/tagout	t	\N	\N	2	2025-05-22 09:46:33.103499	2025-05-22 09:46:33.103499
12	7	Are harnesses free from visible damage?	yes_no	Check for cuts, tears, or excessive wear	t	\N	\N	0	2025-05-22 09:46:33.103499	2025-05-22 09:46:33.103499
13	7	Are D-rings intact and undamaged?	yes_no	Verify D-ring integrity	t	\N	\N	1	2025-05-22 09:46:33.103499	2025-05-22 09:46:33.103499
14	7	When was the last harness inspection?	text	Record date of last documented inspection	t	\N	\N	2	2025-05-22 09:46:33.103499	2025-05-22 09:46:33.103499
15	8	Are anchor points rated for fall protection?	yes_no	Verify 5,000 lb capacity rating	t	\N	\N	0	2025-05-22 09:46:33.103499	2025-05-22 09:46:33.103499
16	8	Are anchor points free from damage?	yes_no	Check for integrity of anchor points	t	\N	\N	1	2025-05-22 09:46:33.103499	2025-05-22 09:46:33.103499
17	8	How many workers per anchor point?	numeric	Count number of workers tied off to each anchor	t	\N	\N	2	2025-05-22 09:46:33.103499	2025-05-22 09:46:33.103499
18	9	Is the scaffold properly assembled?	yes_no	Check for complete assembly according to design	t	\N	\N	0	2025-05-22 09:46:53.932591	2025-05-22 09:46:53.932591
19	9	Are all components free from damage?	yes_no	Inspect for bent or damaged parts	t	\N	\N	1	2025-05-22 09:46:53.932591	2025-05-22 09:46:53.932591
20	9	Is the scaffold level and plumb?	yes_no	Verify scaffold is level on all sides	t	\N	\N	2	2025-05-22 09:46:53.932591	2025-05-22 09:46:53.932591
21	10	Are proper ladders/stairs provided?	yes_no	Check for secure access points	t	\N	\N	0	2025-05-22 09:46:53.932591	2025-05-22 09:46:53.932591
22	10	Are guardrails installed at access points?	yes_no	Verify protection at entrances	t	\N	\N	1	2025-05-22 09:46:53.932591	2025-05-22 09:46:53.932591
23	10	Rate ease of access/egress	multiple_choice	Assess how easily workers can enter/exit scaffold	t	\N	["Poor", "Fair", "Good", "Excellent"]	2	2025-05-22 09:46:53.932591	2025-05-22 09:46:53.932591
24	15	Are fire extinguishers properly charged?	yes_no	Check pressure gauge is in green zone	t	\N	\N	0	2025-05-22 09:46:53.932591	2025-05-22 09:46:53.932591
25	15	Are extinguishers inspected monthly?	yes_no	Verify inspection tags are current	t	\N	\N	1	2025-05-22 09:46:53.932591	2025-05-22 09:46:53.932591
26	15	Are extinguishers easily accessible?	yes_no	Check for clear access to extinguishers	t	\N	\N	2	2025-05-22 09:46:53.932591	2025-05-22 09:46:53.932591
27	22	Is waste properly segregated?	yes_no	Check for separation of different waste types	t	\N	\N	0	2025-05-22 09:46:53.932591	2025-05-22 09:46:53.932591
28	22	Are waste containers labeled correctly?	yes_no	Verify proper labeling of waste bins	t	\N	\N	1	2025-05-22 09:46:53.932591	2025-05-22 09:46:53.932591
29	22	How often is waste removed?	multiple_choice	Determine frequency of waste collection	t	\N	["Daily", "Weekly", "Bi-weekly", "Monthly"]	2	2025-05-22 09:46:53.932591	2025-05-22 09:46:53.932591
30	25	Is the work area free of trip hazards?	yes_no	Check for clear walkways	t	\N	\N	0	2025-05-22 09:46:53.932591	2025-05-22 09:46:53.932591
31	25	Are materials stored properly?	yes_no	Verify neat and organized storage	t	\N	\N	1	2025-05-22 09:46:53.932591	2025-05-22 09:46:53.932591
32	25	Rate overall site cleanliness	multiple_choice	Assess general cleanliness of work area	t	\N	["Poor", "Fair", "Good", "Excellent"]	2	2025-05-22 09:46:53.932591	2025-05-22 09:46:53.932591
\.


--
-- Data for Name: inspection_questions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.inspection_questions (id, template_id, question_text, question_type, options, is_required, order_index) FROM stdin;
\.


--
-- Data for Name: inspection_responses; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.inspection_responses (id, inspection_id, checklist_item_id, response, photo_urls, is_compliant, notes, created_by_id, created_at, updated_at) FROM stdin;
2	1	2	fail	[]	f	\N	4	2025-05-22 07:09:41.680376	2025-05-22 07:29:08.632482
1	2	2	pass	[]	t	\N	4	2025-05-22 06:50:10.619765	2025-05-22 07:34:42.077469
3	19	3	pass	[]	t	\N	4	2025-05-22 14:25:26.758612	2025-05-22 14:25:26.758612
4	21	12	pass	[]	t	\N	4	2025-05-23 09:55:17.244696	2025-05-23 09:55:17.244696
\.


--
-- Data for Name: inspection_sections; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.inspection_sections (id, template_id, name, description, "order", created_at, updated_at) FROM stdin;
1	4	General Safety	Basic safety checks for the site	0	2025-05-22 04:31:49.097	2025-05-22 04:31:49.097
2	5	General Safety	Basic safety checks for the site	0	2025-05-22 04:33:26.83	2025-05-22 04:33:26.83
3	6	General Safety	Basic safety checks for the site	0	2025-05-22 04:50:22.025	2025-05-22 04:50:22.025
4	7	Electrical Equipment	Inspection of electrical tools and equipment	0	2025-05-22 09:45:25.306442	2025-05-22 09:45:25.306442
5	7	Wiring & Installation	Assessment of wiring and electrical installations	1	2025-05-22 09:45:25.306442	2025-05-22 09:45:25.306442
6	7	Lockout/Tagout	Verification of proper lockout/tagout procedures	2	2025-05-22 09:45:25.306442	2025-05-22 09:45:25.306442
7	8	Harness Inspection	Verification of harness integrity and proper use	0	2025-05-22 09:45:30.839855	2025-05-22 09:45:30.839855
8	8	Anchor Points	Assessment of anchor points and tie-offs	1	2025-05-22 09:45:30.839855	2025-05-22 09:45:30.839855
9	8	Fall Protection Training	Verification of worker training compliance	2	2025-05-22 09:45:30.839855	2025-05-22 09:45:30.839855
10	9	Scaffold Structure	Assessment of scaffold integrity and assembly	0	2025-05-22 09:46:07.694591	2025-05-22 09:46:07.694591
11	9	Access & Egress	Evaluation of safe access points to scaffolding	1	2025-05-22 09:46:07.694591	2025-05-22 09:46:07.694591
12	9	Load Capacity	Verification of proper load capacity compliance	2	2025-05-22 09:46:07.694591	2025-05-22 09:46:07.694591
13	10	Equipment Condition	Assessment of equipment mechanical condition	0	2025-05-22 09:46:07.694591	2025-05-22 09:46:07.694591
14	10	Safety Features	Verification of functioning safety features	1	2025-05-22 09:46:07.694591	2025-05-22 09:46:07.694591
15	10	Operator Certification	Verification of operator qualifications	2	2025-05-22 09:46:07.694591	2025-05-22 09:46:07.694591
16	11	Head Protection	Assessment of hard hat use and condition	0	2025-05-22 09:46:07.694591	2025-05-22 09:46:07.694591
17	11	Eye & Face Protection	Verification of eye and face protection use	1	2025-05-22 09:46:07.694591	2025-05-22 09:46:07.694591
18	11	Hand & Foot Protection	Assessment of glove and footwear usage	2	2025-05-22 09:46:07.694591	2025-05-22 09:46:07.694591
19	12	Fire Extinguishers	Inspection of fire extinguisher placement and condition	0	2025-05-22 09:46:07.694591	2025-05-22 09:46:07.694591
20	12	Emergency Exits	Evaluation of emergency exit routes and signage	1	2025-05-22 09:46:07.694591	2025-05-22 09:46:07.694591
21	12	Fire Detection Systems	Assessment of smoke detectors and alarms	2	2025-05-22 09:46:07.694591	2025-05-22 09:46:07.694591
22	13	Atmospheric Testing	Verification of air quality and testing procedures	0	2025-05-22 09:46:07.694591	2025-05-22 09:46:07.694591
23	13	Entry Procedures	Assessment of confined space entry procedures	1	2025-05-22 09:46:07.694591	2025-05-22 09:46:07.694591
24	13	Rescue Equipment	Inspection of rescue equipment and protocols	2	2025-05-22 09:46:07.694591	2025-05-22 09:46:07.694591
25	14	Trench Protection	Verification of proper shoring and sloping	0	2025-05-22 09:46:07.694591	2025-05-22 09:46:07.694591
26	14	Soil Classification	Assessment of soil type and stability	1	2025-05-22 09:46:07.694591	2025-05-22 09:46:07.694591
27	14	Access & Egress	Inspection of safe entry and exit points	2	2025-05-22 09:46:07.694591	2025-05-22 09:46:07.694591
28	15	Waste Management	Assessment of waste disposal procedures	0	2025-05-22 09:46:07.694591	2025-05-22 09:46:07.694591
29	15	Spill Prevention	Inspection of spill prevention controls	1	2025-05-22 09:46:07.694591	2025-05-22 09:46:07.694591
30	15	Air & Water Protection	Verification of air and water pollution controls	2	2025-05-22 09:46:07.694591	2025-05-22 09:46:07.694591
31	16	General Housekeeping	Assessment of site cleanliness and organization	0	2025-05-22 09:46:07.694591	2025-05-22 09:46:07.694591
32	16	Material Storage	Inspection of material storage practices	1	2025-05-22 09:46:07.694591	2025-05-22 09:46:07.694591
33	16	Worker Awareness	Verification of safety awareness and communication	2	2025-05-22 09:46:07.694591	2025-05-22 09:46:07.694591
\.


--
-- Data for Name: inspection_templates; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.inspection_templates (id, tenant_id, name, description, category, version, is_default, created_by_id, created_at, updated_at, is_active) FROM stdin;
1	1	Monthly template 	Test template 	general	1.0	f	4	2025-05-22 04:04:56.857413	2025-05-22 04:04:56.857413	t
2	1	Monthly testing	Testing monthly 	general	1.0	f	4	2025-05-22 04:10:37.845478	2025-05-22 04:10:37.845478	t
3	1	Monthly test 	Monthly test 	general	1.0	f	4	2025-05-22 04:15:41.175299	2025-05-22 04:15:41.175299	t
4	1	Monthly tempalte 4	test tempalte for the monthly	general	1.0	f	4	2025-05-22 04:31:48.777611	2025-05-22 04:31:48.777611	t
5	1	tst 4	asyasfuhoiuashfsodbfobu 	fire	1.0	f	4	2025-05-22 04:33:26.515279	2025-05-22 04:33:26.515279	t
6	1	Weekly test 	Weekly test report for inspection	general	1.0	f	4	2025-05-22 04:50:21.684461	2025-05-22 04:50:21.684461	t
7	1	Electrical Safety Inspection	Comprehensive electrical safety checks for construction sites	electrical	1.0	f	4	2025-05-22 09:45:06.81216	2025-05-22 09:45:06.81216	t
8	1	Fall Protection Inspection	Inspection of fall protection equipment and procedures	safety	1.0	f	4	2025-05-22 09:45:06.81216	2025-05-22 09:45:06.81216	t
9	1	Scaffold Safety Inspection	Scaffold integrity and safety compliance checks	safety	1.0	f	4	2025-05-22 09:45:06.81216	2025-05-22 09:45:06.81216	t
10	1	Heavy Equipment Inspection	Safety inspection for heavy machinery and equipment	equipment	1.0	f	4	2025-05-22 09:45:06.81216	2025-05-22 09:45:06.81216	t
11	1	PPE Compliance Inspection	Personal Protective Equipment compliance verification	safety	1.0	f	4	2025-05-22 09:45:06.81216	2025-05-22 09:45:06.81216	t
12	1	Fire Safety Inspection	Fire prevention equipment and evacuation route inspection	fire	1.0	f	4	2025-05-22 09:45:06.81216	2025-05-22 09:45:06.81216	t
13	1	Confined Space Entry Inspection	Pre-entry checks for confined spaces	safety	1.0	f	4	2025-05-22 09:45:06.81216	2025-05-22 09:45:06.81216	t
14	1	Excavation Safety Inspection	Trench and excavation safety compliance verification	safety	1.0	f	4	2025-05-22 09:45:06.81216	2025-05-22 09:45:06.81216	t
15	1	Environmental Compliance Inspection	Site environmental impact and compliance assessment	environmental	1.0	f	4	2025-05-22 09:45:06.81216	2025-05-22 09:45:06.81216	t
16	1	Weekly Site Safety Walkthrough	General safety walkthrough for construction sites	general	1.0	f	4	2025-05-22 09:45:06.81216	2025-05-22 09:45:06.81216	t
\.


--
-- Data for Name: inspections; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.inspections (id, tenant_id, site_id, inspector_id, inspection_type, title, description, scheduled_date, completed_date, status, result, findings, photo_urls, video_ids, document_urls, created_at, updated_at, is_active, template_id, due_date, started_at, assigned_to_id) FROM stdin;
2	1	1	4	routine	Weekly test Electrical	Weekly test report for inspection	2025-05-22 06:30:42.731	\N	in_progress	\N	\N	\N	\N	\N	2025-05-22 06:30:59.389978	2025-05-22 06:30:59.389978	t	6	2025-05-29 06:30:42.731	2025-05-22 06:42:07.079896	\N
1	1	1	4	routine	Weekly test 	Weekly test report for inspection	2025-05-22 05:29:37.297	\N	in_progress	\N	\N	\N	\N	\N	2025-05-22 05:29:58.144639	2025-05-22 05:29:58.144639	t	6	\N	2025-05-22 07:09:38.464677	\N
3	1	1	4	routine	Electrical Safety Inspection - Main Building	Scheduled electrical safety inspection for main construction building	2025-05-23 09:47:41.321822	\N	pending	\N	\N	\N	\N	\N	2025-05-22 09:47:41.321822	2025-05-22 09:47:41.321822	t	7	2025-05-30 09:47:41.321822	\N	\N
4	1	1	4	routine	Fall Protection Check - Tower Crane Area	Regular inspection of fall protection systems at tower crane	2025-05-24 09:47:41.321822	\N	pending	\N	\N	\N	\N	\N	2025-05-22 09:47:41.321822	2025-05-22 09:47:41.321822	t	8	2025-05-31 09:47:41.321822	\N	\N
5	1	1	4	routine	Scaffold Safety Verification - East Wing	Weekly scaffold safety check for the east wing scaffolding	2025-05-21 09:47:41.321822	2025-05-22 09:47:41.321822	completed	\N	\N	\N	\N	\N	2025-05-22 09:47:41.321822	2025-05-22 09:47:41.321822	t	9	2025-05-28 09:47:41.321822	\N	\N
6	1	1	4	comprehensive	Heavy Equipment Inspection - Excavators	Monthly inspection of all excavator equipment on site	2025-05-22 09:47:41.321822	\N	in_progress	\N	\N	\N	\N	\N	2025-05-22 09:47:41.321822	2025-05-22 09:47:41.321822	t	10	2025-05-29 09:47:41.321822	\N	\N
7	1	1	4	routine	PPE Compliance Walkthrough - All Floors	Regular check of worker PPE compliance across all project floors	2025-05-25 09:47:41.321822	\N	pending	\N	\N	\N	\N	\N	2025-05-22 09:47:41.321822	2025-05-22 09:47:41.321822	t	11	2025-06-01 09:47:41.321822	\N	\N
8	1	1	4	routine	Fire Safety Inspection - Storage Areas	Fire safety check for all material storage areas	2025-05-29 09:47:41.321822	\N	pending	\N	\N	\N	\N	\N	2025-05-22 09:47:41.321822	2025-05-22 09:47:41.321822	t	12	2025-06-05 09:47:41.321822	\N	\N
9	1	1	4	special	Confined Space Entry - Utility Tunnels	Pre-entry inspection of underground utility tunnels	2025-05-30 09:47:41.321822	\N	pending	\N	\N	\N	\N	\N	2025-05-22 09:47:41.321822	2025-05-22 09:47:41.321822	t	13	2025-06-06 09:47:41.321822	\N	\N
10	1	1	4	routine	Excavation Safety Check - Foundation Area	Weekly inspection of foundation excavation site	2025-05-31 09:47:41.321822	\N	pending	\N	\N	\N	\N	\N	2025-05-22 09:47:41.321822	2025-05-22 09:47:41.321822	t	14	2025-06-07 09:47:41.321822	\N	\N
11	1	1	4	comprehensive	Environmental Compliance Audit - Full Site	Monthly environmental impact assessment of construction activities	2025-06-01 09:47:41.321822	\N	pending	\N	\N	\N	\N	\N	2025-05-22 09:47:41.321822	2025-05-22 09:47:41.321822	t	15	2025-06-08 09:47:41.321822	\N	\N
12	1	1	4	routine	Weekly Site Safety Walkthrough - Phase 1	General site safety inspection of Phase 1 area	2025-05-17 09:47:41.321822	2025-05-17 09:47:41.321822	completed	\N	\N	\N	\N	\N	2025-05-12 09:47:41.321822	2025-05-22 09:47:41.321822	t	16	2025-05-24 09:47:41.321822	\N	\N
13	1	1	4	routine	Electrical Safety Inspection - Power Distribution	Scheduled check of power distribution panels	2025-05-16 09:47:41.321822	2025-05-16 09:47:41.321822	completed	\N	\N	\N	\N	\N	2025-05-12 09:47:41.321822	2025-05-22 09:47:41.321822	t	7	2025-05-23 09:47:41.321822	\N	\N
14	1	1	4	special	Fall Protection Equipment Audit	Comprehensive inspection of all fall protection equipment on site	2025-05-15 09:47:41.321822	2025-05-16 09:47:41.321822	completed	\N	\N	\N	\N	\N	2025-05-08 09:47:41.321822	2025-05-22 09:47:41.321822	t	8	2025-05-22 09:47:41.321822	\N	\N
15	1	1	4	routine	Scaffold Safety Assessment - West Wing	Weekly scaffold inspection for the west wing construction area	2025-05-20 09:47:41.321822	\N	pending	\N	\N	\N	\N	\N	2025-05-17 09:47:41.321822	2025-05-22 09:47:41.321822	t	9	2025-05-27 09:47:41.321822	\N	\N
16	1	1	4	comprehensive	Heavy Equipment Maintenance Verification	Quarterly check of maintenance records and equipment condition	2025-05-21 09:47:41.321822	\N	pending	\N	\N	\N	\N	\N	2025-05-17 09:47:41.321822	2025-05-22 09:47:41.321822	t	10	2025-05-28 09:47:41.321822	\N	\N
17	1	1	4	routine	PPE Inventory and Compliance Check	Stock verification and worker compliance assessment	2025-05-22 09:47:41.321822	\N	pending	\N	\N	\N	\N	\N	2025-05-19 09:47:41.321822	2025-05-22 09:47:41.321822	t	11	2025-05-29 09:47:41.321822	\N	\N
18	1	1	4	routine	Fall Protection Inspection	Inspection of fall protection equipment and procedures	2025-05-22 09:48:53.35	\N	in_progress	\N	\N	\N	\N	\N	2025-05-22 09:49:09.262336	2025-05-22 09:49:09.262336	t	8	2025-05-29 09:48:53.35	2025-05-22 09:49:26.421079	\N
19	1	1	4	routine	Electrical Safety Inspection	Comprehensive electrical safety checks for construction sites	2025-05-22 14:24:45.865	\N	in_progress	\N	\N	\N	\N	\N	2025-05-22 14:24:58.686668	2025-05-22 14:24:58.686668	t	7	2025-05-29 14:24:45.865	2025-05-22 14:25:21.170872	\N
20	1	3	4	routine	Environmental Compliance Inspection	Site environmental impact and compliance assessment	2025-05-22 14:56:47.382	\N	in_progress	\N	\N	\N	\N	\N	2025-05-22 14:56:55.320414	2025-05-22 14:56:55.320414	t	15	2025-05-29 14:56:47.382	2025-05-22 14:57:08.576118	\N
21	1	1	4	routine	Fall Protection Inspection	Inspection of fall protection equipment and procedures	2025-05-23 09:54:50.15	\N	in_progress	\N	\N	\N	\N	\N	2025-05-23 09:55:01.674111	2025-05-23 09:55:01.674111	t	8	2025-05-30 09:54:50.15	2025-05-23 09:55:12.757667	\N
22	1	1	4	routine	Monthly template 	Test template 	2025-05-26 06:26:33.311	\N	in_progress	\N	\N	\N	\N	\N	2025-05-26 06:26:46.603127	2025-05-26 06:26:46.603127	t	1	2025-06-02 06:26:33.311	2025-05-26 06:26:56.047937	\N
\.


--
-- Data for Name: migration_history; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.migration_history (id, migration_name, applied_at, checksum) FROM stdin;
1	001_create_mysafety_schema	2025-05-26 07:28:18.451573	\N
4	002_add_missing_tables	2025-05-26 08:34:29.996839	\N
5	003_example_add_column	2025-05-26 08:34:30.128819	\N
\.


--
-- Data for Name: permit_requests; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.permit_requests (id, tenant_id, site_id, requester_id, approver_id, permit_type, title, description, location, start_date, end_date, status, approval_date, denial_reason, attachment_urls, created_at, updated_at, is_active) FROM stdin;
1	1	1	4	4	Electrical Work	Main Electrical Panel Upgrade	Upgrade of the main electrical panel in the North Tower basement to support additional power requirements for the new HVAC system. Work includes disconnecting the existing panel, installing a new 400A panel, and reconnecting all circuits.	North Tower, Basement, Room B103	2025-05-17 00:00:00	2025-06-06 00:00:00	approved	2025-05-12 00:00:00	\N	\N	2025-05-22 11:05:36.789809	2025-05-22 11:05:36.789809	t
2	1	1	4	4	Excavation	Foundation Trenching for New Building Wing	Excavation for foundation trenches for the new East Wing extension. Work involves digging trenches 2 meters deep along the marked perimeter. Heavy machinery will be in use.	East Campus, Building 3 Extension Site	2025-05-19 00:00:00	2025-06-01 00:00:00	approved	2025-05-15 00:00:00	\N	\N	2025-05-22 11:05:36.789809	2025-05-22 11:05:36.789809	t
3	1	1	4	4	Hot Work	Welding for Structural Supports	Welding operations to install structural steel supports in the new library addition. This work requires a fire watch due to nearby combustible materials.	Main Library, North Addition, 2nd Floor	2025-05-21 00:00:00	2025-05-24 00:00:00	approved	2025-05-19 00:00:00	\N	\N	2025-05-22 11:05:36.789809	2025-05-22 11:05:36.789809	t
4	1	1	6	4	Scaffold Installation	Facade Restoration Scaffolding	Erection of scaffolding on the west facade of the History Building for stone restoration work. Scaffold will be 5 levels high with protective netting and a pedestrian walkway below.	History Building, West Facade	2025-05-15 00:00:00	2025-07-06 00:00:00	approved	2025-05-12 00:00:00	\N	\N	2025-05-22 11:05:36.789809	2025-05-22 11:05:36.789809	t
5	1	1	7	4	Plumbing	Water Main Replacement	Replacement of deteriorated water main pipes in the Science Complex. Work requires shutting off water to the building during non-business hours.	Science Complex, Utility Tunnel A	2025-05-07 00:00:00	2025-05-25 00:00:00	approved	2025-05-02 00:00:00	\N	\N	2025-05-22 11:05:36.789809	2025-05-22 11:05:36.789809	t
6	1	1	4	7	Confined Space Entry	HVAC Duct Cleaning	Entry into confined space ductwork for cleaning and disinfection of HVAC system. Work requires proper ventilation equipment and gas monitoring.	Engineering Building, Mechanical Room 201	2025-05-17 00:00:00	2025-05-23 00:00:00	approved	2025-05-15 00:00:00	\N	\N	2025-05-22 11:05:36.789809	2025-05-22 11:05:36.789809	t
7	1	1	8	4	Roofing	Gymnasium Roof Repair	Repair of leaking areas on the gymnasium roof. Work includes replacing damaged shingles and fixing flashing around HVAC penetrations.	Main Gymnasium, Roof Level	2025-05-12 00:00:00	2025-05-27 00:00:00	approved	2025-05-10 00:00:00	\N	\N	2025-05-22 11:05:36.789809	2025-05-22 11:05:36.789809	t
8	1	1	6	4	Demolition	Interior Wall Removal	Demolition of non-load bearing walls on the 3rd floor to create a larger open office space. Work includes dust containment and debris removal.	Administration Building, 3rd Floor, West Wing	2025-04-22 00:00:00	2025-05-17 00:00:00	expired	2025-04-17 00:00:00	\N	\N	2025-05-22 11:05:36.789809	2025-05-22 11:05:36.789809	t
9	1	1	7	4	Electrical Work	Emergency Lighting Installation	Installation of emergency lighting systems throughout the Art Building to meet fire code requirements. Work requires minor wiring modifications.	Art Building, All Floors	2025-04-07 00:00:00	2025-05-12 00:00:00	expired	2025-04-02 00:00:00	\N	\N	2025-05-22 11:05:36.789809	2025-05-22 11:05:36.789809	t
10	1	1	8	\N	HVAC Installation	New Laboratory Ventilation System	Installation of a specialized ventilation system for the new chemistry laboratory. Work includes roof penetrations for exhaust stacks and new ductwork installation.	Science Building, Room 405	2025-06-01 00:00:00	2025-06-21 00:00:00	requested	\N	\N	\N	2025-05-22 11:05:36.789809	2025-05-22 11:05:36.789809	t
11	1	1	4	\N	Concrete Pouring	Sidewalk Replacement	Replacement of damaged concrete sidewalks along the main campus promenade. Work includes removal of old concrete, forming, and pouring new concrete paths.	Main Campus, Central Walkway	2025-05-27 00:00:00	2025-06-03 00:00:00	requested	\N	\N	\N	2025-05-22 11:05:36.789809	2025-05-22 11:05:36.789809	t
12	1	1	6	\N	Structural	Auditorium Seating Reinforcement	Structural reinforcement of the main auditorium seating area. Work involves installing additional support beams beneath the tiered seating system.	Performing Arts Center, Main Auditorium	2025-06-06 00:00:00	2025-06-16 00:00:00	requested	\N	\N	\N	2025-05-22 11:05:36.789809	2025-05-22 11:05:36.789809	t
13	1	1	7	\N	Excavation	Underground Utilities Repair	Excavation to access and repair damaged underground electrical conduits near the Student Center. Work requires careful hand digging around existing utilities.	Student Center, South Lawn	2025-05-29 00:00:00	2025-06-05 00:00:00	requested	\N	\N	\N	2025-05-22 11:05:36.789809	2025-05-22 11:05:36.789809	t
14	1	1	8	4	Hot Work	Cutting Steel Beams for Skylight	Cutting of steel support beams to install a new skylight in the library roof. Work involves torch cutting of structural elements.	Main Library, Central Reading Room	2025-05-25 00:00:00	2025-06-01 00:00:00	denied	2025-05-20 00:00:00	Structural engineer assessment required before approval. Current plans potentially compromise building structural integrity.	\N	2025-05-22 11:05:36.789809	2025-05-22 11:05:36.789809	t
15	1	1	4	\N	Plumbing	Plumbing at Square	Plumbing work permit	AB Square	2025-05-31 18:30:00	2025-06-29 18:30:00	requested	\N	\N	\N	2025-05-22 11:10:16.972557	2025-05-22 11:10:16.972557	t
16	1	1	4	\N	Plumbing	Plumbing permit	Approvcal from the city council	AB tower	2025-05-22 18:30:00	2025-06-29 18:30:00	requested	\N	\N	\N	2025-05-22 14:27:27.208592	2025-05-22 14:27:27.208592	t
17	1	10	4	\N	Hot Work	ABC	DDSDWDGTGRGRGRGRG	ABC	2025-05-23 18:30:00	2025-08-30 18:30:00	requested	\N	\N	\N	2025-05-23 04:47:21.801701	2025-05-23 04:47:21.801701	t
18	1	1	4	\N	Concrete Pouring	Concrete pouring dust permit	We will be piuring concerete ..	ABN squate unit 1	2025-05-30 18:30:00	2025-05-31 18:30:00	requested	\N	\N	\N	2025-05-26 06:31:25.389855	2025-05-26 06:31:25.389855	t
\.


--
-- Data for Name: report_history; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.report_history (id, tenant_id, user_id, site_id, start_date, end_date, created_at, report_name, report_url, status) FROM stdin;
\.


--
-- Data for Name: role_permissions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.role_permissions (id, tenant_id, role, resource, action, created_at, updated_at, is_active) FROM stdin;
1	1	safety_officer	users	create	2025-05-21 17:47:25.881561	2025-05-21 17:47:25.881561	t
2	1	safety_officer	users	read	2025-05-21 17:47:25.881561	2025-05-21 17:47:25.881561	t
3	1	safety_officer	users	update	2025-05-21 17:47:25.881561	2025-05-21 17:47:25.881561	t
4	1	safety_officer	users	delete	2025-05-21 17:47:25.881561	2025-05-21 17:47:25.881561	t
5	1	supervisor	users	create	2025-05-21 17:50:53.291455	2025-05-21 17:50:53.291455	t
6	1	supervisor	users	read	2025-05-21 17:50:53.291455	2025-05-21 17:50:53.291455	t
7	1	supervisor	users	update	2025-05-21 17:50:53.291455	2025-05-21 17:50:53.291455	t
8	1	safety_officer	hazards	create	2025-05-22 00:48:54.247362	2025-05-22 00:48:54.247362	t
9	1	safety_officer	hazards	read	2025-05-22 00:48:54.247362	2025-05-22 00:48:54.247362	t
10	1	safety_officer	hazards	update	2025-05-22 00:48:54.247362	2025-05-22 00:48:54.247362	t
11	1	safety_officer	hazards	delete	2025-05-22 00:48:54.247362	2025-05-22 00:48:54.247362	t
\.


--
-- Data for Name: site_personnel; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.site_personnel (id, site_id, user_id, tenant_id, site_role, assigned_by_id, start_date, end_date, permissions, team_id, notes, created_at, updated_at, is_active) FROM stdin;
1	1	5	1	safety_coordinator	4	2025-05-01	2025-05-31	\N	\N		2025-05-21 19:17:05.285	2025-05-21 19:17:05.285	t
2	1	4	1	safety_coordinator	4	2025-05-01	2025-05-31	\N	\N	\N	2025-05-21 21:32:31.527	2025-05-21 21:32:31.527	t
4	1	14	1	safety_coordinator	4	\N	\N	\N	\N	\N	2025-05-21 22:14:26.824	2025-05-21 22:14:26.824	t
3	1	6	1	subcontractor	4	2025-05-01	2025-05-31	\N	1	\N	2025-05-21 22:12:57.667	2025-05-21 22:12:57.667	t
5	1	15	1	safety_coordinator	4	\N	\N	\N	2	\N	2025-05-21 22:26:09.436	2025-05-21 22:26:09.436	t
\.


--
-- Data for Name: sites; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.sites (id, tenant_id, name, address, city, state, zip_code, country, gps_coordinates, contact_name, contact_phone, contact_email, start_date, end_date, status, description, created_at, updated_at, is_active) FROM stdin;
1	1	Harvard university campus 1	Harvard Square m	Boston	MA	01452	United States		James	7441399081	Shyam@jumbow.io	2025-05-01	2025-10-31	planned	Harvard university campus construction 	2025-05-21 18:32:11.593846	2025-05-21 18:39:34.155	t
3	1	Downtown Medical Center Expansion	421 Main Street, Boston, MA 02108	Boston	MA	02108	USA	\N	\N	\N	\N	\N	\N	active	Expansion of the east wing of Downtown Medical Center to add 120 beds and modern facilities.	2025-05-22 14:43:48.514787	2025-05-22 14:43:48.514787	t
4	1	Riverfront Luxury Condominiums	50 Harbor Drive, New York, NY 10014	New York	NY	10014	USA	\N	\N	\N	\N	\N	\N	active	Construction of 35-story luxury condominium tower with 250 units and retail spaces.	2025-05-22 14:44:03.221718	2025-05-22 14:44:03.221718	t
5	1	Tech Innovation Campus Phase II	1800 Technology Way, San Francisco, CA 94105	San Francisco	CA	94105	USA	\N	\N	\N	\N	\N	\N	active	Second phase of the tech campus development with four office buildings and a research center.	2025-05-22 14:44:03.221718	2025-05-22 14:44:03.221718	t
6	1	Westside Elementary School Renovation	350 School Avenue, Chicago, IL 60611	Chicago	IL	60611	USA	\N	\N	\N	\N	\N	\N	active	Complete renovation of the 50-year-old elementary school including seismic upgrades and modernization.	2025-05-22 14:44:03.221718	2025-05-22 14:44:03.221718	t
7	1	Central Station Transit Hub	100 Transit Plaza, Seattle, WA 98104	Seattle	WA	98104	USA	\N	\N	\N	\N	\N	\N	active	Construction of new multi-modal transit hub connecting light rail, bus, and regional train services.	2025-05-22 14:44:03.221718	2025-05-22 14:44:03.221718	t
8	1	Oakwood Bridge Replacement	River Road, Portland, OR 97201	Portland	OR	97201	USA	\N	\N	\N	\N	\N	\N	active	Replacement of aging bridge structure with new earthquake-resistant design.	2025-05-22 14:44:03.221718	2025-05-22 14:44:03.221718	t
9	1	Greenfield Solar Farm	5000 Energy Drive, Phoenix, AZ 85004	Phoenix	AZ	85004	USA	\N	\N	\N	\N	\N	\N	active	Installation of 50MW solar farm with battery storage facility on former industrial land.	2025-05-22 14:44:03.221718	2025-05-22 14:44:03.221718	t
10	1	Bayside Shopping Mall Redevelopment	200 Retail Drive, Miami, FL 33131	Miami	FL	33131	USA	\N	\N	\N	\N	\N	\N	active	Transformation of outdated shopping mall into mixed-use development with retail, dining, and apartments.	2025-05-22 14:44:03.221718	2025-05-22 14:44:03.221718	t
11	1	Mountain View Data Center	4500 Cloud Way, Denver, CO 80202	Denver	CO	80202	USA	\N	\N	\N	\N	\N	\N	active	Construction of tier-4 data center with state-of-the-art cooling and power systems.	2025-05-22 14:44:03.221718	2025-05-22 14:44:03.221718	t
12	1	Harbor City Convention Center	1000 Convention Boulevard, San Diego, CA 92101	San Diego	CA	92101	USA	\N	\N	\N	\N	\N	\N	active	New convention center with 500,000 sq ft of exhibition space and 50,000 sq ft of meeting rooms.	2025-05-22 14:44:03.221718	2025-05-22 14:44:03.221718	t
\.


--
-- Data for Name: subcontractors; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.subcontractors (id, tenant_id, name, contact_person, email, phone, address, city, state, zip_code, country, contract_number, contract_start_date, contract_end_date, services_provided, status, created_at, updated_at, is_active) FROM stdin;
\.


--
-- Data for Name: system_logs; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.system_logs (id, tenant_id, user_id, action, entity_type, entity_id, details, ip_address, user_agent, created_at) FROM stdin;
6	1	\N	tenant_created	tenant	1	{"name": "Venpep Constructions"}	\N	\N	2025-05-21 17:36:24.73657
7	1	4	user_registered	user	4	{"email": "shyam@venpep.com"}	\N	\N	2025-05-21 17:36:24.832678
8	1	4	user_role_updated	user	4	{"newRole": "supervisor", "oldRole": "safety_officer", "username": "shyam"}	\N	\N	2025-05-21 17:48:19.838254
9	1	4	user_role_updated	user	4	{"newRole": "safety_officer", "oldRole": "supervisor", "username": "shyam"}	\N	\N	2025-05-21 17:51:23.872077
10	1	4	user_created	user	5	{"role": "supervisor", "email": "shyam@jumbow.io", "username": "shyam"}	\N	\N	2025-05-21 18:10:38.929719
11	1	4	user_role_updated	user	5	{"newRole": "safety_officer", "oldRole": "supervisor", "username": "shyam"}	\N	\N	2025-05-21 18:10:56.892041
12	1	4	user_role_updated	user	5	{"newRole": "supervisor", "oldRole": "safety_officer", "username": "shyam"}	\N	\N	2025-05-21 18:11:06.340471
13	1	4	account_suspended	user	5	{"email": "shyam@jumbow.io", "username": "shyam"}	\N	\N	2025-05-21 18:18:01.368758
14	1	4	account_activated	user	5	{"email": "shyam@jumbow.io", "username": "shyam"}	\N	\N	2025-05-21 18:18:04.632722
15	1	4	account_suspended	user	5	{"email": "shyam@jumbow.io", "username": "shyam"}	\N	\N	2025-05-21 18:18:08.001888
16	1	4	account_activated	user	5	{"email": "shyam@jumbow.io", "username": "shyam"}	\N	\N	2025-05-21 18:18:25.526559
17	1	4	user_login	user	4	\N	10.82.11.17	Mozilla/5.0 (iPhone; CPU iPhone OS 18_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.137.0 (iOS 18.4.1)	2025-05-21 18:28:16.598174
18	1	4	site_created	site	1	{"name": "Harvard university campus ", "address": "Harvard Square m"}	\N	\N	2025-05-21 18:32:11.688279
19	1	4	site_updated	site	1	{"name": "Harvard university campus 1", "status": "planned", "address": "Harvard Square m"}	\N	\N	2025-05-21 18:39:34.194549
20	1	4	personnel_assigned	site_personnel	1	{"siteId": 1, "userId": 5, "endDate": "2025-05-31", "startDate": "2025-05-01"}	\N	\N	2025-05-21 19:17:05.334557
21	1	4	team_created	team	1	{"name": "Inspection", "site_id": 1}	\N	\N	2025-05-21 21:04:55.801965
22	1	4	personnel_assigned	site_personnel	2	{"siteId": 1, "userId": 4, "endDate": "2025-05-31", "startDate": "2025-05-01"}	\N	\N	2025-05-21 21:32:31.574921
23	1	4	user_created	user	6	{"role": "employee", "email": "t4em1@t4.com", "username": "t4em1"}	\N	\N	2025-05-21 22:04:24.667829
24	1	4	user_created	user	7	{"role": "employee", "email": "t4em2@t4.com", "username": "t4em2"}	\N	\N	2025-05-21 22:04:25.021218
25	1	4	user_created	user	8	{"role": "employee", "email": "t4em3@t4.com", "username": "t4em3"}	\N	\N	2025-05-21 22:04:25.379285
26	1	4	user_created	user	9	{"role": "employee", "email": "t4em4@t4.com", "username": "t4em4"}	\N	\N	2025-05-21 22:04:25.731083
27	1	4	user_created	user	10	{"role": "employee", "email": "t4em5@t4.com", "username": "t4em5"}	\N	\N	2025-05-21 22:04:26.063541
28	1	4	user_created	user	11	{"role": "employee", "email": "t4em6@t4.com", "username": "t4em6"}	\N	\N	2025-05-21 22:04:26.4137
29	1	4	user_created	user	12	{"role": "employee", "email": "t4em7@t4.com", "username": "t4em7"}	\N	\N	2025-05-21 22:04:26.749432
30	1	4	user_created	user	13	{"role": "supervisor", "email": "t4sup1@t4.com", "username": "t4sup1"}	\N	\N	2025-05-21 22:04:27.116323
31	1	4	user_created	user	14	{"role": "supervisor", "email": "t4sup2@t4.com", "username": "t4sup2"}	\N	\N	2025-05-21 22:07:05.35621
32	1	4	user_created	user	15	{"role": "supervisor", "email": "t4sup3@t4.com", "username": "t4sup3"}	\N	\N	2025-05-21 22:07:07.115101
33	1	4	user_created	user	16	{"role": "safety_officer", "email": "t4saf1@t4.com", "username": "t4saf1"}	\N	\N	2025-05-21 22:07:07.537961
34	1	4	user_created	user	17	{"role": "subcontractor", "email": "t4sub1@t4.com", "username": "t4sub1"}	\N	\N	2025-05-21 22:07:07.804019
35	1	4	user_created	user	18	{"role": "subcontractor", "email": "t4sub2@t4.com", "username": "t4sub2"}	\N	\N	2025-05-21 22:07:08.990827
36	1	4	team_created	team	2	{"name": "Scaffholding Sub-contractor ", "site_id": 1}	\N	\N	2025-05-21 22:12:23.543079
37	1	4	personnel_assigned	site_personnel	3	{"siteId": 1, "userId": 6, "endDate": "2025-05-31", "startDate": "2025-05-01"}	\N	\N	2025-05-21 22:12:57.704232
38	1	4	personnel_assigned	site_personnel	4	{"siteId": 1, "userId": 14, "endDate": null, "startDate": null}	\N	\N	2025-05-21 22:14:26.857059
39	1	4	personnel_assigned	site_personnel	5	{"siteId": 1, "userId": 15, "endDate": null, "startDate": null}	\N	\N	2025-05-21 22:26:09.501373
40	1	4	user_login	user	4	\N	10.82.11.17	Mozilla/5.0 (iPhone; CPU iPhone OS 18_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.137.0 (iOS 18.4.1)	2025-05-22 01:58:38.150668
41	1	4	user_login	user	4	\N	10.82.12.17	Mozilla/5.0 (iPhone; CPU iPhone OS 18_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.137.0 (iOS 18.4.1)	2025-05-22 02:02:23.482027
42	1	4	user_login	user	4	\N	10.82.1.2	Mozilla/5.0 (iPhone; CPU iPhone OS 18_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.137.0 (iOS 18.4.1)	2025-05-22 02:04:47.294392
43	1	4	user_login	user	4	\N	10.82.9.170	Mozilla/5.0 (iPhone; CPU iPhone OS 18_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.137.0 (iOS 18.4.1)	2025-05-22 02:22:25.957156
44	1	4	user_login	user	4	\N	10.82.9.170	Mozilla/5.0 (iPhone; CPU iPhone OS 18_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.137.0 (iOS 18.4.1)	2025-05-22 02:42:01.168548
45	1	4	user_login	user	4	\N	10.82.15.98	Mozilla/5.0 (iPhone; CPU iPhone OS 18_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.137.0 (iOS 18.4.1)	2025-05-22 02:45:51.074273
46	1	4	user_login	user	4	\N	10.82.9.170	Mozilla/5.0 (iPhone; CPU iPhone OS 18_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.137.0 (iOS 18.4.1)	2025-05-22 03:11:22.186286
47	1	4	user_login	user	4	\N	10.82.9.170	Mozilla/5.0 (iPhone; CPU iPhone OS 18_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.137.0 (iOS 18.4.1)	2025-05-22 03:12:06.277802
48	1	4	user_login	user	4	\N	10.82.1.2	Mozilla/5.0 (iPhone; CPU iPhone OS 18_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.137.0 (iOS 18.4.1)	2025-05-22 03:13:00.834408
49	1	4	user_login	user	4	\N	10.82.1.2	Mozilla/5.0 (iPhone; CPU iPhone OS 18_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.137.0 (iOS 18.4.1)	2025-05-22 03:14:35.090198
50	1	4	user_login	user	4	\N	10.82.12.17	Mozilla/5.0 (iPhone; CPU iPhone OS 18_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.137.0 (iOS 18.4.1)	2025-05-22 03:16:23.485716
51	1	4	user_login	user	4	\N	10.82.11.17	Mozilla/5.0 (iPhone; CPU iPhone OS 18_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.137.0 (iOS 18.4.1)	2025-05-22 03:19:14.508848
52	1	4	user_login	user	4	\N	10.82.9.170	Mozilla/5.0 (iPhone; CPU iPhone OS 18_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.137.0 (iOS 18.4.1)	2025-05-22 03:48:49.565143
53	1	4	user_login	user	4	\N	10.82.11.17	Mozilla/5.0 (iPhone; CPU iPhone OS 18_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.137.0 (iOS 18.4.1)	2025-05-22 04:03:57.504012
54	1	4	user_login	user	4	\N	10.82.12.17	Mozilla/5.0 (iPhone; CPU iPhone OS 18_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.137.0 (iOS 18.4.1)	2025-05-22 04:09:47.848452
55	1	4	inspection_section_created	inspection_section	2	{"name": "General Safety", "templateId": 5}	\N	\N	2025-05-22 04:33:26.851
56	1	4	user_login	user	4	\N	10.82.12.17	Mozilla/5.0 (iPhone; CPU iPhone OS 18_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.137.0 (iOS 18.4.1)	2025-05-22 04:48:59.109789
57	1	4	user_login	user	4	\N	10.82.11.17	Mozilla/5.0 (iPhone; CPU iPhone OS 18_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.137.0 (iOS 18.4.1)	2025-05-22 04:49:08.367906
58	1	4	inspection_section_created	inspection_section	3	{"name": "General Safety", "templateId": 6}	\N	\N	2025-05-22 04:50:22.051
59	1	4	inspection_item_created	inspection_item	2	{"question": "Process orientation", "sectionId": 3}	\N	\N	2025-05-22 04:50:22.457
60	1	4	user_login	user	4	\N	10.82.11.17	Mozilla/5.0 (iPhone; CPU iPhone OS 18_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.137.0 (iOS 18.4.1)	2025-05-22 05:04:35.532783
61	1	4	user_login	user	4	\N	10.82.12.17	Mozilla/5.0 (iPhone; CPU iPhone OS 18_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.137.0 (iOS 18.4.1)	2025-05-22 05:05:40.322469
62	1	4	user_login	user	4	\N	10.82.12.17	Mozilla/5.0 (iPhone; CPU iPhone OS 18_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.137.0 (iOS 18.4.1)	2025-05-22 05:07:40.488413
63	1	4	inspection_created	inspection	1	{"title": "Weekly test ", "siteId": 1}	\N	\N	2025-05-22 05:29:58.188907
64	1	4	user_login	user	4	\N	10.82.15.98	Mozilla/5.0 (iPhone; CPU iPhone OS 18_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.137.0 (iOS 18.4.1)	2025-05-22 05:34:57.680537
65	1	4	inspection_created	inspection	2	{"title": "Weekly test Electrical", "siteId": 1}	\N	\N	2025-05-22 06:30:59.437485
66	1	4	inspection_started	inspection	2	{"title": "Weekly test Electrical"}	\N	\N	2025-05-22 06:42:07.106573
67	1	4	user_login	user	4	\N	10.82.9.170	Mozilla/5.0 (iPhone; CPU iPhone OS 18_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.137.0 (iOS 18.4.1)	2025-05-22 07:06:03.955549
68	1	4	inspection_started	inspection	1	{"title": "Weekly test "}	\N	\N	2025-05-22 07:09:38.500548
69	1	4	user_login	user	4	\N	10.82.13.94	Mozilla/5.0 (iPhone; CPU iPhone OS 18_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.137.0 (iOS 18.4.1)	2025-05-22 07:55:25.435309
70	1	4	user_login	user	4	\N	10.82.9.170	Mozilla/5.0 (iPhone; CPU iPhone OS 18_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.137.0 (iOS 18.4.1)	2025-05-22 08:01:42.877187
71	1	4	user_login	user	4	\N	10.82.1.2	Mozilla/5.0 (iPhone; CPU iPhone OS 18_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.137.0 (iOS 18.4.1)	2025-05-22 08:14:35.450626
72	1	4	user_login	user	4	\N	10.82.13.94	Mozilla/5.0 (iPhone; CPU iPhone OS 18_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.137.0 (iOS 18.4.1)	2025-05-22 08:33:59.523262
73	1	4	user_login	user	4	\N	10.82.15.98	Mozilla/5.0 (iPhone; CPU iPhone OS 18_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.137.0 (iOS 18.4.1)	2025-05-22 08:40:30.233626
74	1	4	hazard_updated	hazard	1	{"status": "in_progress", "previousStatus": "open"}	\N	\N	2025-05-22 08:56:39.405014
75	1	4	inspection_created	inspection	18	{"title": "Fall Protection Inspection", "siteId": 1}	\N	\N	2025-05-22 09:49:09.292746
76	1	4	inspection_started	inspection	18	{"title": "Fall Protection Inspection"}	\N	\N	2025-05-22 09:49:26.445895
77	1	4	user_login	user	4	\N	10.82.11.17	Mozilla/5.0 (iPhone; CPU iPhone OS 18_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.137.0 (iOS 18.4.1)	2025-05-22 09:56:41.168705
78	1	4	user_login	user	4	\N	10.82.15.98	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36	2025-05-22 10:06:37.399911
79	1	4	user_login	user	4	\N	10.82.11.17	Mozilla/5.0 (iPhone; CPU iPhone OS 18_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.137.0 (iOS 18.4.1)	2025-05-22 10:59:07.263194
80	1	4	permit_created	permit	15	{"title": "Plumbing at Square", "permitType": "Plumbing"}	\N	\N	2025-05-22 11:10:16.998879
81	1	4	user_login	user	4	\N	10.82.11.17	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36	2025-05-22 12:16:04.687436
82	1	4	user_login	user	4	\N	10.82.0.173	Mozilla/5.0 (iPhone; CPU iPhone OS 18_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.137.0 (iOS 18.4.1)	2025-05-22 14:00:18.743828
83	1	4	user_login	user	4	\N	10.82.11.17	Mozilla/5.0 (iPhone; CPU iPhone OS 18_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.137.0 (iOS 18.4.1)	2025-05-22 14:04:10.972782
84	1	4	user_login	user	4	\N	35.184.122.198	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36	2025-05-22 14:22:17.370953
85	1	4	inspection_created	inspection	19	{"title": "Electrical Safety Inspection", "siteId": 1}	\N	\N	2025-05-22 14:24:58.744517
86	1	4	inspection_started	inspection	19	{"title": "Electrical Safety Inspection"}	\N	\N	2025-05-22 14:25:21.221598
87	1	4	permit_created	permit	16	{"title": "Plumbing permit", "permitType": "Plumbing"}	\N	\N	2025-05-22 14:27:27.266187
88	1	4	inspection_created	inspection	20	{"title": "Environmental Compliance Inspection", "siteId": 3}	\N	\N	2025-05-22 14:56:55.406112
89	1	4	inspection_started	inspection	20	{"title": "Environmental Compliance Inspection"}	\N	\N	2025-05-22 14:57:08.63044
90	1	4	user_login	user	4	\N	34.46.100.90	Mozilla/5.0 (iPhone; CPU iPhone OS 18_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.4 Mobile/15E148 Safari/604.1	2025-05-22 15:11:35.077646
91	1	4	user_login	user	4	\N	34.27.222.49	Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1	2025-05-22 15:16:15.135869
92	1	4	user_login	user	4	\N	10.82.3.146	Mozilla/5.0 (iPhone; CPU iPhone OS 18_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.137.0 (iOS 18.4.1)	2025-05-22 15:18:41.019848
93	1	4	user_login	user	4	\N	35.238.235.161	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36	2025-05-22 15:20:18.565837
94	1	4	user_login	user	4	\N	35.238.235.161	Mozilla/5.0 (iPhone; CPU iPhone OS 18_5_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/136.0.7103.91 Mobile/15E148 Safari/604.1	2025-05-22 15:20:34.245901
95	1	4	user_role_updated	user	13	{"newRole": "safety_officer", "oldRole": "supervisor", "username": "t4sup1"}	\N	\N	2025-05-22 15:38:58.072005
96	1	4	user_login	user	4	\N	35.238.235.161	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36	2025-05-22 15:43:14.875754
97	1	4	user_login	user	4	\N	35.202.5.198	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36	2025-05-22 15:56:39.494705
98	1	4	user_login	user	4	\N	35.184.122.198	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/113.0	2025-05-23 03:32:46.033875
99	1	4	user_login	user	4	\N	35.202.5.198	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/113.0	2025-05-23 03:53:14.168206
100	1	4	permit_created	permit	17	{"title": "ABC", "permitType": "Hot Work"}	\N	\N	2025-05-23 04:47:21.917506
101	1	4	user_login	user	4	\N	10.82.15.98	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36	2025-05-23 05:04:57.920711
102	1	4	user_logout	user	4	\N	35.202.5.198	\N	2025-05-23 06:07:44.490641
103	1	4	user_login	user	4	\N	34.68.1.153	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/113.0	2025-05-23 06:07:48.422099
104	1	4	user_login	user	4	\N	34.46.100.90	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36	2025-05-23 06:16:44.979809
105	1	4	user_login	user	4	\N	35.238.235.161	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:138.0) Gecko/20100101 Firefox/138.0	2025-05-23 06:19:25.508416
106	1	4	user_logout	user	4	\N	34.68.1.153	\N	2025-05-23 08:03:30.857193
107	1	4	user_login	user	4	\N	35.184.122.198	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36	2025-05-23 09:53:23.726465
108	1	4	inspection_created	inspection	21	{"title": "Fall Protection Inspection", "siteId": 1}	\N	\N	2025-05-23 09:55:01.735858
109	1	4	inspection_started	inspection	21	{"title": "Fall Protection Inspection"}	\N	\N	2025-05-23 09:55:12.805084
110	2	\N	tenant_created	tenant	2	{"name": "Construction"}	\N	\N	2025-05-23 10:55:24.468276
111	2	19	user_registered	user	19	{"email": "james@example.com"}	\N	\N	2025-05-23 10:55:24.644665
112	2	19	user_logout	user	19	\N	35.238.235.161	\N	2025-05-23 11:06:53.268197
113	1	4	user_login	user	4	\N	34.68.1.153	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/113.0	2025-05-23 11:43:47.159156
114	1	4	user_login	user	4	\N	35.238.235.161	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36	2025-05-23 11:53:23.401549
115	1	4	user_logout	user	4	\N	35.238.235.161	\N	2025-05-23 11:53:46.337167
116	1	4	user_login	user	4	\N	35.238.235.161	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.3 Safari/605.1.15	2025-05-23 12:09:05.878368
117	1	4	user_login	user	4	\N	34.121.19.132	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36 Edg/136.0.0.0	2025-05-25 12:36:29.052082
118	1	4	user_logout	user	4	\N	35.202.5.198	\N	2025-05-25 12:55:53.060293
119	1	4	user_login	user	4	\N	34.46.100.90	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36 Edg/136.0.0.0	2025-05-25 12:59:00.076847
120	1	4	user_login	user	4	\N	35.184.122.198	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36 Edg/136.0.0.0	2025-05-25 15:14:48.605059
121	1	4	user_login	user	4	\N	34.121.19.132	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36	2025-05-25 15:46:09.27709
122	1	4	user_login	user	4	\N	35.202.5.198	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/113.0	2025-05-26 03:11:28.990224
123	1	4	user_login	user	4	\N	35.202.5.198	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36	2025-05-26 03:17:24.964389
124	1	4	user_login	user	4	\N	104.154.113.146	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36	2025-05-26 06:00:07.180451
125	1	4	user_login	user	4	\N	10.82.11.3	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36	2025-05-26 06:16:48.516282
126	1	4	user_login	user	4	\N	10.82.3.47	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36	2025-05-26 06:21:33.116163
127	1	4	inspection_created	inspection	22	{"title": "Monthly template ", "siteId": 1}	\N	\N	2025-05-26 06:26:46.648096
128	1	4	inspection_started	inspection	22	{"title": "Monthly template "}	\N	\N	2025-05-26 06:26:56.087822
129	1	4	user_logout	user	4	\N	34.68.1.153	\N	2025-05-26 06:30:13.731596
130	1	4	permit_created	permit	18	{"title": "Concrete pouring dust permit", "permitType": "Concrete Pouring"}	\N	\N	2025-05-26 06:31:25.418928
131	1	4	user_login	user	4	\N	34.68.1.153	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/113.0	2025-05-26 06:40:33.441811
132	1	4	user_login	user	4	\N	34.69.33.25	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36	2025-05-26 06:44:23.181915
\.


--
-- Data for Name: team_members; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.team_members (id, team_id, user_id, site_role, joined_at) FROM stdin;
\.


--
-- Data for Name: teams; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.teams (id, tenant_id, site_id, name, description, leader_id, color, specialties, created_by_id, created_at, updated_at, is_active) FROM stdin;
1	1	1	Inspection	\N	\N	\N	\N	4	2025-05-21 21:04:55.756	2025-05-21 21:04:55.756	t
2	1	1	Scaffholding Sub-contractor 	This is the scaffholding sub-contractor team	\N	\N	\N	4	2025-05-21 22:12:23.469	2025-05-21 22:12:23.469	t
\.


--
-- Data for Name: tenants; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.tenants (id, name, email, phone, address, city, state, zip_code, country, logo, subscription_plan, subscription_status, subscription_end_date, active_users, max_users, active_sites, max_sites, created_at, updated_at, stripe_customer_id, settings, is_active) FROM stdin;
1	Venpep Constructions	shyam@venpep.com	9894090038	Boston MA	\N	\N	\N	\N	\N	basic	active	\N	0	5	1	1	2025-05-21 17:36:24.706043	2025-05-21 18:32:11.653	\N	\N	t
2	Construction	construction@example.com	9874563210	987 Street	\N	\N	\N	\N	\N	basic	active	\N	0	5	0	1	2025-05-23 10:55:24.383399	2025-05-23 10:55:24.383399	\N	\N	t
\.


--
-- Data for Name: training_content; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.training_content (id, tenant_id, title, description, content_type, video_id, document_url, language, duration, is_common, created_by_id, created_at, updated_at, is_active) FROM stdin;
1	1	Introduction and Safety Basics	Training module covering introduction and safety basics	video	dQw4w9WgXcQ	\N	en	720	f	4	2025-02-20 23:30:10.537	2025-02-20 23:30:10.537	t
2	1	Required Equipment and Usage	Training module covering required equipment and usage	document	\N	https://example.com/training/document2.pdf	es	1080	f	4	2024-12-03 06:22:00.534	2024-12-03 06:22:00.534	t
3	1	Hazard Recognition and Assessment	Training module covering hazard recognition and assessment	video	6Q3uaSnRGtI	\N	fr	1260	f	4	2024-01-08 02:25:18.799	2024-01-08 02:25:18.799	t
4	1	Proper Procedures and Protocols	Training module covering proper procedures and protocols	document	\N	https://example.com/training/document4.pdf	en	1440	f	4	2024-02-14 11:47:37.41	2024-02-14 11:47:37.41	t
5	1	Emergency Response	Training module covering emergency response	video	Ksz-K-eTrgY	\N	es	480	f	4	2024-11-21 22:01:01.573	2024-11-21 22:01:01.573	t
6	1	Hands-on Demonstration	Training module covering hands-on demonstration	document	\N	https://example.com/training/document6.pdf	fr	660	f	4	2024-03-22 12:29:39.099	2024-03-22 12:29:39.099	t
7	1	Case Studies and Examples	Training module covering case studies and examples	video	X9e1kpCZ0EA	\N	en	600	f	4	2024-07-28 21:37:37.312	2024-07-28 21:37:37.312	t
8	1	Legal Requirements and Standards	Training module covering legal requirements and standards	document	\N	https://example.com/training/document8.pdf	es	960	f	4	2024-02-26 03:12:37.021	2024-02-26 03:12:37.021	t
9	1	Testing and Certification Process	Training module covering testing and certification process	video	dQw4w9WgXcQ	\N	fr	840	f	4	2024-06-26 14:05:07.428	2024-06-26 14:05:07.428	t
10	1	Refresher and Updates	Training module covering refresher and updates	document	\N	https://example.com/training/document10.pdf	en	1260	f	4	2024-02-17 07:57:55.852	2024-02-17 07:57:55.852	t
11	1	Introduction and Safety Basics	Training module covering introduction and safety basics	video	6Q3uaSnRGtI	\N	es	600	f	4	2024-05-28 18:12:44.66	2024-05-28 18:12:44.66	t
12	1	Required Equipment and Usage	Training module covering required equipment and usage	document	\N	https://example.com/training/document12.pdf	fr	1200	f	4	2025-04-17 22:04:22.698	2025-04-17 22:04:22.698	t
13	1	Hazard Recognition and Assessment	Training module covering hazard recognition and assessment	video	Ksz-K-eTrgY	\N	en	480	f	4	2025-04-23 09:19:13.029	2025-04-23 09:19:13.029	t
14	1	Proper Procedures and Protocols	Training module covering proper procedures and protocols	document	\N	https://example.com/training/document14.pdf	es	1020	f	4	2024-10-13 11:40:58.488	2024-10-13 11:40:58.488	t
15	1	Emergency Response	Training module covering emergency response	video	X9e1kpCZ0EA	\N	fr	300	f	4	2024-08-08 23:44:53.102	2024-08-08 23:44:53.102	t
16	1	Hands-on Demonstration	Training module covering hands-on demonstration	document	\N	https://example.com/training/document16.pdf	en	960	f	4	2024-02-14 04:58:23.358	2024-02-14 04:58:23.358	t
17	1	Case Studies and Examples	Training module covering case studies and examples	video	dQw4w9WgXcQ	\N	es	360	f	4	2024-10-05 14:45:50.514	2024-10-05 14:45:50.514	t
18	1	Legal Requirements and Standards	Training module covering legal requirements and standards	document	\N	https://example.com/training/document18.pdf	fr	540	f	4	2024-04-18 04:49:20.699	2024-04-18 04:49:20.699	t
19	1	Testing and Certification Process	Training module covering testing and certification process	video	6Q3uaSnRGtI	\N	en	840	f	4	2025-01-31 12:38:05.991	2025-01-31 12:38:05.991	t
20	1	Refresher and Updates	Training module covering refresher and updates	document	\N	https://example.com/training/document20.pdf	es	360	f	4	2024-09-30 13:39:27.867	2024-09-30 13:39:27.867	t
21	1	Introduction and Safety Basics	Training module covering introduction and safety basics	video	Ksz-K-eTrgY	\N	fr	1080	f	4	2024-05-20 23:09:01.584	2024-05-20 23:09:01.584	t
22	1	Required Equipment and Usage	Training module covering required equipment and usage	document	\N	https://example.com/training/document22.pdf	en	840	f	4	2025-02-11 18:59:17.298	2025-02-11 18:59:17.298	t
23	1	Hazard Recognition and Assessment	Training module covering hazard recognition and assessment	video	X9e1kpCZ0EA	\N	es	540	f	4	2024-11-04 10:27:46.595	2024-11-04 10:27:46.595	t
24	1	Proper Procedures and Protocols	Training module covering proper procedures and protocols	document	\N	https://example.com/training/document24.pdf	fr	600	f	4	2024-09-28 09:11:34.663	2024-09-28 09:11:34.663	t
25	1	Emergency Response	Training module covering emergency response	video	dQw4w9WgXcQ	\N	en	300	f	4	2024-02-10 18:09:20.975	2024-02-10 18:09:20.975	t
\.


--
-- Data for Name: training_courses; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.training_courses (id, tenant_id, title, description, passing_score, is_required, assigned_roles, assigned_site_ids, assigned_subcontractor_ids, content_ids, created_by_id, created_at, updated_at, is_active) FROM stdin;
1	1	Fall Protection Training	Learn essential safety procedures to prevent falls when working at heights. This course covers proper use of harnesses, fall arrest systems, safety nets, and guardrails according to OSHA requirements.	73	t	["supervisor", "safety_officer"]	\N	\N	[10, 8]	4	2024-11-29 22:44:46.125	2024-11-29 22:44:46.125	t
2	1	Confined Space Entry	Comprehensive training on identifying hazards, testing air quality, and safely working in confined spaces. Includes emergency response procedures and required PPE.	79	t	["safety_officer", "employee"]	[1]	\N	[20, 4]	4	2024-04-19 14:47:45.135	2024-04-19 14:47:45.135	t
3	1	Scaffolding Safety	Detailed instruction on building, inspecting, and working safely on scaffolds. Covers load capacities, fall protection, and scaffold types.	72	t	["employee"]	\N	\N	[1, 15, 24]	4	2024-08-22 01:27:06.776	2024-08-22 01:27:06.776	t
4	1	Electrical Safety	Safety training for working with electrical systems and equipment. Covers lockout/tagout procedures, arc flash protection, and electrical hazard identification.	89	t	["subcontractor"]	\N	\N	[2, 4]	4	2024-10-12 02:30:47.224	2024-10-12 02:30:47.224	t
5	1	Fire Prevention and Protection	Essential training on fire prevention, fire classes, extinguisher use, and emergency evacuation procedures specific to construction sites.	74	t	["employee", "supervisor", "safety_officer"]	[1]	\N	[1]	4	2025-05-21 12:02:02.159	2025-05-21 12:02:02.159	t
6	1	Hazard Communication	Overview of the Hazard Communication Standard (HazCom), GHS labels, safety data sheets, and chemical safety in construction environments.	82	t	["subcontractor", "safety_officer", "supervisor"]	\N	\N	[2, 8]	4	2024-04-10 08:15:28.975	2024-04-10 08:15:28.975	t
7	1	Personal Protective Equipment	Comprehensive training on selection, use, inspection, and maintenance of personal protective equipment including head, eye, hearing, respiratory, hand, and foot protection.	77	t	["safety_officer", "subcontractor", "supervisor"]	\N	\N	[10, 21]	4	2024-10-27 22:38:18.824	2024-10-27 22:38:18.824	t
8	1	Heavy Equipment Operation	Operating procedures and safety protocols for excavators, backhoes, bulldozers, and other heavy construction equipment.	87	t	["safety_officer"]	[1]	\N	[7, 24]	4	2024-06-02 23:02:48.553	2024-06-02 23:02:48.553	t
9	1	Crane Safety and Operation	Detailed training on crane operation, signaling, load calculation, inspection, and set-up requirements.	77	t	["subcontractor", "safety_officer"]	[1]	\N	[24, 8]	4	2025-01-06 04:01:41.513	2025-01-06 04:01:41.513	t
10	1	Excavation and Trenching Safety	Safety procedures for excavation activities, soil classification, protective systems, and trench collapse prevention.	89	t	["employee", "supervisor", "safety_officer"]	[1]	\N	[4, 11, 23]	4	2024-08-24 10:16:45.024	2024-08-24 10:16:45.024	t
11	1	First Aid and CPR	Basic first aid procedures, CPR techniques, and AED use specific to construction site emergencies.	88	t	["safety_officer"]	\N	\N	[1, 3, 23]	4	2024-07-11 21:27:45.354	2024-07-11 21:27:45.354	t
12	1	Ladder Safety	Proper selection, inspection, and use of portable and fixed ladders to prevent falls and injuries.	83	f	["subcontractor", "safety_officer", "supervisor"]	[1]	\N	[15, 3]	4	2024-11-22 19:20:22.341	2024-11-22 19:20:22.341	t
13	1	Hand and Power Tool Safety	Safe operation and maintenance of common hand and power tools used in construction.	72	f	["subcontractor", "safety_officer", "supervisor"]	\N	\N	[14]	4	2024-11-07 10:58:34.749	2024-11-07 10:58:34.749	t
14	1	Material Handling	Proper techniques for manually handling materials and using material handling equipment to prevent injuries.	83	f	["subcontractor", "safety_officer", "supervisor"]	\N	\N	[4]	4	2025-05-11 07:59:30.046	2025-05-11 07:59:30.046	t
15	1	Noise and Hearing Conservation	Understanding noise hazards on construction sites and implementing hearing protection measures.	78	f	["safety_officer", "supervisor"]	[1]	\N	[20, 21]	4	2024-03-17 01:07:56.042	2024-03-17 01:07:56.042	t
16	1	Respiratory Protection	Selection, use, and maintenance of respiratory protection equipment for construction environments.	74	f	["subcontractor", "safety_officer", "employee"]	[1]	\N	[5, 6, 9]	4	2024-03-29 12:12:09.555	2024-03-29 12:12:09.555	t
17	1	Hot Work and Welding Safety	Safety procedures for welding, cutting, and other hot work operations on construction sites.	83	f	["supervisor", "subcontractor", "employee"]	[1]	\N	[5]	4	2024-10-31 10:35:54.787	2024-10-31 10:35:54.787	t
18	1	Defensive Driving	Safe driving techniques for construction vehicles and equipment in and around work zones.	79	f	["employee", "subcontractor"]	[1]	\N	[1]	4	2024-01-01 23:14:45.515	2024-01-01 23:14:45.515	t
19	1	Emergency Response Plan	Procedures for responding to various emergencies including medical incidents, fires, severe weather, and evacuations.	77	t	["subcontractor"]	[1]	\N	[7, 9, 15]	4	2024-01-08 08:50:00.198	2024-01-08 08:50:00.198	t
20	1	Environmental Awareness	Preventing environmental damage and understanding regulatory requirements for construction activities.	73	f	["subcontractor"]	\N	\N	[2]	4	2024-03-05 03:51:43.343	2024-03-05 03:51:43.343	t
21	1	Workplace Violence Prevention	Recognizing, avoiding, and reporting potential workplace violence situations on construction sites.	81	f	["subcontractor", "safety_officer"]	[1]	\N	[10]	4	2024-04-08 20:42:55.136	2024-04-08 20:42:55.136	t
22	1	Drug and Alcohol Awareness	Understanding substance abuse impacts, company policies, and testing procedures in construction environments.	73	f	["employee"]	\N	\N	[1, 2]	4	2024-09-07 14:56:46.028	2024-09-07 14:56:46.028	t
23	1	Ergonomics for Construction	Preventing musculoskeletal injuries through proper body mechanics and workstation design in construction.	79	f	["employee", "supervisor"]	[1]	\N	[1, 20]	4	2025-01-13 15:49:03.323	2025-01-13 15:49:03.323	t
24	1	Silica Dust Safety	Protection measures against respirable crystalline silica exposure during concrete, masonry, and stone work.	87	t	["safety_officer"]	\N	\N	[13]	4	2025-01-08 21:46:08.331	2025-01-08 21:46:08.331	t
25	1	Lead Safety	Identifying lead hazards in construction and implementing proper control measures and work practices.	89	t	["employee", "supervisor", "safety_officer"]	[1]	\N	[7]	4	2024-07-04 08:22:31.093	2024-07-04 08:22:31.093	t
\.


--
-- Data for Name: training_records; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.training_records (id, tenant_id, user_id, course_id, start_date, completion_date, score, passed, certificate_url, created_at, updated_at, is_active) FROM stdin;
1	1	4	17	2025-01-29 07:57:17.092	\N	\N	\N	\N	2025-01-29 07:57:17.092	2025-01-29 07:57:17.092	t
2	1	4	20	2024-12-24 07:54:00.09	\N	\N	\N	\N	2024-12-24 07:54:00.09	2024-12-24 07:54:00.09	t
3	1	4	6	2024-04-12 03:07:58.758	2024-05-12 05:01:59.591	79	t	\N	2024-04-12 03:07:58.758	2024-05-12 05:01:59.591	t
4	1	4	8	2025-02-13 21:22:32.231	\N	\N	\N	\N	2025-02-13 21:22:32.231	2025-02-13 21:22:32.231	t
5	1	4	10	2024-04-23 03:40:38.496	\N	\N	\N	\N	2024-04-23 03:40:38.496	2024-04-23 03:40:38.496	t
6	1	4	7	2024-09-03 06:53:52.888	\N	\N	\N	\N	2024-09-03 06:53:52.888	2024-09-03 06:53:52.888	t
7	1	4	3	2024-05-02 11:12:06.645	\N	\N	\N	\N	2024-05-02 11:12:06.645	2024-05-02 11:12:06.645	t
8	1	4	24	2024-08-19 00:09:07.965	2024-09-12 22:08:07.188	91	t	\N	2024-08-19 00:09:07.965	2024-09-12 22:08:07.188	t
9	1	4	1	2024-01-27 05:18:09.406	2024-01-31 00:39:40.804	93	t	\N	2024-01-27 05:18:09.406	2024-01-31 00:39:40.804	t
10	1	4	9	2024-04-08 22:14:14.567	\N	\N	\N	\N	2024-04-08 22:14:14.567	2024-04-08 22:14:14.567	t
11	1	5	20	2024-03-05 01:14:56.181	\N	\N	\N	\N	2024-03-05 01:14:56.181	2024-03-05 01:14:56.181	t
12	1	5	22	2024-03-17 04:01:31.091	2024-03-23 20:06:19.988	80	t	\N	2024-03-17 04:01:31.091	2024-03-23 20:06:19.988	t
13	1	5	23	2024-10-10 17:39:44.314	\N	\N	\N	\N	2024-10-10 17:39:44.314	2024-10-10 17:39:44.314	t
14	1	6	25	2024-04-28 06:42:02.095	2024-05-01 09:58:12.285	98	t	\N	2024-04-28 06:42:02.095	2024-05-01 09:58:12.285	t
15	1	6	11	2024-01-06 07:29:37.34	\N	\N	\N	\N	2024-01-06 07:29:37.34	2024-01-06 07:29:37.34	t
16	1	6	4	2024-12-29 13:13:02.847	\N	\N	\N	\N	2024-12-29 13:13:02.847	2024-12-29 13:13:02.847	t
17	1	6	10	2024-01-22 00:22:38.187	2024-01-28 10:39:35.103	96	t	\N	2024-01-22 00:22:38.187	2024-01-28 10:39:35.103	t
18	1	6	15	2024-12-04 11:17:34.056	\N	\N	\N	\N	2024-12-04 11:17:34.056	2024-12-04 11:17:34.056	t
19	1	7	11	2024-03-04 23:17:24.855	2024-03-25 16:03:40.47	77	t	\N	2024-03-04 23:17:24.855	2024-03-25 16:03:40.47	t
20	1	7	6	2024-11-05 01:50:55.432	2024-11-13 12:45:15.255	80	t	\N	2024-11-05 01:50:55.432	2024-11-13 12:45:15.255	t
21	1	7	12	2024-02-27 12:45:22.499	\N	\N	\N	\N	2024-02-27 12:45:22.499	2024-02-27 12:45:22.499	t
22	1	7	17	2024-09-07 16:17:47.349	2024-09-24 21:34:30.215	73	t	\N	2024-09-07 16:17:47.349	2024-09-24 21:34:30.215	t
23	1	7	23	2024-02-27 08:39:01.706	\N	\N	\N	\N	2024-02-27 08:39:01.706	2024-02-27 08:39:01.706	t
24	1	7	14	2025-04-08 20:09:43.368	2025-04-12 17:26:13.666	79	t	\N	2025-04-08 20:09:43.368	2025-04-12 17:26:13.666	t
25	1	7	8	2024-12-07 21:30:18.608	2024-12-26 15:30:16.208	95	t	\N	2024-12-07 21:30:18.608	2024-12-26 15:30:16.208	t
26	1	8	23	2024-02-24 22:02:28.485	2024-03-12 20:41:34.205	91	t	\N	2024-02-24 22:02:28.485	2024-03-12 20:41:34.205	t
27	1	8	25	2025-04-06 08:25:07.47	\N	\N	\N	\N	2025-04-06 08:25:07.47	2025-04-06 08:25:07.47	t
28	1	8	7	2025-02-24 02:53:15.847	2025-03-21 12:01:52.749	71	t	\N	2025-02-24 02:53:15.847	2025-03-21 12:01:52.749	t
29	1	8	22	2025-05-02 05:48:37.308	\N	\N	\N	\N	2025-05-02 05:48:37.308	2025-05-02 05:48:37.308	t
30	1	8	20	2024-01-25 12:14:09.835	2024-02-10 20:34:38.585	86	t	\N	2024-01-25 12:14:09.835	2024-02-10 20:34:38.585	t
31	1	8	4	2025-04-28 20:38:22.181	\N	\N	\N	\N	2025-04-28 20:38:22.181	2025-04-28 20:38:22.181	t
32	1	8	10	2024-09-29 13:41:22.484	\N	\N	\N	\N	2024-09-29 13:41:22.484	2024-09-29 13:41:22.484	t
33	1	8	14	2025-01-09 12:50:53.981	2025-02-07 13:37:09.397	63	f	\N	2025-01-09 12:50:53.981	2025-02-07 13:37:09.397	t
34	1	8	15	2024-09-10 05:24:30.034	\N	\N	\N	\N	2024-09-10 05:24:30.034	2024-09-10 05:24:30.034	t
35	1	8	19	2024-12-29 21:01:41.793	\N	\N	\N	\N	2024-12-29 21:01:41.793	2024-12-29 21:01:41.793	t
36	1	9	3	2025-05-14 16:01:57.24	\N	\N	\N	\N	2025-05-14 16:01:57.24	2025-05-14 16:01:57.24	t
37	1	9	21	2024-09-14 19:20:16.607	2024-09-29 15:49:36.918	99	t	\N	2024-09-14 19:20:16.607	2024-09-29 15:49:36.918	t
38	1	9	22	2024-01-06 05:31:19.661	2024-02-04 07:05:14.899	90	t	\N	2024-01-06 05:31:19.661	2024-02-04 07:05:14.899	t
39	1	9	6	2025-03-08 12:11:33.989	2025-03-12 14:15:01.54	77	t	\N	2025-03-08 12:11:33.989	2025-03-12 14:15:01.54	t
40	1	9	23	2024-08-09 04:08:02.911	2024-09-05 23:32:32.925	71	t	\N	2024-08-09 04:08:02.911	2024-09-05 23:32:32.925	t
41	1	9	14	2024-11-18 21:37:09.376	\N	\N	\N	\N	2024-11-18 21:37:09.376	2024-11-18 21:37:09.376	t
42	1	9	2	2025-02-14 16:06:06.209	\N	\N	\N	\N	2025-02-14 16:06:06.209	2025-02-14 16:06:06.209	t
43	1	9	5	2024-05-15 09:39:59.408	2024-06-05 09:40:36.387	61	f	\N	2024-05-15 09:39:59.408	2024-06-05 09:40:36.387	t
44	1	9	13	2024-09-09 10:08:43.49	2024-09-26 18:33:53.577	79	t	\N	2024-09-09 10:08:43.49	2024-09-26 18:33:53.577	t
45	1	9	25	2024-09-11 19:24:45.379	\N	\N	\N	\N	2024-09-11 19:24:45.379	2024-09-11 19:24:45.379	t
46	1	10	11	2024-02-29 09:04:39.848	\N	\N	\N	\N	2024-02-29 09:04:39.848	2024-02-29 09:04:39.848	t
47	1	10	3	2024-02-22 21:14:51.924	2024-03-13 19:39:59.092	85	t	\N	2024-02-22 21:14:51.924	2024-03-13 19:39:59.092	t
48	1	10	19	2024-11-15 09:38:50.221	\N	\N	\N	\N	2024-11-15 09:38:50.221	2024-11-15 09:38:50.221	t
49	1	10	12	2024-11-07 16:46:54.317	\N	\N	\N	\N	2024-11-07 16:46:54.317	2024-11-07 16:46:54.317	t
50	1	10	2	2024-07-15 23:28:30.764	\N	\N	\N	\N	2024-07-15 23:28:30.764	2024-07-15 23:28:30.764	t
51	1	10	21	2025-03-28 04:41:22.366	2025-04-10 05:11:35.728	56	f	\N	2025-03-28 04:41:22.366	2025-04-10 05:11:35.728	t
52	1	10	9	2024-06-04 18:07:34.408	\N	\N	\N	\N	2024-06-04 18:07:34.408	2024-06-04 18:07:34.408	t
53	1	10	20	2024-08-02 16:58:52.393	\N	\N	\N	\N	2024-08-02 16:58:52.393	2024-08-02 16:58:52.393	t
54	1	10	13	2024-01-04 00:19:54.78	\N	\N	\N	\N	2024-01-04 00:19:54.78	2024-01-04 00:19:54.78	t
55	1	10	22	2024-11-17 10:58:02.84	\N	\N	\N	\N	2024-11-17 10:58:02.84	2024-11-17 10:58:02.84	t
56	1	11	4	2025-05-15 07:12:30.668	\N	\N	\N	\N	2025-05-15 07:12:30.668	2025-05-15 07:12:30.668	t
57	1	11	8	2024-03-15 00:51:47.003	\N	\N	\N	\N	2024-03-15 00:51:47.003	2024-03-15 00:51:47.003	t
58	1	11	12	2024-11-14 09:39:28.444	\N	\N	\N	\N	2024-11-14 09:39:28.444	2024-11-14 09:39:28.444	t
59	1	11	10	2024-08-13 08:52:24.247	\N	\N	\N	\N	2024-08-13 08:52:24.247	2024-08-13 08:52:24.247	t
60	1	11	7	2024-09-12 19:06:52.399	\N	\N	\N	\N	2024-09-12 19:06:52.399	2024-09-12 19:06:52.399	t
61	1	11	2	2024-07-25 12:23:53.533	2024-07-31 07:33:01.934	68	f	\N	2024-07-25 12:23:53.533	2024-07-31 07:33:01.934	t
62	1	11	14	2025-02-16 23:34:27.836	\N	\N	\N	\N	2025-02-16 23:34:27.836	2025-02-16 23:34:27.836	t
63	1	11	18	2024-05-28 05:11:14.987	2024-06-17 15:44:44.819	77	t	\N	2024-05-28 05:11:14.987	2024-06-17 15:44:44.819	t
64	1	11	13	2024-09-05 01:16:05.586	\N	\N	\N	\N	2024-09-05 01:16:05.586	2024-09-05 01:16:05.586	t
65	1	11	15	2025-01-08 05:22:37.166	2025-02-03 13:19:45.127	56	f	\N	2025-01-08 05:22:37.166	2025-02-03 13:19:45.127	t
66	1	12	5	2024-07-03 08:57:46.314	\N	\N	\N	\N	2024-07-03 08:57:46.314	2024-07-03 08:57:46.314	t
67	1	12	7	2025-01-26 00:20:14.923	\N	\N	\N	\N	2025-01-26 00:20:14.923	2025-01-26 00:20:14.923	t
68	1	13	24	2024-11-30 21:58:54.64	\N	\N	\N	\N	2024-11-30 21:58:54.64	2024-11-30 21:58:54.64	t
69	1	13	2	2024-11-07 16:57:34.905	\N	\N	\N	\N	2024-11-07 16:57:34.905	2024-11-07 16:57:34.905	t
70	1	13	22	2024-11-15 20:47:47.131	\N	\N	\N	\N	2024-11-15 20:47:47.131	2024-11-15 20:47:47.131	t
71	1	13	5	2025-01-02 17:28:17.444	2025-01-27 11:38:45.161	89	t	\N	2025-01-02 17:28:17.444	2025-01-27 11:38:45.161	t
72	1	13	11	2024-11-18 12:29:15.778	\N	\N	\N	\N	2024-11-18 12:29:15.778	2024-11-18 12:29:15.778	t
73	1	13	18	2024-05-10 02:02:14.319	2024-06-02 18:52:34.958	88	t	\N	2024-05-10 02:02:14.319	2024-06-02 18:52:34.958	t
74	1	13	20	2024-04-05 11:32:39.566	\N	\N	\N	\N	2024-04-05 11:32:39.566	2024-04-05 11:32:39.566	t
75	1	14	24	2024-06-18 18:20:06.796	2024-07-02 14:24:19.062	83	t	\N	2024-06-18 18:20:06.796	2024-07-02 14:24:19.062	t
76	1	14	17	2024-05-19 09:50:18.602	\N	\N	\N	\N	2024-05-19 09:50:18.602	2024-05-19 09:50:18.602	t
77	1	14	8	2024-02-21 21:16:26.108	\N	\N	\N	\N	2024-02-21 21:16:26.108	2024-02-21 21:16:26.108	t
78	1	14	12	2025-02-09 23:18:15.996	2025-03-04 16:26:16.693	88	t	\N	2025-02-09 23:18:15.996	2025-03-04 16:26:16.693	t
79	1	14	20	2024-07-18 17:32:01.853	2024-07-20 15:08:34.474	98	t	\N	2024-07-18 17:32:01.853	2024-07-20 15:08:34.474	t
80	1	14	19	2024-05-22 11:36:32.183	\N	\N	\N	\N	2024-05-22 11:36:32.183	2024-05-22 11:36:32.183	t
81	1	14	23	2024-05-19 23:48:20.853	\N	\N	\N	\N	2024-05-19 23:48:20.853	2024-05-19 23:48:20.853	t
82	1	14	1	2024-07-10 01:17:30.129	2024-08-08 14:18:39.609	87	t	\N	2024-07-10 01:17:30.129	2024-08-08 14:18:39.609	t
83	1	14	2	2024-05-08 12:05:21.889	2024-05-25 15:23:27.877	81	t	\N	2024-05-08 12:05:21.889	2024-05-25 15:23:27.877	t
84	1	14	6	2024-06-11 11:37:48.19	2024-06-21 01:07:02.217	92	t	\N	2024-06-11 11:37:48.19	2024-06-21 01:07:02.217	t
85	1	15	22	2025-05-20 21:13:14.455	2025-05-22 08:12:47.901	91	t	\N	2025-05-20 21:13:14.455	2025-05-22 08:12:47.901	t
86	1	15	2	2025-03-20 08:45:08.853	\N	\N	\N	\N	2025-03-20 08:45:08.853	2025-03-20 08:45:08.853	t
87	1	15	6	2025-04-12 09:17:21.426	2025-04-30 07:06:53.876	51	f	\N	2025-04-12 09:17:21.426	2025-04-30 07:06:53.876	t
88	1	15	7	2024-09-02 04:56:53.591	2024-09-09 19:41:28.55	54	f	\N	2024-09-02 04:56:53.591	2024-09-09 19:41:28.55	t
89	1	15	1	2024-09-25 15:31:29.825	2024-09-28 07:34:02.583	68	f	\N	2024-09-25 15:31:29.825	2024-09-28 07:34:02.583	t
90	1	15	23	2024-09-29 22:45:36.895	\N	\N	\N	\N	2024-09-29 22:45:36.895	2024-09-29 22:45:36.895	t
91	1	15	10	2024-12-20 20:22:41.401	\N	\N	\N	\N	2024-12-20 20:22:41.401	2024-12-20 20:22:41.401	t
92	1	15	5	2025-04-11 09:58:58.881	\N	\N	\N	\N	2025-04-11 09:58:58.881	2025-04-11 09:58:58.881	t
93	1	15	15	2024-03-17 00:54:44.091	\N	\N	\N	\N	2024-03-17 00:54:44.091	2024-03-17 00:54:44.091	t
94	1	15	4	2024-03-05 05:01:17.83	\N	\N	\N	\N	2024-03-05 05:01:17.83	2024-03-05 05:01:17.83	t
95	1	16	2	2025-02-25 05:11:27.625	\N	\N	\N	\N	2025-02-25 05:11:27.625	2025-02-25 05:11:27.625	t
96	1	16	1	2024-06-24 00:13:37.186	\N	\N	\N	\N	2024-06-24 00:13:37.186	2024-06-24 00:13:37.186	t
97	1	16	3	2024-12-24 16:44:00.397	\N	\N	\N	\N	2024-12-24 16:44:00.397	2024-12-24 16:44:00.397	t
98	1	16	12	2024-10-24 09:29:25.37	2024-11-01 02:00:37.959	84	t	\N	2024-10-24 09:29:25.37	2024-11-01 02:00:37.959	t
99	1	16	24	2025-03-22 12:42:56.008	\N	\N	\N	\N	2025-03-22 12:42:56.008	2025-03-22 12:42:56.008	t
100	1	16	7	2024-01-01 13:45:27.302	2024-01-15 04:13:42.616	86	t	\N	2024-01-01 13:45:27.302	2024-01-15 04:13:42.616	t
101	1	16	22	2024-04-09 02:57:24.404	\N	\N	\N	\N	2024-04-09 02:57:24.404	2024-04-09 02:57:24.404	t
102	1	16	10	2025-03-29 14:48:28.905	\N	\N	\N	\N	2025-03-29 14:48:28.905	2025-03-29 14:48:28.905	t
103	1	16	9	2025-02-25 09:32:01.893	\N	\N	\N	\N	2025-02-25 09:32:01.893	2025-02-25 09:32:01.893	t
104	1	16	14	2024-03-27 05:58:06.528	\N	\N	\N	\N	2024-03-27 05:58:06.528	2024-03-27 05:58:06.528	t
105	1	17	12	2024-08-15 12:10:24.305	\N	\N	\N	\N	2024-08-15 12:10:24.305	2024-08-15 12:10:24.305	t
106	1	17	6	2024-02-15 21:37:44.578	\N	\N	\N	\N	2024-02-15 21:37:44.578	2024-02-15 21:37:44.578	t
107	1	17	8	2024-11-21 05:28:29.657	\N	\N	\N	\N	2024-11-21 05:28:29.657	2024-11-21 05:28:29.657	t
108	1	17	18	2024-01-14 10:35:22.76	\N	\N	\N	\N	2024-01-14 10:35:22.76	2024-01-14 10:35:22.76	t
109	1	17	10	2025-04-04 20:08:37.606	2025-04-21 14:55:37.641	89	t	\N	2025-04-04 20:08:37.606	2025-04-21 14:55:37.641	t
110	1	17	23	2024-12-24 11:33:06.865	2025-01-17 20:22:53.093	67	f	\N	2024-12-24 11:33:06.865	2025-01-17 20:22:53.093	t
111	1	17	21	2024-11-14 07:22:04.881	2024-12-03 03:08:58.258	96	t	\N	2024-11-14 07:22:04.881	2024-12-03 03:08:58.258	t
112	1	17	14	2024-01-31 23:46:23.273	\N	\N	\N	\N	2024-01-31 23:46:23.273	2024-01-31 23:46:23.273	t
113	1	17	9	2025-05-10 20:53:15.478	\N	\N	\N	\N	2025-05-10 20:53:15.478	2025-05-10 20:53:15.478	t
114	1	17	16	2024-11-27 08:24:38.578	\N	\N	\N	\N	2024-11-27 08:24:38.578	2024-11-27 08:24:38.578	t
115	1	18	1	2024-03-23 00:20:34.429	2024-04-08 15:13:18.631	84	t	\N	2024-03-23 00:20:34.429	2024-04-08 15:13:18.631	t
116	1	18	15	2025-02-06 14:28:38.867	\N	\N	\N	\N	2025-02-06 14:28:38.867	2025-02-06 14:28:38.867	t
117	1	18	18	2024-02-13 21:24:18.519	2024-03-09 18:54:14.182	94	t	\N	2024-02-13 21:24:18.519	2024-03-09 18:54:14.182	t
118	1	18	11	2025-05-08 13:40:05.14	2025-06-04 10:11:12.372	81	t	\N	2025-05-08 13:40:05.14	2025-06-04 10:11:12.372	t
119	1	18	19	2024-01-28 19:06:28.421	\N	\N	\N	\N	2024-01-28 19:06:28.421	2024-01-28 19:06:28.421	t
120	1	18	2	2024-11-09 01:33:29.218	2024-11-20 08:33:31.034	52	f	\N	2024-11-09 01:33:29.218	2024-11-20 08:33:31.034	t
121	1	18	25	2024-06-06 07:20:54.787	\N	\N	\N	\N	2024-06-06 07:20:54.787	2024-06-06 07:20:54.787	t
122	1	18	21	2024-08-26 09:40:47.755	\N	\N	\N	\N	2024-08-26 09:40:47.755	2024-08-26 09:40:47.755	t
123	1	18	22	2024-08-24 17:59:15.064	2024-09-11 08:09:43.226	89	t	\N	2024-08-24 17:59:15.064	2024-09-11 08:09:43.226	t
124	1	18	7	2024-03-29 23:20:09.939	\N	\N	\N	\N	2024-03-29 23:20:09.939	2024-03-29 23:20:09.939	t
125	1	4	5	2025-05-22 13:17:27.282	\N	\N	\N	\N	2025-05-22 13:17:27.292105	2025-05-22 13:17:46.746	t
\.


--
-- Data for Name: user_sessions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.user_sessions (sid, sess, expire) FROM stdin;
UERQDAtIYUJ-hNWGgsOT0PB8oU9Df_NG	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T12:52:49.374Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 12:52:50
KvmIw4zenMjuyzWLZpn-ts3eidhSLOvl	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T06:16:48.498Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":4}}	2025-05-27 06:16:49
u2gDLLsJtgwkF5NWVt5jIqvqUynQbvbE	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T06:16:49.329Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 06:16:50
glwxSpwP6m3C97aw4oqL8FeE8SfgFIdf	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T06:44:37.618Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":4}}	2025-05-27 06:44:38
noHw8qCc9G-q3myAH2KrOdVQmQKT0zxr	{"cookie":{"originalMaxAge":86399999,"expires":"2025-05-27T07:07:46.974Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 07:07:47
KMC9KwdTCyYgw_ue6WXLH4M72hQhd08a	{"cookie":{"originalMaxAge":86399999,"expires":"2025-05-27T07:02:13.786Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":4}}	2025-05-27 07:02:14
0T__i6zvr8Mp4784e88L8RDJF9x4uLsm	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T07:07:45.009Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 07:07:46
vJCt7KZxXVmkW-4BzzIgtZHr1PUjkJH4	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T08:26:20.903Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 08:26:21
oBanpmfWW_i03eKO5hNaZy6kAC7oo82U	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T08:34:48.078Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 08:34:49
XVfjU5eFXrZ66z3koG6MVNngFHVdj7pV	{"cookie":{"originalMaxAge":86399999,"expires":"2025-05-27T08:47:11.630Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":4}}	2025-05-27 08:47:12
T5lIgPIlYrX04uXvI0gXjaBN1i_fYUd3	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T09:17:04.157Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":4}}	2025-05-27 09:17:05
3j1sqd4aH_JWkFWOh5FvnIxX0iEI7EAK	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T09:52:52.199Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 09:52:53
qk-O87pEkdg5gIJRrEaCrQUNSd9IJJdN	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:47:56.797Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:47:57
uKbzXe_wjvvyh0z1M2NsvtHLFUc-549P	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:47:56.801Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:47:57
s_Wn_bzcUHOwAGVRfPJgNrq6-kKo9WTu	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:47:47.481Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:47:48
w8DU6g7GFPP4DxpQGuc-CUPFE8-GMSoS	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:47:49.096Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:47:50
GlArhI2ezVk5WttS1IsOKh9O75oXkOz_	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:47:49.999Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:47:50
Y-LK0ends7AiEa-x0XB84_fgtkKFlAL3	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:47:50.237Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:47:51
1DvVMb2WPByeldzbOPIIAP5Tj6jYK0ey	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:47:50.467Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:47:51
vj96Bne9VTl-ZrSPu-kqMcRtxd0cRbUb	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:47:52.619Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:47:53
zH2JSV1erYG-qP860G_IV-s7MYQ7KuWM	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:47:55.659Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:47:56
Xv9HbbdumXOgeXMrG6T88tBrrQgfnTv8	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:47:53.562Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:47:54
EbDM3Wajgpz7yMXXp9LbniDYDudmcMe4	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:47:52.627Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:47:53
CHiGrjeV40u3JFjM_Da2fHXa1AX8TZxk	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:47:53.582Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:47:54
UzTMYxzU-Km6d3WdRFPao5FLjdQvmlwM	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:47:56.795Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:47:57
ISNPCEF3Warz2vsup4rcIe-BOOVYfJIo	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:47:56.996Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:47:57
Z8cX-6KkAyhek3LVjtX7JEouCRcPoZgX	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:47:57.027Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:47:58
jK0DQ8Kg3LpqntTYHH-NlM32-vG4-bg0	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:47:57.034Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:47:58
xfQmuJ1D-G2iCRE_EuMyllKW6A4O7jnD	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:47:57.042Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:47:58
3_2xNZgEvbwSuXsZerD8Ra7rDxAnbdZY	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:47:57.214Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:47:58
xdFB7xN1g58O3AbBbmCO34ABGdECxBI9	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:47:57.260Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:47:58
mHsFHhz8IquUsSmnpk9BoSpiBcmRhocY	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:47:57.442Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:47:58
2JKEGoQ3Qg7S4Mbi-GI1C5mVr5_aoeqe	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:47:57.460Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:47:58
PloDw86CJ29xq9HTmo31Uc8MhfBzDt85	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:47:57.643Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:47:58
bWxxAGFDl1gLxEAUoKLbZR881YiCvJOv	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:47:57.705Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:47:58
AUAbW8D8iHzoRkcun_19UVrVdWiqRqFu	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:47:57.711Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:47:58
QdIImH-DPDkELPQTgnIlMw3cF9Mn6as5	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:47:57.709Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:47:58
TXXvyztJjfIt8YJvWT_6XXr0V_GLR40J	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:47:50.021Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:47:51
EPmUDu7Tn9kuS3-1mxfJpw80h7yk9-31	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:47:56.433Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:47:57
hzfM99r5zyIeQYKrYg8zdtPUJelVpu43	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:47:50.007Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:47:51
OIGiwyjakP9IQK0GUEnz1y-csRxzjGLN	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:47:56.735Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:47:57
nZ0eUZjschguAi2XE7mqVIMpqFntQetW	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:47:56.787Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:47:57
GOyIGLms3tBGjB4OT528ujWg2WvMt8t_	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:47:56.793Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:47:57
a8U8gwYKEo4ClJXMXxMOi-0yGvUgwaMw	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:47:59.395Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:48:00
F154sMAmHkUG98_G1kPPZoQVqUkyHh-y	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:47:59.700Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:48:00
3Mu1TCs6fuvuBZk0r77_DLGEX0lvNema	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:48:00.041Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:48:01
gHNq3IddxE2IMPK0n4TXdq1z0R40ylQ4	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:48:00.093Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:48:01
ythpan0wDZwWCiJ-ftOqY3NcSRxO95sS	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:48:00.135Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:48:01
CJNqWtZsgWUF4E3_K6lvNuPxonaIwfXu	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:48:00.320Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:48:01
buizuR8RI05qLVuZ7CONfAKucXD3NSgg	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:48:00.371Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:48:01
mtQMmnsGVI9lPC28rvILOK7btUAxlVNc	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:48:00.478Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:48:01
OpdLASdz9k-_uHX5BDzGsQosx6jvq219	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:48:00.547Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:48:01
nccg8QLgqnAZYECFZ3Br-nPU4QQAEpLE	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:48:00.611Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:48:01
D_RLpibEEAPekS4tXe5NNdsAzbvHLFjA	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:48:01.004Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:48:02
aae1uR1cp_5d_s5RyenkrMXKxeDushYM	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:48:01.467Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:48:02
1WIPDG1ZGEWT1DgdqrvRLzZbDyV4XuNY	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:48:01.692Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:48:02
t1WW-_hRL1vdaPauIvJ3KVjp_faW0MPp	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:48:01.729Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:48:02
wIxQ84WOcLzDl65pJZwKGvw-AR2nOR8z	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:48:01.812Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:48:02
lldgcEvl6x2bttvDBOJRuW9KASkLt1vR	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:48:01.943Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:48:02
_3sRdok9GAf8AWOEGTtI7tFS8x3qMFGN	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:48:01.967Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:48:02
cNxPLkVv4A_bKIjZWEh543jzAzoBp253	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:48:02.047Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:48:03
LkFwyWkL8uBHAByQfaxRQybejRjQEoCi	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:48:02.279Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:48:03
fwq_NVTsMxszs2KIk9a4VWLWVZTO8YC9	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:48:02.538Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:48:03
lZMvGBLfbqxw2dyQ0I6HYoihsJ4npSZv	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:48:02.753Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:48:03
eHDOKtO7_y-WJt_nidqhUquFDalptyT3	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:48:03.007Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:48:04
bU1_slPiHnrma9vXySJpakv0YbRFUcwx	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:48:03.139Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:48:04
f-Frok1nCu4gxFipdTLd6TrEDyP366I_	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:48:03.163Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:48:04
kE_g7Hwhi4Q9onlN4qGfI5b46-QvpSo1	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:48:03.200Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:48:04
o4xSUj30PU9UGyMA8NCM6F29rY9eUWPT	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:48:03.246Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:48:04
fRgiMeDOTtvvBQZgyhq_a7AxAZAR5gku	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:48:03.279Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:48:04
LmEtbA23DFRPkkLHO4O-7yG91dcQr8DQ	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:48:03.529Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:48:04
ZWaaXwwQKd8ia_a-Ex_7iJ-Vt1aThFNI	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:48:03.793Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:48:04
PmQnvCJ8D_nNJFMgmYvW_XKloW6JLoRG	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:48:04.043Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:48:05
qQJu1qe3yzicOgQgqlO-nhAGmsvkRkoV	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:48:04.268Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:48:05
qO1GUJGWyFrcjiv1HREuJaAJtfbCqj45	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:48:04.338Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:48:05
gGS3wtqMYdg16utS5lDKc6pQ2MZt8x_X	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:48:04.439Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:48:05
LovPyFAHzD5iPjyuxryj5Ig3r_DhpinB	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:47:57.865Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:47:58
WBFZaV2JE4sh6rBayODJ31rniYqxKmAw	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:47:57.893Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:47:58
eayGmQU9wjCFqAmroM2_Ple5YUd5OiC4	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:47:58.085Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:47:59
MwdOvndldb7F7rXxbjZWLvU_s55L3av7	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:47:58.129Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:47:59
cHLKx1TyEVOB3LLhzvcNd4qVMRQnXkgR	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:47:58.177Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:47:59
XGXepMbHfyd6vfBs7URszrrav8F52Zdm	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:47:58.414Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:47:59
cEH-CH3MLca9dEl50WzZGgzZHWmo-9jZ	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:47:58.588Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:47:59
oYxQ6Zasf4NMao7-KKVy9HC4EahsWFdm	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:47:58.660Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:47:59
3WDnDo9qBjZ_RECF5cFTZpmSKdy1-EyO	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:47:58.899Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:47:59
MkNn1VNiqAyC56JSrHWlV-falrgzjAMp	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:47:59.303Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:48:00
KoRWd9gwL1qzoSELSC3FQpklGQT3byhT	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:47:59.630Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:48:00
grzVfLbdpXKR0uQBIoUNCtVPqh0b36mG	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:47:59.776Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:48:00
QhvjRVAbBIIToqxLcHe6zgcGAYrxQzkU	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:47:59.863Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:48:00
JTx4uJKjuFEiMLoQLinT7fMQuwy5z-bM	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:47:59.946Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:48:00
YZiLJnZlvM7Eh72IkyP2QZv22ODutF2O	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:48:00.774Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:48:01
iD63z31u2LP4raiG3pxnJTsEKvcxQA0-	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:48:00.875Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:48:01
1eXfR3ay3o1u-Icw3XfwXMTj69ifzHTH	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:48:00.929Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:48:01
uyBS62TzW1B98vwnCC4V1t_IsEqyqhjI	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:48:00.967Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:48:01
91BzSinDelaySrwLyZSrIR69Pq6nbnxY	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:48:00.993Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:48:01
l6wKMIYFma8wlUah-qFX5jMKKTNmYo77	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:48:01.233Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:48:02
-mUcWknwdSS23MElbVOB3G0iVf-xK2N_	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:48:01.349Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:48:02
mbJE5roI5C9Aaaza4aTunSqBztg0MwF_	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:48:01.386Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:48:02
4E_2y9YRiV1Mdo304-sc2IVvPkRZDi1f	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:48:01.429Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:48:02
U0INojEUl8dw7KDUb5_wDzpYfblg9_yr	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:48:01.450Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:48:02
Q8Hkpxf6TxH_icoPUvSeqeOpYrH3U_Ib	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:48:02.287Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:48:03
4XEXHi-jILDESoda7IicI0EgkSZV_afR	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:48:02.578Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:48:03
8bchuu6PyxvgPgp4mS7BLbI0JdftYGGK	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:48:02.695Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:48:03
Dyr1AE56tnxyEZAEhQAnIzrZfsROvT9m	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:48:03.851Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:48:04
9Ztp6YiNaDtbQuP3_oUMAlOuhq_qEs4t	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:48:03.899Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:48:04
VNHwe5Z6IYuHmhiy-u1Y4xFE9uAuNwH_	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:48:03.968Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:48:04
P0IwsZQrdPA0guZ8zarbYQEI1j9YwtxS	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:48:04.032Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:48:05
dCUOymUHXFVUISnjDjUoija8hSYKUS8D	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:48:04.318Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:48:05
LckhkQzTTPz4_hPtB9A2E74gdTYj3Qhy	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:48:04.941Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:48:05
mfWGrNKEbERxt6PDaNwFTkS6ItXdDGkp	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:47:58.102Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:47:59
4GFJKFLLrLJGX1JnCQ6-fQSKMJ4Heldb	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:47:58.127Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:47:59
o53Ak8Nh77SxRjVTZEvutdRPHtQxVGV3	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:47:58.185Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:47:59
hLUw-PzE5VH0hTDDym1iYcZXf5lR2SAh	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:47:58.323Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:47:59
5Sc0YNHaPB20r4OmTJuwSDimVOIktajr	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:47:58.359Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:47:59
Fl7lL-l4yNQMPXIxgnTe-VjAPBjBhsos	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:47:58.412Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:47:59
ANTTOpmn0tFkIS_jctUSwkok75K34D04	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:47:58.545Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:47:59
i7k9Ss3A9Oxt5Zkbvrx2wErMBy8u1Lef	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:47:58.586Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:47:59
-L170dSaVymDHQzuERRBEQ3iM93559_r	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:47:58.779Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:47:59
oo0VUnVAKaYt62RlgCfOOqSEcn33Bfup	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:47:58.857Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:47:59
I74-QCztJRiWKc0C48v_OxKJF2O9JniI	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:47:58.896Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:47:59
fXTwf4V8w3N3C3_EkKwTdTYWJyt9awhM	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:47:59.392Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:48:00
mcIkmcnlqUX_wCa8xGWQXYcTAXD2rtTf	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:47:59.963Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:48:00
8CZL_2IzOaU8qKp_CsNR36L1KBDJa1jM	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:48:00.251Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:48:01
sLmRiiixdiFhApJXnHqk6TIySJBj5msB	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:48:00.276Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:48:01
4oMBXw-ge6OfqxobjwQMiPFOI4cApMeq	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:48:00.300Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:48:01
o_7pTGxFzJvQ-_rXr8KPa9pwDY7QcmFI	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:48:00.509Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:48:01
hqHgDLdqNegUGMef88YPuhG25tE6VVu2	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:48:00.536Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:48:01
lOOdM0iw1efHAgJkj9mMn34Dw6Kl93c8	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:48:00.706Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:48:01
qrXzpiefZLfPYqtGhEApoU5ErGl-PaOB	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:48:00.738Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:48:01
kx7OV-V0StOJSjsixg6lvM_lnUdQnn_F	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:48:00.763Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:48:01
tOqNZHx41TS8eN6dJtZrSrD2LRpUEcGn	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:48:01.119Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:48:02
aXLLi-RsV-qeYwxu6b5WNLdVcaZd33ZB	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:48:01.161Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:48:02
0pYKjqO7OFqzQ60zxC9pPMrGLU_geX0v	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:48:01.199Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:48:02
eJ-tHFkTb7ttepEusarUzbvPuHOR2uxB	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:48:01.223Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:48:02
lUKx5DbepjyidhoDGMXoqesU1fTWRolk	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:48:01.496Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:48:02
HrdlyfFAvFYrmrhhjJD-aqzuextmWEG3	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:48:01.583Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:48:02
F9HEm031IibLizPjT1i4EI0r3A2WrXZQ	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:48:01.614Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:48:02
qEJtzzj5We5d48zH6bEMS9fBDdbZqQe8	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:48:01.659Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:48:02
Jippyg9HnN5vQs9zjGcgxOGQFS_89xvg	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:48:01.683Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:48:02
wF_IBAfzZ-Irqt0tI614XK4rNYnw6vvo	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:48:01.835Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:48:02
voUUjpiPeB7LwXIkbf-0GlTBMs7AJ2hy	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:48:01.887Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:48:02
QxMCzwv3tVCnv_2tlKN1tvZ8HGi_RctI	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:48:01.940Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:48:02
6-75bLbNHEtMdyIXnp9GnPEsUft0jPEM	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:48:02.061Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:48:03
CC_TvGRiaMzlVw_qd2-nQf-ckPtDLo8e	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:48:02.116Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:48:03
O9gmzAZf0ZjP8o9GCin3626012-_fAGb	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:48:02.177Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:48:03
YWCL_4gyRQU_GwlEZ7mUblV4B6nxhWwg	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:48:02.199Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:48:03
0dCqGvzfUi8V9GbeK2CSy8nLQliPFg5D	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:48:02.350Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:48:03
9qMLTGl4PYsw77PU79Wd89gD5mJDmX-E	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:47:58.597Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:47:59
Ru2JxqJESuEvTNn7Rw26014fpfoDlEgk	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:47:58.651Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:47:59
4QxZsT_NOWzwVU1_tDsLirfiQJzFO1Ge	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:47:58.901Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:47:59
A5wgJND1FziAvwxeB-Gh91-tuTU_zht5	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:47:59.090Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:48:00
62oKp8UA5hS0rg0JuY2izbuhphSx3rDC	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:47:59.117Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:48:00
ohVAoBxRfO9BkYDrKCYVqCqxhLm3YVPS	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:47:59.144Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:48:00
c-oM5Zqt2mjfcEnVwr79k0Wi5beYrPa4	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:47:59.305Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:48:00
hZdUwabpvKAh9Kp4LjT4yEgUVRLWYUFF	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:47:59.325Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:48:00
vkf-DTw-5XsT9LrUJ6XOJZaGFLwVxXSh	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:47:59.709Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:48:00
xDque1lL_P6JA1lcQnw404lVLShTrA_7	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:47:59.730Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:48:00
IOJJkGKRfyDWxvqyRs1Nk-w1TDKyotoS	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:47:59.879Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:48:00
rSsON3RT7mdHxQj40La6bxo6aAY3x2cS	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:47:59.951Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:48:00
lAw6UTGj8pacg0OzZRgTcOx0Sl_9E0uk	{"cookie":{"originalMaxAge":86399997,"expires":"2025-05-28T05:08:20.250Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-28 05:08:21
ks7V2-UDLos-PdIDn9vRj5qPnaYm6s7w	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:48:02.468Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:48:03
tXxUOa_Ij5GEmghfVdLDRk_5LYkY704v	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:48:02.529Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:48:03
pVHujmFdbEtqAgHhhJuj-fgHDtMfsEqQ	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:48:02.771Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:48:03
4YKbpBHxg0DZ1wBi5hjIesuheahdjYI2	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:48:02.819Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:48:03
ak-gEvGRT28D04q4LXKwu7AavrF_wxod	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:48:02.895Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:48:03
6Ojy6xrkoZacInhG1NW40cUfWHILnQ4i	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:48:02.932Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:48:03
j2QsumrBCzVWTFfnquSpR72pLSwEISVW	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:48:02.977Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:48:03
3tKU424itpLYOTM3MHz97GaqGIWKsiTP	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:48:03.048Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:48:04
XxPvGaLK9RD6G83DTYMsHH2SQbGhERqe	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:48:03.367Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:48:04
OynmGbe1RAhqQz-Qf6wFDCPhqhsSEpvx	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:48:03.391Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:48:04
XFvvv5py-n_IziLumSti85TAbsZKRAkk	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:48:03.450Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:48:04
ktRQyoAdg9FI-q3_EnpqVdFilS6LmeVH	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:48:03.480Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:48:04
EMXztBDbCYflLeDo8LaMFPNteSsoiKCB	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:48:03.591Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:48:04
4YUZVmpi8sEp77IOyUjVpvo5EW7xkrqB	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:48:03.620Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:48:04
Aak8gbq0UDtJNYk-XC6vDKW_JTRaO3Ek	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:48:03.676Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:48:04
90p1CSz46OxY8zm5AG8zgwN-IeXk1fI_	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:48:03.738Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:48:04
_eHtfJnkya8RQKdBo2jYfCRTr2Igkpvn	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:48:03.819Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:48:04
1JxEAXYRE_V0ITVJYwFnEOUIYyROUHYo	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:48:04.084Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:48:05
6_RZSVgStGBXj8EbdHUuC9E_otZ_Vx4k	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:48:04.103Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:48:05
9zHOh8T8vJMmA7HUiSAEi8MHqmQwBrGk	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:48:04.208Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:48:05
saAVdLyytkBEiTap0U-NR58p_R52w9-I	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:48:04.265Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:48:05
A2Ehjo_p0APSwNPXagdKtEgCjKnygFic	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:48:04.588Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:48:05
BonAUvt2-HwUf3y5MJPe6c_W1pTNqU0-	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:48:04.497Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:48:05
UqEH_6IGmTVr3OLulybf4QzMBL0SZk1g	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:48:04.542Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:48:05
hkPwEAFWTdO13JeDYXvxflk8vG-qR346	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:48:04.579Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:48:05
9y2OdM2-i6xqLTnyAv6p3Q_rElLppSzr	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:49:07.469Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:49:08
BdH6Fe7rFuJ-124DOYcIvmgV9_XpRvVr	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:49:04.408Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:49:05
7ivcjCmG57IrLvUtI7bKjOLd3Jhs9fWm	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:49:04.496Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:49:05
7fUBajGy6cA8yjowDppFxDkEnMU-wN9n	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:49:04.512Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:49:05
z0FEydjaf1W3UWvrR3wHOK1I9xh59hYY	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:49:04.501Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:49:05
0S_HO-SsF7RL76pufJAbrBR8nuU7Nllo	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:49:07.519Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:49:08
AgHmhOEH6biClyC9DorgxHH4odw0AIWL	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:49:05.122Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:49:06
ZqHgd6C1HLt3kvq9zGFa27SX-xwvSb_S	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:49:07.527Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:49:08
Yf7Pa90ELxAuFhfZFds8e1bt1QjxRzF8	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:49:05.473Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:49:06
YKNMJqaYSJ7JuhWFTP_71FSoP3aE1njw	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:49:07.539Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:49:08
Fyg0AAREL6KPDsgIfI2dvD6GQ_B5YBBQ	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:49:07.534Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:49:08
maUrKpXjw1curAhFypizV-gKujyHhK2l	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:49:07.538Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:49:08
AXB3aOf5vOOFdb_NL7Xsu9j5aqk5obFs	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:49:07.709Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:49:08
zw9-9-KbzoDp4BXNxcwwl7_2QX-BpWhG	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:49:07.775Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:49:08
COeeXQ393QVjx7Z3xVI9dGDv4oaWSrzJ	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:49:07.780Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:49:08
ECsk_9U4nFQ56NGgBX9isZJTDvTTW9NW	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:49:07.056Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:49:08
d7EZ9iVhGMxqbFnQIWpyQGcUYPHHk818	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:49:07.058Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:49:08
0jty-7f0S54oqqmsoDXiTssHeMjG9wll	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:49:06.615Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:49:07
JJFi8kpgkQ7qP-OcD_1pyoKr1Drka-i7	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:49:07.062Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:49:08
C0TC9BcWNhilyXUUf-V-7n_gKL4FxEH7	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:49:07.060Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:49:08
DmrRQgzgytRudvqCgDRKenyCB17XpZUt	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:49:07.069Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:49:08
Ntz7V50dLWLpi37GiGtP_pEN_PIjIpE8	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:49:07.285Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:49:08
OYNQwwHo_cIMZrlX-ERRXYha7UF40h-d	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:49:07.292Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:49:08
IozyG7yA_lvwWTHYLE9m7KMJY55mTHx4	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:49:06.581Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:49:07
fpqsz4uEWvgyjAKFhBrletenOMy1GddD	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:49:07.297Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:49:08
3EDv0C320SSqRI2LDI4vdST12SeNaev4	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:49:07.787Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:49:08
GSnbYom-vN43gOHHZotqCoIVMWHCsRRY	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:49:07.305Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:49:08
PP57ro6wJmO88vYrpcHu-Ihb6TxwCD5X	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:49:07.788Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:49:08
VvtY57Q4MC-zv0O2ArETegY1nwxTrnVR	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:49:06.611Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:49:07
hUJCe2ypm0ydHz23ZwQ6EQLeik8DVHTV	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:49:07.305Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:49:08
-p6XzgpT3tfslEz1rtAhhZY3C_-OwRGR	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:49:06.615Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:49:07
Wtrc6DsQDgSiUbZrkAZPsHNLrmnT82xD	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:49:06.610Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:49:07
rgC0t6OoOtFYcHan6mXml4dSkiTfTt4-	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:49:07.789Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:49:08
Es7vS6gnnDLYpxid-QAisG9t-JWZc5dc	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:49:07.964Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:49:08
ULl34OkBBo4BE6mWLi-ltEAuB9093M4E	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:49:08.007Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:49:09
jin8zFTYkM-2DnoTLF2VrhO9PT7IgrnN	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:49:08.490Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:49:09
oBdh2KMTqtLGKRYzzjIFq2Lei2sFQDfF	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:49:08.509Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:49:09
HR6aTlLKbGUKLBRDYfU1SvfYgZDcH-Mx	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:49:08.713Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:49:09
B2zCFwyKTXC8CnOzLHJjoRviD9oz30qq	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:49:08.015Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:49:09
XT715MOGxg3vHs2moRikERu2r-eyPiL5	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:49:08.252Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:49:09
goFlRs0yAOGzMQDHbqMANtwfbPrP7wPu	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:49:08.272Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:49:09
uHLn-DvaUUwJIsjkRL2GDxj9DNW8SYAz	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:49:08.480Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:49:09
Vizg0A1XoN6JdBYaTCSi5D0pYLwSaFkI	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:49:08.947Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:49:09
LcqJjdHjuuJ1YgIo2F7av_PuUFEXIAmk	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:49:09.115Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:49:10
JeJvhy6X13Zf1q7uN4RZzJBb-9EHTkU0	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:49:09.424Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:49:10
AzuuzP9uCeaKJHTw-uCzCMteI_FUHFO0	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:49:09.566Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:49:10
Fmu5p5P3zWWss0gruoLnaJq4HpMmg4ax	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:49:09.628Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:49:10
M6cYg5H6Ls_1NU6OflmpQhwvvN7VJRbX	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:49:09.648Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:49:10
C9PZdt1VFL2jUtifP9YOzradquv4qjXT	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:49:09.694Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:49:10
QhnI9HJvi1H63EeGUNUdnn7emYTNdbai	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:49:09.793Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:49:10
s8I51uLRiPlCMUKDqfyTZtQE-gDJcFK0	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:49:09.858Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:49:10
F6L49yXay64_3YYY61btIp8JCkfmOSgL	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:49:10.112Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:49:11
1EUBt9AtwLTOjmkeVKNaPz-6Kq3Y60NP	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:49:10.172Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:49:11
v_AhPPE_OglMBedZbqNyx-U1aShS76A3	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:49:10.337Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:49:11
1yiZ3B78p9EHvjBXGviZ8XuMpJLf8JsP	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:49:10.545Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:49:11
nBjg1wQ6UaTUSyrccRKSIiTeWV7du38i	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:49:10.565Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:49:11
dmfSKCkQOpuALRDqDkBCvtTVUcGp1nGe	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:49:10.778Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:49:11
tkPUCh3Ofk69VimcAnfilOS5uXYXcieA	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:49:11.179Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:49:12
4SVorqvnY001nhoECxoDBTfhCrRVdpBI	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:49:08.018Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:49:09
bUMUeoljs7GdV0vaBMS-iDoLprImrJVK	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:49:08.251Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:49:09
GxNrald5-Qm1eT1J6TAhxyTwAqwVDPj9	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:49:08.487Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:49:09
plvNUofckAAgWb7cH2VblgZV76P4UDOW	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:49:08.723Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:49:09
zdpDQ8d1-HGAMWUDLwXZKavNgjB-FVME	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:49:08.745Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:49:09
u9u2EuRRW5XjWYxS2AMamz4Sn5DmRBFc	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:49:08.887Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:49:09
fAFIIP5opEKmKXd_n-ajuz0PyQTxlZcM	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:49:08.957Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:49:09
eYbbFQiQOxLP148bSG75dUPPcBBf7Arh	{"cookie":{"originalMaxAge":86399999,"expires":"2025-05-27T10:49:08.981Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:49:09
dVK3tp5lwQINc35xr6RitJZnctO9399Q	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:49:09.175Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:49:10
CeXuslIC_sL8CUGPJkVVexvRFBdf4jlJ	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:49:09.194Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:49:10
TKvI40zRk6uKsdeO5ybCx2RL2aFZaMjk	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:49:09.341Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:49:10
bp6bMAP8VyEv9ThyXdSs3wLlWu-vME9Z	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:49:09.402Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:49:10
QUVMNz_PkHqk2-S4o3NXVGxTamPOuyWQ	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:49:09.422Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:49:10
8qyoj-J3trikYDhIunz8BhZUehL3Oz2-	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:49:09.655Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:49:10
gfuPW-kwO_VI6b8glYiI647fw8kjrAcd	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:49:09.867Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:49:10
bmsbR0lh8qWVcFJodEG1IdI5SDigJ4ia	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:49:09.885Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:49:10
bvCUxVkFqD9vveHanXjuuU5ZJVQ7GnWw	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:49:09.938Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:49:10
T3Z5lTQX3vdOJeRoDSLY1P-u4e_NncrC	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:49:10.020Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:49:11
Wu_lgvkCdNZQCK78mWKdWs104cti6lvL	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:49:10.085Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:49:11
ArQrUg4tmHp8gVAjN6Edff3tk0hz0Jfi	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:49:10.105Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:49:11
vzW8icuV3VpdcUUC0zr2i0UKtLU4ALxA	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:49:10.323Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:49:11
dbii1cCy2l7GrH0epVZ7YrbVDdA9aWB-	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:49:10.355Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:49:11
K0VKBl2BQFI05eCanNBUOrTUZx1T_mnT	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:49:10.416Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:49:11
x_qlLQavC4v3PiiwjosFcR7SRYMufmTd	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:49:10.553Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:49:11
Fl51yVI75Fd00QIYVHinkOcTER1VKdrU	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:49:10.582Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:49:11
29MgcsVRK-qIkYTQTulPGhqbWtoNSfzG	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:49:10.667Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:49:11
6v7gKIwolVYytfl4wm9WsV1H86nHlYlz	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:49:10.711Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:49:11
vaFMjWPpk23j9v1AcL6HxzLjD_EmswXg	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:49:10.794Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:49:11
4_vxfoTVrVo-u6mnXLlqaWGkV9a5H0ds	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:49:10.815Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:49:11
IFgtP3Wd0280s75lHalihDUaqlMIkv7M	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:49:08.019Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:49:09
GhmvQdNh_0MHUNadaLwaMUep_tdZ_8WF	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:49:08.198Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:49:09
iAZPWCMQ0YxF3t9HXocjjO5QapZJaupQ	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:49:08.250Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:49:09
LBnit1UmZKFya8uPLCYv7HEdwrM8KgHO	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:49:08.429Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:49:09
W1bzKk7lWtUmESWlMtWkw6LxesvE-Wh1	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:49:08.722Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:49:09
KqftEf5djkkLunhCkRjyxJSNeIn3JVrx	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:49:08.959Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:49:09
i1u0Lsj7TifPnXkyDf5n9Zl-wwpKrqdz	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:49:09.184Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:49:10
cDfflrUdHAhVdymHmPYMzH1ISgV_Cf_o	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:49:09.410Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:49:10
6GxhXl3uyy-fM8-2wvh3msTUKJ6vM7ux	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:49:08.025Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:49:09
LHLicTktaAcwI6QccCUmqbvxnmTXM892	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:49:08.247Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:49:09
8QwZS7xaLeHovxZ5KvSl8maw9K27Lz40	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:49:08.489Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:49:09
uiU2J00W4LKSGzFWk_acibQ2j7EYJb7Z	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:49:08.657Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:49:09
qwJnWBUnFb-uC_XGlCCmtl-MW8pdrNjQ	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:49:08.719Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:49:09
MHDLINLPMqPLzsxdgkXsp2rWeOT_yM8P	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:49:08.959Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:49:09
VHXPiydQ0B0QjMlTiuBtkbMvnrZnRK5P	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:49:09.192Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:49:10
YweF_8-uwtoBrcU-vZqqX9ipGQ3LjduQ	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:49:09.220Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:49:10
RqCdhzRCakMw3k9BCsUdG1TY7tgzNXGG	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:49:09.455Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:49:10
J-AnFfsuKtYdzbFd207dfPY8sHwaYxxo	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:49:09.639Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:49:10
c5IqPoNX0y-yRr8rNG0S6ckyAuV-MEV7	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:49:09.876Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:49:10
H95vfE2R_01N12BCQic_HQ24AD6zGK83	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:49:10.095Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:49:11
hE8iYa-s2mRsdHaJYoK64GOApLA5vU7t	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:49:10.246Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:49:11
aSz9IDXY2v5sxgm8HBxq3Ce3zuua38Jk	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:49:10.315Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:49:11
vILUF25wcOFFODBP4AVm00YlE8Yu3POv	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:49:10.477Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:49:11
hw6JqxNeB3OcRFeJAB_7RtxbabzjiPbv	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:49:10.773Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:49:11
qodmWmjUePqKw29CzsiGpDgQ5vzsqufy	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:53:41.397Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:53:42
SzhnLLaW6ff6YZepwT3DkjRGQsFyx4qN	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:53:44.759Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:53:45
anbGWmMnjoUJ0xM2l68euyCGiV8tC-lM	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:53:44.808Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:53:45
DzT7Nqj9yfY40WDuDV3AsAqYk0iEF9JV	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:53:45.264Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:53:46
DkjSf74thGV6HWC25lBCUSYHELNF4NhR	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:53:44.942Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:53:45
ECdkDuQ6qXC-1ARlhHIXW_ByeP-Mm0GU	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:53:45.156Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:53:46
KOqVkTnQk7Ycgg_JICl93pV3Mo1XYgLN	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:53:45.159Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:53:46
OUq50p92H7g_3dddxO-aijjldqHpIU6z	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:53:45.931Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:53:46
SXDkty1x2xPSYFuxLfDyJHK5xVKKz5X5	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:53:46.036Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:53:47
MIpZynxMOdQwS_T9Y4UY_SSHZP5cPmkk	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:53:46.037Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:53:47
B_ebxMbBGu9d8Gj-ec9WVFN80vs1bVzX	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:53:46.040Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:53:47
y4lWrjeHLqjcDNyoSCk4dmUSZrCESM0F	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:53:46.039Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:53:47
hbnq4UByNuRdOWtPjT6zRkyCerrCzOLZ	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:53:46.169Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:53:47
Su-MNX7KScfTONa6O7CMTpsyaLZ7rtTc	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:53:46.286Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:53:47
n8LofTiPhATW24UsgdBQZaljJQ3IOuhB	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:53:46.289Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:53:47
SCWS0RR3KigDn6U6G8ch-e38inOjY9cW	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:53:46.290Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:53:47
NjZ2yH_f_J6TYjKH_u0rrhZ8qxavexSO	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:53:46.291Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:53:47
52UZQMi_3CJtPH6RT7RPi-o1-E2gwOQv	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:53:46.398Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:53:47
TVWLJTYeWfvp4Yjoj6w2FK5tQcrYz3iS	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:53:46.519Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:53:47
Gn5XiwHtVkE4d93CmlcvjzfVKQj7k6sx	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:53:46.514Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:53:47
Dp4r06F-Qh5gzP85yP4eGor0FFMgHX_9	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:53:46.528Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:53:47
82cq_jt8Ww3GpN0raIFHdBINE-V16PCs	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:53:46.517Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:53:47
x_kCp6yY8XkxbmxGD7-qamzEAYUOprMR	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:53:46.632Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:53:47
X8DZUFm0eqae-3NvdPyEEZpb5XIfOUDA	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:53:46.696Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:53:47
Dw-aloMO1Ld_07dwPYaMnHUfI4wXRESG	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:53:46.750Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:53:47
ndur2ANDrH_1tyogvirzOD_tTq3pWQrI	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:53:46.994Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:53:47
q00fUUKdYJ-r_dKi-SKyiXd6bUZpk7uZ	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:53:47.092Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:53:48
wLgJcyFUvVL4acM32B09dSVLrOC1o1YX	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:53:47.222Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:53:48
lccc8rej8MrK12HisYYjTm0lLA1B-7MM	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:53:47.453Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:53:48
t4xQnbSNx8tnDXxJotGtVHLZu-BQhf5-	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:53:47.701Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:53:48
dh07J7B6IIj6MsWr3zCgJTKV4Ta0ZF32	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:53:47.752Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:53:48
o4V-XPx44WgVMD62QbWiLVO3_NsHDnqT	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:53:47.801Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:53:48
-nWiPQ6CjN3RUZyl8qJ-Lspi-gaIvWZT	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:53:47.870Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:53:48
eyB1Qr6YLDZ3m5p24mPD-zvu8qlkpl67	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:53:47.918Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:53:48
pUaGG2tnegeyPSWT4kfRKowbUYe4TJ4T	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:53:46.753Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:53:47
hBqfaQKHVtLoHVto2ppwAGX6q2kbzp8Z	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:53:46.862Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:53:47
E_RZdGXs2UlPXtb5m5_b_2S2Wuhdhq8p	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:53:46.990Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:53:47
yPEM7FI89bM994Iw2i9YSG1_XMMgOmaq	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:53:47.233Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:53:48
FL1SqTL9adUGq0dP3qMaEGXyqPqXG-rZ	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:53:47.278Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:53:48
_AJ2Ih6O-lO695NVEl_rKeQyBxFQ_zXM	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:53:47.342Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:53:48
LkThnIEWyEWEmOEaoJRt7QCYgnTKv0pB	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:53:47.464Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:53:48
dTkqa-5yb2iyIpSz5LA0dPy7cZB_qVgp	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:53:47.520Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:53:48
WY35HNSwDBE1KYpHUC9gsXx2-muW6YXQ	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:53:47.572Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:53:48
J4LtSmdrJCK37oMw_kt1Jx0w-63B4UB_	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:53:47.639Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:53:48
kD377nPWWPrM3ZqHD_U_NIbbcosDQZ-H	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:53:47.680Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:53:48
-8J9EKkN47thHnVwJi6mybRlNcyihyfT	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:53:48.168Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:53:49
5hpbuiB2-20B3nGuxzpYg5n3DNsoBJRR	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:53:48.481Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:53:49
wSXzIeoH3p1YyEWoxiwLMrODkVryZwZQ	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:53:48.559Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:53:49
5m8xZiiD0--pPMiMYlX6hwYuhVra-le7	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:53:48.651Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:53:49
tqYVWLpFq1vE39jt_TTeAC4nUaU4JWsS	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:53:49.617Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:53:50
S2ArNphE-W74lhnaSSkMcCKE8XlZUZjk	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:53:49.641Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:53:50
nR0FEISooB06pQHZcpMfvIYjoIwKsj9E	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:53:49.834Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:53:50
5iFLufQ0AH2yvbkeOqE0NDJ7b25lTpCP	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:53:50.203Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:53:51
YQO6GNfpiNZZRe5bU3MbJgmaEWOMigaa	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:53:46.757Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:53:47
KRID7yZzwSMw2oW9B1oCPrD3_gdKGW91	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:53:46.928Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:53:47
zLNGsPxuXBCLRkaRzqrsKpuyuwGYh4zt	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:53:46.981Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:53:47
nWGtlD99pxhf0TXTPya_DfR3yww6Apxn	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:53:47.162Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:53:48
_HWzm6RdNl4c39nFyVwZblOC8M-BsKeu	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:53:47.219Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:53:48
qRKLd5to7eMvhbX7kCAFNST2QwE7mgaU	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:53:47.410Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:53:48
AwetpTE7GdpBeiWKPIeSbTHb828VaxQc	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:53:47.457Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:53:48
ogm7NB_DSj65VVqFRSv-_LtPk7leQjKs	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:53:47.985Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:53:48
oxqHC2wny7wbu_wu8ONnaCzC94uHr_LD	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:53:48.029Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:53:49
LaFRCq-9-SX_ZJNcqQ85wh-l8xLjYiFO	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:53:48.103Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:53:49
vpKd9-CAdvdFJ-izfuRDcWx6FDPBX4DT	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:53:48.167Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:53:49
avXKFayrI8sR_syAoh5S_bS-4WUUbUp9	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:53:48.419Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:53:49
9aoEesHM-ahfoAtLsspyuYkhA21vc0c2	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:53:48.452Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:53:49
t-HotK8mcUprQVEss2IdEBxlhkzuN3SD	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:53:48.662Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:53:49
hyrh_h_wsRT2CDCvLm6_hcha4l14jukp	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:53:48.684Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:53:49
yVoGnKL6Ul2y8qrGJ-ThEkDv5HbkiN4V	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:53:48.710Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:53:49
HCxXBWEs7LpeZo2BXDPboUiwQ4MofD89	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:53:46.766Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:53:47
f2cRErusJjoUUX0eMPDnXPIZvOrxo21v	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:53:46.991Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:53:47
gFc_x4by3Lawu0TQ9AWoeBH-UlFA8JFr	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:53:47.699Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:53:48
dD2chZKbTl6tNRr6IPtXp0KpSOTMjzqi	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:53:47.922Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:53:48
Oi6Z8qHgXWo75vHVyjUMbAog9zLMrJ7b	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:53:48.224Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:53:49
FVkq_WPKF6JRf26iOIYKvhP74bgZF8-8	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:53:48.257Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:53:49
kKnr1cu5N9aLwzhxAM9nBnTJhq1tCGaq	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:53:48.332Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:53:49
KHY2t4ae7OP5MOt5iYaawFDaN52f_1tj	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:53:48.418Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:53:49
9OTEjZplTNUkU2wMBgQ8e3CWJx3klm7t	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:53:48.653Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:53:49
UMjRtoNm7RhDzfto45bPLRrpAkMKGjwY	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:53:48.784Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:53:49
NfTEfgZ4mGeEMdO5JFRqe77RemnSbDeP	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:53:48.885Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:53:49
7C0hxsDHioGzds9WDo2k8vCNCDT88qaw	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:53:48.955Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:53:49
TR6_t15wHAU7G1h9or_lc3UEIJ-5QdLx	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:53:49.127Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:53:50
g8F6X7vF2Wv3pHqjhadVzIaEYGmiK9XI	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:53:49.145Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:53:50
WUtiPmyzUxk_rsSdvLhBUKE_sjuQmHmB	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:53:49.167Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:53:50
4L4XQ3HDXO43lQbeUFCBsF8BCq1wb_Gb	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:53:49.229Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:53:50
0cLXPkou3O-lPOFzLwALjkrH1KJBtw1x	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:53:49.351Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:53:50
_vKuFLCJKhEuZVWHRIQoT4HqXG2mJTk5	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:53:49.370Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:53:50
y89nBc3ZWf7M4tHwzYtAAOTONGdN7z_7	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:53:49.393Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:53:50
1UFQaMRJg4uCG9uMEdP2YUkAwjxSiYFs	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:53:49.410Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:53:50
yVTPgtRfYCTxHHeQ_RLJBlSbYYza3Le4	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:53:49.455Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:53:50
LT-bi50Z7lms_pWHZNnWTUESHs_ZPmjc	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:53:49.604Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:53:50
0NoHDb_EDXUfZtoFy718EvAaVESYLiwm	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:53:49.845Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:53:50
kCN0_pvkQYh6OOktHJCP3fx_yxpjkDIu	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:53:49.869Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:53:50
0crLhkq4z_SQlBJG9lURxFWR3nGmbuOU	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:53:47.932Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:53:48
rgAfayS-Ih-9G7njQIdG9KUTgPFNzAOl	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:53:48.173Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:53:49
y2kNDPP89D2Fei-Ij2i3qOAqZqzuw92T	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:53:48.420Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:53:49
-ectogNs9ISjT64ZPwIImQt6i-KJY4RR	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:53:48.900Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:53:49
4eeUMttJLIF9KhEZ4jN-w82PnC5pQwMP	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:53:48.919Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:53:49
7MY4mZzL3jES8PVq5_SSnS0-5hV76AQi	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:53:48.940Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:53:49
DG4rVaqHvWnY7hWjdP8t3eyaeceXIe9v	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:53:49.007Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:53:50
vGo_nsX-VFTblpLlth2pKSopp_FZUBNH	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:53:49.111Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:53:50
cunPyEbPw9Qp7n6HN2bE45XcgYxLhha5	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:53:49.178Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:53:50
iYPh8SKb9QvFqtIMVOUpJPWvb5TR9CPj	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:53:49.342Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:53:50
FsSCvYOcDVTB8dGwA0yb30wdi7jlYUme	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:53:49.573Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:53:50
Zrecq-L2vG1welNrTb-UDIzPn3Cr1ZfN	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:53:49.604Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:53:50
XZO4L1fq5EhwxhjdySRgy4k2tRjmaSB4	{"cookie":{"originalMaxAge":86399999,"expires":"2025-05-27T10:53:49.679Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:53:50
GaDN7aoV7CzZQjYkE1sk8AdpS28lCYdQ	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:53:49.805Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:53:50
px96-ktdY2G92juGK6S2X2L3OWXo7tYX	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T10:53:49.832Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 10:53:50
Yggq3n19Z5jZNuwSkWxcBoJUEzvJg0m5	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T12:52:50.348Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 12:52:51
Ccs9BWWu8FWUsphgcQn6Ji5ld_DOx35D	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T12:52:52.077Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 12:52:53
qajfSnxIbik85cMaGwrpiTJL39i6KcB6	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T12:52:53.080Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 12:52:54
aBh-5wOQ76ma3u-Vv6-r4oEVNREsQsrS	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T12:52:50.345Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 12:52:51
EmX0ZlmAPtvs_CCJSj2wWstwI0rhF_Ia	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T12:52:53.738Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 12:52:54
bAdGOIgql18VGKZ5hNDLl38Qlt94ded1	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T12:52:53.756Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 12:52:54
m8S4foJ4CP3VQK2KpKWRMs8c7IZbx66I	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T12:52:53.764Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 12:52:54
3WB46ZI6y4xuLlVbYNs7XTiofe0-j889	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T11:14:59.891Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 11:15:00
zgFOHQ-j2zedIjtrbxw04wrert2pZHlB	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T12:46:05.769Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 12:46:06
L8oqJfUt5YGSWwO1tUJYWvaXhUnsv8FX	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T12:52:47.999Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 12:52:48
y2-1EjqL7zn5_4NYrDV87L1aS5zT4GeQ	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T12:52:50.326Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 12:52:51
5pQtJUEM_D1jn97LZMcsHp-6chGmxQ6N	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T12:52:53.767Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 12:52:54
jTknmzt3fjjh8Z4fZ9TAFoDV8u3ep6Fh	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T12:52:54.002Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 12:52:55
uFHfFfWklM4vcHfUdTzMNcMfuha_xwTH	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T12:52:53.996Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 12:52:54
qor8rGSh6Xdv-oyIGT2gJvNTKhaQ9E1A	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T12:52:54.010Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 12:52:55
AMAOlJyAHWQkzNbfi9SPefr_QLjtHR-V	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T12:52:54.091Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 12:52:55
aIR-AwoC4m1TghsEET0ByJ7RPDi2qYja	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T12:52:54.094Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 12:52:55
rHIJGILFfHQg6Ulkmmv2XfY6ylQopLBY	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T12:52:54.233Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 12:52:55
cG-2ZprPNHjVo8wLREdT3Aol5E2jA4ef	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T12:52:54.243Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 12:52:55
-tDS2lJorYY3cRs-_TpmIDyLKN23JXSw	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T12:52:54.246Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 12:52:55
4qDLIl2ar_mtiwuyWdfDLHppqusO4iq1	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T12:52:56.338Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 12:52:57
1rlcfpTvq5rcBIyZoq15gblNbHBeExXm	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T12:52:54.244Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 12:52:55
tqLn-8OxULQm2rjUyx7xl_GuwZmcHM4X	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T12:52:54.333Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 12:52:55
PNEKIcQyGHZAaHK0sx3BcvT88CEdIdWI	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T12:52:54.483Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 12:52:55
mfxEHCw-yzW2fBDdIt7VRJsBwwilICOK	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T12:52:54.563Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 12:52:55
L8bW8bV_LhLDa6Kayi7MwpaZKQ5VPtES	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T12:52:54.720Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 12:52:55
lzjALCJjEIVkbrQu1NMjJpGt0OOx4HUt	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T12:52:54.947Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 12:52:55
UPrNTvGtiO4mmej9Az_DpIbVd-ztL0_l	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T12:52:55.033Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 12:52:56
-BUYTyqpcrTLuPeBQaTsJw87WyUYhdIJ	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T12:52:55.177Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 12:52:56
yZ3VcnQeUKZgAuCy_I_2Pls8qBrcp5jk	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T12:52:55.287Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 12:52:56
kvSL5vuICxQl_-hkUhy3QFFbwcTqMET6	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T12:52:55.408Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 12:52:56
hvKRDlZLu_gnpS_jy4iJm3Is6JztLuA8	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T12:52:55.520Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 12:52:56
PWsSMgUX9yuabBxvP078eWFnAINXWEOn	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T12:52:55.895Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 12:52:56
bCh2D_i_O2E0U__GqM_wauR4iZtTnFQm	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T12:52:55.953Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 12:52:56
RGrvb_bVAHApruRx4wm6_rrtLKNMqPsF	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T12:52:55.974Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 12:52:56
jRtJMYUqJcQBTXSkrYZ7S_lY8gAhoVKT	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T12:52:56.097Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 12:52:57
lLVEbGhwaCKex1ERwlln_MWWAlsV0Bo9	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T12:52:56.182Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 12:52:57
IGPsMYfG-waJeM0uYYhJjhP8NSOlVH4G	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T12:52:54.327Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 12:52:55
cdkqyoKtCCZ0qU7lTxlvZDQ9ipQwfQgi	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T12:52:54.467Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 12:52:55
YzBJQbl4_qlE7YDHNnxGXtU6pO9SDXs9	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T12:52:54.812Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 12:52:55
QPqwA7kAAqDaRRbPOPeTJRLKOtCO8Dr3	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T12:52:54.952Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 12:52:55
a7eS0CXn9BXhF6U0EC2tsvO6tG28IoyU	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T12:52:55.046Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 12:52:56
nHGnenPQ48yI_DI7MgZ-_eLx4-e1SdGm	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T12:52:55.643Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 12:52:56
2yr5nRHmWMrgdy3tNCERItcuxNC9oIGR	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T12:52:55.863Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 12:52:56
k2symDhxDzz7BNry8eNw-P-Hav3mf9SM	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T12:52:56.199Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 12:52:57
PlWny6b1HZyK21mAeO5nKc9iIxZ5TNVI	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T12:52:54.334Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 12:52:55
Ps6uZi5Hr2Yg69mmyBrBEXMMAqhx15Mh	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T12:52:54.482Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 12:52:55
9ilOXqs3_4a6pdqiupwPGdfRWxjz9JzW	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T12:52:54.571Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 12:52:55
I_zflQfLgmWq2LKU0_gPEoHpYyWlKSUN	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T12:52:54.717Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 12:52:55
hDh7oNx0WTcFlqIwlcowBoqYdUaizaKf	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T12:52:54.801Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 12:52:55
gF2rNg4swPiGFQILDVgRgXyZpQZrwbjJ	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T12:52:54.560Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 12:52:55
mGlhuXYbJuVcoEwExLZMLM9bpQqgE6qs	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T12:52:54.702Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 12:52:55
9MOkahB7u6y0uHiqtvv-FBsPVA9_EQO_	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T12:52:55.052Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 12:52:56
WIIAXrFxRbfXYPLwo-OwbEd8Vh5kBSFm	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T12:52:55.488Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 12:52:56
TMYtbM9gya5-otUvILewasJ-Xl61pELd	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T12:52:55.512Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 12:52:56
h-Q83MNgEaxwiqooJnxKCiGn9bt-xYVf	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T12:52:55.719Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 12:52:56
cMMlaNmR0GRH-_yNUpo6cyjmwF1hU9Fx	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T12:52:55.746Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 12:52:56
7RtuLl2Bk-Mn_cZg0E3FqtdzlhUwes8s	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T12:52:55.878Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 12:52:56
nqN_9rvjHplNwifYIfm5lrp51FBwPPch	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T12:52:54.819Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 12:52:55
42vu0D_RQjuN6TvUK8_9L4iMxhOUN9cJ	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T12:52:54.935Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 12:52:55
KvoNSWRJKwHRBgs-ceh21EjdDCZdc9ch	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T12:52:55.168Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 12:52:56
tNPmtlnReI0F8HtbOLfu-dnZFpEntDFR	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T12:52:55.186Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 12:52:56
bOcFAAwFOHIJVYxmlx_zchOY7j_vKE00	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T12:52:55.261Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 12:52:56
SZQ-0yueY41oErNMKGolParf1D5uaDRu	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T12:52:55.280Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 12:52:56
OVNe25IZg8KYv9Gk5H4-2fvkg4RJ9JHU	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T12:52:55.396Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 12:52:56
hcwYqyTTbNIRU1P8wfak-4wZpoTTcsmx	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T12:52:55.425Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 12:52:56
bdYdjl6FHYqn6sWv2CQP4WYMw9pbmSO2	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T12:52:55.634Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 12:52:56
bcj_BZgWwWvPvS2GBK6E6G3xVAdaN87z	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T12:52:55.661Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 12:52:56
Q_hzVHYgILguJOdgGKrIbV0wXQVIyzMq	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T12:52:55.752Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 12:52:56
bGjyZoag8ZB_dRvlbi0R7oSOtznMpmuY	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T12:52:55.981Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 12:52:56
1_whEhl7Pi8wUKjnvnyxY_WBnMbk45Pw	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T12:52:56.111Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 12:52:57
bZQ38pM6XsCIQA6CEGaddjBYkxOrc6Gf	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T12:52:56.130Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 12:52:57
BU8s4YmtEHAdESR2yHsTLOXkGAcLACEZ	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T12:52:56.215Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 12:52:57
vsvv2gJPJzpRXVq-5URLt5hlcvI7DTfn	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T12:52:56.333Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 12:52:57
locTaEZl1nEtCl5iGgOiK-xWuTc9Ct_n	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T13:32:48.260Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 13:32:49
hypIK1XdPFbP4uRmIG3_mqollpEK-yCF	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T13:33:10.002Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 13:33:11
elR0xYd5zm9EMReyHFQzSr8H5Wjg-J2J	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T13:34:21.146Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 13:34:22
-tBIxMgJ6ccFXIziJ8NwqQgGStHcCTim	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T13:35:35.401Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 13:35:36
-wIwZ5umz5ZUzBOrD8zMSMe4Lr7e-V2u	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T13:39:09.063Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 13:39:10
78DTFe7Vj6w24p9n-WtuY6KFBWHaaB0a	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T13:39:15.511Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 13:39:16
tmlegzflxt-3SFZ042OHQSIvfN5O3InU	{"cookie":{"originalMaxAge":86399999,"expires":"2025-05-27T13:39:24.500Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 13:39:25
TOUYYWZEunhj1oJXZKyuaTvYQVTN8mlc	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T13:40:28.164Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 13:40:29
hmiIeKCqt23S7TFK3fCJr1a7enWWjTij	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T13:41:41.191Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 13:41:42
iZi8aTa0ngDZic7ghjmS-nsF8eVs1LDh	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T13:42:55.834Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 13:42:56
KmFP-qySN7u3_RL0Yr4R4cOtC5gXKIPZ	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T13:46:39.654Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 13:46:40
GwIy55ELWwI8rQfYVCkMz_gdRQ_R1h-U	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T15:26:32.875Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 15:26:33
R2mvVxNnnX90JYtBRtZ3bkxx3ylVX-Eh	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T15:26:34.766Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 15:26:35
_9fCGkaoBpxEuqSYYD7_qSF8qW7uRQWl	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T15:26:36.330Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 15:26:37
uGvt2MhjkCtCFAsxTgDSVjr33c0UFp-9	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T18:42:07.017Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 18:42:08
dYRtumPXKESMNFg800lAmHqzWHgls5NO	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T21:37:15.279Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 21:37:16
AenkXgaCqoujY2lcigXjmXgMV4PI8IQa	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T21:37:17.047Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 21:37:18
a4k6MIr8-qhyXr1b_Hg7CUsEfcoYzhYb	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T21:37:17.389Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 21:37:18
0HruEzEVLVK1UCxoBuAggW4Yx6I52fQV	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T21:37:24.378Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 21:37:25
PVpTgcCyZ7KwI0J4efhzGJ1DynDX243Z	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T21:37:30.065Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 21:37:31
pmHYwBVFD8wLliNeuO9y8pNu5r3nEPK4	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T23:51:12.714Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 23:51:13
YmLzpXL2nXtxGlaTerG1wLoUyOp7bNwe	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T23:51:28.787Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 23:51:29
MWujq1BTVxGRuKdufjeLBBL8gmRALUUD	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-28T01:09:32.448Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-28 01:09:33
T8s-99wA4ceWQjM5uJh11O3evMLxOCUC	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-28T02:31:02.253Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-28 02:31:03
IIyq9QkgJivt8qwUZe4XNB0_OSlMlevI	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-28T03:05:39.668Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":4}}	2025-05-28 03:05:40
B4Zr9g276a3hEK0aN46_MA_Alg95lynl	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-28T03:52:11.283Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-28 03:52:12
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.users (id, tenant_id, username, email, password, first_name, last_name, role, phone, job_title, department, profile_image_url, permissions, is_active, last_login, created_at, updated_at, emergency_contact, safety_certification_expiry) FROM stdin;
4	1	shyam	shyam@venpep.com	56c9ae03ed1c6dd7cf6240e8e37b412960b9f956c96efe880edd27b1ad25bc0eeb0c1a5a0b9ce8cb2a9f28a5e93d42c2f23c01a701c96b41c72f0eff8b261a70.08357e9292aeb71890c195129ae530fd	Shyam	Velumani	safety_officer	\N	\N	\N	\N	\N	t	2025-05-26 06:44:23.021	2025-05-21 17:36:24.811632	2025-05-26 06:44:23.021	\N	\N
19	2	james	james@example.com	7a33b04847db3f67ff7cfc74f3bcbbb2d8d6b49f288f357f5ce53fa753a062a0b2a1e612bb8a191ffaad4ff321e3b1561d6ccbc5a28f9e6a6fa1627d07209bbc.a4cb841b885411dd7670d28a87bcbb7a	James	Joel	safety_officer	\N	\N	\N	\N	\N	t	\N	2025-05-23 10:55:24.593812	2025-05-23 10:55:24.593812	\N	\N
5	1	shyam	shyam@jumbow.io	SafetyFirst123!	James	Doe	supervisor	+447441399081	Supervisor	Civil	\N	\N	t	\N	2025-05-21 18:10:38.888805	2025-05-21 18:18:25.49	\N	\N
6	1	t4em1	t4em1@t4.com	SafetyFirst123!	Daniel	Kim	employee	5551234568	Foreman	Construction	\N	\N	t	\N	2025-05-21 22:04:24.636088	2025-05-21 22:04:24.636088	\N	\N
7	1	t4em2	t4em2@t4.com	SafetyFirst123!	Alexander	Doe	employee	5551234569	Engineer	Construction	\N	\N	t	\N	2025-05-21 22:04:25.00561	2025-05-21 22:04:25.00561	\N	\N
8	1	t4em3	t4em3@t4.com	SafetyFirst123!	Michael	Hurley	employee	5551234570	Contractor	Construction	\N	\N	t	\N	2025-05-21 22:04:25.363403	2025-05-21 22:04:25.363403	\N	\N
9	1	t4em4	t4em4@t4.com	SafetyFirst123!	Miranda	Michael	employee	5551234571	Foreman	Construction	\N	\N	t	\N	2025-05-21 22:04:25.705207	2025-05-21 22:04:25.705207	\N	\N
10	1	t4em5	t4em5@t4.com	SafetyFirst123!	Tom	Hardy	employee	5551234572	Engineer	Construction	\N	\N	t	\N	2025-05-21 22:04:26.048017	2025-05-21 22:04:26.048017	\N	\N
11	1	t4em6	t4em6@t4.com	SafetyFirst123!	Kim	Brady	employee	5551234573	Contractor	Construction	\N	\N	t	\N	2025-05-21 22:04:26.396777	2025-05-21 22:04:26.396777	\N	\N
12	1	t4em7	t4em7@t4.com	SafetyFirst123!	Robert	Smith	employee	5551234574	Contractor	Construction	\N	\N	t	\N	2025-05-21 22:04:26.734702	2025-05-21 22:04:26.734702	\N	\N
14	1	t4sup2	t4sup2@t4.com	SafetyFirst123!	Noah	Aaron	supervisor	5551234576	Supervisor	Construction	\N	\N	t	\N	2025-05-21 22:07:05.326403	2025-05-21 22:07:05.326403	\N	\N
15	1	t4sup3	t4sup3@t4.com	SafetyFirst123!	Emma	Casey	supervisor	5551234577	Supervisor	Construction	\N	\N	t	\N	2025-05-21 22:07:07.097696	2025-05-21 22:07:07.097696	\N	\N
16	1	t4saf1	t4saf1@t4.com	SafetyFirst123!	Paula	Smith	safety_officer	5551234578	Safety Officer	Construction	\N	\N	t	\N	2025-05-21 22:07:07.512897	2025-05-21 22:07:07.512897	\N	\N
17	1	t4sub1	t4sub1@t4.com	SafetyFirst123!	Charlotte	Love	subcontractor	5551234579	Sub-Contractor	Construction	\N	\N	t	\N	2025-05-21 22:07:07.785504	2025-05-21 22:07:07.785504	\N	\N
18	1	t4sub2	t4sub2@t4.com	SafetyFirst123!	Oliver	Des	subcontractor	5551234580	Sub-Contractor	Construction	\N	\N	t	\N	2025-05-21 22:07:08.973541	2025-05-21 22:07:08.973541	\N	\N
13	1	t4sup1	t4sup1@t4.com	SafetyFirst123!	Mary	Smith	safety_officer	5551234575	Supervisor	Construction	\N	\N	t	\N	2025-05-21 22:04:27.09318	2025-05-22 15:38:57.992	\N	\N
\.


--
-- Name: email_templates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.email_templates_id_seq', 1, false);


--
-- Name: hazard_assignments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.hazard_assignments_id_seq', 6, true);


--
-- Name: hazard_comments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.hazard_comments_id_seq', 10, true);


--
-- Name: hazard_reports_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.hazard_reports_id_seq', 10, true);


--
-- Name: incident_reports_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.incident_reports_id_seq', 33, true);


--
-- Name: inspection_checklist_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.inspection_checklist_items_id_seq', 1, false);


--
-- Name: inspection_findings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.inspection_findings_id_seq', 6, true);


--
-- Name: inspection_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.inspection_items_id_seq', 32, true);


--
-- Name: inspection_questions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.inspection_questions_id_seq', 1, false);


--
-- Name: inspection_responses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.inspection_responses_id_seq', 4, true);


--
-- Name: inspection_sections_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.inspection_sections_id_seq', 33, true);


--
-- Name: inspection_templates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.inspection_templates_id_seq', 16, true);


--
-- Name: inspections_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.inspections_id_seq', 22, true);


--
-- Name: migration_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.migration_history_id_seq', 5, true);


--
-- Name: permit_requests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.permit_requests_id_seq', 18, true);


--
-- Name: report_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.report_history_id_seq', 1, false);


--
-- Name: role_permissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.role_permissions_id_seq', 11, true);


--
-- Name: site_personnel_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.site_personnel_id_seq', 5, true);


--
-- Name: sites_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.sites_id_seq', 12, true);


--
-- Name: subcontractors_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.subcontractors_id_seq', 1, false);


--
-- Name: system_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.system_logs_id_seq', 132, true);


--
-- Name: team_members_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.team_members_id_seq', 1, false);


--
-- Name: teams_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.teams_id_seq', 2, true);


--
-- Name: tenants_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.tenants_id_seq', 2, true);


--
-- Name: training_content_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.training_content_id_seq', 25, true);


--
-- Name: training_courses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.training_courses_id_seq', 25, true);


--
-- Name: training_records_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.training_records_id_seq', 125, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.users_id_seq', 19, true);


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

