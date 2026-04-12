export interface WhoisResponse {
  status: number;
  data: WhoisData;
  req_id: string;
}

export interface WhoisData {
  is_available: number;
  domain: string;
  domain_suffix: string;
  query_time: string;
  info: WhoisInfo;
  fields: WhoisFields;
  raw: string;
}

export interface WhoisInfo {
  domain: string;
  registrant_name: string;
  registrant_email: string;
  registrar_name: string;
  creation_time: string;
  expiration_time: string;
  creation_days: number;
  valid_days: number;
  is_expire: number;
  domain_status: string[];
  name_server: string[];
  whois_server: string;
}

export interface WhoisFields {
  domain_name: string;
  registry_domain_id: string;
  registrar_whois_server: string;
  registrar_url: string;
  updated_date: string;
  creation_date: string;
  registry_expiry_date: string;
  registrar: string;
  registrar_iana_id: string;
  domain_status: string[];
  registrant_organization: string;
  'registrant_state/province': string;
  registrant_country: string;
  registrant_email: string;
  tech_email: string;
  name_server: string[];
  dnssec: string;
  registrar_abuse_contact_email: string;
  registrar_abuse_contact_phone: string;
  url_of_the_icann_whois_inaccuracy_complaint_form: string;
}
