import os
import pandas as pd
from datetime import datetime
from sqlalchemy.orm import Session

from src.config import settings
from src.models import Dataset, User, PipelineRun, Match, RunMetrics
from src.auth import get_password_hash

SRC1_ROWS = [
    {"id": "src1_001", "name": "Apple Computer Inc.", "address": "1 Infinite Loop", "city": "Cupertino", "state": "CA", "postal_code": "95014", "country": "US", "tax_id": "US-942404110", "website": "apple.com", "phone": "+1 408-996-1010"},
    {"id": "src1_002", "name": "Amazon.com Services LLC", "address": "410 Terry Ave N", "city": "Seattle", "state": "WA", "postal_code": "98109", "country": "US", "tax_id": "US-911646860", "website": "amazon.com", "phone": "+1 206-266-1000"},
    {"id": "src1_003", "name": "Microsoft Corporation", "address": "One Microsoft Way", "city": "Redmond", "state": "WA", "postal_code": "98052", "country": "US", "tax_id": "US-911144442", "website": "microsoft.com", "phone": "+1 425-882-8080"},
    {"id": "src1_004", "name": "Alphabet Inc.", "address": "1600 Amphitheatre Pkwy", "city": "Mountain View", "state": "CA", "postal_code": "94043", "country": "US", "tax_id": "US-611767919", "website": "abc.xyz", "phone": "+1 650-253-0000"},
    {"id": "src1_005", "name": "SAP SE Global", "address": "Dietmar-Hopp-Allee 16", "city": "Walldorf", "state": "BW", "postal_code": "69190", "country": "DE", "tax_id": "DE-143456889", "website": "sap.com", "phone": "+49 6227 747474"},
    {"id": "src1_006", "name": "Siemens Aktiengesellschaft", "address": "Werner-von-Siemens-Strasse 1", "city": "Munich", "state": "BY", "postal_code": "80333", "country": "DE", "tax_id": "DE-811125245", "website": "siemens.com", "phone": "+49 89 63600"},
    {"id": "src1_007", "name": "Toyota Motor Corp HQ", "address": "1 Toyota-cho", "city": "Toyota", "state": "Aichi", "postal_code": "471-8571", "country": "JP", "tax_id": "JP-1200001086202", "website": "toyota-global.com", "phone": "+81 565-28-2121"},
    {"id": "src1_008", "name": "Sony Group Corporation", "address": "1-7-1 Konan, Minato-ku", "city": "Tokyo", "state": "Tokyo", "postal_code": "108-0075", "country": "JP", "tax_id": "JP-5010401015694", "website": "sony.com", "phone": "+81 3-6748-2111"},
    {"id": "src1_009", "name": "Barclays Bank PLC", "address": "1 Churchill Place", "city": "London", "state": "Greater London", "postal_code": "E14 5HP", "country": "GB", "tax_id": "GB-243852264", "website": "barclays.co.uk", "phone": "+44 20 7116 1000"},
    {"id": "src1_010", "name": "BP p.l.c. Global Energy", "address": "1 St James's Square", "city": "London", "state": "Greater London", "postal_code": "SW1Y 4PD", "country": "GB", "tax_id": "GB-102498711", "website": "bp.com", "phone": "+44 20 7496 4000"},
    {"id": "src1_011", "name": "AstraZeneca AB", "address": "Karlebyhus, Astraallen", "city": "Sodertalje", "state": "Stockholm", "postal_code": "151 85", "country": "SE", "tax_id": "SE-556011748201", "website": "astrazeneca.com", "phone": "+46 8 553 260 00"},
    {"id": "src1_012", "name": "Nestle S.A. Central", "address": "Avenue Nestle 55", "city": "Vevey", "state": "Vaud", "postal_code": "1800", "country": "CH", "tax_id": "CH-CHE105909036", "website": "nestle.com", "phone": "+41 21 924 1111"},
]

