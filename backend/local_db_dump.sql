--
-- PostgreSQL database dump
--

\restrict xFhLpgo4kAJqjxNagiGTt8pgtrIgjhaBEnS1j7Xu4ra9kVEpHCzYXeNuDKSSsDs

-- Dumped from database version 15.15 (Debian 15.15-1.pgdg13+1)
-- Dumped by pg_dump version 16.11 (Ubuntu 16.11-0ubuntu0.24.04.1)

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
-- Name: p90csse7pqpqhxk; Type: SCHEMA; Schema: -; Owner: arunachala
--

CREATE SCHEMA p90csse7pqpqhxk;


ALTER SCHEMA p90csse7pqpqhxk OWNER TO arunachala;

--
-- Name: p9j5mqhyeeb73rz; Type: SCHEMA; Schema: -; Owner: arunachala
--

CREATE SCHEMA p9j5mqhyeeb73rz;


ALTER SCHEMA p9j5mqhyeeb73rz OWNER TO arunachala;

--
-- Name: pe0xs5p5ejazku9; Type: SCHEMA; Schema: -; Owner: arunachala
--

CREATE SCHEMA pe0xs5p5ejazku9;


ALTER SCHEMA pe0xs5p5ejazku9 OWNER TO arunachala;

--
-- Name: psoq8r0ntwwuqxb; Type: SCHEMA; Schema: -; Owner: arunachala
--

CREATE SCHEMA psoq8r0ntwwuqxb;


ALTER SCHEMA psoq8r0ntwwuqxb OWNER TO arunachala;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Features; Type: TABLE; Schema: p90csse7pqpqhxk; Owner: arunachala
--

CREATE TABLE p90csse7pqpqhxk."Features" (
    id integer NOT NULL,
    created_at timestamp without time zone,
    updated_at timestamp without time zone,
    created_by character varying,
    updated_by character varying,
    nc_order numeric,
    title text
);


ALTER TABLE p90csse7pqpqhxk."Features" OWNER TO arunachala;

--
-- Name: Features_id_seq; Type: SEQUENCE; Schema: p90csse7pqpqhxk; Owner: arunachala
--

CREATE SEQUENCE p90csse7pqpqhxk."Features_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE p90csse7pqpqhxk."Features_id_seq" OWNER TO arunachala;

--
-- Name: Features_id_seq; Type: SEQUENCE OWNED BY; Schema: p90csse7pqpqhxk; Owner: arunachala
--

ALTER SEQUENCE p90csse7pqpqhxk."Features_id_seq" OWNED BY p90csse7pqpqhxk."Features".id;


--
-- Name: Features; Type: TABLE; Schema: p9j5mqhyeeb73rz; Owner: arunachala
--

CREATE TABLE p9j5mqhyeeb73rz."Features" (
    id integer NOT NULL,
    created_at timestamp without time zone,
    updated_at timestamp without time zone,
    created_by character varying,
    updated_by character varying,
    nc_order numeric,
    title text
);


ALTER TABLE p9j5mqhyeeb73rz."Features" OWNER TO arunachala;

--
-- Name: Features_id_seq; Type: SEQUENCE; Schema: p9j5mqhyeeb73rz; Owner: arunachala
--

CREATE SEQUENCE p9j5mqhyeeb73rz."Features_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE p9j5mqhyeeb73rz."Features_id_seq" OWNER TO arunachala;

--
-- Name: Features_id_seq; Type: SEQUENCE OWNED BY; Schema: p9j5mqhyeeb73rz; Owner: arunachala
--

ALTER SEQUENCE p9j5mqhyeeb73rz."Features_id_seq" OWNED BY p9j5mqhyeeb73rz."Features".id;


--
-- Name: activities; Type: TABLE; Schema: public; Owner: arunachala
--

CREATE TABLE public.activities (
    id integer NOT NULL,
    title character varying NOT NULL,
    description text,
    translations json,
    type character varying NOT NULL,
    start_date timestamp with time zone,
    end_date timestamp with time zone,
    location character varying,
    price character varying,
    image_url character varying,
    slug character varying,
    is_active boolean,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone
);


ALTER TABLE public.activities OWNER TO arunachala;

--
-- Name: activities_id_seq; Type: SEQUENCE; Schema: public; Owner: arunachala
--

CREATE SEQUENCE public.activities_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.activities_id_seq OWNER TO arunachala;

--
-- Name: activities_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: arunachala
--

ALTER SEQUENCE public.activities_id_seq OWNED BY public.activities.id;


--
-- Name: agent_config; Type: TABLE; Schema: public; Owner: arunachala
--

