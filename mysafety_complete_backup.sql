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
    is_active boolean DEFAULT true NOT NULL
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
    updated_at timestamp without time zone DEFAULT now() NOT NULL
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

COPY public.hazard_reports (id, tenant_id, site_id, reported_by_id, title, description, location, gps_coordinates, hazard_type, severity, status, recommended_action, photo_urls, video_ids, created_at, updated_at, resolved_at, is_active) FROM stdin;
2	1	1	5	Leaking Roof	Water leaking through ceiling in computer lab during rain	IT Building, Room 203	\N	structural	high	open	Temporary containment and schedule roof inspection	["https://placehold.co/400x300?text=Roof+Leak"]	\N	2025-05-21 08:05:23.076812	2025-05-22 08:05:23.076812	\N	t
3	1	1	6	Damaged Scaffolding	Scaffold on east wing construction has loose connections	East Wing Construction Site	\N	fall	high	assigned	Replace damaged components before allowing access	["https://placehold.co/400x300?text=Damaged+Scaffold"]	\N	2025-05-20 08:05:23.076812	2025-05-22 08:05:23.076812	\N	t
4	1	1	7	Asbestos Suspected	During renovation, workers found suspicious material that may contain asbestos	Science Building Basement	\N	chemical	critical	in_progress	Cease work, isolate area, arrange testing	["https://placehold.co/400x300?text=Potential+Asbestos"]	\N	2025-05-18 08:05:23.076812	2025-05-22 08:05:23.076812	\N	t
5	1	1	8	Slippery Floor	Recently waxed floor without warning signs	Student Center Main Entrance	\N	slip_trip_fall	medium	resolved	Place warning signs and use anti-slip treatments	["https://placehold.co/400x300?text=Slippery+Floor"]	\N	2025-05-17 08:05:23.076812	2025-05-22 08:05:23.076812	\N	t
6	1	1	9	Blocked Fire Exit	Construction materials blocking emergency exit	Library South Wing	\N	fire	high	closed	Immediately clear pathway to comply with fire code	["https://placehold.co/400x300?text=Blocked+Exit"]	\N	2025-05-16 08:05:23.076812	2025-05-22 08:05:23.076812	\N	t
7	1	1	10	Missing Machine Guard	Table saw in workshop missing safety guard	Engineering Building Workshop	\N	mechanical	high	open	Install proper guard before equipment use is permitted	["https://placehold.co/400x300?text=Missing+Guard"]	\N	2025-05-21 08:05:23.076812	2025-05-22 08:05:23.076812	\N	t
8	1	1	13	Improper Chemical Storage	Incompatible chemicals stored together in lab cabinet	Chemistry Lab, Room 105	\N	chemical	medium	assigned	Separate chemicals according to compatibility chart	["https://placehold.co/400x300?text=Chemical+Storage"]	\N	2025-05-19 08:05:23.076812	2025-05-22 08:05:23.076812	\N	t
9	1	1	16	Extension Cord Hazard	Multiple extension cords daisy-chained across walkway	Administration Building Lobby	\N	electrical	medium	in_progress	Install proper outlets and remove trip hazard	["https://placehold.co/400x300?text=Extension+Cords"]	\N	2025-05-18 08:05:23.076812	2025-05-22 08:05:23.076812	\N	t
10	1	1	4	Unstable Excavation	Construction trench showing signs of instability with no shoring	New Dormitory Foundation Site	\N	excavation	critical	open	Install proper shoring immediately and restrict access	["https://placehold.co/400x300?text=Unstable+Trench"]	\N	2025-05-22 08:05:23.076812	2025-05-22 08:05:23.076812	\N	t
1	1	1	4	Exposed Electrical Wiring	Multiple exposed wires found in the main hallway ceiling	Building A, 2nd Floor Hallway	\N	electrical	critical	in_progress	Immediate isolation and repair by licensed electrician	["https://placehold.co/400x300?text=Exposed+Wires"]	\N	2025-05-22 08:05:23.076812	2025-05-22 08:56:39.366	\N	t
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
2ZkbefCvhGdfKnF2BMGx_E0dDv8fbTsf	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-26T10:51:29.440Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-26 10:51:30
wSQMFF6Mdc3h2_K0SXnO7vQf6ihf5Pqn	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-26T13:43:33.921Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-26 13:43:34
NQzJXZV308xQbeE0sTwWKRaxxrCotjQK	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-26T12:54:46.183Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-26 12:54:47
zPDt0qVnvQwcq8XfI36avLK5tAl41-2t	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-26T15:40:29.633Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":4}}	2025-05-26 15:40:30
RWzJhqPmb1aST5zeF8GmGYL7bHMEssRH	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:44.610Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:45
W2H4oPtSTagHftKfu9NWYvoiLBjveu5b	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-26T15:55:41.744Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":4}}	2025-05-26 15:55:42
4yHNLsj_UbeGUqmyDQoiE3CzWQSikUe8	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-26T16:07:43.961Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":4}}	2025-05-26 16:07:44
rmIOBs2CjnljCgN4CHyP_IYXxLfjmiVV	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:37.936Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:38
a20plMu4mjsB_5CbplImLHi076NNYHgv	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:39.312Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:40
cDxjppFPz_00lI_7P1S_04lJ4QM17GKh	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:42.791Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:43
Isi66LGhyz3pLi-ddNXfD4sRnmRMels_	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:42.996Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:43
SfMqecQeU9l_eO_LBeNrebyP16SL0sd2	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:43.014Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:44
50l9tN_7zJ_eJ_DZxh2nq02aRInw5oux	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:43.020Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:44
1QEjUAEYZz_xn9mu3x7GdSjDjsKt4O99	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:44.681Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:45
E-3ihhKTSWxh50aGgNx8at0TBygwE0-9	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:43.727Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:44
fkvm6FlQkgm0BcWWPONhN7p73-JVirH8	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:43.730Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:44
P0GZxwc7a47f23-Qtv_M6TP3pt12gbDn	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:44.122Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:45
oQ89_KlGTWDuhpvOAIaJiXG4qbkcw_Ek	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:44.729Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:45
s0odqsOB2d6qnbSJ30kUhK4L6TMjdq9j	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:44.258Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:45
6oMYik0fhy3KWPMcejXv4BWVnFQG0J-4	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:43.004Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:44
6D1qBCds4uqFS3sEX44L6z8QqDaKa8hH	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:43.037Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:44
92CzqeWx47gB_Rh0QrCUj3U9vL5-KtbR	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:44.419Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:45
XrAyCT-t7Y-piIMjnilN1q4SxhbXLBdR	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:44.850Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:45
TGywu0ImdRhU3rfHMXbqdRS1JzHl939T	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:44.972Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:45
1g1kaFheACN5_OHgi6gVwf1FXgqtxFKR	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:44.994Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:45
CSmWmuhUdtM7x9fbM8VlDCvIYesygSXp	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:45.036Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:46
Be5C1jn0LyLPESgfbNQjI3r2NP2hg8CG	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:45.221Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:46
qvS3JcqyIXrWijcgoH-arHwz7lI1vf0U	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:45.236Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:46
X7d8oNb_ZQHkJDK8UmSlhX4Z1wi3Bxvq	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:45.283Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:46
opoavFceuI9eT31fMPj7V6x5UUtqS2qC	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:45.292Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:46
qCp7CcwjlyWk5RTUk_iogWfbg_YEjEJm	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:45.337Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:46
hflR6YXvVDguI3SALIZs9IDz6fvaVcQU	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:49.600Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:50
-oILOHkyEDujZPG7NkoG2fk7fbKsCA3A	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:49.596Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:50
9WcmRnFX_DHJWTnPrsVhfvzwFJvZvj-0	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:45.367Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:46
pFWLXkGlUalJ_szyQp6O8luXTsEhkexf	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:45.417Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:46
jYQKQc-k5lTtn3lcT9MWklqwiqHQYJn1	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:45.810Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:46
7upAosXj5bpiBTgfTGiZk7tzxF6Ejwe6	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:45.840Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:46
Xv6ebo-NBfa0fqhjVa9FV8wdVVgRZzGz	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:45.955Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:46
zfV3i0fLBofkzbWpDJAug5BSIPAPmeBQ	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:49.439Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:50
xeY2QXCCp-VRM26vdF_URN47PHoiGLmB	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:46.060Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:47
GUpgFWfwAYmX5ABrkxsKqNJMWLPzYjwN	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:46.203Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:47
3NruI6qwt1ETzh-BU7BnQZDQTwfRG--p	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:49.549Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:50
sXn1cyWU714LvT43e8q3i30kSPiqwAue	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:47.456Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:48
ElguUIqpd0ot4Q0c8qfjiuoy2HWwSOQw	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:49.857Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:50
y2c-CfKtVxMIA7qU68WmXLZcteFeRaVt	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:51.549Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:52
FB0Y-IJifDjR5WFbmU_7Q38vajKt8hss	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:47.703Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:48
5-kRg363WWmTrgp9EN0hg7kuICW0Any7	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:47.941Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:48
FstA5BU-mNsselLWFEXKF1Ve_29gWz-7	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:47.972Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:48
Wz_5F3EmVK8KyECSy--Is90q42bx5OX1	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:48.029Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:49
ERrCgrxPPTKKdrgWAgWDhyoqYHO_zl8u	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:48.176Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:49
vsh-8eJq-2uRRk1XSZVfUQN7ukUJgv5m	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:48.641Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:49
TFnZQPeUVu8LSlMvdkay8QE0J7ECHXaf	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:45.467Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:46
ZceDxqW1WcT8NohhUPHlBHurOlThcNtS	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:45.527Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:46
TEbP9_y0ZTNJNotQ9sjwNp9lroeuZJXM	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:45.661Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:46
Q1D8rckcGGDiHOYD_jc_832eBQEzRy5u	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:45.909Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:46
gizVkJ3WORd0R0mJ62HmxqQ0nC8g7ph1	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:45.959Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:46
axsl43-U0iNIygFz0Myn2cWHSoWOZg4h	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:46.255Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:47
t5ekmpON5pKNnU3igfpbFQV0IjFZ5lFR	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:46.261Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:47
k87qo05bxnbxktZw4cr5PqUJ4VEyn6mX	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:46.297Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:47
4FCoJ_1wt9eZL_J0QuW2P3-f2OhJI7cG	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:46.504Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:47
PtASGpdZzgWd29pLVt4YpHtQpSs3iStV	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:46.560Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:47
S5P5WO8IeVpSOuvgyIh1tluwLKWlBgIK	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:47.038Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:48
i15qRwXoToA8fgyE06OrkU9t4ai26ssO	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:47.199Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:48
f_715zddxmgUEMzGtsQJwag94lc5NZOi	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:47.232Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:48
hd4M0b7n_-alXPBshXGbu4h-r0raf31Y	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:47.466Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:48
X2Rec1Ml_dkuhkJzp3xtwp4PyUIez3mY	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:47.942Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:48
mGWveQQOwVsurCpiJEmcwsb1cK4_w1Ge	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:48.134Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:49
AOlU1EgGSbknY5Ig7SejLDD35aCZoxhQ	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:48.614Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:49
JhrILem_PS-DeCwrZH36-7PpYeofq9hP	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:48.863Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:49
jhXZ5Me1yrxvh5QJ9bW35ivcjs9qjhpk	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:48.447Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:49
qvxJz6uhI1NDiWU6hV5ZEeF_-I2VQ01E	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:48.511Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:49
E-KbdwQx0zdvcj5-MDZfxHkfhwefzNgV	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:48.655Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:49
vH2YUBg1MOPfMyb_E140BeKwKih9U2ec	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:48.682Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:49
18K2JRU0jrQEPNFX_044bjAbMSz82zgu	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:50.276Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:51
sOPDSCCde1GkXI4oY6EClBzEzH9dRvlq	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:48.815Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:49
HZZXUM8XK87gmmZ1ayEYXISnNAslNhMY	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:49.338Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:50
rvg-pDr95EHI2g7C4NudQGXGZsEEIMQh	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:50.278Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:51
Kqg5NuY3bLMq_5lkd0WIBbG5r39k-oXE	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:50.574Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:51
i96D42Or4YPMetjgwnfilR_cb4h5cXtY	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:50.696Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:51
6XWQNquAlRAaNlPXYzozQhHJTYGV34dQ	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:50.698Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:51
a2Sov4eDlacJ1qSbo6B-mWmelfNo4FGu	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:50.962Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:51
QuNwVjMTNUxfnHDgeIqg6QyaLKoy9yyz	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:50.998Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:51
1Tm-bTv0POFY-05nOZ0Rf2krp3uVNCQ0	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:51.041Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:52
DmXiBD55kjisdrNHnhwn3MmLLGsWX5pU	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:51.196Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:52
8oqUYDcVTdhidTuDWotS7ciZtLBRDV33	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:51.237Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:52
8Y1AtgkGy863CDajCOebaDD4lSUOBFfT	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:51.429Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:52
DI2ES1TyUn0sljsCNk8lFlSU5OV6hdbu	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:51.555Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:52
X2xUC8n3q4Dz_0tsTinREmT0p2eDYmHq	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:52.851Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:53
n4Sbql03lteu92tjQ65eLdk3hktdjagv	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:46.444Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:47
ShCZ6_LRV8PJHJ6NUX8n9bj7SVin1zWO	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:46.494Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:47
kQUPQtFBf0RDhIOdB5E3YHoQhuR0HLc0	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:46.729Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:47
MxiVcm-2_oQqsnOpSpsPdx4WCvX6SPVY	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:46.770Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:47
wu1hul1Y05YcED4cDqEJ0cojZoI_oVcX	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:46.791Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:47
iOsfFrFBMInEmtmJDlzs4Ck8DL_nucb5	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:46.943Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:47
C9HpxD0zcCD-gswLvVGKQ0yjb9kA7ZGg	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:47.463Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:48
QaX5Ik4UUCQhq_k4CfI8TXa4WgG5Ckss	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:47.496Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:48
nN1LnMjTXWbaK2A9TY7KFPTgJ8V4Vneo	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:47.706Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:48
SiB8gGuIJKKafRFHdu8clMkCfudW0B93	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:48.134Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:49
9cMTp58fnYdvHOAS4Ad1erzf9U4uUfjq	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:48.177Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:49
84rLqsfwExKNRaiWTG1qfgRvQANTBKtS	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:48.406Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:49
WkYX7vSbd_5V50FvP-CrhCyuCILYkoLD	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:48.876Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:49
ZirGr8lfS1gN_zSfJwufaj_dhGjbuEPN	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:48.894Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:49
aU7gIKEtIDXVE40QXXSEKTWiO0Kqj09h	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:49.100Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:50
T3V8qe9PYI_Vz3exYg6OmX7UKrezlvlt	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:49.123Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:50
kk1cgeCU0EuoYQKf1KElFuqCivOEJHik	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:49.577Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:50
ciJZJK7rKikRwQXuA5LUcKVI6N56MP3U	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:49.649Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:50
xeR4-1MwJmg700BY1WCjN5ScWfGZUjAU	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:49.750Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:50
pIG-7CmNd6N_Do_O54q5HKkyqVv2snwB	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:49.823Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:50
W1vCzA_oqZ5OrzPIHXVK_DzcJ74Dfqh7	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:49.953Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:50
UgdmbWcav9JXkkAEASM_XKHA0KYL2KcF	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:50.198Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:51
bdjxjYcj3rozDQqg0Fyao68hI96jmnfg	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:50.540Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:51
WrKWH5VpEGvbXCM5MzNS8blIWM4y8dKo	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:50.786Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:51
h1buUbfCYjQeQyr50gafC9ubeRMg1TuI	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:50.453Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:51
Sd3N3yDWWPxI9VOSZlL-VZO92bm3uCYt	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:50.523Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:51
fNJTLppTI7WyQlyjjVlu9fls7OfoOPI3	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:50.541Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:51
3ovRrPmt43m1mbhyx2tCglI4fNn5vWse	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:50.688Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:51
rDy6qj3wvgz5lMcmz_l696AxbgOttKVT	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:50.956Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:51
Yq3Mh37-kpZTpejhWCnQeudYgL0-ZzuR	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:51.198Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:52
9YERzjShnoZbLdoEwueTLXDFQ1qMcTdA	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:51.283Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:52
ErbrAZcC4sGVNeT8Mh-liegQqjskWoSz	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:51.288Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:52
GXTFuv2DhQKORrNkYJrFBMba-Qq-0bnP	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:51.342Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:52
RXbnkedA0-9GIyx5MXZL8D4WRNA9wdJ9	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:51.736Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:52
7brv_BhDkWriWZtLHTX6g_iepxmfXN7U	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:52.247Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:53
LtwRbWNkvY_ewTOVfH-kjsIeBi4gKHkA	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:52.501Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:53
AxmIy0fyx17QcA9eiUc8raV50l2JjyAe	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:46.727Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:47
9owVjyMfnqzqv64CuNdCetdBklA8xAhA	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:46.989Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:47
pNYbYBocuz2nR3cy-vgDQ2zaWosJty06	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:47.195Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:48
P68x4H2YyyJM0iam6wks6A49lXSBrLu4	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:47.261Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:48
zuXQP5byTVr4PxMgeZmN4LFF0RdtmpNW	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:47.704Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:48
PUiv07_2x11w2D8DT3aMj8dnmEg0lo-U	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:47.946Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:48
3HN3bx76q2X_GXm0N23BZLfv-1CB07q0	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:48.030Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:49
X1Sn1GzqvmnXj6LvMqn0fJBTwI-q1QmK	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:48.132Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:49
43kR7nQF3Iylhtxl6bVftxL0yrSC_bEr	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:48.179Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:49
wZ4vTa00UZSfF54TKmCo8-oZOEGFQc9j	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:48.209Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:49
3vXU0sKIPh4Br7Epx9gWoxxkQMFhMht3	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:48.410Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:49
WnSSD2uihyWohLr9ECb-ROdc7-D1DBr2	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:48.649Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:49
iS7NLYoN5gIg0fgp6nN5WojHjho6lLPq	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:48.892Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:49
ALs8mqgVFwQjfhczpzhf0MvpUkWDhkEY	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:49.361Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:50
7n22znahPKgbVIEX7ldLHxh4gBkvAjXw	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:49.648Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:50
FV0U1sXZpvI_AqwckbEm4cporffL3grW	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:49.954Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:50
r6eKdm72k8ubLeQd--NsEJWu6PzOxbID	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:50.854Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:51
vuWDuQo2zcebSVAYXI9HEFfzmbQ7XYkk	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:50.058Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:51
Y6VXgKn_28Q5550XmCe5MAeGPUoAi-F-	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:50.200Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:51
6JgbBzmvQK-CAMNN8S3nK1SjoT-r7-kU	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:50.262Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:51
GqC_PbhMTZ14WQcxiNriZbdg9EkHcD71	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:50.536Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:51
TLTXH0_icv3N1sGFhmAof5Ln51futIfy	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:50.762Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:51
k94hlSrfmD4lCmogM7f2PRsDvVL0q9m5	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:50.952Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:51
y1mb3y82m4Vx0LEQOsYuvbfqLojZBm1E	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:51.037Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:52
w9c_38EYm-mUz0R954aKXbnKjpfgZvde	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:52.352Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:53
CPmMPH-XrzLIEwo6YVsSHZWmzcQ9f3km	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:51.221Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:52
EIJSR6iRBlCNqzlNJ2PU0Ob1pAxWqSGz	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:51.436Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:52
mxP_g_wRmFNCMBJpn9ZypN_yeV4of5ni	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:51.671Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:52
szk7Qa6XUKRB2wNjED_4rQ7G6sUx40o_	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:52.500Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:53
WO_Xopf6rPsFI2bm5A1EsLKofstvQ3VO	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:52.565Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:53
EPLjdrv7v4KJ2zoj8bJGMPA4lIoaS02R	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:52.569Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:53
aKAzm3xmnArVBzNdjB9sm0L2Hd3iN0de	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:52.602Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:53
UERQDAtIYUJ-hNWGgsOT0PB8oU9Df_NG	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:53.585Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:54
3mi-kYgY2KNkCNmW22nSX_yhl-XDb8iU	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:49.132Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:50
J4CMHlz_IQykIMWGl8v5sG1IjIKdNu2u	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:49.340Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:50
ZzZk6ibKLHvgP5KC-ANzhWs5ZGo3GV6D	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:49.879Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:50
HwRb5cyA3iXw200yqz1tV6C8Wr3R3Xhq	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:49.938Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:50
GjzJO8TFuXSCvNTwavXMzwR3U7gPTua3	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:50.008Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:51
uxS4bwvkqjf-7tqyDI5XxSacaDn3NAo-	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:50.199Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:51
dOqi_P0kQVQWJZ6-3urZnqWMu-qUEt8i	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:50.453Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:51
ovECUoZXR3fz5jQ0JA1_v4N66BRiwWyR	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:50.696Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:51
Wfe-lkfW5Jy19M8gMV9MmEgU4ZigKQsu	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:51.343Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:52
IseD_AE2iYxeIp7qKY1Fzbwo2C3_azyv	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:51.429Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:52
vnlcTRUpfIBtc-YSh5LsMY7GHirEbv9Y	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:51.544Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:52
SYhNvJ1kJ1qa1khu0IRFVKNL5XGP6Zb6	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:51.579Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:52
GHjDnwkxycmNyIbl6cFA5YpTNzwi2ps9	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:51.671Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:52
qNvyVCUXwBqpH7IqR4jkEqpxbi0p_ZKs	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:51.718Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:52
J6NZJa1njucySu_nwaBjClf_xK8frIZq	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:52.315Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:53
SN5qNRpdkbpdRrAoukEy-L6b48cCiGfL	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:52.321Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:53
dBc2X_zObISI7dYjZhqhAYox3p0aevvi	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:52.758Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:53
EHj3mBrh-Kb6bSIwbaEoFhh7ze9Legze	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:51.193Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:52
Xqh86mgt-jYzeSyhfnR673eHZ_vGUMt_	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:52.750Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:53
RraEfk0fjt5J-VJ7R4VfENd8_SW1k_iJ	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:51.471Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:52
64LG_fMq6Cjuqn4nJMac4nyMxflHWxn-	{"cookie":{"originalMaxAge":86399999,"expires":"2025-05-27T03:22:51.672Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:52
way-xxWbJziCDZgwzXIJEpy3X5JInkIH	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T03:22:53.057Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 03:22:54
7GTElctIMmJ5tDZOQmLOHI2iuH9NO3kv	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T04:13:30.591Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 04:13:31
vJCt7KZxXVmkW-4BzzIgtZHr1PUjkJH4	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T05:58:52.789Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 05:58:53
KvmIw4zenMjuyzWLZpn-ts3eidhSLOvl	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T06:16:48.498Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":4}}	2025-05-27 06:16:49
u2gDLLsJtgwkF5NWVt5jIqvqUynQbvbE	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T06:16:49.329Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 06:16:50
glwxSpwP6m3C97aw4oqL8FeE8SfgFIdf	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T06:44:37.618Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":4}}	2025-05-27 06:44:38
noHw8qCc9G-q3myAH2KrOdVQmQKT0zxr	{"cookie":{"originalMaxAge":86399999,"expires":"2025-05-27T07:07:46.974Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 07:07:47
T5lIgPIlYrX04uXvI0gXjaBN1i_fYUd3	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T06:42:27.320Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":4}}	2025-05-27 06:42:28
KMC9KwdTCyYgw_ue6WXLH4M72hQhd08a	{"cookie":{"originalMaxAge":86399999,"expires":"2025-05-27T07:02:13.786Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":4}}	2025-05-27 07:02:14
IIyq9QkgJivt8qwUZe4XNB0_OSlMlevI	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T07:09:05.037Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":4}}	2025-05-27 07:09:06
0T__i6zvr8Mp4784e88L8RDJF9x4uLsm	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T07:07:45.009Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 07:07:46
XVfjU5eFXrZ66z3koG6MVNngFHVdj7pV	{"cookie":{"originalMaxAge":86399999,"expires":"2025-05-27T07:08:52.237Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":4}}	2025-05-27 07:08:53
oBanpmfWW_i03eKO5hNaZy6kAC7oo82U	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-27T07:07:47.294Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 07:07:48
lAw6UTGj8pacg0OzZRgTcOx0Sl_9E0uk	{"cookie":{"originalMaxAge":86399999,"expires":"2025-05-27T07:07:51.698Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-27 07:07:52
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.users (id, tenant_id, username, email, password, first_name, last_name, role, phone, job_title, department, profile_image_url, permissions, is_active, last_login, created_at, updated_at) FROM stdin;
4	1	shyam	shyam@venpep.com	56c9ae03ed1c6dd7cf6240e8e37b412960b9f956c96efe880edd27b1ad25bc0eeb0c1a5a0b9ce8cb2a9f28a5e93d42c2f23c01a701c96b41c72f0eff8b261a70.08357e9292aeb71890c195129ae530fd	Shyam	Velumani	safety_officer	\N	\N	\N	\N	\N	t	2025-05-26 06:44:23.021	2025-05-21 17:36:24.811632	2025-05-26 06:44:23.021
19	2	james	james@example.com	7a33b04847db3f67ff7cfc74f3bcbbb2d8d6b49f288f357f5ce53fa753a062a0b2a1e612bb8a191ffaad4ff321e3b1561d6ccbc5a28f9e6a6fa1627d07209bbc.a4cb841b885411dd7670d28a87bcbb7a	James	Joel	safety_officer	\N	\N	\N	\N	\N	t	\N	2025-05-23 10:55:24.593812	2025-05-23 10:55:24.593812
5	1	shyam	shyam@jumbow.io	SafetyFirst123!	James	Doe	supervisor	+447441399081	Supervisor	Civil	\N	\N	t	\N	2025-05-21 18:10:38.888805	2025-05-21 18:18:25.49
6	1	t4em1	t4em1@t4.com	SafetyFirst123!	Daniel	Kim	employee	5551234568	Foreman	Construction	\N	\N	t	\N	2025-05-21 22:04:24.636088	2025-05-21 22:04:24.636088
7	1	t4em2	t4em2@t4.com	SafetyFirst123!	Alexander	Doe	employee	5551234569	Engineer	Construction	\N	\N	t	\N	2025-05-21 22:04:25.00561	2025-05-21 22:04:25.00561
8	1	t4em3	t4em3@t4.com	SafetyFirst123!	Michael	Hurley	employee	5551234570	Contractor	Construction	\N	\N	t	\N	2025-05-21 22:04:25.363403	2025-05-21 22:04:25.363403
9	1	t4em4	t4em4@t4.com	SafetyFirst123!	Miranda	Michael	employee	5551234571	Foreman	Construction	\N	\N	t	\N	2025-05-21 22:04:25.705207	2025-05-21 22:04:25.705207
10	1	t4em5	t4em5@t4.com	SafetyFirst123!	Tom	Hardy	employee	5551234572	Engineer	Construction	\N	\N	t	\N	2025-05-21 22:04:26.048017	2025-05-21 22:04:26.048017
11	1	t4em6	t4em6@t4.com	SafetyFirst123!	Kim	Brady	employee	5551234573	Contractor	Construction	\N	\N	t	\N	2025-05-21 22:04:26.396777	2025-05-21 22:04:26.396777
12	1	t4em7	t4em7@t4.com	SafetyFirst123!	Robert	Smith	employee	5551234574	Contractor	Construction	\N	\N	t	\N	2025-05-21 22:04:26.734702	2025-05-21 22:04:26.734702
14	1	t4sup2	t4sup2@t4.com	SafetyFirst123!	Noah	Aaron	supervisor	5551234576	Supervisor	Construction	\N	\N	t	\N	2025-05-21 22:07:05.326403	2025-05-21 22:07:05.326403
15	1	t4sup3	t4sup3@t4.com	SafetyFirst123!	Emma	Casey	supervisor	5551234577	Supervisor	Construction	\N	\N	t	\N	2025-05-21 22:07:07.097696	2025-05-21 22:07:07.097696
16	1	t4saf1	t4saf1@t4.com	SafetyFirst123!	Paula	Smith	safety_officer	5551234578	Safety Officer	Construction	\N	\N	t	\N	2025-05-21 22:07:07.512897	2025-05-21 22:07:07.512897
17	1	t4sub1	t4sub1@t4.com	SafetyFirst123!	Charlotte	Love	subcontractor	5551234579	Sub-Contractor	Construction	\N	\N	t	\N	2025-05-21 22:07:07.785504	2025-05-21 22:07:07.785504
18	1	t4sub2	t4sub2@t4.com	SafetyFirst123!	Oliver	Des	subcontractor	5551234580	Sub-Contractor	Construction	\N	\N	t	\N	2025-05-21 22:07:08.973541	2025-05-21 22:07:08.973541
13	1	t4sup1	t4sup1@t4.com	SafetyFirst123!	Mary	Smith	safety_officer	5551234575	Supervisor	Construction	\N	\N	t	\N	2025-05-21 22:04:27.09318	2025-05-22 15:38:57.992
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