SRC2_ROWS = [
    {"id": "src2_101", "name": "Apple Inc", "address": "1 Infinite Lp, Ste 100", "city": "Cupertino", "state": "California", "postal_code": "95014", "country": "US", "tax_id": "94-2404110", "website": "https://www.apple.com", "phone": "(408) 996-1010"},
    {"id": "src2_102", "name": "Amazon Web Services Inc", "address": "410 Terry Ave North", "city": "Seattle", "state": "Washington", "postal_code": "98109-5210", "country": "US", "tax_id": "91-1646860", "website": "https://aws.amazon.com", "phone": "206-266-1000"},
    {"id": "src2_103", "name": "MSFT Corporation", "address": "1 Microsoft Way", "city": "Redmond", "state": "WA", "postal_code": "98052", "country": "USA", "tax_id": "91-1144442", "website": "microsoft.com", "phone": "4258828080"},
    {"id": "src2_104", "name": "Google LLC / Alphabet", "address": "1600 Amphitheatre Parkway", "city": "Mtn View", "state": "CA", "postal_code": "94043", "country": "US", "tax_id": "61-1767919", "website": "google.com"},
    {"id": "src2_105", "name": "SAP Deutschland SE & Co. KG", "address": "Hasso-Plattner-Ring 7", "city": "Walldorf", "state": "Baden-Wurttemberg", "postal_code": "69190", "country": "DE", "tax_id": "DE143456889", "website": "sap.com/germany"},
    {"id": "src2_106", "name": "Siemens AG Headquarters", "address": "Werner-von-Siemens-Str. 1", "city": "Munchen", "state": "Bayern", "postal_code": "80333", "country": "DE", "tax_id": "DE811125245", "phone": "+49-89-63600"},
    {"id": "src2_107", "name": "Toyota Jidosha KK", "address": "1 Toyota-cho", "city": "Toyota City", "state": "Aichi-ken", "postal_code": "471-8571", "country": "JP", "tax_id": "1200001086202"},
    {"id": "src2_108", "name": "Sony Electronics Holdings", "address": "Minato-ku, Konan 1-7-1", "city": "Tokyo", "state": "Tokyo-to", "postal_code": "108-0075", "country": "JP", "phone": "+81367482111"},
    {"id": "src2_109", "name": "Barclays Bank United Kingdom", "address": "1 Churchill Pl, Canary Wharf", "city": "London", "state": "London", "postal_code": "E14 5HP", "country": "GB", "tax_id": "243852264"},
    {"id": "src2_110", "name": "British Petroleum PLC", "address": "1 St James Square", "city": "London", "state": "London", "postal_code": "SW1Y 4PD", "country": "UK"},
    {"id": "src2_111", "name": "AstraZeneca Biopharma AB", "address": "Astraallén, Forskning", "city": "Södertälje", "state": "Stockholm", "postal_code": "15185", "country": "SE"},
]

SRC3_ROWS = [
    {"id": "src3_201", "name": "APPLE INC.", "address": "ONE INFINITE LOOP", "city": "CUPERTINO", "state": "CA", "postal_code": "95014", "country": "USA", "tax_id": "942404110"},
    {"id": "src3_202", "name": "AMAZON COM INC", "address": "410 TERRY AVE N", "city": "SEATTLE", "state": "WA", "postal_code": "98109", "country": "USA", "tax_id": "911646860"},
    {"id": "src3_203", "name": "MICROSOFT CORP", "address": "ONE MICROSOFT WAY", "city": "REDMOND", "state": "WA", "postal_code": "98052-6399", "country": "USA", "tax_id": "911144442"},
    {"id": "src3_204", "name": "GOOGLE INC / ALPHABET", "address": "1600 AMPHITHEATRE PKWY", "city": "MOUNTAIN VIEW", "state": "CA", "postal_code": "94043", "country": "USA"},
    {"id": "src3_205", "name": "SAP SE", "address": "DIETMAR HOPP ALLEE 16", "city": "WALLDORF", "state": "BW", "postal_code": "69190", "country": "GERMANY"},
    {"id": "src3_206", "name": "SIEMENS AG", "address": "WERNER VON SIEMENS STRASSE 1", "city": "MUNCHEN", "state": "BAYERN", "postal_code": "80333", "country": "GERMANY"},
    {"id": "src3_207", "name": "TOYOTA MOTOR CORP", "address": "1 TOYOTA CHO", "city": "TOYOTA", "state": "AICHI", "postal_code": "4718571", "country": "JAPAN"},
    {"id": "src3_208", "name": "SONY CORP", "address": "1-7-1 KONAN MINATO-KU", "city": "TOKYO", "state": "TOKYO", "postal_code": "1080075", "country": "JAPAN"},
    {"id": "src3_209", "name": "BARCLAYS BANK UK PLC", "address": "1 CHURCHILL PLACE", "city": "LONDON", "postal_code": "E145HP", "country": "UNITED KINGDOM"},
    {"id": "src3_210", "name": "BP PLC", "address": "1 ST JAMES'S SQ", "city": "LONDON", "postal_code": "SW1Y4PD", "country": "UNITED KINGDOM"},
]