CREATE TABLE public.agent_config (
    id integer NOT NULL,
    tone character varying,
    response_length character varying,
    emoji_style character varying,
    focus_area character varying,
    system_instructions text,
    is_active boolean,
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.agent_config OWNER TO arunachala;

--
-- Name: agent_config_id_seq; Type: SEQUENCE; Schema: public; Owner: arunachala
--

CREATE SEQUENCE public.agent_config_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.agent_config_id_seq OWNER TO arunachala;

--
-- Name: agent_config_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: arunachala
--

ALTER SEQUENCE public.agent_config_id_seq OWNED BY public.agent_config.id;


--
-- Name: contents; Type: TABLE; Schema: public; Owner: arunachala
--

CREATE TABLE public.contents (
    id integer NOT NULL,
    title character varying NOT NULL,
    slug character varying,
    body text,
    type character varying NOT NULL,
    status character varying,
    author_id integer,
    thumbnail_url character varying,
    seo_title character varying,
    seo_description character varying,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone,
    media_url character varying,
    excerpt character varying,
    category character varying,
    tags json,
    translations json
);


ALTER TABLE public.contents OWNER TO arunachala;

--
-- Name: contents_id_seq; Type: SEQUENCE; Schema: public; Owner: arunachala
--

CREATE SEQUENCE public.contents_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.contents_id_seq OWNER TO arunachala;

--
-- Name: contents_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: arunachala
--

ALTER SEQUENCE public.contents_id_seq OWNED BY public.contents.id;


--
-- Name: dashboard_activities; Type: TABLE; Schema: public; Owner: arunachala
--

CREATE TABLE public.dashboard_activities (
    id integer NOT NULL,
    type character varying NOT NULL,
    action character varying NOT NULL,
    title character varying NOT NULL,
    "timestamp" timestamp with time zone DEFAULT now(),
    entity_id integer
);


ALTER TABLE public.dashboard_activities OWNER TO arunachala;

--
-- Name: dashboard_activities_id_seq; Type: SEQUENCE; Schema: public; Owner: arunachala
--

CREATE SEQUENCE public.dashboard_activities_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.dashboard_activities_id_seq OWNER TO arunachala;

--
-- Name: dashboard_activities_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: arunachala
--

ALTER SEQUENCE public.dashboard_activities_id_seq OWNED BY public.dashboard_activities.id;


--
-- Name: gallery; Type: TABLE; Schema: public; Owner: arunachala
--

CREATE TABLE public.gallery (
    id integer NOT NULL,
    url character varying NOT NULL,
    alt_text character varying,
    category character varying,
    "position" integer,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.gallery OWNER TO arunachala;

--
-- Name: gallery_id_seq; Type: SEQUENCE; Schema: public; Owner: arunachala
--

CREATE SEQUENCE public.gallery_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.gallery_id_seq OWNER TO arunachala;

--
-- Name: gallery_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: arunachala
--

ALTER SEQUENCE public.gallery_id_seq OWNED BY public.gallery.id;


--
-- Name: massage_types; Type: TABLE; Schema: public; Owner: arunachala
--

CREATE TABLE public.massage_types (
    id integer NOT NULL,
    name character varying NOT NULL,
    excerpt character varying,
    description text,
    benefits text,
    translations json,
    duration_min integer,
    image_url character varying,
    is_active boolean,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.massage_types OWNER TO arunachala;

--
-- Name: massage_types_id_seq; Type: SEQUENCE; Schema: public; Owner: arunachala
--

CREATE SEQUENCE public.massage_types_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.massage_types_id_seq OWNER TO arunachala;

--
-- Name: massage_types_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: arunachala
--

ALTER SEQUENCE public.massage_types_id_seq OWNED BY public.massage_types.id;


--
-- Name: nc_api_tokens; Type: TABLE; Schema: public; Owner: arunachala
--

CREATE TABLE public.nc_api_tokens (
    id integer NOT NULL,
    base_id character varying(20),
    db_alias character varying(255),
    description character varying(255),
    permissions text,
    token text,
    expiry character varying(255),
    enabled boolean DEFAULT true,
    fk_user_id character varying(20),
    fk_workspace_id character varying(20),
    fk_sso_client_id character varying(20),
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


ALTER TABLE public.nc_api_tokens OWNER TO arunachala;

--
-- Name: nc_api_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: arunachala
--

CREATE SEQUENCE public.nc_api_tokens_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.nc_api_tokens_id_seq OWNER TO arunachala;

--
-- Name: nc_api_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: arunachala
--

ALTER SEQUENCE public.nc_api_tokens_id_seq OWNED BY public.nc_api_tokens.id;


--
-- Name: nc_audit_v2; Type: TABLE; Schema: public; Owner: arunachala
--

CREATE TABLE public.nc_audit_v2 (
    id uuid NOT NULL,
    "user" character varying(255),
    ip character varying(255),
    source_id character varying(20),
    base_id character varying(20),
    fk_model_id character varying(20),
    row_id character varying(255),
    op_type character varying(255),
    op_sub_type character varying(255),
    status character varying(255),
    description text,
    details text,
    fk_user_id character varying(20),
    fk_ref_id character varying(20),
    fk_parent_id uuid,
    fk_workspace_id character varying(20),
    fk_org_id character varying(20),
    user_agent text,
    version smallint DEFAULT '0'::smallint,
    old_id character varying(20),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.nc_audit_v2 OWNER TO arunachala;

--
-- Name: nc_automation_executions; Type: TABLE; Schema: public; Owner: arunachala
--

CREATE TABLE public.nc_automation_executions (
    id character varying(20) NOT NULL,
    fk_workspace_id character varying(20),
    base_id character varying(20) NOT NULL,
    fk_workflow_id character varying(20) NOT NULL,
    workflow_data text,
    execution_data text,
    finished boolean DEFAULT false,
    started_at timestamp with time zone,
    finished_at timestamp with time zone,
    status character varying(50),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    resume_at timestamp with time zone
);


ALTER TABLE public.nc_automation_executions OWNER TO arunachala;

--
-- Name: nc_automations; Type: TABLE; Schema: public; Owner: arunachala
--

CREATE TABLE public.nc_automations (
    id character varying(20) NOT NULL,
    title character varying(255),
    description text,
    meta text,
    fk_workspace_id character varying(20),
    base_id character varying(20) NOT NULL,
    "order" real,
    type character varying(20),
    created_by character varying(20),
    updated_by character varying(20),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    enabled boolean DEFAULT false,
    nodes text,
    edges text,
    draft text,
    config text,
    script text
);


ALTER TABLE public.nc_automations OWNER TO arunachala;

--
-- Name: nc_base_users_v2; Type: TABLE; Schema: public; Owner: arunachala
--

CREATE TABLE public.nc_base_users_v2 (
    base_id character varying(20) NOT NULL,
    fk_user_id character varying(20) NOT NULL,
    roles text,
    starred boolean,
    pinned boolean,
    "group" character varying(255),
    color character varying(255),
    "order" real,
    hidden real,
    opened_date timestamp with time zone,
    invited_by character varying(20),
    fk_workspace_id character varying(20),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.nc_base_users_v2 OWNER TO arunachala;

--
-- Name: nc_bases_v2; Type: TABLE; Schema: public; Owner: arunachala
--

CREATE TABLE public.nc_bases_v2 (
    id character varying(128) NOT NULL,
    title character varying(255),
    prefix character varying(255),
    status character varying(255),
    description text,
    meta text,
    color character varying(255),
    uuid character varying(255),
    password character varying(255),
    roles character varying(255),
    deleted boolean DEFAULT false,
    is_meta boolean,
    "order" real,
    type character varying(200),
    fk_workspace_id character varying(20),
    is_snapshot boolean DEFAULT false,
    fk_custom_url_id character varying(20),
    version smallint DEFAULT '2'::smallint,
    default_role character varying(20),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.nc_bases_v2 OWNER TO arunachala;

--
-- Name: nc_calendar_view_columns_v2; Type: TABLE; Schema: public; Owner: arunachala
--

CREATE TABLE public.nc_calendar_view_columns_v2 (
    id character varying(20) NOT NULL,
    base_id character varying(20) NOT NULL,
    source_id character varying(20),
    fk_view_id character varying(20),
    fk_column_id character varying(20),
    show boolean,
    bold boolean,
    underline boolean,
    italic boolean,
    "order" real,
    fk_workspace_id character varying(20),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.nc_calendar_view_columns_v2 OWNER TO arunachala;

--
-- Name: nc_calendar_view_range_v2; Type: TABLE; Schema: public; Owner: arunachala
--

CREATE TABLE public.nc_calendar_view_range_v2 (
    id character varying(20) NOT NULL,
    fk_view_id character varying(20),
    fk_to_column_id character varying(20),
    label character varying(40),
    fk_from_column_id character varying(20),
    base_id character varying(20) NOT NULL,
    fk_workspace_id character varying(20),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.nc_calendar_view_range_v2 OWNER TO arunachala;

--
-- Name: nc_calendar_view_v2; Type: TABLE; Schema: public; Owner: arunachala
--

CREATE TABLE public.nc_calendar_view_v2 (
    fk_view_id character varying(20) NOT NULL,
    base_id character varying(20) NOT NULL,
    source_id character varying(20),
    title character varying(255),
    fk_cover_image_col_id character varying(20),
    meta text,
    fk_workspace_id character varying(20),
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


ALTER TABLE public.nc_calendar_view_v2 OWNER TO arunachala;

--
-- Name: nc_col_barcode_v2; Type: TABLE; Schema: public; Owner: arunachala
--

CREATE TABLE public.nc_col_barcode_v2 (
    id character varying(20) NOT NULL,
    fk_column_id character varying(20),
    fk_barcode_value_column_id character varying(20),
    barcode_format character varying(15),
    deleted boolean,
    base_id character varying(20) NOT NULL,
    fk_workspace_id character varying(20),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.nc_col_barcode_v2 OWNER TO arunachala;

--
-- Name: nc_col_button_v2; Type: TABLE; Schema: public; Owner: arunachala
--

CREATE TABLE public.nc_col_button_v2 (
    id character varying(20) NOT NULL,
    base_id character varying(20) NOT NULL,
    type character varying(255),
    label text,
    theme character varying(255),
    color character varying(255),
    icon character varying(255),
    formula text,
    formula_raw text,
    error character varying(255),
    parsed_tree text,
    fk_webhook_id character varying(20),
    fk_column_id character varying(20),
    fk_integration_id character varying(20),
    model character varying(255),
    output_column_ids text,
    fk_workspace_id character varying(20),
    fk_script_id character varying(20),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.nc_col_button_v2 OWNER TO arunachala;

--
-- Name: nc_col_formula_v2; Type: TABLE; Schema: public; Owner: arunachala
--

CREATE TABLE public.nc_col_formula_v2 (
    id character varying(20) NOT NULL,
    fk_column_id character varying(20),
    formula text NOT NULL,
    formula_raw text,
    error text,
    deleted boolean,
    "order" real,
    parsed_tree text,
    base_id character varying(20) NOT NULL,
    fk_workspace_id character varying(20),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.nc_col_formula_v2 OWNER TO arunachala;

--
-- Name: nc_col_long_text_v2; Type: TABLE; Schema: public; Owner: arunachala
--

CREATE TABLE public.nc_col_long_text_v2 (
    id character varying(20) NOT NULL,
    fk_workspace_id character varying(20),
    base_id character varying(20) NOT NULL,
    fk_model_id character varying(20),
    fk_column_id character varying(20),
    fk_integration_id character varying(20),
    model character varying(255),
    prompt text,
    prompt_raw text,
    error text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.nc_col_long_text_v2 OWNER TO arunachala;

--
-- Name: nc_col_lookup_v2; Type: TABLE; Schema: public; Owner: arunachala
--

CREATE TABLE public.nc_col_lookup_v2 (
    id character varying(20) NOT NULL,
    fk_column_id character varying(20),
    fk_relation_column_id character varying(20),
    fk_lookup_column_id character varying(20),
    deleted boolean,
    base_id character varying(20) NOT NULL,
    fk_workspace_id character varying(20),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.nc_col_lookup_v2 OWNER TO arunachala;

--
-- Name: nc_col_qrcode_v2; Type: TABLE; Schema: public; Owner: arunachala
--

CREATE TABLE public.nc_col_qrcode_v2 (
    id character varying(20) NOT NULL,
    fk_column_id character varying(20),
    fk_qr_value_column_id character varying(20),
    deleted boolean,
    "order" real,
    base_id character varying(20) NOT NULL,
    fk_workspace_id character varying(20),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.nc_col_qrcode_v2 OWNER TO arunachala;

--
-- Name: nc_col_relations_v2; Type: TABLE; Schema: public; Owner: arunachala
--

CREATE TABLE public.nc_col_relations_v2 (
    id character varying(20) NOT NULL,
    ref_db_alias character varying(255),
    type character varying(255),
    virtual boolean,
    db_type character varying(255),
    fk_column_id character varying(20),
    fk_related_model_id character varying(20),
    fk_child_column_id character varying(20),
    fk_parent_column_id character varying(20),
    fk_mm_model_id character varying(20),
    fk_mm_child_column_id character varying(20),
    fk_mm_parent_column_id character varying(20),
    ur character varying(255),
    dr character varying(255),
    fk_index_name character varying(255),
    deleted boolean,
    fk_target_view_id character varying(20),
    base_id character varying(20) NOT NULL,
    fk_workspace_id character varying(20),
    fk_related_base_id character varying(20),
    fk_mm_base_id character varying(20),
    fk_related_source_id character varying(20),
    fk_mm_source_id character varying(20),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.nc_col_relations_v2 OWNER TO arunachala;

--
-- Name: nc_col_rollup_v2; Type: TABLE; Schema: public; Owner: arunachala
--

CREATE TABLE public.nc_col_rollup_v2 (
    id character varying(20) NOT NULL,
    fk_column_id character varying(20),
    fk_relation_column_id character varying(20),
    fk_rollup_column_id character varying(20),
    rollup_function character varying(255),
    deleted boolean,
    base_id character varying(20) NOT NULL,
    fk_workspace_id character varying(20),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.nc_col_rollup_v2 OWNER TO arunachala;

--
-- Name: nc_col_select_options_v2; Type: TABLE; Schema: public; Owner: arunachala
--

CREATE TABLE public.nc_col_select_options_v2 (
    id character varying(20) NOT NULL,
    fk_column_id character varying(20),
    title character varying(255),
    color character varying(255),
    "order" real,
    base_id character varying(20) NOT NULL,
    fk_workspace_id character varying(20),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.nc_col_select_options_v2 OWNER TO arunachala;

--
-- Name: nc_columns_v2; Type: TABLE; Schema: public; Owner: arunachala
--

CREATE TABLE public.nc_columns_v2 (
    id character varying(20) NOT NULL,
    source_id character varying(20),
    base_id character varying(20) NOT NULL,
    fk_model_id character varying(20),
    title character varying(255),
    column_name character varying(255),
    uidt character varying(255),
    dt character varying(255),
    np character varying(255),
    ns character varying(255),
    clen character varying(255),
    cop character varying(255),
    pk boolean,
    pv boolean,
    rqd boolean,
    un boolean,
    ct text,
    ai boolean,
    "unique" boolean,
    cdf text,
    cc text,
    csn character varying(255),
    dtx character varying(255),
    dtxp text,
    dtxs character varying(255),
    au boolean,
    validate text,
    virtual boolean,
    deleted boolean,
    system boolean DEFAULT false,
    "order" real,
    meta text,
    description text,
    readonly boolean DEFAULT false,
    fk_workspace_id character varying(20),
    custom_index_name character varying(64),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    internal_meta text
);


ALTER TABLE public.nc_columns_v2 OWNER TO arunachala;

--
-- Name: nc_comment_reactions; Type: TABLE; Schema: public; Owner: arunachala
--

CREATE TABLE public.nc_comment_reactions (
    id character varying(20) NOT NULL,
    row_id character varying(255),
    comment_id character varying(20),
    source_id character varying(20),
    fk_model_id character varying(20),
    base_id character varying(20) NOT NULL,
    reaction character varying(255),
    created_by character varying(255),
    fk_workspace_id character varying(20),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.nc_comment_reactions OWNER TO arunachala;

--
-- Name: nc_comments; Type: TABLE; Schema: public; Owner: arunachala
--

CREATE TABLE public.nc_comments (
    id character varying(20) NOT NULL,
    row_id character varying(255),
    comment text,
    created_by character varying(20),
    created_by_email character varying(255),
    resolved_by character varying(20),
    resolved_by_email character varying(255),
    parent_comment_id character varying(20),
    source_id character varying(20),
    base_id character varying(20) NOT NULL,
    fk_model_id character varying(20),
    is_deleted boolean,
    fk_workspace_id character varying(20),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.nc_comments OWNER TO arunachala;

--
-- Name: nc_custom_urls_v2; Type: TABLE; Schema: public; Owner: arunachala
--

CREATE TABLE public.nc_custom_urls_v2 (
    id character varying(20) NOT NULL,
    fk_workspace_id character varying(20),
    base_id character varying(20) NOT NULL,
    fk_model_id character varying(20),
    view_id character varying(20),
    original_path character varying(255),
    custom_path character varying(255),
    fk_dashboard_id character varying(20),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.nc_custom_urls_v2 OWNER TO arunachala;

--
-- Name: nc_dashboards_v2; Type: TABLE; Schema: public; Owner: arunachala
--

CREATE TABLE public.nc_dashboards_v2 (
    id character varying(20) NOT NULL,
    fk_workspace_id character varying(20),
    base_id character varying(20) NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    meta text,
    "order" integer,
    created_by character varying(20),
    owned_by character varying(20),
    uuid character varying(255),
    password character varying(255),
    fk_custom_url_id character varying(20),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.nc_dashboards_v2 OWNER TO arunachala;

--
-- Name: nc_data_reflection; Type: TABLE; Schema: public; Owner: arunachala
--

CREATE TABLE public.nc_data_reflection (
    id character varying(20) NOT NULL,
    fk_workspace_id character varying(20),
    username character varying(255),
    password character varying(255),
    database character varying(255),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.nc_data_reflection OWNER TO arunachala;

--
-- Name: nc_db_servers; Type: TABLE; Schema: public; Owner: arunachala
--

CREATE TABLE public.nc_db_servers (
    id character varying(20) NOT NULL,
    title character varying(255),
    is_shared boolean DEFAULT true,
    max_tenant_count integer,
    current_tenant_count integer DEFAULT 0,
    config text,
    conditions text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.nc_db_servers OWNER TO arunachala;

--
-- Name: nc_dependency_tracker; Type: TABLE; Schema: public; Owner: arunachala
--

CREATE TABLE public.nc_dependency_tracker (
    id character varying(20) NOT NULL,
    fk_workspace_id character varying(20),
    base_id character varying(20) NOT NULL,
    source_type character varying(50) NOT NULL,
    source_id character varying(20) NOT NULL,
    dependent_type character varying(50) NOT NULL,
    dependent_id character varying(20) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    queryable_field_0 text,
    queryable_field_1 text,
    meta text,
    queryable_field_2 timestamp with time zone
);


ALTER TABLE public.nc_dependency_tracker OWNER TO arunachala;

--
-- Name: nc_disabled_models_for_role_v2; Type: TABLE; Schema: public; Owner: arunachala
--

CREATE TABLE public.nc_disabled_models_for_role_v2 (
    id character varying(20) NOT NULL,
    source_id character varying(20),
    base_id character varying(20) NOT NULL,
    fk_view_id character varying(20),
    role character varying(45),
    disabled boolean DEFAULT true,
    fk_workspace_id character varying(20),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.nc_disabled_models_for_role_v2 OWNER TO arunachala;

--
-- Name: nc_extensions; Type: TABLE; Schema: public; Owner: arunachala
--

CREATE TABLE public.nc_extensions (
    id character varying(20) NOT NULL,
    base_id character varying(20) NOT NULL,
    fk_user_id character varying(20),
    extension_id character varying(255),
    title character varying(255),
    kv_store text,
    meta text,
    "order" real,
    fk_workspace_id character varying(20),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.nc_extensions OWNER TO arunachala;

--
-- Name: nc_file_references; Type: TABLE; Schema: public; Owner: arunachala
--

CREATE TABLE public.nc_file_references (
    id character varying(20) NOT NULL,
    storage character varying(255),
    file_url text,
    file_size integer,
    fk_user_id character varying(20),
    fk_workspace_id character varying(20),
    base_id character varying(20),
    source_id character varying(20),
    fk_model_id character varying(20),
    fk_column_id character varying(20),
    is_external boolean DEFAULT false,
    deleted boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.nc_file_references OWNER TO arunachala;

--
-- Name: nc_filter_exp_v2; Type: TABLE; Schema: public; Owner: arunachala
--

CREATE TABLE public.nc_filter_exp_v2 (
    id character varying(20) NOT NULL,
    source_id character varying(20),
    base_id character varying(20) NOT NULL,
    fk_view_id character varying(20),
    fk_hook_id character varying(20),
    fk_column_id character varying(20),
    fk_parent_id character varying(20),
    logical_op character varying(255),
    comparison_op character varying(255),
    value text,
    is_group boolean,
    "order" real,
    comparison_sub_op character varying(255),
    fk_link_col_id character varying(20),
    fk_value_col_id character varying(20),
    fk_parent_column_id character varying(20),
    fk_workspace_id character varying(20),
    fk_row_color_condition_id character varying(20),
    fk_widget_id character varying(20),
    meta text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.nc_filter_exp_v2 OWNER TO arunachala;

--
-- Name: nc_follower; Type: TABLE; Schema: public; Owner: arunachala
--

CREATE TABLE public.nc_follower (
    fk_user_id character varying(20) NOT NULL,
    fk_follower_id character varying(20) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.nc_follower OWNER TO arunachala;

--
-- Name: nc_form_view_columns_v2; Type: TABLE; Schema: public; Owner: arunachala
--

CREATE TABLE public.nc_form_view_columns_v2 (
    id character varying(20) NOT NULL,
    source_id character varying(20),
    base_id character varying(20) NOT NULL,
    fk_view_id character varying(20),
    fk_column_id character varying(20),
    uuid character varying(255),
    label text,
    help text,
    description text,
    required boolean,
    show boolean,
    "order" real,
    meta text,
    enable_scanner boolean,
    fk_workspace_id character varying(20),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.nc_form_view_columns_v2 OWNER TO arunachala;

--
-- Name: nc_form_view_v2; Type: TABLE; Schema: public; Owner: arunachala
--

CREATE TABLE public.nc_form_view_v2 (
    source_id character varying(20),
    base_id character varying(20) NOT NULL,
    fk_view_id character varying(20) NOT NULL,
    heading character varying(255),
    subheading text,
    success_msg text,
    redirect_url text,
    redirect_after_secs character varying(255),
    email character varying(255),
    submit_another_form boolean,
    show_blank_form boolean,
    uuid character varying(255),
    banner_image_url text,
    logo_url text,
    meta text,
    fk_workspace_id character varying(20),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.nc_form_view_v2 OWNER TO arunachala;

--
-- Name: nc_gallery_view_columns_v2; Type: TABLE; Schema: public; Owner: arunachala
--

CREATE TABLE public.nc_gallery_view_columns_v2 (
    id character varying(20) NOT NULL,
    source_id character varying(20),
    base_id character varying(20) NOT NULL,
    fk_view_id character varying(20),
    fk_column_id character varying(20),
    uuid character varying(255),
    label character varying(255),
    help character varying(255),
    show boolean,
    "order" real,
    fk_workspace_id character varying(20),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.nc_gallery_view_columns_v2 OWNER TO arunachala;

--
-- Name: nc_gallery_view_v2; Type: TABLE; Schema: public; Owner: arunachala
--

CREATE TABLE public.nc_gallery_view_v2 (
    source_id character varying(20),
    base_id character varying(20) NOT NULL,
    fk_view_id character varying(20) NOT NULL,
    next_enabled boolean,
    prev_enabled boolean,
    cover_image_idx integer,
    fk_cover_image_col_id character varying(20),
    cover_image character varying(255),
    restrict_types character varying(255),
    restrict_size character varying(255),
    restrict_number character varying(255),
    public boolean,
    dimensions character varying(255),
    responsive_columns character varying(255),
    meta text,
    fk_workspace_id character varying(20),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.nc_gallery_view_v2 OWNER TO arunachala;

--
-- Name: nc_grid_view_columns_v2; Type: TABLE; Schema: public; Owner: arunachala
--

CREATE TABLE public.nc_grid_view_columns_v2 (
    id character varying(20) NOT NULL,
    fk_view_id character varying(20),
    fk_column_id character varying(20),
    source_id character varying(20),
    base_id character varying(20) NOT NULL,
    uuid character varying(255),
    label character varying(255),
    help character varying(255),
    width character varying(255) DEFAULT '200px'::character varying,
    show boolean,
    "order" real,
    group_by boolean,
    group_by_order real,
    group_by_sort character varying(255),
    aggregation character varying(30) DEFAULT NULL::character varying,
    fk_workspace_id character varying(20),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.nc_grid_view_columns_v2 OWNER TO arunachala;

--
-- Name: nc_grid_view_v2; Type: TABLE; Schema: public; Owner: arunachala
--

CREATE TABLE public.nc_grid_view_v2 (
    fk_view_id character varying(20) NOT NULL,
    source_id character varying(20),
    base_id character varying(20) NOT NULL,
    uuid character varying(255),
    meta text,
    row_height integer,
    fk_workspace_id character varying(20),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.nc_grid_view_v2 OWNER TO arunachala;

--
-- Name: nc_hook_logs_v2; Type: TABLE; Schema: public; Owner: arunachala
--

CREATE TABLE public.nc_hook_logs_v2 (
    id character varying(20) NOT NULL,
    source_id character varying(20),
    base_id character varying(20) NOT NULL,
    fk_hook_id character varying(20),
    type character varying(255),
    event character varying(255),
    operation character varying(255),
    test_call boolean DEFAULT true,
    payload text,
    conditions text,
    notification text,
    error_code character varying(255),
    error_message character varying(255),
    error text,
    execution_time integer,
    response text,
    triggered_by character varying(255),
    fk_workspace_id character varying(20),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.nc_hook_logs_v2 OWNER TO arunachala;

--
-- Name: nc_hook_trigger_fields; Type: TABLE; Schema: public; Owner: arunachala
--

CREATE TABLE public.nc_hook_trigger_fields (
    fk_hook_id character varying(20) NOT NULL,
    fk_column_id character varying(20) NOT NULL,
    base_id character varying(20) NOT NULL,
    fk_workspace_id character varying(20) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.nc_hook_trigger_fields OWNER TO arunachala;

--
-- Name: nc_hooks_v2; Type: TABLE; Schema: public; Owner: arunachala
--

CREATE TABLE public.nc_hooks_v2 (
    id character varying(20) NOT NULL,
    source_id character varying(20),
    base_id character varying(20) NOT NULL,
    fk_model_id character varying(20),
    title character varying(255),
    description character varying(255),
    env character varying(255) DEFAULT 'all'::character varying,
    type character varying(255),
    event character varying(255),
    operation character varying(255),
    async boolean DEFAULT false,
    payload boolean DEFAULT true,
    url text,
    headers text,
    condition boolean DEFAULT false,
    notification text,
    retries integer DEFAULT 0,
    retry_interval integer DEFAULT 60000,
    timeout integer DEFAULT 60000,
    active boolean DEFAULT true,
    version character varying(255),
    trigger_field boolean DEFAULT false,
    fk_workspace_id character varying(20),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.nc_hooks_v2 OWNER TO arunachala;

--
-- Name: nc_installations; Type: TABLE; Schema: public; Owner: arunachala
--

CREATE TABLE public.nc_installations (
    id character varying(20) NOT NULL,
    fk_subscription_id character varying(20),
    licensed_to character varying(255) NOT NULL,
    license_key character varying(255) NOT NULL,
    installation_secret character varying(255),
    installed_at timestamp with time zone,
    last_seen_at timestamp with time zone,
    expires_at timestamp with time zone,
    license_type character varying(255) NOT NULL,
    status character varying(255) DEFAULT 'active'::character varying NOT NULL,
    seat_count integer DEFAULT 0 NOT NULL,
    config text,
    meta text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.nc_installations OWNER TO arunachala;

--
-- Name: nc_integrations_store_v2; Type: TABLE; Schema: public; Owner: arunachala
--

CREATE TABLE public.nc_integrations_store_v2 (
    id character varying(20) NOT NULL,
    fk_integration_id character varying(20),
    type character varying(20),
    sub_type character varying(20),
    fk_workspace_id character varying(20),
    fk_user_id character varying(20),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    slot_0 text,
    slot_1 text,
    slot_2 text,
    slot_3 text,
    slot_4 text,
    slot_5 integer,
    slot_6 integer,
    slot_7 integer,
    slot_8 integer,
    slot_9 integer
);


ALTER TABLE public.nc_integrations_store_v2 OWNER TO arunachala;

--
-- Name: nc_integrations_v2; Type: TABLE; Schema: public; Owner: arunachala
--

CREATE TABLE public.nc_integrations_v2 (
    id character varying(20) NOT NULL,
    title character varying(128),
    config text,
    meta text,
    type character varying(20),
    sub_type character varying(20),
    fk_workspace_id character varying(20),
    is_private boolean DEFAULT false,
    deleted boolean DEFAULT false,
    created_by character varying(20),
    "order" real,
    is_default boolean DEFAULT false,
    is_encrypted boolean DEFAULT false,
    is_global boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.nc_integrations_v2 OWNER TO arunachala;

--
-- Name: nc_jobs; Type: TABLE; Schema: public; Owner: arunachala
--

CREATE TABLE public.nc_jobs (
    id character varying(20) NOT NULL,
    job character varying(255),
    status character varying(20),
    result text,
    fk_user_id character varying(20),
    fk_workspace_id character varying(20),
    base_id character varying(20),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.nc_jobs OWNER TO arunachala;

--
-- Name: nc_kanban_view_columns_v2; Type: TABLE; Schema: public; Owner: arunachala
--

CREATE TABLE public.nc_kanban_view_columns_v2 (
    id character varying(20) NOT NULL,
    source_id character varying(20),
    base_id character varying(20) NOT NULL,
    fk_view_id character varying(20),
    fk_column_id character varying(20),
    uuid character varying(255),
    label character varying(255),
    help character varying(255),
    show boolean,
    "order" real,
    fk_workspace_id character varying(20),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.nc_kanban_view_columns_v2 OWNER TO arunachala;

--
-- Name: nc_kanban_view_v2; Type: TABLE; Schema: public; Owner: arunachala
--

CREATE TABLE public.nc_kanban_view_v2 (
    fk_view_id character varying(20) NOT NULL,
    source_id character varying(20),
    base_id character varying(20) NOT NULL,
    show boolean,
    "order" real,
    uuid character varying(255),
    title character varying(255),
    public boolean,
    password character varying(255),
    show_all_fields boolean,
    fk_grp_col_id character varying(20),
    fk_cover_image_col_id character varying(20),
    meta text,
    fk_workspace_id character varying(20),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.nc_kanban_view_v2 OWNER TO arunachala;

--
-- Name: nc_map_view_columns_v2; Type: TABLE; Schema: public; Owner: arunachala
--

CREATE TABLE public.nc_map_view_columns_v2 (
    id character varying(20) NOT NULL,
    base_id character varying(20) NOT NULL,
    project_id character varying(128),
    fk_view_id character varying(20),
    fk_column_id character varying(20),
    uuid character varying(255),
    label character varying(255),
    help character varying(255),
    show boolean,
    "order" real,
    fk_workspace_id character varying(20),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.nc_map_view_columns_v2 OWNER TO arunachala;

--
-- Name: nc_map_view_v2; Type: TABLE; Schema: public; Owner: arunachala
--

CREATE TABLE public.nc_map_view_v2 (
    fk_view_id character varying(20) NOT NULL,
    source_id character varying(20),
    base_id character varying(20) NOT NULL,
    uuid character varying(255),
    title character varying(255),
    fk_geo_data_col_id character varying(20),
    meta text,
    fk_workspace_id character varying(20),
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


ALTER TABLE public.nc_map_view_v2 OWNER TO arunachala;

--
-- Name: nc_mcp_tokens; Type: TABLE; Schema: public; Owner: arunachala
--

CREATE TABLE public.nc_mcp_tokens (
    id character varying(20) NOT NULL,
    title character varying(512),
    base_id character varying(20) NOT NULL,
    token character varying(32),
    fk_workspace_id character varying(20),
    "order" real,
    fk_user_id character varying(20),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.nc_mcp_tokens OWNER TO arunachala;

--
-- Name: nc_model_stats_v2; Type: TABLE; Schema: public; Owner: arunachala
--

CREATE TABLE public.nc_model_stats_v2 (
    fk_workspace_id character varying(20) NOT NULL,
    fk_model_id character varying(20) NOT NULL,
    row_count integer DEFAULT 0,
    is_external boolean DEFAULT false,
    base_id character varying(20) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.nc_model_stats_v2 OWNER TO arunachala;

--
-- Name: nc_models_v2; Type: TABLE; Schema: public; Owner: arunachala
--

CREATE TABLE public.nc_models_v2 (
    id character varying(20) NOT NULL,
    source_id character varying(20),
    base_id character varying(20) NOT NULL,
    table_name character varying(255),
    title character varying(255),
    type character varying(255) DEFAULT 'table'::character varying,
    meta text,
    schema text,
    enabled boolean DEFAULT true,
    mm boolean DEFAULT false,
    tags character varying(255),
    pinned boolean,
    deleted boolean,
    "order" real,
    description text,
    synced boolean DEFAULT false,
    fk_workspace_id character varying(20),
    created_by character varying(20),
    owned_by character varying(20),
    uuid character varying(255),
    password character varying(255),
    fk_custom_url_id character varying(20),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.nc_models_v2 OWNER TO arunachala;

--
-- Name: nc_oauth_authorization_codes; Type: TABLE; Schema: public; Owner: arunachala
--

CREATE TABLE public.nc_oauth_authorization_codes (
    code character varying(32) NOT NULL,
    fk_client_id character varying(32),
    fk_user_id character varying(20),
    code_challenge character varying(255),
    code_challenge_method character varying(10) DEFAULT 'S256'::character varying,
    redirect_uri character varying(255),
    scope character varying(255),
    state character varying(1024),
    resource character varying(255),
    granted_resources text,
    expires_at timestamp with time zone NOT NULL,
    is_used boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.nc_oauth_authorization_codes OWNER TO arunachala;

--
-- Name: nc_oauth_clients; Type: TABLE; Schema: public; Owner: arunachala
--

CREATE TABLE public.nc_oauth_clients (
    client_id character varying(32) NOT NULL,
    client_secret character varying(128),
    client_type character varying(255),
    client_name character varying(255),
    client_description text,
    client_uri character varying(255),
    logo_uri character varying(255),
    redirect_uris text,
    allowed_grant_types text,
    response_types text,
    allowed_scopes text,
    registration_access_token character varying(255),
    registration_client_uri character varying(255),
    client_id_issued_at bigint,
    client_secret_expires_at bigint,
    fk_user_id character varying(20),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.nc_oauth_clients OWNER TO arunachala;

--
-- Name: nc_oauth_tokens; Type: TABLE; Schema: public; Owner: arunachala
--

CREATE TABLE public.nc_oauth_tokens (
    id character varying(20) NOT NULL,
    fk_client_id character varying(32),
    fk_user_id character varying(20),
    access_token text,
    access_token_expires_at timestamp with time zone,
    refresh_token text,
    refresh_token_expires_at timestamp with time zone,
    resource character varying(255),
    audience character varying(255),
    granted_resources text,
    scope character varying(255),
    is_revoked boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    last_used_at timestamp with time zone
);


ALTER TABLE public.nc_oauth_tokens OWNER TO arunachala;

--
-- Name: nc_org; Type: TABLE; Schema: public; Owner: arunachala
--

CREATE TABLE public.nc_org (
    id character varying(20) NOT NULL,
    title character varying(255),
    slug character varying(255),
    fk_user_id character varying(20),
    meta text,
    image character varying(255),
    is_share_enabled boolean DEFAULT false,
    deleted boolean DEFAULT false,
    "order" real,
    fk_db_instance_id character varying(20),
    stripe_customer_id character varying(255),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.nc_org OWNER TO arunachala;

--
-- Name: nc_org_domain; Type: TABLE; Schema: public; Owner: arunachala
--

CREATE TABLE public.nc_org_domain (
    id character varying(20) NOT NULL,
    fk_org_id character varying(20),
    fk_user_id character varying(20),
    domain character varying(255),
    verified boolean,
    txt_value character varying(255),
    last_verified timestamp with time zone,
    deleted boolean DEFAULT false,
    fk_workspace_id character varying(20),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.nc_org_domain OWNER TO arunachala;

--
-- Name: nc_org_users; Type: TABLE; Schema: public; Owner: arunachala
--

CREATE TABLE public.nc_org_users (
    fk_org_id character varying(20) NOT NULL,
    fk_user_id character varying(20),
    roles character varying(255),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.nc_org_users OWNER TO arunachala;

--
-- Name: nc_permission_subjects; Type: TABLE; Schema: public; Owner: arunachala
--

CREATE TABLE public.nc_permission_subjects (
    fk_permission_id character varying(20) NOT NULL,
    subject_type character varying(255) NOT NULL,
    subject_id character varying(255) NOT NULL,
    fk_workspace_id character varying(20),
    base_id character varying(20) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.nc_permission_subjects OWNER TO arunachala;

--
-- Name: nc_permissions; Type: TABLE; Schema: public; Owner: arunachala
--

CREATE TABLE public.nc_permissions (
    id character varying(20) NOT NULL,
    fk_workspace_id character varying(20),
    base_id character varying(20) NOT NULL,
    entity character varying(255),
    entity_id character varying(255),
    permission character varying(255),
    created_by character varying(20),
    enforce_for_form boolean DEFAULT true,
    enforce_for_automation boolean DEFAULT true,
    granted_type character varying(255),
    granted_role character varying(255),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.nc_permissions OWNER TO arunachala;

--
-- Name: nc_plans; Type: TABLE; Schema: public; Owner: arunachala
--

CREATE TABLE public.nc_plans (
    id character varying(20) NOT NULL,
    title character varying(255),
    description text,
    stripe_product_id character varying(255) NOT NULL,
    is_active boolean DEFAULT true,
    prices text,
    meta text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.nc_plans OWNER TO arunachala;

--
-- Name: nc_plugins_v2; Type: TABLE; Schema: public; Owner: arunachala
--

CREATE TABLE public.nc_plugins_v2 (
    id character varying(20) NOT NULL,
    title character varying(45),
    description text,
    active boolean DEFAULT false,
    rating real,
    version character varying(255),
    docs character varying(255),
    status character varying(255) DEFAULT 'install'::character varying,
    status_details character varying(255),
    logo character varying(255),
    icon character varying(255),
    tags character varying(255),
    category character varying(255),
    input_schema text,
    input text,
    creator character varying(255),
    creator_website character varying(255),
    price character varying(255),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.nc_plugins_v2 OWNER TO arunachala;

--
-- Name: nc_principal_assignments; Type: TABLE; Schema: public; Owner: arunachala
--

CREATE TABLE public.nc_principal_assignments (
    resource_type character varying(20) NOT NULL,
    resource_id character varying(20) NOT NULL,
    principal_type character varying(20) NOT NULL,
    principal_ref_id character varying(20) NOT NULL,
    roles character varying(255) NOT NULL,
    deleted boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.nc_principal_assignments OWNER TO arunachala;

--
-- Name: nc_row_color_conditions; Type: TABLE; Schema: public; Owner: arunachala
--

CREATE TABLE public.nc_row_color_conditions (
    id character varying(20) NOT NULL,
    fk_view_id character varying(20),
    fk_workspace_id character varying(20),
    base_id character varying(20) NOT NULL,
    color character varying(20),
    nc_order real,
    is_set_as_background boolean,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.nc_row_color_conditions OWNER TO arunachala;

--
-- Name: nc_scripts; Type: TABLE; Schema: public; Owner: arunachala
--

CREATE TABLE public.nc_scripts (
    id character varying(20) NOT NULL,
    title text,
    description text,
    meta text,
    "order" real,
    base_id character varying(20) NOT NULL,
    fk_workspace_id character varying(20),
    script text,
    config text,
    created_by character varying(20),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.nc_scripts OWNER TO arunachala;

--
-- Name: nc_snapshots; Type: TABLE; Schema: public; Owner: arunachala
--

CREATE TABLE public.nc_snapshots (
    id character varying(20) NOT NULL,
    title character varying(512),
    base_id character varying(20),
    snapshot_base_id character varying(20),
    fk_workspace_id character varying(20),
    created_by character varying(20),
    status character varying(20),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.nc_snapshots OWNER TO arunachala;

--
-- Name: nc_sort_v2; Type: TABLE; Schema: public; Owner: arunachala
--

CREATE TABLE public.nc_sort_v2 (
    id character varying(20) NOT NULL,
    source_id character varying(20),
    base_id character varying(20) NOT NULL,
    fk_view_id character varying(20),
    fk_column_id character varying(20),
    direction character varying(255) DEFAULT 'false'::character varying,
    "order" real,
    fk_workspace_id character varying(20),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.nc_sort_v2 OWNER TO arunachala;

--
-- Name: nc_sources_v2; Type: TABLE; Schema: public; Owner: arunachala
--

CREATE TABLE public.nc_sources_v2 (
    id character varying(20) NOT NULL,
    base_id character varying(20) NOT NULL,
    alias character varying(255),
    config text,
    meta text,
    is_meta boolean,
    type character varying(255),
    inflection_column character varying(255),
    inflection_table character varying(255),
    enabled boolean DEFAULT true,
    "order" real,
    description character varying(255),
    erd_uuid character varying(255),
    deleted boolean DEFAULT false,
    is_schema_readonly boolean DEFAULT false,
    is_data_readonly boolean DEFAULT false,
    is_local boolean DEFAULT false,
    fk_sql_executor_id character varying(20),
    fk_workspace_id character varying(20),
    fk_integration_id character varying(20),
    is_encrypted boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.nc_sources_v2 OWNER TO arunachala;

--
-- Name: nc_sql_executor_v2; Type: TABLE; Schema: public; Owner: arunachala
--

CREATE TABLE public.nc_sql_executor_v2 (
    id character varying(20) NOT NULL,
    domain character varying(50),
    status character varying(20),
    priority integer,
    capacity integer,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.nc_sql_executor_v2 OWNER TO arunachala;

--
-- Name: nc_sso_client; Type: TABLE; Schema: public; Owner: arunachala
--

CREATE TABLE public.nc_sso_client (
    id character varying(20) NOT NULL,
    type character varying(20),
    title character varying(255),
    enabled boolean DEFAULT true,
    config text,
    fk_user_id character varying(20),
    fk_org_id character varying(20),
    deleted boolean DEFAULT false,
    "order" real,
    domain_name character varying(255),
    domain_name_verified boolean,
    fk_workspace_id character varying(20),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.nc_sso_client OWNER TO arunachala;

--
-- Name: nc_sso_client_domain; Type: TABLE; Schema: public; Owner: arunachala
--

CREATE TABLE public.nc_sso_client_domain (
    fk_sso_client_id character varying(20) NOT NULL,
    fk_org_domain_id character varying(20),
    enabled boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.nc_sso_client_domain OWNER TO arunachala;

--
-- Name: nc_store; Type: TABLE; Schema: public; Owner: arunachala
--

CREATE TABLE public.nc_store (
    id integer NOT NULL,
    base_id character varying(255),
    db_alias character varying(255) DEFAULT 'db'::character varying,
    key character varying(255),
    value text,
    type character varying(255),
    env character varying(255),
    tag character varying(255),
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


ALTER TABLE public.nc_store OWNER TO arunachala;

--
-- Name: nc_store_id_seq; Type: SEQUENCE; Schema: public; Owner: arunachala
--

CREATE SEQUENCE public.nc_store_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.nc_store_id_seq OWNER TO arunachala;

--
-- Name: nc_store_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: arunachala
--

ALTER SEQUENCE public.nc_store_id_seq OWNED BY public.nc_store.id;


--
-- Name: nc_subscriptions; Type: TABLE; Schema: public; Owner: arunachala
--

CREATE TABLE public.nc_subscriptions (
    id character varying(20) NOT NULL,
    fk_workspace_id character varying(20),
    fk_org_id character varying(20),
    fk_plan_id character varying(20) NOT NULL,
    fk_user_id character varying(20),
    stripe_subscription_id character varying(255),
    stripe_price_id character varying(255),
    seat_count integer DEFAULT 1 NOT NULL,
    status character varying(255),
    billing_cycle_anchor timestamp with time zone,
    start_at timestamp with time zone,
    trial_end_at timestamp with time zone,
    canceled_at timestamp with time zone,
    period character varying(255),
    upcoming_invoice_at timestamp with time zone,
    upcoming_invoice_due_at timestamp with time zone,
    upcoming_invoice_amount integer,
    upcoming_invoice_currency character varying(255),
    stripe_schedule_id character varying(255),
    schedule_phase_start timestamp with time zone,
    schedule_stripe_price_id character varying(255),
    schedule_fk_plan_id character varying(20),
    schedule_period character varying(255),
    schedule_type character varying(255),
    meta text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.nc_subscriptions OWNER TO arunachala;

--
-- Name: nc_sync_configs; Type: TABLE; Schema: public; Owner: arunachala
--

CREATE TABLE public.nc_sync_configs (
    id character varying(20) NOT NULL,
    fk_workspace_id character varying(20),
    base_id character varying(20) NOT NULL,
    fk_integration_id character varying(20),
    fk_model_id character varying(20),
    sync_type character varying(255),
    sync_trigger character varying(255),
    sync_trigger_cron character varying(255),
    sync_trigger_secret character varying(255),
    sync_job_id character varying(255),
    last_sync_at timestamp with time zone,
    next_sync_at timestamp with time zone,
    title character varying(255),
    sync_category character varying(255),
    fk_parent_sync_config_id character varying(20),
    on_delete_action character varying(255) DEFAULT 'mark_deleted'::character varying,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(20),
    updated_by character varying(20),
    meta text
);


ALTER TABLE public.nc_sync_configs OWNER TO arunachala;

--
-- Name: nc_sync_logs_v2; Type: TABLE; Schema: public; Owner: arunachala
--

CREATE TABLE public.nc_sync_logs_v2 (
    id character varying(20) NOT NULL,
    base_id character varying(20) NOT NULL,
    fk_sync_source_id character varying(20),
    time_taken integer,
    status character varying(255),
    status_details text,
    fk_workspace_id character varying(20),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.nc_sync_logs_v2 OWNER TO arunachala;

--
-- Name: nc_sync_mappings; Type: TABLE; Schema: public; Owner: arunachala
--

CREATE TABLE public.nc_sync_mappings (
    id character varying(20) NOT NULL,
    fk_workspace_id character varying(20),
    base_id character varying(20) NOT NULL,
    fk_sync_config_id character varying(20),
    target_table character varying(255),
    fk_model_id character varying(20),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.nc_sync_mappings OWNER TO arunachala;

--
-- Name: nc_sync_source_v2; Type: TABLE; Schema: public; Owner: arunachala
--

CREATE TABLE public.nc_sync_source_v2 (
    id character varying(20) NOT NULL,
    title character varying(255),
    type character varying(255),
    details text,
    deleted boolean,
    enabled boolean DEFAULT true,
    "order" real,
    base_id character varying(20) NOT NULL,
    fk_user_id character varying(20),
    source_id character varying(20),
    fk_workspace_id character varying(20),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.nc_sync_source_v2 OWNER TO arunachala;

--
-- Name: nc_teams; Type: TABLE; Schema: public; Owner: arunachala
--

CREATE TABLE public.nc_teams (
    id character varying(20) NOT NULL,
    title character varying(255) NOT NULL,
    meta text,
    fk_org_id character varying(20),
    fk_workspace_id character varying(20),
    created_by character varying(20),
    deleted boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.nc_teams OWNER TO arunachala;

--
-- Name: nc_usage_stats; Type: TABLE; Schema: public; Owner: arunachala
--

CREATE TABLE public.nc_usage_stats (
    fk_workspace_id character varying(20) NOT NULL,
    usage_type character varying(255) NOT NULL,
    period_start timestamp with time zone NOT NULL,
    count integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.nc_usage_stats OWNER TO arunachala;

--
-- Name: nc_user_comment_notifications_preference; Type: TABLE; Schema: public; Owner: arunachala
--

CREATE TABLE public.nc_user_comment_notifications_preference (
    id character varying(20) NOT NULL,
    row_id character varying(255),
    user_id character varying(20),
    fk_model_id character varying(20),
    source_id character varying(20),
    base_id character varying(20),
    preferences character varying(255),
    fk_workspace_id character varying(20),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.nc_user_comment_notifications_preference OWNER TO arunachala;

--
-- Name: nc_user_refresh_tokens; Type: TABLE; Schema: public; Owner: arunachala
--

CREATE TABLE public.nc_user_refresh_tokens (
    fk_user_id character varying(20),
    token character varying(255),
    meta text,
    expires_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.nc_user_refresh_tokens OWNER TO arunachala;

--
-- Name: nc_users_v2; Type: TABLE; Schema: public; Owner: arunachala
--

CREATE TABLE public.nc_users_v2 (
    id character varying(20) NOT NULL,
    email character varying(255),
    password character varying(255),
    salt character varying(255),
    invite_token character varying(255),
    invite_token_expires character varying(255),
    reset_password_expires timestamp with time zone,
    reset_password_token character varying(255),
    email_verification_token character varying(255),
    email_verified boolean,
    roles character varying(255) DEFAULT 'editor'::character varying,
    token_version character varying(255),
    blocked boolean DEFAULT false,
    blocked_reason character varying(255),
    deleted_at timestamp with time zone,
    is_deleted boolean DEFAULT false,
    meta text,
    display_name character varying(255),
    user_name character varying(255),
    bio character varying(255),
    location character varying(255),
    website character varying(255),
    avatar character varying(255),
    is_new_user boolean,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.nc_users_v2 OWNER TO arunachala;

--
-- Name: nc_views_v2; Type: TABLE; Schema: public; Owner: arunachala
--

CREATE TABLE public.nc_views_v2 (
    id character varying(20) NOT NULL,
    source_id character varying(20),
    base_id character varying(20) NOT NULL,
    fk_model_id character varying(20),
    title character varying(255),
    type integer,
    is_default boolean,
    show_system_fields boolean,
    lock_type character varying(255) DEFAULT 'collaborative'::character varying,
    uuid character varying(255),
    password character varying(255),
    show boolean,
    "order" real,
    meta text,
    description text,
    created_by character varying(20),
    owned_by character varying(20),
    fk_workspace_id character varying(20),
    attachment_mode_column_id character varying(20),
    expanded_record_mode character varying(255),
    fk_custom_url_id character varying(20),
    row_coloring_mode character varying(10),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.nc_views_v2 OWNER TO arunachala;

--
-- Name: nc_widgets_v2; Type: TABLE; Schema: public; Owner: arunachala
--

CREATE TABLE public.nc_widgets_v2 (
    id character varying(20) NOT NULL,
    fk_workspace_id character varying(20),
    base_id character varying(20) NOT NULL,
    fk_dashboard_id character varying(20) NOT NULL,
    fk_model_id character varying(20),
    fk_view_id character varying(20),
    title character varying(255) NOT NULL,
    description text,
    type character varying(50) NOT NULL,
    config text,
    meta text,
    "order" integer,
    "position" text,
    error boolean,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.nc_widgets_v2 OWNER TO arunachala;

--
-- Name: nc_workflows; Type: TABLE; Schema: public; Owner: arunachala
--

CREATE TABLE public.nc_workflows (
    id character varying(20) NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    fk_workspace_id character varying(20),
    base_id character varying(20),
    enabled boolean DEFAULT false,
    nodes text,
    edges text,
    meta text,
    "order" real,
    created_by character varying(20),
    updated_by character varying(20),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    draft text
);


ALTER TABLE public.nc_workflows OWNER TO arunachala;

--
-- Name: notification; Type: TABLE; Schema: public; Owner: arunachala
--

CREATE TABLE public.notification (
    id character varying(20) NOT NULL,
    type character varying(40),
    body text,
    is_read boolean DEFAULT false,
    is_deleted boolean DEFAULT false,
    fk_user_id character varying(20),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.notification OWNER TO arunachala;

--
-- Name: schedules; Type: TABLE; Schema: public; Owner: arunachala
--

CREATE TABLE public.schedules (
    id integer NOT NULL,
    class_id integer,
    class_name character varying,
    day_of_week character varying NOT NULL,
    start_time character varying NOT NULL,
    end_time character varying NOT NULL,
    is_active boolean,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone
);


ALTER TABLE public.schedules OWNER TO arunachala;

--
-- Name: schedules_id_seq; Type: SEQUENCE; Schema: public; Owner: arunachala
--

CREATE SEQUENCE public.schedules_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.schedules_id_seq OWNER TO arunachala;

--
-- Name: schedules_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: arunachala
--

ALTER SEQUENCE public.schedules_id_seq OWNED BY public.schedules.id;


--
-- Name: therapy_types; Type: TABLE; Schema: public; Owner: arunachala
--

CREATE TABLE public.therapy_types (
    id integer NOT NULL,
    name character varying NOT NULL,
    excerpt character varying,
    description text,
    benefits text,
    translations json,
    duration_min integer,
    image_url character varying,
    is_active boolean,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.therapy_types OWNER TO arunachala;

--
-- Name: therapy_types_id_seq; Type: SEQUENCE; Schema: public; Owner: arunachala
--

CREATE SEQUENCE public.therapy_types_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.therapy_types_id_seq OWNER TO arunachala;

--
-- Name: therapy_types_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: arunachala
--

ALTER SEQUENCE public.therapy_types_id_seq OWNED BY public.therapy_types.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: arunachala
--

CREATE TABLE public.users (
    id integer NOT NULL,
    email character varying NOT NULL,
    password_hash character varying NOT NULL,
    first_name character varying,
    last_name character varying,
    profile_picture character varying,
    role character varying,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.users OWNER TO arunachala;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: arunachala
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO arunachala;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: arunachala
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: workspace; Type: TABLE; Schema: public; Owner: arunachala
--

CREATE TABLE public.workspace (
    id character varying(20) NOT NULL,
    title character varying(255),
    description text,
    meta text,
    fk_user_id character varying(20),
    deleted boolean DEFAULT false,
    deleted_at timestamp with time zone,
    "order" real,
    status smallint DEFAULT '0'::smallint,
    message character varying(256),
    plan character varying(20) DEFAULT 'free'::character varying,
    infra_meta text,
    fk_org_id character varying(20),
    stripe_customer_id character varying(255),
    grace_period_start_at timestamp with time zone,
    api_grace_period_start_at timestamp with time zone,
    automation_grace_period_start_at timestamp with time zone,
    loyal boolean DEFAULT false,
    loyalty_discount_used boolean DEFAULT false,
    db_job_id character varying(20),
    fk_db_instance_id character varying(20),
    segment_code integer,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.workspace OWNER TO arunachala;

--
-- Name: workspace_user; Type: TABLE; Schema: public; Owner: arunachala
--

CREATE TABLE public.workspace_user (
    fk_workspace_id character varying(20) NOT NULL,
    fk_user_id character varying(20) NOT NULL,
    roles character varying(255),
    invite_token character varying(255),
    invite_accepted boolean DEFAULT false,
    deleted boolean DEFAULT false,
    deleted_at timestamp with time zone,
    "order" real,
    invited_by character varying(20),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.workspace_user OWNER TO arunachala;

--
-- Name: xc_knex_migrationsv0; Type: TABLE; Schema: public; Owner: arunachala
--

CREATE TABLE public.xc_knex_migrationsv0 (
    id integer NOT NULL,
    name character varying(255),
    batch integer,
    migration_time timestamp with time zone
);


ALTER TABLE public.xc_knex_migrationsv0 OWNER TO arunachala;

--
-- Name: xc_knex_migrationsv0_id_seq; Type: SEQUENCE; Schema: public; Owner: arunachala
--

CREATE SEQUENCE public.xc_knex_migrationsv0_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.xc_knex_migrationsv0_id_seq OWNER TO arunachala;

--
-- Name: xc_knex_migrationsv0_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: arunachala
--

ALTER SEQUENCE public.xc_knex_migrationsv0_id_seq OWNED BY public.xc_knex_migrationsv0.id;


--
-- Name: xc_knex_migrationsv0_lock; Type: TABLE; Schema: public; Owner: arunachala
--

CREATE TABLE public.xc_knex_migrationsv0_lock (
    index integer NOT NULL,
    is_locked integer
);


ALTER TABLE public.xc_knex_migrationsv0_lock OWNER TO arunachala;

--
-- Name: xc_knex_migrationsv0_lock_index_seq; Type: SEQUENCE; Schema: public; Owner: arunachala
--

CREATE SEQUENCE public.xc_knex_migrationsv0_lock_index_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.xc_knex_migrationsv0_lock_index_seq OWNER TO arunachala;

--
-- Name: xc_knex_migrationsv0_lock_index_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: arunachala
--

ALTER SEQUENCE public.xc_knex_migrationsv0_lock_index_seq OWNED BY public.xc_knex_migrationsv0_lock.index;


--
-- Name: yoga_classes; Type: TABLE; Schema: public; Owner: arunachala
--

CREATE TABLE public.yoga_classes (
    id integer NOT NULL,
    name character varying NOT NULL,
    description text,
    translations json,
    color character varying,
    age_range character varying,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.yoga_classes OWNER TO arunachala;

--
-- Name: yoga_classes_id_seq; Type: SEQUENCE; Schema: public; Owner: arunachala
--

CREATE SEQUENCE public.yoga_classes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.yoga_classes_id_seq OWNER TO arunachala;

--
-- Name: yoga_classes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: arunachala
--

ALTER SEQUENCE public.yoga_classes_id_seq OWNED BY public.yoga_classes.id;


--
-- Name: Features id; Type: DEFAULT; Schema: p90csse7pqpqhxk; Owner: arunachala
--

ALTER TABLE ONLY p90csse7pqpqhxk."Features" ALTER COLUMN id SET DEFAULT nextval('p90csse7pqpqhxk."Features_id_seq"'::regclass);


--
-- Name: Features id; Type: DEFAULT; Schema: p9j5mqhyeeb73rz; Owner: arunachala
--

ALTER TABLE ONLY p9j5mqhyeeb73rz."Features" ALTER COLUMN id SET DEFAULT nextval('p9j5mqhyeeb73rz."Features_id_seq"'::regclass);


--
-- Name: activities id; Type: DEFAULT; Schema: public; Owner: arunachala
--

ALTER TABLE ONLY public.activities ALTER COLUMN id SET DEFAULT nextval('public.activities_id_seq'::regclass);


--
-- Name: agent_config id; Type: DEFAULT; Schema: public; Owner: arunachala
--

ALTER TABLE ONLY public.agent_config ALTER COLUMN id SET DEFAULT nextval('public.agent_config_id_seq'::regclass);


--
-- Name: contents id; Type: DEFAULT; Schema: public; Owner: arunachala
--

ALTER TABLE ONLY public.contents ALTER COLUMN id SET DEFAULT nextval('public.contents_id_seq'::regclass);


--
-- Name: dashboard_activities id; Type: DEFAULT; Schema: public; Owner: arunachala
--

ALTER TABLE ONLY public.dashboard_activities ALTER COLUMN id SET DEFAULT nextval('public.dashboard_activities_id_seq'::regclass);


--
-- Name: gallery id; Type: DEFAULT; Schema: public; Owner: arunachala
--

ALTER TABLE ONLY public.gallery ALTER COLUMN id SET DEFAULT nextval('public.gallery_id_seq'::regclass);


--
-- Name: massage_types id; Type: DEFAULT; Schema: public; Owner: arunachala
--

ALTER TABLE ONLY public.massage_types ALTER COLUMN id SET DEFAULT nextval('public.massage_types_id_seq'::regclass);


--
-- Name: nc_api_tokens id; Type: DEFAULT; Schema: public; Owner: arunachala
--

ALTER TABLE ONLY public.nc_api_tokens ALTER COLUMN id SET DEFAULT nextval('public.nc_api_tokens_id_seq'::regclass);


--
-- Name: nc_store id; Type: DEFAULT; Schema: public; Owner: arunachala
--

ALTER TABLE ONLY public.nc_store ALTER COLUMN id SET DEFAULT nextval('public.nc_store_id_seq'::regclass);


--
-- Name: schedules id; Type: DEFAULT; Schema: public; Owner: arunachala
--

ALTER TABLE ONLY public.schedules ALTER COLUMN id SET DEFAULT nextval('public.schedules_id_seq'::regclass);


--
-- Name: therapy_types id; Type: DEFAULT; Schema: public; Owner: arunachala
--

ALTER TABLE ONLY public.therapy_types ALTER COLUMN id SET DEFAULT nextval('public.therapy_types_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: arunachala
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: xc_knex_migrationsv0 id; Type: DEFAULT; Schema: public; Owner: arunachala
--

ALTER TABLE ONLY public.xc_knex_migrationsv0 ALTER COLUMN id SET DEFAULT nextval('public.xc_knex_migrationsv0_id_seq'::regclass);


--
-- Name: xc_knex_migrationsv0_lock index; Type: DEFAULT; Schema: public; Owner: arunachala
--

ALTER TABLE ONLY public.xc_knex_migrationsv0_lock ALTER COLUMN index SET DEFAULT nextval('public.xc_knex_migrationsv0_lock_index_seq'::regclass);


--
-- Name: yoga_classes id; Type: DEFAULT; Schema: public; Owner: arunachala
--

ALTER TABLE ONLY public.yoga_classes ALTER COLUMN id SET DEFAULT nextval('public.yoga_classes_id_seq'::regclass);


--
-- Data for Name: Features; Type: TABLE DATA; Schema: p90csse7pqpqhxk; Owner: arunachala
--

COPY p90csse7pqpqhxk."Features" (id, created_at, updated_at, created_by, updated_by, nc_order, title) FROM stdin;
\.


--
-- Data for Name: Features; Type: TABLE DATA; Schema: p9j5mqhyeeb73rz; Owner: arunachala
--

COPY p9j5mqhyeeb73rz."Features" (id, created_at, updated_at, created_by, updated_by, nc_order, title) FROM stdin;
\.


--
-- Data for Name: activities; Type: TABLE DATA; Schema: public; Owner: arunachala
--

COPY public.activities (id, title, description, translations, type, start_date, end_date, location, price, image_url, slug, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: agent_config; Type: TABLE DATA; Schema: public; Owner: arunachala
--

COPY public.agent_config (id, tone, response_length, emoji_style, focus_area, system_instructions, is_active, updated_at) FROM stdin;
1	Asistente Amable	concise	high	info,booking	Siempre debes terminar tus respuestas con la frase: "Que el Gran Sol Central te ilumine". Si no hay ninguna clase en disponible en tu base de datos, di que no tienes ahora mismo nada.	t	2026-02-03 09:23:01.138447+00
\.


--
-- Data for Name: contents; Type: TABLE DATA; Schema: public; Owner: arunachala
--

COPY public.contents (id, title, slug, body, type, status, author_id, thumbnail_url, seo_title, seo_description, created_at, updated_at, media_url, excerpt, category, tags, translations) FROM stdin;
2	fdsfsdf	fdsfsdf-1	dsfsd	article	draft	1		\N	\N	2026-02-03 18:07:55.440272+00	\N		dfsf	general	null	null
21	yoga	yoga		article	published	1	/static/gallery/articles/f219c5cd-096c-4e11-8cc2-4c4ed0354655.webp	\N	\N	2026-02-03 23:18:56.252865+00	2026-02-03 23:18:57.218065+00			yoga	null	{"ca": {"title": "ioga"}, "en": {"title": "yoga"}}
22	yoga	yoga-1	<p>holsdsd</p>	article	published	1		\N	\N	2026-02-03 23:29:44.814256+00	2026-02-03 23:30:00.466054+00			therapy	null	{"ca": {"title": "ioga", "body": "<h1>hola</h1><h1>dsd</h1>"}, "en": {"title": "yoga", "body": "<h1>hello</h1><h1>dsd</h1>"}}
16	ererwer	ererwer		meditation	published	1	/static/gallery/articles/fb598b1e-23ec-4ebc-b7da-201a0d51607d.webp	\N	\N	2026-02-03 22:49:07.596439+00	2026-02-03 22:52:04.042322+00	/static/audio/b61fd13c-e89d-45ec-adcf-a1aec34a25ad.mp3	qqewqeq	general	null	{"ca": {"title": "ererwer", "excerpt": "qqewqeq"}, "en": {"title": "ererwer", "excerpt": "qqewqeq"}}
20	Yoga tantrico	yoga-tantrico	<p>Esto es un articulo de yoga</p>	article	published	1		\N	\N	2026-02-03 23:14:27.851634+00	2026-02-03 23:14:38.468217+00		Yoga en la casa	yoga	null	{"ca": {"title": "Ioga t\\u00e0ntic", "body": "<p>Aix\\u00f2 \\u00e9s un article d'ioga</p>", "excerpt": "Ioga a casa"}, "en": {"title": "Tantric Yoga", "body": "<p>This is an article about yoga</p>", "excerpt": "Yoga at home"}}
\.


--
-- Data for Name: dashboard_activities; Type: TABLE DATA; Schema: public; Owner: arunachala
--

COPY public.dashboard_activities (id, type, action, title, "timestamp", entity_id) FROM stdin;
\.


--
-- Data for Name: gallery; Type: TABLE DATA; Schema: public; Owner: arunachala
--

COPY public.gallery (id, url, alt_text, category, "position", created_at) FROM stdin;
1	/static/gallery/yoga/0325e244-2cee-4163-aef8-36a408c8cb84.webp	Imagen yoga	yoga	0	2026-01-27 11:33:05.441016+00
2	/static/gallery/yoga/d8fb308e-bf19-4866-a650-2d06de5ec632.webp	Imagen yoga	yoga	0	2026-01-27 11:33:05.441016+00
3	/static/gallery/yoga/60a78243-88c0-488b-95ce-09316abf1cc2.webp	Imagen yoga	yoga	0	2026-01-27 11:33:05.441016+00
4	/static/gallery/therapies/c6f80fa9-617c-4713-886c-8527d1d53840.webp	Imagen therapies	therapies	0	2026-01-27 11:33:05.441016+00
6	/static/gallery/therapies/test_manual.webp	Imagen therapies	therapies	0	2026-01-27 11:33:05.441016+00
7	/static/gallery/therapies/test_manual_2.webp	Imagen therapies	therapies	0	2026-01-27 11:33:05.441016+00
11	/static/gallery/center/cb3f5998-7d85-4654-b2a0-4a89781ed1ac.webp		center	1	2026-02-03 11:17:21.816306+00
10	/static/gallery/center/37985dd7-7d8c-4698-a451-ac0805945c45.webp	Imagen center [MAIN]	center	0	2026-01-27 11:33:05.441016+00
12	/static/gallery/center/ca23e245-c18a-42eb-9865-9b2ada8433c6.webp		center	2	2026-02-03 11:25:32.873124+00
13	/static/gallery/center/1dc51c25-5bea-4f9d-8baf-8d1dab6ce945.webp		center	3	2026-02-03 11:25:35.762374+00
14	/static/gallery/center/5ae44929-e5ec-450b-9651-0f183d800fe2.webp		center	4	2026-02-03 11:25:38.580971+00
15	/static/gallery/center/97f769c7-eb0b-4b36-9933-f67c132b8eb2.webp		center	5	2026-02-03 11:25:40.93512+00
16	/static/gallery/home/99af1e49-a300-4997-b5f1-ca6c73501b05.webp		home	1	2026-02-03 13:00:47.544334+00
18	/static/gallery/home/abfd2b76-02e9-4d9c-b4ac-65020c7d3030.webp		home	2	2026-02-03 13:01:22.932909+00
19	/static/gallery/home/25f36e05-68a7-4545-8e34-a92b4ebd02e6.webp		home	3	2026-02-03 20:16:39.740315+00
20	/static/gallery/home/2316aee3-6827-4198-a43e-abb90b6c84f5.webp	Nuestro Espacio	home	0	2026-02-03 22:17:48.498046+00
\.


--
-- Data for Name: massage_types; Type: TABLE DATA; Schema: public; Owner: arunachala
--

COPY public.massage_types (id, name, excerpt, description, benefits, translations, duration_min, image_url, is_active, created_at) FROM stdin;
4	Masaje Tailandés	Yoga pasivo y presiones.	\N	\N	{"ca": {"name": "Massatge Tailand\\u00e8s", "excerpt": "Ioga passiu i pressions."}, "en": {"name": "Thai Massage", "excerpt": "Passive yoga and pressures."}}	90	/static/gallery/therapies/test_manual_3.webp	t	2026-01-27 11:33:05.441016+00
7	Masaje suave	Masaje lento que dura poco	Es bueno para la circulacion	Muchos beneficios para la salud	{"ca": {"name": "Massatge suau", "description": "\\u00c9s bo per a la circulaci\\u00f3", "excerpt": "Massatge lent que dura poc", "benefits": "Molts beneficis per a la salut"}, "en": {"name": "Gentle massage", "description": "It is good for circulation", "excerpt": "Slow massage that lasts a short time", "benefits": "Many health benefits"}}	\N	\N	t	2026-02-03 10:11:40.84497+00
15	gffgggggg	fgfgfgggg	fgfggf	\N	{"ca": {"name": "gffgggggg", "excerpt": "fgfgfgggg", "description": "fgfggf"}, "en": {"name": "gffgggggg", "excerpt": "fgfgfgggg", "description": "fgfggf"}}	\N	\N	t	2026-02-03 20:31:39.274097+00
9	Masaje reparador	Un masaje que repara todo el cuerpo	\N	Grandes beneficios	{"ca": {"name": "Massatge reparador", "excerpt": "Un massatge que repara tot el cos", "benefits": "Grans beneficis"}, "en": {"name": "Restorative massage", "excerpt": "A massage that repairs the whole body", "benefits": "Great benefits"}}	\N	\N	t	2026-02-03 13:02:51.725832+00
\.


--
-- Data for Name: nc_api_tokens; Type: TABLE DATA; Schema: public; Owner: arunachala
--

COPY public.nc_api_tokens (id, base_id, db_alias, description, permissions, token, expiry, enabled, fk_user_id, fk_workspace_id, fk_sso_client_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: nc_audit_v2; Type: TABLE DATA; Schema: public; Owner: arunachala
--

COPY public.nc_audit_v2 (id, "user", ip, source_id, base_id, fk_model_id, row_id, op_type, op_sub_type, status, description, details, fk_user_id, fk_ref_id, fk_parent_id, fk_workspace_id, fk_org_id, user_agent, version, old_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: nc_automation_executions; Type: TABLE DATA; Schema: public; Owner: arunachala
--

COPY public.nc_automation_executions (id, fk_workspace_id, base_id, fk_workflow_id, workflow_data, execution_data, finished, started_at, finished_at, status, created_at, updated_at, resume_at) FROM stdin;
\.


--
-- Data for Name: nc_automations; Type: TABLE DATA; Schema: public; Owner: arunachala
--

COPY public.nc_automations (id, title, description, meta, fk_workspace_id, base_id, "order", type, created_by, updated_by, created_at, updated_at, enabled, nodes, edges, draft, config, script) FROM stdin;
\.


--
-- Data for Name: nc_base_users_v2; Type: TABLE DATA; Schema: public; Owner: arunachala
--

COPY public.nc_base_users_v2 (base_id, fk_user_id, roles, starred, pinned, "group", color, "order", hidden, opened_date, invited_by, fk_workspace_id, created_at, updated_at) FROM stdin;
p90csse7pqpqhxk	us8wts0ifr88la9t	owner	\N	\N	\N	\N	\N	\N	\N	\N	wz8f9jsr	2026-01-26 11:37:54+00	2026-01-26 11:37:54+00
psoq8r0ntwwuqxb	us8wts0ifr88la9t	owner	\N	\N	\N	\N	\N	\N	\N	\N	wz8f9jsr	2026-01-26 11:38:14+00	2026-01-26 11:38:14+00
\.


--
-- Data for Name: nc_bases_v2; Type: TABLE DATA; Schema: public; Owner: arunachala
--

COPY public.nc_bases_v2 (id, title, prefix, status, description, meta, color, uuid, password, roles, deleted, is_meta, "order", type, fk_workspace_id, is_snapshot, fk_custom_url_id, version, default_role, created_at, updated_at) FROM stdin;
p90csse7pqpqhxk	Getting Started		\N	\N	{"iconColor":"#36BFFF"}	\N	\N	\N	\N	t	t	1	database	wz8f9jsr	f	\N	2	\N	2026-01-26 11:37:54+00	2026-01-26 11:38:07+00
psoq8r0ntwwuqxb	Arunachala		\N	\N	{"iconColor":"#FCBE3A"}	\N	\N	\N	\N	f	t	2	database	wz8f9jsr	f	\N	2	\N	2026-01-26 11:38:14+00	2026-01-26 11:38:14+00
\.


--
-- Data for Name: nc_calendar_view_columns_v2; Type: TABLE DATA; Schema: public; Owner: arunachala
--

COPY public.nc_calendar_view_columns_v2 (id, base_id, source_id, fk_view_id, fk_column_id, show, bold, underline, italic, "order", fk_workspace_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: nc_calendar_view_range_v2; Type: TABLE DATA; Schema: public; Owner: arunachala
--

COPY public.nc_calendar_view_range_v2 (id, fk_view_id, fk_to_column_id, label, fk_from_column_id, base_id, fk_workspace_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: nc_calendar_view_v2; Type: TABLE DATA; Schema: public; Owner: arunachala
--

COPY public.nc_calendar_view_v2 (fk_view_id, base_id, source_id, title, fk_cover_image_col_id, meta, fk_workspace_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: nc_col_barcode_v2; Type: TABLE DATA; Schema: public; Owner: arunachala
--

COPY public.nc_col_barcode_v2 (id, fk_column_id, fk_barcode_value_column_id, barcode_format, deleted, base_id, fk_workspace_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: nc_col_button_v2; Type: TABLE DATA; Schema: public; Owner: arunachala
--

COPY public.nc_col_button_v2 (id, base_id, type, label, theme, color, icon, formula, formula_raw, error, parsed_tree, fk_webhook_id, fk_column_id, fk_integration_id, model, output_column_ids, fk_workspace_id, fk_script_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: nc_col_formula_v2; Type: TABLE DATA; Schema: public; Owner: arunachala
--

COPY public.nc_col_formula_v2 (id, fk_column_id, formula, formula_raw, error, deleted, "order", parsed_tree, base_id, fk_workspace_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: nc_col_long_text_v2; Type: TABLE DATA; Schema: public; Owner: arunachala
--

COPY public.nc_col_long_text_v2 (id, fk_workspace_id, base_id, fk_model_id, fk_column_id, fk_integration_id, model, prompt, prompt_raw, error, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: nc_col_lookup_v2; Type: TABLE DATA; Schema: public; Owner: arunachala
--

COPY public.nc_col_lookup_v2 (id, fk_column_id, fk_relation_column_id, fk_lookup_column_id, deleted, base_id, fk_workspace_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: nc_col_qrcode_v2; Type: TABLE DATA; Schema: public; Owner: arunachala
--

COPY public.nc_col_qrcode_v2 (id, fk_column_id, fk_qr_value_column_id, deleted, "order", base_id, fk_workspace_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: nc_col_relations_v2; Type: TABLE DATA; Schema: public; Owner: arunachala
--

COPY public.nc_col_relations_v2 (id, ref_db_alias, type, virtual, db_type, fk_column_id, fk_related_model_id, fk_child_column_id, fk_parent_column_id, fk_mm_model_id, fk_mm_child_column_id, fk_mm_parent_column_id, ur, dr, fk_index_name, deleted, fk_target_view_id, base_id, fk_workspace_id, fk_related_base_id, fk_mm_base_id, fk_related_source_id, fk_mm_source_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: nc_col_rollup_v2; Type: TABLE DATA; Schema: public; Owner: arunachala
--

COPY public.nc_col_rollup_v2 (id, fk_column_id, fk_relation_column_id, fk_rollup_column_id, rollup_function, deleted, base_id, fk_workspace_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: nc_col_select_options_v2; Type: TABLE DATA; Schema: public; Owner: arunachala
--

COPY public.nc_col_select_options_v2 (id, fk_column_id, title, color, "order", base_id, fk_workspace_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: nc_columns_v2; Type: TABLE DATA; Schema: public; Owner: arunachala
--

COPY public.nc_columns_v2 (id, source_id, base_id, fk_model_id, title, column_name, uidt, dt, np, ns, clen, cop, pk, pv, rqd, un, ct, ai, "unique", cdf, cc, csn, dtx, dtxp, dtxs, au, validate, virtual, deleted, system, "order", meta, description, readonly, fk_workspace_id, custom_index_name, created_at, updated_at, internal_meta) FROM stdin;
ctpkqnzurijc4qt	bk13whqq4v4i14b	p90csse7pqpqhxk	m7u3pd3fzfkbf37	Id	id	ID	int4	\N	\N	\N	\N	t	\N	t	t	\N	t	\N	\N	\N	\N	specificType	\N	\N	\N	\N	\N	\N	f	1	{}	\N	f	wz8f9jsr	\N	2026-01-26 11:37:54+00	2026-01-26 11:37:54+00	\N
c12ctcip6mcg9k6	bk13whqq4v4i14b	p90csse7pqpqhxk	m7u3pd3fzfkbf37	CreatedAt	created_at	CreatedTime	timestamp	\N	\N	\N	\N	f	\N	f	f	\N	f	\N	\N	\N	\N	specificType		 	\N	\N	\N	\N	t	2	{}	\N	f	wz8f9jsr	\N	2026-01-26 11:37:54+00	2026-01-26 11:37:54+00	\N
co068ynze3b2xot	bk13whqq4v4i14b	p90csse7pqpqhxk	m7u3pd3fzfkbf37	UpdatedAt	updated_at	LastModifiedTime	timestamp	\N	\N	\N	\N	f	\N	f	f	\N	f	\N	\N	\N	\N	specificType		 	\N	\N	\N	\N	t	3	{}	\N	f	wz8f9jsr	\N	2026-01-26 11:37:54+00	2026-01-26 11:37:54+00	\N
ch5l36k9khifp1i	bk13whqq4v4i14b	p90csse7pqpqhxk	m7u3pd3fzfkbf37	nc_created_by	created_by	CreatedBy	character varying	\N	\N	\N	\N	f	\N	f	f	\N	f	\N	\N	\N	\N	specificType	\N	\N	\N	\N	\N	\N	t	4	{}	\N	f	wz8f9jsr	\N	2026-01-26 11:37:54+00	2026-01-26 11:37:54+00	\N
ckfxjijcdkpevil	bk13whqq4v4i14b	p90csse7pqpqhxk	m7u3pd3fzfkbf37	nc_updated_by	updated_by	LastModifiedBy	character varying	\N	\N	\N	\N	f	\N	f	f	\N	f	\N	\N	\N	\N	specificType	\N	\N	\N	\N	\N	\N	t	5	{}	\N	f	wz8f9jsr	\N	2026-01-26 11:37:54+00	2026-01-26 11:37:54+00	\N
crmdq273ddq3ww5	bk13whqq4v4i14b	p90csse7pqpqhxk	m7u3pd3fzfkbf37	nc_order	nc_order	Order	numeric	\N	\N	\N	\N	f	\N	f	f	\N	f	\N	\N	\N	\N	specificType	\N	\N	\N	\N	\N	\N	t	6	{}	\N	f	wz8f9jsr	\N	2026-01-26 11:37:54+00	2026-01-26 11:37:54+00	\N
cerid4aj4d3zfsr	bk13whqq4v4i14b	p90csse7pqpqhxk	m7u3pd3fzfkbf37	Title	title	SingleLineText	text	\N	\N	\N	\N	f	t	f	f	\N	f	\N	\N	\N	\N	specificType			\N	\N	\N	\N	\N	7	{}	\N	f	wz8f9jsr	\N	2026-01-26 11:37:54+00	2026-01-26 11:37:54+00	\N
\.


--
-- Data for Name: nc_comment_reactions; Type: TABLE DATA; Schema: public; Owner: arunachala
--

COPY public.nc_comment_reactions (id, row_id, comment_id, source_id, fk_model_id, base_id, reaction, created_by, fk_workspace_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: nc_comments; Type: TABLE DATA; Schema: public; Owner: arunachala
--

COPY public.nc_comments (id, row_id, comment, created_by, created_by_email, resolved_by, resolved_by_email, parent_comment_id, source_id, base_id, fk_model_id, is_deleted, fk_workspace_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: nc_custom_urls_v2; Type: TABLE DATA; Schema: public; Owner: arunachala
--

COPY public.nc_custom_urls_v2 (id, fk_workspace_id, base_id, fk_model_id, view_id, original_path, custom_path, fk_dashboard_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: nc_dashboards_v2; Type: TABLE DATA; Schema: public; Owner: arunachala
--

COPY public.nc_dashboards_v2 (id, fk_workspace_id, base_id, title, description, meta, "order", created_by, owned_by, uuid, password, fk_custom_url_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: nc_data_reflection; Type: TABLE DATA; Schema: public; Owner: arunachala
--

COPY public.nc_data_reflection (id, fk_workspace_id, username, password, database, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: nc_db_servers; Type: TABLE DATA; Schema: public; Owner: arunachala
--

COPY public.nc_db_servers (id, title, is_shared, max_tenant_count, current_tenant_count, config, conditions, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: nc_dependency_tracker; Type: TABLE DATA; Schema: public; Owner: arunachala
--

COPY public.nc_dependency_tracker (id, fk_workspace_id, base_id, source_type, source_id, dependent_type, dependent_id, created_at, updated_at, queryable_field_0, queryable_field_1, meta, queryable_field_2) FROM stdin;
\.


--
-- Data for Name: nc_disabled_models_for_role_v2; Type: TABLE DATA; Schema: public; Owner: arunachala
--

COPY public.nc_disabled_models_for_role_v2 (id, source_id, base_id, fk_view_id, role, disabled, fk_workspace_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: nc_extensions; Type: TABLE DATA; Schema: public; Owner: arunachala
--

COPY public.nc_extensions (id, base_id, fk_user_id, extension_id, title, kv_store, meta, "order", fk_workspace_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: nc_file_references; Type: TABLE DATA; Schema: public; Owner: arunachala
--

COPY public.nc_file_references (id, storage, file_url, file_size, fk_user_id, fk_workspace_id, base_id, source_id, fk_model_id, fk_column_id, is_external, deleted, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: nc_filter_exp_v2; Type: TABLE DATA; Schema: public; Owner: arunachala
--

COPY public.nc_filter_exp_v2 (id, source_id, base_id, fk_view_id, fk_hook_id, fk_column_id, fk_parent_id, logical_op, comparison_op, value, is_group, "order", comparison_sub_op, fk_link_col_id, fk_value_col_id, fk_parent_column_id, fk_workspace_id, fk_row_color_condition_id, fk_widget_id, meta, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: nc_follower; Type: TABLE DATA; Schema: public; Owner: arunachala
--

COPY public.nc_follower (fk_user_id, fk_follower_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: nc_form_view_columns_v2; Type: TABLE DATA; Schema: public; Owner: arunachala
--

COPY public.nc_form_view_columns_v2 (id, source_id, base_id, fk_view_id, fk_column_id, uuid, label, help, description, required, show, "order", meta, enable_scanner, fk_workspace_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: nc_form_view_v2; Type: TABLE DATA; Schema: public; Owner: arunachala
--

COPY public.nc_form_view_v2 (source_id, base_id, fk_view_id, heading, subheading, success_msg, redirect_url, redirect_after_secs, email, submit_another_form, show_blank_form, uuid, banner_image_url, logo_url, meta, fk_workspace_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: nc_gallery_view_columns_v2; Type: TABLE DATA; Schema: public; Owner: arunachala
--

COPY public.nc_gallery_view_columns_v2 (id, source_id, base_id, fk_view_id, fk_column_id, uuid, label, help, show, "order", fk_workspace_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: nc_gallery_view_v2; Type: TABLE DATA; Schema: public; Owner: arunachala
--

COPY public.nc_gallery_view_v2 (source_id, base_id, fk_view_id, next_enabled, prev_enabled, cover_image_idx, fk_cover_image_col_id, cover_image, restrict_types, restrict_size, restrict_number, public, dimensions, responsive_columns, meta, fk_workspace_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: nc_grid_view_columns_v2; Type: TABLE DATA; Schema: public; Owner: arunachala
--

COPY public.nc_grid_view_columns_v2 (id, fk_view_id, fk_column_id, source_id, base_id, uuid, label, help, width, show, "order", group_by, group_by_order, group_by_sort, aggregation, fk_workspace_id, created_at, updated_at) FROM stdin;
nchtr253ri58ifrn	vwspqn03x3f7jcrh	ctpkqnzurijc4qt	bk13whqq4v4i14b	p90csse7pqpqhxk	\N	\N	\N	200px	t	1	\N	\N	\N	none	wz8f9jsr	2026-01-26 11:37:54+00	2026-01-26 11:37:54+00
nc8p4l5eb53aj8df	vwspqn03x3f7jcrh	c12ctcip6mcg9k6	bk13whqq4v4i14b	p90csse7pqpqhxk	\N	\N	\N	200px	t	2	\N	\N	\N	none	wz8f9jsr	2026-01-26 11:37:54+00	2026-01-26 11:37:54+00
nc6unpdgav9ru9dt	vwspqn03x3f7jcrh	co068ynze3b2xot	bk13whqq4v4i14b	p90csse7pqpqhxk	\N	\N	\N	200px	t	3	\N	\N	\N	none	wz8f9jsr	2026-01-26 11:37:54+00	2026-01-26 11:37:54+00
ncq5tjcfqm7osv9g	vwspqn03x3f7jcrh	ch5l36k9khifp1i	bk13whqq4v4i14b	p90csse7pqpqhxk	\N	\N	\N	200px	t	4	\N	\N	\N	none	wz8f9jsr	2026-01-26 11:37:54+00	2026-01-26 11:37:54+00
nc2tx1a1a5ve8j3c	vwspqn03x3f7jcrh	ckfxjijcdkpevil	bk13whqq4v4i14b	p90csse7pqpqhxk	\N	\N	\N	200px	t	5	\N	\N	\N	none	wz8f9jsr	2026-01-26 11:37:54+00	2026-01-26 11:37:54+00
ncwlx1ipmoahog1u	vwspqn03x3f7jcrh	crmdq273ddq3ww5	bk13whqq4v4i14b	p90csse7pqpqhxk	\N	\N	\N	200px	t	6	\N	\N	\N	none	wz8f9jsr	2026-01-26 11:37:54+00	2026-01-26 11:37:54+00
ncp8dl40584dunwx	vwspqn03x3f7jcrh	cerid4aj4d3zfsr	bk13whqq4v4i14b	p90csse7pqpqhxk	\N	\N	\N	200px	t	7	\N	\N	\N	none	wz8f9jsr	2026-01-26 11:37:54+00	2026-01-26 11:37:54+00
\.


--
-- Data for Name: nc_grid_view_v2; Type: TABLE DATA; Schema: public; Owner: arunachala
--

COPY public.nc_grid_view_v2 (fk_view_id, source_id, base_id, uuid, meta, row_height, fk_workspace_id, created_at, updated_at) FROM stdin;
vwspqn03x3f7jcrh	bk13whqq4v4i14b	p90csse7pqpqhxk	\N	\N	\N	wz8f9jsr	2026-01-26 11:37:54+00	2026-01-26 11:37:54+00
\.


--
-- Data for Name: nc_hook_logs_v2; Type: TABLE DATA; Schema: public; Owner: arunachala
--

COPY public.nc_hook_logs_v2 (id, source_id, base_id, fk_hook_id, type, event, operation, test_call, payload, conditions, notification, error_code, error_message, error, execution_time, response, triggered_by, fk_workspace_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: nc_hook_trigger_fields; Type: TABLE DATA; Schema: public; Owner: arunachala
--

COPY public.nc_hook_trigger_fields (fk_hook_id, fk_column_id, base_id, fk_workspace_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: nc_hooks_v2; Type: TABLE DATA; Schema: public; Owner: arunachala
--

COPY public.nc_hooks_v2 (id, source_id, base_id, fk_model_id, title, description, env, type, event, operation, async, payload, url, headers, condition, notification, retries, retry_interval, timeout, active, version, trigger_field, fk_workspace_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: nc_installations; Type: TABLE DATA; Schema: public; Owner: arunachala
--

COPY public.nc_installations (id, fk_subscription_id, licensed_to, license_key, installation_secret, installed_at, last_seen_at, expires_at, license_type, status, seat_count, config, meta, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: nc_integrations_store_v2; Type: TABLE DATA; Schema: public; Owner: arunachala
--

COPY public.nc_integrations_store_v2 (id, fk_integration_id, type, sub_type, fk_workspace_id, fk_user_id, created_at, updated_at, slot_0, slot_1, slot_2, slot_3, slot_4, slot_5, slot_6, slot_7, slot_8, slot_9) FROM stdin;
\.


--
-- Data for Name: nc_integrations_v2; Type: TABLE DATA; Schema: public; Owner: arunachala
--

COPY public.nc_integrations_v2 (id, title, config, meta, type, sub_type, fk_workspace_id, is_private, deleted, created_by, "order", is_default, is_encrypted, is_global, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: nc_jobs; Type: TABLE DATA; Schema: public; Owner: arunachala
--

COPY public.nc_jobs (id, job, status, result, fk_user_id, fk_workspace_id, base_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: nc_kanban_view_columns_v2; Type: TABLE DATA; Schema: public; Owner: arunachala
--

COPY public.nc_kanban_view_columns_v2 (id, source_id, base_id, fk_view_id, fk_column_id, uuid, label, help, show, "order", fk_workspace_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: nc_kanban_view_v2; Type: TABLE DATA; Schema: public; Owner: arunachala
--

COPY public.nc_kanban_view_v2 (fk_view_id, source_id, base_id, show, "order", uuid, title, public, password, show_all_fields, fk_grp_col_id, fk_cover_image_col_id, meta, fk_workspace_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: nc_map_view_columns_v2; Type: TABLE DATA; Schema: public; Owner: arunachala
--

COPY public.nc_map_view_columns_v2 (id, base_id, project_id, fk_view_id, fk_column_id, uuid, label, help, show, "order", fk_workspace_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: nc_map_view_v2; Type: TABLE DATA; Schema: public; Owner: arunachala
--

COPY public.nc_map_view_v2 (fk_view_id, source_id, base_id, uuid, title, fk_geo_data_col_id, meta, fk_workspace_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: nc_mcp_tokens; Type: TABLE DATA; Schema: public; Owner: arunachala
--

COPY public.nc_mcp_tokens (id, title, base_id, token, fk_workspace_id, "order", fk_user_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: nc_model_stats_v2; Type: TABLE DATA; Schema: public; Owner: arunachala
--

COPY public.nc_model_stats_v2 (fk_workspace_id, fk_model_id, row_count, is_external, base_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: nc_models_v2; Type: TABLE DATA; Schema: public; Owner: arunachala
--

COPY public.nc_models_v2 (id, source_id, base_id, table_name, title, type, meta, schema, enabled, mm, tags, pinned, deleted, "order", description, synced, fk_workspace_id, created_by, owned_by, uuid, password, fk_custom_url_id, created_at, updated_at) FROM stdin;
m7u3pd3fzfkbf37	bk13whqq4v4i14b	p90csse7pqpqhxk	Features	Features	table	\N	\N	t	f	\N	\N	\N	1	\N	f	wz8f9jsr	\N	\N	\N	\N	\N	2026-01-26 11:37:54+00	2026-01-26 11:37:54+00
\.


--
-- Data for Name: nc_oauth_authorization_codes; Type: TABLE DATA; Schema: public; Owner: arunachala
--

COPY public.nc_oauth_authorization_codes (code, fk_client_id, fk_user_id, code_challenge, code_challenge_method, redirect_uri, scope, state, resource, granted_resources, expires_at, is_used, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: nc_oauth_clients; Type: TABLE DATA; Schema: public; Owner: arunachala
--

COPY public.nc_oauth_clients (client_id, client_secret, client_type, client_name, client_description, client_uri, logo_uri, redirect_uris, allowed_grant_types, response_types, allowed_scopes, registration_access_token, registration_client_uri, client_id_issued_at, client_secret_expires_at, fk_user_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: nc_oauth_tokens; Type: TABLE DATA; Schema: public; Owner: arunachala
--

COPY public.nc_oauth_tokens (id, fk_client_id, fk_user_id, access_token, access_token_expires_at, refresh_token, refresh_token_expires_at, resource, audience, granted_resources, scope, is_revoked, created_at, updated_at, last_used_at) FROM stdin;
\.


--
-- Data for Name: nc_org; Type: TABLE DATA; Schema: public; Owner: arunachala
--

COPY public.nc_org (id, title, slug, fk_user_id, meta, image, is_share_enabled, deleted, "order", fk_db_instance_id, stripe_customer_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: nc_org_domain; Type: TABLE DATA; Schema: public; Owner: arunachala
--

COPY public.nc_org_domain (id, fk_org_id, fk_user_id, domain, verified, txt_value, last_verified, deleted, fk_workspace_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: nc_org_users; Type: TABLE DATA; Schema: public; Owner: arunachala
--

COPY public.nc_org_users (fk_org_id, fk_user_id, roles, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: nc_permission_subjects; Type: TABLE DATA; Schema: public; Owner: arunachala
--

COPY public.nc_permission_subjects (fk_permission_id, subject_type, subject_id, fk_workspace_id, base_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: nc_permissions; Type: TABLE DATA; Schema: public; Owner: arunachala
--

COPY public.nc_permissions (id, fk_workspace_id, base_id, entity, entity_id, permission, created_by, enforce_for_form, enforce_for_automation, granted_type, granted_role, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: nc_plans; Type: TABLE DATA; Schema: public; Owner: arunachala
--

COPY public.nc_plans (id, title, description, stripe_product_id, is_active, prices, meta, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: nc_plugins_v2; Type: TABLE DATA; Schema: public; Owner: arunachala
--

COPY public.nc_plugins_v2 (id, title, description, active, rating, version, docs, status, status_details, logo, icon, tags, category, input_schema, input, creator, creator_website, price, created_at, updated_at) FROM stdin;
slack	Slack	Slack brings team communication and collaboration into one place so you can get more work done, whether you belong to a large enterprise or a small business. 	f	\N	0.0.1	\N	install	\N	plugins/slack.webp	\N	Chat	Chat	{"title":"Configure Slack","array":true,"items":[{"key":"channel","label":"Channel Name","placeholder":"Channel Name","type":"SingleLineText","required":true},{"key":"webhook_url","label":"Webhook URL","placeholder":"Webhook URL","type":"Password","required":true}],"actions":[{"label":"Test","placeholder":"Test","key":"test","actionType":"TEST","type":"Button"},{"label":"Save","placeholder":"Save","key":"save","actionType":"SUBMIT","type":"Button"}],"msgOnInstall":"Successfully installed and Slack is enabled for notification.","msgOnUninstall":""}	\N	\N	\N	\N	2026-01-26 09:32:33+00	2026-01-26 09:32:33+00
ms-teams	Microsoft Teams	Microsoft Teams is for everyone · Instantly go from group chat to video call with the touch of a button.	f	\N	0.0.1	\N	install	\N	plugins/teams.ico	\N	Chat	Chat	{"title":"Configure Microsoft Teams","array":true,"items":[{"key":"channel","label":"Channel Name","placeholder":"Channel Name","type":"SingleLineText","required":true},{"key":"webhook_url","label":"Webhook URL","placeholder":"Webhook URL","type":"Password","required":true}],"actions":[{"label":"Test","placeholder":"Test","key":"test","actionType":"TEST","type":"Button"},{"label":"Save","placeholder":"Save","key":"save","actionType":"SUBMIT","type":"Button"}],"msgOnInstall":"Successfully installed and Microsoft Teams is enabled for notification.","msgOnUninstall":""}	\N	\N	\N	\N	2026-01-26 09:32:33+00	2026-01-26 09:32:33+00
discord	Discord	Discord is the easiest way to talk over voice, video, and text. Talk, chat, hang out, and stay close with your friends and communities.	f	\N	0.0.1	\N	install	\N	plugins/discord.png	\N	Chat	Chat	{"title":"Configure Discord","array":true,"items":[{"key":"channel","label":"Channel Name","placeholder":"Channel Name","type":"SingleLineText","required":true},{"key":"webhook_url","label":"Webhook URL","type":"Password","placeholder":"Webhook URL","required":true}],"actions":[{"label":"Test","placeholder":"Test","key":"test","actionType":"TEST","type":"Button"},{"label":"Save","placeholder":"Save","key":"save","actionType":"SUBMIT","type":"Button"}],"msgOnInstall":"Successfully installed and Discord is enabled for notification.","msgOnUninstall":""}	\N	\N	\N	\N	2026-01-26 09:32:33+00	2026-01-26 09:32:33+00
twilio-whatsapp	Whatsapp Twilio	With Twilio, unite communications and strengthen customer relationships across your business – from marketing and sales to customer service and operations.	f	\N	0.0.1	\N	install	\N	plugins/whatsapp.png	\N	Chat	Twilio	{"title":"Configure Twilio","items":[{"key":"sid","label":"Account SID","placeholder":"Account SID","type":"SingleLineText","required":true},{"key":"token","label":"Auth Token","placeholder":"Auth Token","type":"Password","required":true},{"key":"from","label":"From Phone Number","placeholder":"From Phone Number","type":"SingleLineText","required":true}],"actions":[{"label":"Test","placeholder":"Test","key":"test","actionType":"TEST","type":"Button"},{"label":"Save","placeholder":"Save","key":"save","actionType":"SUBMIT","type":"Button"}],"msgOnInstall":"Successfully installed and Whatsapp Twilio is enabled for notification.","msgOnUninstall":""}	\N	\N	\N	\N	2026-01-26 09:32:33+00	2026-01-26 09:32:33+00
twilio	Twilio	With Twilio, unite communications and strengthen customer relationships across your business – from marketing and sales to customer service and operations.	f	\N	0.0.1	\N	install	\N	plugins/twilio.png	\N	Chat	Twilio	{"title":"Configure Twilio","items":[{"key":"sid","label":"Account SID","placeholder":"Account SID","type":"SingleLineText","required":true},{"key":"token","label":"Auth Token","placeholder":"Auth Token","type":"Password","required":true},{"key":"from","label":"From Phone Number","placeholder":"From Phone Number","type":"SingleLineText","required":true}],"actions":[{"label":"Test","placeholder":"Test","key":"test","actionType":"TEST","type":"Button"},{"label":"Save","placeholder":"Save","key":"save","actionType":"SUBMIT","type":"Button"}],"msgOnInstall":"Successfully installed and Twilio is enabled for notification.","msgOnUninstall":""}	\N	\N	\N	\N	2026-01-26 09:32:33+00	2026-01-26 09:32:33+00
aws-s3	S3	Amazon Simple Storage Service (Amazon S3) is an object storage service that offers industry-leading scalability, data availability, security, and performance.	f	\N	0.0.6	\N	install	\N	plugins/s3.png	\N	Storage	Storage	{"title":"Configure Amazon S3","items":[{"key":"bucket","label":"Bucket Name","placeholder":"Bucket Name","type":"SingleLineText","required":true},{"key":"region","label":"Region","placeholder":"Region","type":"SingleLineText","required":true},{"key":"endpoint","label":"Endpoint","placeholder":"Endpoint","type":"SingleLineText","required":false},{"key":"access_key","label":"Access Key","placeholder":"Access Key","type":"SingleLineText","required":false},{"key":"access_secret","label":"Access Secret","placeholder":"Access Secret","type":"Password","required":false},{"key":"acl","label":"Access Control Lists (ACL)","placeholder":"","type":"SingleLineText","required":false},{"key":"force_path_style","label":"Force Path Style","placeholder":"Default set to false","type":"Checkbox","required":false}],"actions":[{"label":"Test","placeholder":"Test","key":"test","actionType":"TEST","type":"Button"},{"label":"Save","placeholder":"Save","key":"save","actionType":"SUBMIT","type":"Button"}],"msgOnInstall":"Successfully configured! Attachments will now be stored in AWS S3.","msgOnUninstall":""}	\N	\N	\N	\N	2026-01-26 09:32:33+00	2026-01-26 09:32:33+00
minio	Minio	MinIO is a High Performance Object Storage released under Apache License v2.0. It is API compatible with Amazon S3 cloud storage service.	f	\N	0.0.5	\N	install	\N	plugins/minio.png	\N	Storage	Storage	{"title":"Configure Minio","items":[{"key":"endPoint","label":"Minio Endpoint","placeholder":"Minio Endpoint","type":"SingleLineText","required":true,"help_text":"Hostnames can’t include underscores (_) due to DNS standard limitations. Update the hostname if you see an Invalid endpoint error."},{"key":"port","label":"Port","placeholder":"Port","type":"Number","required":true},{"key":"bucket","label":"Bucket Name","placeholder":"Bucket Name","type":"SingleLineText","required":true},{"key":"access_key","label":"Access Key","placeholder":"Access Key","type":"SingleLineText","required":true},{"key":"access_secret","label":"Access Secret","placeholder":"Access Secret","type":"Password","required":true},{"key":"ca","label":"Ca","placeholder":"Ca","type":"LongText"},{"key":"useSSL","label":"Use SSL","placeholder":"Use SSL","type":"Checkbox","required":false}],"actions":[{"label":"Test","placeholder":"Test","key":"test","actionType":"TEST","type":"Button"},{"label":"Save","placeholder":"Save","key":"save","actionType":"SUBMIT","type":"Button"}],"msgOnInstall":"Successfully configured! Attachments will now be stored in Minio.","msgOnUninstall":""}	\N	\N	\N	\N	2026-01-26 09:32:33+00	2026-01-26 09:32:33+00
gcs	GCS	Google Cloud Storage is a RESTful online file storage web service for storing and accessing data on Google Cloud Platform infrastructure.	f	\N	0.0.4	\N	install	\N	plugins/gcs.png	\N	Storage	Storage	{"title":"Configure Google Cloud Storage","items":[{"key":"bucket","label":"Bucket Name","placeholder":"Bucket Name","type":"SingleLineText","required":true},{"key":"client_email","label":"Client Email","placeholder":"Client Email","type":"SingleLineText","required":true},{"key":"private_key","label":"Private Key","placeholder":"Private Key","type":"Password","required":true},{"key":"project_id","label":"Project ID","placeholder":"Project ID","type":"SingleLineText","required":false},{"key":"uniform_bucket_level_access","label":"Uniform Bucket Level Access","type":"Checkbox","required":false}],"actions":[{"label":"Test","placeholder":"Test","key":"test","actionType":"TEST","type":"Button"},{"label":"Save","placeholder":"Save","key":"save","actionType":"SUBMIT","type":"Button"}],"msgOnInstall":"Successfully configured! Attachments will now be stored in Google Cloud Storage.","msgOnUninstall":""}	\N	\N	\N	\N	2026-01-26 09:32:33+00	2026-01-26 09:32:33+00
mattermost	Mattermost	Mattermost brings all your team communication into one place, making it searchable and accessible anywhere.	f	\N	0.0.1	\N	install	\N	plugins/mattermost.png	\N	Chat	Chat	{"title":"Configure Mattermost","array":true,"items":[{"key":"channel","label":"Channel Name","placeholder":"Channel Name","type":"SingleLineText","required":true},{"key":"webhook_url","label":"Webhook URL","placeholder":"Webhook URL","type":"Password","required":true}],"actions":[{"label":"Test","placeholder":"Test","key":"test","actionType":"TEST","type":"Button"},{"label":"Save","placeholder":"Save","key":"save","actionType":"SUBMIT","type":"Button"}],"msgOnInstall":"Successfully installed and Mattermost is enabled for notification.","msgOnUninstall":""}	\N	\N	\N	\N	2026-01-26 09:32:33+00	2026-01-26 09:32:33+00
spaces	Spaces	Store & deliver vast amounts of content with a simple architecture.	f	\N	0.0.3	\N	install	\N	plugins/spaces.svg	\N	Storage	Storage	{"title":"DigitalOcean Spaces","items":[{"key":"bucket","label":"Bucket Name","placeholder":"Bucket Name","type":"SingleLineText","required":true},{"key":"region","label":"Region","placeholder":"Region","type":"SingleLineText","required":true},{"key":"access_key","label":"Access Key","placeholder":"Access Key","type":"SingleLineText","required":true},{"key":"access_secret","label":"Access Secret","placeholder":"Access Secret","type":"Password","required":true},{"key":"acl","label":"Access Control Lists (ACL)","placeholder":"Default set to public-read","type":"SingleLineText","required":false}],"actions":[{"label":"Test","placeholder":"Test","key":"test","actionType":"TEST","type":"Button"},{"label":"Save","placeholder":"Save","key":"save","actionType":"SUBMIT","type":"Button"}],"msgOnInstall":"Successfully configured! Attachments will now be stored in DigitalOcean Spaces.","msgOnUninstall":""}	\N	\N	\N	\N	2026-01-26 09:32:33+00	2026-01-26 09:32:33+00
backblaze	Backblaze	Backblaze B2 is enterprise-grade, S3 compatible storage that companies around the world use to store and serve data while improving their cloud OpEx vs. Amazon S3 and others.	f	\N	0.0.6	\N	install	\N	plugins/backblaze.png	\N	Storage	Storage	{"title":"Configure Backblaze B2","items":[{"key":"bucket","label":"Bucket Name","placeholder":"Bucket Name","type":"SingleLineText","required":true},{"key":"region","label":"Region","placeholder":"e.g. us-west-001","type":"SingleLineText","required":true},{"key":"access_key","label":"Access Key","placeholder":"i.e. keyID in App Keys","type":"SingleLineText","required":true},{"key":"access_secret","label":"Access Secret","placeholder":"i.e. applicationKey in App Keys","type":"Password","required":true},{"key":"acl","label":"Access Control Lists (ACL)","placeholder":"Default set to public-read","type":"SingleLineText","required":false}],"actions":[{"label":"Test","placeholder":"Test","key":"test","actionType":"TEST","type":"Button"},{"label":"Save","placeholder":"Save","key":"save","actionType":"SUBMIT","type":"Button"}],"msgOnInstall":"Successfully configured! Attachments will now be stored in Backblaze B2.","msgOnUninstall":""}	\N	\N	\N	\N	2026-01-26 09:32:33+00	2026-01-26 09:32:33+00
vultr	Vultr	Using Vultr Object Storage can give flexibility and cloud storage that allows applications greater flexibility and access worldwide.	f	\N	0.0.4	\N	install	\N	plugins/vultr.png	\N	Storage	Storage	{"title":"Configure Vultr Object Storage","items":[{"key":"bucket","label":"Bucket Name","placeholder":"Bucket Name","type":"SingleLineText","required":true},{"key":"hostname","label":"Host Name","placeholder":"e.g.: ewr1.vultrobjects.com","type":"SingleLineText","required":true},{"key":"access_key","label":"Access Key","placeholder":"Access Key","type":"SingleLineText","required":true},{"key":"access_secret","label":"Access Secret","placeholder":"Access Secret","type":"Password","required":true},{"key":"acl","label":"Access Control Lists (ACL)","placeholder":"Default set to public-read","type":"SingleLineText","required":false}],"actions":[{"label":"Test","placeholder":"Test","key":"test","actionType":"TEST","type":"Button"},{"label":"Save","placeholder":"Save","key":"save","actionType":"SUBMIT","type":"Button"}],"msgOnInstall":"Successfully configured! Attachments will now be stored in Vultr Object Storage.","msgOnUninstall":""}	\N	\N	\N	\N	2026-01-26 09:32:33+00	2026-01-26 09:32:33+00
ovh	Ovh	Upload your files to a space that you can access via HTTPS using the OpenStack Swift API, or the S3 API. 	f	\N	0.0.4	\N	install	\N	plugins/ovhCloud.png	\N	Storage	Storage	{"title":"Configure OvhCloud Object Storage","items":[{"key":"bucket","label":"Bucket Name","placeholder":"Bucket Name","type":"SingleLineText","required":true},{"key":"region","label":"Region","placeholder":"Region","type":"SingleLineText","required":true},{"key":"access_key","label":"Access Key","placeholder":"Access Key","type":"SingleLineText","required":true},{"key":"access_secret","label":"Access Secret","placeholder":"Access Secret","type":"Password","required":true},{"key":"acl","label":"Access Control Lists (ACL)","placeholder":"Default set to public-read","type":"SingleLineText","required":false}],"actions":[{"label":"Test","placeholder":"Test","key":"test","actionType":"TEST","type":"Button"},{"label":"Save","placeholder":"Save","key":"save","actionType":"SUBMIT","type":"Button"}],"msgOnInstall":"Successfully configured! Attachments will now be stored in OvhCloud Object Storage.","msgOnUninstall":""}	\N	\N	\N	\N	2026-01-26 09:32:33+00	2026-01-26 09:32:33+00
linode	Linode	S3-compatible Linode Object Storage makes it easy and more affordable to manage unstructured data such as content assets, as well as sophisticated and data-intensive storage challenges around artificial intelligence and machine learning.	f	\N	0.0.4	\N	install	\N	plugins/linode.svg	\N	Storage	Storage	{"title":"Configure Linode Object Storage","items":[{"key":"bucket","label":"Bucket Name","placeholder":"Bucket Name","type":"SingleLineText","required":true},{"key":"region","label":"Region","placeholder":"Region","type":"SingleLineText","required":true},{"key":"access_key","label":"Access Key","placeholder":"Access Key","type":"SingleLineText","required":true},{"key":"access_secret","label":"Access Secret","placeholder":"Access Secret","type":"Password","required":true},{"key":"acl","label":"Access Control Lists (ACL)","placeholder":"Default set to public-read","type":"SingleLineText","required":false}],"actions":[{"label":"Test","placeholder":"Test","key":"test","actionType":"TEST","type":"Button"},{"label":"Save","placeholder":"Save","key":"save","actionType":"SUBMIT","type":"Button"}],"msgOnInstall":"Successfully configured! Attachments will now be stored in Linode Object Storage.","msgOnUninstall":""}	\N	\N	\N	\N	2026-01-26 09:32:33+00	2026-01-26 09:32:33+00
upcloud	UpCloud	The perfect home for your data. Thanks to the S3-compatible programmable interface,\nyou have a host of options for existing tools and code implementations.\n	f	\N	0.0.4	\N	install	\N	plugins/upcloud.png	\N	Storage	Storage	{"title":"Configure UpCloud Object Storage","items":[{"key":"bucket","label":"Bucket Name","placeholder":"Bucket Name","type":"SingleLineText","required":true},{"key":"endpoint","label":"Endpoint","placeholder":"Endpoint","type":"SingleLineText","required":true},{"key":"access_key","label":"Access Key","placeholder":"Access Key","type":"SingleLineText","required":true},{"key":"access_secret","label":"Access Secret","placeholder":"Access Secret","type":"Password","required":true},{"key":"acl","label":"Access Control Lists (ACL)","placeholder":"Default set to public-read","type":"SingleLineText","required":false}],"actions":[{"label":"Test","placeholder":"Test","key":"test","actionType":"TEST","type":"Button"},{"label":"Save","placeholder":"Save","key":"save","actionType":"SUBMIT","type":"Button"}],"msgOnInstall":"Successfully configured! Attachments will now be stored in UpCloud Object Storage.","msgOnUninstall":""}	\N	\N	\N	\N	2026-01-26 09:32:33+00	2026-01-26 09:32:33+00
smtp	SMTP	SMTP email client	f	\N	0.0.6	\N	install	\N	\N	ncMail	Email	Email	{"title":"Configure Email SMTP","items":[{"key":"from","label":"From address","placeholder":"admin@example.com","type":"SingleLineText","required":true,"help_text":"Enter the e-mail address to be used as the sender (appearing in the 'From' field of sent e-mails)."},{"key":"host","label":"SMTP server","placeholder":"smtp.example.com","help_text":"Enter the SMTP hostname. If you do not have this information available, contact your email service provider.","type":"SingleLineText","required":true},{"key":"name","label":"From domain","placeholder":"your-domain.com","type":"SingleLineText","required":true,"help_text":"Specify the domain name that will be used in the 'From' address (e.g., yourdomain.com). This should match the domain of the 'From' address."},{"key":"port","label":"SMTP port","placeholder":"Port","type":"SingleLineText","required":true,"help_text":"Enter the port number used by the SMTP server (e.g., 587 for TLS, 465 for SSL, or 25 for insecure connections)."},{"key":"username","label":"Username","placeholder":"Username","type":"SingleLineText","required":false,"help_text":"Enter the username to authenticate with the SMTP server. This is usually your email address."},{"key":"password","label":"Password","placeholder":"Password","type":"Password","required":false,"help_text":"Enter the password associated with the SMTP server username. Click the eye icon to view the password as you type"},{"key":"secure","label":"Use secure connection","placeholder":"Secure","type":"Checkbox","required":false,"help_text":"Enable this if your SMTP server requires a secure connection (SSL/TLS)."},{"key":"ignoreTLS","label":"Ignore TLS errors","placeholder":"Ignore TLS","type":"Checkbox","required":false,"help_text":"Enable this if you want to ignore any TLS errors that may occur during the connection. Enabling this disables STARTTLS even if SMTP servers support it, hence may compromise security."},{"key":"rejectUnauthorized","label":"Reject unauthorized","placeholder":"Reject unauthorized","type":"Checkbox","required":false,"help_text":"Disable this to allow connecting to an SMTP server that uses a self‑signed or otherwise invalid TLS certificate."}],"actions":[{"label":"Test","key":"test","actionType":"TEST","type":"Button"},{"label":"Save","key":"save","actionType":"SUBMIT","type":"Button"}],"msgOnInstall":"Successfully installed and email notification will use SMTP configuration","msgOnUninstall":"","docs":[]}	\N	\N	\N	\N	2026-01-26 09:32:33+00	2026-01-26 09:32:33+00
mailersend	MailerSend	MailerSend email client	f	\N	0.0.2	\N	install	\N	plugins/mailersend.svg	\N	Email	Email	{"title":"Configure MailerSend","items":[{"key":"api_key","label":"API key","placeholder":"eg: ***************","type":"Password","required":true},{"key":"from","label":"From","placeholder":"eg: admin@run.com","type":"SingleLineText","required":true},{"key":"from_name","label":"From name","placeholder":"eg: Adam","type":"SingleLineText","required":true}],"actions":[{"label":"Test","key":"test","actionType":"TEST","type":"Button"},{"label":"Save","key":"save","actionType":"SUBMIT","type":"Button"}],"msgOnInstall":"Successfully configured! Email notifications are now set up using MailerSend.","msgOnUninstall":""}	\N	\N	\N	\N	2026-01-26 09:32:33+00	2026-01-26 09:32:33+00
scaleway	Scaleway	Scaleway Object Storage is an S3-compatible object store from Scaleway Cloud Platform.	f	\N	0.0.4	\N	install	\N	plugins/scaleway.png	\N	Storage	Storage	{"title":"Setup Scaleway","items":[{"key":"bucket","label":"Bucket name","placeholder":"Bucket name","type":"SingleLineText","required":true},{"key":"region","label":"Region of bucket","placeholder":"Region of bucket","type":"SingleLineText","required":true},{"key":"access_key","label":"Access Key","placeholder":"Access Key","type":"SingleLineText","required":true},{"key":"access_secret","label":"Access Secret","placeholder":"Access Secret","type":"Password","required":true},{"key":"acl","label":"Access Control Lists (ACL)","placeholder":"Default set to public-read","type":"SingleLineText","required":false}],"actions":[{"label":"Test","placeholder":"Test","key":"test","actionType":"TEST","type":"Button"},{"label":"Save","placeholder":"Save","key":"save","actionType":"SUBMIT","type":"Button"}],"msgOnInstall":"Successfully configured! Attachments will now be stored in Scaleway Object Storage.","msgOnUninstall":""}	\N	\N	\N	\N	2026-01-26 09:32:33+00	2026-01-26 09:32:33+00
ses	SES	Amazon Simple Email Service (SES) is a cost-effective, flexible, and scalable email service that enables developers to send mail from within any application.	f	\N	0.0.4	\N	install	\N	plugins/aws.png	NcAmazonAws	Email	Email	{"title":"Configure Amazon Simple Email Service (SES)","items":[{"key":"from","label":"From","placeholder":"From","type":"SingleLineText","required":true},{"key":"region","label":"Region","placeholder":"Region","type":"SingleLineText","required":true},{"key":"access_key","label":"Access Key","placeholder":"Access Key","type":"SingleLineText","required":true},{"key":"access_secret","label":"Access Secret","placeholder":"Access Secret","type":"Password","required":true}],"actions":[{"label":"Test","placeholder":"Test","key":"test","actionType":"TEST","type":"Button"},{"label":"Save","placeholder":"Save","key":"save","actionType":"SUBMIT","type":"Button"}],"msgOnInstall":"Successfully configured! Email notifications are now set up using Amazon SES.","msgOnUninstall":""}	\N	\N	\N	\N	2026-01-26 09:32:33+00	2026-01-26 09:32:33+00
cloudflare-r2	Cloudflare R2	Cloudflare R2 is an S3-compatible, zero egress-fee, globally distributed object storage.	f	\N	0.0.3	\N	install	\N	plugins/r2.png	\N	Storage	Storage	{"title":"Configure Cloudflare R2 Storage","items":[{"key":"bucket","label":"Bucket Name","placeholder":"Bucket Name","type":"SingleLineText","required":true},{"key":"hostname","label":"Host Name","placeholder":"e.g.: *****.r2.cloudflarestorage.com","type":"SingleLineText","required":true},{"key":"access_key","label":"Access Key","placeholder":"Access Key","type":"SingleLineText","required":true},{"key":"access_secret","label":"Access Secret","placeholder":"Access Secret","type":"Password","required":true}],"actions":[{"label":"Test","placeholder":"Test","key":"test","actionType":"TEST","type":"Button"},{"label":"Save","placeholder":"Save","key":"save","actionType":"SUBMIT","type":"Button"}],"msgOnInstall":"Successfully configured! Attachments will now be stored in Cloudflare R2 Storage.","msgOnUninstall":""}	\N	\N	\N	\N	2026-01-26 09:32:33+00	2026-01-26 09:32:33+00
\.


--
-- Data for Name: nc_principal_assignments; Type: TABLE DATA; Schema: public; Owner: arunachala
--

COPY public.nc_principal_assignments (resource_type, resource_id, principal_type, principal_ref_id, roles, deleted, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: nc_row_color_conditions; Type: TABLE DATA; Schema: public; Owner: arunachala
--

COPY public.nc_row_color_conditions (id, fk_view_id, fk_workspace_id, base_id, color, nc_order, is_set_as_background, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: nc_scripts; Type: TABLE DATA; Schema: public; Owner: arunachala
--

COPY public.nc_scripts (id, title, description, meta, "order", base_id, fk_workspace_id, script, config, created_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: nc_snapshots; Type: TABLE DATA; Schema: public; Owner: arunachala
--

COPY public.nc_snapshots (id, title, base_id, snapshot_base_id, fk_workspace_id, created_by, status, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: nc_sort_v2; Type: TABLE DATA; Schema: public; Owner: arunachala
--

COPY public.nc_sort_v2 (id, source_id, base_id, fk_view_id, fk_column_id, direction, "order", fk_workspace_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: nc_sources_v2; Type: TABLE DATA; Schema: public; Owner: arunachala
--

COPY public.nc_sources_v2 (id, base_id, alias, config, meta, is_meta, type, inflection_column, inflection_table, enabled, "order", description, erd_uuid, deleted, is_schema_readonly, is_data_readonly, is_local, fk_sql_executor_id, fk_workspace_id, fk_integration_id, is_encrypted, created_at, updated_at) FROM stdin;
bk13whqq4v4i14b	p90csse7pqpqhxk	\N	{"schema":"p90csse7pqpqhxk"}	\N	f	pg	camelize	camelize	t	1	\N	\N	f	f	f	t	\N	wz8f9jsr	\N	f	2026-01-26 11:37:54+00	2026-01-26 11:37:54+00
b2o2bcq9zson1lr	psoq8r0ntwwuqxb	\N	{"schema":"psoq8r0ntwwuqxb"}	\N	f	pg	camelize	camelize	t	1	\N	\N	f	f	f	t	\N	wz8f9jsr	\N	f	2026-01-26 11:38:14+00	2026-01-26 11:38:14+00
\.


--
-- Data for Name: nc_sql_executor_v2; Type: TABLE DATA; Schema: public; Owner: arunachala
--

COPY public.nc_sql_executor_v2 (id, domain, status, priority, capacity, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: nc_sso_client; Type: TABLE DATA; Schema: public; Owner: arunachala
--

COPY public.nc_sso_client (id, type, title, enabled, config, fk_user_id, fk_org_id, deleted, "order", domain_name, domain_name_verified, fk_workspace_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: nc_sso_client_domain; Type: TABLE DATA; Schema: public; Owner: arunachala
--

COPY public.nc_sso_client_domain (fk_sso_client_id, fk_org_domain_id, enabled, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: nc_store; Type: TABLE DATA; Schema: public; Owner: arunachala
--

COPY public.nc_store (id, base_id, db_alias, key, value, type, env, tag, created_at, updated_at) FROM stdin;
1	\N	db	NC_MIGRATION_JOBS	{"version":"9","stall_check":1769419951347,"locked":false}	\N	\N	\N	2026-01-26 09:32:33+00	2026-01-26 09:32:33+00
2	\N	db	nc_auth_jwt_secret	ee513280-95fd-4374-a9cd-7f370463030a	\N	\N	\N	2026-01-26 09:32:33+00	2026-01-26 09:32:33+00
3	\N	db	nc_server_id	0a83f681532f90b7bc7cc41bd2f18ed72fca99e6a4bf627e1891dd7c9958f403	\N	\N	\N	2026-01-26 09:32:33+00	2026-01-26 09:32:33+00
4	\N	db	NC_CONFIG_MAIN	{"version":"0258003"}	\N	\N	\N	2026-01-26 09:32:33+00	2026-01-26 09:32:33+00
5	\N	db	NC_DEFAULT_WORKSPACE_ID	wz8f9jsr	\N	\N	\N	2026-01-26 11:37:54+00	2026-01-26 11:37:54+00
\.


--
-- Data for Name: nc_subscriptions; Type: TABLE DATA; Schema: public; Owner: arunachala
--

COPY public.nc_subscriptions (id, fk_workspace_id, fk_org_id, fk_plan_id, fk_user_id, stripe_subscription_id, stripe_price_id, seat_count, status, billing_cycle_anchor, start_at, trial_end_at, canceled_at, period, upcoming_invoice_at, upcoming_invoice_due_at, upcoming_invoice_amount, upcoming_invoice_currency, stripe_schedule_id, schedule_phase_start, schedule_stripe_price_id, schedule_fk_plan_id, schedule_period, schedule_type, meta, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: nc_sync_configs; Type: TABLE DATA; Schema: public; Owner: arunachala
--

COPY public.nc_sync_configs (id, fk_workspace_id, base_id, fk_integration_id, fk_model_id, sync_type, sync_trigger, sync_trigger_cron, sync_trigger_secret, sync_job_id, last_sync_at, next_sync_at, title, sync_category, fk_parent_sync_config_id, on_delete_action, created_at, updated_at, created_by, updated_by, meta) FROM stdin;
\.


--
-- Data for Name: nc_sync_logs_v2; Type: TABLE DATA; Schema: public; Owner: arunachala
--

COPY public.nc_sync_logs_v2 (id, base_id, fk_sync_source_id, time_taken, status, status_details, fk_workspace_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: nc_sync_mappings; Type: TABLE DATA; Schema: public; Owner: arunachala
--

COPY public.nc_sync_mappings (id, fk_workspace_id, base_id, fk_sync_config_id, target_table, fk_model_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: nc_sync_source_v2; Type: TABLE DATA; Schema: public; Owner: arunachala
--

COPY public.nc_sync_source_v2 (id, title, type, details, deleted, enabled, "order", base_id, fk_user_id, source_id, fk_workspace_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: nc_teams; Type: TABLE DATA; Schema: public; Owner: arunachala
--

COPY public.nc_teams (id, title, meta, fk_org_id, fk_workspace_id, created_by, deleted, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: nc_usage_stats; Type: TABLE DATA; Schema: public; Owner: arunachala
--

COPY public.nc_usage_stats (fk_workspace_id, usage_type, period_start, count, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: nc_user_comment_notifications_preference; Type: TABLE DATA; Schema: public; Owner: arunachala
--

COPY public.nc_user_comment_notifications_preference (id, row_id, user_id, fk_model_id, source_id, base_id, preferences, fk_workspace_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: nc_user_refresh_tokens; Type: TABLE DATA; Schema: public; Owner: arunachala
--

COPY public.nc_user_refresh_tokens (fk_user_id, token, meta, expires_at, created_at, updated_at) FROM stdin;
us8wts0ifr88la9t	e6abc36261aadb6174702e2d0ff01cd22172dee68b3aac49ed52c12f25ec23a39619d2ab79d59c8b	\N	2026-02-25 11:37:54.567+00	2026-01-26 11:37:54+00	2026-01-26 11:37:54+00
\.


--
-- Data for Name: nc_users_v2; Type: TABLE DATA; Schema: public; Owner: arunachala
--

COPY public.nc_users_v2 (id, email, password, salt, invite_token, invite_token_expires, reset_password_expires, reset_password_token, email_verification_token, email_verified, roles, token_version, blocked, blocked_reason, deleted_at, is_deleted, meta, display_name, user_name, bio, location, website, avatar, is_new_user, created_at, updated_at) FROM stdin;
us8wts0ifr88la9t	albertosanzdev@gmail.com	$2a$10$H.ixLUvviRUO.Pt5N39v2.6WHML5DFNpIE1TnsAD7zhycczFvS52e	$2a$10$H.ixLUvviRUO.Pt5N39v2.	\N	\N	\N	\N	0e8d7b91-988b-4f75-8154-7a9c31e66f0c	\N	org-level-creator,super	d1c62d1d0de1f6af447c12bd268721d91210745c3e5969f99f584b6110d61c4f4b9ca5861b9345b2	f	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	f	2026-01-26 11:37:54+00	2026-01-26 11:37:58+00
\.


--
-- Data for Name: nc_views_v2; Type: TABLE DATA; Schema: public; Owner: arunachala
--

COPY public.nc_views_v2 (id, source_id, base_id, fk_model_id, title, type, is_default, show_system_fields, lock_type, uuid, password, show, "order", meta, description, created_by, owned_by, fk_workspace_id, attachment_mode_column_id, expanded_record_mode, fk_custom_url_id, row_coloring_mode, created_at, updated_at) FROM stdin;
vwspqn03x3f7jcrh	bk13whqq4v4i14b	p90csse7pqpqhxk	m7u3pd3fzfkbf37	Features	3	\N	\N	collaborative	\N	\N	t	1	{}	\N	\N	\N	wz8f9jsr	\N	\N	\N	\N	2026-01-26 11:37:54+00	2026-01-26 11:37:54+00
\.


--
-- Data for Name: nc_widgets_v2; Type: TABLE DATA; Schema: public; Owner: arunachala
--

COPY public.nc_widgets_v2 (id, fk_workspace_id, base_id, fk_dashboard_id, fk_model_id, fk_view_id, title, description, type, config, meta, "order", "position", error, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: nc_workflows; Type: TABLE DATA; Schema: public; Owner: arunachala
--

COPY public.nc_workflows (id, title, description, fk_workspace_id, base_id, enabled, nodes, edges, meta, "order", created_by, updated_by, created_at, updated_at, draft) FROM stdin;
\.


--
-- Data for Name: notification; Type: TABLE DATA; Schema: public; Owner: arunachala
--

COPY public.notification (id, type, body, is_read, is_deleted, fk_user_id, created_at, updated_at) FROM stdin;
ncewy38nc6oar92l	app.welcome	{}	f	f	us8wts0ifr88la9t	2026-01-26 11:37:54+00	2026-01-26 11:37:54+00
\.


--
-- Data for Name: schedules; Type: TABLE DATA; Schema: public; Owner: arunachala
--

COPY public.schedules (id, class_id, class_name, day_of_week, start_time, end_time, is_active, created_at, updated_at) FROM stdin;
6	5	\N	Viernes	18:00	19:30	t	2026-02-03 20:22:53.903089+00	\N
3	3	\N	Martes	10:15	11:45	t	2026-02-03 20:22:53.903089+00	\N
5	\N	\N	Jueves	19:00	20:30	t	2026-02-03 20:22:53.903089+00	\N
4	\N	\N	Miércoles	19:00	20:30	t	2026-02-03 20:22:53.903089+00	\N
10	13	\N	Miércoles	10:15	11:15	t	2026-02-03 20:22:53.903089+00	2026-02-03 20:24:00.484304+00
11	14	\N	Lunes	09:00	10:30	t	2026-02-03 22:17:48.498046+00	\N
\.


--
-- Data for Name: therapy_types; Type: TABLE DATA; Schema: public; Owner: arunachala
--

COPY public.therapy_types (id, name, excerpt, description, benefits, translations, duration_min, image_url, is_active, created_at) FROM stdin;
1	Reiki	Equilibrio energético integral.	\N	\N	{"ca": {"name": "Reiki", "excerpt": "Equilibri energ\\u00e8tic integral."}, "en": {"name": "Reiki", "excerpt": "Integral energy balance."}}	50	/static/gallery/therapies/test_manual.webp	t	2026-01-27 11:33:05.441016+00
2	Acupuntura	Medicina Tradicional China.	\N	\N	{"ca": {"name": "Acupuntura", "excerpt": "Medicina Tradicional Xinesa."}, "en": {"name": "Acupuncture", "excerpt": "Traditional Chinese Medicine."}}	60	/static/gallery/therapies/test_manual_2.webp	t	2026-01-27 11:33:05.441016+00
3	dsfdsfds	dsfdsfs	dsfdsfsd	\N	{"ca": {"name": "dsfdsfds", "excerpt": "dsfdsfs", "description": "dsfdsfsd"}, "en": {"name": "dsfdsfds", "excerpt": "dsfdsfs", "description": "dsfdsfsd"}}	\N	\N	t	2026-02-03 20:25:28.776981+00
6	hhhhhhhhhhhh	gggg	gggg	\N	{"ca": {"name": "hhhhhhhhhhhh", "excerpt": "gggg", "description": "gggg"}, "en": {"name": "hhhhhhhhhhhh", "excerpt": "gggg", "description": "gggg"}}	\N	\N	t	2026-02-03 20:26:45.286154+00
7	Masaje Ayurvédico	Relajación profunda con aceites calientes.	Técnica tradicional india que equilibra las energías del cuerpo (doshas) mediante masajes rítmicos y aceites naturales.	\N	{"ca": {"name": "Massatge Aiurveda", "excerpt": "Relaxaci\\u00f3 profunda amb olis calents.", "description": "T\\u00e8cnica tradicional \\u00edndia que equilibra les energies del cos (doshas) mitjan\\u00e7ant massatges r\\u00edtmics i olis naturals."}, "en": {"name": "Ayurvedic Massage", "excerpt": "Deep relaxation with warm oils.", "description": "Traditional Indian technique that balances body energies (doshas) through rhythmic massage and natural oils."}}	60	/static/gallery/therapies/c6f80fa9-617c-4713-886c-8527d1d53840.webp	t	2026-02-03 22:17:48.498046+00
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: arunachala
--

COPY public.users (id, email, password_hash, first_name, last_name, profile_picture, role, created_at, updated_at) FROM stdin;
1	albertosanzdev@gmail.com	$2b$12$RKrBdye8g1rsvgivy0yUH.9FzX6jo17Pfk4PdaKxq6936FERSFHXO	Alberto	Sanz	\N	admin	2026-01-27 11:33:05.441016+00	2026-01-27 11:40:29.617324+00
2	testuser@gmail.com	$2b$12$rnY07HObmS1rHNHjDL4BC.0cGs4CnGKMepIpMIFKiMt1iY5St8DyW	\N	\N	\N	user	2026-01-30 10:22:01.654007+00	2026-01-30 10:22:01.654007+00
3	admin@arunachala.com	$2b$12$SE0MXcCGd.0IwzWeVYy74O16UT7CnkQm4Kg9bYATR4yJBI/7I6RsO	Admin	Arunachala	\N	admin	2026-02-03 22:17:48.498046+00	2026-02-03 22:17:48.498046+00
4	test@example.com	$2b$12$2HBPpz1uPYgF1tpPNBtuEOPWx8zfQXJ3ymf/8PAv94UG1IilG4S3W	\N	\N	\N	user	2026-02-03 22:40:32.929218+00	2026-02-03 22:40:32.929218+00
5	test2@example.com	$2b$12$1wfMimrGeaCVKAxsbs7ZJufa9JhBXEzHMGBzh2/QpAtSbnmJXzbw2	\N	\N	\N	user	2026-02-03 22:41:16.361642+00	2026-02-03 22:41:16.361642+00
\.


--
-- Data for Name: workspace; Type: TABLE DATA; Schema: public; Owner: arunachala
--

COPY public.workspace (id, title, description, meta, fk_user_id, deleted, deleted_at, "order", status, message, plan, infra_meta, fk_org_id, stripe_customer_id, grace_period_start_at, api_grace_period_start_at, automation_grace_period_start_at, loyal, loyalty_discount_used, db_job_id, fk_db_instance_id, segment_code, created_at, updated_at) FROM stdin;
wz8f9jsr	Default Workspace	\N	\N	us8wts0ifr88la9t	f	\N	\N	1	\N	free	\N	\N	\N	\N	\N	\N	f	f	\N	\N	\N	2026-01-26 11:37:54+00	2026-01-26 11:37:54+00
\.


--
-- Data for Name: workspace_user; Type: TABLE DATA; Schema: public; Owner: arunachala
--

COPY public.workspace_user (fk_workspace_id, fk_user_id, roles, invite_token, invite_accepted, deleted, deleted_at, "order", invited_by, created_at, updated_at) FROM stdin;
wz8f9jsr	us8wts0ifr88la9t	workspace-level-owner	\N	f	f	\N	\N	\N	2026-01-26 11:37:54+00	2026-01-26 11:37:54+00
\.


--
-- Data for Name: xc_knex_migrationsv0; Type: TABLE DATA; Schema: public; Owner: arunachala
--

COPY public.xc_knex_migrationsv0 (id, name, batch, migration_time) FROM stdin;
1	nc_001_init	1	2026-01-26 09:32:32.92+00
2	nc_002_teams	1	2026-01-26 09:32:32.944+00
3	nc_003_alter_row_color_condition_nc_order_col	1	2026-01-26 09:32:32.956+00
4	nc_004_workflows	1	2026-01-26 09:32:32.984+00
5	nc_005_add_user_specific_and_meta_column_in_sync_configs	1	2026-01-26 09:32:32.985+00
6	nc_006_dependency_slots	1	2026-01-26 09:32:32.993+00
7	nc_007_workflow_draft	1	2026-01-26 09:32:32.995+00
8	nc_008_license_server	1	2026-01-26 09:32:33.002+00
9	nc_009_dependency_tracker_timestamp	1	2026-01-26 09:32:33.006+00
10	nc_010_add_constraints_col_in_column_table	1	2026-01-26 09:32:33.008+00
11	nc_011_merge_workflows_scripts	1	2026-01-26 09:32:33.029+00
12	nc_012_workflow_delay	1	2026-01-26 09:32:33.032+00
13	nc_013_composite_pk_missing_tables	1	2026-01-26 09:32:33.049+00
\.


--
-- Data for Name: xc_knex_migrationsv0_lock; Type: TABLE DATA; Schema: public; Owner: arunachala
--

COPY public.xc_knex_migrationsv0_lock (index, is_locked) FROM stdin;
1	0
\.


--
-- Data for Name: yoga_classes; Type: TABLE DATA; Schema: public; Owner: arunachala
--

COPY public.yoga_classes (id, name, description, translations, color, age_range, created_at) FROM stdin;
2	Vinyasa Flow	Sincronización de movimiento y respiración fluida.	{"ca": {"name": "Vinyasa Flow", "description": "Sincronitzaci\\u00f3 de moviment i respiraci\\u00f3 fluida."}, "en": {"name": "Vinyasa Flow", "description": "Synchronization of movement and fluid breathing."}}	bg-sky-100 border-sky-300 text-sky-800	\N	2026-01-27 11:33:05.441016+00
3	Yoga Suave	Práctica relajante para todos los niveles.	{"ca": {"name": "Ioga Suau", "description": "Pr\\u00e0ctica relaxant per a tots els nivells."}, "en": {"name": "Gentle Yoga", "description": "Relaxing practice for all levels."}}	bg-emerald-100 border-emerald-300 text-emerald-800	\N	2026-01-27 11:33:05.441016+00
5	Yin Yoga	Flexibilidad pasiva y relajación profunda.	{"ca": {"name": "Yin Yoga", "description": "Flexibilitat passiva i relaxaci\\u00f3 profunda."}, "en": {"name": "Yin Yoga", "description": "Passive flexibility and deep relaxation."}}	bg-violet-100 border-violet-300 text-violet-800	\N	2026-01-27 11:33:05.441016+00
13	Baloncesto	Practica divertida	{"ca": {"name": "B\\u00e0squet", "description": "Pr\\u00e0ctica divertida"}, "en": {"name": "Basketball", "description": "Fun practice"}}	bg-emerald-100 border-emerald-300 text-emerald-800		2026-02-03 10:21:07.954855+00
14	Hatha Yoga	Una práctica equilibrada centrándose en posturas físicas (asanas) y respiración (pranayama).	{"ca": {"name": "Hatha Ioga", "description": "Una pr\\u00e0ctica equilibrada centrant-se en postures f\\u00edsiques (asanes) i respiraci\\u00f3 (pranayama)."}, "en": {"name": "Hatha Yoga", "description": "A balanced practice focusing on physical postures (asanas) and breathing (pranayama)."}}	bg-forest/20	\N	2026-02-03 22:17:48.498046+00
\.


--
-- Name: Features_id_seq; Type: SEQUENCE SET; Schema: p90csse7pqpqhxk; Owner: arunachala
--

SELECT pg_catalog.setval('p90csse7pqpqhxk."Features_id_seq"', 1, false);


--
-- Name: Features_id_seq; Type: SEQUENCE SET; Schema: p9j5mqhyeeb73rz; Owner: arunachala
--

SELECT pg_catalog.setval('p9j5mqhyeeb73rz."Features_id_seq"', 1, false);


--
-- Name: activities_id_seq; Type: SEQUENCE SET; Schema: public; Owner: arunachala
--

SELECT pg_catalog.setval('public.activities_id_seq', 1, false);


--
-- Name: agent_config_id_seq; Type: SEQUENCE SET; Schema: public; Owner: arunachala
--

SELECT pg_catalog.setval('public.agent_config_id_seq', 1, true);


--
-- Name: contents_id_seq; Type: SEQUENCE SET; Schema: public; Owner: arunachala
--

SELECT pg_catalog.setval('public.contents_id_seq', 22, true);


--
-- Name: dashboard_activities_id_seq; Type: SEQUENCE SET; Schema: public; Owner: arunachala
--

SELECT pg_catalog.setval('public.dashboard_activities_id_seq', 1, false);


--
-- Name: gallery_id_seq; Type: SEQUENCE SET; Schema: public; Owner: arunachala
--

SELECT pg_catalog.setval('public.gallery_id_seq', 20, true);


--
-- Name: massage_types_id_seq; Type: SEQUENCE SET; Schema: public; Owner: arunachala
--

SELECT pg_catalog.setval('public.massage_types_id_seq', 15, true);


--
-- Name: nc_api_tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: arunachala
--

SELECT pg_catalog.setval('public.nc_api_tokens_id_seq', 1, false);


--
-- Name: nc_store_id_seq; Type: SEQUENCE SET; Schema: public; Owner: arunachala
--

SELECT pg_catalog.setval('public.nc_store_id_seq', 5, true);


--
-- Name: schedules_id_seq; Type: SEQUENCE SET; Schema: public; Owner: arunachala
--

SELECT pg_catalog.setval('public.schedules_id_seq', 11, true);


--
-- Name: therapy_types_id_seq; Type: SEQUENCE SET; Schema: public; Owner: arunachala
--

SELECT pg_catalog.setval('public.therapy_types_id_seq', 7, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: arunachala
--

SELECT pg_catalog.setval('public.users_id_seq', 5, true);


--
-- Name: xc_knex_migrationsv0_id_seq; Type: SEQUENCE SET; Schema: public; Owner: arunachala
--

SELECT pg_catalog.setval('public.xc_knex_migrationsv0_id_seq', 13, true);


--
-- Name: xc_knex_migrationsv0_lock_index_seq; Type: SEQUENCE SET; Schema: public; Owner: arunachala
--

SELECT pg_catalog.setval('public.xc_knex_migrationsv0_lock_index_seq', 1, true);


--
-- Name: yoga_classes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: arunachala
--

SELECT pg_catalog.setval('public.yoga_classes_id_seq', 14, true);


--
-- Name: Features Features_pkey; Type: CONSTRAINT; Schema: p90csse7pqpqhxk; Owner: arunachala
--

ALTER TABLE ONLY p90csse7pqpqhxk."Features"
    ADD CONSTRAINT "Features_pkey" PRIMARY KEY (id);


--
-- Name: Features Features_pkey; Type: CONSTRAINT; Schema: p9j5mqhyeeb73rz; Owner: arunachala
--

ALTER TABLE ONLY p9j5mqhyeeb73rz."Features"
    ADD CONSTRAINT "Features_pkey" PRIMARY KEY (id);


--
-- Name: activities activities_pkey; Type: CONSTRAINT; Schema: public; Owner: arunachala
--

ALTER TABLE ONLY public.activities
    ADD CONSTRAINT activities_pkey PRIMARY KEY (id);


--
-- Name: agent_config agent_config_pkey; Type: CONSTRAINT; Schema: public; Owner: arunachala
--

ALTER TABLE ONLY public.agent_config
    ADD CONSTRAINT agent_config_pkey PRIMARY KEY (id);


--
-- Name: contents contents_pkey; Type: CONSTRAINT; Schema: public; Owner: arunachala
--

ALTER TABLE ONLY public.contents
    ADD CONSTRAINT contents_pkey PRIMARY KEY (id);


--
-- Name: dashboard_activities dashboard_activities_pkey; Type: CONSTRAINT; Schema: public; Owner: arunachala
--

ALTER TABLE ONLY public.dashboard_activities
    ADD CONSTRAINT dashboard_activities_pkey PRIMARY KEY (id);


--
-- Name: gallery gallery_pkey; Type: CONSTRAINT; Schema: public; Owner: arunachala
--

ALTER TABLE ONLY public.gallery
    ADD CONSTRAINT gallery_pkey PRIMARY KEY (id);


--
-- Name: massage_types massage_types_pkey; Type: CONSTRAINT; Schema: public; Owner: arunachala
--

ALTER TABLE ONLY public.massage_types
    ADD CONSTRAINT massage_types_pkey PRIMARY KEY (id);


--
-- Name: nc_api_tokens nc_api_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: arunachala
--

ALTER TABLE ONLY public.nc_api_tokens
    ADD CONSTRAINT nc_api_tokens_pkey PRIMARY KEY (id);


--
-- Name: nc_audit_v2 nc_audit_v2_pkx; Type: CONSTRAINT; Schema: public; Owner: arunachala
--

ALTER TABLE ONLY public.nc_audit_v2
    ADD CONSTRAINT nc_audit_v2_pkx PRIMARY KEY (id);


--
-- Name: nc_automation_executions nc_automation_executions_pkey; Type: CONSTRAINT; Schema: public; Owner: arunachala
--

ALTER TABLE ONLY public.nc_automation_executions
    ADD CONSTRAINT nc_automation_executions_pkey PRIMARY KEY (base_id, id);


--
-- Name: nc_automations nc_automations_pkey; Type: CONSTRAINT; Schema: public; Owner: arunachala
--

ALTER TABLE ONLY public.nc_automations
    ADD CONSTRAINT nc_automations_pkey PRIMARY KEY (base_id, id);


--
-- Name: nc_base_users_v2 nc_base_users_v2_pkey; Type: CONSTRAINT; Schema: public; Owner: arunachala
--

ALTER TABLE ONLY public.nc_base_users_v2
    ADD CONSTRAINT nc_base_users_v2_pkey PRIMARY KEY (base_id, fk_user_id);


--
-- Name: nc_sources_v2 nc_bases_v2_pkey; Type: CONSTRAINT; Schema: public; Owner: arunachala
--

ALTER TABLE ONLY public.nc_sources_v2
    ADD CONSTRAINT nc_bases_v2_pkey PRIMARY KEY (base_id, id);


--
-- Name: nc_calendar_view_columns_v2 nc_calendar_view_columns_v2_pkey; Type: CONSTRAINT; Schema: public; Owner: arunachala
--

ALTER TABLE ONLY public.nc_calendar_view_columns_v2
    ADD CONSTRAINT nc_calendar_view_columns_v2_pkey PRIMARY KEY (base_id, id);


--
-- Name: nc_calendar_view_range_v2 nc_calendar_view_range_v2_pkey; Type: CONSTRAINT; Schema: public; Owner: arunachala
--

ALTER TABLE ONLY public.nc_calendar_view_range_v2
    ADD CONSTRAINT nc_calendar_view_range_v2_pkey PRIMARY KEY (base_id, id);


--
-- Name: nc_calendar_view_v2 nc_calendar_view_v2_pkey; Type: CONSTRAINT; Schema: public; Owner: arunachala
--

ALTER TABLE ONLY public.nc_calendar_view_v2
    ADD CONSTRAINT nc_calendar_view_v2_pkey PRIMARY KEY (base_id, fk_view_id);


--
-- Name: nc_col_barcode_v2 nc_col_barcode_v2_pkey; Type: CONSTRAINT; Schema: public; Owner: arunachala
--

ALTER TABLE ONLY public.nc_col_barcode_v2
    ADD CONSTRAINT nc_col_barcode_v2_pkey PRIMARY KEY (base_id, id);


--
-- Name: nc_col_button_v2 nc_col_button_v2_pkey; Type: CONSTRAINT; Schema: public; Owner: arunachala
--

ALTER TABLE ONLY public.nc_col_button_v2
    ADD CONSTRAINT nc_col_button_v2_pkey PRIMARY KEY (base_id, id);


--
-- Name: nc_col_formula_v2 nc_col_formula_v2_pkey; Type: CONSTRAINT; Schema: public; Owner: arunachala
--

ALTER TABLE ONLY public.nc_col_formula_v2
    ADD CONSTRAINT nc_col_formula_v2_pkey PRIMARY KEY (base_id, id);


--
-- Name: nc_col_long_text_v2 nc_col_long_text_v2_pkey; Type: CONSTRAINT; Schema: public; Owner: arunachala
--

ALTER TABLE ONLY public.nc_col_long_text_v2
    ADD CONSTRAINT nc_col_long_text_v2_pkey PRIMARY KEY (base_id, id);


--
-- Name: nc_col_lookup_v2 nc_col_lookup_v2_pkey; Type: CONSTRAINT; Schema: public; Owner: arunachala
--

ALTER TABLE ONLY public.nc_col_lookup_v2
    ADD CONSTRAINT nc_col_lookup_v2_pkey PRIMARY KEY (base_id, id);


--
-- Name: nc_col_qrcode_v2 nc_col_qrcode_v2_pkey; Type: CONSTRAINT; Schema: public; Owner: arunachala
--

ALTER TABLE ONLY public.nc_col_qrcode_v2
    ADD CONSTRAINT nc_col_qrcode_v2_pkey PRIMARY KEY (base_id, id);


--
-- Name: nc_col_relations_v2 nc_col_relations_v2_pkey; Type: CONSTRAINT; Schema: public; Owner: arunachala
--

ALTER TABLE ONLY public.nc_col_relations_v2
    ADD CONSTRAINT nc_col_relations_v2_pkey PRIMARY KEY (base_id, id);


--
-- Name: nc_col_rollup_v2 nc_col_rollup_v2_pkey; Type: CONSTRAINT; Schema: public; Owner: arunachala
--

ALTER TABLE ONLY public.nc_col_rollup_v2
    ADD CONSTRAINT nc_col_rollup_v2_pkey PRIMARY KEY (base_id, id);


--
-- Name: nc_col_select_options_v2 nc_col_select_options_v2_pkey; Type: CONSTRAINT; Schema: public; Owner: arunachala
--

ALTER TABLE ONLY public.nc_col_select_options_v2
    ADD CONSTRAINT nc_col_select_options_v2_pkey PRIMARY KEY (base_id, id);


--
-- Name: nc_columns_v2 nc_columns_v2_pkey; Type: CONSTRAINT; Schema: public; Owner: arunachala
--

ALTER TABLE ONLY public.nc_columns_v2
    ADD CONSTRAINT nc_columns_v2_pkey PRIMARY KEY (base_id, id);


--
-- Name: nc_comment_reactions nc_comment_reactions_pkey; Type: CONSTRAINT; Schema: public; Owner: arunachala
--

ALTER TABLE ONLY public.nc_comment_reactions
    ADD CONSTRAINT nc_comment_reactions_pkey PRIMARY KEY (base_id, id);


--
-- Name: nc_comments nc_comments_pkey; Type: CONSTRAINT; Schema: public; Owner: arunachala
--

ALTER TABLE ONLY public.nc_comments
    ADD CONSTRAINT nc_comments_pkey PRIMARY KEY (base_id, id);


--
-- Name: nc_custom_urls_v2 nc_custom_urls_v2_pkey; Type: CONSTRAINT; Schema: public; Owner: arunachala
--

ALTER TABLE ONLY public.nc_custom_urls_v2
    ADD CONSTRAINT nc_custom_urls_v2_pkey PRIMARY KEY (base_id, id);


--
-- Name: nc_dashboards_v2 nc_dashboards_v2_pkey; Type: CONSTRAINT; Schema: public; Owner: arunachala
--

ALTER TABLE ONLY public.nc_dashboards_v2
    ADD CONSTRAINT nc_dashboards_v2_pkey PRIMARY KEY (base_id, id);


--
-- Name: nc_data_reflection nc_data_reflection_pkey; Type: CONSTRAINT; Schema: public; Owner: arunachala
--

ALTER TABLE ONLY public.nc_data_reflection
    ADD CONSTRAINT nc_data_reflection_pkey PRIMARY KEY (id);


--
-- Name: nc_db_servers nc_db_servers_pkey; Type: CONSTRAINT; Schema: public; Owner: arunachala
--

ALTER TABLE ONLY public.nc_db_servers
    ADD CONSTRAINT nc_db_servers_pkey PRIMARY KEY (id);


--
-- Name: nc_dependency_tracker nc_dependency_tracker_pkey; Type: CONSTRAINT; Schema: public; Owner: arunachala
--

ALTER TABLE ONLY public.nc_dependency_tracker
    ADD CONSTRAINT nc_dependency_tracker_pkey PRIMARY KEY (base_id, id);


--
-- Name: nc_disabled_models_for_role_v2 nc_disabled_models_for_role_v2_pkey; Type: CONSTRAINT; Schema: public; Owner: arunachala
--

ALTER TABLE ONLY public.nc_disabled_models_for_role_v2
    ADD CONSTRAINT nc_disabled_models_for_role_v2_pkey PRIMARY KEY (base_id, id);


--
-- Name: nc_extensions nc_extensions_pkey; Type: CONSTRAINT; Schema: public; Owner: arunachala
--

ALTER TABLE ONLY public.nc_extensions
    ADD CONSTRAINT nc_extensions_pkey PRIMARY KEY (base_id, id);


--
-- Name: nc_file_references nc_file_references_pkey; Type: CONSTRAINT; Schema: public; Owner: arunachala
--

ALTER TABLE ONLY public.nc_file_references
    ADD CONSTRAINT nc_file_references_pkey PRIMARY KEY (id);


--
-- Name: nc_filter_exp_v2 nc_filter_exp_v2_pkey; Type: CONSTRAINT; Schema: public; Owner: arunachala
--

ALTER TABLE ONLY public.nc_filter_exp_v2
    ADD CONSTRAINT nc_filter_exp_v2_pkey PRIMARY KEY (base_id, id);


--
-- Name: nc_follower nc_follower_pkey; Type: CONSTRAINT; Schema: public; Owner: arunachala
--

ALTER TABLE ONLY public.nc_follower
    ADD CONSTRAINT nc_follower_pkey PRIMARY KEY (fk_user_id, fk_follower_id);


--
-- Name: nc_form_view_columns_v2 nc_form_view_columns_v2_pkey; Type: CONSTRAINT; Schema: public; Owner: arunachala
--

ALTER TABLE ONLY public.nc_form_view_columns_v2
    ADD CONSTRAINT nc_form_view_columns_v2_pkey PRIMARY KEY (base_id, id);


--
-- Name: nc_form_view_v2 nc_form_view_v2_pkey; Type: CONSTRAINT; Schema: public; Owner: arunachala
--

ALTER TABLE ONLY public.nc_form_view_v2
    ADD CONSTRAINT nc_form_view_v2_pkey PRIMARY KEY (base_id, fk_view_id);


--
-- Name: nc_gallery_view_columns_v2 nc_gallery_view_columns_v2_pkey; Type: CONSTRAINT; Schema: public; Owner: arunachala
--

ALTER TABLE ONLY public.nc_gallery_view_columns_v2
    ADD CONSTRAINT nc_gallery_view_columns_v2_pkey PRIMARY KEY (base_id, id);


--
-- Name: nc_gallery_view_v2 nc_gallery_view_v2_pkey; Type: CONSTRAINT; Schema: public; Owner: arunachala
--

ALTER TABLE ONLY public.nc_gallery_view_v2
    ADD CONSTRAINT nc_gallery_view_v2_pkey PRIMARY KEY (base_id, fk_view_id);


--
-- Name: nc_grid_view_columns_v2 nc_grid_view_columns_v2_pkey; Type: CONSTRAINT; Schema: public; Owner: arunachala
--

ALTER TABLE ONLY public.nc_grid_view_columns_v2
    ADD CONSTRAINT nc_grid_view_columns_v2_pkey PRIMARY KEY (base_id, id);


--
-- Name: nc_grid_view_v2 nc_grid_view_v2_pkey; Type: CONSTRAINT; Schema: public; Owner: arunachala
--

ALTER TABLE ONLY public.nc_grid_view_v2
    ADD CONSTRAINT nc_grid_view_v2_pkey PRIMARY KEY (base_id, fk_view_id);


--
-- Name: nc_hook_logs_v2 nc_hook_logs_v2_pkey; Type: CONSTRAINT; Schema: public; Owner: arunachala
--

ALTER TABLE ONLY public.nc_hook_logs_v2
    ADD CONSTRAINT nc_hook_logs_v2_pkey PRIMARY KEY (base_id, id);


--
-- Name: nc_hook_trigger_fields nc_hook_trigger_fields_pkey; Type: CONSTRAINT; Schema: public; Owner: arunachala
--

ALTER TABLE ONLY public.nc_hook_trigger_fields
    ADD CONSTRAINT nc_hook_trigger_fields_pkey PRIMARY KEY (fk_workspace_id, base_id, fk_hook_id, fk_column_id);


--
-- Name: nc_hooks_v2 nc_hooks_v2_pkey; Type: CONSTRAINT; Schema: public; Owner: arunachala
--

ALTER TABLE ONLY public.nc_hooks_v2
    ADD CONSTRAINT nc_hooks_v2_pkey PRIMARY KEY (base_id, id);


--
-- Name: nc_installations nc_installations_pkey; Type: CONSTRAINT; Schema: public; Owner: arunachala
--

ALTER TABLE ONLY public.nc_installations
    ADD CONSTRAINT nc_installations_pkey PRIMARY KEY (id);


--
-- Name: nc_integrations_store_v2 nc_integrations_store_v2_pkey; Type: CONSTRAINT; Schema: public; Owner: arunachala
--

ALTER TABLE ONLY public.nc_integrations_store_v2
    ADD CONSTRAINT nc_integrations_store_v2_pkey PRIMARY KEY (id);


--
-- Name: nc_integrations_v2 nc_integrations_v2_pkey; Type: CONSTRAINT; Schema: public; Owner: arunachala
--

ALTER TABLE ONLY public.nc_integrations_v2
    ADD CONSTRAINT nc_integrations_v2_pkey PRIMARY KEY (id);


--
-- Name: nc_jobs nc_jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: arunachala
--

ALTER TABLE ONLY public.nc_jobs
    ADD CONSTRAINT nc_jobs_pkey PRIMARY KEY (id);


--
-- Name: nc_kanban_view_columns_v2 nc_kanban_view_columns_v2_pkey; Type: CONSTRAINT; Schema: public; Owner: arunachala
--

ALTER TABLE ONLY public.nc_kanban_view_columns_v2
    ADD CONSTRAINT nc_kanban_view_columns_v2_pkey PRIMARY KEY (base_id, id);


--
-- Name: nc_kanban_view_v2 nc_kanban_view_v2_pkey; Type: CONSTRAINT; Schema: public; Owner: arunachala
--

ALTER TABLE ONLY public.nc_kanban_view_v2
    ADD CONSTRAINT nc_kanban_view_v2_pkey PRIMARY KEY (base_id, fk_view_id);


--
-- Name: nc_map_view_columns_v2 nc_map_view_columns_v2_pkey; Type: CONSTRAINT; Schema: public; Owner: arunachala
--

ALTER TABLE ONLY public.nc_map_view_columns_v2
    ADD CONSTRAINT nc_map_view_columns_v2_pkey PRIMARY KEY (base_id, id);


--
-- Name: nc_map_view_v2 nc_map_view_v2_pkey; Type: CONSTRAINT; Schema: public; Owner: arunachala
--

ALTER TABLE ONLY public.nc_map_view_v2
    ADD CONSTRAINT nc_map_view_v2_pkey PRIMARY KEY (base_id, fk_view_id);


--
-- Name: nc_mcp_tokens nc_mcp_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: arunachala
--

ALTER TABLE ONLY public.nc_mcp_tokens
    ADD CONSTRAINT nc_mcp_tokens_pkey PRIMARY KEY (base_id, id);


--
-- Name: nc_model_stats_v2 nc_model_stats_v2_pkey; Type: CONSTRAINT; Schema: public; Owner: arunachala
--

ALTER TABLE ONLY public.nc_model_stats_v2
    ADD CONSTRAINT nc_model_stats_v2_pkey PRIMARY KEY (fk_workspace_id, base_id, fk_model_id);


--
-- Name: nc_models_v2 nc_models_v2_pkey; Type: CONSTRAINT; Schema: public; Owner: arunachala
--

ALTER TABLE ONLY public.nc_models_v2
    ADD CONSTRAINT nc_models_v2_pkey PRIMARY KEY (base_id, id);


--
-- Name: nc_oauth_authorization_codes nc_oauth_authorization_codes_pkey; Type: CONSTRAINT; Schema: public; Owner: arunachala
--

ALTER TABLE ONLY public.nc_oauth_authorization_codes
    ADD CONSTRAINT nc_oauth_authorization_codes_pkey PRIMARY KEY (code);


--
-- Name: nc_oauth_clients nc_oauth_clients_pkey; Type: CONSTRAINT; Schema: public; Owner: arunachala
--

ALTER TABLE ONLY public.nc_oauth_clients
    ADD CONSTRAINT nc_oauth_clients_pkey PRIMARY KEY (client_id);


--
-- Name: nc_oauth_tokens nc_oauth_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: arunachala
--

ALTER TABLE ONLY public.nc_oauth_tokens
    ADD CONSTRAINT nc_oauth_tokens_pkey PRIMARY KEY (id);


--
-- Name: nc_org_domain nc_org_domain_pkey; Type: CONSTRAINT; Schema: public; Owner: arunachala
--

ALTER TABLE ONLY public.nc_org_domain
    ADD CONSTRAINT nc_org_domain_pkey PRIMARY KEY (id);


--
-- Name: nc_org nc_org_pkey; Type: CONSTRAINT; Schema: public; Owner: arunachala
--

ALTER TABLE ONLY public.nc_org
    ADD CONSTRAINT nc_org_pkey PRIMARY KEY (id);


--
-- Name: nc_org_users nc_org_users_pkey; Type: CONSTRAINT; Schema: public; Owner: arunachala
--

ALTER TABLE ONLY public.nc_org_users
    ADD CONSTRAINT nc_org_users_pkey PRIMARY KEY (fk_org_id);


--
-- Name: nc_permission_subjects nc_permission_subjects_pkey; Type: CONSTRAINT; Schema: public; Owner: arunachala
--

ALTER TABLE ONLY public.nc_permission_subjects
    ADD CONSTRAINT nc_permission_subjects_pkey PRIMARY KEY (base_id, fk_permission_id, subject_type, subject_id);


--
-- Name: nc_permissions nc_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: arunachala
--

ALTER TABLE ONLY public.nc_permissions
    ADD CONSTRAINT nc_permissions_pkey PRIMARY KEY (base_id, id);


--
-- Name: nc_plans nc_plans_pkey; Type: CONSTRAINT; Schema: public; Owner: arunachala
--

ALTER TABLE ONLY public.nc_plans
    ADD CONSTRAINT nc_plans_pkey PRIMARY KEY (id);


--
-- Name: nc_plugins_v2 nc_plugins_v2_pkey; Type: CONSTRAINT; Schema: public; Owner: arunachala
--

ALTER TABLE ONLY public.nc_plugins_v2
    ADD CONSTRAINT nc_plugins_v2_pkey PRIMARY KEY (id);


--
-- Name: nc_principal_assignments nc_principal_assignments_pk; Type: CONSTRAINT; Schema: public; Owner: arunachala
--

ALTER TABLE ONLY public.nc_principal_assignments
    ADD CONSTRAINT nc_principal_assignments_pk PRIMARY KEY (resource_type, resource_id, principal_type, principal_ref_id);


--
-- Name: nc_bases_v2 nc_projects_v2_pkey; Type: CONSTRAINT; Schema: public; Owner: arunachala
--

ALTER TABLE ONLY public.nc_bases_v2
    ADD CONSTRAINT nc_projects_v2_pkey PRIMARY KEY (id);


--
-- Name: nc_row_color_conditions nc_row_color_conditions_pkey; Type: CONSTRAINT; Schema: public; Owner: arunachala
--

ALTER TABLE ONLY public.nc_row_color_conditions
    ADD CONSTRAINT nc_row_color_conditions_pkey PRIMARY KEY (base_id, id);


--
-- Name: nc_scripts nc_scripts_pkey; Type: CONSTRAINT; Schema: public; Owner: arunachala
--

ALTER TABLE ONLY public.nc_scripts
    ADD CONSTRAINT nc_scripts_pkey PRIMARY KEY (base_id, id);


--
-- Name: nc_snapshots nc_snapshots_pkey; Type: CONSTRAINT; Schema: public; Owner: arunachala
--

ALTER TABLE ONLY public.nc_snapshots
    ADD CONSTRAINT nc_snapshots_pkey PRIMARY KEY (id);


--
-- Name: nc_sort_v2 nc_sort_v2_pkey; Type: CONSTRAINT; Schema: public; Owner: arunachala
--

ALTER TABLE ONLY public.nc_sort_v2
    ADD CONSTRAINT nc_sort_v2_pkey PRIMARY KEY (base_id, id);


--
-- Name: nc_sql_executor_v2 nc_sql_executor_v2_pkey; Type: CONSTRAINT; Schema: public; Owner: arunachala
--

ALTER TABLE ONLY public.nc_sql_executor_v2
    ADD CONSTRAINT nc_sql_executor_v2_pkey PRIMARY KEY (id);


--
-- Name: nc_sso_client_domain nc_sso_client_domain_pkey; Type: CONSTRAINT; Schema: public; Owner: arunachala
--

ALTER TABLE ONLY public.nc_sso_client_domain
    ADD CONSTRAINT nc_sso_client_domain_pkey PRIMARY KEY (fk_sso_client_id);


--
-- Name: nc_sso_client nc_sso_client_pkey; Type: CONSTRAINT; Schema: public; Owner: arunachala
--

ALTER TABLE ONLY public.nc_sso_client
    ADD CONSTRAINT nc_sso_client_pkey PRIMARY KEY (id);


--
-- Name: nc_store nc_store_pkey; Type: CONSTRAINT; Schema: public; Owner: arunachala
--

ALTER TABLE ONLY public.nc_store
    ADD CONSTRAINT nc_store_pkey PRIMARY KEY (id);


--
-- Name: nc_subscriptions nc_subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: arunachala
--

ALTER TABLE ONLY public.nc_subscriptions
    ADD CONSTRAINT nc_subscriptions_pkey PRIMARY KEY (id);


--
-- Name: nc_sync_configs nc_sync_configs_pkey; Type: CONSTRAINT; Schema: public; Owner: arunachala
--

ALTER TABLE ONLY public.nc_sync_configs
    ADD CONSTRAINT nc_sync_configs_pkey PRIMARY KEY (base_id, id);


--
-- Name: nc_sync_logs_v2 nc_sync_logs_v2_pkey; Type: CONSTRAINT; Schema: public; Owner: arunachala
--

ALTER TABLE ONLY public.nc_sync_logs_v2
    ADD CONSTRAINT nc_sync_logs_v2_pkey PRIMARY KEY (base_id, id);


--
-- Name: nc_sync_mappings nc_sync_mappings_pkey; Type: CONSTRAINT; Schema: public; Owner: arunachala
--

ALTER TABLE ONLY public.nc_sync_mappings
    ADD CONSTRAINT nc_sync_mappings_pkey PRIMARY KEY (base_id, id);


--
-- Name: nc_sync_source_v2 nc_sync_source_v2_pkey; Type: CONSTRAINT; Schema: public; Owner: arunachala
--

ALTER TABLE ONLY public.nc_sync_source_v2
    ADD CONSTRAINT nc_sync_source_v2_pkey PRIMARY KEY (base_id, id);


--
-- Name: nc_teams nc_teams_pkey; Type: CONSTRAINT; Schema: public; Owner: arunachala
--

ALTER TABLE ONLY public.nc_teams
    ADD CONSTRAINT nc_teams_pkey PRIMARY KEY (id);


--
-- Name: nc_usage_stats nc_usage_stats_pkey; Type: CONSTRAINT; Schema: public; Owner: arunachala
--

ALTER TABLE ONLY public.nc_usage_stats
    ADD CONSTRAINT nc_usage_stats_pkey PRIMARY KEY (fk_workspace_id, usage_type, period_start);


--
-- Name: nc_user_comment_notifications_preference nc_user_comment_notifications_preference_pkey; Type: CONSTRAINT; Schema: public; Owner: arunachala
--

ALTER TABLE ONLY public.nc_user_comment_notifications_preference
    ADD CONSTRAINT nc_user_comment_notifications_preference_pkey PRIMARY KEY (id);


--
-- Name: nc_users_v2 nc_users_v2_pkey; Type: CONSTRAINT; Schema: public; Owner: arunachala
--

ALTER TABLE ONLY public.nc_users_v2
    ADD CONSTRAINT nc_users_v2_pkey PRIMARY KEY (id);


--
-- Name: nc_views_v2 nc_views_v2_pkey; Type: CONSTRAINT; Schema: public; Owner: arunachala
--

ALTER TABLE ONLY public.nc_views_v2
    ADD CONSTRAINT nc_views_v2_pkey PRIMARY KEY (base_id, id);


--
-- Name: nc_widgets_v2 nc_widgets_v2_pkey; Type: CONSTRAINT; Schema: public; Owner: arunachala
--

ALTER TABLE ONLY public.nc_widgets_v2
    ADD CONSTRAINT nc_widgets_v2_pkey PRIMARY KEY (base_id, id);


--
-- Name: nc_workflows nc_workflows_pkey; Type: CONSTRAINT; Schema: public; Owner: arunachala
--

ALTER TABLE ONLY public.nc_workflows
    ADD CONSTRAINT nc_workflows_pkey PRIMARY KEY (id);


--
-- Name: notification notification_pkey; Type: CONSTRAINT; Schema: public; Owner: arunachala
--

ALTER TABLE ONLY public.notification
    ADD CONSTRAINT notification_pkey PRIMARY KEY (id);


--
-- Name: schedules schedules_pkey; Type: CONSTRAINT; Schema: public; Owner: arunachala
--

ALTER TABLE ONLY public.schedules
    ADD CONSTRAINT schedules_pkey PRIMARY KEY (id);


--
-- Name: therapy_types therapy_types_pkey; Type: CONSTRAINT; Schema: public; Owner: arunachala
--

ALTER TABLE ONLY public.therapy_types
    ADD CONSTRAINT therapy_types_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: arunachala
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: workspace workspace_pkey; Type: CONSTRAINT; Schema: public; Owner: arunachala
--

ALTER TABLE ONLY public.workspace
    ADD CONSTRAINT workspace_pkey PRIMARY KEY (id);


--
-- Name: workspace_user workspace_user_pkey; Type: CONSTRAINT; Schema: public; Owner: arunachala
--

ALTER TABLE ONLY public.workspace_user
    ADD CONSTRAINT workspace_user_pkey PRIMARY KEY (fk_workspace_id, fk_user_id);


--
-- Name: xc_knex_migrationsv0_lock xc_knex_migrationsv0_lock_pkey; Type: CONSTRAINT; Schema: public; Owner: arunachala
--

ALTER TABLE ONLY public.xc_knex_migrationsv0_lock
    ADD CONSTRAINT xc_knex_migrationsv0_lock_pkey PRIMARY KEY (index);


--
-- Name: xc_knex_migrationsv0 xc_knex_migrationsv0_pkey; Type: CONSTRAINT; Schema: public; Owner: arunachala
--

ALTER TABLE ONLY public.xc_knex_migrationsv0
    ADD CONSTRAINT xc_knex_migrationsv0_pkey PRIMARY KEY (id);


--
-- Name: yoga_classes yoga_classes_pkey; Type: CONSTRAINT; Schema: public; Owner: arunachala
--

ALTER TABLE ONLY public.yoga_classes
    ADD CONSTRAINT yoga_classes_pkey PRIMARY KEY (id);


--
-- Name: Features_order_idx; Type: INDEX; Schema: p90csse7pqpqhxk; Owner: arunachala
--

CREATE INDEX "Features_order_idx" ON p90csse7pqpqhxk."Features" USING btree (nc_order);


--
-- Name: Features_order_idx; Type: INDEX; Schema: p9j5mqhyeeb73rz; Owner: arunachala
--

CREATE INDEX "Features_order_idx" ON p9j5mqhyeeb73rz."Features" USING btree (nc_order);


--
-- Name: ix_activities_id; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX ix_activities_id ON public.activities USING btree (id);


--
-- Name: ix_activities_slug; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE UNIQUE INDEX ix_activities_slug ON public.activities USING btree (slug);


--
-- Name: ix_activities_title; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX ix_activities_title ON public.activities USING btree (title);


--
-- Name: ix_agent_config_id; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX ix_agent_config_id ON public.agent_config USING btree (id);


--
-- Name: ix_contents_id; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX ix_contents_id ON public.contents USING btree (id);


--
-- Name: ix_contents_slug; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE UNIQUE INDEX ix_contents_slug ON public.contents USING btree (slug);


--
-- Name: ix_contents_title; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX ix_contents_title ON public.contents USING btree (title);


--
-- Name: ix_dashboard_activities_id; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX ix_dashboard_activities_id ON public.dashboard_activities USING btree (id);


--
-- Name: ix_gallery_id; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX ix_gallery_id ON public.gallery USING btree (id);


--
-- Name: ix_massage_types_id; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX ix_massage_types_id ON public.massage_types USING btree (id);


--
-- Name: ix_massage_types_name; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE UNIQUE INDEX ix_massage_types_name ON public.massage_types USING btree (name);


--
-- Name: ix_schedules_id; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX ix_schedules_id ON public.schedules USING btree (id);


--
-- Name: ix_therapy_types_id; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX ix_therapy_types_id ON public.therapy_types USING btree (id);


--
-- Name: ix_therapy_types_name; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE UNIQUE INDEX ix_therapy_types_name ON public.therapy_types USING btree (name);


--
-- Name: ix_users_email; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE UNIQUE INDEX ix_users_email ON public.users USING btree (email);


--
-- Name: ix_users_id; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX ix_users_id ON public.users USING btree (id);


--
-- Name: ix_yoga_classes_id; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX ix_yoga_classes_id ON public.yoga_classes USING btree (id);


--
-- Name: ix_yoga_classes_name; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE UNIQUE INDEX ix_yoga_classes_name ON public.yoga_classes USING btree (name);


--
-- Name: nc_api_tokens_fk_sso_client_id_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_api_tokens_fk_sso_client_id_index ON public.nc_api_tokens USING btree (fk_sso_client_id);


--
-- Name: nc_api_tokens_fk_user_id_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_api_tokens_fk_user_id_index ON public.nc_api_tokens USING btree (fk_user_id);


--
-- Name: nc_audit_v2_fk_workspace_idx; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_audit_v2_fk_workspace_idx ON public.nc_audit_v2 USING btree (fk_workspace_id);


--
-- Name: nc_audit_v2_old_id_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_audit_v2_old_id_index ON public.nc_audit_v2 USING btree (old_id);


--
-- Name: nc_audit_v2_tenant_idx; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_audit_v2_tenant_idx ON public.nc_audit_v2 USING btree (base_id, fk_workspace_id);


--
-- Name: nc_automation_executions_oldpk_idx; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_automation_executions_oldpk_idx ON public.nc_automation_executions USING btree (id);


--
-- Name: nc_automation_executions_resume_idx; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_automation_executions_resume_idx ON public.nc_automation_executions USING btree (fk_workspace_id, base_id, resume_at);


--
-- Name: nc_automations_context_idx; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_automations_context_idx ON public.nc_automations USING btree (base_id, fk_workspace_id);


--
-- Name: nc_automations_enabled_idx; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_automations_enabled_idx ON public.nc_automations USING btree (enabled);


--
-- Name: nc_automations_oldpk_idx; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_automations_oldpk_idx ON public.nc_automations USING btree (id);


--
-- Name: nc_automations_order_idx; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_automations_order_idx ON public.nc_automations USING btree (base_id, "order");


--
-- Name: nc_automations_type_idx; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_automations_type_idx ON public.nc_automations USING btree (type);


--
-- Name: nc_base_users_v2_base_id_fk_workspace_id_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_base_users_v2_base_id_fk_workspace_id_index ON public.nc_base_users_v2 USING btree (base_id, fk_workspace_id);


--
-- Name: nc_base_users_v2_invited_by_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_base_users_v2_invited_by_index ON public.nc_base_users_v2 USING btree (invited_by);


--
-- Name: nc_bases_v2_fk_custom_url_id_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_bases_v2_fk_custom_url_id_index ON public.nc_bases_v2 USING btree (fk_custom_url_id);


--
-- Name: nc_bases_v2_fk_workspace_id_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_bases_v2_fk_workspace_id_index ON public.nc_bases_v2 USING btree (fk_workspace_id);


--
-- Name: nc_calendar_view_columns_v2_base_id_fk_workspace_id_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_calendar_view_columns_v2_base_id_fk_workspace_id_index ON public.nc_calendar_view_columns_v2 USING btree (base_id, fk_workspace_id);


--
-- Name: nc_calendar_view_columns_v2_fk_view_id_fk_column_id_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_calendar_view_columns_v2_fk_view_id_fk_column_id_index ON public.nc_calendar_view_columns_v2 USING btree (fk_view_id, fk_column_id);


--
-- Name: nc_calendar_view_columns_v2_oldpk_idx; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_calendar_view_columns_v2_oldpk_idx ON public.nc_calendar_view_columns_v2 USING btree (id);


--
-- Name: nc_calendar_view_range_v2_base_id_fk_workspace_id_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_calendar_view_range_v2_base_id_fk_workspace_id_index ON public.nc_calendar_view_range_v2 USING btree (base_id, fk_workspace_id);


--
-- Name: nc_calendar_view_range_v2_oldpk_idx; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_calendar_view_range_v2_oldpk_idx ON public.nc_calendar_view_range_v2 USING btree (id);


--
-- Name: nc_calendar_view_v2_base_id_fk_workspace_id_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_calendar_view_v2_base_id_fk_workspace_id_index ON public.nc_calendar_view_v2 USING btree (base_id, fk_workspace_id);


--
-- Name: nc_calendar_view_v2_oldpk_idx; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_calendar_view_v2_oldpk_idx ON public.nc_calendar_view_v2 USING btree (fk_view_id);


--
-- Name: nc_col_barcode_v2_base_id_fk_workspace_id_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_col_barcode_v2_base_id_fk_workspace_id_index ON public.nc_col_barcode_v2 USING btree (base_id, fk_workspace_id);


--
-- Name: nc_col_barcode_v2_fk_column_id_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_col_barcode_v2_fk_column_id_index ON public.nc_col_barcode_v2 USING btree (fk_column_id);


--
-- Name: nc_col_barcode_v2_oldpk_idx; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_col_barcode_v2_oldpk_idx ON public.nc_col_barcode_v2 USING btree (id);


--
-- Name: nc_col_button_context; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_col_button_context ON public.nc_col_button_v2 USING btree (base_id, fk_workspace_id);


--
-- Name: nc_col_button_v2_fk_column_id_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_col_button_v2_fk_column_id_index ON public.nc_col_button_v2 USING btree (fk_column_id);


--
-- Name: nc_col_button_v2_oldpk_idx; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_col_button_v2_oldpk_idx ON public.nc_col_button_v2 USING btree (id);


--
-- Name: nc_col_formula_v2_base_id_fk_workspace_id_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_col_formula_v2_base_id_fk_workspace_id_index ON public.nc_col_formula_v2 USING btree (base_id, fk_workspace_id);


--
-- Name: nc_col_formula_v2_fk_column_id_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_col_formula_v2_fk_column_id_index ON public.nc_col_formula_v2 USING btree (fk_column_id);


--
-- Name: nc_col_formula_v2_oldpk_idx; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_col_formula_v2_oldpk_idx ON public.nc_col_formula_v2 USING btree (id);


--
-- Name: nc_col_long_text_context; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_col_long_text_context ON public.nc_col_long_text_v2 USING btree (base_id, fk_workspace_id);


--
-- Name: nc_col_long_text_v2_fk_column_id_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_col_long_text_v2_fk_column_id_index ON public.nc_col_long_text_v2 USING btree (fk_column_id);


--
-- Name: nc_col_long_text_v2_oldpk_idx; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_col_long_text_v2_oldpk_idx ON public.nc_col_long_text_v2 USING btree (id);


--
-- Name: nc_col_lookup_v2_base_id_fk_workspace_id_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_col_lookup_v2_base_id_fk_workspace_id_index ON public.nc_col_lookup_v2 USING btree (base_id, fk_workspace_id);


--
-- Name: nc_col_lookup_v2_fk_column_id_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_col_lookup_v2_fk_column_id_index ON public.nc_col_lookup_v2 USING btree (fk_column_id);


--
-- Name: nc_col_lookup_v2_fk_lookup_column_id_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_col_lookup_v2_fk_lookup_column_id_index ON public.nc_col_lookup_v2 USING btree (fk_lookup_column_id);


--
-- Name: nc_col_lookup_v2_fk_relation_column_id_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_col_lookup_v2_fk_relation_column_id_index ON public.nc_col_lookup_v2 USING btree (fk_relation_column_id);


--
-- Name: nc_col_lookup_v2_oldpk_idx; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_col_lookup_v2_oldpk_idx ON public.nc_col_lookup_v2 USING btree (id);


--
-- Name: nc_col_qrcode_v2_base_id_fk_workspace_id_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_col_qrcode_v2_base_id_fk_workspace_id_index ON public.nc_col_qrcode_v2 USING btree (base_id, fk_workspace_id);


--
-- Name: nc_col_qrcode_v2_fk_column_id_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_col_qrcode_v2_fk_column_id_index ON public.nc_col_qrcode_v2 USING btree (fk_column_id);


--
-- Name: nc_col_qrcode_v2_oldpk_idx; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_col_qrcode_v2_oldpk_idx ON public.nc_col_qrcode_v2 USING btree (id);


--
-- Name: nc_col_relations_v2_base_id_fk_workspace_id_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_col_relations_v2_base_id_fk_workspace_id_index ON public.nc_col_relations_v2 USING btree (base_id, fk_workspace_id);


--
-- Name: nc_col_relations_v2_fk_child_column_id_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_col_relations_v2_fk_child_column_id_index ON public.nc_col_relations_v2 USING btree (fk_child_column_id);


--
-- Name: nc_col_relations_v2_fk_column_id_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_col_relations_v2_fk_column_id_index ON public.nc_col_relations_v2 USING btree (fk_column_id);


--
-- Name: nc_col_relations_v2_fk_mm_child_column_id_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_col_relations_v2_fk_mm_child_column_id_index ON public.nc_col_relations_v2 USING btree (fk_mm_child_column_id);


--
-- Name: nc_col_relations_v2_fk_mm_model_id_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_col_relations_v2_fk_mm_model_id_index ON public.nc_col_relations_v2 USING btree (fk_mm_model_id);


--
-- Name: nc_col_relations_v2_fk_mm_parent_column_id_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_col_relations_v2_fk_mm_parent_column_id_index ON public.nc_col_relations_v2 USING btree (fk_mm_parent_column_id);


--
-- Name: nc_col_relations_v2_fk_parent_column_id_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_col_relations_v2_fk_parent_column_id_index ON public.nc_col_relations_v2 USING btree (fk_parent_column_id);


--
-- Name: nc_col_relations_v2_fk_related_model_id_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_col_relations_v2_fk_related_model_id_index ON public.nc_col_relations_v2 USING btree (fk_related_model_id);


--
-- Name: nc_col_relations_v2_fk_target_view_id_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_col_relations_v2_fk_target_view_id_index ON public.nc_col_relations_v2 USING btree (fk_target_view_id);


--
-- Name: nc_col_relations_v2_oldpk_idx; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_col_relations_v2_oldpk_idx ON public.nc_col_relations_v2 USING btree (id);


--
-- Name: nc_col_rollup_v2_base_id_fk_workspace_id_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_col_rollup_v2_base_id_fk_workspace_id_index ON public.nc_col_rollup_v2 USING btree (base_id, fk_workspace_id);


--
-- Name: nc_col_rollup_v2_fk_column_id_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_col_rollup_v2_fk_column_id_index ON public.nc_col_rollup_v2 USING btree (fk_column_id);


--
-- Name: nc_col_rollup_v2_fk_relation_column_id_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_col_rollup_v2_fk_relation_column_id_index ON public.nc_col_rollup_v2 USING btree (fk_relation_column_id);


--
-- Name: nc_col_rollup_v2_fk_rollup_column_id_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_col_rollup_v2_fk_rollup_column_id_index ON public.nc_col_rollup_v2 USING btree (fk_rollup_column_id);


--
-- Name: nc_col_rollup_v2_oldpk_idx; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_col_rollup_v2_oldpk_idx ON public.nc_col_rollup_v2 USING btree (id);


--
-- Name: nc_col_select_options_v2_base_id_fk_workspace_id_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_col_select_options_v2_base_id_fk_workspace_id_index ON public.nc_col_select_options_v2 USING btree (base_id, fk_workspace_id);


--
-- Name: nc_col_select_options_v2_fk_column_id_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_col_select_options_v2_fk_column_id_index ON public.nc_col_select_options_v2 USING btree (fk_column_id);


--
-- Name: nc_col_select_options_v2_oldpk_idx; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_col_select_options_v2_oldpk_idx ON public.nc_col_select_options_v2 USING btree (id);


--
-- Name: nc_columns_v2_base_id_fk_workspace_id_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_columns_v2_base_id_fk_workspace_id_index ON public.nc_columns_v2 USING btree (base_id, fk_workspace_id);


--
-- Name: nc_columns_v2_fk_model_id_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_columns_v2_fk_model_id_index ON public.nc_columns_v2 USING btree (fk_model_id);


--
-- Name: nc_columns_v2_oldpk_idx; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_columns_v2_oldpk_idx ON public.nc_columns_v2 USING btree (id);


--
-- Name: nc_comment_reactions_base_id_fk_workspace_id_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_comment_reactions_base_id_fk_workspace_id_index ON public.nc_comment_reactions USING btree (base_id, fk_workspace_id);


--
-- Name: nc_comment_reactions_comment_id_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_comment_reactions_comment_id_index ON public.nc_comment_reactions USING btree (comment_id);


--
-- Name: nc_comment_reactions_oldpk_idx; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_comment_reactions_oldpk_idx ON public.nc_comment_reactions USING btree (id);


--
-- Name: nc_comment_reactions_row_id_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_comment_reactions_row_id_index ON public.nc_comment_reactions USING btree (row_id);


--
-- Name: nc_comments_base_id_fk_workspace_id_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_comments_base_id_fk_workspace_id_index ON public.nc_comments USING btree (base_id, fk_workspace_id);


--
-- Name: nc_comments_oldpk_idx; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_comments_oldpk_idx ON public.nc_comments USING btree (id);


--
-- Name: nc_comments_row_id_fk_model_id_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_comments_row_id_fk_model_id_index ON public.nc_comments USING btree (row_id, fk_model_id);


--
-- Name: nc_custom_urls_context; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_custom_urls_context ON public.nc_custom_urls_v2 USING btree (base_id, fk_workspace_id);


--
-- Name: nc_custom_urls_v2_custom_path_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_custom_urls_v2_custom_path_index ON public.nc_custom_urls_v2 USING btree (custom_path);


--
-- Name: nc_custom_urls_v2_fk_dashboard_id_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_custom_urls_v2_fk_dashboard_id_index ON public.nc_custom_urls_v2 USING btree (fk_dashboard_id);


--
-- Name: nc_custom_urls_v2_oldpk_idx; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_custom_urls_v2_oldpk_idx ON public.nc_custom_urls_v2 USING btree (id);


--
-- Name: nc_dashboards_context; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_dashboards_context ON public.nc_dashboards_v2 USING btree (base_id, fk_workspace_id);


--
-- Name: nc_dashboards_v2_oldpk_idx; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_dashboards_v2_oldpk_idx ON public.nc_dashboards_v2 USING btree (id);


--
-- Name: nc_data_reflection_fk_workspace_id_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_data_reflection_fk_workspace_id_index ON public.nc_data_reflection USING btree (fk_workspace_id);


--
-- Name: nc_dependency_tracker_context_idx; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_dependency_tracker_context_idx ON public.nc_dependency_tracker USING btree (base_id, fk_workspace_id);


--
-- Name: nc_dependency_tracker_dependent_idx; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_dependency_tracker_dependent_idx ON public.nc_dependency_tracker USING btree (dependent_type, dependent_id);


--
-- Name: nc_dependency_tracker_oldpk_idx; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_dependency_tracker_oldpk_idx ON public.nc_dependency_tracker USING btree (id);


--
-- Name: nc_dependency_tracker_queryable_field_0_idx; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_dependency_tracker_queryable_field_0_idx ON public.nc_dependency_tracker USING btree (queryable_field_0);


--
-- Name: nc_dependency_tracker_queryable_field_1_idx; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_dependency_tracker_queryable_field_1_idx ON public.nc_dependency_tracker USING btree (queryable_field_1);


--
-- Name: nc_dependency_tracker_queryable_field_2_idx; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_dependency_tracker_queryable_field_2_idx ON public.nc_dependency_tracker USING btree (queryable_field_2);


--
-- Name: nc_dependency_tracker_source_idx; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_dependency_tracker_source_idx ON public.nc_dependency_tracker USING btree (source_type, source_id);


--
-- Name: nc_disabled_models_for_role_v2_base_id_fk_workspace_id_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_disabled_models_for_role_v2_base_id_fk_workspace_id_index ON public.nc_disabled_models_for_role_v2 USING btree (base_id, fk_workspace_id);


--
-- Name: nc_disabled_models_for_role_v2_fk_view_id_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_disabled_models_for_role_v2_fk_view_id_index ON public.nc_disabled_models_for_role_v2 USING btree (fk_view_id);


--
-- Name: nc_disabled_models_for_role_v2_oldpk_idx; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_disabled_models_for_role_v2_oldpk_idx ON public.nc_disabled_models_for_role_v2 USING btree (id);


--
-- Name: nc_extensions_base_id_fk_workspace_id_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_extensions_base_id_fk_workspace_id_index ON public.nc_extensions USING btree (base_id, fk_workspace_id);


--
-- Name: nc_extensions_oldpk_idx; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_extensions_oldpk_idx ON public.nc_extensions USING btree (id);


--
-- Name: nc_filter_exp_v2_base_id_fk_workspace_id_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_filter_exp_v2_base_id_fk_workspace_id_index ON public.nc_filter_exp_v2 USING btree (base_id, fk_workspace_id);


--
-- Name: nc_filter_exp_v2_fk_column_id_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_filter_exp_v2_fk_column_id_index ON public.nc_filter_exp_v2 USING btree (fk_column_id);


--
-- Name: nc_filter_exp_v2_fk_hook_id_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_filter_exp_v2_fk_hook_id_index ON public.nc_filter_exp_v2 USING btree (fk_hook_id);


--
-- Name: nc_filter_exp_v2_fk_link_col_id_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_filter_exp_v2_fk_link_col_id_index ON public.nc_filter_exp_v2 USING btree (fk_link_col_id);


--
-- Name: nc_filter_exp_v2_fk_parent_column_id_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_filter_exp_v2_fk_parent_column_id_index ON public.nc_filter_exp_v2 USING btree (fk_parent_column_id);


--
-- Name: nc_filter_exp_v2_fk_parent_id_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_filter_exp_v2_fk_parent_id_index ON public.nc_filter_exp_v2 USING btree (fk_parent_id);


--
-- Name: nc_filter_exp_v2_fk_value_col_id_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_filter_exp_v2_fk_value_col_id_index ON public.nc_filter_exp_v2 USING btree (fk_value_col_id);


--
-- Name: nc_filter_exp_v2_fk_view_id_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_filter_exp_v2_fk_view_id_index ON public.nc_filter_exp_v2 USING btree (fk_view_id);


--
-- Name: nc_filter_exp_v2_fk_widget_id_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_filter_exp_v2_fk_widget_id_index ON public.nc_filter_exp_v2 USING btree (fk_widget_id);


--
-- Name: nc_filter_exp_v2_oldpk_idx; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_filter_exp_v2_oldpk_idx ON public.nc_filter_exp_v2 USING btree (id);


--
-- Name: nc_follower_fk_follower_id_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_follower_fk_follower_id_index ON public.nc_follower USING btree (fk_follower_id);


--
-- Name: nc_follower_fk_user_id_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_follower_fk_user_id_index ON public.nc_follower USING btree (fk_user_id);


--
-- Name: nc_form_view_columns_v2_base_id_fk_workspace_id_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_form_view_columns_v2_base_id_fk_workspace_id_index ON public.nc_form_view_columns_v2 USING btree (base_id, fk_workspace_id);


--
-- Name: nc_form_view_columns_v2_fk_column_id_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_form_view_columns_v2_fk_column_id_index ON public.nc_form_view_columns_v2 USING btree (fk_column_id);


--
-- Name: nc_form_view_columns_v2_fk_view_id_fk_column_id_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_form_view_columns_v2_fk_view_id_fk_column_id_index ON public.nc_form_view_columns_v2 USING btree (fk_view_id, fk_column_id);


--
-- Name: nc_form_view_columns_v2_fk_view_id_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_form_view_columns_v2_fk_view_id_index ON public.nc_form_view_columns_v2 USING btree (fk_view_id);


--
-- Name: nc_form_view_columns_v2_oldpk_idx; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_form_view_columns_v2_oldpk_idx ON public.nc_form_view_columns_v2 USING btree (id);


--
-- Name: nc_form_view_v2_base_id_fk_workspace_id_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_form_view_v2_base_id_fk_workspace_id_index ON public.nc_form_view_v2 USING btree (base_id, fk_workspace_id);


--
-- Name: nc_form_view_v2_fk_view_id_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_form_view_v2_fk_view_id_index ON public.nc_form_view_v2 USING btree (fk_view_id);


--
-- Name: nc_form_view_v2_oldpk_idx; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_form_view_v2_oldpk_idx ON public.nc_form_view_v2 USING btree (fk_view_id);


--
-- Name: nc_fr_context; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_fr_context ON public.nc_file_references USING btree (base_id, fk_workspace_id);


--
-- Name: nc_gallery_view_columns_v2_base_id_fk_workspace_id_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_gallery_view_columns_v2_base_id_fk_workspace_id_index ON public.nc_gallery_view_columns_v2 USING btree (base_id, fk_workspace_id);


--
-- Name: nc_gallery_view_columns_v2_fk_column_id_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_gallery_view_columns_v2_fk_column_id_index ON public.nc_gallery_view_columns_v2 USING btree (fk_column_id);


--
-- Name: nc_gallery_view_columns_v2_fk_view_id_fk_column_id_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_gallery_view_columns_v2_fk_view_id_fk_column_id_index ON public.nc_gallery_view_columns_v2 USING btree (fk_view_id, fk_column_id);


--
-- Name: nc_gallery_view_columns_v2_fk_view_id_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_gallery_view_columns_v2_fk_view_id_index ON public.nc_gallery_view_columns_v2 USING btree (fk_view_id);


--
-- Name: nc_gallery_view_columns_v2_oldpk_idx; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_gallery_view_columns_v2_oldpk_idx ON public.nc_gallery_view_columns_v2 USING btree (id);


--
-- Name: nc_gallery_view_v2_base_id_fk_workspace_id_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_gallery_view_v2_base_id_fk_workspace_id_index ON public.nc_gallery_view_v2 USING btree (base_id, fk_workspace_id);


--
-- Name: nc_gallery_view_v2_fk_view_id_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_gallery_view_v2_fk_view_id_index ON public.nc_gallery_view_v2 USING btree (fk_view_id);


--
-- Name: nc_gallery_view_v2_oldpk_idx; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_gallery_view_v2_oldpk_idx ON public.nc_gallery_view_v2 USING btree (fk_view_id);


--
-- Name: nc_grid_view_columns_v2_base_id_fk_workspace_id_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_grid_view_columns_v2_base_id_fk_workspace_id_index ON public.nc_grid_view_columns_v2 USING btree (base_id, fk_workspace_id);


--
-- Name: nc_grid_view_columns_v2_fk_column_id_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_grid_view_columns_v2_fk_column_id_index ON public.nc_grid_view_columns_v2 USING btree (fk_column_id);


--
-- Name: nc_grid_view_columns_v2_fk_view_id_fk_column_id_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_grid_view_columns_v2_fk_view_id_fk_column_id_index ON public.nc_grid_view_columns_v2 USING btree (fk_view_id, fk_column_id);


--
-- Name: nc_grid_view_columns_v2_fk_view_id_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_grid_view_columns_v2_fk_view_id_index ON public.nc_grid_view_columns_v2 USING btree (fk_view_id);


--
-- Name: nc_grid_view_columns_v2_oldpk_idx; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_grid_view_columns_v2_oldpk_idx ON public.nc_grid_view_columns_v2 USING btree (id);


--
-- Name: nc_grid_view_v2_base_id_fk_workspace_id_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_grid_view_v2_base_id_fk_workspace_id_index ON public.nc_grid_view_v2 USING btree (base_id, fk_workspace_id);


--
-- Name: nc_grid_view_v2_fk_view_id_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_grid_view_v2_fk_view_id_index ON public.nc_grid_view_v2 USING btree (fk_view_id);


--
-- Name: nc_grid_view_v2_oldpk_idx; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_grid_view_v2_oldpk_idx ON public.nc_grid_view_v2 USING btree (fk_view_id);


--
-- Name: nc_hook_logs_v2_base_id_fk_workspace_id_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_hook_logs_v2_base_id_fk_workspace_id_index ON public.nc_hook_logs_v2 USING btree (base_id, fk_workspace_id);


--
-- Name: nc_hook_logs_v2_oldpk_idx; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_hook_logs_v2_oldpk_idx ON public.nc_hook_logs_v2 USING btree (id);


--
-- Name: nc_hooks_v2_base_id_fk_workspace_id_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_hooks_v2_base_id_fk_workspace_id_index ON public.nc_hooks_v2 USING btree (base_id, fk_workspace_id);


--
-- Name: nc_hooks_v2_fk_model_id_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_hooks_v2_fk_model_id_index ON public.nc_hooks_v2 USING btree (fk_model_id);


--
-- Name: nc_hooks_v2_oldpk_idx; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_hooks_v2_oldpk_idx ON public.nc_hooks_v2 USING btree (id);


--
-- Name: nc_installations_license_key_idx; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_installations_license_key_idx ON public.nc_installations USING btree (license_key);


--
-- Name: nc_integrations_store_v2_fk_integration_id_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_integrations_store_v2_fk_integration_id_index ON public.nc_integrations_store_v2 USING btree (fk_integration_id);


--
-- Name: nc_integrations_v2_created_by_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_integrations_v2_created_by_index ON public.nc_integrations_v2 USING btree (created_by);


--
-- Name: nc_integrations_v2_fk_workspace_id_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_integrations_v2_fk_workspace_id_index ON public.nc_integrations_v2 USING btree (fk_workspace_id);


--
-- Name: nc_integrations_v2_type_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_integrations_v2_type_index ON public.nc_integrations_v2 USING btree (type);


--
-- Name: nc_jobs_context; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_jobs_context ON public.nc_jobs USING btree (base_id, fk_workspace_id);


--
-- Name: nc_kanban_view_columns_v2_base_id_fk_workspace_id_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_kanban_view_columns_v2_base_id_fk_workspace_id_index ON public.nc_kanban_view_columns_v2 USING btree (base_id, fk_workspace_id);


--
-- Name: nc_kanban_view_columns_v2_fk_column_id_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_kanban_view_columns_v2_fk_column_id_index ON public.nc_kanban_view_columns_v2 USING btree (fk_column_id);


--
-- Name: nc_kanban_view_columns_v2_fk_view_id_fk_column_id_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_kanban_view_columns_v2_fk_view_id_fk_column_id_index ON public.nc_kanban_view_columns_v2 USING btree (fk_view_id, fk_column_id);


--
-- Name: nc_kanban_view_columns_v2_fk_view_id_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_kanban_view_columns_v2_fk_view_id_index ON public.nc_kanban_view_columns_v2 USING btree (fk_view_id);


--
-- Name: nc_kanban_view_columns_v2_oldpk_idx; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_kanban_view_columns_v2_oldpk_idx ON public.nc_kanban_view_columns_v2 USING btree (id);


--
-- Name: nc_kanban_view_v2_base_id_fk_workspace_id_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_kanban_view_v2_base_id_fk_workspace_id_index ON public.nc_kanban_view_v2 USING btree (base_id, fk_workspace_id);


--
-- Name: nc_kanban_view_v2_fk_grp_col_id_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_kanban_view_v2_fk_grp_col_id_index ON public.nc_kanban_view_v2 USING btree (fk_grp_col_id);


--
-- Name: nc_kanban_view_v2_fk_view_id_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_kanban_view_v2_fk_view_id_index ON public.nc_kanban_view_v2 USING btree (fk_view_id);


--
-- Name: nc_kanban_view_v2_oldpk_idx; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_kanban_view_v2_oldpk_idx ON public.nc_kanban_view_v2 USING btree (fk_view_id);


--
-- Name: nc_map_view_columns_v2_base_id_fk_workspace_id_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_map_view_columns_v2_base_id_fk_workspace_id_index ON public.nc_map_view_columns_v2 USING btree (base_id, fk_workspace_id);


--
-- Name: nc_map_view_columns_v2_fk_column_id_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_map_view_columns_v2_fk_column_id_index ON public.nc_map_view_columns_v2 USING btree (fk_column_id);


--
-- Name: nc_map_view_columns_v2_fk_view_id_fk_column_id_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_map_view_columns_v2_fk_view_id_fk_column_id_index ON public.nc_map_view_columns_v2 USING btree (fk_view_id, fk_column_id);


--
-- Name: nc_map_view_columns_v2_fk_view_id_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_map_view_columns_v2_fk_view_id_index ON public.nc_map_view_columns_v2 USING btree (fk_view_id);


--
-- Name: nc_map_view_columns_v2_oldpk_idx; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_map_view_columns_v2_oldpk_idx ON public.nc_map_view_columns_v2 USING btree (id);


--
-- Name: nc_map_view_v2_base_id_fk_workspace_id_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_map_view_v2_base_id_fk_workspace_id_index ON public.nc_map_view_v2 USING btree (base_id, fk_workspace_id);


--
-- Name: nc_map_view_v2_fk_geo_data_col_id_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_map_view_v2_fk_geo_data_col_id_index ON public.nc_map_view_v2 USING btree (fk_geo_data_col_id);


--
-- Name: nc_map_view_v2_fk_view_id_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_map_view_v2_fk_view_id_index ON public.nc_map_view_v2 USING btree (fk_view_id);


--
-- Name: nc_map_view_v2_oldpk_idx; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_map_view_v2_oldpk_idx ON public.nc_map_view_v2 USING btree (fk_view_id);


--
-- Name: nc_mc_tokens_context; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_mc_tokens_context ON public.nc_mcp_tokens USING btree (base_id, fk_workspace_id);


--
-- Name: nc_mcp_tokens_oldpk_idx; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_mcp_tokens_oldpk_idx ON public.nc_mcp_tokens USING btree (id);


--
-- Name: nc_model_stats_v2_base_id_fk_workspace_id_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_model_stats_v2_base_id_fk_workspace_id_index ON public.nc_model_stats_v2 USING btree (base_id, fk_workspace_id);


--
-- Name: nc_model_stats_v2_fk_workspace_id_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_model_stats_v2_fk_workspace_id_index ON public.nc_model_stats_v2 USING btree (fk_workspace_id);


--
-- Name: nc_model_stats_v2_oldpk_idx; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_model_stats_v2_oldpk_idx ON public.nc_model_stats_v2 USING btree (fk_workspace_id, fk_model_id);


--
-- Name: nc_models_v2_base_id_fk_workspace_id_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_models_v2_base_id_fk_workspace_id_index ON public.nc_models_v2 USING btree (base_id, fk_workspace_id);


--
-- Name: nc_models_v2_oldpk_idx; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_models_v2_oldpk_idx ON public.nc_models_v2 USING btree (id);


--
-- Name: nc_models_v2_source_id_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_models_v2_source_id_index ON public.nc_models_v2 USING btree (source_id);


--
-- Name: nc_models_v2_type_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_models_v2_type_index ON public.nc_models_v2 USING btree (type);


--
-- Name: nc_models_v2_uuid_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_models_v2_uuid_index ON public.nc_models_v2 USING btree (uuid);


--
-- Name: nc_oauth_authorization_codes_code_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_oauth_authorization_codes_code_index ON public.nc_oauth_authorization_codes USING btree (code);


--
-- Name: nc_oauth_authorization_codes_expires_at_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_oauth_authorization_codes_expires_at_index ON public.nc_oauth_authorization_codes USING btree (expires_at);


--
-- Name: nc_oauth_authorization_codes_fk_client_id_fk_user_id_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_oauth_authorization_codes_fk_client_id_fk_user_id_index ON public.nc_oauth_authorization_codes USING btree (fk_client_id, fk_user_id);


--
-- Name: nc_oauth_authorization_codes_fk_client_id_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_oauth_authorization_codes_fk_client_id_index ON public.nc_oauth_authorization_codes USING btree (fk_client_id);


--
-- Name: nc_oauth_authorization_codes_fk_user_id_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_oauth_authorization_codes_fk_user_id_index ON public.nc_oauth_authorization_codes USING btree (fk_user_id);


--
-- Name: nc_oauth_authorization_codes_is_used_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_oauth_authorization_codes_is_used_index ON public.nc_oauth_authorization_codes USING btree (is_used);


--
-- Name: nc_oauth_clients_fk_user_id_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_oauth_clients_fk_user_id_index ON public.nc_oauth_clients USING btree (fk_user_id);


--
-- Name: nc_oauth_tokens_access_token_expires_at_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_oauth_tokens_access_token_expires_at_index ON public.nc_oauth_tokens USING btree (access_token_expires_at);


--
-- Name: nc_oauth_tokens_access_token_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_oauth_tokens_access_token_index ON public.nc_oauth_tokens USING btree (access_token);


--
-- Name: nc_oauth_tokens_fk_client_id_fk_user_id_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_oauth_tokens_fk_client_id_fk_user_id_index ON public.nc_oauth_tokens USING btree (fk_client_id, fk_user_id);


--
-- Name: nc_oauth_tokens_fk_client_id_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_oauth_tokens_fk_client_id_index ON public.nc_oauth_tokens USING btree (fk_client_id);


--
-- Name: nc_oauth_tokens_fk_user_id_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_oauth_tokens_fk_user_id_index ON public.nc_oauth_tokens USING btree (fk_user_id);


--
-- Name: nc_oauth_tokens_is_revoked_access_token_expires_at_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_oauth_tokens_is_revoked_access_token_expires_at_index ON public.nc_oauth_tokens USING btree (is_revoked, access_token_expires_at);


--
-- Name: nc_oauth_tokens_is_revoked_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_oauth_tokens_is_revoked_index ON public.nc_oauth_tokens USING btree (is_revoked);


--
-- Name: nc_oauth_tokens_last_used_at_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_oauth_tokens_last_used_at_index ON public.nc_oauth_tokens USING btree (last_used_at);


--
-- Name: nc_oauth_tokens_refresh_token_expires_at_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_oauth_tokens_refresh_token_expires_at_index ON public.nc_oauth_tokens USING btree (refresh_token_expires_at);


--
-- Name: nc_oauth_tokens_refresh_token_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_oauth_tokens_refresh_token_index ON public.nc_oauth_tokens USING btree (refresh_token);


--
-- Name: nc_org_domain_domain_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_org_domain_domain_index ON public.nc_org_domain USING btree (domain);


--
-- Name: nc_org_domain_fk_org_id_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_org_domain_fk_org_id_index ON public.nc_org_domain USING btree (fk_org_id);


--
-- Name: nc_org_domain_fk_user_id_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_org_domain_fk_user_id_index ON public.nc_org_domain USING btree (fk_user_id);


--
-- Name: nc_org_fk_user_id_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_org_fk_user_id_index ON public.nc_org USING btree (fk_user_id);


--
-- Name: nc_org_slug_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_org_slug_index ON public.nc_org USING btree (slug);


--
-- Name: nc_permission_subjects_context; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_permission_subjects_context ON public.nc_permission_subjects USING btree (fk_workspace_id, base_id);


--
-- Name: nc_permission_subjects_oldpk_idx; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_permission_subjects_oldpk_idx ON public.nc_permission_subjects USING btree (fk_permission_id, subject_type, subject_id);


--
-- Name: nc_permissions_context; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_permissions_context ON public.nc_permissions USING btree (base_id, fk_workspace_id);


--
-- Name: nc_permissions_entity; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_permissions_entity ON public.nc_permissions USING btree (entity, entity_id, permission);


--
-- Name: nc_permissions_oldpk_idx; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_permissions_oldpk_idx ON public.nc_permissions USING btree (id);


--
-- Name: nc_plans_stripe_product_idx; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_plans_stripe_product_idx ON public.nc_plans USING btree (stripe_product_id);


--
-- Name: nc_principal_assignments_principal_idx; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_principal_assignments_principal_idx ON public.nc_principal_assignments USING btree (principal_type, principal_ref_id);


--
-- Name: nc_principal_assignments_principal_resource_idx; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_principal_assignments_principal_resource_idx ON public.nc_principal_assignments USING btree (principal_type, principal_ref_id, resource_type);


--
-- Name: nc_principal_assignments_resource_idx; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_principal_assignments_resource_idx ON public.nc_principal_assignments USING btree (resource_type, resource_id);


--
-- Name: nc_principal_assignments_resource_principal_type_idx; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_principal_assignments_resource_principal_type_idx ON public.nc_principal_assignments USING btree (resource_type, resource_id, principal_type);


--
-- Name: nc_project_users_v2_fk_user_id_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_project_users_v2_fk_user_id_index ON public.nc_base_users_v2 USING btree (fk_user_id);


--
-- Name: nc_record_audit_v2_tenant_idx; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_record_audit_v2_tenant_idx ON public.nc_audit_v2 USING btree (base_id, fk_model_id, row_id, fk_workspace_id);


--
-- Name: nc_row_color_conditions_fk_view_id_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_row_color_conditions_fk_view_id_index ON public.nc_row_color_conditions USING btree (fk_view_id);


--
-- Name: nc_row_color_conditions_fk_workspace_id_base_id_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_row_color_conditions_fk_workspace_id_base_id_index ON public.nc_row_color_conditions USING btree (fk_workspace_id, base_id);


--
-- Name: nc_row_color_conditions_oldpk_idx; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_row_color_conditions_oldpk_idx ON public.nc_row_color_conditions USING btree (id);


--
-- Name: nc_scripts_context; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_scripts_context ON public.nc_scripts USING btree (base_id, fk_workspace_id);


--
-- Name: nc_scripts_oldpk_idx; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_scripts_oldpk_idx ON public.nc_scripts USING btree (id);


--
-- Name: nc_snapshot_context; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_snapshot_context ON public.nc_snapshots USING btree (base_id, fk_workspace_id);


--
-- Name: nc_sort_v2_base_id_fk_workspace_id_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_sort_v2_base_id_fk_workspace_id_index ON public.nc_sort_v2 USING btree (base_id, fk_workspace_id);


--
-- Name: nc_sort_v2_fk_column_id_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_sort_v2_fk_column_id_index ON public.nc_sort_v2 USING btree (fk_column_id);


--
-- Name: nc_sort_v2_fk_view_id_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_sort_v2_fk_view_id_index ON public.nc_sort_v2 USING btree (fk_view_id);


--
-- Name: nc_sort_v2_oldpk_idx; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_sort_v2_oldpk_idx ON public.nc_sort_v2 USING btree (id);


--
-- Name: nc_source_v2_base_id_fk_workspace_id_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_source_v2_base_id_fk_workspace_id_index ON public.nc_sources_v2 USING btree (base_id, fk_workspace_id);


--
-- Name: nc_source_v2_fk_integration_id_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_source_v2_fk_integration_id_index ON public.nc_sources_v2 USING btree (fk_integration_id);


--
-- Name: nc_source_v2_fk_sql_executor_id_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_source_v2_fk_sql_executor_id_index ON public.nc_sources_v2 USING btree (fk_sql_executor_id);


--
-- Name: nc_sources_v2_oldpk_idx; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_sources_v2_oldpk_idx ON public.nc_sources_v2 USING btree (id);


--
-- Name: nc_sso_client_domain_name_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_sso_client_domain_name_index ON public.nc_sso_client USING btree (domain_name);


--
-- Name: nc_sso_client_fk_user_id_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_sso_client_fk_user_id_index ON public.nc_sso_client USING btree (fk_user_id);


--
-- Name: nc_sso_client_fk_workspace_id_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_sso_client_fk_workspace_id_index ON public.nc_sso_client USING btree (fk_org_id);


--
-- Name: nc_store_key_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_store_key_index ON public.nc_store USING btree (key);


--
-- Name: nc_subscriptions_org_idx; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_subscriptions_org_idx ON public.nc_subscriptions USING btree (fk_org_id);


--
-- Name: nc_subscriptions_stripe_subscription_idx; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_subscriptions_stripe_subscription_idx ON public.nc_subscriptions USING btree (stripe_subscription_id);


--
-- Name: nc_subscriptions_ws_idx; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_subscriptions_ws_idx ON public.nc_subscriptions USING btree (fk_workspace_id);


--
-- Name: nc_sync_configs_context; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_sync_configs_context ON public.nc_sync_configs USING btree (base_id, fk_workspace_id);


--
-- Name: nc_sync_configs_oldpk_idx; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_sync_configs_oldpk_idx ON public.nc_sync_configs USING btree (id);


--
-- Name: nc_sync_configs_parent_idx; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_sync_configs_parent_idx ON public.nc_sync_configs USING btree (fk_parent_sync_config_id);


--
-- Name: nc_sync_logs_v2_base_id_fk_workspace_id_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_sync_logs_v2_base_id_fk_workspace_id_index ON public.nc_sync_logs_v2 USING btree (base_id, fk_workspace_id);


--
-- Name: nc_sync_logs_v2_oldpk_idx; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_sync_logs_v2_oldpk_idx ON public.nc_sync_logs_v2 USING btree (id);


--
-- Name: nc_sync_mappings_context; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_sync_mappings_context ON public.nc_sync_mappings USING btree (base_id, fk_workspace_id);


--
-- Name: nc_sync_mappings_oldpk_idx; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_sync_mappings_oldpk_idx ON public.nc_sync_mappings USING btree (id);


--
-- Name: nc_sync_mappings_sync_config_idx; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_sync_mappings_sync_config_idx ON public.nc_sync_mappings USING btree (fk_sync_config_id);


--
-- Name: nc_sync_source_v2_base_id_fk_workspace_id_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_sync_source_v2_base_id_fk_workspace_id_index ON public.nc_sync_source_v2 USING btree (base_id, fk_workspace_id);


--
-- Name: nc_sync_source_v2_oldpk_idx; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_sync_source_v2_oldpk_idx ON public.nc_sync_source_v2 USING btree (id);


--
-- Name: nc_sync_source_v2_source_id_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_sync_source_v2_source_id_index ON public.nc_sync_source_v2 USING btree (source_id);


--
-- Name: nc_teams_created_by_idx; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_teams_created_by_idx ON public.nc_teams USING btree (created_by);


--
-- Name: nc_teams_org_idx; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_teams_org_idx ON public.nc_teams USING btree (fk_org_id);


--
-- Name: nc_teams_workspace_idx; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_teams_workspace_idx ON public.nc_teams USING btree (fk_workspace_id);


--
-- Name: nc_usage_stats_ws_period_idx; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_usage_stats_ws_period_idx ON public.nc_usage_stats USING btree (fk_workspace_id, period_start);


--
-- Name: nc_user_comment_notifications_preference_base_id_fk_workspace_i; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_user_comment_notifications_preference_base_id_fk_workspace_i ON public.nc_user_comment_notifications_preference USING btree (base_id, fk_workspace_id);


--
-- Name: nc_user_refresh_tokens_expires_at_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_user_refresh_tokens_expires_at_index ON public.nc_user_refresh_tokens USING btree (expires_at);


--
-- Name: nc_user_refresh_tokens_fk_user_id_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_user_refresh_tokens_fk_user_id_index ON public.nc_user_refresh_tokens USING btree (fk_user_id);


--
-- Name: nc_user_refresh_tokens_token_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_user_refresh_tokens_token_index ON public.nc_user_refresh_tokens USING btree (token);


--
-- Name: nc_users_v2_email_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_users_v2_email_index ON public.nc_users_v2 USING btree (email);


--
-- Name: nc_views_v2_base_id_fk_workspace_id_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_views_v2_base_id_fk_workspace_id_index ON public.nc_views_v2 USING btree (base_id, fk_workspace_id);


--
-- Name: nc_views_v2_created_by_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_views_v2_created_by_index ON public.nc_views_v2 USING btree (created_by);


--
-- Name: nc_views_v2_fk_custom_url_id_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_views_v2_fk_custom_url_id_index ON public.nc_views_v2 USING btree (fk_custom_url_id);


--
-- Name: nc_views_v2_fk_model_id_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_views_v2_fk_model_id_index ON public.nc_views_v2 USING btree (fk_model_id);


--
-- Name: nc_views_v2_oldpk_idx; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_views_v2_oldpk_idx ON public.nc_views_v2 USING btree (id);


--
-- Name: nc_views_v2_owned_by_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_views_v2_owned_by_index ON public.nc_views_v2 USING btree (owned_by);


--
-- Name: nc_widgets_context; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_widgets_context ON public.nc_widgets_v2 USING btree (base_id, fk_workspace_id);


--
-- Name: nc_widgets_dashboard_idx; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_widgets_dashboard_idx ON public.nc_widgets_v2 USING btree (fk_dashboard_id);


--
-- Name: nc_widgets_v2_oldpk_idx; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_widgets_v2_oldpk_idx ON public.nc_widgets_v2 USING btree (id);


--
-- Name: nc_workflow_executions_context_idx; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_workflow_executions_context_idx ON public.nc_automation_executions USING btree (base_id, fk_workspace_id);


--
-- Name: nc_workflow_executions_workflow_idx; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_workflow_executions_workflow_idx ON public.nc_automation_executions USING btree (fk_workflow_id);


--
-- Name: nc_workflows_context_idx; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX nc_workflows_context_idx ON public.nc_workflows USING btree (base_id, fk_workspace_id);


--
-- Name: notification_created_at_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX notification_created_at_index ON public.notification USING btree (created_at);


--
-- Name: notification_fk_user_id_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX notification_fk_user_id_index ON public.notification USING btree (fk_user_id);


--
-- Name: org_domain_fk_workspace_id_idx; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX org_domain_fk_workspace_id_idx ON public.nc_org_domain USING btree (fk_workspace_id);


--
-- Name: share_uuid_idx; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX share_uuid_idx ON public.nc_dashboards_v2 USING btree (uuid);


--
-- Name: sso_client_fk_workspace_id_idx; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX sso_client_fk_workspace_id_idx ON public.nc_sso_client USING btree (fk_workspace_id);


--
-- Name: sync_configs_integration_model; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX sync_configs_integration_model ON public.nc_sync_configs USING btree (fk_model_id, fk_integration_id);


--
-- Name: user_comments_preference_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX user_comments_preference_index ON public.nc_user_comment_notifications_preference USING btree (user_id, row_id, fk_model_id);


--
-- Name: workspace_fk_org_id_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX workspace_fk_org_id_index ON public.workspace USING btree (fk_org_id);


--
-- Name: workspace_user_invited_by_index; Type: INDEX; Schema: public; Owner: arunachala
--

CREATE INDEX workspace_user_invited_by_index ON public.workspace_user USING btree (invited_by);


--
-- Name: contents contents_author_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: arunachala
--

ALTER TABLE ONLY public.contents
    ADD CONSTRAINT contents_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.users(id);


--
-- Name: schedules schedules_class_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: arunachala
--

ALTER TABLE ONLY public.schedules
    ADD CONSTRAINT schedules_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.yoga_classes(id);


--
-- PostgreSQL database dump complete
--

\unrestrict xFhLpgo4kAJqjxNagiGTt8pgtrIgjhaBEnS1j7Xu4ra9kVEpHCzYXeNuDKSSsDs

