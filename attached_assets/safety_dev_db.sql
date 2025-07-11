PGDMP  ;                    }            safety_dev_db    16.9    17.0    $           0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                           false            %           0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                           false            &           0    0 
   SEARCHPATH 
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                           false            '           1262    16384    safety_dev_db    DATABASE     x   CREATE DATABASE safety_dev_db WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'en_US.utf8';
    DROP DATABASE safety_dev_db;
                     postgres    false            �           1247    17127    compliance_status    TYPE     _   CREATE TYPE public.compliance_status AS ENUM (
    'yes',
    'no',
    'na',
    'partial'
);
 $   DROP TYPE public.compliance_status;
       public               postgres    false            �           1247    16426    hazard_severity    TYPE     d   CREATE TYPE public.hazard_severity AS ENUM (
    'low',
    'medium',
    'high',
    'critical'
);
 "   DROP TYPE public.hazard_severity;
       public               postgres    false            �           1247    16436    hazard_status    TYPE     z   CREATE TYPE public.hazard_status AS ENUM (
    'open',
    'assigned',
    'in_progress',
    'resolved',
    'closed'
);
     DROP TYPE public.hazard_status;
       public               postgres    false            �           1247    17136    incident_severity    TYPE     k   CREATE TYPE public.incident_severity AS ENUM (
    'minor',
    'moderate',
    'major',
    'critical'
);
 $   DROP TYPE public.incident_severity;
       public               postgres    false            �           1247    17146    incident_status    TYPE     r   CREATE TYPE public.incident_status AS ENUM (
    'reported',
    'investigating',
    'resolved',
    'closed'
);
 "   DROP TYPE public.incident_status;
       public               postgres    false            �           1247    17156    inspection_item_type    TYPE     �   CREATE TYPE public.inspection_item_type AS ENUM (
    'yes_no',
    'multiple_choice',
    'checkbox',
    'numeric',
    'text'
);
 '   DROP TYPE public.inspection_item_type;
       public               postgres    false            �           1247    16448    inspection_status    TYPE     v   CREATE TYPE public.inspection_status AS ENUM (
    'scheduled',
    'in_progress',
    'completed',
    'canceled'
);
 $   DROP TYPE public.inspection_status;
       public               postgres    false            �           1247    17168    permit_status    TYPE     k   CREATE TYPE public.permit_status AS ENUM (
    'requested',
    'approved',
    'denied',
    'expired'
);
     DROP TYPE public.permit_status;
       public               postgres    false            �           1247    17178 	   site_role    TYPE     �   CREATE TYPE public.site_role AS ENUM (
    'site_manager',
    'safety_coordinator',
    'foreman',
    'worker',
    'subcontractor',
    'visitor'
);
    DROP TYPE public.site_role;
       public               postgres    false            �           1247    16488    subscription_plan    TYPE     o   CREATE TYPE public.subscription_plan AS ENUM (
    'basic',
    'standard',
    'premium',
    'enterprise'
);
 $   DROP TYPE public.subscription_plan;
       public               postgres    false            �           1247    16400 	   user_role    TYPE     �   CREATE TYPE public.user_role AS ENUM (
    'super_admin',
    'safety_officer',
    'supervisor',
    'subcontractor',
    'employee'
);
    DROP TYPE public.user_role;
       public               postgres    false            �            1259    17191    email_templates    TABLE     �  CREATE TABLE public.email_templates (
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
 #   DROP TABLE public.email_templates;
       public         heap r       postgres    false            �            1259    17200    email_templates_id_seq    SEQUENCE     �   CREATE SEQUENCE public.email_templates_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 -   DROP SEQUENCE public.email_templates_id_seq;
       public               postgres    false    223            (           0    0    email_templates_id_seq    SEQUENCE OWNED BY     Q   ALTER SEQUENCE public.email_templates_id_seq OWNED BY public.email_templates.id;
          public               postgres    false    224            �            1259    17201    hazard_assignments    TABLE     X  CREATE TABLE public.hazard_assignments (
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
 &   DROP TABLE public.hazard_assignments;
       public         heap r       postgres    false    902    902            �            1259    17211    hazard_assignments_id_seq    SEQUENCE     �   CREATE SEQUENCE public.hazard_assignments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 0   DROP SEQUENCE public.hazard_assignments_id_seq;
       public               postgres    false    225            )           0    0    hazard_assignments_id_seq    SEQUENCE OWNED BY     W   ALTER SEQUENCE public.hazard_assignments_id_seq OWNED BY public.hazard_assignments.id;
          public               postgres    false    226            �            1259    17212    hazard_comments    TABLE     h  CREATE TABLE public.hazard_comments (
    id integer NOT NULL,
    hazard_id integer NOT NULL,
    user_id integer NOT NULL,
    comment text NOT NULL,
    attachment_urls jsonb,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    is_active boolean DEFAULT true NOT NULL
);
 #   DROP TABLE public.hazard_comments;
       public         heap r       postgres    false            �            1259    17220    hazard_comments_id_seq    SEQUENCE     �   CREATE SEQUENCE public.hazard_comments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 -   DROP SEQUENCE public.hazard_comments_id_seq;
       public               postgres    false    227            *           0    0    hazard_comments_id_seq    SEQUENCE OWNED BY     Q   ALTER SEQUENCE public.hazard_comments_id_seq OWNED BY public.hazard_comments.id;
          public               postgres    false    228            �            1259    16598    hazard_reports    TABLE     ]  CREATE TABLE public.hazard_reports (
    id integer NOT NULL,
    tenant_id integer,
    site_id integer,
    reporter_id integer,
    team_id integer,
    title character varying(255) NOT NULL,
    description text NOT NULL,
    location character varying(255),
    severity public.hazard_severity NOT NULL,
    status public.hazard_status DEFAULT 'open'::public.hazard_status,
    photo_urls text[],
    priority_score integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    weather_conditions character varying(100)
);
 "   DROP TABLE public.hazard_reports;
       public         heap r       postgres    false    902    899    902            �            1259    17221    hazard_reports_id_seq    SEQUENCE     �   CREATE SEQUENCE public.hazard_reports_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 ,   DROP SEQUENCE public.hazard_reports_id_seq;
       public               postgres    false    219            +           0    0    hazard_reports_id_seq    SEQUENCE OWNED BY     O   ALTER SEQUENCE public.hazard_reports_id_seq OWNED BY public.hazard_reports.id;
          public               postgres    false    229            �            1259    17222    incident_reports    TABLE     �  CREATE TABLE public.incident_reports (
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
 $   DROP TABLE public.incident_reports;
       public         heap r       postgres    false    941    941    938            �            1259    17232    incident_reports_id_seq    SEQUENCE     �   CREATE SEQUENCE public.incident_reports_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 .   DROP SEQUENCE public.incident_reports_id_seq;
       public               postgres    false    230            ,           0    0    incident_reports_id_seq    SEQUENCE OWNED BY     S   ALTER SEQUENCE public.incident_reports_id_seq OWNED BY public.incident_reports.id;
          public               postgres    false    231            �            1259    17233    inspection_checklist_items    TABLE     �  CREATE TABLE public.inspection_checklist_items (
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
 .   DROP TABLE public.inspection_checklist_items;
       public         heap r       postgres    false            �            1259    17244 !   inspection_checklist_items_id_seq    SEQUENCE     �   CREATE SEQUENCE public.inspection_checklist_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 8   DROP SEQUENCE public.inspection_checklist_items_id_seq;
       public               postgres    false    232            -           0    0 !   inspection_checklist_items_id_seq    SEQUENCE OWNED BY     g   ALTER SEQUENCE public.inspection_checklist_items_id_seq OWNED BY public.inspection_checklist_items.id;
          public               postgres    false    233            �            1259    17245    inspection_findings    TABLE     �  CREATE TABLE public.inspection_findings (
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
 '   DROP TABLE public.inspection_findings;
       public         heap r       postgres    false            �            1259    17255    inspection_findings_id_seq    SEQUENCE     �   CREATE SEQUENCE public.inspection_findings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 1   DROP SEQUENCE public.inspection_findings_id_seq;
       public               postgres    false    234            .           0    0    inspection_findings_id_seq    SEQUENCE OWNED BY     Y   ALTER SEQUENCE public.inspection_findings_id_seq OWNED BY public.inspection_findings.id;
          public               postgres    false    235            �            1259    16998    inspection_items    TABLE     *  CREATE TABLE public.inspection_items (
    id integer NOT NULL,
    section_id integer,
    item_text text NOT NULL,
    item_type character varying(50) DEFAULT 'checklist'::character varying,
    is_required boolean DEFAULT false,
    item_order integer DEFAULT 0,
    points integer DEFAULT 0
);
 $   DROP TABLE public.inspection_items;
       public         heap r       postgres    false            �            1259    17256    inspection_items_id_seq    SEQUENCE     �   CREATE SEQUENCE public.inspection_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 .   DROP SEQUENCE public.inspection_items_id_seq;
       public               postgres    false    222            /           0    0    inspection_items_id_seq    SEQUENCE OWNED BY     S   ALTER SEQUENCE public.inspection_items_id_seq OWNED BY public.inspection_items.id;
          public               postgres    false    236            �            1259    17257    inspection_questions    TABLE       CREATE TABLE public.inspection_questions (
    id integer NOT NULL,
    template_id integer,
    question_text text NOT NULL,
    question_type character varying(50) NOT NULL,
    options text[],
    is_required boolean DEFAULT false,
    order_index integer DEFAULT 0
);
 (   DROP TABLE public.inspection_questions;
       public         heap r       postgres    false            �            1259    17264    inspection_questions_id_seq    SEQUENCE     �   CREATE SEQUENCE public.inspection_questions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 2   DROP SEQUENCE public.inspection_questions_id_seq;
       public               postgres    false    237            0           0    0    inspection_questions_id_seq    SEQUENCE OWNED BY     [   ALTER SEQUENCE public.inspection_questions_id_seq OWNED BY public.inspection_questions.id;
          public               postgres    false    238            �            1259    17265    inspection_responses    TABLE     �  CREATE TABLE public.inspection_responses (
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
 (   DROP TABLE public.inspection_responses;
       public         heap r       postgres    false            �            1259    17273    inspection_responses_id_seq    SEQUENCE     �   CREATE SEQUENCE public.inspection_responses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 2   DROP SEQUENCE public.inspection_responses_id_seq;
       public               postgres    false    239            1           0    0    inspection_responses_id_seq    SEQUENCE OWNED BY     [   ALTER SEQUENCE public.inspection_responses_id_seq OWNED BY public.inspection_responses.id;
          public               postgres    false    240            �            1259    17274    inspection_sections    TABLE     [  CREATE TABLE public.inspection_sections (
    id integer NOT NULL,
    template_id integer NOT NULL,
    name text NOT NULL,
    description text,
    "order" integer DEFAULT 0 NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
 '   DROP TABLE public.inspection_sections;
       public         heap r       postgres    false            �            1259    17282    inspection_sections_id_seq    SEQUENCE     �   CREATE SEQUENCE public.inspection_sections_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 1   DROP SEQUENCE public.inspection_sections_id_seq;
       public               postgres    false    241            2           0    0    inspection_sections_id_seq    SEQUENCE OWNED BY     Y   ALTER SEQUENCE public.inspection_sections_id_seq OWNED BY public.inspection_sections.id;
          public               postgres    false    242            �            1259    17283    inspection_templates    TABLE     �  CREATE TABLE public.inspection_templates (
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
 (   DROP TABLE public.inspection_templates;
       public         heap r       postgres    false            �            1259    17293    inspection_templates_id_seq    SEQUENCE     �   CREATE SEQUENCE public.inspection_templates_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 2   DROP SEQUENCE public.inspection_templates_id_seq;
       public               postgres    false    243            3           0    0    inspection_templates_id_seq    SEQUENCE OWNED BY     [   ALTER SEQUENCE public.inspection_templates_id_seq OWNED BY public.inspection_templates.id;
          public               postgres    false    244            �            1259    16706    inspections    TABLE     �  CREATE TABLE public.inspections (
    id integer NOT NULL,
    tenant_id integer,
    site_id integer,
    template_id integer,
    inspector_id integer,
    team_id integer,
    title character varying(255) NOT NULL,
    status public.inspection_status DEFAULT 'scheduled'::public.inspection_status,
    scheduled_date timestamp without time zone,
    completed_date timestamp without time zone,
    notes text,
    overall_score numeric(5,2),
    created_at timestamp without time zone DEFAULT now()
);
    DROP TABLE public.inspections;
       public         heap r       postgres    false    905    905            �            1259    17294    inspections_id_seq    SEQUENCE     �   CREATE SEQUENCE public.inspections_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 )   DROP SEQUENCE public.inspections_id_seq;
       public               postgres    false    220            4           0    0    inspections_id_seq    SEQUENCE OWNED BY     I   ALTER SEQUENCE public.inspections_id_seq OWNED BY public.inspections.id;
          public               postgres    false    245            �            1259    17295    migration_history    TABLE     �   CREATE TABLE public.migration_history (
    id integer NOT NULL,
    migration_name character varying(255) NOT NULL,
    applied_at timestamp without time zone DEFAULT now(),
    checksum character varying(64)
);
 %   DROP TABLE public.migration_history;
       public         heap r       postgres    false            �            1259    17299    migration_history_id_seq    SEQUENCE     �   CREATE SEQUENCE public.migration_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 /   DROP SEQUENCE public.migration_history_id_seq;
       public               postgres    false    246            5           0    0    migration_history_id_seq    SEQUENCE OWNED BY     U   ALTER SEQUENCE public.migration_history_id_seq OWNED BY public.migration_history.id;
          public               postgres    false    247            �            1259    17300    permit_requests    TABLE     �  CREATE TABLE public.permit_requests (
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
 #   DROP TABLE public.permit_requests;
       public         heap r       postgres    false    947    947            �            1259    17309    permit_requests_id_seq    SEQUENCE     �   CREATE SEQUENCE public.permit_requests_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 -   DROP SEQUENCE public.permit_requests_id_seq;
       public               postgres    false    248            6           0    0    permit_requests_id_seq    SEQUENCE OWNED BY     Q   ALTER SEQUENCE public.permit_requests_id_seq OWNED BY public.permit_requests.id;
          public               postgres    false    249            �            1259    17310    report_history    TABLE     �  CREATE TABLE public.report_history (
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
 "   DROP TABLE public.report_history;
       public         heap r       postgres    false            �            1259    17317    report_history_id_seq    SEQUENCE     �   CREATE SEQUENCE public.report_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 ,   DROP SEQUENCE public.report_history_id_seq;
       public               postgres    false    250            7           0    0    report_history_id_seq    SEQUENCE OWNED BY     O   ALTER SEQUENCE public.report_history_id_seq OWNED BY public.report_history.id;
          public               postgres    false    251            �            1259    17318    role_permissions    TABLE     o  CREATE TABLE public.role_permissions (
    id integer NOT NULL,
    tenant_id integer NOT NULL,
    role public.user_role NOT NULL,
    resource text NOT NULL,
    action text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    is_active boolean DEFAULT true NOT NULL
);
 $   DROP TABLE public.role_permissions;
       public         heap r       postgres    false    896            �            1259    17326    role_permissions_id_seq    SEQUENCE     �   CREATE SEQUENCE public.role_permissions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 .   DROP SEQUENCE public.role_permissions_id_seq;
       public               postgres    false    252            8           0    0    role_permissions_id_seq    SEQUENCE OWNED BY     S   ALTER SEQUENCE public.role_permissions_id_seq OWNED BY public.role_permissions.id;
          public               postgres    false    253            �            1259    17327    site_personnel    TABLE     �  CREATE TABLE public.site_personnel (
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
 "   DROP TABLE public.site_personnel;
       public         heap r       postgres    false            �            1259    17337    site_personnel_id_seq    SEQUENCE     �   CREATE SEQUENCE public.site_personnel_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 ,   DROP SEQUENCE public.site_personnel_id_seq;
       public               postgres    false    254            9           0    0    site_personnel_id_seq    SEQUENCE OWNED BY     O   ALTER SEQUENCE public.site_personnel_id_seq OWNED BY public.site_personnel.id;
          public               postgres    false    255            �            1259    16529    sites    TABLE     �  CREATE TABLE public.sites (
    id integer NOT NULL,
    tenant_id integer,
    name character varying(255) NOT NULL,
    address text,
    city character varying(100),
    state character varying(100),
    zip_code character varying(20),
    country character varying(100) DEFAULT 'USA'::character varying,
    site_manager_id integer,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now()
);
    DROP TABLE public.sites;
       public         heap r       postgres    false                        1259    17338    sites_id_seq    SEQUENCE     �   CREATE SEQUENCE public.sites_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 #   DROP SEQUENCE public.sites_id_seq;
       public               postgres    false    217            :           0    0    sites_id_seq    SEQUENCE OWNED BY     =   ALTER SEQUENCE public.sites_id_seq OWNED BY public.sites.id;
          public               postgres    false    256                       1259    17339    subcontractors    TABLE     v  CREATE TABLE public.subcontractors (
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
 "   DROP TABLE public.subcontractors;
       public         heap r       postgres    false                       1259    17348    subcontractors_id_seq    SEQUENCE     �   CREATE SEQUENCE public.subcontractors_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 ,   DROP SEQUENCE public.subcontractors_id_seq;
       public               postgres    false    257            ;           0    0    subcontractors_id_seq    SEQUENCE OWNED BY     O   ALTER SEQUENCE public.subcontractors_id_seq OWNED BY public.subcontractors.id;
          public               postgres    false    258                       1259    17349    system_logs    TABLE     -  CREATE TABLE public.system_logs (
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
    DROP TABLE public.system_logs;
       public         heap r       postgres    false                       1259    17355    system_logs_id_seq    SEQUENCE     �   CREATE SEQUENCE public.system_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 )   DROP SEQUENCE public.system_logs_id_seq;
       public               postgres    false    259            <           0    0    system_logs_id_seq    SEQUENCE OWNED BY     I   ALTER SEQUENCE public.system_logs_id_seq OWNED BY public.system_logs.id;
          public               postgres    false    260                       1259    17356    team_members    TABLE     �   CREATE TABLE public.team_members (
    id integer NOT NULL,
    team_id integer,
    user_id integer,
    site_role public.site_role DEFAULT 'worker'::public.site_role,
    joined_at timestamp without time zone DEFAULT now()
);
     DROP TABLE public.team_members;
       public         heap r       postgres    false    950    950                       1259    17361    team_members_id_seq    SEQUENCE     �   CREATE SEQUENCE public.team_members_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 *   DROP SEQUENCE public.team_members_id_seq;
       public               postgres    false    261            =           0    0    team_members_id_seq    SEQUENCE OWNED BY     K   ALTER SEQUENCE public.team_members_id_seq OWNED BY public.team_members.id;
          public               postgres    false    262            �            1259    16551    teams    TABLE       CREATE TABLE public.teams (
    id integer NOT NULL,
    tenant_id integer,
    site_id integer,
    name character varying(255) NOT NULL,
    description text,
    leader_id integer,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now()
);
    DROP TABLE public.teams;
       public         heap r       postgres    false                       1259    17362    teams_id_seq    SEQUENCE     �   CREATE SEQUENCE public.teams_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 #   DROP SEQUENCE public.teams_id_seq;
       public               postgres    false    218            >           0    0    teams_id_seq    SEQUENCE OWNED BY     =   ALTER SEQUENCE public.teams_id_seq OWNED BY public.teams.id;
          public               postgres    false    263            �            1259    16498    tenants    TABLE     y  CREATE TABLE public.tenants (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    phone character varying(50),
    address text,
    subscription_plan public.subscription_plan DEFAULT 'basic'::public.subscription_plan,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now()
);
    DROP TABLE public.tenants;
       public         heap r       postgres    false    908    908                       1259    17363    tenants_id_seq    SEQUENCE     �   CREATE SEQUENCE public.tenants_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 %   DROP SEQUENCE public.tenants_id_seq;
       public               postgres    false    215            ?           0    0    tenants_id_seq    SEQUENCE OWNED BY     A   ALTER SEQUENCE public.tenants_id_seq OWNED BY public.tenants.id;
          public               postgres    false    264            	           1259    17364    training_content    TABLE       CREATE TABLE public.training_content (
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
 $   DROP TABLE public.training_content;
       public         heap r       postgres    false            
           1259    17374    training_content_id_seq    SEQUENCE     �   CREATE SEQUENCE public.training_content_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 .   DROP SEQUENCE public.training_content_id_seq;
       public               postgres    false    265            @           0    0    training_content_id_seq    SEQUENCE OWNED BY     S   ALTER SEQUENCE public.training_content_id_seq OWNED BY public.training_content.id;
          public               postgres    false    266            �            1259    16826    training_courses    TABLE     t  CREATE TABLE public.training_courses (
    id integer NOT NULL,
    tenant_id integer,
    title character varying(255) NOT NULL,
    description text,
    duration_minutes integer,
    required_roles text[],
    is_mandatory boolean DEFAULT false,
    expiry_months integer,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now()
);
 $   DROP TABLE public.training_courses;
       public         heap r       postgres    false                       1259    17375    training_courses_id_seq    SEQUENCE     �   CREATE SEQUENCE public.training_courses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 .   DROP SEQUENCE public.training_courses_id_seq;
       public               postgres    false    221            A           0    0    training_courses_id_seq    SEQUENCE OWNED BY     S   ALTER SEQUENCE public.training_courses_id_seq OWNED BY public.training_courses.id;
          public               postgres    false    267                       1259    17376    training_records    TABLE       CREATE TABLE public.training_records (
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
 $   DROP TABLE public.training_records;
       public         heap r       postgres    false                       1259    17385    training_records_id_seq    SEQUENCE     �   CREATE SEQUENCE public.training_records_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 .   DROP SEQUENCE public.training_records_id_seq;
       public               postgres    false    268            B           0    0    training_records_id_seq    SEQUENCE OWNED BY     S   ALTER SEQUENCE public.training_records_id_seq OWNED BY public.training_records.id;
          public               postgres    false    269                       1259    17386    user_sessions    TABLE     �   CREATE TABLE public.user_sessions (
    sid character varying NOT NULL,
    sess json NOT NULL,
    expire timestamp(6) without time zone NOT NULL
);
 !   DROP TABLE public.user_sessions;
       public         heap r       postgres    false            �            1259    16510    users    TABLE     a  CREATE TABLE public.users (
    id integer NOT NULL,
    tenant_id integer,
    username character varying(100) NOT NULL,
    email character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    first_name character varying(100),
    last_name character varying(100),
    phone character varying(50),
    role public.user_role DEFAULT 'employee'::public.user_role,
    is_active boolean DEFAULT true,
    last_login timestamp without time zone,
    created_at timestamp without time zone DEFAULT now(),
    emergency_contact character varying(255),
    safety_certification_expiry date
);
    DROP TABLE public.users;
       public         heap r       postgres    false    896    896                       1259    17391    users_id_seq    SEQUENCE     �   CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 #   DROP SEQUENCE public.users_id_seq;
       public               postgres    false    216            C           0    0    users_id_seq    SEQUENCE OWNED BY     =   ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;
          public               postgres    false    271            z           2604    17752    email_templates id    DEFAULT     x   ALTER TABLE ONLY public.email_templates ALTER COLUMN id SET DEFAULT nextval('public.email_templates_id_seq'::regclass);
 A   ALTER TABLE public.email_templates ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    224    223                       2604    17753    hazard_assignments id    DEFAULT     ~   ALTER TABLE ONLY public.hazard_assignments ALTER COLUMN id SET DEFAULT nextval('public.hazard_assignments_id_seq'::regclass);
 D   ALTER TABLE public.hazard_assignments ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    226    225            �           2604    17754    hazard_comments id    DEFAULT     x   ALTER TABLE ONLY public.hazard_comments ALTER COLUMN id SET DEFAULT nextval('public.hazard_comments_id_seq'::regclass);
 A   ALTER TABLE public.hazard_comments ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    228    227            i           2604    17755    hazard_reports id    DEFAULT     v   ALTER TABLE ONLY public.hazard_reports ALTER COLUMN id SET DEFAULT nextval('public.hazard_reports_id_seq'::regclass);
 @   ALTER TABLE public.hazard_reports ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    229    219            �           2604    17756    incident_reports id    DEFAULT     z   ALTER TABLE ONLY public.incident_reports ALTER COLUMN id SET DEFAULT nextval('public.incident_reports_id_seq'::regclass);
 B   ALTER TABLE public.incident_reports ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    231    230            �           2604    17757    inspection_checklist_items id    DEFAULT     �   ALTER TABLE ONLY public.inspection_checklist_items ALTER COLUMN id SET DEFAULT nextval('public.inspection_checklist_items_id_seq'::regclass);
 L   ALTER TABLE public.inspection_checklist_items ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    233    232            �           2604    17758    inspection_findings id    DEFAULT     �   ALTER TABLE ONLY public.inspection_findings ALTER COLUMN id SET DEFAULT nextval('public.inspection_findings_id_seq'::regclass);
 E   ALTER TABLE public.inspection_findings ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    235    234            u           2604    17759    inspection_items id    DEFAULT     z   ALTER TABLE ONLY public.inspection_items ALTER COLUMN id SET DEFAULT nextval('public.inspection_items_id_seq'::regclass);
 B   ALTER TABLE public.inspection_items ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    236    222            �           2604    17760    inspection_questions id    DEFAULT     �   ALTER TABLE ONLY public.inspection_questions ALTER COLUMN id SET DEFAULT nextval('public.inspection_questions_id_seq'::regclass);
 F   ALTER TABLE public.inspection_questions ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    238    237            �           2604    17761    inspection_responses id    DEFAULT     �   ALTER TABLE ONLY public.inspection_responses ALTER COLUMN id SET DEFAULT nextval('public.inspection_responses_id_seq'::regclass);
 F   ALTER TABLE public.inspection_responses ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    240    239            �           2604    17762    inspection_sections id    DEFAULT     �   ALTER TABLE ONLY public.inspection_sections ALTER COLUMN id SET DEFAULT nextval('public.inspection_sections_id_seq'::regclass);
 E   ALTER TABLE public.inspection_sections ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    242    241            �           2604    17763    inspection_templates id    DEFAULT     �   ALTER TABLE ONLY public.inspection_templates ALTER COLUMN id SET DEFAULT nextval('public.inspection_templates_id_seq'::regclass);
 F   ALTER TABLE public.inspection_templates ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    244    243            n           2604    17764    inspections id    DEFAULT     p   ALTER TABLE ONLY public.inspections ALTER COLUMN id SET DEFAULT nextval('public.inspections_id_seq'::regclass);
 =   ALTER TABLE public.inspections ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    245    220            �           2604    17765    migration_history id    DEFAULT     |   ALTER TABLE ONLY public.migration_history ALTER COLUMN id SET DEFAULT nextval('public.migration_history_id_seq'::regclass);
 C   ALTER TABLE public.migration_history ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    247    246            �           2604    17766    permit_requests id    DEFAULT     x   ALTER TABLE ONLY public.permit_requests ALTER COLUMN id SET DEFAULT nextval('public.permit_requests_id_seq'::regclass);
 A   ALTER TABLE public.permit_requests ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    249    248            �           2604    17767    report_history id    DEFAULT     v   ALTER TABLE ONLY public.report_history ALTER COLUMN id SET DEFAULT nextval('public.report_history_id_seq'::regclass);
 @   ALTER TABLE public.report_history ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    251    250            �           2604    17768    role_permissions id    DEFAULT     z   ALTER TABLE ONLY public.role_permissions ALTER COLUMN id SET DEFAULT nextval('public.role_permissions_id_seq'::regclass);
 B   ALTER TABLE public.role_permissions ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    253    252            �           2604    17769    site_personnel id    DEFAULT     v   ALTER TABLE ONLY public.site_personnel ALTER COLUMN id SET DEFAULT nextval('public.site_personnel_id_seq'::regclass);
 @   ALTER TABLE public.site_personnel ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    255    254            b           2604    17770    sites id    DEFAULT     d   ALTER TABLE ONLY public.sites ALTER COLUMN id SET DEFAULT nextval('public.sites_id_seq'::regclass);
 7   ALTER TABLE public.sites ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    256    217            �           2604    17771    subcontractors id    DEFAULT     v   ALTER TABLE ONLY public.subcontractors ALTER COLUMN id SET DEFAULT nextval('public.subcontractors_id_seq'::regclass);
 @   ALTER TABLE public.subcontractors ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    258    257            �           2604    17772    system_logs id    DEFAULT     p   ALTER TABLE ONLY public.system_logs ALTER COLUMN id SET DEFAULT nextval('public.system_logs_id_seq'::regclass);
 =   ALTER TABLE public.system_logs ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    260    259            �           2604    17773    team_members id    DEFAULT     r   ALTER TABLE ONLY public.team_members ALTER COLUMN id SET DEFAULT nextval('public.team_members_id_seq'::regclass);
 >   ALTER TABLE public.team_members ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    262    261            f           2604    17774    teams id    DEFAULT     d   ALTER TABLE ONLY public.teams ALTER COLUMN id SET DEFAULT nextval('public.teams_id_seq'::regclass);
 7   ALTER TABLE public.teams ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    263    218            Z           2604    17775 
   tenants id    DEFAULT     h   ALTER TABLE ONLY public.tenants ALTER COLUMN id SET DEFAULT nextval('public.tenants_id_seq'::regclass);
 9   ALTER TABLE public.tenants ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    264    215            �           2604    17776    training_content id    DEFAULT     z   ALTER TABLE ONLY public.training_content ALTER COLUMN id SET DEFAULT nextval('public.training_content_id_seq'::regclass);
 B   ALTER TABLE public.training_content ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    266    265            q           2604    17777    training_courses id    DEFAULT     z   ALTER TABLE ONLY public.training_courses ALTER COLUMN id SET DEFAULT nextval('public.training_courses_id_seq'::regclass);
 B   ALTER TABLE public.training_courses ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    267    221            �           2604    17778    training_records id    DEFAULT     z   ALTER TABLE ONLY public.training_records ALTER COLUMN id SET DEFAULT nextval('public.training_records_id_seq'::regclass);
 B   ALTER TABLE public.training_records ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    269    268            ^           2604    17779    users id    DEFAULT     d   ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);
 7   ALTER TABLE public.users ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    271    216            �          0    17191    email_templates 
   TABLE DATA           |   COPY public.email_templates (id, tenant_id, name, subject, body, is_default, created_at, updated_at, is_active) FROM stdin;
    public               postgres    false    223   ��      �          0    17201    hazard_assignments 
   TABLE DATA           �   COPY public.hazard_assignments (id, hazard_id, assigned_by_id, assigned_to_user_id, assigned_to_subcontractor_id, assigned_at, due_date, status, notes, created_at, updated_at, is_active) FROM stdin;
    public               postgres    false    225   Α      �          0    17212    hazard_comments 
   TABLE DATA           ~   COPY public.hazard_comments (id, hazard_id, user_id, comment, attachment_urls, created_at, updated_at, is_active) FROM stdin;
    public               postgres    false    227   +�      �          0    16598    hazard_reports 
   TABLE DATA           �   COPY public.hazard_reports (id, tenant_id, site_id, reporter_id, team_id, title, description, location, severity, status, photo_urls, priority_score, created_at, updated_at, weather_conditions) FROM stdin;
    public               postgres    false    219   M�      �          0    17222    incident_reports 
   TABLE DATA           L  COPY public.incident_reports (id, tenant_id, site_id, reported_by_id, title, description, incident_date, location, incident_type, severity, injury_occurred, injury_details, witnesses, root_cause, corrective_actions, preventative_measures, photo_urls, video_ids, document_urls, created_at, updated_at, is_active, status) FROM stdin;
    public               postgres    false    230   j�      �          0    17233    inspection_checklist_items 
   TABLE DATA           �   COPY public.inspection_checklist_items (id, template_id, category, question, description, expected_answer, is_critical, sort_order, created_at, updated_at, is_active) FROM stdin;
    public               postgres    false    232   ��      �          0    17245    inspection_findings 
   TABLE DATA           �   COPY public.inspection_findings (id, inspection_id, description, recommended_action, severity, priority, due_date, status, is_active, photo_urls, assigned_to_id, created_by_id, resolved_by_id, resolved_at, created_at, updated_at) FROM stdin;
    public               postgres    false    234   ��      �          0    16998    inspection_items 
   TABLE DATA           q   COPY public.inspection_items (id, section_id, item_text, item_type, is_required, item_order, points) FROM stdin;
    public               postgres    false    222   ��      �          0    17257    inspection_questions 
   TABLE DATA           �   COPY public.inspection_questions (id, template_id, question_text, question_type, options, is_required, order_index) FROM stdin;
    public               postgres    false    237   ��                0    17265    inspection_responses 
   TABLE DATA           �   COPY public.inspection_responses (id, inspection_id, checklist_item_id, response, photo_urls, is_compliant, notes, created_by_id, created_at, updated_at) FROM stdin;
    public               postgres    false    239   ��                0    17274    inspection_sections 
   TABLE DATA           r   COPY public.inspection_sections (id, template_id, name, description, "order", created_at, updated_at) FROM stdin;
    public               postgres    false    241   Z�                0    17283    inspection_templates 
   TABLE DATA           �   COPY public.inspection_templates (id, tenant_id, name, description, category, version, is_default, created_by_id, created_at, updated_at, is_active) FROM stdin;
    public               postgres    false    243   ��      �          0    16706    inspections 
   TABLE DATA           �   COPY public.inspections (id, tenant_id, site_id, template_id, inspector_id, team_id, title, status, scheduled_date, completed_date, notes, overall_score, created_at) FROM stdin;
    public               postgres    false    220   =�                0    17295    migration_history 
   TABLE DATA           U   COPY public.migration_history (id, migration_name, applied_at, checksum) FROM stdin;
    public               postgres    false    246   Z�      
          0    17300    permit_requests 
   TABLE DATA           �   COPY public.permit_requests (id, tenant_id, site_id, requester_id, approver_id, permit_type, title, description, location, start_date, end_date, status, approval_date, denial_reason, attachment_urls, created_at, updated_at, is_active) FROM stdin;
    public               postgres    false    248   �                0    17310    report_history 
   TABLE DATA           �   COPY public.report_history (id, tenant_id, user_id, site_id, start_date, end_date, created_at, report_name, report_url, status) FROM stdin;
    public               postgres    false    250   �                0    17318    role_permissions 
   TABLE DATA           t   COPY public.role_permissions (id, tenant_id, role, resource, action, created_at, updated_at, is_active) FROM stdin;
    public               postgres    false    252    �                0    17327    site_personnel 
   TABLE DATA           �   COPY public.site_personnel (id, site_id, user_id, tenant_id, site_role, assigned_by_id, start_date, end_date, permissions, team_id, notes, created_at, updated_at, is_active) FROM stdin;
    public               postgres    false    254   �      �          0    16529    sites 
   TABLE DATA           �   COPY public.sites (id, tenant_id, name, address, city, state, zip_code, country, site_manager_id, is_active, created_at) FROM stdin;
    public               postgres    false    217   ��                0    17339    subcontractors 
   TABLE DATA           �   COPY public.subcontractors (id, tenant_id, name, contact_person, email, phone, address, city, state, zip_code, country, contract_number, contract_start_date, contract_end_date, services_provided, status, created_at, updated_at, is_active) FROM stdin;
    public               postgres    false    257   ��                0    17349    system_logs 
   TABLE DATA           �   COPY public.system_logs (id, tenant_id, user_id, action, entity_type, entity_id, details, ip_address, user_agent, created_at) FROM stdin;
    public               postgres    false    259   ޡ                0    17356    team_members 
   TABLE DATA           R   COPY public.team_members (id, team_id, user_id, site_role, joined_at) FROM stdin;
    public               postgres    false    261   ��      �          0    16551    teams 
   TABLE DATA           l   COPY public.teams (id, tenant_id, site_id, name, description, leader_id, is_active, created_at) FROM stdin;
    public               postgres    false    218   ��      �          0    16498    tenants 
   TABLE DATA           l   COPY public.tenants (id, name, email, phone, address, subscription_plan, is_active, created_at) FROM stdin;
    public               postgres    false    215   ®                0    17364    training_content 
   TABLE DATA           �   COPY public.training_content (id, tenant_id, title, description, content_type, video_id, document_url, language, duration, is_common, created_by_id, created_at, updated_at, is_active) FROM stdin;
    public               postgres    false    265   ߮      �          0    16826    training_courses 
   TABLE DATA           �   COPY public.training_courses (id, tenant_id, title, description, duration_minutes, required_roles, is_mandatory, expiry_months, is_active, created_at) FROM stdin;
    public               postgres    false    221   ��                0    17376    training_records 
   TABLE DATA           �   COPY public.training_records (id, tenant_id, user_id, course_id, start_date, completion_date, score, passed, certificate_url, created_at, updated_at, is_active) FROM stdin;
    public               postgres    false    268   �                 0    17386    user_sessions 
   TABLE DATA           :   COPY public.user_sessions (sid, sess, expire) FROM stdin;
    public               postgres    false    270   6�      �          0    16510    users 
   TABLE DATA           �   COPY public.users (id, tenant_id, username, email, password, first_name, last_name, phone, role, is_active, last_login, created_at, emergency_contact, safety_certification_expiry) FROM stdin;
    public               postgres    false    216   L�      D           0    0    email_templates_id_seq    SEQUENCE SET     E   SELECT pg_catalog.setval('public.email_templates_id_seq', 1, false);
          public               postgres    false    224            E           0    0    hazard_assignments_id_seq    SEQUENCE SET     G   SELECT pg_catalog.setval('public.hazard_assignments_id_seq', 6, true);
          public               postgres    false    226            F           0    0    hazard_comments_id_seq    SEQUENCE SET     E   SELECT pg_catalog.setval('public.hazard_comments_id_seq', 10, true);
          public               postgres    false    228            G           0    0    hazard_reports_id_seq    SEQUENCE SET     D   SELECT pg_catalog.setval('public.hazard_reports_id_seq', 10, true);
          public               postgres    false    229            H           0    0    incident_reports_id_seq    SEQUENCE SET     F   SELECT pg_catalog.setval('public.incident_reports_id_seq', 33, true);
          public               postgres    false    231            I           0    0 !   inspection_checklist_items_id_seq    SEQUENCE SET     P   SELECT pg_catalog.setval('public.inspection_checklist_items_id_seq', 1, false);
          public               postgres    false    233            J           0    0    inspection_findings_id_seq    SEQUENCE SET     H   SELECT pg_catalog.setval('public.inspection_findings_id_seq', 6, true);
          public               postgres    false    235            K           0    0    inspection_items_id_seq    SEQUENCE SET     F   SELECT pg_catalog.setval('public.inspection_items_id_seq', 32, true);
          public               postgres    false    236            L           0    0    inspection_questions_id_seq    SEQUENCE SET     J   SELECT pg_catalog.setval('public.inspection_questions_id_seq', 1, false);
          public               postgres    false    238            M           0    0    inspection_responses_id_seq    SEQUENCE SET     I   SELECT pg_catalog.setval('public.inspection_responses_id_seq', 4, true);
          public               postgres    false    240            N           0    0    inspection_sections_id_seq    SEQUENCE SET     I   SELECT pg_catalog.setval('public.inspection_sections_id_seq', 33, true);
          public               postgres    false    242            O           0    0    inspection_templates_id_seq    SEQUENCE SET     J   SELECT pg_catalog.setval('public.inspection_templates_id_seq', 16, true);
          public               postgres    false    244            P           0    0    inspections_id_seq    SEQUENCE SET     A   SELECT pg_catalog.setval('public.inspections_id_seq', 22, true);
          public               postgres    false    245            Q           0    0    migration_history_id_seq    SEQUENCE SET     F   SELECT pg_catalog.setval('public.migration_history_id_seq', 8, true);
          public               postgres    false    247            R           0    0    permit_requests_id_seq    SEQUENCE SET     E   SELECT pg_catalog.setval('public.permit_requests_id_seq', 18, true);
          public               postgres    false    249            S           0    0    report_history_id_seq    SEQUENCE SET     D   SELECT pg_catalog.setval('public.report_history_id_seq', 1, false);
          public               postgres    false    251            T           0    0    role_permissions_id_seq    SEQUENCE SET     F   SELECT pg_catalog.setval('public.role_permissions_id_seq', 11, true);
          public               postgres    false    253            U           0    0    site_personnel_id_seq    SEQUENCE SET     C   SELECT pg_catalog.setval('public.site_personnel_id_seq', 5, true);
          public               postgres    false    255            V           0    0    sites_id_seq    SEQUENCE SET     ;   SELECT pg_catalog.setval('public.sites_id_seq', 12, true);
          public               postgres    false    256            W           0    0    subcontractors_id_seq    SEQUENCE SET     D   SELECT pg_catalog.setval('public.subcontractors_id_seq', 1, false);
          public               postgres    false    258            X           0    0    system_logs_id_seq    SEQUENCE SET     B   SELECT pg_catalog.setval('public.system_logs_id_seq', 132, true);
          public               postgres    false    260            Y           0    0    team_members_id_seq    SEQUENCE SET     B   SELECT pg_catalog.setval('public.team_members_id_seq', 1, false);
          public               postgres    false    262            Z           0    0    teams_id_seq    SEQUENCE SET     :   SELECT pg_catalog.setval('public.teams_id_seq', 2, true);
          public               postgres    false    263            [           0    0    tenants_id_seq    SEQUENCE SET     <   SELECT pg_catalog.setval('public.tenants_id_seq', 2, true);
          public               postgres    false    264            \           0    0    training_content_id_seq    SEQUENCE SET     F   SELECT pg_catalog.setval('public.training_content_id_seq', 25, true);
          public               postgres    false    266            ]           0    0    training_courses_id_seq    SEQUENCE SET     F   SELECT pg_catalog.setval('public.training_courses_id_seq', 25, true);
          public               postgres    false    267            ^           0    0    training_records_id_seq    SEQUENCE SET     G   SELECT pg_catalog.setval('public.training_records_id_seq', 125, true);
          public               postgres    false    269            _           0    0    users_id_seq    SEQUENCE SET     ;   SELECT pg_catalog.setval('public.users_id_seq', 19, true);
          public               postgres    false    271            �           2606    17421 $   email_templates email_templates_pkey 
   CONSTRAINT     b   ALTER TABLE ONLY public.email_templates
    ADD CONSTRAINT email_templates_pkey PRIMARY KEY (id);
 N   ALTER TABLE ONLY public.email_templates DROP CONSTRAINT email_templates_pkey;
       public                 postgres    false    223            �           2606    17423 *   hazard_assignments hazard_assignments_pkey 
   CONSTRAINT     h   ALTER TABLE ONLY public.hazard_assignments
    ADD CONSTRAINT hazard_assignments_pkey PRIMARY KEY (id);
 T   ALTER TABLE ONLY public.hazard_assignments DROP CONSTRAINT hazard_assignments_pkey;
       public                 postgres    false    225            �           2606    17425 $   hazard_comments hazard_comments_pkey 
   CONSTRAINT     b   ALTER TABLE ONLY public.hazard_comments
    ADD CONSTRAINT hazard_comments_pkey PRIMARY KEY (id);
 N   ALTER TABLE ONLY public.hazard_comments DROP CONSTRAINT hazard_comments_pkey;
       public                 postgres    false    227            �           2606    16609 "   hazard_reports hazard_reports_pkey 
   CONSTRAINT     `   ALTER TABLE ONLY public.hazard_reports
    ADD CONSTRAINT hazard_reports_pkey PRIMARY KEY (id);
 L   ALTER TABLE ONLY public.hazard_reports DROP CONSTRAINT hazard_reports_pkey;
       public                 postgres    false    219            �           2606    17427 &   incident_reports incident_reports_pkey 
   CONSTRAINT     d   ALTER TABLE ONLY public.incident_reports
    ADD CONSTRAINT incident_reports_pkey PRIMARY KEY (id);
 P   ALTER TABLE ONLY public.incident_reports DROP CONSTRAINT incident_reports_pkey;
       public                 postgres    false    230            �           2606    17429 :   inspection_checklist_items inspection_checklist_items_pkey 
   CONSTRAINT     x   ALTER TABLE ONLY public.inspection_checklist_items
    ADD CONSTRAINT inspection_checklist_items_pkey PRIMARY KEY (id);
 d   ALTER TABLE ONLY public.inspection_checklist_items DROP CONSTRAINT inspection_checklist_items_pkey;
       public                 postgres    false    232                        2606    17431 ,   inspection_findings inspection_findings_pkey 
   CONSTRAINT     j   ALTER TABLE ONLY public.inspection_findings
    ADD CONSTRAINT inspection_findings_pkey PRIMARY KEY (id);
 V   ALTER TABLE ONLY public.inspection_findings DROP CONSTRAINT inspection_findings_pkey;
       public                 postgres    false    234            �           2606    17009 &   inspection_items inspection_items_pkey 
   CONSTRAINT     d   ALTER TABLE ONLY public.inspection_items
    ADD CONSTRAINT inspection_items_pkey PRIMARY KEY (id);
 P   ALTER TABLE ONLY public.inspection_items DROP CONSTRAINT inspection_items_pkey;
       public                 postgres    false    222                       2606    17433 .   inspection_questions inspection_questions_pkey 
   CONSTRAINT     l   ALTER TABLE ONLY public.inspection_questions
    ADD CONSTRAINT inspection_questions_pkey PRIMARY KEY (id);
 X   ALTER TABLE ONLY public.inspection_questions DROP CONSTRAINT inspection_questions_pkey;
       public                 postgres    false    237                       2606    17435 .   inspection_responses inspection_responses_pkey 
   CONSTRAINT     l   ALTER TABLE ONLY public.inspection_responses
    ADD CONSTRAINT inspection_responses_pkey PRIMARY KEY (id);
 X   ALTER TABLE ONLY public.inspection_responses DROP CONSTRAINT inspection_responses_pkey;
       public                 postgres    false    239                       2606    17437 ,   inspection_sections inspection_sections_pkey 
   CONSTRAINT     j   ALTER TABLE ONLY public.inspection_sections
    ADD CONSTRAINT inspection_sections_pkey PRIMARY KEY (id);
 V   ALTER TABLE ONLY public.inspection_sections DROP CONSTRAINT inspection_sections_pkey;
       public                 postgres    false    241            	           2606    17439 .   inspection_templates inspection_templates_pkey 
   CONSTRAINT     l   ALTER TABLE ONLY public.inspection_templates
    ADD CONSTRAINT inspection_templates_pkey PRIMARY KEY (id);
 X   ALTER TABLE ONLY public.inspection_templates DROP CONSTRAINT inspection_templates_pkey;
       public                 postgres    false    243            �           2606    16715    inspections inspections_pkey 
   CONSTRAINT     Z   ALTER TABLE ONLY public.inspections
    ADD CONSTRAINT inspections_pkey PRIMARY KEY (id);
 F   ALTER TABLE ONLY public.inspections DROP CONSTRAINT inspections_pkey;
       public                 postgres    false    220                       2606    17441 6   migration_history migration_history_migration_name_key 
   CONSTRAINT     {   ALTER TABLE ONLY public.migration_history
    ADD CONSTRAINT migration_history_migration_name_key UNIQUE (migration_name);
 `   ALTER TABLE ONLY public.migration_history DROP CONSTRAINT migration_history_migration_name_key;
       public                 postgres    false    246                       2606    17443 (   migration_history migration_history_pkey 
   CONSTRAINT     f   ALTER TABLE ONLY public.migration_history
    ADD CONSTRAINT migration_history_pkey PRIMARY KEY (id);
 R   ALTER TABLE ONLY public.migration_history DROP CONSTRAINT migration_history_pkey;
       public                 postgres    false    246                       2606    17445 $   permit_requests permit_requests_pkey 
   CONSTRAINT     b   ALTER TABLE ONLY public.permit_requests
    ADD CONSTRAINT permit_requests_pkey PRIMARY KEY (id);
 N   ALTER TABLE ONLY public.permit_requests DROP CONSTRAINT permit_requests_pkey;
       public                 postgres    false    248                       2606    17447 "   report_history report_history_pkey 
   CONSTRAINT     `   ALTER TABLE ONLY public.report_history
    ADD CONSTRAINT report_history_pkey PRIMARY KEY (id);
 L   ALTER TABLE ONLY public.report_history DROP CONSTRAINT report_history_pkey;
       public                 postgres    false    250                       2606    17449 &   role_permissions role_permissions_pkey 
   CONSTRAINT     d   ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_pkey PRIMARY KEY (id);
 P   ALTER TABLE ONLY public.role_permissions DROP CONSTRAINT role_permissions_pkey;
       public                 postgres    false    252            *           2606    17451    user_sessions session_pkey 
   CONSTRAINT     Y   ALTER TABLE ONLY public.user_sessions
    ADD CONSTRAINT session_pkey PRIMARY KEY (sid);
 D   ALTER TABLE ONLY public.user_sessions DROP CONSTRAINT session_pkey;
       public                 postgres    false    270                       2606    17453 "   site_personnel site_personnel_pkey 
   CONSTRAINT     `   ALTER TABLE ONLY public.site_personnel
    ADD CONSTRAINT site_personnel_pkey PRIMARY KEY (id);
 L   ALTER TABLE ONLY public.site_personnel DROP CONSTRAINT site_personnel_pkey;
       public                 postgres    false    254            �           2606    16539    sites sites_pkey 
   CONSTRAINT     N   ALTER TABLE ONLY public.sites
    ADD CONSTRAINT sites_pkey PRIMARY KEY (id);
 :   ALTER TABLE ONLY public.sites DROP CONSTRAINT sites_pkey;
       public                 postgres    false    217                       2606    17455 "   subcontractors subcontractors_pkey 
   CONSTRAINT     `   ALTER TABLE ONLY public.subcontractors
    ADD CONSTRAINT subcontractors_pkey PRIMARY KEY (id);
 L   ALTER TABLE ONLY public.subcontractors DROP CONSTRAINT subcontractors_pkey;
       public                 postgres    false    257                       2606    17457    system_logs system_logs_pkey 
   CONSTRAINT     Z   ALTER TABLE ONLY public.system_logs
    ADD CONSTRAINT system_logs_pkey PRIMARY KEY (id);
 F   ALTER TABLE ONLY public.system_logs DROP CONSTRAINT system_logs_pkey;
       public                 postgres    false    259                        2606    17459    team_members team_members_pkey 
   CONSTRAINT     \   ALTER TABLE ONLY public.team_members
    ADD CONSTRAINT team_members_pkey PRIMARY KEY (id);
 H   ALTER TABLE ONLY public.team_members DROP CONSTRAINT team_members_pkey;
       public                 postgres    false    261            "           2606    17461 -   team_members team_members_team_id_user_id_key 
   CONSTRAINT     t   ALTER TABLE ONLY public.team_members
    ADD CONSTRAINT team_members_team_id_user_id_key UNIQUE (team_id, user_id);
 W   ALTER TABLE ONLY public.team_members DROP CONSTRAINT team_members_team_id_user_id_key;
       public                 postgres    false    261    261            �           2606    16560    teams teams_pkey 
   CONSTRAINT     N   ALTER TABLE ONLY public.teams
    ADD CONSTRAINT teams_pkey PRIMARY KEY (id);
 :   ALTER TABLE ONLY public.teams DROP CONSTRAINT teams_pkey;
       public                 postgres    false    218            �           2606    17463    tenants tenants_email_unique 
   CONSTRAINT     X   ALTER TABLE ONLY public.tenants
    ADD CONSTRAINT tenants_email_unique UNIQUE (email);
 F   ALTER TABLE ONLY public.tenants DROP CONSTRAINT tenants_email_unique;
       public                 postgres    false    215            �           2606    16508    tenants tenants_pkey 
   CONSTRAINT     R   ALTER TABLE ONLY public.tenants
    ADD CONSTRAINT tenants_pkey PRIMARY KEY (id);
 >   ALTER TABLE ONLY public.tenants DROP CONSTRAINT tenants_pkey;
       public                 postgres    false    215            $           2606    17465 &   training_content training_content_pkey 
   CONSTRAINT     d   ALTER TABLE ONLY public.training_content
    ADD CONSTRAINT training_content_pkey PRIMARY KEY (id);
 P   ALTER TABLE ONLY public.training_content DROP CONSTRAINT training_content_pkey;
       public                 postgres    false    265            �           2606    16836 &   training_courses training_courses_pkey 
   CONSTRAINT     d   ALTER TABLE ONLY public.training_courses
    ADD CONSTRAINT training_courses_pkey PRIMARY KEY (id);
 P   ALTER TABLE ONLY public.training_courses DROP CONSTRAINT training_courses_pkey;
       public                 postgres    false    221            '           2606    17467 &   training_records training_records_pkey 
   CONSTRAINT     d   ALTER TABLE ONLY public.training_records
    ADD CONSTRAINT training_records_pkey PRIMARY KEY (id);
 P   ALTER TABLE ONLY public.training_records DROP CONSTRAINT training_records_pkey;
       public                 postgres    false    268            �           2606    17469    users users_email_unique 
   CONSTRAINT     T   ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);
 B   ALTER TABLE ONLY public.users DROP CONSTRAINT users_email_unique;
       public                 postgres    false    216            �           2606    16520    users users_pkey 
   CONSTRAINT     N   ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);
 :   ALTER TABLE ONLY public.users DROP CONSTRAINT users_pkey;
       public                 postgres    false    216            �           2606    16522    users users_username_key 
   CONSTRAINT     W   ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);
 B   ALTER TABLE ONLY public.users DROP CONSTRAINT users_username_key;
       public                 postgres    false    216            (           1259    17470    IDX_session_expire    INDEX     P   CREATE INDEX "IDX_session_expire" ON public.user_sessions USING btree (expire);
 (   DROP INDEX public."IDX_session_expire";
       public                 postgres    false    270            �           1259    17471    idx_email_templates_tenant    INDEX     [   CREATE INDEX idx_email_templates_tenant ON public.email_templates USING btree (tenant_id);
 .   DROP INDEX public.idx_email_templates_tenant;
       public                 postgres    false    223            �           1259    17472    idx_hazard_reports_status    INDEX     V   CREATE INDEX idx_hazard_reports_status ON public.hazard_reports USING btree (status);
 -   DROP INDEX public.idx_hazard_reports_status;
       public                 postgres    false    219            �           1259    17473    idx_hazard_reports_tenant_site    INDEX     g   CREATE INDEX idx_hazard_reports_tenant_site ON public.hazard_reports USING btree (tenant_id, site_id);
 2   DROP INDEX public.idx_hazard_reports_tenant_site;
       public                 postgres    false    219    219            �           1259    17474     idx_incident_reports_tenant_site    INDEX     k   CREATE INDEX idx_incident_reports_tenant_site ON public.incident_reports USING btree (tenant_id, site_id);
 4   DROP INDEX public.idx_incident_reports_tenant_site;
       public                 postgres    false    230    230            �           1259    17107    idx_inspection_items_section    INDEX     _   CREATE INDEX idx_inspection_items_section ON public.inspection_items USING btree (section_id);
 0   DROP INDEX public.idx_inspection_items_section;
       public                 postgres    false    222                       1259    17475 !   idx_inspection_questions_template    INDEX     i   CREATE INDEX idx_inspection_questions_template ON public.inspection_questions USING btree (template_id);
 5   DROP INDEX public.idx_inspection_questions_template;
       public                 postgres    false    237            �           1259    17476    idx_inspections_tenant_site    INDEX     a   CREATE INDEX idx_inspections_tenant_site ON public.inspections USING btree (tenant_id, site_id);
 /   DROP INDEX public.idx_inspections_tenant_site;
       public                 postgres    false    220    220                       1259    17477    idx_permit_requests_tenant_site    INDEX     i   CREATE INDEX idx_permit_requests_tenant_site ON public.permit_requests USING btree (tenant_id, site_id);
 3   DROP INDEX public.idx_permit_requests_tenant_site;
       public                 postgres    false    248    248                       1259    17478     idx_role_permissions_tenant_role    INDEX     h   CREATE INDEX idx_role_permissions_tenant_role ON public.role_permissions USING btree (tenant_id, role);
 4   DROP INDEX public.idx_role_permissions_tenant_role;
       public                 postgres    false    252    252            �           1259    17479    idx_sites_tenant_id    INDEX     J   CREATE INDEX idx_sites_tenant_id ON public.sites USING btree (tenant_id);
 '   DROP INDEX public.idx_sites_tenant_id;
       public                 postgres    false    217                       1259    17480    idx_system_logs_created_at    INDEX     X   CREATE INDEX idx_system_logs_created_at ON public.system_logs USING btree (created_at);
 .   DROP INDEX public.idx_system_logs_created_at;
       public                 postgres    false    259                       1259    17481    idx_system_logs_tenant_user    INDEX     a   CREATE INDEX idx_system_logs_tenant_user ON public.system_logs USING btree (tenant_id, user_id);
 /   DROP INDEX public.idx_system_logs_tenant_user;
       public                 postgres    false    259    259                       1259    17482    idx_team_members_team_user    INDEX     _   CREATE INDEX idx_team_members_team_user ON public.team_members USING btree (team_id, user_id);
 .   DROP INDEX public.idx_team_members_team_user;
       public                 postgres    false    261    261            %           1259    17483    idx_training_records_user    INDEX     Y   CREATE INDEX idx_training_records_user ON public.training_records USING btree (user_id);
 -   DROP INDEX public.idx_training_records_user;
       public                 postgres    false    268            �           1259    17484    idx_users_certification_expiry    INDEX     �   CREATE INDEX idx_users_certification_expiry ON public.users USING btree (safety_certification_expiry) WHERE (safety_certification_expiry IS NOT NULL);
 2   DROP INDEX public.idx_users_certification_expiry;
       public                 postgres    false    216    216            �           1259    17485    idx_users_tenant_id    INDEX     J   CREATE INDEX idx_users_tenant_id ON public.users USING btree (tenant_id);
 '   DROP INDEX public.idx_users_tenant_id;
       public                 postgres    false    216            D           2606    17486 7   email_templates email_templates_tenant_id_tenants_id_fk    FK CONSTRAINT     �   ALTER TABLE ONLY public.email_templates
    ADD CONSTRAINT email_templates_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);
 a   ALTER TABLE ONLY public.email_templates DROP CONSTRAINT email_templates_tenant_id_tenants_id_fk;
       public               postgres    false    215    3545    223            E           2606    17496 R   hazard_assignments hazard_assignments_assigned_to_subcontractor_id_subcontractors_    FK CONSTRAINT     �   ALTER TABLE ONLY public.hazard_assignments
    ADD CONSTRAINT hazard_assignments_assigned_to_subcontractor_id_subcontractors_ FOREIGN KEY (assigned_to_subcontractor_id) REFERENCES public.subcontractors(id);
 |   ALTER TABLE ONLY public.hazard_assignments DROP CONSTRAINT hazard_assignments_assigned_to_subcontractor_id_subcontractors_;
       public               postgres    false    3609    257    225            3           2606    16620 .   hazard_reports hazard_reports_reporter_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.hazard_reports
    ADD CONSTRAINT hazard_reports_reporter_id_fkey FOREIGN KEY (reporter_id) REFERENCES public.users(id);
 X   ALTER TABLE ONLY public.hazard_reports DROP CONSTRAINT hazard_reports_reporter_id_fkey;
       public               postgres    false    219    216    3551            4           2606    16615 *   hazard_reports hazard_reports_site_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.hazard_reports
    ADD CONSTRAINT hazard_reports_site_id_fkey FOREIGN KEY (site_id) REFERENCES public.sites(id) ON DELETE CASCADE;
 T   ALTER TABLE ONLY public.hazard_reports DROP CONSTRAINT hazard_reports_site_id_fkey;
       public               postgres    false    219    217    3556            5           2606    17521 1   hazard_reports hazard_reports_site_id_sites_id_fk    FK CONSTRAINT     �   ALTER TABLE ONLY public.hazard_reports
    ADD CONSTRAINT hazard_reports_site_id_sites_id_fk FOREIGN KEY (site_id) REFERENCES public.sites(id) ON DELETE CASCADE;
 [   ALTER TABLE ONLY public.hazard_reports DROP CONSTRAINT hazard_reports_site_id_sites_id_fk;
       public               postgres    false    219    3556    217            6           2606    16625 *   hazard_reports hazard_reports_team_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.hazard_reports
    ADD CONSTRAINT hazard_reports_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id);
 T   ALTER TABLE ONLY public.hazard_reports DROP CONSTRAINT hazard_reports_team_id_fkey;
       public               postgres    false    219    218    3558            7           2606    16610 ,   hazard_reports hazard_reports_tenant_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.hazard_reports
    ADD CONSTRAINT hazard_reports_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;
 V   ALTER TABLE ONLY public.hazard_reports DROP CONSTRAINT hazard_reports_tenant_id_fkey;
       public               postgres    false    3545    215    219            8           2606    17526 5   hazard_reports hazard_reports_tenant_id_tenants_id_fk    FK CONSTRAINT     �   ALTER TABLE ONLY public.hazard_reports
    ADD CONSTRAINT hazard_reports_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;
 _   ALTER TABLE ONLY public.hazard_reports DROP CONSTRAINT hazard_reports_tenant_id_tenants_id_fk;
       public               postgres    false    219    215    3545            F           2606    17531 <   incident_reports incident_reports_reported_by_id_users_id_fk    FK CONSTRAINT     �   ALTER TABLE ONLY public.incident_reports
    ADD CONSTRAINT incident_reports_reported_by_id_users_id_fk FOREIGN KEY (reported_by_id) REFERENCES public.users(id);
 f   ALTER TABLE ONLY public.incident_reports DROP CONSTRAINT incident_reports_reported_by_id_users_id_fk;
       public               postgres    false    3551    230    216            G           2606    17536 5   incident_reports incident_reports_site_id_sites_id_fk    FK CONSTRAINT     �   ALTER TABLE ONLY public.incident_reports
    ADD CONSTRAINT incident_reports_site_id_sites_id_fk FOREIGN KEY (site_id) REFERENCES public.sites(id) ON DELETE CASCADE;
 _   ALTER TABLE ONLY public.incident_reports DROP CONSTRAINT incident_reports_site_id_sites_id_fk;
       public               postgres    false    230    217    3556            H           2606    17541 9   incident_reports incident_reports_tenant_id_tenants_id_fk    FK CONSTRAINT     �   ALTER TABLE ONLY public.incident_reports
    ADD CONSTRAINT incident_reports_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;
 c   ALTER TABLE ONLY public.incident_reports DROP CONSTRAINT incident_reports_tenant_id_tenants_id_fk;
       public               postgres    false    230    3545    215            I           2606    17546 F   inspection_checklist_items inspection_checklist_items_template_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.inspection_checklist_items
    ADD CONSTRAINT inspection_checklist_items_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.inspection_templates(id) ON DELETE CASCADE;
 p   ALTER TABLE ONLY public.inspection_checklist_items DROP CONSTRAINT inspection_checklist_items_template_id_fkey;
       public               postgres    false    243    232    3593            J           2606    17551 ;   inspection_findings inspection_findings_assigned_to_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.inspection_findings
    ADD CONSTRAINT inspection_findings_assigned_to_id_fkey FOREIGN KEY (assigned_to_id) REFERENCES public.users(id);
 e   ALTER TABLE ONLY public.inspection_findings DROP CONSTRAINT inspection_findings_assigned_to_id_fkey;
       public               postgres    false    3551    234    216            K           2606    17566 ;   inspection_findings inspection_findings_resolved_by_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.inspection_findings
    ADD CONSTRAINT inspection_findings_resolved_by_id_fkey FOREIGN KEY (resolved_by_id) REFERENCES public.users(id);
 e   ALTER TABLE ONLY public.inspection_findings DROP CONSTRAINT inspection_findings_resolved_by_id_fkey;
       public               postgres    false    234    216    3551            C           2606    17571 1   inspection_items inspection_items_section_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.inspection_items
    ADD CONSTRAINT inspection_items_section_id_fkey FOREIGN KEY (section_id) REFERENCES public.inspection_sections(id) ON DELETE CASCADE;
 [   ALTER TABLE ONLY public.inspection_items DROP CONSTRAINT inspection_items_section_id_fkey;
       public               postgres    false    241    3591    222            L           2606    17576 :   inspection_questions inspection_questions_template_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.inspection_questions
    ADD CONSTRAINT inspection_questions_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.inspection_templates(id) ON DELETE CASCADE;
 d   ALTER TABLE ONLY public.inspection_questions DROP CONSTRAINT inspection_questions_template_id_fkey;
       public               postgres    false    237    243    3593            M           2606    17591 8   inspection_sections inspection_sections_template_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.inspection_sections
    ADD CONSTRAINT inspection_sections_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.inspection_templates(id) ON DELETE CASCADE;
 b   ALTER TABLE ONLY public.inspection_sections DROP CONSTRAINT inspection_sections_template_id_fkey;
       public               postgres    false    243    241    3593            9           2606    16731 )   inspections inspections_inspector_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.inspections
    ADD CONSTRAINT inspections_inspector_id_fkey FOREIGN KEY (inspector_id) REFERENCES public.users(id);
 S   ALTER TABLE ONLY public.inspections DROP CONSTRAINT inspections_inspector_id_fkey;
       public               postgres    false    3551    216    220            :           2606    17606 0   inspections inspections_inspector_id_users_id_fk    FK CONSTRAINT     �   ALTER TABLE ONLY public.inspections
    ADD CONSTRAINT inspections_inspector_id_users_id_fk FOREIGN KEY (inspector_id) REFERENCES public.users(id);
 Z   ALTER TABLE ONLY public.inspections DROP CONSTRAINT inspections_inspector_id_users_id_fk;
       public               postgres    false    3551    216    220            ;           2606    16721 $   inspections inspections_site_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.inspections
    ADD CONSTRAINT inspections_site_id_fkey FOREIGN KEY (site_id) REFERENCES public.sites(id) ON DELETE CASCADE;
 N   ALTER TABLE ONLY public.inspections DROP CONSTRAINT inspections_site_id_fkey;
       public               postgres    false    3556    220    217            <           2606    17611 +   inspections inspections_site_id_sites_id_fk    FK CONSTRAINT     �   ALTER TABLE ONLY public.inspections
    ADD CONSTRAINT inspections_site_id_sites_id_fk FOREIGN KEY (site_id) REFERENCES public.sites(id) ON DELETE CASCADE;
 U   ALTER TABLE ONLY public.inspections DROP CONSTRAINT inspections_site_id_sites_id_fk;
       public               postgres    false    3556    217    220            =           2606    16736 $   inspections inspections_team_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.inspections
    ADD CONSTRAINT inspections_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id);
 N   ALTER TABLE ONLY public.inspections DROP CONSTRAINT inspections_team_id_fkey;
       public               postgres    false    3558    218    220            >           2606    17616 (   inspections inspections_template_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.inspections
    ADD CONSTRAINT inspections_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.inspection_templates(id);
 R   ALTER TABLE ONLY public.inspections DROP CONSTRAINT inspections_template_id_fkey;
       public               postgres    false    243    3593    220            ?           2606    16716 &   inspections inspections_tenant_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.inspections
    ADD CONSTRAINT inspections_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;
 P   ALTER TABLE ONLY public.inspections DROP CONSTRAINT inspections_tenant_id_fkey;
       public               postgres    false    220    215    3545            @           2606    17621 /   inspections inspections_tenant_id_tenants_id_fk    FK CONSTRAINT     �   ALTER TABLE ONLY public.inspections
    ADD CONSTRAINT inspections_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;
 Y   ALTER TABLE ONLY public.inspections DROP CONSTRAINT inspections_tenant_id_tenants_id_fk;
       public               postgres    false    3545    220    215            N           2606    17626 7   permit_requests permit_requests_approver_id_users_id_fk    FK CONSTRAINT     �   ALTER TABLE ONLY public.permit_requests
    ADD CONSTRAINT permit_requests_approver_id_users_id_fk FOREIGN KEY (approver_id) REFERENCES public.users(id);
 a   ALTER TABLE ONLY public.permit_requests DROP CONSTRAINT permit_requests_approver_id_users_id_fk;
       public               postgres    false    3551    216    248            O           2606    17631 8   permit_requests permit_requests_requester_id_users_id_fk    FK CONSTRAINT     �   ALTER TABLE ONLY public.permit_requests
    ADD CONSTRAINT permit_requests_requester_id_users_id_fk FOREIGN KEY (requester_id) REFERENCES public.users(id);
 b   ALTER TABLE ONLY public.permit_requests DROP CONSTRAINT permit_requests_requester_id_users_id_fk;
       public               postgres    false    216    3551    248            P           2606    17636 3   permit_requests permit_requests_site_id_sites_id_fk    FK CONSTRAINT     �   ALTER TABLE ONLY public.permit_requests
    ADD CONSTRAINT permit_requests_site_id_sites_id_fk FOREIGN KEY (site_id) REFERENCES public.sites(id) ON DELETE CASCADE;
 ]   ALTER TABLE ONLY public.permit_requests DROP CONSTRAINT permit_requests_site_id_sites_id_fk;
       public               postgres    false    3556    248    217            Q           2606    17641 7   permit_requests permit_requests_tenant_id_tenants_id_fk    FK CONSTRAINT     �   ALTER TABLE ONLY public.permit_requests
    ADD CONSTRAINT permit_requests_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;
 a   ALTER TABLE ONLY public.permit_requests DROP CONSTRAINT permit_requests_tenant_id_tenants_id_fk;
       public               postgres    false    3545    248    215            -           2606    16545     sites sites_site_manager_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.sites
    ADD CONSTRAINT sites_site_manager_id_fkey FOREIGN KEY (site_manager_id) REFERENCES public.users(id);
 J   ALTER TABLE ONLY public.sites DROP CONSTRAINT sites_site_manager_id_fkey;
       public               postgres    false    217    3551    216            .           2606    16540    sites sites_tenant_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.sites
    ADD CONSTRAINT sites_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;
 D   ALTER TABLE ONLY public.sites DROP CONSTRAINT sites_tenant_id_fkey;
       public               postgres    false    217    215    3545            /           2606    17671 #   sites sites_tenant_id_tenants_id_fk    FK CONSTRAINT     �   ALTER TABLE ONLY public.sites
    ADD CONSTRAINT sites_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;
 M   ALTER TABLE ONLY public.sites DROP CONSTRAINT sites_tenant_id_tenants_id_fk;
       public               postgres    false    3545    217    215            R           2606    17676 5   subcontractors subcontractors_tenant_id_tenants_id_fk    FK CONSTRAINT     �   ALTER TABLE ONLY public.subcontractors
    ADD CONSTRAINT subcontractors_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;
 _   ALTER TABLE ONLY public.subcontractors DROP CONSTRAINT subcontractors_tenant_id_tenants_id_fk;
       public               postgres    false    3545    215    257            S           2606    17691 &   team_members team_members_team_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.team_members
    ADD CONSTRAINT team_members_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id) ON DELETE CASCADE;
 P   ALTER TABLE ONLY public.team_members DROP CONSTRAINT team_members_team_id_fkey;
       public               postgres    false    218    261    3558            T           2606    17696 &   team_members team_members_user_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.team_members
    ADD CONSTRAINT team_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
 P   ALTER TABLE ONLY public.team_members DROP CONSTRAINT team_members_user_id_fkey;
       public               postgres    false    261    216    3551            0           2606    17701    teams teams_leader_id_fkey    FK CONSTRAINT     {   ALTER TABLE ONLY public.teams
    ADD CONSTRAINT teams_leader_id_fkey FOREIGN KEY (leader_id) REFERENCES public.users(id);
 D   ALTER TABLE ONLY public.teams DROP CONSTRAINT teams_leader_id_fkey;
       public               postgres    false    3551    218    216            1           2606    17706    teams teams_site_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.teams
    ADD CONSTRAINT teams_site_id_fkey FOREIGN KEY (site_id) REFERENCES public.sites(id) ON DELETE CASCADE;
 B   ALTER TABLE ONLY public.teams DROP CONSTRAINT teams_site_id_fkey;
       public               postgres    false    218    217    3556            2           2606    17711    teams teams_tenant_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.teams
    ADD CONSTRAINT teams_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;
 D   ALTER TABLE ONLY public.teams DROP CONSTRAINT teams_tenant_id_fkey;
       public               postgres    false    215    3545    218            U           2606    17716 ;   training_content training_content_created_by_id_users_id_fk    FK CONSTRAINT     �   ALTER TABLE ONLY public.training_content
    ADD CONSTRAINT training_content_created_by_id_users_id_fk FOREIGN KEY (created_by_id) REFERENCES public.users(id);
 e   ALTER TABLE ONLY public.training_content DROP CONSTRAINT training_content_created_by_id_users_id_fk;
       public               postgres    false    265    216    3551            V           2606    17721 9   training_content training_content_tenant_id_tenants_id_fk    FK CONSTRAINT     �   ALTER TABLE ONLY public.training_content
    ADD CONSTRAINT training_content_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);
 c   ALTER TABLE ONLY public.training_content DROP CONSTRAINT training_content_tenant_id_tenants_id_fk;
       public               postgres    false    265    3545    215            A           2606    16837 0   training_courses training_courses_tenant_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.training_courses
    ADD CONSTRAINT training_courses_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;
 Z   ALTER TABLE ONLY public.training_courses DROP CONSTRAINT training_courses_tenant_id_fkey;
       public               postgres    false    221    3545    215            B           2606    17726 9   training_courses training_courses_tenant_id_tenants_id_fk    FK CONSTRAINT     �   ALTER TABLE ONLY public.training_courses
    ADD CONSTRAINT training_courses_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;
 c   ALTER TABLE ONLY public.training_courses DROP CONSTRAINT training_courses_tenant_id_tenants_id_fk;
       public               postgres    false    215    221    3545            W           2606    17731 B   training_records training_records_course_id_training_courses_id_fk    FK CONSTRAINT     �   ALTER TABLE ONLY public.training_records
    ADD CONSTRAINT training_records_course_id_training_courses_id_fk FOREIGN KEY (course_id) REFERENCES public.training_courses(id) ON DELETE CASCADE;
 l   ALTER TABLE ONLY public.training_records DROP CONSTRAINT training_records_course_id_training_courses_id_fk;
       public               postgres    false    3567    268    221            X           2606    17736 9   training_records training_records_tenant_id_tenants_id_fk    FK CONSTRAINT     �   ALTER TABLE ONLY public.training_records
    ADD CONSTRAINT training_records_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;
 c   ALTER TABLE ONLY public.training_records DROP CONSTRAINT training_records_tenant_id_tenants_id_fk;
       public               postgres    false    3545    268    215            Y           2606    17741 5   training_records training_records_user_id_users_id_fk    FK CONSTRAINT     �   ALTER TABLE ONLY public.training_records
    ADD CONSTRAINT training_records_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
 _   ALTER TABLE ONLY public.training_records DROP CONSTRAINT training_records_user_id_users_id_fk;
       public               postgres    false    216    268    3551            +           2606    16523    users users_tenant_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;
 D   ALTER TABLE ONLY public.users DROP CONSTRAINT users_tenant_id_fkey;
       public               postgres    false    3545    215    216            ,           2606    17746 #   users users_tenant_id_tenants_id_fk    FK CONSTRAINT     �   ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;
 M   ALTER TABLE ONLY public.users DROP CONSTRAINT users_tenant_id_tenants_id_fk;
       public               postgres    false    3545    215    216            �      x������ � �      �   M  x����j�0E��W�$�%?��B7%��@Qma�ʒ��$�__��I��;�;̜��JX�r�dl���8勘/��j�<Y�eZ��Y�$Ugd�6Z
����!�'G�^E������DQ�!=f�3��y���N��GHʼ��vN"�'��S�jd�I����
=8�/��kF%u Q�1>��3��2nH���w�� 	��Ï��A8�L��xco�rVL|Ɍ���cؾ�=ݝs��� �g;��ƶqVMh�-���^H�@�[���ǹ���j�$�D'�{���x͜?��`����+���K �F�Ňp��R� �iIxs4��(�>���R      �     x��UMO�0={����`w��
���	$m�dB�u��vX�_�7	��
�i7���7o&���l&��Jݒ�64�G*d�H�\��3��7R�B�Ζ�׈�%��4��s����!��$-!�ScTN5�(�c�*�'��9����*�)�c"�~�t�8JG�L���ty�-��$[����d*�";�S ��F
�Bd�FmyUQ'w�@��ʠ#2\��w;��Qm�ZՍ� X���3O
�Y�Hҕ�S���؟��d�sqU)���k����g��-4D�D^RPzK��6ȶ)S	�;�mT��p���|�����r."Kŵ��ƆA�^���E���(��Hw:VH��(� �i�0��T%7�`�Ѓ*�&��W0`���y�����c������%C9x`��_d��P�,�l.>;W�n��s��w��uo���x���d���`��: zԥf�T���m�"\>\^��O��V�'�Dd�8��k��2�����һ�/Iw�g0V;�%�?��w cLw?�zc�u�����/_��<'KИ��q����{U{���ǹ �\ �!��GE���⩐��<��J�D6�o�ݴ;����Vg��j����	sߟ�!�*�6:vHĚc}y�l�=.7ݸe�5�k��B\Q�8�|7N�i��{ P�������~9�]��y���o�� �ʙ��]A_��`2�V��k#8����m_i=����XC������8�d�Q}��׊��5�eb��/��5�魟�o�d2��21�      �      x������ � �      �      x������ � �      �      x������ � �      �   �   x������0�ϓ��4Lf&i�7��io�=�Z�`[ш�����Ŭ�>~��C@�O�5����v8��6�	2|~-�,OBr��H�O.&�^q��?�a��;�_*j��;���T"1��,����-�K�=m,�L,�+H��Q�<k�oi�$!C1X
�<�+��9��Vo�2�q�_��g|��D>!�u��Tg�R?Ǉ�      �      x������ � �      �      x������ � �         �   x�}�1�0���"�πm�4�D�ԡRz5YS��/> $�����h��6����5��J�ƥ�%���ڐN�^���>���qg�^�.T�Pd�U��Bҩ,р<Wk.�t�	����t<hR3�X��R�'�<�         <  x��WMs�8=�_�Sna�? pc3d�U3�SKjsًF�A�my$9,��[6�@��\���������G,f_� #2�)�=�]X%��p���<Ն�p����A���m� �E�Y<�ɥ烐%G�f�xx]x<����I0�!>��|�	[d �Q��*U�P8�GaK|�t�u�����,ŊC�|�;���,L�Q0����i� ��2�X���Nd� L6���������H��?X6��c���VW�'��_�o0*E�C���%�5^�{�S	�ʀe� �aO�{��T���W���E�Fa�&��v��A� E4�K�+�����A���v��]Զ��<�Sp���M��9E���a�k�d�*����i��]c�R�e�0*x��w�6eK)�Tg+�t��k�I��)�����	ς�p<���+bNL����RR5o�b��l�"��͙ڛ�ڥ!��6 b��U���i�������tt���U��1$��.�^+�F��#�� 7��}.[�޴�_OQ� ����&�V��#)�����7�	!���
��tƵ����_��Z����c��{,��:��lY�Gs�k�؞�b(�!���2�kԔ���H��֛�;�6���]�~��& �ہ�y*���a�=(|�C%U�n���>M�Nx�!>��)BP ��
��h��h��Vnp�A=�ZDC�����/p��ro��cs���^���"&��0d8p�.׶Dn�fz��Z0B5��xW������(�E�̞�wx�y�X�T���� �O�{��_`e�:S��3��*��x��gG^̞
ks���]c��8w6�%��7�c�^j�����q�v4Gn_֭�W�OE�O��p�{��m����;�:������A��g�mſjX_�����+eKmq�~����,�������N��\�f��3���$G�αco��p(�+��&�wޱ�YV�Gї�'����Q��x�v4�d\f �L����f�G��C�=
)���C�4����f[����C%������;�N2�RߜN���,�<��C7�%���`0��qnr         �  x��UM��0=�_�?�	�U���R�]i/�x�8XKlj����	�c�V��"{Ƽ7o�F�n�/����+ၒ'p~�܀+*�H�I��]���1�x��$�I���Z����Joz(��۷�`,�gY8�	���B>���ѓ��$�,dY/�B>�'
�
%���%���X�K�Wy|�r>�,K��A���8n'�lJ��J���E����,��3��4LXg�E�|�"�3��A���Bm��kT��Pxe��(�Y��9OOK<
� C�e�/��}��~��Ͷ�P�v�
c�R��W��+�v�6�9��'c�E���'y�f1K�D|0G�����?P����Tv���?UoA{*���n,�j� �R{,���Z_�R���*�v,�򡼕��7%?����W�.�OI裡�����(J��x�#���1�Z-��X���
�3Z��Fۍ5L�j�*���O}�j�}�}���6ބY�{
ZQ4=jM�#irU��@���FK�z�X�R{{�pe����;9rݡ�rW7����%���dA� ͘w�����nh/u���]{�H�}����Q���I14t�Q8�W`��Q����syS�YT��DmJ�e��{�~�������s�A��hv�      �      x������ � �         |   x�m�K�0 �u{
/ �~�*��$���J҂�5���y��) C�-\��Z�.u���YY�� 66� {���[0�W�U��Z�q�<�2��|KR�[� po�9�/�W��K����gL���j��-�      
      x������ � �            x������ � �         �   x����
� ��k}�^��<Y>�`D��`{�m�+�Z��������^Ǿ:��2[7����[�)�#d��T��k�
R��s?��[-c�2�3��1�ػ=���]&��<&˒�T؀$JM�W!3Pu��Bb��~�����֙���	�e�I(UYaj�˿� ��:�Q�����/��T�B         �   x���M
�@FדSx�I��!<AAjUpӁ�ޙMj�/��}��A����E�ǩ��|�G)�	�Ž��u�h�C�Jw�3fv�RU.@�'��U�a%dO��F�*hM�֭⭞S���jN��8Me�e�~܁_z�c�)e������[;%v�>�\`� � q�      �      x������ � �            x������ � �         �  x��\�r�F}�|�Oq����~I�ͭg]q�!U*H�l�$���b'����E��EZYU��&D����>�Ӡ}$���&/��98��ɏ�>b��e6�O�ǿ��<�'/�r��ˣ��?�����%��)7O�H��(;�:u���-y}P�o�E��x>}��糬����>f��O������>�+i�g~���4?XΏ#�������0�����i�����JW���@v�7����(����s�#�,�OD /�f�*X�D��� :��R�$w�	~�|E#�N9������+-��0|�|dp"0!�&�|�	�`�M}�\&�U�ܴ� ��p�*͵�dGG�[n�\���x̍,��p�*��L��v���7%R�VI'%涴�)��{hioIKiR#�1��5�6����~��O�L�Hq����b:͞��'���Ue�<y�ꗤ�w��x�>ɴx�'/�#��ۓ��|����/�g��O3�g��������M~��z����i�L�����O�|Z4O���Ίg@�\��:O.i%��MM��i&ZǺ(�|�?��F<�6�O��8Y��i^c�cr����EB����b�~��?�Y�']�$�Ij���.���+ a�d�2"�O��̏��+L&,h���g��XTx�� [,���������.}wQ�̼�C޶<�7t"���9溹<��Nha��PJZ�:�&�fka<�mL�w%�a��Qa."�$����z.�5Lʑ��N���h0%R�t��I���Z��g�i�1�7�]����ёr\�ql�xI3b�B$�Bw�wc���G<|�Rx&M�x?F���z�+��]��a�x�#^��wJp��t���F�7=�M�|�r����]����G�핯�ԙ]���G�땎���d��j��r�Fc�{��`��
���]�H�[��0���X8 %� ���QJ�6��4Fp`�r�b�n��u�I�r`���C�����ۘ�ã�lj���q�g��0<�XLuyE����3��>�@8�S�#,˵���(;9y�T�(�&���O/0%#5�����h�A���Ug��7�#4�Rǵ$w�GBӝ��&�(���%Lt�Kt]�8��H,���>i'<��Ë+����2�bb<� ���z�ŠVr���K{\uL�A�R�:�v�D�i5�S�B���m,�ㄱL����T���]e�3��@+31"�NK��A���Z��m�J��V�*��9��-����IM8�*�9vUx:�� �f���m�/ܺef�U�W�V��=��d{�)��h�Zk�V��X+=�b�b����A^��
Z�0?m�U�+�U��`q��y޺=���~��y�M�ױ�@�bC���,s2[yPĠT��	f)��L+���n�����8"j�
T�P�'�a,j�����b8�+N�.@�>�%��G;�s�/��Ŀ���|�H����&[���߉Tm�#i7�
�4%�W�>��Z��橒R���pҾ'Z9�J�3����	��?��5E��;�����Ǥ�NXU��]X��d��l���{��y���ͭ�FA����ce�$~5�uq�M���N�Ƞ��e�n�P�^]�nYT4p�B� ��#u�B���`���(�=����k��"�A�8[�pZ4��ϛ1T��(��\{a��3O�s�;�#��O��Y
���27����<�|x>#�����p	2]��J��Z���]�wV�ږڏmCЪ#�(�u�6�"!l�������׫�y^��OH-FC��B37&x�ϕ�:�N�ߦM�{��#X�Y@He�NC�1l��N��젍����LZD+��C��z��v �l�Ż��&���H?��m*���m�*/����(�r��r��.ξ�\p��t9� s��q��Z�q%i���U�߬�h�o?�+k~5]���>k���v����q�q�.����MC���SۼK�T��v_ﴲ��)��[��p,�O�����Q�$�4�,�d�'���#�{�q4�
\v<���x���E�tVl�J�#��R`�$�"�x�"A��U�0F��ܑ����+�"ꩣ�:i-�i��\�ʋ����iQW�Jj��E5��f�Q�5�Jl���h���ֺU�ە%_F��غeך��$I�T[���S��%�J��U��6�%Wp�s,\��P��I4�:gA�BOd�6��T�#�17����.v$��6�0lT*���n�л$`�tV�==��(��`���e8�(�5^9�CJ'�n�:��^�5f�L'�Z$�Ԣ��M����V����b����[W�s��<�$G�z��f�MQW-��I��y�V?O>X�ilCS#B�q�fdO�F��L�=!�<���Г���߄x��r�,���䇢\~H>x{@S^�����?i�=�ADp�|]��I��*���+9A��JaFY�ɹ���!����_%���Q������6-��j�7U�~{�x���L6�#݇lY������e�7�V�l�����x�����Yy_���,:G�)M����&%��"@'[�M�A�G`���V�k:�v2�Şɤ�˸B|��{-��m���-�%;�ԧ�8u����~�{�2=�b�ڼ�_5 ?*�7R�l��u����4�w��)Q��sZw&�����[�6�?°��T�2􂢆�v0(�Cii�d.�CLWW�������|�/1�	�Z[Z,!���,�mo�K����H<��s�H�0�AL�Nr!�Ip�b'|��4tJ*��;}K�G�y+儥��&��<�� ��o��^�Y.���bK���O�x�d���M�v�J�:~{1v��!�'O`�Fr/������&�K���G�a����㪳^�e_��'�ݩ�xA�`��������3�K�u|_M:G�I�T`n%	��Z�-�D����ݘns[Ў�f�Zy��ޖ*,�����u���F��cS��������$Ru/����V����ƈ�w~���o](z�]Xx��_; �Mc/��y{���ڡ��V���o5�$�9��jHj� �i@������=��6q
��UoAb�!\� 8��5��/M����W��Z)����C���O�g#$jU�Q�"T�� Ɨb{߇�5�Y���3��y�����YN�+H�����1�?ᅯ{            x������ � �      �      x������ � �      �      x������ � �            x������ � �      �      x������ � �            x������ � �            x����N�@F��Oa�pY`�����ZEbb��,--��H�wwIL|�v�f�}g�?�gG�{�HLv��q���yY���-�gg���]� =ê-�␔�d�sq����� �e�#l�Ȑ��F���b�XȈ�;�9������ ��zy( �ۣ���p?%�=�^da��r��c���*�[�QC���k�G�ko���3Oe#�t��MQu|[�	��9�ę��y
N��\3�N#N\�ZwBV�tcw���� �z���      �      x������ � �     