GT_ROWS = [
    {"source1_id": "src1_001", "source2_id": "src2_101", "source3_id": "src3_201", "cluster_id": "cl_apple_corp"},
    {"source1_id": "src1_002", "source2_id": "src2_102", "source3_id": "src3_202", "cluster_id": "cl_amazon_svc"},
    {"source1_id": "src1_003", "source2_id": "src2_103", "source3_id": "src3_203", "cluster_id": "cl_microsoft_hq"},
    {"source1_id": "src1_004", "source2_id": "src2_104", "source3_id": "src3_204", "cluster_id": "cl_alphabet_goog"},
    {"source1_id": "src1_005", "source2_id": "src2_105", "source3_id": "src3_205", "cluster_id": "cl_sap_walldorf"},
    {"source1_id": "src1_006", "source2_id": "src2_106", "source3_id": "src3_206", "cluster_id": "cl_siemens_ag"},
    {"source1_id": "src1_007", "source2_id": "src2_107", "source3_id": "src3_207", "cluster_id": "cl_toyota_motor"},
    {"source1_id": "src1_008", "source2_id": "src2_108", "source3_id": "src3_208", "cluster_id": "cl_sony_grp"},
    {"source1_id": "src1_009", "source2_id": "src2_109", "source3_id": "src3_209", "cluster_id": "cl_barclays_plc"},
    {"source1_id": "src1_010", "source2_id": "src2_110", "source3_id": "src3_210", "cluster_id": "cl_bp_energy"},
    {"source1_id": "src1_011", "source2_id": "src2_111", "source3_id": "", "cluster_id": "cl_astrazeneca_ab"},
    {"source1_id": "src1_012", "source2_id": "", "source3_id": "", "cluster_id": "cl_nestle_singleton"},
]

def init_seed_dataset(db: Session) -> Dataset:
    p1 = os.path.join(settings.DATA_DIR, "source1.tsv")
    p2 = os.path.join(settings.DATA_DIR, "source2.tsv")
    p3 = os.path.join(settings.DATA_DIR, "source3.tsv")
    pgt = os.path.join(settings.DATA_DIR, "ground_truth.tsv")

    pd.DataFrame(SRC1_ROWS).to_csv(p1, sep="\t", index=False)
    pd.DataFrame(SRC2_ROWS).to_csv(p2, sep="\t", index=False)
    pd.DataFrame(SRC3_ROWS).to_csv(p3, sep="\t", index=False)
    pd.DataFrame(GT_ROWS).to_csv(pgt, sep="\t", index=False)

    # Check default user
    user = db.query(User).filter(User.email == "ml-engineer@enterprise.ai").first()
    if not user:
        user = User(
            email="ml-engineer@enterprise.ai",
            hashed_password=get_password_hash("password"),
            name="Dr. Elena Vance",
            role="ML Engineer"
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    dataset = db.query(Dataset).filter(Dataset.name == "Global Enterprise Benchmark").first()
    if not dataset:
        dataset = Dataset(
            name="Global Enterprise Benchmark",
            user_id=user.id,
            source1_path=p1,
            source2_path=p2,
            source3_path=p3,
            ground_truth_path=pgt,
            row_count_src1=len(SRC1_ROWS),
            row_count_src2=len(SRC2_ROWS),
            row_count_src3=len(SRC3_ROWS),
            row_count_gt=len(GT_ROWS),
            columns_src1=list(SRC1_ROWS[0].keys()),
            columns_src2=list(SRC2_ROWS[0].keys()),
            columns_src3=list(SRC3_ROWS[0].keys())
        )
        db.add(dataset)
        db.commit()
        db.refresh(dataset)

    return dataset
