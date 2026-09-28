import numpy as np
import pandas as pd
from typing import Dict, Any, List
from rapidfuzz import fuzz, distance

def extract_pairwise_features(rec1: Dict[str, Any], rec2: Dict[str, Any]) -> Dict[str, float]:
    """
    Computes fine-grained RapidFuzz string similarities and structural match indicators
    between two entity records.
    """
    name1 = str(rec1.get("norm_name", ""))
    name2 = str(rec2.get("norm_name", ""))
    
    addr1 = str(rec1.get("norm_address", ""))
    addr2 = str(rec2.get("norm_address", ""))
    
    country1 = str(rec1.get("norm_country", ""))
    country2 = str(rec2.get("norm_country", ""))
    
    tax1 = str(rec1.get("norm_tax_id", ""))
    tax2 = str(rec2.get("norm_tax_id", ""))
    
    # 1. Name Similarities (RapidFuzz)
    name_jw = distance.JaroWinkler.similarity(name1, name2)
    name_lev = distance.Levenshtein.normalized_similarity(name1, name2)
    name_fuzz_ratio = fuzz.ratio(name1, name2) / 100.0
    name_token_sort = fuzz.token_sort_ratio(name1, name2) / 100.0
    name_token_set = fuzz.token_set_ratio(name1, name2) / 100.0
    name_partial = fuzz.partial_ratio(name1, name2) / 100.0
    
    # 2. Address Similarities (RapidFuzz)
    if addr1 and addr2:
        addr_lev = distance.Levenshtein.normalized_similarity(addr1, addr2)
        addr_token_sort = fuzz.token_sort_ratio(addr1, addr2) / 100.0
        addr_token_set = fuzz.token_set_ratio(addr1, addr2) / 100.0
    else:
        addr_lev = 0.5
        addr_token_sort = 0.5
        addr_token_set = 0.5
        
    # 3. Categorical & Exact Matches
    country_exact = 1.0 if (country1 == country2 and country1 not in ("", "UNKNOWN")) else 0.0
    
    if tax1 and tax2 and len(tax1) >= 4 and len(tax2) >= 4:
        tax_exact = 1.0 if tax1 == tax2 else 0.0
    else:
        tax_exact = 0.0
        
    len_diff = abs(len(name1) - len(name2)) / max(len(name1), len(name2), 1)

    return {
        "name_jaro_winkler": round(name_jw, 4),
        "name_levenshtein": round(name_lev, 4),
        "name_fuzz_ratio": round(name_fuzz_ratio, 4),
        "name_token_sort": round(name_token_sort, 4),
        "name_token_set": round(name_token_set, 4),
        "name_partial_ratio": round(name_partial, 4),
        "address_levenshtein": round(addr_lev, 4),
        "address_token_sort": round(addr_token_sort, 4),
        "address_token_set": round(addr_token_set, 4),
        "country_exact_match": country_exact,
        "tax_id_match": tax_exact,
        "name_length_diff": round(len_diff, 4)
    }

def build_feature_matrix(
    candidate_pairs: List[Dict[str, Any]],
    df_src1: pd.DataFrame,
    df_target: pd.DataFrame
) -> Tuple[np.ndarray, List[Dict[str, Any]]]:
    """
    Transforms candidate pair list into NumPy numerical feature matrix for model scoring.
    """
    src1_lookup = df_src1.set_index("id").to_dict(orient="index")
    target_lookup = df_target.set_index("id").to_dict(orient="index")
    
    features_list = []
    valid_pairs = []
    
    for pair in candidate_pairs:
        s1_id = pair["source1_id"]
        cand_id = pair["candidate_id"]
        
        rec1 = src1_lookup.get(s1_id)
        rec2 = target_lookup.get(cand_id)
        
        if rec1 and rec2:
            feats = extract_pairwise_features(rec1, rec2)
            feats_vector = [
                feats["name_jaro_winkler"],
                feats["name_levenshtein"],
                feats["name_fuzz_ratio"],
                feats["name_token_sort"],
                feats["name_token_set"],
                feats["name_partial_ratio"],
                feats["address_levenshtein"],
                feats["address_token_sort"],
                feats["address_token_set"],
                feats["country_exact_match"],
                feats["tax_id_match"],
                feats["name_length_diff"]
            ]
            features_list.append(feats_vector)
            valid_pairs.append({
                **pair,
                "features": feats
            })
            
    if not features_list:
        return np.empty((0, 12)), valid_pairs
        
    return np.array(features_list, dtype=np.float32), valid_pairs
