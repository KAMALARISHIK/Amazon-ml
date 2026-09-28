import re
import pandas as pd
from typing import Optional

# Standard Country Code Mapping
COUNTRY_MAP = {
    "USA": "US", "UNITED STATES": "US", "UNITED STATES OF AMERICA": "US", "U.S.A.": "US", "U.S.": "US",
    "UK": "GB", "UNITED KINGDOM": "GB", "GREAT BRITAIN": "GB", "ENGLAND": "GB",
    "GERMANY": "DE", "DEUTSCHLAND": "DE", "FEDERAL REPUBLIC OF GERMANY": "DE",
    "JAPAN": "JP", "NIPPON": "JP",
    "SWEDEN": "SE", "SVERIGE": "SE",
    "SWITZERLAND": "CH", "SCHWEIZ": "CH", "SUISSE": "CH",
    "FRANCE": "FR", "CANADA": "CA", "AUSTRALIA": "AU", "INDIA": "IN", "SINGAPORE": "SG"
}

# Legal entity corporate suffixes to strip for normalized core comparison
LEGAL_SUFFIXES = [
    r"\binc\.?\b", r"\bincorporated\b", r"\bcorp\.?\b", r"\bcorporation\b",
    r"\bllc\.?\b", r"\bllp\.?\b", r"\bltd\.?\b", r"\blimited\b",
    r"\bgmbh\b", r"\bag\b", r"\baktiengesellschaft\b", r"\bse\b",
    r"\bplc\b", r"\bp\.l\.c\.\b", r"\bs\.a\.\b", r"\bsa\b", r"\bsarl\b",
    r"\bkk\b", r"\bkabushiki kaisha\b", r"\bco\.?,?\s*ltd\.?\b", r"\bco\.?\b", r"\bcompany\b"
]

# Street address abbreviation expansions
ADDRESS_ABBREVIATIONS = {
    r"\bstr\.?\b": "street",
    r"\bstr\b": "street",
    r"\bstrasse\b": "street",
    r"\bave\.?\b": "avenue",
    r"\brd\.?\b": "road",
    r"\bpkwy\.?\b": "parkway",
    r"\bblvd\.?\b": "boulevard",
    r"\bln\.?\b": "lane",
    r"\bdr\.?\b": "drive",
    r"\bct\.?\b": "court",
    r"\bpl\.?\b": "place",
    r"\bste\.?\b": "suite",
    r"\bfl\.?\b": "floor",
    r"\bhq\b": "headquarters"
}

def clean_text(text: Optional[str]) -> str:
    if text is None or pd.isna(text):
        return ""
    text = str(text).strip().lower()
    text = re.sub(r"[\s\t\r\n]+", " ", text)
    return text

def normalize_country(country: Optional[str]) -> str:
    if country is None or pd.isna(country):
        return "UNKNOWN"
    country_clean = str(country).strip().upper()
    return COUNTRY_MAP.get(country_clean, country_clean[:2] if len(country_clean) >= 2 else "UNKNOWN")

def normalize_name(name: Optional[str]) -> str:
    text = clean_text(name)
    for suffix in LEGAL_SUFFIXES:
        text = re.sub(suffix, "", text, flags=re.IGNORECASE)
    text = re.sub(r"[^\w\s]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text

def normalize_address(address: Optional[str]) -> str:
    text = clean_text(address)
    for pattern, replacement in ADDRESS_ABBREVIATIONS.items():
        text = re.sub(pattern, replacement, text, flags=re.IGNORECASE)
    text = re.sub(r"[^\w\s]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text

def normalize_tax_id(tax_id: Optional[str]) -> str:
    if tax_id is None or pd.isna(tax_id):
        return ""
    # Strip non-alphanumeric (hyphens, spaces)
    return re.sub(r"[^\w]", "", str(tax_id).upper()).strip()

def normalize_dataframe(df: pd.DataFrame, source_name: str = "source1") -> pd.DataFrame:
    df_clean = df.copy()
    
    # Ensure standard column existence
    for col in ["name", "address", "city", "state", "postal_code", "country", "tax_id"]:
        if col not in df_clean.columns:
            df_clean[col] = ""
            
    df_clean["norm_country"] = df_clean["country"].apply(normalize_country)
    df_clean["norm_name"] = df_clean["name"].apply(normalize_name)
    df_clean["norm_address"] = df_clean["address"].apply(normalize_address)
    df_clean["norm_tax_id"] = df_clean["tax_id"].apply(normalize_tax_id)
    
    # Combined composite token string for TF-IDF / Blocking
    df_clean["blocking_text"] = (
        df_clean["norm_name"] + " " +
        df_clean["norm_address"] + " " +
        df_clean["norm_country"]
    ).str.strip()
    
    return df_clean
